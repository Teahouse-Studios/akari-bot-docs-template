import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { akariContent } from "./content";
import { AKARI_BOOT_CONTROL_SCRIPT, akariBootPageStyle, injectAkariBoot } from "./theme/boot";
import { akariBootColors } from "./theme/bootColors";
import { akariMediaColors } from "./theme/media-colors";
import { akariMediaWebp } from "./theme/media-webp";
import { akariHead } from "./theme/head";
import { akariMarkdown } from "./theme/markdown";

const docsDir = fileURLToPath(new URL("../", import.meta.url));

// The site's content and its config live in the docs folder: config.ts for
// what every language shares, a folder per language with its own config.ts,
// and in it a folder per rail category holding a folder per article. This
// file only wires the theme into VitePress.
const content = await akariContent(docsDir);

// The boot's control script is an asset of its own: the skeleton is painted by
// HTML and CSS alone, so the script that watches it (fade-out, retry button)
// can arrive later, as a deferred and cacheable file. Its name carries the
// content hash, so a changed script is never served from an old cache.
const bootControlName = `boot-control.${createHash("sha256")
  .update(AKARI_BOOT_CONTROL_SCRIPT)
  .digest("hex")
  .slice(0, 10)}.js`;
const bootControlHref = `${content.site.base ?? "/"}assets/${bootControlName}`;

// The palette of the site's boot screen. A hero page does not use it: that
// page's theme color is sampled from its hero image, so its skeleton gets a
// palette of its own, written per page (see `akariBootPageStyle`).
const bootTheme = {
  seed: content.config?.settings?.defaults?.color,
  variant: content.config?.settings?.defaults?.variant,
  contrast: content.config?.settings?.defaults?.contrast,
};

// Image colors and sizes are sampled while the site is built, for the light
// and the dark hero image alike, and cached between builds.
const mediaColors = akariMediaColors({
  srcDir: docsDir,
  publicDir: fileURLToPath(new URL("../public", import.meta.url)),
  cacheFile: fileURLToPath(new URL("./cache/media-colors.json", import.meta.url)),
});

export default defineConfig({
  ...content.site,
  cleanUrls: false,
  // Light and dark belong to the theme's appearance button.
  appearance: false,
  head: akariHead(),
  // The boot screen lives outside `#app` so it can paint before the app's
  // components exist (see theme/boot.ts). It goes at the end of the body:
  // pages that teleport to the body put their anchors outside the app
  // container, and hydration drops the siblings before them. A page with a
  // hero image paints the skeleton in that image's own color.
  transformHtml: async (html, _id, ctx) => {
    const heroes = await mediaColors.heroColors();
    const palette = akariBootPageStyle(
      ctx.pageData.frontmatter,
      ctx.pageData.filePath,
      heroes,
      bootTheme,
    );
    return injectAkariBoot(html, bootControlHref, palette);
  },
  markdown: {
    theme: { light: "github-light", dark: "github-dark" },
    headers: { level: [2, 3] },
    config: (md) => akariMarkdown(md),
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag: string) => tag.startsWith("m3e-"),
      },
    },
  },
  vite: {
    plugins: [content.plugin, mediaColors],
    css: {
      postcss: {
        // The boot screen cannot read the m3e palette (it paints before
        // m3e-theme exists), so its colors are derived from the site's theme
        // seed while the site is built and written into the stylesheet.
        plugins: [akariBootColors(bootTheme)],
      },
    },
  },
  // `images.webp` in docs/config.ts turns this on: every raster image the
  // built pages point at is then replaced by a WebP copy of itself.
  buildEnd: async (site) => {
    // `buildEnd` runs once the pages and assets are written, which is also
    // when the boot's control script can be added next to them.
    await mkdir(join(site.outDir, "assets"), { recursive: true });
    await writeFile(join(site.outDir, "assets", bootControlName), AKARI_BOOT_CONTROL_SCRIPT, "utf8");
    await akariMediaWebp({ images: content.config?.images })(site);
  },
});
