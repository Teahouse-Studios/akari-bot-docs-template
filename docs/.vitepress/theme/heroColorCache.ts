import type { ResolvedHero } from "./hero";
import type { AkariResolvedScheme } from "./scheme";

// Longest side the image is scaled to before its pixels are read, as
// Material's own image extraction does: enough to find the dominant colors,
// small enough for a build to rasterize quickly.
export const HERO_COLOR_SAMPLE_SIZE = 128;

const APP_ABSOLUTE = /^\/(?!\/)/;
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;
/**
 * The encodings the build may swap for one another, see media-webp.ts. A key
 * names the picture, not the file: when a PNG is served as a WebP, the image
 * in the page and the map the build wrote must still agree on its key.
 */
const ENCODING = /\.(?:bmp|jpe?g|png|tiff?|webp)([?#].*)?$/i;

/** What the build knows about one image: its color and its intrinsic size. */
export interface ImageMeta {
  color: string | null;
  width: number | null;
  height: number | null;
}

/**
 * The cache key of a hero image. Absolute paths and external addresses are
 * the same on every page; a relative path means the file beside the page,
 * so two pages can each have their own `./hero.png`. The encoding is left
 * out of the key, so a picture found as `/hero/shot.png` is still found
 * when the build serves it as `/hero/shot.webp`.
 */
export function heroColorKey(src: string, filePath?: string): string {
  if (SCHEME.test(src) || src.startsWith("//")) {
    return src;
  }
  const clean = src.replace(ENCODING, "$1");
  if (APP_ABSOLUTE.test(clean)) {
    return clean;
  }
  return `${filePath ?? ""}::${clean}`;
}

/**
 * The key an image rendered in the page uses. Public paths keep their app
 * prefix in the markup when the site is served below a base; the build's
 * map is written without it, so the prefix is removed before looking up.
 */
export function imageMetaKey(
  src: string,
  filePath?: string,
  base = "/",
): string {
  let clean = src;
  const prefix = base.replace(/\/+$/, "");
  if (prefix && (src === prefix || src.startsWith(`${prefix}/`))) {
    clean = src.slice(prefix.length) || "/";
  }
  // Cache-busting query strings do not change which image this is, but they
  // do change the URL. Remote URLs keep theirs (signed URLs differ), local
  // paths resolve to the same file either way.
  if (!/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(clean)) {
    clean = clean.replace(/[?#].*$/, "");
  }
  return heroColorKey(clean, filePath);
}

/** The build-time metadata of an image, if the build saw it. */
export function lookupImageMeta(
  images: Readonly<Record<string, ImageMeta | undefined>>,
  src: string,
  filePath?: string,
  base = "/",
): ImageMeta | null {
  return images[imageMetaKey(src, filePath, base)] ?? null;
}

/**
 * The seed the page asks for: its fixed `hero.color`, the build-time color
 * of the image its current scheme shows, or null to keep the reader's color.
 * Colors are sampled once when the site is built (see media-colors.ts at the
 * site root), light and dark images separately, so the page never has to
 * wait for an image to decode before it can be colored.
 */
export function resolveHeroColor(
  hero: ResolvedHero | null,
  scheme: AkariResolvedScheme | null,
  colors: Readonly<Record<string, string | null | undefined>>,
  filePath?: string,
): string | null {
  if (!hero || hero.color === false) return null;
  if (hero.color !== "auto") return hero.color;

  const src = scheme === "dark" && hero.darkSrc ? hero.darkSrc : hero.src;
  return colors[heroColorKey(src, filePath)] ?? null;
}
