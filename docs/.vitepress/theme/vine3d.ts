import * as THREE from "three";

import type { FluidRgb } from "./fluid";
import {
  planVineGarden,
  tangentAt,
  vineRandom,
  VINE_POP_ALL,
  VINE_POP_TILT,
  vinePopBleed,
  vineBladeOutline,
  type VineBlade,
  type VineLathe,
  type VinePlan,
  type VinePortal,
  type VineStrand,
  type VineRect,
  type VineStroke,
} from "./vinePlan";

export const VINE_DEFAULT_SEED = 20261116;
export const BOARD_SEED_EVENT = "akari-board-seed-change";
export const VINE_SEED_STORAGE_KEY = "akari-vine-seed";
export const VINE_SEED_EVENT = BOARD_SEED_EVENT;
export const VINE_POPOUT_STORAGE_KEY = "akari-vine-popout";
export const VINE_POPOUT_EVENT = "akari-vine-popout-change";

/** How far the canvas reaches past each edge of the wall, in CSS pixels. */
export type VineBleed = { readonly left: number; readonly top: number; readonly right: number; readonly bottom: number };

/** A surface layer of the vine whose colour can be set on its own. */
export type VinePart = "fill" | "tint" | "halo" | "edge" | "fine";

/** A botanical part of the vine, coloured independently from the other parts. */
export type VineBotanicalPart = "leaf" | "flower" | "bud" | "flowerStem" | "leafStem";

export type VinePartColor = { readonly color: FluidRgb; readonly alpha?: number };

/** Per-part colours; a part left out follows the base colour. `base` sets that base colour. */
export type VinePalette = Partial<Record<VinePart | VineBotanicalPart, VinePartColor>> & { base?: VinePartColor };

export type Vine3dOptions = {
  /** DOM layer composited with plus-lighter, carrying the flower bloom. */
  bloomLayer?: HTMLElement | null;
  budLayer?: HTMLElement | null;
  /** Live bloom radius multiplier driven by the debug slider. */
  bloomScale?: { value: number };
  /** Buds glow softer than blossoms; null means buds stay unlit. */
  budBloom?: { alpha: { value: number }; radius: { value: number } } | null;
  /**
   * 出屏: let a few shoots grow out past the wall. `true` opens every edge, a
   * number only the edges whose bits are set (`1 << edge`: left, top, right, bottom).
   */
  popout?: boolean | number;
  /** Corner radius of the wall in CSS pixels; the vines inside are clipped to it. */
  radius?: number;
  /**
   * 安全区: rects (wall px about its centre, y up) the vines keep clear of, so
   * whatever is written on the wall stays readable.
   */
  keep?: readonly VineRect[];
  /** Safe zones the wall vines keep out of; pop-out shoots use `keep` too. */
  wallKeep?: readonly VineRect[];
  /** Safe zones outside the wall that 出屏 shoots keep out of. */
  popKeep?: readonly VineRect[];
  /** 出屏 inward too: a few shoots come up through the wall inside it and arch toward the viewer. */
  inward?: boolean;
  /** Render the leaf fill at full strength instead of the faint default wash. */
  strongFill?: boolean;
  /** Alpha of the base colour, 0–1. */
  colorAlpha?: number;
  /** Per-part colours; a part left out follows the base colour. */
  colors?: VinePalette;
  /** Multiplier for the ripple the 出屏 portal leaves on the wall. */
  rippleStrength?: number;
  /** Multiplier for the ripple animation speed. */
  rippleSpeed?: number;
  /** Multiplier for the ripple radius around each 出屏 portal. */
  rippleSize?: number;
  /** Rings across one ripple's radius; higher values pack more waves into the same reach. */
  rippleRings?: number;
  /** Multiplier for how far a passing ripple pushes the vines. */
  rippleSway?: number;
  /** Multiplier for the pointer glow on the vines. 0 turns it off. */
  glow?: number;
  /** Opacity multiplier for the cast shadow of the 出屏 shoots. */
  shadowStrength?: number;
  /** Size multiplier for the cast shadow of the 出屏 shoots. */
  shadowSize?: number;
  /** Colour of the cast shadow. Defaults to a darkened vine fill. */
  shadowColor?: FluidRgb;
  /** Direction of the cast shadow, in degrees. 0 is +x, 90 is +y. */
  shadowAngle?: number;
  /** Direction offset of the shadow cast by vines that stay on the wall, in degrees. */
  wallShadowAngle?: number;
  /** Opacity multiplier for the shadow cast by vines that stay on the wall. */
  wallShadowStrength?: number;
  /** Size multiplier for the shadow cast by vines that stay on the wall. */
  wallShadowSize?: number;
  /** Colour of the shadow cast by vines that stay on the wall. Defaults to a darkened vine fill. */
  wallShadowColor?: FluidRgb;
  /** Blur radius of the wall shadow, in CSS pixels. */
  wallShadowBlur?: number;
  /** Blur radius of the cast shadow, in CSS pixels. 0 keeps the hard edge. */
  shadowBlur?: number;
  /** Whether the wall sits on a light page; light pages use normal-blended motes. */
  lightWall?: boolean;
  /** Colour of the additive wash beneath the vine fill. Defaults to white. */
  underlayColor?: FluidRgb;
  /** Opacity of the additive wash beneath the vine fill. Defaults to 0.18. */
  underlayOpacity?: number;
  /** Blend mode for the wash beneath the vine fill. Defaults to `additive`. */
  underlayBlend?: VineUnderlayBlend;
  /** Multiplier for the number of drifting motes. Defaults to 1. */
  mote?: number;
  /** Fixed mote colour. Defaults to a pink tint of the flower colour. */
  moteColor?: FluidRgb;
  /** Blend mode for the drifting motes. Defaults to normal on light walls, additive on dark. */
  moteBlend?: VineMoteBlend;
  /**
   * Restrict this renderer to one half of the garden. A second canvas can then
   * paint the 出屏 shoots with a different compositing mode from the wall vines.
   */
  paint?: "all" | "wall" | "pop" | "back" | "front";
  /** With `paint: "all"`, cut the 出屏 shoots at the portal so a pop layer can paint them. */
  popCut?: boolean;
};

/** One click travelling through the vines: x/y in 0–1, `t` in 0–1, reach in aspect units. */
export type VinePressState = {
  x: number;
  y: number;
  t: number;
  reach: number;
};

export type Vine3dController = {
  /** Where the canvas has to sit relative to the wall: `inset: -top -right -bottom -left`. */
  readonly bleed: VineBleed;
  /** The wall size the garden was planned for; any other size stretches that plan. */
  readonly planWidth: number;
  readonly planHeight: number;
  /** `width` × `height` is the wall's size; the canvas adds the bleed around it. */
  resize(width: number, height: number): void;
  /** `tilt` lets the lifted 出屏 shoots lean with the pointer; pass false under reduced motion. */
  setPointer(x: number, y: number, active: boolean, tilt?: boolean): void;
  setColor(color: FluidRgb, emphasis?: boolean, alpha?: number): void;
  /** Replace the per-part palette; parts left out follow the base colour. */
  setColors(colors: VinePalette, emphasis?: boolean): void;
  /** Scale the whole vine while keeping the per-part alpha ratios. */
  setOpacity(alpha: number): void;
  /** Colour and opacity of the additive wash beneath the vine fill. */
  setUnderlay(color: FluidRgb | null, opacity?: number): void;
  /** Blend mode of the wash beneath the vine fill. */
  setUnderlayBlend(mode: VineUnderlayBlend): void;
  /** Colour of the drifting motes. Pass null to derive it from the flower colour. */
  setMoteColor(color: FluidRgb | null): void;
  /** Blend mode of the drifting motes. */
  setMoteBlend(mode: VineMoteBlend): void;
  /** Light travelling outward through the vine from each click. */
  setPresses(presses: readonly VinePressState[]): void;
  /** Adjust the ripple at the 出屏 portals without rebuilding the garden. */
  setRipple(strength: number, speed: number, size: number, rings?: number, sway?: number): void;
  /** Adjust the pointer glow radius and strength without rebuilding the garden. */
  setGlow(scale: number): void;
  /** Adjust the cast shadow's opacity and size without rebuilding the garden. */
  setShadow(strength: number, size: number): void;
  /** Override the cast shadow's colour; null returns to the darkened fill. */
  setShadowColor(color: FluidRgb | null): void;
  /** Turn the cast shadow without rebuilding the garden. */
  setShadowAngle(angle: number): void;
  /** Blur the cast shadow without rebuilding the garden. */
  setShadowBlur(blur: number): void;
  /** Adjust the wall shadow's opacity and size without rebuilding the garden. */
  setWallShadow(strength: number, size: number): void;
  /** Override the wall shadow's colour; null returns to the darkened fill. */
  setWallShadowColor(color: FluidRgb | null): void;
  /** Turn the wall shadow without rebuilding the garden. */
  setWallShadowAngle(angle: number): void;
  /** Blur the wall shadow without rebuilding the garden. */
  setWallShadowBlur(blur: number): void;
  /**
   * Where the 出屏 shoots come up through the wall, in plan px about its
   * centre (y up); the wall ripples there. Scale by the warp for the wall as it is now.
   */
  readonly portals: readonly VinePortal[];
  /** `time` in seconds drives the ripples where shoots leave the wall; leave it still for reduced motion. */
  render(time?: number): void;
  /**
   * The safe zone as it is now, wall px about its centre (y up). The plan
   * already avoids the zone it was made with; vines that end up inside a
   * moved zone fade out until the next replan.
   */
  setKeep(rects: readonly VineRect[]): void;
  dispose(): void;
};

type VineHover = {
  pointer: THREE.Vector2;
  resolution: THREE.Vector2;
  radius: { value: number };
  strength: { value: number };
  /** The canvas in CSS pixels. */
  canvas: THREE.Vector2;
  /** The wall inside the canvas, CSS pixels from its bottom-left: centre x, centre y, half width, half height. */
  card: THREE.Vector4;
  /** The wall's corner radius and the width of the soft edge it is clipped with. */
  corner: THREE.Vector2;
  /** How far the wall has been stretched since the garden was planned, per axis. */
  warp: THREE.Vector2;
  /** Pointer offset from the wall's centre, -1…1 each way and eased, that lifted shoots lean away from. */
  tilt: THREE.Vector2;
  /** The authored shadow angle, restored when the pointer leaves the wall. */
  shadowAngleBase: { value: number };
  /** Click pulses lit through the vine geometry. */
  presses: THREE.Vector4[];
  pressCount: { value: number };
  /** Ripples where shoots leave the wall: centre x, centre y, radius (plan px), phase. */
  ripples: THREE.Vector4[];
  rippleCount: { value: number };
  rippleStrength: { value: number };
  rippleSpeed: { value: number };
  rippleSize: { value: number };
  rippleRings: { value: number };
  rippleSway: { value: number };
  shadowStrength: { value: number };
  shadowSize: { value: number };
  shadowAngle: { value: number };
  wallShadowStrength: { value: number };
  wallShadowSize: { value: number };
  shadowWallAngle: { value: number };
  time: { value: number };
  /** The safe zone: x0, y0, x1, y1 in wall px about its centre (y up). */
  keep: THREE.Vector4[];
  keepCount: { value: number };
};

/** Most ripples one wall draws; one per 出屏 shoot, outward and inward. */
export const VINE_MAX_RIPPLES = 12;
/** Most click pulses the vine shader carries at once. */
export const VINE_MAX_PRESSES = 6;
/** Most safe-zone rects the shader fades vines out of. */
export const VINE_MAX_KEEP = 6;
/** How far inside a safe-zone rect a vine fades out over, px. */
const VINE_KEEP_FEATHER = 8;
/** How far the wall's vines are pushed by a passing ripple, px. */
const VINE_RIPPLE_SWAY = 0.8;
/**
 * Rings across one ripple's radius, and rings passing a point per second of wall
 * time. The wall shader shares both, so its rings and the vines' sway stay in step.
 */
export const VINE_RIPPLE_RINGS = 2.2;
export const VINE_RIPPLE_SPEED = 0.16;

/** How a material draws: on the wall, as a 出屏 shoot, or as a shoot's shadow on the wall. */
const VineDepth = { Wall: 0, Pop: 1, Shadow: 2, WallShadow: 3 } as const;
type VineDepth = (typeof VineDepth)[keyof typeof VineDepth];

/** Per-vertex portal of a 出屏 shoot: x, y, z and the eye distance from `VinePortal`. */
const VINE_PORTAL = "vine_portal";

/**
 * Per-vertex point the vertex is pinned to, in plan pixels from the wall's
 * centre. When the wall is resized the garden is not replanned: every pin is
 * moved to where it lands on the stretched wall, and whatever hangs off it
 * (a leaf, a bloom, one ring of a stem) moves along rigidly, so stems
 * stretch with the wall while leaves and flowers keep their shape.
 */
const VINE_ANCHOR = "vine_anchor";

/** Per-vertex botanical part index: leaf, flower, bud, flowerStem, stem. */
const VINE_PART = "vine_part";
const VINE_PART_COUNT = 6;

export function normalizeVineSeed(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return VINE_DEFAULT_SEED;
  return Math.min(0x7fffffff, Math.max(1, Math.trunc(parsed)));
}

/**
 * Derives the vine sequence from the board seed. The board seed is the public
 * input; vines never get an independent random seed, so one value reproduces
 * the whole wall.
 */
export function deriveVineSeed(boardSeed: number): number {
  let hash = normalizeVineSeed(boardSeed) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
  hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
  hash ^= hash >>> 16;
  return (hash & 0x7fffffff) || 1;
}

let pageBoardSeed: number | null = null;

export function readBoardSeed(): number {
  if (typeof window === "undefined") return VINE_DEFAULT_SEED;
  if (pageBoardSeed === null) {
    pageBoardSeed = normalizeVineSeed(Math.floor(Math.random() * 0x7fffffff));
  }
  return pageBoardSeed;
}

