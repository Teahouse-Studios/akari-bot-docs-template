import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import matter from "gray-matter";
import sharp from "sharp";
import type { Plugin, ResolvedConfig } from "vite";

import { heroColorKey, imageMetaKey, type ImageMeta } from "./heroColorCache";
import { resolveHero } from "./hero";

/**
 * Modules the theme reads build-time image metadata from. Every image the
 * build can see gets a color and its intrinsic size, so an overlay can take
 * the picture's shape before the picture arrives and wear the picture's own
 * color while it loads.
 */
export const IMAGE_COLORS_ID = "virtual:akari-image-colors";
export const HERO_COLORS_ID = "virtual:akari-hero-colors";

const RESOLVED_IMAGES = `\0${IMAGE_COLORS_ID}`;
const RESOLVED_HEROES = `\0${HERO_COLORS_ID}`;

const CACHE_VERSION = 2;
const REMOTE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const REMOTE_TIMEOUT = 10_000;
const CONCURRENCY = 4;

const IMAGE_FILE = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)$/i;

interface FileImage extends ImageMeta {
  mtimeMs: number;
  size: number;
}

interface RemoteImage extends ImageMeta {
  fetchedAt: number;
}

interface CacheFile {
  version: number;
  files: Record<string, FileImage>;
  remote: Record<string, RemoteImage>;
}

interface Logger {
  info(message: string): void;
  warn(message: string): void;
}

export interface AkariMediaColorsOptions {
  /** The VitePress source directory, which holds the Markdown pages. */
  srcDir: string;
  /** The public folder paths that start with `/` point into. */
  publicDir: string;
  /** Where sampled colors and sizes are remembered between builds. */
  cacheFile: string;
}

interface ImageSource {
  src: string;
  pageFile: string;
  markdownFile: string | null;
  /** Whether this image is a hero whose page asks for `color: auto`. */
  hero: boolean;
}

interface SampledImage {
  meta: ImageMeta;
  sampled: boolean;
}

interface Payload {
  images: Record<string, ImageMeta>;
  heroes: Record<string, string | null>;
}

/**
 * Samples the color and intrinsic size of every image the site can show,
 * once, while the site is built, and hands the theme two modules: one for
 * hero seeds and one for the loading overlays. Results are cached by the
 * image's modification time and size, so a rebuild only reads the images
 * that changed.
 */
