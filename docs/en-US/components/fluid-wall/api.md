---
tab: API
---

# Fluid wall: API

`AkariFluidWall` belongs to the theme rather than to `@m3e/web`, so it has no `m3e-` element behind it. It reads the `--md-sys-color-*` and `--md-sys-motion-*` tokens, which is why it follows the colour and motion settings. Colour is computed in the WebGL2 fragment shader and passed as uniforms, so a palette change repaints the same field instead of rebuilding the program.

## AkariFluidWall

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `height` | `string` | `clamp(220px, 34vh, 380px)` | Any CSS length |
| `variant` | `string` | `"silk"` | `silk`, `aurora`, `mesh`, `nebula`, `blossom`; unknown values fall back to `silk` |
| `light` | `"start" \| "center" \| "end"` | `"end"` | Which end the virtual light sits at; also turns the vignette |
| `placement` | `"start" \| "center" \| "end"` | `"start"` | Where the slotted content sits; the veil turns with it |
| `texture` | `string` | from `variant` | `none`, `sakura`, `petals`, `stars`, `lace`, `vine`, `dots` |
| `texture-size` | `number \| string` | from `texture` | Tile edge of the overlay in px, clamped to 80–640 |
| `texture-density` | `number \| string` | from `texture` | Density multiplier, clamped to 0–3; lower is sparser |
| `vine-density` | `number \| string` | `0.7` | Vine density multiplier. Clamped to 0.2–2. Lower values grow fewer vines. |
| `texture-opacity` | `number \| string` | from `variant` | 0–1; the final alpha also multiplies the texture's weight |
| `texture-tone` | `"auto" \| "ink" \| "light"` | `"auto"` | Outlined or solid; `auto` follows the scheme (dark picks `light`) |
| `texture-color` | `string` | — | Any CSS colour; overrides `texture-tone`. The colour reaches both the overlay texture and the vine, while its alpha only affects the overlay. |
| `vine-colors` | `Partial<Record<"base" \| "leaf" \| "leafStem" \| "flower" \| "flowerStem" \| "bud" \| "fill" \| "tint" \| "halo" \| "edge" \| "fine", string>>` | — | Per-part vine colours; values may carry alpha. `base` sets the colour of parts left unset; other unset parts follow `fill`, then `base`, then `texture-color`. |
| `vine-blend` | `"normal" \| "multiply" \| "screen" \| "overlay" \| "soft-light" \| "difference"` | `"normal"` | Blend mode between the vine and the flow, as a CSS `mix-blend-mode` value. |
| `vine-popout-blend` | `"normal" \| "multiply" \| "screen" \| "overlay" \| "soft-light" \| "difference"` | `vine-blend` | Blend mode for the pop-out vine layer; a separate canvas is used only when set and different from `vine-blend`. |
| `vine-popout-colors` | `Partial<Record<"base" \| "leaf" \| "leafStem" \| "flower" \| "flowerStem" \| "bud" \| "fill" \| "tint" \| "halo" \| "edge" \| "fine", string>>` | — | Per-part colours of the pop-out shoots beyond their portal. |
| `speed` | `number \| string` | from `variant` | Speed multiplier; 1 is the variant's own drift |
| `scale` | `number \| string` | from `variant` | Noise sampling scale; larger means finer folds |
| `curl` | `number \| string` | from `variant` | Curl strength; 0 is a plain, undirected flow |
| `warp` | `number \| string` | from `variant` | Distance the warped noise drags the field; lower is quieter |
| `tone` | `number \| string` | from `variant` | 0 is the designed contrast, 1 washes the wall into the page surface |
| `grid` | `number \| string` | from `variant` | Grid cell in px; 0 draws none |
| `glow` | `number \| string` | from `variant` | Pointer light strength; 0 turns it off |
| `petal` | `number \| string` | from `variant` | How far the folds curl into petal arms; 0 is a plain flow |
| `popout` | `boolean \| "auto"` | `"auto"` | Whether vines leave the frame; `auto` follows the page's vine switch |
| `inward` | `boolean \| "auto"` | `"auto"` | Whether vines rise inside the wall; `auto` matches `popout` |
| `safe-zone` | `boolean \| string \| string[]` | `"auto"` | Areas pop-out shoots avoid; `auto` clears the wall's text, `none`/`false` clears nothing. Wall vines follow `wall-vines-in-safe-zone` instead |
| `outside-safe-zone` | `boolean \| string \| string[]` | `"none"` | Outside-wall safe zones: rects beyond the frame that pop-out vines keep clear of. Same inset syntax as `safe-zone`; negative values reach outside the wall. |
| `wall-vines-in-safe-zone` | `boolean` | `true` | Whether wall vines may enter `safe-zone`. When `false`, wall vines keep clear of it; pop-out shoots always avoid it. |
| `ripple` | `number` | `1` | Strength of the ripple at each pop-out portal; 0 turns it off. |
| `ripple-speed` | `number` | `1` | Speed multiplier of that ripple. |
| `ripple-size` | `number` | `1` | Radius multiplier of that ripple. |
| `ripple-rings` | `number \| string` | `2.2` | Rings packed into one ripple radius, 0.5–6 |
| `ripple-sway` | `number \| string` | `1` | How far a ripple pushes the vines, 0–3 |
| `vine-glow` | `number \| string` | `1` | Pointer-glow strength on the vine, 0–2; 0 turns it off |
| `shadow` | `number` | `1` | Opacity multiplier for the cast shadow of the pop-out shoots; 0 turns it off. |
| `shadow-size` | `number` | `1` | Size multiplier for that shadow. |
| `shadow-color` | `string` | darkened vine fill | Colour of the cast shadow. |
| `shadow-angle` | `number` | `303.5` | Direction of the cast shadow in degrees; 0 is +x, 90 is +y. |
| `shadow-blur` | `number` | `6` | Blur radius of the cast shadow, in CSS pixels; 0 keeps a hard edge. |
| `wall-shadow` | `number` | `1` | Opacity multiplier for the wall-side shadow. |
| `wall-shadow-size` | `number` | `1` | Size multiplier for the wall-side shadow. |
| `wall-shadow-color` | `string` | `Derived from the vine fill` | Colour of the wall-side shadow. |
| `wall-shadow-angle` | `number` | `180` | Direction offset of the wall-side shadow from the cast shadow, in degrees. |
| `wall-shadow-blur` | `number` | `6` | Blur radius of the wall-side shadow, in CSS pixels; 0 keeps a hard edge. |
| `underlay-color` | `string` | `#ffffff` | Colour of the wash beneath the vine fill. |
| `underlay-opacity` | `number` | `0.18` | Opacity of the wash, from 0 to 1. |
| `underlay-blend` | `string` | `additive` | Blend mode of the wash: `additive`, `screen`, `normal`, `multiply`, `subtractive`. |
| `mote` | `number` | `1` | Mote count multiplier, from 0 to 3; 0 disables motes. |
| `mote-color` | `string` | Flower colour | Mote colour, any CSS colour. |
| `mote-blend` | `string` | `auto` | Mote blend mode: `auto`, `normal`, `additive`, `multiply`, `subtractive`. |

