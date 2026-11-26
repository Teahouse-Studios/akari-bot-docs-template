import {
  argbFromHex,
  hexFromArgb,
  Hct,
  DynamicScheme,
  MaterialDynamicColors,
  type DynamicColor,
} from "../../../node_modules/@material/material-color-utilities/index.js";
import { parse } from "postcss";
import type { AcceptedPlugin } from "postcss";

import { DEFAULT_SETTINGS } from "./constants";
import type {
  AkariContrastLevel,
  AkariThemeVariant,
} from "./types";

/**
 * The boot screen paints before any m3e component exists, so it cannot read
 * the `--md-sys-color-*` palette: that palette is published by `m3e-theme`
 * at runtime. Its colors are therefore computed here, at build time, from
 * the site's theme color, and written into the stylesheet as plain hex
 * values. Nothing about the colors is left for the browser to resolve.
 */

/** mcdu's integer code for each variant; m3e maps them the same way. */
const VARIANT_CODES: Record<AkariThemeVariant, number> = {
  monochrome: 0,
  neutral: 1,
  "tonal-spot": 2,
  vibrant: 3,
  expressive: 4,
  fidelity: 5,
  rainbow: 7,
  "fruit-salad": 8,
};

const CONTRAST_LEVELS: Record<AkariContrastLevel, number> = {
  standard: 0,
  medium: 0.5,
  high: 1,
};

/** How much of the theme's primary color each surface carries. */
const BLOCK_STRENGTH = 0.1;
// The sweep has to stay readable on both canvases: dark surfaces swallow a
// small tint, so the same weight would be invisible there and muddy in light.
const SHINE_STRENGTH_LIGHT = 0.3;
const SHINE_STRENGTH_DARK = 0.24;

export interface AkariBootColors {
  background: string;
  foreground: string;
  block: string;
  shine: string;
}

export interface AkariBootPalette {
  light: AkariBootColors;
  dark: AkariBootColors;
}

export interface AkariBootColorOptions {
  /** The site's theme seed, `settings.defaults.color`. */
  seed?: string;
  /**
   * The seed the dark scheme uses when it differs from the light one: a hero
   * page can sample its light and its dark image separately. `null` means the
   * page has no dark sample of its own and the site seed applies, the way the
   * theme falls back when `resolveHeroColor` returns nothing; `undefined`
   * means the light seed is used for both.
   */
  darkSeed?: string | null;
  variant?: AkariThemeVariant;
  contrast?: AkariContrastLevel;
}

function channelToHex(value: number): string {
  return Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, "0");
}

function parseHex(color: string): [number, number, number] {
  const value = color.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

/** Mixes `color` into `base` the way CSS `color-mix(in srgb…)` does. */
function mix(base: string, color: string, weight: number): string {
  const [br, bg, bb] = parseHex(base);
  const [cr, cg, cb] = parseHex(color);
  const at = (baseChannel: number, colorChannel: number): string =>
    channelToHex(baseChannel * (1 - weight) + colorChannel * weight);
  return `#${at(br, cr)}${at(bg, cg)}${at(bb, cb)}`;
}

function schemeColors(
  seed: string,
  variant: AkariThemeVariant,
  contrast: AkariContrastLevel,
  isDark: boolean,
): AkariBootColors {
  const color = argbFromHex(seed);
  const scheme = new DynamicScheme({
    sourceColorHct: Hct.fromInt(color),
    variant: VARIANT_CODES[variant],
    contrastLevel: CONTRAST_LEVELS[contrast],
    isDark,
    // m3e builds its own palette with the 2025 spec; use the same one so the
    // boot screen and the page share a palette instead of merely a hue.
    specVersion: "2025",
  });
  const tokens = new MaterialDynamicColors();
  const hex = (color: DynamicColor): string => hexFromArgb(color.getArgb(scheme));

  const background = hex(tokens.surfaceContainerLow());
  const foreground = hex(tokens.onSurface());
  const primary = hex(tokens.primary());

  return {
    background,
    foreground,
    block: mix(background, primary, BLOCK_STRENGTH),
    shine: mix(background, primary, isDark ? SHINE_STRENGTH_DARK : SHINE_STRENGTH_LIGHT),
  };
}

/** The light and dark palettes for the boot screen, from the theme seed. */
export function akariBootPalette(
  options: AkariBootColorOptions = {},
): AkariBootPalette {
  const seed = options.seed ?? DEFAULT_SETTINGS.color;
  // `null` is "no sample for the dark scheme", so the site seed applies there
  // and the light palette is not carried over.
  const darkSeed =
    options.darkSeed === undefined
      ? seed
      : (options.darkSeed ?? DEFAULT_SETTINGS.color);
  const variant = options.variant ?? DEFAULT_SETTINGS.variant;
  const contrast = options.contrast ?? DEFAULT_SETTINGS.contrast;

  return {
    light: schemeColors(seed, variant, contrast, false),
    dark: schemeColors(darkSeed, variant, contrast, true),
  };
}

function declarations(colors: AkariBootColors): string {
  return [
    `  --akari-boot-background: ${colors.background};`,
    `  --akari-boot-foreground: ${colors.foreground};`,
    `  --akari-boot-block: ${colors.block};`,
    `  --akari-boot-shine: ${colors.shine};`,
  ].join("\n");
}

/**
 * The custom properties base.css uses, as CSS text. The reader's light or
 * dark choice only picks a row here; the colors themselves are fixed.
 */
export function akariBootColorCss(palette: AkariBootPalette): string {
  return [
    "#akari-boot {",
    declarations(palette.light),
    "}",
    "",
    "html.dark #akari-boot {",
    declarations(palette.dark),
    "}",
  ].join("\n");
}

/**
 * Appends the palette to the theme's stylesheet while it is built. PostCSS
 * runs after the `@import`s are inlined, so the tokens end up in the same
 * file as the rules that read them: no extra request, nothing for the
 * browser to resolve, and the file's hash covers the colors too.
 */
export function akariBootColors(
  options: AkariBootColorOptions = {},
): AcceptedPlugin {
  const css = akariBootColorCss(akariBootPalette(options));

  return {
    postcssPlugin: "akari-boot-colors",
    Once(root) {
      // Normalised so a Windows build (backslash paths) matches as well.
      const file = (root.source?.input.file ?? "").replaceAll("\\", "/");
      // Only the theme's own stylesheet carries the boot rules.
      if (!file.includes("/theme/styles/")) return;
      if (!root.toString().includes("#akari-boot")) return;

      // `from` silences PostCSS: without it the import resolver assumes the
      // rules have no source file and warns about asset rewriting.
      root.append(parse(css, { from: file }));
    },
  };
}