export function akariMediaColors(options: AkariMediaColorsOptions): Plugin {
  let config: ResolvedConfig | undefined;
  let logger: Logger = console;
  let payload: Promise<Payload> | undefined;

  function reset(): void {
    payload = undefined;
  }

  async function compute(): Promise<Payload> {
    const cache = await readCache(options.cacheFile);
    const sources = await findSources(options.srcDir, options.publicDir);
    const images: Record<string, ImageMeta> = {};
    const heroes: Record<string, string | null> = {};
    let sampled = 0;

    await mapLimit([...sources.entries()], CONCURRENCY, async ([key, source]) => {
      const result = await imageFor(
        source,
        cache,
        options.publicDir,
        config,
        logger,
      );
      if (result.sampled) sampled += 1;
      images[key] = result.meta;
      if (source.hero) heroes[key] = result.meta.color;
    });

    await writeCache(options.cacheFile, cache);
    logger.info(
      `[akari] image colors: ${sources.size} image${sources.size === 1 ? "" : "s"} (${sampled} sampled)`,
    );
    return { images, heroes };
  }

  function load(): Promise<Payload> {
    payload ??= compute().catch((error: unknown) => {
      logger.warn(`[akari] image colors failed: ${String(error)}`);
      return { images: {}, heroes: {} };
    });
    return payload;
  }

  return {
    name: "akari-media-colors",
    configResolved(resolved) {
      config = resolved;
      logger = resolved.logger;
    },
    configureServer(server) {
      const publicDir = config?.publicDir ?? path.join(options.srcDir, "public");
      const invalidate = (file: string): void => {
        const absolute = path.resolve(file);
        if (
          !/\.(?:md|mdx)$/i.test(absolute) &&
          !absolute.startsWith(publicDir + path.sep)
        ) {
          return;
        }
        reset();
        for (const id of [RESOLVED_IMAGES, RESOLVED_HEROES]) {
          const module = server.moduleGraph.getModuleById(id);
          if (module) server.moduleGraph.invalidateModule(module);
        }
      };

      server.watcher.on("add", invalidate);
      server.watcher.on("change", invalidate);
      server.watcher.on("unlink", invalidate);
    },
    resolveId(id) {
      if (id === IMAGE_COLORS_ID) return RESOLVED_IMAGES;
      if (id === HERO_COLORS_ID) return RESOLVED_HEROES;
      return undefined;
    },
    async load(id) {
      if (id === RESOLVED_IMAGES) {
        return `export default ${JSON.stringify((await load()).images)};`;
      }
      if (id === RESOLVED_HEROES) {
        return `export default ${JSON.stringify((await load()).heroes)};`;
      }
      return undefined;
    },
  };
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

/** Every image the site can show, keyed the way the theme will look it up. */
async function findSources(
  srcDir: string,
  publicDir: string,
): Promise<Map<string, ImageSource>> {
  const sources = new Map<string, ImageSource>();

  for (const file of await listPublicImages(publicDir)) {
    const src = `/${path.relative(publicDir, file).split(path.sep).join("/")}`;
    addSource(sources, src, "", null, false);
  }

  for (const markdownFile of await listMarkdown(srcDir)) {
    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(await readFile(markdownFile, "utf8"));
    } catch {
      // VitePress reports malformed frontmatter itself; skip it here.
      continue;
    }

    const pageFile = path
      .relative(srcDir, markdownFile)
      .split(path.sep)
      .join("/");

    const hero = resolveHero(parsed.data, "en");
    if (hero) {
      const auto = hero.color === "auto";
      for (const src of new Set([hero.src, hero.darkSrc].filter(Boolean))) {
        addSource(sources, src!, pageFile, markdownFile, auto);
      }
    }

    for (const src of findMarkdownImages(parsed.content)) {
      addSource(sources, src, pageFile, markdownFile, false);
    }
  }

  return sources;
}

function addSource(
  sources: Map<string, ImageSource>,
  src: string,
  pageFile: string,
  markdownFile: string | null,
  hero: boolean,
): void {
  if (!src || /^data:/i.test(src)) return;
  const key = hero ? heroColorKey(src, pageFile) : imageMetaKey(src, pageFile);
  const known = sources.get(key);
  if (known) {
    if (hero) known.hero = true;
    return;
  }
  sources.set(key, { src, pageFile, markdownFile, hero });
}

async function listPublicImages(publicDir: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(publicDir, { recursive: true });
  } catch {
    return [];
  }
  return entries
    .filter((entry) => IMAGE_FILE.test(entry))
    .map((entry) => path.join(publicDir, entry))
    .sort();
}

async function listMarkdown(srcDir: string): Promise<string[]> {
  let entries: string[];
  try {
    entries = await readdir(srcDir, { recursive: true });
  } catch {
    return [];
  }

  return entries
    .filter((entry) => entry.endsWith(".md") || entry.endsWith(".mdx"))
    .filter((entry) => {
      const segments = entry.split(/[\\/]/);
      return !segments.some(
        (segment) =>
          segment === "node_modules" ||
          segment === "dist" ||
          segment === "public" ||
          segment.startsWith("."),
      );
    })
    .map((entry) => path.join(srcDir, entry))
    .sort();
}

/**
 * Images written into a page: Markdown images, raw `<img>` tags, and the
 * `src` of an ImagePreview. Fenced blocks and inline code are removed first:
 * their images are examples, not pictures the page loads.
 */
