---
icon: wallpaper
order: 5
tab: Overview
parallel:
  - api
---

<script setup>
import FluidWallPlayground from "../../../.vitepress/theme/components/content/FluidWallPlayground.vue";
</script>

# Fluid wall: Overview

`AkariFluidWall` is a background panel drawn with WebGL2: two levels of warped noise pulling at each other, coloured entirely from the theme's `--md-sys-color-*` tokens, so it follows the palette and the light/dark switch. You can write on it, or just leave it as a moving ground.

::: tip
Stopping on one frame is expected: with "reduce motion" on, with the tab in the background, or while the element is outside the viewport, the wall pauses and resumes when it comes back.
:::

## Smallest usage

```html
<AkariFluidWall />
```

With no attributes it is the `silk` variant: mid-scale folds, faux petal arms, a 72px fine grid, pointer light, and a height of `clamp(220px, 34vh, 380px)`.

## Playground

The block below is live: the preview sits above and every visual control below it. Changes only affect this instance, and the snippet follows the current configuration, ready to copy into a page.

<FluidWallPlayground />

## Variants

`variant` picks the overall shape. Each one is a set of starting values; every number in the props table can still override it, so `silk` with a larger `scale` is still silk, only finer.

<div class="demo-row">
  <m3e-chip>silk</m3e-chip>
  <m3e-chip>aurora</m3e-chip>
  <m3e-chip>mesh</m3e-chip>
  <m3e-chip>nebula</m3e-chip>
  <m3e-chip>blossom</m3e-chip>
</div>

`silk` is the default: folds, petal arms and grid all on, the closest to a sheet of moving satin.

`aurora` squeezes the noise domain across the width into vertical curtains, adds a faster comb that drifts them, and drops petals and grid. Good for a light band at the top of a page.

`mesh` damps the flow almost to rest, leaves a soft ground, and lifts the grid and the pointer spotlight. It reads as textured paper, the clearest surface for text.

`nebula` is the finest: a larger noise scale, a very slow drift, a heavier vignette and a faint sakura layer. In dark it looks like star dust.

`blossom` softens the folds of `silk`, lays a stronger sakura texture over it and draws no grid.

## Overlays

`texture` draws a static pattern above the flow. It is independent of the flow and does not move with it, which is what makes it usable as a watermark or a lace border.

<div class="demo-row">
  <m3e-chip>sakura</m3e-chip>
  <m3e-chip>petals</m3e-chip>
  <m3e-chip>stars</m3e-chip>
  <m3e-chip>lace</m3e-chip>
  <m3e-chip>vine</m3e-chip>
  <m3e-chip>dots</m3e-chip>
</div>

Switch **Texture** in the playground above to preview each one.

`sakura` is a five-petal blossom: ink strokes in light, solid petals in dark. `texture-tone` forces either.

`petals` is loose petals only, sparser than `sakura`.

`stars` is a sparkle field, best on the darkest walls.

`lace` is not a tile: it builds ribbon bands, each entering and leaving the frame at random, with two scalloped edges and a row of lace motifs. Position and direction come from `seed`; omitted, they change per load, and a fixed `seed` reproduces them.

`vine` grows shoots, and they can reach past the frame (see below).

`dots` is a staggered dot lattice, the faintest of the set.

::: tip
Asking for `texture="stars"` without a `variant` would be invisible, since `silk` ships with zero overlay alpha; `resolveFluid` lifts it to `0.55` so a named texture is always visible. Lower it with `texture-opacity`.
:::

## Writing on the wall

The default slot is a centred column; `top` and `bottom` pin to the top-right and bottom-left corners. `placement` moves the centre column across the wall.

```html
<AkariFluidWall height="240px" placement="start">
  <h2>Akari docs</h2>
  <p>The background is a fluid wall, with the text laid directly on it.</p>
  <template #top><span>v1.0</span></template>
  <template #bottom><span>AkariBot</span></template>
</AkariFluidWall>
```

When there is slot content the wall fades a veil in under the text so it stays legible; with `placement` set to `start`, `center` or `end` the veil turns with it. With no content the veil is not drawn.

## Vines past the frame

With `texture="vine"` a few shoots may grow beyond the panel, and a few may arch up through it toward the viewer.

`popout` lets them leave the frame, `inward` lets them rise inside it, and `safe-zone` lists the areas they keep clear of.

`base` in `vine-colors` sets the colour of every part that has no explicit value; `fill` is the fallback for the remaining parts, explicit parts win, and `texture-color` is the last fallback.

## Following the palette

All colour comes from `--md-sys-color-*` and `--md-sys-motion-*`, so the palette button in the app bar needs no extra configuration. Tokens are read through a hidden probe inside the wall rather than by parsing `getComputedStyle` strings, so relative colours such as `color-mix` and `rgb(from …)` resolve correctly.

## GPU detection

Before creating a WebGL context, the wall calls `getGPUTier("BAD")` from `detect-gpu.js`. The page runs the detector once.

The result is stored in `document.documentElement.dataset.akariGpuTier`. When the result is `BAD`, the wall creates neither a WebGL2 context nor the vine 3D scene and shows only the CSS fallback gradient. `BAD` covers missing WebGL2, SwiftShader or llvmpipe software rendering, and similar cases.

The wall then logs an `[akari]` warning with the detector reason to the console.

## Performance

- The shader runs on demand: it starts when the element enters the viewport and stops when it leaves or the tab hides; with `prefers-reduced-motion: reduce` it draws the first frame only.
- 30fps cap, DPR capped at 1.5, a 1.1M pixel budget; larger canvases are scaled down and stretched by CSS.
- Without WebGL2 it falls back to a CSS gradient: still coloured, just still.
- Do not put a dozen walls on one page: each has its own rAF loop and canvas.

Props, slots, CSS classes and the exported geometry helpers are on the `API` page.
