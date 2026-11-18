import {
  FLUID_TEXTURE_SIZES,
  FLUID_VARIANT_SPECS,
  resolveFluid,
  type FluidBlendMode,
  type FluidTexture,
  type FluidVariant,
} from "./fluid";

/** The visual numbers the playground exposes as sliders. */
export interface FluidPlaygroundValues {
  scale: number;
  curl: number;
  warp: number;
  tone: number;
  petal: number;
  grid: number;
  glow: number;
  speed: number;
}

export type FluidPlaygroundLight = "start" | "center" | "end";
export type FluidPlaygroundTone = "auto" | "ink" | "light";

export interface FluidPlaygroundConfig {
  variant: FluidVariant;
  texture: FluidTexture | "auto";
  textureTone: FluidPlaygroundTone;
  light: FluidPlaygroundLight;
  height: number;
  values: FluidPlaygroundValues;
  textureSize: number;
  textureDensity: number;
  textureOpacity: number;
  textureColor: string;
  vineColors?: Partial<Record<string, string>>;
  vineBlend: FluidBlendMode;
  vinePopoutBlend?: FluidBlendMode;
  vinePopoutColors?: Partial<Record<string, string>>;
  ripple?: number;
  rippleSpeed?: number;
  rippleSize?: number;
  rippleRings?: number;
  rippleSway?: number;
  vineGlow?: number;
  shadow?: number;
  shadowSize?: number;
  shadowColor?: string;
  shadowAngle?: number;
  shadowBlur?: number;
  wallShadow?: number;
  wallShadowSize?: number;
  wallShadowColor?: string;
  wallShadowAngle?: number;
  wallShadowBlur?: number;
  underlayColor?: string;
  underlayOpacity?: number;
  underlayBlend?: string;
  mote?: number;
  moteColor?: string;
  moteBlend?: string;
  popout: boolean | "auto";
  inward: boolean | "auto";
  safeZone: string;
}

export const FLUID_PLAYGROUND_NUMERIC_KEYS = [
  "scale",
  "curl",
  "warp",
  "tone",
  "petal",
  "grid",
  "glow",
  "speed",
] as const;

export type FluidPlaygroundKey = (typeof FLUID_PLAYGROUND_NUMERIC_KEYS)[number];

const DENSITY_DEFAULT = 1;
const SAKURA_DENSITY_DEFAULT = 0.55;
const VINE_PART_ORDER = ["leaf", "flower", "flowerStem", "bud", "base", "fill", "tint", "halo", "edge", "fine"] as const;

