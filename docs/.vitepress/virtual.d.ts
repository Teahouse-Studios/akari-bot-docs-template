declare module "virtual:akari-hero-colors" {
  /** Build-time theme seeds, keyed by `heroColorKey`. */
  const colors: Record<string, string | null>;
  export default colors;
}

declare module "virtual:akari-image-colors" {
  /** Build-time colors and sizes, keyed by `imageMetaKey`. */
  interface ImageMeta {
    color: string | null;
    width: number | null;
    height: number | null;
  }

  const images: Record<string, ImageMeta>;
  export default images;
}