function findMarkdownImages(content: string): string[] {
  const prose = stripCode(content);
  const found: string[] = [];
  const patterns = [
    /!\[[^\]]*\]\(\s*(?:<([^>\s]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g,
    /<img\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
    /<akari(?:-?image-?preview)\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)')/gi,
  ];

  for (const pattern of patterns) {
    for (const match of prose.matchAll(pattern)) {
      const src = match[1] ?? match[2];
      if (src) found.push(src);
    }
  }
  return [...new Set(found)];
}

function stripCode(content: string): string {
  let fence: string | null = null;
  const lines = content.split("\n").map((line) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) {
        fence = marker[1]!;
        return "";
      }
      if (line.trimStart().startsWith(fence)) {
        fence = null;
        return "";
      }
    }
    return fence ? "" : line;
  });
  return lines.join("\n").replace(/`[^`\n]*`/g, "");
}

async function imageFor(
  source: ImageSource,
  cache: CacheFile,
  publicDir: string,
  config: ResolvedConfig | undefined,
  logger: Logger,
): Promise<SampledImage> {
  const { src, markdownFile } = source;

  if (/^data:/i.test(src)) {
    try {
      return { meta: await sampleDataUri(src), sampled: true };
    } catch {
      return { meta: emptyMeta(), sampled: false };
    }
  }

  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(src)) {
    return imageForRemote(src, cache);
  }

  const file = resolveImageFile(src, markdownFile, publicDir, config);
  if (!file) return { meta: emptyMeta(), sampled: false };

  let info;
  try {
    info = await stat(file);
  } catch {
    return { meta: emptyMeta(), sampled: false };
  }

  const known = cache.files[file];
  if (known && known.mtimeMs === info.mtimeMs && known.size === info.size) {
    return { meta: metaOf(known), sampled: false };
  }

  try {
    const meta = await sampleFile(file);
    cache.files[file] = { mtimeMs: info.mtimeMs, size: info.size, ...meta };
    return { meta, sampled: true };
  } catch (error) {
    // A broken image should not stop the build; the overlay keeps the
    // reader's primary color and the image falls back to its natural box.
    logger.warn(`[akari] could not sample ${file}: ${String(error)}`);
    return { meta: emptyMeta(), sampled: false };
  }
}

async function imageForRemote(
  url: string,
  cache: CacheFile,
): Promise<SampledImage> {
  const known = cache.remote[url];
  if (known && Date.now() - known.fetchedAt < REMOTE_MAX_AGE) {
    return { meta: metaOf(known), sampled: false };
  }

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REMOTE_TIMEOUT),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const meta = await sampleBuffer(Buffer.from(await response.arrayBuffer()));
    cache.remote[url] = { fetchedAt: Date.now(), ...meta };
    return { meta, sampled: true };
  } catch {
    // Offline or blocked: an older sample still beats no color at all.
    return { meta: known ? metaOf(known) : emptyMeta(), sampled: false };
  }
}

function metaOf(image: ImageMeta): ImageMeta {
  return {
    color: image.color,
    width: image.width,
    height: image.height,
  };
}

function emptyMeta(): ImageMeta {
  return { color: null, width: null, height: null };
}

/** The image a path names: under `public` when it starts with `/`, beside the page otherwise. */
function resolveImageFile(
  src: string,
  markdownFile: string | null,
  publicDir: string,
  config: ResolvedConfig | undefined,
): string | null {
  const clean = stripUrl(src);
  if (!clean) return null;

  if (clean.startsWith("/")) {
    const base =
      config?.base && config.base !== "/" ? config.base.replace(/\/$/, "") : "";
    const withoutBase =
      base && (clean === base || clean.startsWith(`${base}/`))
        ? clean.slice(base.length) || "/"
        : clean;
    return path.join(publicDir, withoutBase.replace(/^\/+/, ""));
  }

  if (!markdownFile) return null;
  return path.resolve(path.dirname(markdownFile), clean);
}

function stripUrl(src: string): string {
  const clean = src.split(/[?#]/)[0] ?? "";
  try {
    return decodeURIComponent(clean);
  } catch {
    return clean;
  }
}

type PixelColor = (data: ArrayLike<number>) => string | null;

let pixelColor: Promise<PixelColor> | undefined;

/**
 * Material's color extraction, loaded from its own files. The package's
 * entry point imports a module without a `.js` extension, which Node cannot
 * load, so the pieces the extraction needs are imported directly. This
 * mirrors `sourceColorFromPixels` in theme/heroColor.ts, which is the same
 * algorithm for browser pixels; keep the two in step.
 */
function loadPixelColor(): Promise<PixelColor> {
  pixelColor ??= (async () => {
    const require = createRequire(import.meta.url);
    const root = path.dirname(require.resolve("@material/material-color-utilities"));
    const load = (file: string) =>
      import(pathToFileURL(path.join(root, file)).href);

    const [color, strings, quantizer, score] = await Promise.all([
      load("utils/color_utils.js"),
      load("utils/string_utils.js"),
      load("quantize/quantizer_celebi.js"),
      load("score/score.js"),
    ]);

    return (data: ArrayLike<number>): string | null => {
      const pixels: number[] = [];
      for (let index = 0; index + 3 < data.length; index += 4) {
        // Transparent pixels carry no color; the background of an image is
        // often the largest transparent area.
        if (data[index + 3]! < 255) continue;
        pixels.push(
          color.argbFromRgb(data[index]!, data[index + 1]!, data[index + 2]!),
        );
      }
      if (!pixels.length) return null;

      const [best] = score.Score.score(
        quantizer.QuantizerCelebi.quantize(pixels, 128),
        { desired: 1, fallbackColorARGB: 0, filter: true },
      );
      return best ? strings.hexFromArgb(best) : null;
    };
  })();
  return pixelColor;
}

async function sampleFile(file: string): Promise<ImageMeta> {
  return sampleBuffer(await readFile(file));
}

async function sampleBuffer(buffer: Buffer): Promise<ImageMeta> {
  const [metadata, pixels] = await Promise.all([
    sharp(buffer).metadata(),
    sharp(buffer)
      .resize(128, 128, { fit: "inside", withoutEnlargement: true })
      .ensureAlpha()
      .raw()
      .toBuffer(),
  ]);
  return {
    color: (await loadPixelColor())(pixels),
    width: metadata.width ?? null,
    height: metadata.height ?? null,
  };
}

async function sampleDataUri(src: string): Promise<ImageMeta> {
  const comma = src.indexOf(",");
  if (comma < 0) return emptyMeta();
  const header = src.slice(0, comma);
  const payload = src.slice(comma + 1);
  const buffer = header.includes(";base64")
    ? Buffer.from(payload, "base64")
    : Buffer.from(decodeURIComponent(payload));
  return sampleBuffer(buffer);
}

async function readCache(file: string): Promise<CacheFile> {
  try {
    const parsed: unknown = JSON.parse(await readFile(file, "utf8"));
    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed as CacheFile).version === CACHE_VERSION &&
      (parsed as CacheFile).files &&
      (parsed as CacheFile).remote
    ) {
      return parsed as CacheFile;
    }
  } catch {
    // No cache yet, or unreadable: start over.
  }
  return { version: CACHE_VERSION, files: {}, remote: {} };
}

async function writeCache(file: string, cache: CacheFile): Promise<void> {
  try {
    await mkdir(path.dirname(file), { recursive: true });
    const temporary = `${file}.${process.pid}.tmp`;
    await writeFile(temporary, `${JSON.stringify(cache)}\n`);
    await rename(temporary, file);
  } catch {
    // The cache is an optimization; a read-only build still works.
  }
}
