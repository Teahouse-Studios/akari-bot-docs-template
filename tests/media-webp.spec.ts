import { randomBytes } from "node:crypto";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import sharp from "sharp";
import { afterAll, describe, expect, it } from "vitest";

import {
  akariMediaWebp,
  convertImages,
  findImageUrls,
  outputKind,
  resolveImageUrl,
  webpUrl,
  type BuiltSite,
} from "../docs/.vitepress/theme/media-webp";

/** Nothing worth reading: the tests assert on the summary, not the log. */
const quiet = { info: () => {}, warn: () => {} };

const temporaries: string[] = [];
afterAll(async () => {
  await Promise.all(
    temporaries.map((folder) => rm(folder, { recursive: true, force: true })),
  );
});

async function temporary(prefix = "akari-webp-"): Promise<string> {
  const folder = await mkdtemp(path.join(tmpdir(), prefix));
  temporaries.push(folder);
  return folder;
}

/** A screenshot-sized picture: noise does not compress, so WebP saves plenty. */
async function writePicture(file: string): Promise<void> {
  const side = 240;
  const raw = randomBytes(side * side * 3);
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(raw, { raw: { width: side, height: side, channels: 3 } })
    .png()
    .toFile(file);
}

/** A few pixels: under the size floor, so it should be left alone. */
async function writeDot(file: string): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await sharp({
    create: {
      width: 4,
      height: 4,
      channels: 3,
      background: { r: 0, g: 128, b: 128 },
    },
  })
    .png()
    .toFile(file);
}

const PAGE = `<!doctype html>
<html lang="en">
  <body>
    <img src="/hero/shot.png" data-akari-image-src="/hero/shot.png" alt="A screenshot">
    <img src="/hero/small.png" alt="A dot">
    <img src="/hero/logo.svg" alt="The logo">
    <p>The screenshot lives at /hero/shot.png.</p>
  </body>
</html>
`;

const CHUNK = `const hero = "/hero/shot.png";
const logo = "./hero/logo.svg";
export { hero, logo };
`;

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8"></svg>
`;

/**
 * A miniature built site: an HTML page, a page chunk whose strings hold the
 * image URLs, and four images — one referenced twice and worth converting,
 * one too small, one vector, and one nothing points at.
 */
async function site(): Promise<string> {
  const folder = await temporary();
  await writeFile(path.join(folder, "index.html"), PAGE);
  await mkdir(path.join(folder, "assets"), { recursive: true });
  await mkdir(path.join(folder, "hero"), { recursive: true });
  await writeFile(path.join(folder, "assets/page.md.1234.js"), CHUNK);
  await writeFile(path.join(folder, "hero/logo.svg"), SVG);
  await writePicture(path.join(folder, "hero/shot.png"));
  await writeDot(path.join(folder, "hero/small.png"));
  await writePicture(path.join(folder, "spare/unused.png"));
  return folder;
}

/** What VitePress hands `buildEnd`: where the site is, and a log to write to. */
function builtSite(folder: string, cacheDir: string, log: string[]): BuiltSite {
  return {
    outDir: folder,
    cacheDir,
    site: { base: "/" },
    logger: {
      info: (line: string) => void log.push(line),
      warn: (line: string) => void log.push(line),
    },
  };
}

async function exists(file: string): Promise<boolean> {
  return stat(file).then(
    () => true,
    () => false,
  );
}

describe("webpUrl", () => {
  it("swaps the extension of a local image", () => {
    expect(webpUrl("/hero/shot.png")).toBe("/hero/shot.webp");
    expect(webpUrl("./a/b/picture.JPG")).toBe("./a/b/picture.webp");
  });

  it("keeps the query and the fragment", () => {
    expect(webpUrl("/hero/shot.png?v=2")).toBe("/hero/shot.webp?v=2");
    expect(webpUrl("/hero/shot.png#top")).toBe("/hero/shot.webp#top");
  });

  it("leaves a URL with nothing to swap alone", () => {
    expect(webpUrl("/hero/image")).toBe("/hero/image");
    expect(webpUrl("/hero.webp/shot")).toBe("/hero.webp/shot");
    expect(webpUrl("/hero/shot.webp")).toBe("/hero/shot.webp");
  });
});

describe("outputKind", () => {
  it("reads a file by what it is", () => {
    expect(outputKind("/site/index.html")).toBe("html");
    expect(outputKind("/site/assets/style.css")).toBe("css");
    expect(outputKind("/site/assets/page.md.1234.js")).toBe("text");
    expect(outputKind("/site/manifest.webmanifest")).toBe("text");
  });
});

describe("findImageUrls", () => {
  it("finds the attributes of markup, one URL per srcset candidate", () => {
    const text = `<img src="/hero/a.png" srcset="/hero/a.png 1x, /hero/b.png 2x" alt="x">