Numeric props also accept CSS strings (`"1.2"`, `"72"`) and are clamped through `fluidNumber`; an unparsable value falls back to the variant's own.

| Slot | Content |
| --- | --- |
| default | A centred column; horizontal alignment follows `placement` |
| `top` | A badge pinned to the top-right corner |
| `bottom` | A note pinned to the bottom-left corner |

| CSS class | Where |
| --- | --- |
| `.akari-fluid-wall` | Root; `data-placement` marks the alignment |
| `.akari-fluid-wall__canvas` | The WebGL2 canvas, faded in after the first frame |
| `.akari-fluid-wall__grid`, `__grid-lit` | The grid and its pointer-lit copy |
| `.akari-fluid-wall__texture`, `__texture-pattern`, `__texture-lit` | The overlay, its pattern and its lit copy |
| `.akari-fluid-wall__ribbons`, `__ribbon-lace`, `__ribbon-scallop` | The lace ribbon layer, its motifs and its scalloped edges |
| `.akari-fluid-wall__vine-canvas` | The vine canvas |
| `.akari-fluid-wall__veil` | The gradient under slotted text |
| `.akari-fluid-wall__body`, `__block` | The slot container and one block |

## Exports

The geometry and colour logic live in `fluid.ts` and ship with the component from the theme entry:

```ts
import {
  AkariFluidWall,
  FLUID_VARIANTS,
  FLUID_TEXTURES,
  FLUID_TEXTURE_SIZES,
  FLUID_TEXTURE_WEIGHTS,
  FLUID_VARIANT_SPECS,
  resolveFluid,
  fluidPalette,
  fluidVariant,
  fluidTexture,
  fluidTextureTone,
  fluidNumber,
  mixFluid,
  fluidLoopOffset,
  fluidLoopOffsets,
  FLUID_LOOPS,
  fluidRenderSize,
  FLUID_MAX_DPR,
  buildFluidRibbons,
  ribbonLacePitch,
  ribbonLacePath,
  ribbonScallopPath,
  ribbonScallopAmplitude,
  ribbonEdgePath,
  ribbonBandPath,
} from "vitepress-akari-theme-docs";
```

| Name | Description |
| --- | --- |
| `FLUID_VARIANTS`, `FLUID_VARIANT_SPECS` | The five variant names and each one's full spec |
| `FLUID_TEXTURES`, `FLUID_TEXTURE_SIZES`, `FLUID_TEXTURE_WEIGHTS` | The seven overlays, their tile sizes and their weights |
| `resolveFluid(variant, overrides)` | Spec as the base, explicit values on top, clamped into a `FluidVariantSpec` |
| `fluidVariant(v)`, `fluidTexture(v)` | Narrow any input to a legal enum, falling back to `silk` / `none` |
| `fluidTextureTone(tone, scheme)` | Resolves `auto` into `ink` or `light` |
| `fluidNumber(value, min, max, fallback)` | Clamp and fall back; every numeric prop goes through it |
| `fluidPalette(tokens, scheme, tone, accent)` | Turns nine colour tokens and two dials into a `FluidPalette` |
| `mixFluid(from, to, amount)` | Linear interpolation with the same semantics as GLSL `mix` |
| `FLUID_LOOPS`, `fluidLoopOffset(s, loop)`, `fluidLoopOffsets(s)` | Periods of the four closed drifts, and their phase offsets |
| `fluidRenderSize(w, h, dpr)`, `FLUID_MAX_DPR` | Canvas resolution and the 1.1M pixel budget |
| `buildFluidRibbons(w, h, seed, count)` | Ribbon geometry: endpoints, curve, width, normal axis; same seed, same set |
| `ribbonLacePitch(width)` | Lace pitch, `max(26, width × 1.45)` |
| `ribbonLacePath(ribbon)` | Florets, rings, dot pairs and notch beads as arc sub-paths |
| `ribbonScallopPath(ribbon, side)` | One scalloped edge |
| `ribbonScallopAmplitude(ribbon)` | That ribbon's scallop amplitude |
| `ribbonEdgePath(ribbon, side)`, `ribbonBandPath(ribbon)` | A one-sided polyline and the closed band outline |
| `FluidPalette`, `FluidTokens`, `FluidRibbon`, `FluidVariantSpec` | The type of each layer |

## Accessibility

- The background layers are `aria-hidden` and the canvas stays out of the accessibility tree; a screen reader only sees the slot content.
- It captures no keyboard or pointer input: `pointer-events: none` is set on the canvas and texture layers only, so buttons in a slot still work.
- With "reduce motion" on it draws the first frame and stops, so nothing flashes or drifts.
- Light and dark each have their own palette and fallback gradient, with vignette, bloom and grain tuned per scheme, so switching to light never blows out through additive light.

## Notes

- Overlays are static: they do not move with the flow. Making them move means changing the shader.
- `lace` reseeds on every mount, so ribbon positions change on refresh; the component does not expose a fixed seed.
- No external assets: textures and lace are inline SVG and paths generated at runtime, with no extra requests.