/** CSS colour for a picker value: a hex at full opacity, or rgba when it is dimmed. */
export function fluidColorValue(hex: string, alpha: number): string {
  const value = hex.trim().replace(/^#/, "");
  const full = value.length === 3 ? value.split("").map((digit) => digit + digit).join("") : value;
  if (full.length !== 6 || !/^[0-9a-f]{6}$/i.test(full)) return hex;
  if (alpha >= 1) return `#${full.toLowerCase()}`;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.round(Math.min(1, Math.max(0, alpha)) * 100) / 100})`;
}

function formatNumber(value: number): string {
  return String(Math.round(value * 100) / 100);
}

/** Every number a variant starts with, ready to seed the sliders. */
export function fluidPlaygroundValues(variant: FluidVariant): FluidPlaygroundValues {
  const spec = FLUID_VARIANT_SPECS[variant];
  return {
    scale: spec.scale,
    curl: spec.curl,
    warp: spec.warp,
    tone: spec.tone,
    petal: spec.petal,
    grid: spec.grid,
    glow: spec.glow,
    speed: spec.speed,
  };
}

/**
 * Tile size, density and alpha an overlay starts with. A named overlay brings
 * its own alpha when the variant drew nothing above the flow.
 */
export function fluidTextureDefaults(
  variant: FluidVariant,
  texture: FluidTexture | "auto",
): Pick<FluidPlaygroundConfig, "textureSize" | "textureDensity" | "textureOpacity"> {
  const spec = FLUID_VARIANT_SPECS[variant];
  const overlay = texture === "auto" ? spec.texture : texture;
  const opacity =
    texture === "auto" || texture === spec.texture ? spec.textureOpacity : overlay === "none" ? 0 : 0.55;
  return {
    textureSize: FLUID_TEXTURE_SIZES[overlay],
    textureDensity: overlay === "sakura" ? SAKURA_DENSITY_DEFAULT : DENSITY_DEFAULT,
    textureOpacity: opacity,
  };
}

/**
 * Builds the tag snippet for the current playground state. Values still equal
 * to the variant's own starting point are left out, so the snippet only shows
 * what the reader actually changed.
 */
export function buildFluidWallSnippet(config: FluidPlaygroundConfig): string {
  const spec = FLUID_VARIANT_SPECS[config.variant];
  const overlay = config.texture === "auto" ? spec.texture : config.texture;
  const baseOpacity =
    config.texture === "auto"
      ? spec.textureOpacity
      : resolveFluid(config.variant, { texture: config.texture }).textureOpacity;
  const attrs = [`variant="${config.variant}"`];

  if (config.texture !== "auto" && config.texture !== spec.texture) {
    attrs.push(`texture="${config.texture}"`);
  }
  if (config.textureTone !== "auto") {
    attrs.push(`texture-tone="${config.textureTone}"`);
  }
  if (config.textureColor.trim()) {
    attrs.push(`texture-color="${config.textureColor.trim()}"`);
  }
  if (config.vineBlend !== "normal") {
    attrs.push(`vine-blend="${config.vineBlend}"`);
  }
  if (config.vinePopoutBlend && config.vinePopoutBlend !== config.vineBlend) {
    attrs.push(`vine-popout-blend="${config.vinePopoutBlend}"`);
  }
  if (config.ripple !== undefined && config.ripple !== 1) attrs.push(`:ripple="${formatNumber(config.ripple)}"`);
  if (config.rippleSpeed !== undefined && config.rippleSpeed !== 1) {
    attrs.push(`:ripple-speed="${formatNumber(config.rippleSpeed)}"`);
  }
  if (config.rippleSize !== undefined && config.rippleSize !== 1) attrs.push(`:ripple-size="${formatNumber(config.rippleSize)}"`);
  if (config.rippleRings !== undefined && config.rippleRings !== 2.2) {
    attrs.push(`:ripple-rings="${formatNumber(config.rippleRings)}"`);
  }
  if (config.rippleSway !== undefined && config.rippleSway !== 1) {
    attrs.push(`:ripple-sway="${formatNumber(config.rippleSway)}"`);
  }
  if (config.vineGlow !== undefined && config.vineGlow !== 1) {
    attrs.push(`:vine-glow="${formatNumber(config.vineGlow)}"`);
  }
  if (config.shadow !== undefined && config.shadow !== 1) attrs.push(`:shadow="${formatNumber(config.shadow)}"`);
  if (config.shadowSize !== undefined && config.shadowSize !== 1) attrs.push(`:shadow-size="${formatNumber(config.shadowSize)}"`);
  if (config.shadowColor && config.shadowColor !== "#12091c") attrs.push(`shadow-color="${config.shadowColor}"`);
  if (config.shadowAngle !== undefined && config.shadowAngle !== 303.5) {
    attrs.push(`:shadow-angle="${formatNumber(config.shadowAngle)}"`);
  }
  if (config.shadowBlur !== undefined && config.shadowBlur !== 6) {
    attrs.push(`:shadow-blur="${formatNumber(config.shadowBlur)}"`);
  }
  if (config.wallShadow !== undefined && config.wallShadow !== 1) {
    attrs.push(`:wall-shadow="${formatNumber(config.wallShadow)}"`);
  }
  if (config.wallShadowSize !== undefined && config.wallShadowSize !== 1) {
    attrs.push(`:wall-shadow-size="${formatNumber(config.wallShadowSize)}"`);
  }
  if (config.wallShadowColor && config.wallShadowColor !== "#12091c") {
    attrs.push(`wall-shadow-color="${config.wallShadowColor}"`);
  }
  if (config.wallShadowAngle !== undefined && config.wallShadowAngle !== 180) {
    attrs.push(`:wall-shadow-angle="${formatNumber(config.wallShadowAngle)}"`);
  }
  if (config.wallShadowBlur !== undefined && config.wallShadowBlur !== 6) {
    attrs.push(`:wall-shadow-blur="${formatNumber(config.wallShadowBlur)}"`);
  }
  if (config.underlayColor && config.underlayColor !== "#ffffff") {
    attrs.push(`underlay-color="${config.underlayColor}"`);
  }
  if (config.underlayOpacity !== undefined && config.underlayOpacity !== 0.18) {
    attrs.push(`:underlay-opacity="${formatNumber(config.underlayOpacity)}"`);
  }
  if (config.underlayBlend && config.underlayBlend !== "additive") {
    attrs.push(`underlay-blend="${config.underlayBlend}"`);
  }
  if (config.mote !== undefined && config.mote !== 1) {
    attrs.push(`:mote="${formatNumber(config.mote)}"`);
  }
  if (config.moteColor && config.moteColor !== "#ff86bf") {
    attrs.push(`mote-color="${config.moteColor}"`);
  }
  if (config.moteBlend && config.moteBlend !== "auto") {
    attrs.push(`mote-blend="${config.moteBlend}"`);
  }
  attrs.push(`height="${Math.round(config.height)}px"`);
  if (config.light !== "end") {
    attrs.push(`light="${config.light}"`);
  }

  for (const key of FLUID_PLAYGROUND_NUMERIC_KEYS) {
    if (Math.abs(config.values[key] - spec[key]) > 0.0001) {
      attrs.push(`:${key}="${formatNumber(config.values[key])}"`);
    }
  }

  if (overlay !== "none") {
    if (Math.abs(config.textureSize - FLUID_TEXTURE_SIZES[overlay]) > 0.5) {
      attrs.push(`:texture-size="${Math.round(config.textureSize)}"`);
    }
    const density = overlay === "sakura" ? SAKURA_DENSITY_DEFAULT : DENSITY_DEFAULT;
    if (Math.abs(config.textureDensity - density) > 0.001) {
      attrs.push(`:texture-density="${formatNumber(config.textureDensity)}"`);
    }
    if (Math.abs(config.textureOpacity - baseOpacity) > 0.001) {
      attrs.push(`:texture-opacity="${formatNumber(config.textureOpacity)}"`);
    }
  }

  if (overlay === "vine") {
    const paletteAttr = (
      name: string,
      palette: Partial<Record<string, string>> | undefined,
    ): void => {
      const colors = VINE_PART_ORDER.flatMap((part) => {
        const value = palette?.[part]?.trim();
        return value ? [`${part}: '${value}'`] : [];
      });
      if (colors.length) attrs.push(`:${name}="{ ${colors.join(", ")} }"`);
    };
    paletteAttr("vine-colors", config.vineColors);
    paletteAttr("vine-popout-colors", config.vinePopoutColors);
    if (config.popout !== "auto") {
      attrs.push(config.popout ? "popout" : ':popout="false"');
    }
    if (config.inward !== "auto") {
      attrs.push(config.inward ? "inward" : ':inward="false"');
    }
    const zone = config.safeZone.trim();
    if (zone && zone !== "auto") {
      attrs.push(`safe-zone="${zone}"`);
    }
  }

  const singleLine = `<AkariFluidWall ${attrs.join(" ")} />`;
  if (singleLine.length <= 96) return singleLine;
  return `<AkariFluidWall\n${attrs.map((attr) => `  ${attr}`).join("\n")}\n/>`;
}