/** Legacy alias; the page seed is now the board seed. */
export function readVineSeed(): number {
  return readBoardSeed();
}

export function readVinePopout(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(VINE_POPOUT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeVinePopout(value: boolean): boolean {
  const next = Boolean(value);
  if (typeof window === "undefined") return next;
  try {
    window.localStorage.setItem(VINE_POPOUT_STORAGE_KEY, next ? "1" : "0");
  } catch {
    // Storage can be blocked; the walls on this page still follow the switch.
  }
  window.dispatchEvent(new CustomEvent<boolean>(VINE_POPOUT_EVENT, { detail: next }));
  return next;
}

export function writeBoardSeed(value: unknown): number {
  const seed = normalizeVineSeed(value);
  if (typeof window === "undefined") return seed;
  pageBoardSeed = seed;
  window.dispatchEvent(new CustomEvent<number>(BOARD_SEED_EVENT, { detail: seed }));
  return seed;
}

/** Legacy alias; the page seed is now the board seed. */
export function writeVineSeed(value: unknown): number {
  return writeBoardSeed(value);
}

type VinePartUniforms = {
  readonly colors: THREE.Vector3[];
  readonly alphas: number[];
};

/**
 * Hover glow, plus the wall's outline: vines on the wall are clipped to its
 * rounded rectangle, while 出屏 shoots (`pop`) are drawn over the page too and
 * only fade out where the canvas itself ends.
 */
function attachHover(
  material: THREE.Material,
  hover: VineHover,
  depth: VineDepth,
  parts?: VinePartUniforms,
  lighten = 0,
  popLayer = false,
  popFull = false,
  popCut = false,
  shadowAngle?: { value: number },
  openClip = depth === VineDepth.Pop || depth === VineDepth.Shadow,
  mask?: THREE.Texture | null,
  shadowSize?: { value: number },
): void {
  // Shadows live outside the card too, so they use the open clip like pop-out shoots.
  const popUniform = { value: openClip ? 1 : 0 };
  const depthUniform = { value: depth };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.u_vine_pointer = { value: hover.pointer };
    shader.uniforms.u_vine_resolution = { value: hover.resolution };
    shader.uniforms.u_vine_radius = hover.radius;
    shader.uniforms.u_vine_strength = hover.strength;
    shader.uniforms.u_vine_canvas = { value: hover.canvas };
    shader.uniforms.u_vine_card = { value: hover.card };
    shader.uniforms.u_vine_corner = { value: hover.corner };
    shader.uniforms.u_vine_pop = popUniform;
    shader.uniforms.u_vine_pop_layer = { value: popLayer ? 1 : 0 };
    shader.uniforms.u_vine_pop_full = { value: popFull ? 1 : 0 };
    shader.uniforms.u_vine_pop_cut = { value: popCut ? 1 : 0 };
    shader.uniforms.u_vine_warp = { value: hover.warp };
    shader.uniforms.u_vine_depth = depthUniform;
    shader.uniforms.u_vine_tilt = { value: hover.tilt };

    shader.uniforms.u_vine_ripples = { value: hover.ripples };
    shader.uniforms.u_vine_ripple_count = hover.rippleCount;
    shader.uniforms.u_vine_ripple_strength = hover.rippleStrength;
    shader.uniforms.u_vine_ripple_speed = hover.rippleSpeed;
    shader.uniforms.u_vine_ripple_size = hover.rippleSize;
    shader.uniforms.u_vine_ripple_rings = hover.rippleRings;
    shader.uniforms.u_vine_ripple_sway = hover.rippleSway;
    shader.uniforms.u_vine_shadow_size = shadowSize ?? hover.shadowSize;
    shader.uniforms.u_vine_shadow_angle = shadowAngle ?? hover.shadowAngle;
    shader.uniforms.u_vine_mask = { value: mask ?? null };
    shader.uniforms.u_vine_mask_on = { value: mask ? 1 : 0 };
    shader.uniforms.u_vine_presses = { value: hover.presses };
    shader.uniforms.u_vine_press_count = hover.pressCount;
    shader.uniforms.u_vine_time = hover.time;
    shader.uniforms.u_vine_part_colors = { value: parts?.colors ?? Array.from({ length: VINE_PART_COUNT }, () => new THREE.Vector3()) };
    shader.uniforms.u_vine_part_alphas = { value: parts?.alphas ?? Array.from({ length: VINE_PART_COUNT }, () => 1) };
    shader.uniforms.u_vine_lighten = { value: lighten };
    shader.uniforms.u_vine_use_parts = { value: parts ? 1 : 0 };
    material.userData.vineLighten = shader.uniforms.u_vine_lighten;
    material.userData.vineUseParts = shader.uniforms.u_vine_use_parts;
    material.userData.vinePartColors = shader.uniforms.u_vine_part_colors;
    shader.uniforms.u_vine_keep = { value: hover.keep };
    shader.uniforms.u_vine_keep_count = hover.keepCount;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute vec2 ${VINE_ANCHOR};
attribute vec4 ${VINE_PORTAL};
attribute float ${VINE_PART};
attribute float aPopSide;
uniform vec2 u_vine_warp;
uniform float u_vine_depth;
uniform vec2 u_vine_tilt;
uniform vec4 u_vine_ripples[${VINE_MAX_RIPPLES}];
uniform int u_vine_ripple_count;
uniform float u_vine_time;
uniform float u_vine_ripple_strength;
uniform float u_vine_ripple_speed;
uniform float u_vine_ripple_size;
uniform float u_vine_ripple_rings;
uniform float u_vine_ripple_sway;
uniform float u_vine_shadow_size;
uniform float u_vine_shadow_angle;
uniform vec4 u_vine_card;
uniform vec4 u_vine_presses[${VINE_MAX_PRESSES}];
uniform int u_vine_press_count;
varying float vVineLift;
varying float vVineShade;
varying float vShadowFocus;
varying float vVinePart;
varying float vVinePopMix;
varying float vVinePopSide;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
vVinePart = ${VINE_PART};
transformed.xy += (u_vine_warp - 1.0) * ${VINE_ANCHOR};
// 出屏 shoots rise off the wall past their portal; everything else lies on it.
float vineEye = max(${VINE_PORTAL}.w, 1.0);
float vineUp = u_vine_depth > 0.5 ? clamp(transformed.z - ${VINE_PORTAL}.z, 0.0, vineEye * 0.6) : 0.0;
vVineLift = vineUp / (vineEye * 0.6);
vVineShade = smoothstep(0.0, 12.0, vineUp);
vVinePopMix = smoothstep(0.0, 0.015, vineUp);
vVinePopSide = aPopSide;
// What lies on the wall sways as the ripples where shoots leave it pass.
float vineFlat = 1.0 - smoothstep(0.0, 6.0, vineUp);
for (int i = 0; i < ${VINE_MAX_RIPPLES}; i++) {
  if (i >= u_vine_ripple_count) break;
  vec4 vineRipple = u_vine_ripples[i];
  vec2 vineFrom = transformed.xy - vineRipple.xy * u_vine_warp;
  float vineDist = length(vineFrom);
  float vineX = vineDist / max(vineRipple.z * u_vine_ripple_size, 0.001);
  if (vineX < 1.0 && vineDist > 0.01) {
    float vineEnv = (1.0 - vineX) * (1.0 - vineX) * smoothstep(0.0, 0.2, vineX);
    float vineWave = sin(PI2 * (vineX * u_vine_ripple_rings - u_vine_time * u_vine_ripple_speed) + vineRipple.w);
    transformed.xy += vineFrom / vineDist * vineWave * vineEnv * vineFlat * u_vine_ripple_sway * u_vine_ripple_strength;
  }
}
vec2 vinePortalAt = ${VINE_PORTAL}.xy * u_vine_warp;
vShadowFocus = 1.0;
if (u_vine_depth > 2.5) {
  // Vines pinned to the board cast a short shadow along their own refraction angle.
  float shadowAngle = radians(u_vine_shadow_angle);
  vec2 shadowDir = vec2(cos(shadowAngle), sin(shadowAngle));
  transformed.xy += shadowDir * (2.0 + u_vine_shadow_size * 2.0);
  transformed.xy += u_vine_tilt * 2.0;
} else if (u_vine_depth > 1.5) {
  // The shadow falls on the wall, away from the key light at the upper left.
  float vineShadowDistance = length(transformed.xy - vinePortalAt) / max(u_vine_card.w * 2.0, 1.0);
  vShadowFocus = 1.0 - smoothstep(0.08, 0.65, vineShadowDistance);
  float shadowScale = 1.0 + (u_vine_shadow_size - 1.0) * 0.12;
  transformed.xy = vinePortalAt + (transformed.xy - vinePortalAt) * shadowScale;
  float shadowAngle = radians(u_vine_shadow_angle);
  vec2 shadowDir = vec2(cos(shadowAngle), sin(shadowAngle));
  transformed.xy += shadowDir * vineUp * 0.5 * (0.9 + 0.1 * u_vine_shadow_size);
  transformed.xy -= u_vine_tilt * vineUp * ${VINE_POP_TILT.toFixed(3)};
} else if (u_vine_depth > 0.5) {
  // Seen from the eye in front of the portal, so what comes closer grows,
  // and it leans away from the pointer as if the view tilted with it.
  transformed.xy = vinePortalAt + (transformed.xy - vinePortalAt) * vineEye / (vineEye - vineUp);
  transformed.xy -= u_vine_tilt * vineUp * ${VINE_POP_TILT.toFixed(3)};
} else {
  // Wall vines sway a little with the pointer, staying rooted to the board.
  transformed.xy += u_vine_tilt * 2.0;
}`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
if (u_vine_mask_on > 0.5 && texture2D(u_vine_mask, gl_FragCoord.xy / u_vine_resolution).a > 0.02) discard;
if (u_vine_pop_layer > 0.5 && vVinePopSide < 0.5) discard;
if (u_vine_pop_cut > 0.5 && vVinePopSide > 0.5) discard;
if (u_vine_use_parts > 0.5) {
  int vinePart = int(vVinePart + 0.5);
  diffuseColor.rgb = mix(u_vine_part_colors[vinePart], vec3(1.0), u_vine_lighten);
  diffuseColor.a *= u_vine_part_alphas[vinePart];
}`,
      )
      .replace(
        "#include <common>",
        `#include <common>
uniform vec2 u_vine_pointer;
uniform vec2 u_vine_resolution;
uniform float u_vine_radius;
uniform float u_vine_strength;
uniform vec2 u_vine_canvas;
uniform vec4 u_vine_card;
uniform vec2 u_vine_corner;
uniform float u_vine_pop;
uniform float u_vine_depth;
uniform sampler2D u_vine_mask;
uniform float u_vine_mask_on;
uniform vec4 u_vine_keep[${VINE_MAX_KEEP}];
uniform int u_vine_keep_count;
uniform vec4 u_vine_presses[${VINE_MAX_PRESSES}];
uniform int u_vine_press_count;
uniform vec3 u_vine_part_colors[${VINE_PART_COUNT}];
uniform float u_vine_part_alphas[${VINE_PART_COUNT}];
uniform float u_vine_lighten;
uniform float u_vine_use_parts;
uniform float u_vine_pop_layer;
uniform float u_vine_pop_full;
uniform float u_vine_pop_cut;
varying float vVineLift;
varying float vVineShade;
varying float vShadowFocus;
varying float vVinePart;
varying float vVinePopMix;
varying float vVinePopSide;`,
      )
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
if (u_vine_pop_layer > 0.5 && vVinePopSide < 0.5) discard;
if (u_vine_pop_cut > 0.5 && vVinePopSide > 0.5) discard;`,
      )
      .replace(
        "#include <opaque_fragment>",
        `float vinePressLight = 0.0;
for (int i = 0; i < ${VINE_MAX_PRESSES}; i++) {
  if (i >= u_vine_press_count) break;
  vec4 vinePress = u_vine_presses[i];
  // The vine canvas includes the bleed around the wall, so both the click and
  // the fragment are mapped through the card rectangle instead of the canvas.
  vec2 vineCanvasPos = gl_FragCoord.xy / u_vine_resolution * u_vine_canvas;
  vec2 vinePressAt = u_vine_card.xy + (vec2(vinePress.x, vinePress.y) - 0.5) * u_vine_card.zw * 2.0;
  float vinePressDist = distance(vineCanvasPos, vinePressAt);
  float vinePressT = clamp(vinePress.z, 0.0, 1.0);
  float vinePressGrow = (1.0 - pow(1.0 - vinePressT, 2.0)) * 1.6;
  float vinePressRadius = max(vinePress.w * u_vine_card.w * 2.0, 1.0) * 1.15 * (0.03 + 0.97 * vinePressGrow);
  float vinePressWidth = max(0.22 * u_vine_card.w * 2.0 * (0.5 + 0.5 * vinePressGrow), 1.0);
  float vinePressFade = pow(1.0 - vinePressT, 0.35);
  vinePressLight += exp(-pow((vinePressDist - vinePressRadius) / vinePressWidth, 2.0)) * vinePressFade;
}
float vinePressAmount = clamp(vinePressLight, 0.0, 1.0);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), vinePressAmount * 0.55);
diffuseColor.a = min(1.0, diffuseColor.a + vinePressAmount * 0.3);
if (u_vine_depth > 1.5) {
  diffuseColor.a *= mix(0.2, 1.0, vShadowFocus);
}
float vineDistance = distance(
  gl_FragCoord.xy,
  vec2(u_vine_pointer.x * u_vine_resolution.x, (1.0 - u_vine_pointer.y) * u_vine_resolution.y)
);
float vineGlow = 1.0 - smoothstep(u_vine_radius * 0.18, u_vine_radius, vineDistance);
if (u_vine_depth > 1.5) {
  // The pointer glow lifts the vine; shadows must thin out instead of
  // multiplying under the same light.
  diffuseColor.a *= max(0.0, 1.0 - vineGlow * u_vine_strength * 0.65);
} else {
  diffuseColor.a *= 1.0 + vineGlow * u_vine_strength;
}
vec2 vineAt = gl_FragCoord.xy / u_vine_resolution * u_vine_canvas;
vec2 vineCorner = abs(vineAt - u_vine_card.xy) - (u_vine_card.zw - u_vine_corner.x);
float vineCard = length(max(vineCorner, 0.0)) + min(max(vineCorner.x, vineCorner.y), 0.0) - u_vine_corner.x;
float vineInside = 1.0 - smoothstep(-u_vine_corner.y, u_vine_corner.y, vineCard);
vec2 vineRim = min(vineAt, u_vine_canvas - vineAt);
float vineOpen = smoothstep(0.0, 6.0, min(vineRim.x, vineRim.y));
diffuseColor.a *= mix(mix(vineInside, vineOpen, u_vine_pop), 1.0, u_vine_pop_full);
// Only shoots that leave the wall avoid the wall safe zone; wall vines grow freely.
if (u_vine_depth > 0.5 && u_vine_depth < 2.5) {
  vec2 vineLocal = vineAt - u_vine_card.xy;
  float vineKeep = 1e5;
  for (int i = 0; i < ${VINE_MAX_KEEP}; i++) {
    if (i >= u_vine_keep_count) break;
    vec4 vineRect = u_vine_keep[i];
    vec2 vineBox = abs(vineLocal - (vineRect.xy + vineRect.zw) * 0.5) - (vineRect.zw - vineRect.xy) * 0.5;
    vineKeep = min(vineKeep, length(max(vineBox, 0.0)) + min(max(vineBox.x, vineBox.y), 0.0));
  }
  diffuseColor.a *= smoothstep(-${VINE_KEEP_FEATHER.toFixed(1)}, 0.0, vineKeep);
}
if (u_vine_depth > 1.5 && u_vine_depth < 2.5) {
  // A shadow is only there once the shoot is off the wall, and blurs away as it rises.
  diffuseColor.a *= vVineShade * (1.0 - 0.6 * vVineLift);
} else if (u_vine_depth > 0.5) {
  // Nearer reads stronger.
  diffuseColor.a *= 1.0 + 0.55 * vVineLift;
}
#include <opaque_fragment>`,
      );
  };
  material.customProgramCacheKey = () => `akari-vine-hover-${popLayer ? 1 : 0}-${popFull ? 1 : 0}-${popCut ? 1 : 0}`;
  material.needsUpdate = true;
}