<img src='./c.png' poster="/hero/film.jpg">`;
    const urls = findImageUrls(text, "html");

    expect(urls.map((url) => url.url)).toEqual([
      "/hero/a.png",
      "/hero/a.png",
      "/hero/b.png",
      "./c.png",
      "/hero/film.jpg",
    ]);
    for (const url of urls) expect(text.slice(url.start, url.end)).toBe(url.url);
  });

  it("does not mistake prose for a reference", () => {
    const text = `<p>A screenshot at /hero/shot.png, and one at "./shot.png".</p>`;
    expect(findImageUrls(text, "html")).toEqual([]);
  });

  it("ignores an attribute that merely ends in src", () => {
    // The theme keeps the address the author wrote here, to look up the
    // image's color and size; it must not be taken for the image's own src.
    const text = `<img src="/hero/shot.png" data-akari-image-src="/hero/shot.png">`;
    const urls = findImageUrls(text, "html");

    expect(urls.map((url) => url.url)).toEqual(["/hero/shot.png"]);
    expect(urls[0]!.start).toBe(text.indexOf("/hero/shot.png"));
    expect(text.slice(urls[0]!.start, urls[0]!.end)).toBe("/hero/shot.png");
  });

  it("finds url() in a stylesheet, quoted or not", () => {
    const text = `a { background: url("../img/bg.png"); }
