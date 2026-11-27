---
tab: Details
---

# Hero: Details

## Color extraction

A page with a hero takes a color from the image as the seed color of the theme.

- It uses Material's official [material-color-utilities](https://github.com/material-foundation/material-color-utilities): the image is scaled down to 128px or less, quantized into its main colors, and the colors are scored on how well they suit an interface theme. This is the same algorithm Android uses to take colors from the wallpaper. Transparent pixels and colors that are too dull are left out.
- Extraction happens at build time, in the Vite plugin at `.vitepress/media-colors.ts`: it scans images in pages and in `public`, and the built HTML already carries the color, so a page never waits for an image or reads its pixels, and server rendering and hydration use the same value.
- The same result records the image's pixel size, so an overlay can take its shape before the image arrives, and is cached in `.vitepress/cache/media-colors.json`, keyed by the image file's modification time and size. Only images that changed are sampled again; rebuild after changing an image and there is no cache to clear.
- The light and dark images are sampled separately: the light image colors the page by day, and the dark image colors it when the dark image is shown.
- A remote image is downloaded once at build time; a successful result is cached for seven days. If the build cannot reach it, the reader's color stays. You can also set the color directly with `color`.
- When the image has no color vivid enough, the reader's color stays as well.

## Title

With a hero set, the page title shows in the hero card and the first `# Title` in the Markdown is hidden, so the page still has only one visible `h1`. The title text comes from the frontmatter `title`, or from the first `#` heading if there is none, which matches VitePress's rule for page titles. The title in the hero has `data-akari-page-title`; once it scrolls under the app bar, the app bar shows the page title.

Dates are formatted for the page language: `2026-05-19` shows as "2026年5月19日" on Chinese pages and as "May 19, 2026" on English pages.

## Layout

- The two cards fill the top of the document surface and are not limited by the content's `--akari-doc-max-width`. The distance from the cards to the top, left and right edges of the surface, and the distance between the two cards, are all `--akari-doc-hero-inset`. The card corners are concentric with the surface corners.
- The title size and the card padding scale with the hero's own width (container queries), not with the window width: when the navigation drawer opens and the available space narrows, the title shrinks with it.
- When the window is narrower than 840px, the two cards stack, with the text on top and the image shown at 16:10.
- When the page belongs to a group of parallel pages, the tab bar sits above the hero, and the hero sits the same distance below the tab bar. This keeps the tab bar in the same place on every page of the group, so it does not jump when you switch between pages with and without a hero.
- The image has `loading="lazy"` and `fetchpriority="high"`: while it is on the first screen the browser loads it at once and treats it as the largest element there; when the window is narrow and the hero moves below the first screen, it waits until it comes near the viewport. The hero is inside the document surface, so it fades out and in with the surface when the page changes.

## Loading

- Content images get `loading="lazy"` and `decoding="async"` while the Markdown renders; `<img>` tags written straight into the HTML get them too. An explicit `loading` or `decoding` attribute is never overwritten.
- In the browser each content image is wrapped in `.akari-lazy-media`: until the image arrives, a scrim covers it with an `m3e-loading-indicator` ball in the middle. The scrim takes the image's build-time size and its extracted color; when the image loads it fades out with MD3's `emphasized-accelerate`. A `<picture>` is wrapped together with its `<source>` elements, so source selection still works.
- The hero uses the same indicator over its image card, tinted with that image's extracted color, and waits only for the image the current light or dark mode shows. The dark image is not downloaded in light mode, and vice versa.
- A fast image does not flash the scrim: it fades in only after about 120ms. The fade-out uses MD3 duration and easing tokens; with reduced motion requested there is no animation and the scrim appears or disappears directly.
- Thumbnails inside the `ImagePreview` component keep their own frame: before the picture arrives they take its build-time ratio, show the same tinted loading ball and ignore clicks. The opened preview likewise shows the ball at the picture's ratio and color. They are not wrapped, so their corners and click area stay as they are.

## Patterns and glow

- Both cards use the same pattern. It is clearest at the top end corner of the text card and at the bottom start corner of the image card, and fades out from each, so together the two form a diagonal.
- The pattern of the image card sits under the image and shows only where the image is transparent; a photo that fills the card covers it completely.
- When the pointer rests on a card, a very faint glow in the theme color lights up around it. The pattern is a little clearer inside the glow, the glow's edge fades out in steps, and the glow fades out when the pointer moves away. A `pointermove` handler on the document surface writes the glow position every frame (`--akari-light-x`, `--akari-light-y`), and it responds only to mouse and pen. Whether the glow comes up at all is decided by the pointer too: while the reader uses a mouse or pen, `html` carries `data-akari-hover`, removed at the first touch, rather than relying on the `(hover: hover)` media query.
- The pattern is picked in the browser. Server-side rendering has no pattern, and the pattern fades in after mount, so the server and browser pages match and there is no hydration mismatch.
- Touch devices show only the static pattern, and forced colors mode shows no decoration. The decoration sits under the text and images, so it does not get in the way of selecting or clicking.

Elements with a background in the content use the same set of patterns; see [Typography](/styles/typography/api#patterns).