function colorFromRgb(color: FluidRgb): THREE.Color {
  return new THREE.Color(color[0], color[1], color[2]);
}

/* ------------------------------------------------------------------------ */
/* Meshing                                                                   */
/* ------------------------------------------------------------------------ */

const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 0, 1);

/** Triangles for one material, gathered from every part of a vine. */
class MeshSink {
  readonly positions: number[] = [];
  readonly indices: number[] = [];
  /** Where each vertex is pinned to the wall; see {@link VINE_ANCHOR}. */
  readonly anchors: number[] = [];
  /** The pin for the vertices that follow; `null` pins each vertex to itself. */
  anchor: THREE.Vector3 | null = null;
  /** Botanical part index stamped onto each vertex. */
  part = 0;
  readonly parts: number[] = [];
  /** 1 for vertices after the portal, 0 for wall-side vertices. */
  side = 0;
  readonly sides: number[] = [];

  get size(): number {
    return this.positions.length / 3;
  }

  vertex(point: THREE.Vector3): number {
    const pin = this.anchor ?? point;
    this.positions.push(point.x, point.y, point.z);
    this.anchors.push(pin.x, pin.y);
    this.parts.push(this.part);
    this.sides.push(this.side);
    return this.size - 1;
  }

  positionAt(index: number): THREE.Vector3 {
    return new THREE.Vector3(this.positions[index * 3], this.positions[index * 3 + 1], this.positions[index * 3 + 2]);
  }

  triangle(a: number, b: number, c: number): void {
    this.indices.push(a, b, c);
  }

  quad(a: number, b: number, c: number, d: number): void {
    this.indices.push(a, b, c, a, c, d);
  }

  geometry(): THREE.BufferGeometry | null {
    if (!this.indices.length) return null;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.positions, 3));
    geometry.setAttribute(VINE_ANCHOR, new THREE.Float32BufferAttribute(this.anchors, 2));
    geometry.setAttribute(VINE_PART, new THREE.Float32BufferAttribute(this.parts, 1));
    geometry.setAttribute("aPopSide", new THREE.Float32BufferAttribute(this.sides, 1));
    geometry.setIndex(this.indices);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
  }
}

/** Line segments for one material. */
class LineSink {
  readonly positions: number[] = [];
  readonly anchors: number[] = [];
  readonly parts: number[] = [];
  readonly sides: number[] = [];
  anchor: THREE.Vector3 | null = null;
  part = 0;
  side = 0;

  segment(a: THREE.Vector3, b: THREE.Vector3): void {
    const pinA = this.anchor ?? a;
    const pinB = this.anchor ?? b;
    this.positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    this.anchors.push(pinA.x, pinA.y, pinB.x, pinB.y);
    this.parts.push(this.part, this.part);
    this.sides.push(this.side, this.side);
  }

  polyline(points: readonly THREE.Vector3[], closed = false): void {
    for (let index = 1; index < points.length; index += 1) this.segment(points[index - 1]!, points[index]!);
    if (closed && points.length > 2) this.segment(points[points.length - 1]!, points[0]!);
  }

  geometry(): THREE.BufferGeometry | null {
    if (!this.positions.length) return null;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.positions, 3));
    geometry.setAttribute(VINE_ANCHOR, new THREE.Float32BufferAttribute(this.anchors, 2));
    geometry.setAttribute(VINE_PART, new THREE.Float32BufferAttribute(this.parts, 1));
    geometry.setAttribute("aPopSide", new THREE.Float32BufferAttribute(this.sides, 1));
    geometry.computeBoundingSphere();
    return geometry;
  }
}

/** Pins everything the sinks receive next to one point, or each vertex to itself with `null`. */
function pin(sinks: VineSinks, anchor: THREE.Vector3 | null): void {
  sinks.tube.anchor = sinks.organ.anchor = sinks.halo.anchor = anchor;
  sinks.edge.anchor = sinks.fine.anchor = anchor;
}

interface VineSinks {
  /** Stems and stalks: the light inner body. */
  readonly tube: MeshSink;
  /** Blades and turned bodies, drawn twice: a tint and the light body. */
  readonly organ: MeshSink;
  /** Slightly fatter copies of the tubes, which read as their outline. */
  readonly halo: MeshSink;
  readonly edge: LineSink;
  readonly fine: LineSink;
}

export interface VineGeometry {
  readonly tube: THREE.BufferGeometry | null;
  readonly organ: THREE.BufferGeometry | null;
  readonly halo: THREE.BufferGeometry | null;
  readonly edge: THREE.BufferGeometry | null;
  readonly fine: THREE.BufferGeometry | null;
}

/** Halo radius against the body's: wide enough to read, never a blob. */
const HALO_SCALE = 1.3;
const HALO_PAD = 0.3;

/**
 * A tube along the strand. Frames are carried along by parallel transport,
 * so the surface never twists where the centre line turns, and the radius is
 * the strand's own at every ring, so tapers and swellings stay smooth.
 */
function tube(sink: MeshSink, strand: VineStrand, scale: number, pad: number, portalFrom?: number): void {
  const { points, radii } = strand;
  const count = points.length;
  if (count < 2) return;
  const tangents = points.map((_, index) => tangentAt(points, index));
  const widest = Math.max(...radii) * scale + pad;
  const segments = THREE.MathUtils.clamp(Math.round(5 + widest * 1.3), 6, 12);
  const first = tangents[0]!;
  const normal = new THREE.Vector3().crossVectors(first, Math.abs(first.z) < 0.9 ? UP : new THREE.Vector3(1, 0, 0)).normalize();
  const binormal = new THREE.Vector3();
  const axis = new THREE.Vector3();
  const vertex = new THREE.Vector3();
  const base = sink.size;
  for (let index = 0; index < count; index += 1) {
    const tangent = tangents[index]!;
    if (index > 0) {
      axis.crossVectors(tangents[index - 1]!, tangent);
      const sin = axis.length();
      if (sin > 1e-6) normal.applyAxisAngle(axis.divideScalar(sin), Math.atan2(sin, tangents[index - 1]!.dot(tangent)));
      normal.addScaledVector(tangent, -normal.dot(tangent)).normalize();
    }
    binormal.crossVectors(tangent, normal);
    const radius = radii[index]! * scale + pad;
    // Each ring rides on its own centre point, so a stretched stem keeps its girth.
    sink.anchor = points[index]!;
    sink.side = portalFrom !== undefined && index >= portalFrom ? 1 : 0;
    for (let segment = 0; segment < segments; segment += 1) {
      const angle = (segment / segments) * TAU;
      vertex
        .copy(points[index]!)
        .addScaledVector(normal, Math.cos(angle) * radius)
        .addScaledVector(binormal, Math.sin(angle) * radius);
      sink.vertex(vertex);
    }
  }
  for (let index = 0; index < count - 1; index += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const next = (segment + 1) % segments;
      sink.quad(
        base + index * segments + segment,
        base + index * segments + next,
        base + (index + 1) * segments + next,
        base + (index + 1) * segments + segment,
      );
    }
  }
  sink.anchor = points[0]!;
  const startCentre = sink.vertex(points[0]!);
  for (let segment = 0; segment < segments; segment += 1) {
    sink.triangle(startCentre, base + ((segment + 1) % segments), base + segment);
  }
  const lastRing = base + (count - 1) * segments;
  const end = points[count - 1]!;
  const endTangent = tangents[count - 1]!;
  const endRadius = radii[count - 1]! * scale + pad;
  sink.anchor = end;
  if (strand.end === "round") {
    // A short dome rather than a cut: a stalk end that shows should look grown.
    const ringStart = sink.size;
    for (let segment = 0; segment < segments; segment += 1) {
      const offset = sink.positionAt(lastRing + segment).sub(end).multiplyScalar(0.72);
      sink.vertex(offset.add(end).addScaledVector(endTangent, endRadius * 0.55));
    }
    for (let segment = 0; segment < segments; segment += 1) {
      const next = (segment + 1) % segments;
      sink.quad(lastRing + segment, lastRing + next, ringStart + next, ringStart + segment);
    }
    const tip = sink.vertex(end.clone().addScaledVector(endTangent, endRadius * 0.92));
    for (let segment = 0; segment < segments; segment += 1) {
      sink.triangle(ringStart + segment, ringStart + ((segment + 1) % segments), tip);
    }
  } else {
    const reach = strand.end === "point" ? endRadius * 0.8 : 0;
    const tip = sink.vertex(end.clone().addScaledVector(endTangent, reach));
    for (let segment = 0; segment < segments; segment += 1) {
      sink.triangle(lastRing + segment, lastRing + ((segment + 1) % segments), tip);
    }
  }
  sink.anchor = null;
}

/** A point on a blade, from its own flat coordinates (length 1) into the wall. */
function bladePoint(blade: VineBlade, centre: number, x: number, y: number): THREE.Vector3 {
  const { spec } = blade;
  let lift = spec.fold * Math.abs(y) + spec.bend * x * x + spec.cup * y * y;
  if (spec.ruffle) {
    const reach = Math.hypot(x - centre, y);
    lift += spec.ruffle * Math.sin(Math.atan2(y, x - centre) * 9) * reach * reach * 2.5;
  }
  const twist = spec.twist * x;
  const across = y * Math.cos(twist) - lift * Math.sin(twist);
  const out = y * Math.sin(twist) + lift * Math.cos(twist);
  return blade.origin
    .clone()
    .addScaledVector(blade.x, x * spec.length)
    .addScaledVector(blade.y, across * spec.length)
    .addScaledVector(blade.n, out * spec.length);
}

