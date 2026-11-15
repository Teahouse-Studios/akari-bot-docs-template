---
icon: colorize
order: 1
tab: Overview
parallel:
  - api
---

# Color

All of the theme's colors come from m3e's dynamic color. You only need one seed color: `m3e-theme` generates the full set of `--md-sys-color-*` tokens from it. When you switch light and dark mode, contrast or variant, the whole palette updates together.

## Dynamic color

The seed color sets the relationship between hue and tone, and Material 3's tone mapping computes the actual lightness. So the same seed gives readable colors in both light and dark mode. The demo below generates a local palette from a teal seed:

<m3e-theme color="#006A6A">
  <div class="swatch-grid">
    <div class="swatch">
      <div class="swatch__color" style="background: var(--md-sys-color-primary)"></div>
      <code>--md-sys-color-primary</code>
    </div>
    <div class="swatch">
      <div class="swatch__color" style="background: var(--md-sys-color-primary-container)"></div>
      <code>--md-sys-color-primary-container</code>
    </div>
    <div class="swatch">
      <div class="swatch__color" style="background: var(--md-sys-color-secondary-container)"></div>
      <code>--md-sys-color-secondary-container</code>
    </div>
    <div class="swatch">
      <div class="swatch__color" style="background: var(--md-sys-color-tertiary)"></div>
      <code>--md-sys-color-tertiary</code>
    </div>
  </div>
</m3e-theme>

The site's default seed color is set in `settings.defaults.color` in the shared config. Readers can change it to a color they like in the settings. Pages with a hero use a color taken from the image; see [Hero](/theme/hero).

## Variants

The same seed color can generate a palette in different ways. The default is `tonal-spot`:

<div class="demo-row">
  <m3e-chip variant="elevated">Tonal Spot</m3e-chip>
  <m3e-chip>Vibrant</m3e-chip>
  <m3e-chip>Fidelity</m3e-chip>
  <m3e-chip>Expressive</m3e-chip>
  <m3e-chip>Monochrome</m3e-chip>
  <m3e-chip>Neutral</m3e-chip>
  <m3e-chip>Rainbow</m3e-chip>
  <m3e-chip>Fruit Salad</m3e-chip>
</div>

| Variant | Character |
| --- | --- |
| `tonal-spot` | Balanced and low in saturation; suits most documentation sites |
| `vibrant` | A more saturated primary color, with a stronger brand feel |
| `fidelity` | Stays closer to the seed color itself |
| `expressive` | Livelier hue shifts |
| `monochrome` | Drops any color cast and keeps only levels of lightness |
| `neutral` | Near-neutral surface colors |
| `rainbow` | Larger hue differences between roles |
| `fruit-salad` | The strongest hue separation; suits demos and creative uses |

## Light, dark and contrast

The same palette, mapped to light and dark:

<div class="demo-grid">
  <m3e-theme scheme="light">
    <div class="demo-surface" style="background: var(--md-sys-color-surface-container-low); color: var(--md-sys-color-on-surface);">
      <strong>Light mode</strong>
      <p>Light surfaces with dark text. Suits daytime use and projection.</p>
    </div>
  </m3e-theme>
  <m3e-theme scheme="dark">
    <div class="demo-surface" style="background: var(--md-sys-color-surface-container-low); color: var(--md-sys-color-on-surface);">
      <strong>Dark mode</strong>
      <p>Dark surfaces with light text. Suits low light and long reading sessions.</p>
    </div>
  </m3e-theme>
</div>

Contrast has three levels: Default, Medium and High. It affects the lightness difference between foreground and background, and the strength of outlines. Light and dark modes have four options; see [Settings and appearance](/theme/settings).

## Usage guidelines

- Don't hard-code colors. Always use `--md-sys-color-*` tokens or the variables of m3e components.
- Use container and content colors in pairs: `primary` with `on-primary`, `surface-container` with `on-surface`.
- Use `surface-container-lowest` through `surface-container-highest` to separate levels. Don't rely on stacked shadows.
- Use `outline-variant` for borders and dividers, and `outline` when they need emphasis. Use `error` and `error-container` for error states.
- When you need a fixed brand color, make it the seed color instead of overriding it component by component.
- Check custom backgrounds, shadows and translucent scrims separately in dark mode and high contrast.

For all color tokens, see [API](/styles/color/api).
