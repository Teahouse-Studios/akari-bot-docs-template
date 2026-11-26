import { createHash } from "node:crypto";
import type { Dirent } from "node:fs";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";
import type { SiteConfig } from "vitepress";

import type { AkariImagesConfig } from "./types";

/**
 * Build-time WebP conversion, off unless the config asks for it.
 *
 * This runs as the site's `buildEnd` hook, once every page is on disk: it
 * walks the output folder, finds the images the pages, chunks and stylesheets
 * point at, writes a WebP version next to each one, and rewrites those
 * references. Working on the output rather than on the sources has three
 * advantages: an image in `public` and an image imported by a page go through
 * the same path (the bundler may have renamed the latter), an image that no
 * output file mentions is not converted at all — "the images in use" is
 * exactly what the built site asks for — and the URLs are rewritten wherever
 * they ended up, including inside page chunks.
 *
 * Only raster images are converted: a WebP of an SVG would lose its vector
 * nature, and a WebP of an animated GIF would lose its frames.
 *
 * The dev server is untouched: `buildEnd` only runs for a build, so in dev the
 * pages keep pointing at the files in the source tree.
 */
export interface AkariMediaWebpOptions {
  /**
   * The `images` section of the docs config: `images.webp: true` there turns
   * the conversion on. Without it the hook does nothing at all, which is what
   * a site that serves the images as they are gets.
   */
  images?: AkariImagesConfig;
  /** Lossy quality, 1–100. Default 82. */
  quality?: number;
  /** Encode losslessly; `quality` then has no say. Default false. */
  lossless?: boolean;
  /**
   * Encoder effort, 0–6. Higher is slower and smaller; WebP's own default is
   * 4, and one step above costs little. Default 5.
   */
  effort?: number;
  /**
   * The extensions worth converting, lowercase and dotted. PNG and the
   * JPEG family are the heavy ones; WebP and AVIF are left alone because
   * they are already compact. Default `[".png", ".jpg", ".jpeg", ".bmp",
   * ".tif", ".tiff"]`.
   */
  formats?: string[];
  /** Images below this size are left as they are, in bytes. Default 4096. */
  minBytes?: number;
  /**
   * The fraction of the original that the conversion must save (0–1) for it
   * to be used. Default 0, so any saving counts.
   */
  minSaving?: number;
  /**
   * Whether to keep the original beside its `.webp`. Default false: the page
   * is pointed at the WebP, so the original would only bloat the output. Keep
   * it if anything outside the built site asks for the original by name — a
   * full URL in a social card, say, which this pass cannot see is local.
   */
  keepOriginal?: boolean;
  /**
   * Where encoded WebP files are remembered between builds, keyed by the
   * image's own bytes and the encoder settings. Without it every build
   * re-encodes everything; `false` disables the cache.
   */
  cacheDir?: string | false;
  /** How many images are encoded at once. Default 4. */
  concurrency?: number;
  /** `false` silences the summary line. Default true. */
  log?: boolean;
  /** URL prefix the site is served from. Defaults to the site's `base`. */
  base?: string;
}

/** The shape of the summary a build writes into its log. */
export interface ConvertSummary {
  /** Image files the built pages point at. */
  found: number;
  /** Images that became WebP. */
  converted: number;
  /** Images kept as they were: too small, or no smaller as WebP. */
  kept: number;
  /** Images the encoder could not read. */
  failed: number;
  /** Bytes those images took before, and with the conversions applied. */
  before: number;
  after: number;
  /** Output files whose references were rewritten. */
  rewritten: number;
  /** Milliseconds spent on the whole pass. */
  elapsed: number;
}

/** One URL in an output file, and the bytes it occupies. */
export interface ImageUrl {
  start: number;
  end: number;
  url: string;
}

/** The three ways an output file can mention an image. */
export type OutputKind = "html" | "css" | "text";

interface Logger {
  info(message: string): void;
  warn(message: string): void;
}

/** What the core pass needs; the plugin fills it from the resolved config. */
export interface ConvertImagesOptions {
  /** The Vite output folder: the built site. */
  outDir: string;
  /** URL prefix the site is served from. Default `/`. */
  base?: string;
  quality?: number;
  lossless?: boolean;
  effort?: number;
  formats?: string[];
  minBytes?: number;
  minSaving?: number;
  keepOriginal?: boolean;
  cacheDir?: string;
  concurrency?: number;
  logger?: Logger;
}