function halfWidthAt(upper: ReadonlyArray<readonly [number, number]>, x: number): number {
  for (let index = 1; index < upper.length; index += 1) {
    const [x0, y0] = upper[index - 1]!;
    const [x1, y1] = upper[index]!;
    if ((x0 - x) * (x1 - x) <= 0 && x0 !== x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return 0;
}

/**
 * A blade as rings shrinking from its outline to a centre on the midrib, so it
 * can bend and fold smoothly; the outline, midrib and veins are drawn as lines
 * on the same surface.
 */
function blade(sinks: VineSinks, item: VineBlade): void {
  const { spec } = item;
  const samples = spec.length > 26 ? 20 : spec.length > 12 ? 15 : 10;
  const outline = vineBladeOutline(spec.shape, samples);
  const upper = outline.upper.map(([x, y]) => [x, y * spec.width] as const);
  const loop: Array<readonly [number, number]> = [...upper];
  for (let index = upper.length - 2; index >= 1; index -= 1) {
    const [x, y] = upper[index]!;
    loop.push([x, -y * spec.asymmetry]);
  }
  const centre = outline.center;
  const rings = spec.length > 22 ? 4 : 3;
  const sink = sinks.organ;
  const centreIndex = sink.vertex(bladePoint(item, centre, centre, 0));
  const ringStarts: number[] = [];
  const margin: THREE.Vector3[] = [];
  for (let ring = 1; ring <= rings; ring += 1) {
    const amount = ring / rings;
    ringStarts.push(sink.size);
    for (const [x, y] of loop) {
      const point = bladePoint(item, centre, centre + (x - centre) * amount, y * amount);
      sink.vertex(point);
      if (ring === rings) margin.push(point);
    }
  }
  const size = loop.length;
  for (let index = 0; index < size; index += 1) {
    sink.triangle(centreIndex, ringStarts[0]! + index, ringStarts[0]! + ((index + 1) % size));
  }
  for (let ring = 1; ring < rings; ring += 1) {
    const inner = ringStarts[ring - 1]!;
    const outer = ringStarts[ring]!;
    for (let index = 0; index < size; index += 1) {
      const next = (index + 1) % size;
      sink.quad(inner + index, outer + index, outer + next, inner + next);
    }
  }
  sinks.edge.polyline(margin, true);

  const tipX = upper[0]![0];
  if (spec.midrib) {
    const reach = spec.venation === "fan" ? 0.6 : 0.96;
    const midrib = Array.from({ length: 9 }, (_, index) => bladePoint(item, centre, (index / 8) * tipX * reach, 0));
    sinks.fine.polyline(midrib);
  }
  if (spec.veins > 0) {
    for (let vein = 1; vein <= spec.veins; vein += 1) {
      for (const side of [1, -1]) {
        const share = vein / (spec.veins + 1);
        let start: readonly [number, number];
        let end: readonly [number, number];
        if (spec.venation === "fan") {
          const x = 0.5 + 0.35 * Math.sin(share * Math.PI);
          start = [0.04, 0];
          end = [x, halfWidthAt(upper, x) * (0.2 + 1.3 * share) * 0.62];
        } else {
          const x = 0.1 + share * 0.66;
          const reachX = Math.min(tipX * 0.94, x + 0.2);
          start = [x, 0];
          end = [reachX, halfWidthAt(upper, reachX) * 0.84];
        }
        const scale = side > 0 ? 1 : -spec.asymmetry;
        const control: readonly [number, number] = [start[0] + (end[0] - start[0]) * 0.3, end[1] * 0.62];
        const points = Array.from({ length: 5 }, (_, index) => {
          const t = index / 4;
          const u = 1 - t;
          const x = u * u * start[0] + 2 * u * t * control[0] + t * t * end[0];
          const y = u * u * start[1] + 2 * u * t * control[1] + t * t * end[1];
          return bladePoint(item, centre, x, y * scale);
        });
        sinks.fine.polyline(points);
      }
    }
  }
}

/**
 * Where a turned body's surface runs edge-on to the viewer, row by row: the
 * outline a pencil would draw. Its normal is the radial direction tipped back
 * by the profile's slope, so the edge sits at the two angles where that normal
 * has no component towards the camera. Seen end-on there is no such angle,
 * and the widest row is the outline instead.
 */
function silhouette(
  sink: LineSink,
  item: VineLathe,
  axis: THREE.Vector3,
  e1: THREE.Vector3,
  e2: THREE.Vector3,
  point: (row: number, theta: number) => THREE.Vector3,
): void {
  const { rows } = item;
  const a = e1.z;
  const b = e2.z;
  const reach = Math.hypot(a, b);
  const phase = Math.atan2(b, a);
  if (reach < 0.3) {
    let widest = 0;
    rows.forEach(([, radius], row) => {
      if (radius > rows[widest]![1]) widest = row;
    });
    sink.polyline(Array.from({ length: 32 }, (_, index) => point(widest, (index / 32) * TAU)), true);
    return;
  }
  for (const branch of [1, -1]) {
    let run: THREE.Vector3[] = [];
    for (let row = 0; row < rows.length; row += 1) {
      const before = rows[Math.max(0, row - 1)]!;
      const after = rows[Math.min(rows.length - 1, row + 1)]!;
      const slope = (after[1] - before[1]) / Math.max(1e-6, after[0] - before[0]);
      const ratio = (slope * axis.z) / reach;
      if (Math.abs(ratio) > 1 || rows[row]![1] <= 0) {
        if (run.length > 1) sink.polyline(run);
        run = [];
        continue;
      }
      run.push(point(row, phase + branch * Math.acos(ratio)));
    }
    if (run.length > 1) sink.polyline(run);
  }
}

/** A turned body around an axis, with lobes, fluting and seams for buds and corollas. */
function lathe(sinks: VineSinks, item: VineLathe): void {
  const { rows } = item;
  const axis = item.axis.clone().normalize();
  const e1 = item.ref.clone().addScaledVector(axis, -item.ref.dot(axis)).normalize();
  const e2 = new THREE.Vector3().crossVectors(axis, e1);
  const rim = Math.max(...rows.map(([, radius]) => radius));
  const segments = item.role === "corolla" ? 40 : item.role === "bud" ? 22 : 14;
  const point = (row: number, theta: number, pad = 0): THREE.Vector3 => {
    const [height, radius] = rows[row]!;
    const share = Math.pow(row / (rows.length - 1), 4);
    const lobe = item.lobes ? Math.cos(item.lobes * theta) * share : 0;
    const r = radius * (1 + item.lobeDepth * lobe) + (radius > 0 ? pad : 0);
    return item.origin
      .clone()
      .addScaledVector(axis, height + item.flute * rim * lobe)
      .addScaledVector(e1, Math.cos(theta) * r)
      .addScaledVector(e2, Math.sin(theta) * r);
  };
  const surface = (sink: MeshSink, pad: number) => {
    const base = sink.size;
    for (let row = 0; row < rows.length; row += 1) {
      for (let segment = 0; segment < segments; segment += 1) sink.vertex(point(row, (segment / segments) * TAU, pad));
    }
    for (let row = 0; row < rows.length - 1; row += 1) {
      for (let segment = 0; segment < segments; segment += 1) {
        const next = (segment + 1) % segments;
        sink.quad(
          base + row * segments + segment,
          base + row * segments + next,
          base + (row + 1) * segments + next,
          base + (row + 1) * segments + segment,
        );
      }
    }
  };
  surface(sinks.organ, 0);
  if (item.outline) silhouette(sinks.edge, item, axis, e1, e2, point);
  if (item.rim) {
    const last = rows.length - 1;
    sinks.edge.polyline(
      Array.from({ length: segments * 2 }, (_, index) => point(last, (index / (segments * 2)) * TAU)),
      true,
    );
  }
  for (let seam = 0; seam < item.seams; seam += 1) {
    const start = Math.round(item.seamFrom * (rows.length - 1));
    const points: THREE.Vector3[] = [];
    for (let row = start; row < rows.length; row += 1) {
      const amount = row / (rows.length - 1);
      const theta = item.seamOffset + (seam / item.seams) * TAU + item.seamTwist * TAU * amount;
      points.push(point(row, theta, 0.05));
    }
    sinks.fine.polyline(points);
  }
}

function stroke(sinks: VineSinks, item: VineStroke): void {
  sinks.fine.polyline(item.points);
  if (item.dot <= 0) return;
  const tip = item.points[item.points.length - 1]!;
  const ring = Array.from({ length: 6 }, (_, index) => {
    const angle = (index / 6) * TAU;
    return tip.clone().add(new THREE.Vector3(Math.cos(angle) * item.dot, Math.sin(angle) * item.dot, 0));
  });
  sinks.edge.polyline(ring, true);
}

/** Meshes one vine: a handful of geometries, whatever the number of parts. */
export function buildVineGeometry(plan: VinePlan): VineGeometry {
  const sinks: VineSinks = {
    tube: new MeshSink(),
    organ: new MeshSink(),
    halo: new MeshSink(),
    edge: new LineSink(),
    fine: new LineSink(),
  };
  const strandPart = (role: (typeof plan.strands)[number]["role"]): number =>
    role === "pedicel" ? 3 : role === "petiole" ? 5 : 4;
  const bladePart = (role: (typeof plan.blades)[number]["role"]): number => (role === "petal" || role === "sepal" ? 1 : 0);
  const lathePart = (role: (typeof plan.lathes)[number]["role"]): number => (role === "bud" ? 2 : 1);
  const setPart = (part: number): void => {
    sinks.tube.part = sinks.organ.part = sinks.halo.part = part;
    sinks.edge.part = sinks.fine.part = part;
  };
  const setSide = (side: number): void => {
    sinks.tube.side = sinks.organ.side = sinks.halo.side = side;
    sinks.edge.side = sinks.fine.side = side;
  };
  const portalFrom = plan.portal?.from;
  const portalSide = (origin: THREE.Vector3 | undefined): number =>
    plan.portal && origin && origin.z > plan.portal.z + 0.01 ? 1 : 0;
  for (const strand of plan.strands) {
    setPart(strandPart(strand.role));
    tube(sinks.tube, strand, 1, 0, portalFrom);
    tube(sinks.halo, strand, HALO_SCALE, HALO_PAD, portalFrom);
  }
  // Leaves, flowers, tendrils and stamens are pinned whole at their base, so a
  // stretched wall moves them with their stem but never squashes them.
  for (const item of plan.blades) {
    setPart(bladePart(item.role));
    setSide(portalSide(item.origin));
    pin(sinks, item.origin);
    blade(sinks, item);
  }
  for (const item of plan.lathes) {
    setPart(lathePart(item.role));
    setSide(portalSide(item.origin));
    pin(sinks, item.origin);
    lathe(sinks, item);
  }
  for (const item of plan.strokes) {
    setPart(1);
    setSide(portalSide(item.points[0]));
    pin(sinks, item.points[0] ?? null);
    stroke(sinks, item);
  }
  pin(sinks, null);
  return {
    tube: sinks.tube.geometry(),
    organ: sinks.organ.geometry(),
    halo: sinks.halo.geometry(),
    edge: sinks.edge.geometry(),
    fine: sinks.fine.geometry(),
  };
}

/* ------------------------------------------------------------------------ */
/* Scene                                                                     */
/* ------------------------------------------------------------------------ */

export type VineUnderlayBlend = "normal" | "additive" | "screen" | "multiply" | "subtractive";
export type VineMoteBlend = VineUnderlayBlend;

const UNDERLAY_BLENDING: Record<VineUnderlayBlend, THREE.Blending> = {
  normal: THREE.NormalBlending,
  additive: THREE.AdditiveBlending,
  screen: THREE.AdditiveBlending,
  multiply: THREE.MultiplyBlending,
  subtractive: THREE.SubtractiveBlending,
};

type LayerMaterials = {
  underlay: THREE.MeshBasicMaterial;
  fill: THREE.MeshBasicMaterial;
  tint: THREE.MeshBasicMaterial;
  halo: THREE.MeshBasicMaterial;
  edge: THREE.LineBasicMaterial;
  fine: THREE.LineBasicMaterial;
};

/** Layer scale is a size cue only; opacity must not fade with depth or the wall shows through. */
const LAYER_SCALE = [0.6, 0.8, 1] as const;

/** Temporary audit aid: print each vine's effective alpha beside it on the wall. */
const VINE_ALPHA_DEBUG = false;
// TEMP 定位调试：花朵染蓝。
const VINE_BLUE_DEBUG = false;

/** Coloured vines keep a slight translucency so the wall reads behind them without turning grey. */
const STRONG_FILL_ALPHA = 0.9;

/** Shadow meshes live on their own layer so the main camera can never draw them. */
const SHADOW_LAYER = 1;

/** 出屏 shoots stand off the wall, so they read a little stronger than the front layer. */
const POP_ALPHA = 1.45;

function layerMaterials(
  base: THREE.Color,
  alpha: number,
  hover: VineHover,
  depth: VineDepth = VineDepth.Wall,
  strongFill = false,
  share = 1,
  parts?: VinePartUniforms,
  popLayer = false,
  popFull = false,
  popCut = false,
  underlayColor: THREE.Color = new THREE.Color(0xffffff),
  underlayOpacity = 0.18,
  underlayBlend: VineUnderlayBlend = "additive",
): LayerMaterials {
  const common = { transparent: true, depthWrite: false, side: THREE.DoubleSide } as const;
  const materials: LayerMaterials = {
    underlay: new THREE.MeshBasicMaterial({
      ...common,
      color: underlayColor.clone(),
      opacity: underlayOpacity * alpha,
      blending: UNDERLAY_BLENDING[underlayBlend] ?? THREE.AdditiveBlending,
    }),
    fill: new THREE.MeshBasicMaterial({ ...common, color: 0xffffff, opacity: (strongFill ? STRONG_FILL_ALPHA : 0.16) * alpha }),
    tint: new THREE.MeshBasicMaterial({ ...common, color: 0xffffff, opacity: (strongFill ? 0.35 : 0.06) * alpha }),
    halo: new THREE.MeshBasicMaterial({ ...common, color: 0xffffff, opacity: 0.2 * alpha, blending: THREE.AdditiveBlending }),
    edge: new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, opacity: 0.3 * alpha }),
    fine: new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, opacity: 0.16 * alpha }),
  };
  materials.fill.userData.fillAlpha = alpha;
  materials.tint.userData.tintAlpha = alpha;
  materials.underlay.userData.underlayOpacity = underlayOpacity;
  for (const [key, material] of Object.entries(materials)) {
    material.userData.sceneAlpha = alpha;
    material.userData.sceneShare = share;
    attachHover(material, hover, depth, key === "underlay" ? undefined : parts, key === "fill" ? (strongFill ? 0.18 : 0.72) : 0, popLayer, popFull, popCut);
  }
  return materials;
}

/** Shade a lifted shoot casts on the wall beneath it; the wall variant is a short board shadow. */
function shadowMaterial(alpha: number, hover: VineHover, strongFill = false, popLayer = false, popCut = false, wall = false, shadowAngle?: { value: number }, mask?: THREE.Texture | null, shadowSize?: { value: number }): THREE.MeshBasicMaterial {
  const material = new THREE.MeshBasicMaterial({
    color: 0x12091c,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
    opacity: (wall ? (strongFill ? 0.12 : 0.16) : (strongFill ? 0.09 : 0.12)) * alpha,
    // One shade per pixel: crossing quads take the stronger one instead of
    // stacking into a darker patch.
    blending: THREE.CustomBlending,
    blendEquation: THREE.MaxEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
  });
  attachHover(
    material,
    hover,
    wall ? VineDepth.WallShadow : VineDepth.Shadow,
    undefined,
    0,
    wall ? false : popLayer,
    wall ? false : popLayer,
    wall ? false : popCut,
    shadowAngle,
    !wall,
    mask,
    shadowSize,
  );
  material.userData.shadowAlpha = alpha;
  material.userData.shadowStrength = 1;
  return material;
}