b { background: url(/hero/logo.svg?v=1) }`;
    const urls = findImageUrls(text, "css");

    expect(urls.map((url) => url.url)).toEqual(["../img/bg.png", "/hero/logo.svg?v=1"]);
    for (const url of urls) expect(text.slice(url.start, url.end)).toBe(url.url);
  });

  it("finds the strings of a page chunk", () => {
    const text = `const hero = "/hero/shot.png"; const logo = './logo.svg';`;
    const urls = findImageUrls(text, "text");

    expect(urls.map((url) => url.url)).toEqual(["/hero/shot.png", "./logo.svg"]);
    for (const url of urls) expect(text.slice(url.start, url.end)).toBe(url.url);
  });

  it("finds a template literal, where the bundler puts an asset's URL", () => {
    // Vite emits asset URLs as template literals in the shared chunk and as
    // escaped strings in the page's data, so both spellings have to count.
    const text = "var e=`/hero/theme-hero.svg`,t=`/assets/shot.AB12CD.png`;";
    const urls = findImageUrls(text, "text");

    expect(urls.map((url) => url.url)).toEqual([
      "/hero/theme-hero.svg",
      "/assets/shot.AB12CD.png",
    ]);
    for (const url of urls) expect(text.slice(url.start, url.end)).toBe(url.url);
  });
});

describe("resolveImageUrl", () => {
  const root = path.resolve(path.sep, "site");
  const fromPage = path.join(root, "getting-started/writing/index.html");

  it("reads a root-relative URL under the output folder", () => {
    expect(resolveImageUrl("/hero/shot.png", fromPage, root)).toBe(
      path.join(root, "hero/shot.png"),
    );
  });

  it("removes the site's base prefix", () => {
    expect(resolveImageUrl("/docs/hero/shot.png", fromPage, root, "/docs/")).toBe(
      path.join(root, "hero/shot.png"),
    );
  });

  it("reads a relative URL beside the file that mentions it", () => {
    expect(resolveImageUrl("./shot.png", fromPage, root)).toBe(
      path.join(root, "getting-started/writing/shot.png"),
    );
  });

  it("drops the query and the fragment", () => {
    expect(resolveImageUrl("/hero/shot.png?v=2#top", fromPage, root)).toBe(
      path.join(root, "hero/shot.png"),
    );
  });

  it("ignores addresses that are not part of the build", () => {
    expect(resolveImageUrl("https://example.com/a.png", fromPage, root)).toBeNull();
    expect(resolveImageUrl("//cdn.example.com/a.png", fromPage, root)).toBeNull();
    expect(resolveImageUrl("data:image/png;base64,AAAA", fromPage, root)).toBeNull();
    expect(resolveImageUrl("#top", fromPage, root)).toBeNull();
    expect(resolveImageUrl("", fromPage, root)).toBeNull();
  });

  it("refuses to climb out of the output folder", () => {
    expect(resolveImageUrl("../../../../etc/passwd", fromPage, root)).toBeNull();
    expect(
      resolveImageUrl("%2e%2e%2f%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd", fromPage, root),
    ).toBeNull();
  });
});

describe("convertImages", () => {
  it("converts the images the built site points at, and no others", async () => {
    const folder = await site();
    const summary = await convertImages({
      outDir: folder,
      cacheDir: undefined,
      logger: quiet,
    });

    // The screenshot, named twice but encoded once; the dot is under the
    // size floor; the vector is not a raster; the spare is referenced nowhere.
    expect(summary.found).toBe(2);
    expect(summary.converted).toBe(1);
    expect(summary.kept).toBe(1);
    expect(summary.failed).toBe(0);

    expect(await exists(path.join(folder, "hero/shot.webp"))).toBe(true);
    expect(await exists(path.join(folder, "hero/shot.png"))).toBe(false);
    expect(await exists(path.join(folder, "hero/small.png"))).toBe(true);
    expect(await exists(path.join(folder, "spare/unused.png"))).toBe(true);

    const webp = await readFile(path.join(folder, "hero/shot.webp"));
    expect(webp.length).toBeLessThan(summary.before);
    expect(summary.after).toBeLessThan(summary.before);
    expect(webp.subarray(8, 12).toString()).toBe("WEBP");

    // Both files that pointed at the screenshot now point at its WebP.
    const page = await readFile(path.join(folder, "index.html"), "utf8");
    expect(page).toContain('src="/hero/shot.webp"');
    expect(page).toContain('data-akari-image-src="/hero/shot.png"');
    expect(page).toContain('src="/hero/small.png"');
    expect(page).toContain('src="/hero/logo.svg"');
    expect(summary.rewritten).toBe(2);

    const chunk = await readFile(path.join(folder, "assets/page.md.1234.js"), "utf8");
    expect(chunk).toContain('"/hero/shot.webp"');
    expect(chunk).toContain('"./hero/logo.svg"');
  });

  it("leaves the page's prose alone", async () => {
    const folder = await site();
    await convertImages({ outDir: folder, cacheDir: undefined, logger: quiet });

    const page = await readFile(path.join(folder, "index.html"), "utf8");
    expect(page).toContain("The screenshot lives at /hero/shot.png.");
  });

  it("has nothing left to do on a second run", async () => {
    const folder = await site();
    await convertImages({ outDir: folder, cacheDir: undefined, logger: quiet });
    const before = await readFile(path.join(folder, "index.html"), "utf8");

    const again = await convertImages({
      outDir: folder,
      cacheDir: undefined,
      logger: quiet,
    });

    // Only the dot is still a candidate, and it stays under the size floor.
    expect(again.found).toBe(1);
    expect(again.converted).toBe(0);
    expect(again.kept).toBe(1);
    expect(again.rewritten).toBe(0);
    expect(await readFile(path.join(folder, "index.html"), "utf8")).toBe(before);
  });

  it("keeps the original when asked to", async () => {
    const folder = await site();
    await convertImages({
      outDir: folder,
      cacheDir: undefined,
      keepOriginal: true,
      logger: quiet,
    });

    expect(await exists(path.join(folder, "hero/shot.png"))).toBe(true);
    expect(await exists(path.join(folder, "hero/shot.webp"))).toBe(true);
  });

  it("leaves an image alone when the saving is too small", async () => {
    const folder = await site();
    const summary = await convertImages({
      outDir: folder,
      cacheDir: undefined,
      minSaving: 0.99,
      logger: quiet,
    });

    expect(summary.converted).toBe(0);
    expect(summary.kept).toBe(2);
    expect(await exists(path.join(folder, "hero/shot.png"))).toBe(true);
    expect(await exists(path.join(folder, "hero/shot.webp"))).toBe(false);

    const page = await readFile(path.join(folder, "index.html"), "utf8");
    expect(page).toContain('src="/hero/shot.png"');
  });

  it("encodes an image once, then reuses it from the cache", async () => {
    const source = await site();
    // The same picture, byte for byte: the second build must hit the cache
    // rather than encode again.
    const second = path.join(await temporary(), "site");
    await cp(source, second, { recursive: true });

    const cacheDir = await temporary("akari-webp-cache-");
    await convertImages({ outDir: source, cacheDir, logger: quiet });

    const entries = await readdir(cacheDir);
    expect(entries).toHaveLength(1);
    const cached = path.join(cacheDir, entries[0]!);
    const stamp = (await stat(cached)).mtimeMs;

    await convertImages({ outDir: second, cacheDir, logger: quiet });

    expect(await readdir(cacheDir)).toHaveLength(1);
    expect((await stat(cached)).mtimeMs).toBe(stamp);
    expect(await readFile(path.join(second, "hero/shot.webp"))).toEqual(
      await readFile(path.join(source, "hero/shot.webp")),
    );
  });
});

describe("akariMediaWebp", () => {
  it("does nothing at all unless the config asks for it", async () => {
    const folder = await site();
    const log: string[] = [];

    await akariMediaWebp()(builtSite(folder, await temporary(), log));

    // Silence, not a hint: the pass is a config choice, not a command.
    expect(log).toEqual([]);
    expect(await exists(path.join(folder, "hero/shot.webp"))).toBe(false);
    expect(await readFile(path.join(folder, "index.html"), "utf8")).toBe(PAGE);
  });

  it("does nothing when the config says `webp: false`", async () => {
    const folder = await site();
    const log: string[] = [];

    await akariMediaWebp({ images: { webp: false } })(
      builtSite(folder, await temporary(), log),
    );

    expect(log).toEqual([]);
    expect(await exists(path.join(folder, "hero/shot.png"))).toBe(true);
  });

  it("converts the images the pages use when the config says `webp: true`", async () => {
    const folder = await site();
    const log: string[] = [];

    await akariMediaWebp({ images: { webp: true } })(
      builtSite(folder, await temporary(), log),
    );

    expect(log).toHaveLength(1);
    // Two images are used: the screenshot is worth converting, the dot is too
    // small for it to pay off.
    expect(log[0]).toContain("[akari] image webp: 1 of 2 images converted");
    expect(await exists(path.join(folder, "hero/shot.webp"))).toBe(true);
    const page = await readFile(path.join(folder, "index.html"), "utf8");
    expect(page).toContain('src="/hero/shot.webp"');
    // The address the author wrote stays, for the theme's color and size.
    expect(page).toContain('data-akari-image-src="/hero/shot.png"');
  });
});