interface WebpSettings {
  quality: number;
  lossless: boolean;
  effort: number;
}

const DEFAULT_QUALITY = 82;
const DEFAULT_EFFORT = 5;
const DEFAULT_MIN_BYTES = 4096;
const DEFAULT_CONCURRENCY = 4;
const DEFAULT_FORMATS = [".png", ".jpg", ".jpeg", ".bmp", ".tif", ".tiff"];
/** Part of the cache key: change the encoder, change the entries. */
const CACHE_VERSION = 1;

/** Files that can point at an image, and how to read them. */
const TEXT_FILE = /\.(?:html?|css|js|mjs|cjs|json|xml|txt|webmanifest)$/i;

/**
 * `src`, `srcset`, `poster` and `href` in markup, `url()` in a style, and
 * `content` for an `og:image`. Matching a value by its position in the tag
 * rather than by its extension keeps prose out: an article that mentions
 * `/hero/shot.png` is writing about the picture, not asking for it.
 *
 * The lookbehind keeps `data-akari-image-src` out. That attribute records the
 * address the author wrote, which the theme reads to look up an image's color
 * and dimensions; it names the picture, so it is left as the author wrote it
 * (see `heroColorCache.ts`, where a picture's encodings share one key).
 */
const HTML_ATTRIBUTE =
  /(?<![\w-])(srcset|src|poster|href|content)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
const CSS_URL = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)/gi;
/** Strings in scripts, manifests and JSON, quoted or templated. */
const QUOTED =
  /"([^"\\\n]{1,2048})"|'([^'\\\n]{1,2048})'|`([^`\\\n]{1,2048})`/g;