/** Tags every vertex of a 出屏 shoot with its portal, which the shader lifts it about. */
function stampPortal(geometry: THREE.BufferGeometry, portal: VinePortal): void {
  const count = geometry.getAttribute("position").count;
  const data = new Float32Array(count * 4);
  for (let index = 0; index < count; index += 1) data.set([portal.x, portal.y, portal.z, portal.eye], index * 4);
  geometry.setAttribute(VINE_PORTAL, new THREE.BufferAttribute(data, 4));
}


/** A drifting mote seeded around one botanical part. */
type VineParticle = {
  readonly position: THREE.Vector3;
  readonly direction: THREE.Vector3;
  readonly phase: number;
  readonly life: number;
  readonly gap: number;
  readonly active: number;
  readonly distance: number;
  readonly blink: number;
  readonly blinkSpeed: number;
  readonly size: number;
  readonly portal: VinePortal | null;
};

/**
 * Seeds motes around each plan. Flowers are the primary source, leaves come
 * second, and the rest of the shoots only contribute the occasional mote.
 */
function buildVineParticles(plans: readonly VinePlan[], density: number, seed: number, mote = 1): VineParticle[] {
  const random = vineRandom((seed ^ 0x9e3779b9) >>> 0);
  const motes: VineParticle[] = [];
  const densityScale = THREE.MathUtils.clamp(density, 0.2, 3);
  for (const plan of plans) {
    const flowers = plan.lathes.filter((lathe) => lathe.role !== "bud");
    const leaves = plan.blades.filter((blade) => blade.role === "leaf");
    const count = Math.max(0, Math.round((1 + densityScale * 1.5) * mote)) + (flowers.length && mote > 0 ? 1 : 0);
    for (let index = 0; index < count; index += 1) {
      const roll = random();
      let position: THREE.Vector3;
      if (flowers.length && roll < 0.68) {
        const flower = flowers[Math.floor(random() * flowers.length)]!;
        const rim = flower.rows[flower.rows.length - 1]?.[1] ?? 14;
        const radius = Math.max(9, Math.min(26, rim * 1.5));
        position = flower.origin.clone().add(
          new THREE.Vector3(
            (random() - 0.5) * radius * 2,
            (random() - 0.5) * radius * 1.6,
            (random() - 0.5) * radius * 0.5,
          ),
        );
      } else if (leaves.length && roll < 0.88) {
        const blade = leaves[Math.floor(random() * leaves.length)]!;
        const along = random() * blade.spec.length * 0.72;
        const across = (random() - 0.5) * blade.spec.length * blade.spec.width * 0.7;
        position = blade.origin.clone()
          .addScaledVector(blade.x, along)
          .addScaledVector(blade.y, across)
          .addScaledVector(blade.n, (random() - 0.5) * 2);
      } else {
        const strand = plan.strands[Math.floor(random() * plan.strands.length)];
        if (!strand || strand.points.length === 0) {
          position = new THREE.Vector3();
        } else {
          const point = strand.points[Math.floor(random() * strand.points.length)]!;
          position = point.clone().add(
            new THREE.Vector3((random() - 0.5) * 8, (random() - 0.5) * 8, (random() - 0.5) * 3),
          );
        }
      }
      const direction = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, (random() - 0.5) * 0.6);
      if (direction.lengthSq() < 1e-4) direction.set(1, 0, 0);
      direction.normalize();
      motes.push({
        position,
        direction,
        phase: random(),
        life: 3 + random() * 3,
        gap: 0.1 + random() * 0.3,
        active: 0.65 + random() * 0.3,
        distance: 10 + random() * 28,
        blink: random() * Math.PI * 2,
        blinkSpeed: 0.8 + random() * 1.8,
        size: 1.1 + random() * 0.8,
        portal: plan.portal ?? null,
      });
    }
  }
  return motes;
}

let flowerPointTexture: THREE.Texture | null = null;

function makeFlowerPointTexture(): THREE.Texture {
  if (flowerPointTexture) return flowerPointTexture;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(255,255,255,0.95)");
  g.addColorStop(0.46, "rgba(255,255,255,0.28)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  flowerPointTexture = new THREE.CanvasTexture(canvas);
  flowerPointTexture.colorSpace = THREE.SRGBColorSpace;
  return flowerPointTexture;
}


function makeAlphaLabel(text: string): THREE.Sprite {
  const font = 13;
  const pad = 6;
  const canvas = document.createElement("canvas");
  const measure = canvas.getContext("2d")!;
  measure.font = `600 ${font}px ui-monospace, Menlo, monospace`;
  canvas.width = Math.ceil(measure.measureText(text).width) + pad * 2;
  canvas.height = font + pad * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.font = `600 ${font}px ui-monospace, Menlo, monospace`;
  ctx.fillStyle = "rgba(8, 10, 9, 0.72)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#5dff9b";
  ctx.textBaseline = "middle";
  ctx.fillText(text, pad, canvas.height / 2 + 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false }),
  );
  sprite.scale.set(canvas.width, canvas.height, 1);
  return sprite;
}

export function createVine3d(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  seed: number,
  density: number,
  color: FluidRgb,
  opacity = 1,
  options: Vine3dOptions = {},
): Vine3dController {
  const edges = options.popout === true ? VINE_POP_ALL : options.popout ? options.popout & VINE_POP_ALL : 0;
  const reach = edges ? vinePopBleed(width, height) : 0;
  const bleed: VineBleed = {
    left: edges & 1 ? reach : 0,
    top: edges & 2 ? reach : 0,
    right: edges & 4 ? reach : 0,
    bottom: edges & 8 ? reach : 0,
  };
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -width / 2 - bleed.left,
    width / 2 + bleed.right,
    height / 2 + bleed.top,
    -height / 2 - bleed.bottom,
    1,
    2000,
  );
  camera.position.z = 800;
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x24162f, 0.72));
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(-width * 0.28, height * 0.4, Math.max(width, height) * 0.3);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x8d7bff, 0.48);
  fill.position.set(width * 0.35, -height * 0.25, Math.max(width, height) * 0.15);
  scene.add(fill);
  const pointerLight = new THREE.PointLight(0xffffff, 0, Math.max(width, height) * 0.7);
  scene.add(pointerLight);
  const alpha = THREE.MathUtils.clamp(opacity, 0, 1);
  const radius = Math.max(0, options.radius ?? 0);
  const hover: VineHover = {
    pointer: new THREE.Vector2(0.5, 0.5),
    resolution: new THREE.Vector2(),
    radius: { value: 0 },
    strength: { value: 0 },
    canvas: new THREE.Vector2(),
    card: new THREE.Vector4(),
    corner: new THREE.Vector2(radius, 0.75),
    warp: new THREE.Vector2(1, 1),
    tilt: new THREE.Vector2(),
    shadowAngleBase: { value: 303.5 },
    presses: Array.from({ length: VINE_MAX_PRESSES }, () => new THREE.Vector4()),
    pressCount: { value: 0 },
    ripples: Array.from({ length: VINE_MAX_RIPPLES }, () => new THREE.Vector4(0, 0, 1, 0)),
    rippleCount: { value: 0 },
    rippleStrength: { value: 1 },
    rippleSpeed: { value: VINE_RIPPLE_SPEED },
    rippleSize: { value: 1 },
    rippleRings: { value: VINE_RIPPLE_RINGS },
    rippleSway: { value: VINE_RIPPLE_SWAY },
    shadowStrength: { value: 1 },
    shadowSize: { value: 1 },
    shadowAngle: { value: 303.5 },
    wallShadowStrength: { value: 1 },
    wallShadowSize: { value: 1 },
    shadowWallAngle: { value: 123.5 },
    time: { value: 0 },
    keep: Array.from({ length: VINE_MAX_KEEP }, () => new THREE.Vector4()),
    keepCount: { value: 0 },
  };
  const baseColor = colorFromRgb(color);
  let currentBase = baseColor;
  let baseAlpha = THREE.MathUtils.clamp(options.colorAlpha ?? 1, 0, 1);
  let currentMoteColor = options.moteColor ?? null;
  let currentMoteBlend = options.moteBlend ?? (options.lightWall ? "normal" : "additive");
  const strongFill = options.strongFill ?? false;
  let fillEmphasis = strongFill;
  let currentPalette: VinePalette = options.colors ?? {};
  const lightWall = options.lightWall ?? false;
  const partColors = Array.from({ length: VINE_PART_COUNT }, () => new THREE.Vector3(1, 1, 1));
  const partAlphas = Array.from({ length: VINE_PART_COUNT }, () => 1);
  const partUniforms: VinePartUniforms = { colors: partColors, alphas: partAlphas };
  // Bloom dots must follow the same view-space moves as their petals: the wall
  // warp pin plus the pointer tilt, which the vertex shader applies per depth
  // branch. Plain sprites get none of them, so the placement is replayed here.
  const bloomScale = options.bloomScale ?? { value: 1 };
  const budBloom = options.budBloom ?? null;
  options.bloomLayer?.replaceChildren();
  options.budLayer?.replaceChildren();
  const bloomProbe = new THREE.Vector3();
  const bloomDots: Array<{ el: HTMLElement; owner: { centre: THREE.Vector3; base: THREE.Vector3; portal?: VinePortal }; size: number; bud: boolean }> = [];
  const flowerDotMaterials: THREE.SpriteMaterial[] = [];
  const budDotMaterials: THREE.SpriteMaterial[] = [];
  const bloomSprites: Array<{
    sprite: THREE.Sprite;
    centre: THREE.Vector3;
    base: THREE.Vector3;
    portal?: VinePortal;
  }> = [];
  const placeBloomSprite = (sprite: THREE.Object3D, entry: { centre: THREE.Vector3; base: THREE.Vector3; portal?: VinePortal }): void => {
    let x = entry.centre.x + (hover.warp.x - 1) * entry.base.x;
    let y = entry.centre.y + (hover.warp.y - 1) * entry.base.y;
    if (entry.portal) {
      // 出屏 blooms hang past the portal: the view scales them around it and
      // leans them with the pointer, by as much of the shoot as has risen.
      const portalX = entry.portal.x * hover.warp.x;
      const portalY = entry.portal.y * hover.warp.y;
      const lift = THREE.MathUtils.clamp(entry.base.z - entry.portal.z, 0, entry.portal.eye * 0.6);
      const scale = entry.portal.eye / Math.max(entry.portal.eye - lift, 0.001);
      x = portalX + (x - portalX) * scale - hover.tilt.x * lift * VINE_POP_TILT;
      y = portalY + (y - portalY) * scale - hover.tilt.y * lift * VINE_POP_TILT;
    } else {
      x += hover.tilt.x * 2;
      y += hover.tilt.y * 2;
    }
    sprite.position.set(x, y, entry.centre.z);
  };
  hover.rippleStrength.value = options.rippleStrength ?? 1;
  hover.rippleSpeed.value = options.rippleSpeed ?? VINE_RIPPLE_SPEED;
  hover.rippleSize.value = options.rippleSize ?? 1;
  hover.rippleRings.value = options.rippleRings ?? VINE_RIPPLE_RINGS;
  hover.rippleSway.value = options.rippleSway ?? VINE_RIPPLE_SWAY;
  hover.shadowStrength.value = options.shadowStrength ?? 1;
  hover.shadowSize.value = options.shadowSize ?? 1;
  hover.shadowAngle.value = options.shadowAngle ?? 303.5;
  hover.shadowAngleBase.value = hover.shadowAngle.value;
  hover.wallShadowStrength.value = options.wallShadowStrength ?? 1;
  hover.wallShadowSize.value = options.wallShadowSize ?? 1;
  hover.shadowWallAngle.value = options.wallShadowAngle ?? (options.shadowAngle ?? 303.5) + 180;
  let currentShadowColor = options.shadowColor ?? null;
  let currentWallShadowColor = options.wallShadowColor ?? null;
  let shadowBlur = THREE.MathUtils.clamp(options.shadowBlur ?? 6, 0, 30);
  let wallShadowBlur = THREE.MathUtils.clamp(options.wallShadowBlur ?? 6, 0, 30);
  let glowScale = THREE.MathUtils.clamp(options.glow ?? 1, 0, 2);
  let currentUnderlayColor: THREE.Color | null = options.underlayColor ? colorFromRgb(options.underlayColor) : null;
  let currentUnderlayOpacity = THREE.MathUtils.clamp(options.underlayOpacity ?? 0.18, 0, 1);
  let currentUnderlayBlend = options.underlayBlend ?? "additive";
  const layers = LAYER_SCALE.map((share) =>
    layerMaterials(
      baseColor,
      alpha,
      hover,
      VineDepth.Wall,
      strongFill,
      share,
      partUniforms,
      false,
      false,
      false,
      currentUnderlayColor ?? new THREE.Color(0xffffff),
      currentUnderlayOpacity,
      currentUnderlayBlend,
    ),
  );
  const keep = options.keep ?? [];
  const setKeep = (rects: readonly VineRect[]): void => {
    const count = Math.min(rects.length, VINE_MAX_KEEP);
    for (let index = 0; index < count; index += 1) {
      const rect = rects[index]!;
      hover.keep[index]!.set(rect.x0, rect.y0, rect.x1, rect.y1);
    }
    hover.keepCount.value = count;
  };
  setKeep(keep);
  const garden = planVineGarden(width, height, seed, density, edges, { keep, wallKeep: options.wallKeep, popKeep: options.popKeep, inward: options.inward });
  const wallPlans = garden.filter((plan) => !plan.pop);
  const plans =
    options.paint === "pop" ? garden.filter((plan) => plan.pop) :
    options.paint === "wall" ? wallPlans :
    options.paint === "back" ? wallPlans.filter((plan) => plan.layer < 2) :
    // The crisp pass keeps all three wall layers out of the blurred pass, plus
    // the pop shoots that still belong to the wall side of a split.
    options.paint === "front" ? garden.filter((plan) => plan.pop || plan.layer === 2) :
    garden;
  const popMaterials = plans.some((plan) => plan.pop)
    ? layerMaterials(baseColor, Math.min(1.6, alpha * POP_ALPHA), hover, VineDepth.Pop, strongFill, POP_ALPHA, partUniforms, options.paint === 'pop', options.paint === 'pop', options.paint === 'all' && options.popCut === true, currentUnderlayColor ?? new THREE.Color(0xffffff), currentUnderlayOpacity, currentUnderlayBlend)
    : null;
  const shadow = popMaterials ? shadowMaterial(alpha, hover, strongFill, options.paint === 'pop', options.paint === 'all' && options.popCut === true, false, undefined, null) : null;
  const wallShadow = options.paint !== "pop" ? shadowMaterial(alpha, hover, strongFill, false, false, true, hover.shadowWallAngle, null, hover.wallShadowSize) : null;
  const materialSets = popMaterials ? [...layers, popMaterials] : layers;
  const shadowObjects: THREE.Object3D[] = [];
  const wallShadowObjects: THREE.Object3D[] = [];
  const paintedObjects: THREE.Object3D[] = [];
  const createShadowTarget = () =>
    new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      depthBuffer: false,
      stencilBuffer: false,
    });
  const shadowTarget = shadow ? createShadowTarget() : null;
  const wallShadowTarget = wallShadow ? createShadowTarget() : null;
  const blurMaterial = (shadow || wallShadow)
    ? new THREE.ShaderMaterial({
        uniforms: {
          u_shadow: { value: shadowTarget?.texture ?? wallShadowTarget!.texture },
          u_texel: { value: new THREE.Vector2(1, 1) },
          u_blur: { value: 1 },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        premultipliedAlpha: true,
        vertexShader: `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`,
        fragmentShader: `
uniform sampler2D u_shadow;
uniform vec2 u_texel;
uniform float u_blur;
varying vec2 vUv;
void main() {
  vec2 d = u_texel * u_blur;
  vec4 sum = texture2D(u_shadow, vUv) * 0.2;
  sum += texture2D(u_shadow, vUv + vec2(d.x, 0.0)) * 0.12;
  sum += texture2D(u_shadow, vUv - vec2(d.x, 0.0)) * 0.12;
  sum += texture2D(u_shadow, vUv + vec2(0.0, d.y)) * 0.12;
  sum += texture2D(u_shadow, vUv - vec2(0.0, d.y)) * 0.12;
  sum += texture2D(u_shadow, vUv + d) * 0.08;
  sum += texture2D(u_shadow, vUv - d) * 0.08;
  sum += texture2D(u_shadow, vUv + vec2(d.x, -d.y)) * 0.08;
  sum += texture2D(u_shadow, vUv + vec2(-d.x, d.y)) * 0.08;
  gl_FragColor = sum;
}`,
      })
    : null;
  const blurScene = (shadow || wallShadow) ? new THREE.Scene() : null;
  const blurCamera = (shadow || wallShadow) ? new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) : null;
  if (blurScene && blurMaterial) {
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blurMaterial);
    quad.frustumCulled = false;
    blurScene.add(quad);
  }

  const motes = buildVineParticles(plans, density, seed, options.mote ?? 1);
  let particleMaterial: THREE.ShaderMaterial | null = null;
  let particlePoints: THREE.Points | null = null;
  if (motes.length) {
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(motes.length * 3);
    const directions = new Float32Array(motes.length * 3);
    const phases = new Float32Array(motes.length);
    const lives = new Float32Array(motes.length);
    const gaps = new Float32Array(motes.length);
    const actives = new Float32Array(motes.length);
    const distances = new Float32Array(motes.length);
    const blinks = new Float32Array(motes.length);
    const blinkSpeeds = new Float32Array(motes.length);
    const sizes = new Float32Array(motes.length);
    const portals = new Float32Array(motes.length * 4);
    motes.forEach((mote, index) => {
      positions.set([mote.position.x, mote.position.y, mote.position.z], index * 3);
      directions.set([mote.direction.x, mote.direction.y, mote.direction.z], index * 3);
      phases[index] = mote.phase;
      lives[index] = mote.life;
      gaps[index] = mote.gap;
      actives[index] = mote.active;
      distances[index] = mote.distance;
      blinks[index] = mote.blink;
      blinkSpeeds[index] = mote.blinkSpeed;
      sizes[index] = mote.size;
      if (mote.portal) portals.set([mote.portal.x, mote.portal.y, mote.portal.z, mote.portal.eye], index * 4);
    });
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("aDirection", new THREE.BufferAttribute(directions, 3));
    particleGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    particleGeometry.setAttribute("aLife", new THREE.BufferAttribute(lives, 1));
    particleGeometry.setAttribute("aGap", new THREE.BufferAttribute(gaps, 1));
    particleGeometry.setAttribute("aActive", new THREE.BufferAttribute(actives, 1));
    particleGeometry.setAttribute("aDistance", new THREE.BufferAttribute(distances, 1));
    particleGeometry.setAttribute("aBlink", new THREE.BufferAttribute(blinks, 1));
    particleGeometry.setAttribute("aBlinkSpeed", new THREE.BufferAttribute(blinkSpeeds, 1));
    particleGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    particleGeometry.setAttribute("aPortal", new THREE.BufferAttribute(portals, 4));
    particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      blending: UNDERLAY_BLENDING[currentMoteBlend] ?? THREE.AdditiveBlending,
      uniforms: {
        u_time: hover.time,
        u_pixel_ratio: { value: renderer.getPixelRatio() },
        u_color: { value: new THREE.Color(1, 1, 1) },
        u_opacity: { value: 0.85 },
        u_card: { value: hover.card },
        u_canvas: { value: hover.canvas },
        u_resolution: { value: hover.resolution },
        u_warp: { value: hover.warp },
        u_tilt: { value: hover.tilt },
        u_pop: { value: options.paint === "pop" ? 1 : 0 },
      },
      vertexShader: `
attribute vec3 aDirection;
attribute float aPhase;
attribute float aLife;
attribute float aGap;
attribute float aActive;
attribute float aDistance;
attribute float aBlink;
attribute float aBlinkSpeed;
attribute float aSize;
attribute vec4 aPortal;
uniform float u_time;
uniform float u_pixel_ratio;
uniform vec2 u_warp;
uniform vec2 u_tilt;
uniform float u_pop;
varying float vAlpha;
void main() {
  float period = aLife * (1.0 + aGap);
  float clock = u_time / period + aPhase;
  float cycle = floor(clock);
  float cycleSeed = fract(sin((cycle + aPhase * 7.0) * 53.7) * 43758.5453);
  // Keep the window continuous across cycles; the old per-cycle offset could
  // restart a mote part-way through its path while it was still visible.
  float activeWindow = clamp(aActive * (0.58 + 0.36 * cycleSeed), 0.2, 0.92);
  float window = fract(clock);
  if (window > activeWindow) {
    vAlpha = 0.0;
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    return;
  }
  float t = clamp(window / activeWindow, 0.0, 1.0);
  float spin = (fract(sin((cycle + aPhase) * 91.7) * 43758.5453) - 0.5) * 1.4;
  vec3 dir = aDirection;
  float cosine = cos(spin);
  float sine = sin(spin);
  dir.xy = mat2(cosine, -sine, sine, cosine) * dir.xy;
  vec3 p = position + dir * aDistance * (1.0 - pow(1.0 - t, 2.2));
  p.y += t * t * 3.0;
  float blink = 0.5 + 0.5 * sin(t * 3.14159 * (1.5 + aBlinkSpeed) + aBlink);
  float fade = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.7, 1.0, t));
  vAlpha = fade * (0.6 + 0.4 * blink * blink);
  if (u_pop > 0.5) {
    float eye = max(aPortal.w, 1.0);
    float lift = clamp(p.z - aPortal.z, 0.0, eye * 0.6);
    vec2 portalAt = aPortal.xy * u_warp;
    p.xy = portalAt + (p.xy - portalAt) * eye / max(eye - lift, 0.001);
    p.xy -= u_tilt * lift * 0.06;
  }
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * u_pixel_ratio * (1.8 + 1.0 * vAlpha);
}`,
      fragmentShader: `
uniform vec3 u_color;
uniform float u_opacity;
uniform vec4 u_card;
uniform vec2 u_canvas;
uniform vec2 u_resolution;
uniform float u_pop;
varying float vAlpha;
void main() {
  if (u_pop < 0.5) {
    vec2 at = gl_FragCoord.xy / u_resolution * u_canvas;
    if (abs(at.x - u_card.x) > u_card.z || abs(at.y - u_card.y) > u_card.w) discard;
  }
  vec2 point = gl_PointCoord - 0.5;
  float radius = length(point);
  if (radius > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, radius);
  gl_FragColor = vec4(u_color, alpha * vAlpha * u_opacity);
}`,
    });
    particlePoints = new THREE.Points(particleGeometry, particleMaterial);
    particlePoints.frustumCulled = false;
    particlePoints.renderOrder = 10000;
    scene.add(particlePoints);
    paintedObjects.push(particlePoints);
  }

  const applyPalette = (): void => {
    const basePart = currentPalette.base;
    const seedPart =
      basePart ??
      currentPalette.fill ??
      currentPalette.tint ??
      currentPalette.edge ??
      currentPalette.halo ??
      currentPalette.fine;
    const paletteBase = seedPart ? colorFromRgb(seedPart.color) : currentBase;
    const paletteAlpha = baseAlpha * (basePart?.alpha ?? 1);
    const edgeEntry = currentPalette.edge ?? currentPalette.fine ?? currentPalette.halo;
    const fineEntry = currentPalette.fine ?? currentPalette.edge ?? currentPalette.halo;
    const haloEntry = currentPalette.halo ?? currentPalette.fine ?? currentPalette.edge;
    const edgeColor = edgeEntry ? colorFromRgb(edgeEntry.color) : paletteBase;
    const fineColor = fineEntry ? colorFromRgb(fineEntry.color) : paletteBase;
    const haloColor = haloEntry ? colorFromRgb(haloEntry.color) : paletteBase;
    const partKeys = ["leaf", "flower", "bud", "flowerStem", "stem", "leafStem"] as const;
    for (let index = 0; index < VINE_PART_COUNT; index += 1) {
      const key = partKeys[index]!;
      const part = key === "stem" ? undefined : currentPalette[key as VineBotanicalPart];
      const entry = part ?? currentPalette.fill;
      const color = entry ? colorFromRgb(entry.color) : paletteBase;
      partColors[index]!.set(color.r, color.g, color.b);
      partAlphas[index] = entry?.alpha ?? 1;
    }
    // TEMP 定位调试：花朵整体染蓝，白点位置一眼可辨。
    if (VINE_BLUE_DEBUG) {
      const blue = new THREE.Color(0x1558ff);
      for (let index = 0; index < VINE_PART_COUNT; index += 1) {
        if (partKeys[index] === "flower") {
          partColors[index]!.set(blue.r, blue.g, blue.b);
          partAlphas[index] = 1;
        }
      }
    }
    const sceneAlpha = (material: THREE.Material): number => (material.userData.sceneAlpha as number | undefined) ?? 1;
    const setOpacity = (
      material: THREE.MeshBasicMaterial | THREE.LineBasicMaterial,
      factor: number,
    ): void => {
      material.opacity = factor * sceneAlpha(material) * paletteAlpha;
    };
    for (const materials of materialSets) {
      for (const [key, material] of Object.entries(materials)) {
        if (key === "underlay") {
          const wash = material as THREE.MeshBasicMaterial;
          wash.color.copy(currentUnderlayColor ?? new THREE.Color(0xffffff));
          wash.opacity = currentUnderlayOpacity * sceneAlpha(wash) * paletteAlpha;
          continue;
        }
        const factor =
          key === "fill" ? (fillEmphasis ? STRONG_FILL_ALPHA : 0.16) :
          key === "tint" ? (fillEmphasis ? 0.35 : 0.06) :
          key === "halo" ? (fillEmphasis ? 0.34 : 0.2) :
          key === "edge" ? (fillEmphasis ? 0.92 : 0.3) :
          key === "fine" ? (fillEmphasis ? 0.78 : 0.16) :
          fillEmphasis ? 0.52 : 0.16;
        setOpacity(material as THREE.MeshBasicMaterial | THREE.LineBasicMaterial, factor);
        if (key === "fill") {
          const uniform = material.userData.vineLighten as { value: number } | undefined;
          if (uniform) uniform.value = fillEmphasis ? 0.18 : 0.72;
        }
        if (key === "edge") {
          (material as THREE.LineBasicMaterial).color.copy(edgeColor);
        } else if (key === "fine") {
          (material as THREE.LineBasicMaterial).color.copy(fineColor);
        } else if (key === "halo") {
          (material as THREE.MeshBasicMaterial).color.copy(haloColor);
        }
      }
    }
    if (particleMaterial) {
      const lightWall = options.lightWall ?? currentBase.r + currentBase.g + currentBase.b < 1.5;
      if (currentMoteColor) {
        particleMaterial.uniforms.u_color.value.copy(colorFromRgb(currentMoteColor));
      } else {
        particleMaterial.uniforms.u_color.value.setRGB(
          lightWall ? 1 : 1,
          lightWall ? 0.24 : 0.62,
          lightWall ? 0.52 : 0.8,
        );
      }
      particleMaterial.uniforms.u_opacity.value = (fillEmphasis ? 0.95 : lightWall ? 0.95 : 0.95) * paletteAlpha;
      const blending = UNDERLAY_BLENDING[currentMoteBlend] ?? (lightWall ? THREE.NormalBlending : THREE.AdditiveBlending);
      if (particleMaterial.blending !== blending) {
        particleMaterial.blending = blending;
        particleMaterial.needsUpdate = true;
      }
    }
    const shadowBase = currentPalette.fill ? colorFromRgb(currentPalette.fill.color) : paletteBase;
    for (const shade of [shadow, wallShadow]) {
      if (!shade) continue;
      const wall = shade === wallShadow;
      const customColor = wall ? currentWallShadowColor : currentShadowColor;
      if (customColor) shade.color.copy(colorFromRgb(customColor));
      else shade.color.copy(shadowBase).multiplyScalar(0.35);
      const baseOpacity = wall ? (fillEmphasis ? 0.38 : 0.46) : (fillEmphasis ? 0.24 : 0.28);
      const strength = wall ? hover.wallShadowStrength.value : (shade.userData.shadowStrength ?? 1);
      shade.opacity =
        baseOpacity *
        (shade.userData.shadowAlpha ?? 1) *
        strength *
        paletteAlpha;
    }

  };
  applyPalette();
  const portals = plans.flatMap((plan) => (plan.pop && plan.portal ? [plan.portal] : [])).slice(0, VINE_MAX_RIPPLES);
  portals.forEach((portal, index) => hover.ripples[index]!.set(portal.x, portal.y, portal.ripple, portal.phase));
  hover.rippleCount.value = portals.length;
  plans.forEach((plan, index) => {
    const materials = (plan.pop && popMaterials) || layers[plan.layer]!;
    const geometry = buildVineGeometry(plan);
    // Shoots that come off the wall are drawn after all that lies on it.
    const order = (plan.pop ? plans.length + index : index) * 10;
    const add = (object: THREE.Object3D, offset: number, asShadow = false) => {
      object.renderOrder = order + offset;
      // Bounds are those of the plan; the shader stretches it past them.
      object.frustumCulled = false;
      if (asShadow) {
        object.visible = false;
        object.layers.set(SHADOW_LAYER);
        shadowObjects.push(object);
      } else paintedObjects.push(object);
      scene.add(object);
    };
    // The bloom the eye sees is the fan of petals, whose visual centre sits
    // past the disc throat along the flower's axis; cluster petals by their
    // attachment point and light the weighted centre of their mid-points.
    const bloomGroups: Array<{ base: THREE.Vector3; mids: THREE.Vector3[]; tips: THREE.Vector3[]; weights: number[]; bud: boolean }> = [];
    // Anchor each bloom on the flower lathe itself. Petals can be scattered across
    // plans and split into clusters, but the lathe is exactly what gets drawn.
    const addAnchor = (lathe: (typeof plan.lathes)[number], bud: boolean, scale: number): void => {
      if (lathe.rows.length === 0) return;
      const row = lathe.rows[lathe.rows.length - 1]!;
      const centre = lathe.origin.clone().addScaledVector(lathe.axis, row[0] * 0.5);
      if (bloomGroups.some((group) => group.base.distanceToSquared(centre) < 18 * 18)) return;
      const reach = Math.max(row[1] * scale, bud ? 4 : 4);
      bloomGroups.push({
        base: centre,
        mids: [centre],
        tips: [centre.clone().addScaledVector(lathe.axis, reach)],
        weights: [reach],
        bud,
      });
    };
    // Corollas and buds carry the flower itself; star/blossom kinds only emit
    // petal whorls plus a disc, so the disc is their centre.
    for (const lathe of plan.lathes) {
      if (lathe.role === "bud") {
        if (budBloom) addAnchor(lathe, true, 1);
      } else if (lathe.role === "corolla") {
        addAnchor(lathe, false, 1);
      }
    }
    for (const lathe of plan.lathes) {
      if (lathe.role === "disc") addAnchor(lathe, false, 2.4);
    }
    for (const group of bloomGroups) {
      const weight = group.weights.reduce((sum, value) => sum + value, 0);
      const centre = group.mids
        .reduce((sum, mid, index) => sum.clone().addScaledVector(mid, group.weights[index]!), new THREE.Vector3())
        .multiplyScalar(1 / weight);
      const reach = Math.max(...group.tips.map((tip) => centre.distanceTo(tip)));
      const point = THREE.MathUtils.clamp(reach * 0.45, 5, 16);
      const entry = { centre, base: group.base, portal: plan.pop ? plan.portal : undefined };
      const dot = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: makeFlowerPointTexture(),
          color: 0xffffff,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          blending: THREE.NormalBlending,
          opacity: group.bud ? 0.55 : 0.9,
        }),
      );
      dot.scale.set(point * 2, point * 2, 1);
      (group.bud ? budDotMaterials : flowerDotMaterials).push(dot.material as THREE.SpriteMaterial);
      placeBloomSprite(dot, entry);
      bloomSprites.push({ sprite: dot, ...entry });
      add(dot, 7);
      const bloomLayer = group.bud ? options.budLayer : options.bloomLayer;
      if (bloomLayer) {
        const el = document.createElement("div");
        el.className = "akari-fluid-wall__bloom-dot";
        // Scoped component CSS cannot reach nodes created here, so the dot paints itself.
        el.style.position = "absolute";
        el.style.left = "0";
        el.style.top = "0";
        el.style.borderRadius = "50%";
        el.style.pointerEvents = "none";
        // On the dark wall the petals are near-white, so a white halo disappears;
        // the night glow leans pink to stay readable against them.
        el.style.background = group.bud
          ? lightWall
            ? "radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,222,244,0.3) 24%, rgba(255,190,230,0.1) 52%, rgba(255,190,230,0) 78%)"
            : "radial-gradient(circle, rgba(255,205,240,0.5) 0%, rgba(246,140,214,0.28) 24%, rgba(238,110,204,0.09) 52%, rgba(238,110,204,0) 78%)"
          : lightWall
            ? "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,214,240,0.62) 22%, rgba(255,176,222,0.22) 48%, rgba(255,176,222,0) 72%)"
            : "radial-gradient(circle, rgba(255,176,230,0.95) 0%, rgba(250,116,206,0.6) 22%, rgba(238,84,192,0.2) 48%, rgba(238,84,192,0) 72%)";
        bloomLayer.appendChild(el);
        bloomDots.push({ el, owner: entry, size: reach * (group.bud ? 7 : 4.2), bud: group.bud });
      }
    }
    if (VINE_ALPHA_DEBUG && plan.layer === 2 && !plan.pop) {
      const anchor = plan.strands[0]?.points[0] ?? new THREE.Vector3();
      const effective = plan.pop ? Math.min(1.6, alpha * POP_ALPHA) : alpha;
      const fill = (strongFill ? STRONG_FILL_ALPHA : 0.16) * effective;
      const label = makeAlphaLabel(`L${plan.layer} α${effective.toFixed(2)} f${fill.toFixed(2)}`);
      const labelX = THREE.MathUtils.clamp(anchor.x + (anchor.x < 0 ? 76 : -76), -520, 400);
      const labelY = THREE.MathUtils.clamp(anchor.y + (anchor.y < 0 ? 44 : -44), -130, 130);
      const labelEntry = {
        centre: new THREE.Vector3(labelX, labelY, 30),
        base: anchor.clone(),
        portal: plan.pop ? plan.portal : undefined,
      };
      placeBloomSprite(label, labelEntry);
      bloomSprites.push({ sprite: label, ...labelEntry });
      add(label, 8);
    }
    if (geometry.halo) add(new THREE.Mesh(geometry.halo, materials.halo), 0);
    if (geometry.organ) {
      add(new THREE.Mesh(geometry.organ, materials.underlay), 0.5);
      add(new THREE.Mesh(geometry.organ, materials.tint), 1);
      add(new THREE.Mesh(geometry.organ, materials.fill), 2);
    }
    if (geometry.tube) {
      add(new THREE.Mesh(geometry.tube, materials.underlay), 2.5);
      add(new THREE.Mesh(geometry.tube, materials.fill), 3);
    }
    if (geometry.fine) add(new THREE.LineSegments(geometry.fine, materials.fine), 4);
    if (geometry.edge) add(new THREE.LineSegments(geometry.edge, materials.edge), 5);
    if (plan.pop && plan.portal) {
      for (const part of [geometry.halo, geometry.organ, geometry.tube, geometry.fine, geometry.edge]) {
        if (part) stampPortal(part, plan.portal);
      }
      if (shadow) {
        if (geometry.organ) add(new THREE.Mesh(geometry.organ, shadow), -2, true);
        if (geometry.tube) add(new THREE.Mesh(geometry.tube, shadow), -1, true);
      }
    }
    if (!plan.pop && wallShadow) {
      const addWallShadow = (object: THREE.Object3D, offset: number) => {
        object.renderOrder = order + offset;
        object.frustumCulled = false;
        object.visible = false;
        object.layers.set(SHADOW_LAYER);
        wallShadowObjects.push(object);
        scene.add(object);
      };
      if (geometry.organ) addWallShadow(new THREE.Mesh(geometry.organ, wallShadow), 6);
      if (geometry.tube) addWallShadow(new THREE.Mesh(geometry.tube, wallShadow), 7);
    }
  });
  // Highlights are created after the plan walk; give them the current palette
  // before the first frame rather than waiting for the next colour update.
  applyPalette();
  const pointerTarget = new THREE.Vector3();
  const pointerLast = new THREE.Vector3();
  let lastPointerMoveAt = -1;
  const pointer = new THREE.Vector3();
  const shadowPointer = new THREE.Vector3();
  const shadowHistory: { x: number; y: number; t: number }[] = [];
  const SHADOW_TRAIL_SECONDS = 5;
  const SHADOW_SAMPLE_SECONDS = 0.2;
  /** Degrees the shade may lean either side of the authored angle while tracking the pointer. */