/** A local path may have a query or a fragment; neither is part of the file. */
const SUFFIX = /^([^?#]*)([?#].*)?$/;

/**
 * The part of the resolved site config the hook reads, and all it needs: what
 * VitePress hands `buildEnd` is a `SiteConfig`, which fits.
 */
export type BuiltSite = Pick<SiteConfig, "outDir" | "cacheDir"> & {
  /** Only `base` is read: the prefix the pages are served from. */
  site: { base: string };
  /** Where the summary line goes; anything with these two methods will do. */
  logger: Logger;
};

/**
 * The hook: converts the images the built site uses, and points the site at
 * them. It goes into the config as `buildEnd`, which VitePress calls once the
 * pages are written — the dev server never reaches it.
 *
 * ```ts
 * buildEnd: akariMediaWebp({ images: content.config?.images }),
 * ```
 */
export function akariMediaWebp(
  options: AkariMediaWebpOptions = {},
): (site: BuiltSite) => Promise<void> {
  const enabled = options.images?.webp ?? false;
  const log = options.log ?? true;

  return async (site) => {
    const { logger } = site;
    if (!enabled) return;

    const cacheDir =
      options.cacheDir === false
        ? undefined
        : options.cacheDir ?? path.join(site.cacheDir, "akari-webp");

    try {
      const summary = await convertImages({
        outDir: site.outDir,
        base: options.base ?? site.site.base,
        quality: options.quality,
        lossless: options.lossless,
        effort: options.effort,
        formats: options.formats,
        minBytes: options.minBytes,
        minSaving: options.minSaving,
        keepOriginal: options.keepOriginal,
        cacheDir,
        concurrency: options.concurrency,
        logger,
      });
      if (log) logger.info(`[akari] image webp: ${describe(summary)}`);
    } catch (error) {
      // A site that ships PNGs is worse than a site that ships WebP, but a
      // site that fails to build is worse than both.
      logger.warn(`[akari] image webp failed: ${String(error)}`);
    }
  };
}

/** `1 of 2 images converted · 169.4 KB → 40.5 KB (-76%) · 2 files rewritten · 143 ms`. */
function describe(summary: ConvertSummary): string {
  if (!summary.found) {
    return `no images to convert · ${summary.elapsed} ms`;
  }
  const percent = summary.before
    ? Math.round((1 - summary.after / summary.before) * 100)
    : 0;
  const parts = [
    `${summary.converted} of ${summary.found} image${
      summary.found === 1 ? "" : "s"
    } converted`,
    `${formatBytes(summary.before)} → ${formatBytes(summary.after)} (-${percent}%)`,
    `${summary.rewritten} file${summary.rewritten === 1 ? "" : "s"} rewritten`,
  ];
  if (summary.kept) parts.push(`${summary.kept} kept`);
  if (summary.failed) parts.push(`${summary.failed} failed`);
  parts.push(`${summary.elapsed} ms`);
  return parts.join(" · ");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * The whole pass: find the images the output points at, convert them, rewrite
 * the references, then drop the originals. Split out from the plugin so a
 * test can run it against a folder of its own.
 */
export async function convertImages(
  options: ConvertImagesOptions,
): Promise<ConvertSummary> {
  const outDir = path.resolve(options.outDir);
  const base = options.base && options.base !== "" ? options.base : "/";
  const formats = new Set(
    (options.formats ?? DEFAULT_FORMATS).map((format) => format.toLowerCase()),
  );
  const minBytes = options.minBytes ?? DEFAULT_MIN_BYTES;
  const minSaving = Math.min(1, Math.max(0, options.minSaving ?? 0));
  const keepOriginal = options.keepOriginal ?? false;
  const concurrency = Math.max(1, options.concurrency ?? DEFAULT_CONCURRENCY);
  const settings: WebpSettings = {
    quality: options.quality ?? DEFAULT_QUALITY,
    lossless: options.lossless ?? false,
    effort: options.effort ?? DEFAULT_EFFORT,
  };
  const logger: Logger = options.logger ?? console;
  const started = Date.now();

  const summary: ConvertSummary = {
    found: 0,
    converted: 0,
    kept: 0,
    failed: 0,
    before: 0,
    after: 0,
    rewritten: 0,
    elapsed: 0,
  };

  // Every file the build wrote, split by whether it can mention an image.
  const files = await listFiles(outDir);
  const textFiles = files.filter((file) => TEXT_FILE.test(file));

  // First pass: what the output points at, and which files do the pointing.
  const referencedBy = new Map<string, string[]>();
  const candidates = new Set<string>();

  for (const file of textFiles) {
    let text: string;
    try {
      text = await readFile(file, "utf8");
    } catch {
      continue;
    }
    for (const { url } of findImageUrls(text, outputKind(file))) {
      if (!formats.has(extensionOf(url))) continue;
      const image = resolveImageUrl(url, file, outDir, base);
      if (!image) continue;
      candidates.add(image);
      const referrers = referencedBy.get(image) ?? [];
      if (!referrers.includes(file)) referrers.push(file);
      referencedBy.set(image, referrers);
    }
  }

  // Second pass: encode. An image that would not shrink stays as it is.
  const converted = new Set<string>();

  await mapLimit([...candidates].sort(), concurrency, async (file) => {
    let info;
    try {
      info = await stat(file);
    } catch {
      return;
    }
    if (!info.isFile()) return;

    summary.found += 1;
    summary.before += info.size;

    if (info.size < minBytes) {
      summary.kept += 1;
      summary.after += info.size;
      return;
    }

    let original: Buffer;
    try {
      original = await readFile(file);
    } catch {
      summary.failed += 1;
      summary.after += info.size;
      return;
    }

    let encoded: Buffer;
    try {
      encoded = await encode(original, settings, options.cacheDir);
    } catch (error) {
      summary.failed += 1;
      summary.after += info.size;
      logger.warn(
        `[akari] image webp: could not convert ${path.relative(outDir, file)}: ${String(error)}`,
      );
      return;
    }

    const saving = 1 - encoded.length / info.size;
    if (encoded.length >= info.size || saving < minSaving) {
      summary.kept += 1;
      summary.after += info.size;
      return;
    }

    try {
      await writeFile(webpName(file), encoded);
    } catch (error) {
      summary.failed += 1;
      summary.after += info.size;
      logger.warn(
        `[akari] image webp: could not write ${path.relative(outDir, webpName(file))}: ${String(error)}`,
      );
      return;
    }

    converted.add(file);
    summary.converted += 1;
    summary.after += encoded.length;
  });

  // Third pass: point the site at the WebP files. Only the URLs whose image
  // was actually converted are touched, and only where a reference sits —
  // an article's prose is left alone.
  const rewrite = new Set<string>();
  for (const image of converted) {
    for (const file of referencedBy.get(image) ?? []) rewrite.add(file);
  }

  for (const file of [...rewrite].sort()) {
    let text: string;
    try {
      text = await readFile(file, "utf8");
    } catch {
      continue;
    }

    const edits: ImageUrl[] = [];
    for (const edit of findImageUrls(text, outputKind(file))) {
      const image = resolveImageUrl(edit.url, file, outDir, base);
      if (image && converted.has(image)) {
        edits.push({ ...edit, url: webpUrl(edit.url) });
      }
    }
    if (!edits.length) continue;

    const next = applyEdits(text, edits);
    if (next === text) continue;

    try {
      await writeFile(file, next);
      summary.rewritten += 1;
    } catch (error) {
      logger.warn(
        `[akari] image webp: could not rewrite ${path.relative(outDir, file)}: ${String(error)}`,
      );
    }
  }

  // Last: the originals have no reader left. A file that stayed as it was
  // (too small, or not smaller as WebP) is still referenced, so it stays.
  if (!keepOriginal) {
    for (const file of converted) {
      try {
        await unlink(file);
      } catch {
        // Already gone, or read-only: the site still works, just larger.
      }
    }
  }

  summary.elapsed = Date.now() - started;
  return summary;
}

/** Every file under `folder`, in a stable order. */
async function listFiles(folder: string): Promise<string[]> {
  let entries: Dirent[];
  try {
    entries = await readdir(folder, { recursive: true, withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(parentOf(entry) ?? folder, entry.name))
    .sort();
}

/** `Dirent.parentPath` since Node 20.12; older builds still say `.path`. */
function parentOf(entry: Dirent): string | undefined {
  const parent = (entry as Dirent & { parentPath?: string; path?: string })
    .parentPath;
  return parent ?? (entry as Dirent & { path?: string }).path;
}

/**
 * How a file mentions an image: markup by attribute, stylesheets by `url()`,
 * everything else by quoted string.
 */
export function outputKind(file: string): OutputKind {
  if (/\.html?$/i.test(file)) return "html";
  if (/\.css$/i.test(file)) return "css";
  return "text";
}

/**
 * The image URLs a file contains. Markup is read attribute by attribute, so
 * the same text in the article body is not mistaken for a reference; `srcset`
 * yields one URL per candidate, without its `1x` descriptor.
 */
export function findImageUrls(text: string, kind: OutputKind): ImageUrl[] {
  const urls: ImageUrl[] = [];

  const add = (at: number, raw: string): void => {
    const lead = raw.length - raw.trimStart().length;
    const url = raw.trim();
    if (!url) return;
    urls.push({ start: at + lead, end: at + lead + url.length, url });
  };

  if (kind === "html") {
    for (const match of text.matchAll(HTML_ATTRIBUTE)) {
      const raw = match[2] ?? match[3] ?? "";
      const at = (match.index ?? 0) + match[0].indexOf(raw);
      if (match[1]!.toLowerCase() === "srcset") {
        for (const part of srcsetParts(raw)) add(at + part.start, part.url);
      } else {
        add(at, raw);
      }
    }
    for (const match of text.matchAll(CSS_URL)) {
      const raw = match[1] ?? match[2] ?? match[3] ?? "";
      add((match.index ?? 0) + match[0].indexOf(raw), raw);
    }
    return urls;
  }

  if (kind === "css") {
    for (const match of text.matchAll(CSS_URL)) {
      const raw = match[1] ?? match[2] ?? match[3] ?? "";
      add((match.index ?? 0) + match[0].indexOf(raw), raw);
    }
    return urls;
  }

  for (const match of text.matchAll(QUOTED)) {
    const raw = match[1] ?? match[2] ?? match[3] ?? "";
    if (!raw) continue;
    add((match.index ?? 0) + 1, raw);
  }
  return urls;
}

/** The URLs of a `srcset`, with their offsets inside the attribute value. */
function srcsetParts(value: string): Array<{ start: number; url: string }> {
  const parts: Array<{ start: number; url: string }> = [];
  let offset = 0;
  for (const piece of value.split(",")) {
    const lead = piece.length - piece.trimStart().length;
    const url = piece.trim().split(/\s+/)[0] ?? "";
    if (url) parts.push({ start: offset + lead, url });
    offset += piece.length + 1;
  }
  return parts;
}

/** Applies non-overlapping replacements from the end, so offsets stay valid. */
function applyEdits(text: string, edits: ImageUrl[]): string {
  let next = text;
  let last = text.length;
  for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
    if (edit.end > last) continue;
    next = next.slice(0, edit.start) + edit.url + next.slice(edit.end);
    last = edit.start;
  }
  return next;
}

/**
 * The file a URL names: under the output folder when it starts with `/` (the
 * site's `base` removed), beside the file that mentions it otherwise. Returns
 * null for addresses that are not part of the build — remote images, data
 * URIs, and anything that would climb out of the output folder.
 */
export function resolveImageUrl(
  url: string,
  fromFile: string,
  outDir: string,
  base = "/",
): string | null {
  const bare = SUFFIX.exec(url)?.[1] ?? url;
  if (!bare || bare.startsWith("#")) return null;
  // `https://`, `data:`, `//cdn.example.com`, `blob:` and the like.
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(bare)) return null;

  const decoded = decode(bare);
  const root = path.resolve(outDir);
  const prefix = base && base !== "/" ? base.replace(/\/+$/, "") : "";

  const file = decoded.startsWith("/")
    ? path.resolve(root, stripPrefix(decoded, prefix).replace(/^\/+/, ""))
    : path.resolve(path.dirname(fromFile), decoded);

  return inside(file, root) ? file : null;
}

function stripPrefix(value: string, prefix: string): string {
  if (!prefix) return value;
  if (value === prefix) return "/";
  return value.startsWith(`${prefix}/`) ? value.slice(prefix.length) : value;
}

function inside(file: string, root: string): boolean {
  const relative = path.relative(root, file);
  return !!relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** The lowercase extension of a URL, query and fragment removed. */
function extensionOf(url: string): string {
  const bare = SUFFIX.exec(url)?.[1] ?? url;
  const dot = bare.lastIndexOf(".");
  const slash = bare.lastIndexOf("/");
  return dot > slash ? bare.slice(dot).toLowerCase() : "";
}

/**
 * The same address with the image's extension swapped. The query and the
 * fragment ride along: `shot.png?v=2` becomes `shot.webp?v=2`. A URL keeps
 * whatever escaping it had, since only the extension is replaced.
 */
export function webpUrl(url: string): string {
  const match = SUFFIX.exec(url);
  const bare = match?.[1] ?? url;
  const suffix = match?.[2] ?? "";
  const dot = bare.lastIndexOf(".");
  const slash = bare.lastIndexOf("/");
  if (dot <= slash) return url;
  return `${bare.slice(0, dot)}.webp${suffix}`;
}

function webpName(file: string): string {
  const parsed = path.parse(file);
  return path.join(parsed.dir, `${parsed.name}.webp`);
}

/**
 * Encodes one image, reusing the cached copy when the bytes and the settings
 * match. The cache is an optimization: an unwritable folder only costs time.
 */
async function encode(
  original: Buffer,
  settings: WebpSettings,
  cacheDir: string | undefined,
): Promise<Buffer> {
  const cached = cacheDir
    ? path.join(cacheDir, `${cacheKey(original, settings)}.webp`)
    : undefined;

  if (cached) {
    try {
      return await readFile(cached);
    } catch {
      // Not encoded before, or the cache was cleared.
    }
  }

  const encoded = await sharp(original)
    // WebP keeps no EXIF orientation, so a picture taken sideways must be
    // turned upright before its metadata is dropped.
    .rotate()
    .webp(
      settings.lossless
        ? { lossless: true, effort: settings.effort }
        : { quality: settings.quality, effort: settings.effort },
    )
    .toBuffer();

  if (cached) {
    try {
      await mkdir(path.dirname(cached), { recursive: true });
      const temporary = `${cached}.${process.pid}.tmp`;
      await writeFile(temporary, encoded);
      await rename(temporary, cached);
    } catch {
      // The cache is an optimization; a read-only build still works.
    }
  }

  return encoded;
}

function cacheKey(original: Buffer, settings: WebpSettings): string {
  return createHash("sha256")
    .update(String(CACHE_VERSION))
    .update(`${settings.quality}:${settings.lossless}:${settings.effort}`)
    .update(original)
    .digest("hex");
}

async function mapLimit<T>(
  items: T[],
  limit: number,
  run: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const item = items[next++];
      if (item !== undefined) await run(item);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
}