const SHADOW_ANGLE_LIMIT = 10;

const SHADOW_SPEED = 0.8;
  let shadowSampleClock = -1;
  let shadowClock = -1;
  let lastShadowFrameTime = -1;
  let shadowPointerReady = false;
  let pointerWasActive = false;
  const pointerUvTarget = new THREE.Vector2(0.5, 0.5);
  const tiltTarget = new THREE.Vector2();
  let pointerActive = 0;
  let hoverLevel = 0;
  const lift = Math.max(40, Math.min(width, height) * 0.2);
  let cardWidth = width;
  let cardHeight = height;
  const setRipple = (
    strength: number,
    speed: number,
    size: number,
    rings = hover.rippleRings.value,
    sway = hover.rippleSway.value,
  ): void => {
    hover.rippleStrength.value = strength;
    hover.rippleSpeed.value = speed;
    hover.rippleSize.value = size;
    hover.rippleRings.value = rings;
    hover.rippleSway.value = sway;
  };

  const glowRadiusFor = (widthNow: number, heightNow: number): number =>
    Math.max(96, Math.min(160, Math.max(widthNow, heightNow) * 0.48)) * glowScale;

  const setGlow = (scale: number): void => {
    glowScale = THREE.MathUtils.clamp(scale, 0, 2);
    const glowRadius = glowRadiusFor(cardWidth, cardHeight);
    hover.radius.value = glowRadius * renderer.getPixelRatio();
    pointerLight.distance = glowRadius * 1.45;
  };

  const setShadow = (strength: number, size: number): void => {
    hover.shadowStrength.value = strength;
    hover.shadowSize.value = size;
    if (shadow) {
      shadow.userData.shadowStrength = strength;
      applyPalette();
    }
  };

  const setShadowColor = (color: FluidRgb | null): void => {
    currentShadowColor = color;
    applyPalette();
  };

  const setShadowAngle = (angle: number): void => {
    hover.shadowAngleBase.value = angle;
  };

  const setShadowBlur = (blur: number): void => {
    shadowBlur = THREE.MathUtils.clamp(blur, 0, 30);
  };

  const setWallShadow = (strength: number, size: number): void => {
    hover.wallShadowStrength.value = strength;
    hover.wallShadowSize.value = size;
    if (wallShadow) {
      wallShadow.userData.shadowStrength = strength;
      applyPalette();
    }
  };

  const setWallShadowColor = (color: FluidRgb | null): void => {
    currentWallShadowColor = color;
    applyPalette();
  };

  let wallShadowAngleOffset = options.wallShadowAngle ?? 180;

  const setWallShadowAngle = (angle: number): void => {
    wallShadowAngleOffset = angle;
  };

  const setWallShadowBlur = (blur: number): void => {
    wallShadowBlur = THREE.MathUtils.clamp(blur, 0, 30);
  };

  const resize = (nextWidth: number, nextHeight: number) => {
    cardWidth = nextWidth;
    cardHeight = nextHeight;
    hover.warp.set(nextWidth / width, nextHeight / height);
    for (const entry of bloomSprites) placeBloomSprite(entry.sprite, entry);
    const far = Math.max(nextWidth, nextHeight);
    key.position.set(-nextWidth * 0.28, nextHeight * 0.4, far * 0.3);
    fill.position.set(nextWidth * 0.35, -nextHeight * 0.25, far * 0.15);
    camera.left = -nextWidth / 2 - bleed.left;
    camera.right = nextWidth / 2 + bleed.right;
    camera.top = nextHeight / 2 + bleed.top;
    camera.bottom = -nextHeight / 2 - bleed.bottom;
    camera.updateProjectionMatrix();
    const canvasWidth = nextWidth + bleed.left + bleed.right;
    const canvasHeight = nextHeight + bleed.top + bleed.bottom;
    renderer.setSize(canvasWidth, canvasHeight, false);
    const drawingBuffer = new THREE.Vector2();
    renderer.getDrawingBufferSize(drawingBuffer);
    hover.resolution.copy(drawingBuffer);
    if (particleMaterial) particleMaterial.uniforms.u_pixel_ratio.value = renderer.getPixelRatio();
    if (shadowTarget) shadowTarget.setSize(drawingBuffer.x, drawingBuffer.y);
    if (wallShadowTarget) wallShadowTarget.setSize(drawingBuffer.x, drawingBuffer.y);
    if (blurMaterial) blurMaterial.uniforms.u_texel.value.set(1 / drawingBuffer.x, 1 / drawingBuffer.y);
    hover.canvas.set(canvasWidth, canvasHeight);
    hover.card.set(bleed.left + nextWidth / 2, bleed.bottom + nextHeight / 2, nextWidth / 2, nextHeight / 2);
    hover.corner.x = Math.min(radius, nextWidth / 2, nextHeight / 2);
    const glowRadius = glowRadiusFor(nextWidth, nextHeight);
    hover.radius.value = glowRadius * renderer.getPixelRatio();
    pointerLight.distance = glowRadius * 1.45;
  };
  resize(width, height);
  return {
    bleed,
    planWidth: width,
    planHeight: height,
    resize,
    setPointer(x, y, active, tilt = active) {
      pointerTarget.set((x - 0.5) * cardWidth, (0.5 - y) * cardHeight, lift);
      // The glow is placed in the canvas, which reaches past the wall by the bleed.
      pointerUvTarget.set(
        (x * cardWidth + bleed.left) / (cardWidth + bleed.left + bleed.right),
        (y * cardHeight + bleed.top) / (cardHeight + bleed.top + bleed.bottom),
      );
      pointerActive = active ? 1 : 0;
      if (tilt) tiltTarget.set(THREE.MathUtils.clamp(x * 2 - 1, -1, 1), THREE.MathUtils.clamp(1 - y * 2, -1, 1));
      else tiltTarget.set(0, 0);
    },
    setColor(nextColor, emphasis = fillEmphasis, nextAlpha = baseAlpha) {
      fillEmphasis = emphasis;
      baseAlpha = THREE.MathUtils.clamp(nextAlpha, 0, 1);
      currentBase = colorFromRgb(nextColor);
      applyPalette();
    },
    setColors(colors, emphasis = fillEmphasis) {
      fillEmphasis = emphasis;
      currentPalette = colors;
      applyPalette();
    },
    setRipple,
    setGlow,
    setShadow,
    setShadowColor,
    setShadowAngle,
    setShadowBlur,
    setWallShadow,
    setWallShadowColor,
    setWallShadowAngle,
    setWallShadowBlur,
    setUnderlay(color, opacity = currentUnderlayOpacity) {
      currentUnderlayColor = color ? colorFromRgb(color) : null;
      currentUnderlayOpacity = THREE.MathUtils.clamp(opacity, 0, 1);
      applyPalette();
    },
    setUnderlayBlend(mode) {
      currentUnderlayBlend = mode;
      for (const materials of materialSets) {
        materials.underlay.blending = UNDERLAY_BLENDING[mode] ?? THREE.AdditiveBlending;
        materials.underlay.needsUpdate = true;
      }
    },
    setMoteColor(color) {
      currentMoteColor = color;
      applyPalette();
    },
    setMoteBlend(mode) {
      currentMoteBlend = mode;
      applyPalette();
    },
    setOpacity(nextAlpha) {
      const value = THREE.MathUtils.clamp(nextAlpha, 0, 1);
      for (const materials of materialSets) {
        for (const material of Object.values(materials)) {
          material.userData.sceneAlpha = value;
        }
      }
      if (shadow) shadow.userData.shadowAlpha = value;
      if (wallShadow) wallShadow.userData.shadowAlpha = value;
      applyPalette();
    },
    setPresses(nextPresses) {
      const count = Math.min(nextPresses.length, VINE_MAX_PRESSES);
      for (let index = 0; index < count; index += 1) {
        const press = nextPresses[index]!;
        hover.presses[index]!.set(press.x, press.y, press.t, press.reach);
      }
      hover.pressCount.value = count;
    },
    portals,
    setKeep,
    render(time) {
      if (time !== undefined) hover.time.value = time;
      hover.tilt.lerp(tiltTarget, 0.06);
      for (const entry of bloomSprites) placeBloomSprite(entry.sprite, entry);
      // Keep the white core readable even when the diffuse alpha is dialled low.
      const bloomOpacity = Math.max(0.62, 0.9 * THREE.MathUtils.clamp(bloomScale.value, 0, 1.4));
      for (const material of flowerDotMaterials) material.opacity = bloomOpacity;
      const budStrength = budBloom ? THREE.MathUtils.clamp(budBloom.alpha.value, 0, 1.4) : 0;
      for (const material of budDotMaterials) material.opacity = 0.55 * budStrength;
      if (bloomDots.length) {
        const boxWidth = canvas.clientWidth || renderer.domElement.clientWidth;
        const boxHeight = canvas.clientHeight || renderer.domElement.clientHeight;
        const spanX = camera.right - camera.left;
        const spanY = camera.top - camera.bottom;
        for (const dot of bloomDots) {
          const sprite = bloomSprites.find((item) => item.centre === dot.owner.centre)?.sprite;
          if (!sprite) continue;
          bloomProbe.copy(sprite.position).project(camera);
          const px = (bloomProbe.x * 0.5 + 0.5) * boxWidth;
          const py = (-bloomProbe.y * 0.5 + 0.5) * boxHeight;
          const scale = dot.bud ? (budBloom?.radius.value ?? 0) : bloomScale.value;
          const size = ((dot.size * scale) / spanX) * boxWidth;
          dot.el.style.transform = `translate3d(${(px - size / 2).toFixed(1)}px, ${(py - size / 2).toFixed(1)}px, 0)`;
          dot.el.style.width = `${size.toFixed(1)}px`;
          dot.el.style.height = `${size.toFixed(1)}px`;
        }
      }
      pointer.lerp(pointerTarget, 0.16);
      hover.pointer.lerp(pointerUvTarget, 0.16);
      pointerLight.position.copy(pointer);
      pointerLight.intensity += (pointerActive * 1.3 * glowScale - pointerLight.intensity) * 0.12;
      hoverLevel += (pointerActive - hoverLevel) * (pointerActive > hoverLevel ? 0.18 : 0.08);
      hover.strength.value = hoverLevel * 2.8 * glowScale;
      // The light has a physical trail: it follows a delayed position, not a
      // shortest angular path. When the pointer leaves, that trail slides back
      // to the position that represents the authored `shadow-angle`.
      const homeRadius = Math.max(cardWidth, cardHeight) * 0.32;
      const baseRadians = hover.shadowAngleBase.value * (Math.PI / 180);
      const homeX = -Math.cos(baseRadians) * homeRadius;
      const homeY = -Math.sin(baseRadians) * homeRadius;
      const shadowTargetX = pointerActive ? pointerTarget.x : homeX;
      const shadowTargetY = pointerActive ? pointerTarget.y : homeY;
      // A stationary hover produces a long run of identical samples; when the
      // pointer finally moves again, restart the trail from that point so the
      // old stationary tail cannot delay the visible path.
      const pointerTravel = Math.hypot(pointerTarget.x - pointerLast.x, pointerTarget.y - pointerLast.y);
      if (pointerActive && pointerTravel > 0.01) {
        if (lastPointerMoveAt >= 0 && hover.time.value - lastPointerMoveAt > 0.25) {
          shadowHistory.length = 0;
          shadowHistory.push({ x: pointerTarget.x, y: pointerTarget.y, t: hover.time.value });
          shadowSampleClock = hover.time.value;
          shadowClock = hover.time.value;
          shadowPointerReady = true;
        }
        lastPointerMoveAt = hover.time.value;
        pointerLast.copy(pointerTarget);
      }
      const pointerNowActive = pointerActive > 0.5;
      if (pointerNowActive && !pointerWasActive) {
        shadowHistory.length = 0;
        shadowHistory.push({ x: shadowTargetX, y: shadowTargetY, t: hover.time.value });
        shadowSampleClock = hover.time.value;
        shadowClock = hover.time.value;
        lastPointerMoveAt = hover.time.value;
        pointerLast.copy(pointerTarget);
        shadowPointerReady = true;
      }
      pointerWasActive = pointerNowActive;
      if (!shadowPointerReady) {
        shadowHistory.push({ x: shadowTargetX, y: shadowTargetY, t: hover.time.value });
        shadowSampleClock = hover.time.value;
        shadowClock = hover.time.value;
        shadowPointerReady = true;
      }
      // The shadow cursor runs at 0.8x real time from the pointer entry point,
      // so it starts moving immediately and lags by one second once the
      // five-second buffer is full.
      const shadowFrameDelta = lastShadowFrameTime < 0 ? 0 : Math.min(0.25, Math.max(0, hover.time.value - lastShadowFrameTime));
      lastShadowFrameTime = hover.time.value;
      shadowClock = Math.min(hover.time.value, shadowClock + shadowFrameDelta * SHADOW_SPEED);
      // Sample at 0.2s. A five-second buffer is short enough to keep as a
      // plain path; averaging positions here would collapse the circle
      // toward its centre and make the direction jump when old samples leave.
      if (hover.time.value - shadowSampleClock >= SHADOW_SAMPLE_SECONDS) {
        shadowHistory.push({ x: shadowTargetX, y: shadowTargetY, t: hover.time.value });
        shadowSampleClock = hover.time.value;
        while (shadowHistory.length > 1 && shadowHistory[0]!.t < hover.time.value - SHADOW_TRAIL_SECONDS) {
          shadowHistory.shift();
        }
      }
      let shadowPrevious = shadowHistory[0]!;
      let shadowNext = shadowHistory[shadowHistory.length - 1]!;
      for (const sample of shadowHistory) {
        if (sample.t <= shadowClock) shadowPrevious = sample;
        else { shadowNext = sample; break; }
      }
      const shadowSegment = shadowNext.t - shadowPrevious.t;
      const shadowMix = shadowSegment > 0
        ? Math.max(0, Math.min(1, (shadowClock - shadowPrevious.t) / shadowSegment))
        : 0;
      shadowPointer.set(
        shadowPrevious.x + (shadowNext.x - shadowPrevious.x) * shadowMix,
        shadowPrevious.y + (shadowNext.y - shadowPrevious.y) * shadowMix,
        0,
      );
      const shadowRadius = Math.hypot(shadowPointer.x, shadowPointer.y);
      const pointerAngle = shadowRadius > Math.max(cardWidth, cardHeight) * 0.06
        ? Math.atan2(-shadowPointer.y, -shadowPointer.x) * (180 / Math.PI)
        : hover.shadowAngleBase.value;
      // The pointer may swing the light far, but the shade only leans a little
      // around the authored angle; a large swing reads as a spinning lamp.
      const baseAngle = hover.shadowAngleBase.value;
      const fromBase = ((pointerAngle - baseAngle + 540) % 360) - 180;
      const limitedAngle = baseAngle + Math.max(-SHADOW_ANGLE_LIMIT, Math.min(SHADOW_ANGLE_LIMIT, fromBase));
      const angleDelta = ((limitedAngle - hover.shadowAngle.value + 540) % 360) - 180;
      const angleStep = Math.max(-2.5, Math.min(2.5, angleDelta * 0.08));
      hover.shadowAngle.value = ((hover.shadowAngle.value + angleStep) % 360 + 360) % 360;
      hover.shadowWallAngle.value = ((hover.shadowAngle.value + wallShadowAngleOffset) % 360 + 360) % 360;
      const renderShadowPass = (
        objects: THREE.Object3D[],
        target: THREE.WebGLRenderTarget,
        blur: number,
      ) => {
        if (!blurMaterial || !blurScene || !blurCamera) return false;
        for (const object of paintedObjects) object.visible = false;
        for (const object of shadowObjects) object.visible = false;
        for (const object of wallShadowObjects) object.visible = false;
        if (particlePoints) particlePoints.visible = false;
        for (const object of objects) object.visible = true;
        renderer.setRenderTarget(target);
        renderer.setClearColor(0x000000, 0);
        renderer.clear();
        camera.layers.enable(SHADOW_LAYER);
        renderer.render(scene, camera);
        camera.layers.disable(SHADOW_LAYER);
        renderer.setRenderTarget(null);
        for (const object of objects) object.visible = false;
        return true;
      };
      const compositeShadow = (target: THREE.WebGLRenderTarget, blur: number) => {
        if (!blurMaterial || !blurScene || !blurCamera) return;
        blurMaterial.uniforms.u_shadow.value = target.texture;
        blurMaterial.uniforms.u_blur.value = blur * renderer.getPixelRatio() * 0.55;
        renderer.autoClear = false;
        renderer.render(blurScene, blurCamera);
        renderer.autoClear = true;
      };
      const wallShadowActive = hover.wallShadowStrength.value > 1e-3;
      const shadowActive = hover.shadowStrength.value > 1e-3;
      let wallShadowDrawn = false;
      let shadowDrawn = false;
      if (wallShadowActive && wallShadow && wallShadowObjects.length && wallShadowTarget) {
        wallShadowDrawn = renderShadowPass(wallShadowObjects, wallShadowTarget, wallShadowBlur);
      }
      if (shadowActive && shadow && shadowTarget) {
        shadowDrawn = renderShadowPass(shadowObjects, shadowTarget, shadowBlur);
      }
      for (const object of paintedObjects) object.visible = true;
      if (particlePoints) particlePoints.visible = true;
      // Shadow meshes are only valid inside a shadow render target. Hiding them
      // here makes a leaked pass unable to paint a dark duplicate on the wall.
      for (const object of shadowObjects) object.visible = false;
      for (const object of wallShadowObjects) object.visible = false;
      // Draw the shade first and the vines over it, so a stem covers its own
      // shadow without needing a mask pass that would have to follow the warp.
      renderer.autoClear = false;
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      if (wallShadowActive && wallShadowDrawn && wallShadowTarget) compositeShadow(wallShadowTarget, wallShadowBlur);
      if (shadowActive && shadowDrawn && shadowTarget) compositeShadow(shadowTarget, shadowBlur);
      // compositeShadow restores autoClear, which would wipe the shade again.
      renderer.autoClear = false;
      renderer.render(scene, camera);
      renderer.autoClear = true;
    },
    dispose() {
      const geometries = new Set<THREE.BufferGeometry>();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) geometries.add(mesh.geometry);
      });
      geometries.forEach((geometry) => geometry.dispose());
      for (const materials of materialSets) for (const material of Object.values(materials)) material.dispose();
      shadow?.dispose();
      wallShadow?.dispose();
      particleMaterial?.dispose();
      for (const bloom of bloomSprites) bloom.sprite.material.dispose();
      for (const dot of bloomDots) dot.el.remove();
      bloomDots.length = 0;
      shadowTarget?.dispose();
      wallShadowTarget?.dispose();
      blurMaterial?.dispose();
      blurScene?.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      });
      renderer.dispose();
    },
  };
}
