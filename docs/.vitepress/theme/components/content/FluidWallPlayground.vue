<script setup lang="ts">
/**
 * Live playground for `<AkariFluidWall>`: the wall below is the real tag, and
 * every control rewrites its props. The snippet mirrors the current values so
 * a configuration can be copied straight into a page.
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import {
  FLUID_TEXTURES,
  FLUID_VARIANTS,
  FLUID_VARIANT_SPECS,
  type FluidBlendMode,
  type FluidTexture,
  type FluidTextureTone,
  type FluidVariant,
} from "../../fluid";
import {
  buildFluidWallSnippet,
  fluidColorValue,
  fluidPlaygroundValues,
  fluidTextureDefaults,
  type FluidPlaygroundKey,
  type FluidPlaygroundLight,
  type FluidPlaygroundValues,
} from "../../fluid-playground";
import type { VineBotanicalPart, VinePart } from "../../vine3d";
import { useAkariI18n } from "../../composables/useI18n";
import AkariFluidWall from "./AkariFluidWall.vue";

const { t } = useAkariI18n();

const textureOptions = FLUID_TEXTURES;
type FluidPlaygroundSwitch = "auto" | "on" | "off";

interface Slider {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  decimals: number;
  value: number;
  disabled?: boolean;
  set: (value: number) => void;
}

const variant = ref<FluidVariant>("silk");
const texture = ref<FluidTexture | "auto">("auto");
const textureTone = ref<FluidTextureTone>("auto");
const colorMode = ref<"tone" | "token" | "custom">("tone");
const colorToken = ref("var(--md-sys-color-tertiary)");
const customColor = ref("#7b5270");
const customColorAlpha = ref(1);
const vineBlend = ref<FluidBlendMode>("normal");
const vinePopoutBlend = ref<FluidBlendMode | "same">("same");
const light = ref<FluidPlaygroundLight>("end");
const height = ref(300);
const popout = ref<FluidPlaygroundSwitch>("auto");
const inward = ref<FluidPlaygroundSwitch>("auto");
const safeZone = ref("auto");
const ripple = ref(1);
const rippleSpeed = ref(1);
const rippleSize = ref(1);
const rippleRings = ref(2.2);
const rippleSway = ref(1);
const vineGlow = ref(1);
const shadow = ref(1);
const shadowSize = ref(1);
const shadowColor = ref("#12091c");
const shadowAngle = ref(303.5);
const shadowBlur = ref(6);
const wallShadow = ref(1);
const wallShadowSize = ref(1);
const wallShadowColor = ref("#12091c");
const wallShadowAngle = ref(180);
const wallShadowBlur = ref(6);
const underlayColor = ref("#ffffff");
const underlayOpacity = ref(0.18);
const underlayBlend = ref("additive");
const mote = ref(1);
const moteColor = ref("#ff86bf");
const moteBlend = ref("auto");
const presets = ref<FluidPlaygroundPreset[]>([]);
const presetName = ref("");
const selectedPreset = ref("");

const values = reactive(fluidPlaygroundValues("silk"));
const textureSize = ref(fluidTextureDefaults("silk", "auto").textureSize);
const textureDensity = ref(fluidTextureDefaults("silk", "auto").textureDensity);
const textureOpacity = ref(fluidTextureDefaults("silk", "auto").textureOpacity);

const resolvedTexture = computed<FluidTexture>(() =>
  texture.value === "auto" ? FLUID_VARIANT_SPECS[variant.value].texture : texture.value,
);

const textureColor = computed(() =>
  colorMode.value === "tone"
    ? ""
    : colorMode.value === "token"
      ? colorToken.value
      : fluidColorValue(customColor.value, customColorAlpha.value),
);

type VinePartKey = VinePart | VineBotanicalPart | "base";
type VinePaletteKey = "wall" | "popout";

interface FluidPlaygroundSnapshot {
  variant: FluidVariant;
  texture: FluidTexture | "auto";
  textureTone: FluidTextureTone;
  colorMode: "tone" | "token" | "custom";
  colorToken: string;
  customColor: string;
  customColorAlpha: number;
  vineBlend: FluidBlendMode;
  vinePopoutBlend: FluidBlendMode | "same";
  palettes: Record<VinePaletteKey, Partial<Record<VinePartKey, { hex: string; alpha: number }>>>;
  light: FluidPlaygroundLight;
  height: number;
  popout: FluidPlaygroundSwitch;
  inward: FluidPlaygroundSwitch;
  safeZone: string;
  ripple: number;
  rippleSpeed: number;
  rippleSize: number;
  rippleRings: number;
  rippleSway: number;
  vineGlow: number;
  shadow: number;
  shadowSize: number;
  shadowColor: string;
  shadowAngle: number;
  shadowBlur: number;
  wallShadow: number;
  wallShadowSize: number;
  wallShadowColor: string;
  wallShadowAngle: number;
  wallShadowBlur: number;
  underlayColor: string;
  underlayOpacity: number;
  underlayBlend: string;
  mote: number;
  moteColor: string;
  moteBlend: string;
  values: FluidPlaygroundValues;
  textureSize: number;
  textureDensity: number;
  textureOpacity: number;
}

interface FluidPlaygroundPreset {
  id: string;
  name: string;
  savedAt: number;
  config: FluidPlaygroundSnapshot;
}

type BlendLabel =
  | "fluidDemoBlendNormal"
  | "fluidDemoBlendMultiply"
  | "fluidDemoBlendScreen"
  | "fluidDemoBlendOverlay"
  | "fluidDemoBlendSoftLight"
  | "fluidDemoBlendDifference";

const POP_BLEND_OPTIONS: ReadonlyArray<{ value: FluidBlendMode | "same"; label: BlendLabel | "fluidDemoBlendSame" }> = [
  { value: "same", label: "fluidDemoBlendSame" },
  { value: "normal", label: "fluidDemoBlendNormal" },
  { value: "multiply", label: "fluidDemoBlendMultiply" },
  { value: "screen", label: "fluidDemoBlendScreen" },
  { value: "overlay", label: "fluidDemoBlendOverlay" },
  { value: "soft-light", label: "fluidDemoBlendSoftLight" },
  { value: "difference", label: "fluidDemoBlendDifference" },
];

const BLEND_OPTIONS: ReadonlyArray<{ value: FluidBlendMode; label: BlendLabel }> = [
  { value: "normal", label: "fluidDemoBlendNormal" },
  { value: "multiply", label: "fluidDemoBlendMultiply" },
  { value: "screen", label: "fluidDemoBlendScreen" },
  { value: "overlay", label: "fluidDemoBlendOverlay" },
  { value: "soft-light", label: "fluidDemoBlendSoftLight" },
  { value: "difference", label: "fluidDemoBlendDifference" },
];

const VINE_PART_OPTIONS = [
  { key: "leaf", label: "fluidDemoVineLeaf" },
  { key: "flower", label: "fluidDemoVineFlower" },
  { key: "flowerStem", label: "fluidDemoVineFlowerStem" },
  { key: "bud", label: "fluidDemoVineBud" },
  { key: "base", label: "fluidDemoVineBase" },
  { key: "fill", label: "fluidDemoVineFill" },
  { key: "tint", label: "fluidDemoVineTint" },
  { key: "halo", label: "fluidDemoVineHalo" },
  { key: "edge", label: "fluidDemoVineEdge" },
  { key: "fine", label: "fluidDemoVineFine" },
] as const;

const vinePalettes = reactive<
  Record<VinePaletteKey, Partial<Record<VinePartKey, { hex: string; alpha: number }>>>
>({
  wall: {},
  popout: {},
});

function palettePayload(key: VinePaletteKey): Partial<Record<VinePartKey, string>> {
  const out: Partial<Record<VinePartKey, string>> = {};
  for (const part of VINE_PART_OPTIONS) {
    const entry = vinePalettes[key][part.key];
    if (entry) out[part.key] = fluidColorValue(entry.hex, entry.alpha);
  }
  return out;
}

const vineColorsPayload = computed(() => palettePayload("wall"));
const vinePopoutColorsPayload = computed(() => palettePayload("popout"));

function vinePartHex(key: VinePaletteKey, part: VinePartKey): string {
  return vinePalettes[key][part]?.hex ?? "#7b5270";
}

function vinePartAlpha(key: VinePaletteKey, part: VinePartKey): number {
  return vinePalettes[key][part]?.alpha ?? 1;
}

function setVinePartColor(key: VinePaletteKey, part: VinePartKey, event: Event): void {
  vinePalettes[key][part] = {
    hex: (event.target as HTMLInputElement).value,
    alpha: vinePartAlpha(key, part),
  };
}

function setVinePartAlpha(key: VinePaletteKey, part: VinePartKey, event: Event): void {
  vinePalettes[key][part] = {
    hex: vinePartHex(key, part),
    alpha: Number((event.target as HTMLInputElement).value),
  };
}

function clearVinePart(key: VinePaletteKey, part: VinePartKey): void {
  delete vinePalettes[key][part];
}

const overlayDisabled = computed(() => resolvedTexture.value === "none");
const vineSelected = computed(() => resolvedTexture.value === "vine");
const popoutValue = computed<boolean | "auto">(() =>
  popout.value === "auto" ? "auto" : popout.value === "on",
);
const inwardValue = computed<boolean | "auto">(() =>
  inward.value === "auto" ? "auto" : inward.value === "on",
);
const safeZoneValue = computed(() => safeZone.value.trim() || "auto");

const structureSliders = computed<Slider[]>(() => [
  {
    key: "height",
    label: t("fluidDemoHeight"),
    min: 160,
    max: 460,
    step: 10,
    decimals: 0,
    value: height.value,
    set: (value) => (height.value = value),
  },
]);

const flowSliders = computed<Slider[]>(() => [
  {
    key: "speed",
    label: t("fluidDemoSpeed"),
    min: 0.1,
    max: 2.5,
    step: 0.05,
    decimals: 2,
    value: values.speed,
    set: (value) => (values.speed = value),
  },
  {
    key: "scale",
    label: t("fluidDemoScale"),
    min: 0.6,
    max: 5,
    step: 0.05,
    decimals: 2,
    value: values.scale,
    set: (value) => (values.scale = value),
  },
  {
    key: "curl",
    label: t("fluidDemoCurl"),
    min: 0,
    max: 24,
    step: 0.5,
    decimals: 1,
    value: values.curl,
    set: (value) => (values.curl = value),
  },
  {
    key: "warp",
    label: t("fluidDemoWarp"),
    min: 0,
    max: 1.6,
    step: 0.05,
    decimals: 2,
    value: values.warp,
    set: (value) => (values.warp = value),
  },
  {
    key: "petal",
    label: t("fluidDemoPetal"),
    min: 0,
    max: 1,
    step: 0.01,
    decimals: 2,
    value: values.petal,
    set: (value) => (values.petal = value),
  },
  {
    key: "tone",
    label: t("fluidDemoTone"),
    min: 0,
    max: 1,
    step: 0.01,
    decimals: 2,
    value: values.tone,
    set: (value) => (values.tone = value),
  },
]);

const lightSliders = computed<Slider[]>(() => [
  {
    key: "glow",
    label: t("fluidDemoGlow"),
    min: 0,
    max: 2,
    step: 0.05,
    decimals: 2,
    value: values.glow,
    set: (value) => (values.glow = value),
  },
]);

const rippleSliders = computed<Slider[]>(() => [
  {
    key: "ripple",
    label: t("fluidDemoRipple"),
    min: 0,
    max: 3,
    step: 0.05,
    decimals: 2,
    value: ripple.value,
    set: (value) => (ripple.value = value),
  },
  {
    key: "rippleSpeed",
    label: t("fluidDemoRippleSpeed"),
    min: 0,
    max: 4,
    step: 0.05,
    decimals: 2,
    value: rippleSpeed.value,
    set: (value) => (rippleSpeed.value = value),
  },
  {
    key: "rippleSize",
    label: t("fluidDemoRippleSize"),
    min: 0.25,
    max: 3,
    step: 0.05,
    decimals: 2,
    value: rippleSize.value,
    set: (value) => (rippleSize.value = value),
  },
  {
    key: "rippleRings",
    label: t("fluidDemoRippleRings"),
    min: 0.5,
    max: 6,
    step: 0.1,
    decimals: 1,
    value: rippleRings.value,
    set: (value) => (rippleRings.value = value),
  },
  {
    key: "rippleSway",
    label: t("fluidDemoRippleSway"),
    min: 0,
    max: 3,
    step: 0.05,
    decimals: 2,
    value: rippleSway.value,
    set: (value) => (rippleSway.value = value),
  },
  {
    key: "vineGlow",
    label: t("fluidDemoVineGlow"),
    min: 0,
    max: 2,
    step: 0.05,
    decimals: 2,
    value: vineGlow.value,
    set: (value) => (vineGlow.value = value),
  },
]);

const shadowSliders = computed<Slider[]>(() => [
  {
    key: "shadow",
    label: t("fluidDemoShadow"),
    min: 0,
    max: 3,
    step: 0.05,
    decimals: 2,
    value: shadow.value,
    set: (value) => (shadow.value = value),
  },
  {
    key: "shadowSize",
    label: t("fluidDemoShadowSize"),
    min: 0.3,
    max: 3,
    step: 0.05,
    decimals: 2,
    value: shadowSize.value,
    set: (value) => (shadowSize.value = value),
  },
  {
    key: "shadowBlur",
    label: t("fluidDemoShadowBlur"),
    min: 0,
    max: 24,
    step: 1,
    decimals: 0,
    value: shadowBlur.value,
    set: (value) => (shadowBlur.value = value),
  },
]);

const wallShadowSliders = computed<Slider[]>(() => [
  {
    key: "wallShadow",
    label: t("fluidDemoWallShadow"),
    min: 0,
    max: 3,
    step: 0.05,
    decimals: 2,
    value: wallShadow.value,
    set: (value) => (wallShadow.value = value),
  },
  {
    key: "wallShadowSize",
    label: t("fluidDemoWallShadowSize"),
    min: 0.3,
    max: 3,
    step: 0.05,
    decimals: 2,
    value: wallShadowSize.value,
    set: (value) => (wallShadowSize.value = value),
  },
  {
    key: "wallShadowBlur",
    label: t("fluidDemoWallShadowBlur"),
    min: 0,
    max: 24,
    step: 1,
    decimals: 0,
    value: wallShadowBlur.value,
    set: (value) => (wallShadowBlur.value = value),
  },
]);

const overlaySliders = computed<Slider[]>(() => [
  {
    key: "grid",
    label: t("fluidDemoGrid"),
    min: 0,
    max: 400,
    step: 4,
    decimals: 0,
    value: values.grid,
    disabled: false,
    set: (value) => (values.grid = value),
  },
  {
    key: "textureSize",
    label: t("fluidDemoTextureSize"),
    min: 80,
    max: 640,
    step: 8,
    decimals: 0,
    value: textureSize.value,
    disabled: overlayDisabled.value,
    set: (value) => (textureSize.value = value),
  },
  {
    key: "textureDensity",
    label: t("fluidDemoTextureDensity"),
    min: 0,
    max: 3,
    step: 0.05,
    decimals: 2,
    value: textureDensity.value,
    disabled: overlayDisabled.value,
    set: (value) => (textureDensity.value = value),
  },
  {
    key: "textureOpacity",
    label: t("fluidDemoTextureOpacity"),
    min: 0,
    max: 1,
    step: 0.01,
    decimals: 2,
    value: textureOpacity.value,
    disabled: overlayDisabled.value,
    set: (value) => (textureOpacity.value = value),
  },
]);

const snippet = computed(() =>
  buildFluidWallSnippet({
    variant: variant.value,
    texture: texture.value,
    textureTone: textureTone.value,
    light: light.value,
    height: height.value,
    values: { ...values },
    textureSize: textureSize.value,
    textureDensity: textureDensity.value,
    textureOpacity: textureOpacity.value,
    textureColor: textureColor.value,
    mote: mote.value,
    moteColor: moteColor.value,
    moteBlend: moteBlend.value,
    vineColors: vineColorsPayload.value,
    vineBlend: vineBlend.value,
    vinePopoutBlend: vinePopoutBlend.value === "same" ? undefined : vinePopoutBlend.value,
    vinePopoutColors: vinePopoutColorsPayload.value,

    ripple: ripple.value,
    rippleSpeed: rippleSpeed.value,
    rippleSize: rippleSize.value,
    rippleRings: rippleRings.value,
    rippleSway: rippleSway.value,
    vineGlow: vineGlow.value,
    shadow: shadow.value,
    shadowSize: shadowSize.value,
    shadowColor: shadowColor.value,
    shadowAngle: shadowAngle.value,
    shadowBlur: shadowBlur.value,
    wallShadow: wallShadow.value,
    wallShadowSize: wallShadowSize.value,
    wallShadowColor: wallShadowColor.value,
    wallShadowAngle: wallShadowAngle.value,
    wallShadowBlur: wallShadowBlur.value,
    popout: popoutValue.value,
    inward: inwardValue.value,
    safeZone: safeZoneValue.value,
  }),
);

function formatValue(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

function onSlider(slider: Slider, event: Event): void {
  slider.set(Number((event.target as HTMLInputElement).value));
}

function applyVariantSeed(next: FluidVariant): void {
  Object.assign(values, fluidPlaygroundValues(next));
  applyTextureSeed(next, "auto");
}

function applyTextureSeed(next: FluidVariant, nextTexture: FluidTexture | "auto"): void {
  const defaults = fluidTextureDefaults(next, nextTexture);
  textureSize.value = defaults.textureSize;
  textureDensity.value = defaults.textureDensity;
  textureOpacity.value = defaults.textureOpacity;
}

function chooseVariant(next: FluidVariant): void {
  variant.value = next;
  texture.value = "auto";
  applyVariantSeed(next);
}

function onTextureChange(): void {
  applyTextureSeed(variant.value, texture.value);
}

function reset(): void {
  variant.value = "silk";
  texture.value = "auto";
  textureTone.value = "auto";
  colorMode.value = "tone";
  customColorAlpha.value = 1;
  vineBlend.value = "normal";
  vinePopoutBlend.value = "same";
  for (const key of ["wall", "popout"] as const) {
    for (const part of VINE_PART_OPTIONS) delete vinePalettes[key][part.key];
  }
  light.value = "end";
  height.value = 300;
  popout.value = "auto";
  inward.value = "auto";
  safeZone.value = "auto";
  ripple.value = 1;
  rippleSpeed.value = 1;
  rippleSize.value = 1;
  rippleRings.value = 2.2;
  rippleSway.value = 1;
  vineGlow.value = 1;
  shadow.value = 1;
  shadowSize.value = 1;
  shadowColor.value = "#12091c";
  shadowAngle.value = 303.5;
  shadowBlur.value = 6;
  wallShadow.value = 1;
  wallShadowSize.value = 1;
  wallShadowColor.value = "#12091c";
  wallShadowAngle.value = 180;
  wallShadowBlur.value = 6;
  underlayColor.value = "#ffffff";
  underlayOpacity.value = 0.18;
  underlayBlend.value = "additive";
  mote.value = 1;
  moteColor.value = "#ff86bf";
  moteBlend.value = "auto";
  applyVariantSeed("silk");
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function randomBetween(min: number, max: number, step: number): number {
  return roundTo(min + Math.random() * (max - min), step);
}

function randomize(): void {
  const next = FLUID_VARIANTS[Math.floor(Math.random() * FLUID_VARIANTS.length)];
  variant.value = next;
  const overlays = FLUID_TEXTURES.filter((item) => item !== "vine");
  texture.value = Math.random() < 0.3 ? "none" : overlays[Math.floor(Math.random() * overlays.length)];
  if (texture.value === FLUID_VARIANT_SPECS[next].texture) texture.value = "auto";
  textureTone.value = "auto";
  colorMode.value = "tone";
  customColorAlpha.value = 1;
  vineBlend.value = "normal";
  vinePopoutBlend.value = "same";
  for (const key of ["wall", "popout"] as const) {
    for (const part of VINE_PART_OPTIONS) delete vinePalettes[key][part.key];
  }
  light.value = (["start", "center", "end"] as const)[Math.floor(Math.random() * 3)];
  height.value = 240 + Math.round(Math.random() * 5) * 20;
  popout.value = "auto";
  inward.value = "auto";
  safeZone.value = "auto";
  ripple.value = randomBetween(0.2, 2.2, 0.05);
  rippleSpeed.value = randomBetween(0.4, 2.2, 0.05);
  rippleSize.value = randomBetween(0.6, 1.8, 0.05);
  rippleRings.value = randomBetween(1, 4.5, 0.1);
  rippleSway.value = randomBetween(0.2, 2.2, 0.05);
  vineGlow.value = randomBetween(0.4, 1.8, 0.05);
  shadow.value = randomBetween(0.6, 2, 0.05);
  shadowSize.value = randomBetween(0.6, 2, 0.05);
  shadowAngle.value = Math.round(randomBetween(0, 360, 1));
  shadowBlur.value = Math.round(randomBetween(0, 18, 1));
  wallShadow.value = randomBetween(0.4, 1.8, 0.05);
  wallShadowSize.value = randomBetween(0.6, 2, 0.05);
  wallShadowAngle.value = Math.round(randomBetween(0, 360, 1));
  wallShadowBlur.value = Math.round(randomBetween(0, 18, 1));
  underlayColor.value = "#ffffff";
  underlayOpacity.value = randomBetween(0.05, 0.45, 0.01);
  underlayBlend.value = "additive";
  mote.value = randomBetween(0.4, 1.6, 0.05);
  moteColor.value = randomBetween(0, 1, 0.001) > 0.5 ? "#ff86bf" : "#a6f0ff";
  moteBlend.value = "auto";
  applyVariantSeed(next);
  values.scale = randomBetween(0.8, 3.4, 0.05);
  values.curl = randomBetween(1.5, 16, 0.5);
  values.warp = randomBetween(0.15, 1.25, 0.05);
  values.petal =
    next === "blossom"
      ? randomBetween(0.1, 0.9, 0.01)
      : next === "silk"
        ? randomBetween(0, 0.7, 0.01)
        : 0;
  values.grid = [0, 32, 44, 56, 72, 96, 120][Math.floor(Math.random() * 7)];
  values.glow = randomBetween(0.3, 1.8, 0.05);
  values.speed = randomBetween(0.4, 1.8, 0.05);
  values.tone = randomBetween(0, 0.65, 0.01);
  applyTextureSeed(next, texture.value);
  if (texture.value !== "none" && resolvedTexture.value !== "none") {
    textureOpacity.value = randomBetween(0.3, 0.9, 0.01);
  }
}

const PRESET_STORE = "akari.fluid.wall.playground.presets.v1";

function snapshotPlayground(): FluidPlaygroundSnapshot {
  return {
    variant: variant.value,
    texture: texture.value,
    textureTone: textureTone.value,
    colorMode: colorMode.value,
    colorToken: colorToken.value,
    customColor: customColor.value,
    customColorAlpha: customColorAlpha.value,
    vineBlend: vineBlend.value,
    vinePopoutBlend: vinePopoutBlend.value,
    palettes: JSON.parse(JSON.stringify(vinePalettes)) as FluidPlaygroundSnapshot["palettes"],
    light: light.value,
    height: height.value,
    popout: popout.value,
    inward: inward.value,
    safeZone: safeZone.value,
    ripple: ripple.value,
    rippleSpeed: rippleSpeed.value,
    rippleSize: rippleSize.value,
    rippleRings: rippleRings.value,
    rippleSway: rippleSway.value,
    vineGlow: vineGlow.value,
    shadow: shadow.value,
    shadowSize: shadowSize.value,
    shadowColor: shadowColor.value,
    shadowAngle: shadowAngle.value,
    shadowBlur: shadowBlur.value,
    wallShadow: wallShadow.value,
    wallShadowSize: wallShadowSize.value,
    wallShadowColor: wallShadowColor.value,
    wallShadowAngle: wallShadowAngle.value,
    wallShadowBlur: wallShadowBlur.value,
    underlayColor: underlayColor.value,
    underlayOpacity: underlayOpacity.value,
    underlayBlend: underlayBlend.value,
    mote: mote.value,
    moteColor: moteColor.value,
    moteBlend: moteBlend.value,
    values: { ...values },
    textureSize: textureSize.value,
    textureDensity: textureDensity.value,
    textureOpacity: textureOpacity.value,
  };
}

function applyPlaygroundSnapshot(config: FluidPlaygroundSnapshot): void {
  variant.value = config.variant;
  texture.value = config.texture;
  textureTone.value = config.textureTone;
  colorMode.value = config.colorMode;
  colorToken.value = config.colorToken;
  customColor.value = config.customColor;
  customColorAlpha.value = config.customColorAlpha;
  vineBlend.value = config.vineBlend;
  vinePopoutBlend.value = config.vinePopoutBlend;
  for (const key of ["wall", "popout"] as const) {
    for (const part of VINE_PART_OPTIONS) delete vinePalettes[key][part.key];
    Object.assign(vinePalettes[key], config.palettes?.[key] ?? {});
  }
  light.value = config.light;
  height.value = config.height;
  popout.value = config.popout;
  inward.value = config.inward;
  safeZone.value = config.safeZone;
  ripple.value = config.ripple;
  rippleSpeed.value = config.rippleSpeed;
  rippleSize.value = config.rippleSize;
  rippleRings.value = config.rippleRings ?? 2.2;
  rippleSway.value = config.rippleSway ?? 1;
  vineGlow.value = config.vineGlow ?? 1;
  shadow.value = config.shadow ?? 1;
  shadowSize.value = config.shadowSize ?? 1;
  shadowColor.value = config.shadowColor ?? "#12091c";
  shadowAngle.value = config.shadowAngle ?? 303.5;
  shadowBlur.value = config.shadowBlur ?? 6;
  wallShadow.value = config.wallShadow ?? 1;
  wallShadowSize.value = config.wallShadowSize ?? 1;
  wallShadowColor.value = config.wallShadowColor ?? "#12091c";
  wallShadowAngle.value = config.wallShadowAngle ?? 180;
  wallShadowBlur.value = config.wallShadowBlur ?? 6;
  underlayColor.value = config.underlayColor ?? "#ffffff";
  underlayOpacity.value = config.underlayOpacity ?? 0.18;
  underlayBlend.value = config.underlayBlend ?? "additive";
  mote.value = config.mote ?? 1;
  moteColor.value = config.moteColor ?? "#ff86bf";
  moteBlend.value = config.moteBlend ?? "auto";
  Object.assign(values, config.values);
  textureSize.value = config.textureSize;
  textureDensity.value = config.textureDensity;
  textureOpacity.value = config.textureOpacity;
}

function readPresets(): void {
  try {
    const raw = window.localStorage.getItem(PRESET_STORE);
    if (!raw) return;
    const parsed = JSON.parse(raw) as FluidPlaygroundPreset[];
    if (Array.isArray(parsed)) {
      presets.value = parsed.filter((item) => item && typeof item.id === "string");
      selectedPreset.value = presets.value[0]?.id ?? "";
    }
  } catch {
    presets.value = [];
  }
}

function persistPresets(): void {
  try {
    window.localStorage.setItem(PRESET_STORE, JSON.stringify(presets.value));
  } catch {
    // Storage can be blocked; the presets still work for this tab.
  }
}

function savePreset(): void {
  const name = presetName.value.trim() || `${t("fluidDemoPresets")} ${presets.value.length + 1}`;
  const preset: FluidPlaygroundPreset = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    savedAt: Date.now(),
    config: snapshotPlayground(),
  };
  presets.value = [...presets.value, preset];
  selectedPreset.value = preset.id;
  presetName.value = "";
  persistPresets();
}

function loadPreset(): void {
  const preset = presets.value.find((item) => item.id === selectedPreset.value);
  if (preset) applyPlaygroundSnapshot(preset.config);
}

function deletePreset(): void {
  presets.value = presets.value.filter((item) => item.id !== selectedPreset.value);
  selectedPreset.value = presets.value[0]?.id ?? "";
  persistPresets();
}

onMounted(readPresets);

const copied = ref(false);
let copiedTimer = 0;

async function copySnippet(): Promise<void> {
  try {
    await navigator.clipboard.writeText(snippet.value);
  } catch {
    const area = document.createElement("textarea");
    area.value = snippet.value;
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  copied.value = true;
  window.clearTimeout(copiedTimer);
  copiedTimer = window.setTimeout(() => (copied.value = false), 1600);
}

onBeforeUnmount(() => window.clearTimeout(copiedTimer));

</script>

<template>
  <div class="fluid-playground">
    <div class="fluid-playground__stage">
      <div class="fluid-playground__badge">
        <span>{{ t("fluidDemoPreview") }}</span>
        <code>{{ variant }} · {{ height }}px</code>
      </div>
      <AkariFluidWall
        :variant="variant"
        :texture="texture === 'auto' ? undefined : texture"
        :texture-tone="textureTone"
        :texture-color="textureColor || undefined"
        :vine-colors="vineColorsPayload"
        :vine-blend="vineBlend"
        :vine-popout-blend="vinePopoutBlend === 'same' ? undefined : vinePopoutBlend"
        :vine-popout-colors="vinePopoutColorsPayload"
        :ripple="ripple"
        :ripple-speed="rippleSpeed"
        :ripple-size="rippleSize"
        :ripple-rings="rippleRings"
        :ripple-sway="rippleSway"
        :vine-glow="vineGlow"
        :shadow="shadow"
        :shadow-size="shadowSize"
        :shadow-color="shadowColor"
        :shadow-angle="shadowAngle"
        :shadow-blur="shadowBlur"
        :wall-shadow="wallShadow"
        :wall-shadow-size="wallShadowSize"
        :wall-shadow-color="wallShadowColor"
        :wall-shadow-angle="wallShadowAngle"
        :wall-shadow-blur="wallShadowBlur"
        :underlay-color="underlayColor"
        :underlay-opacity="underlayOpacity"
        :underlay-blend="underlayBlend"
        :mote="mote"
        :mote-color="moteColor"
        :mote-blend="moteBlend"
        :height="`${height}px`"
        :light="light"
        :scale="values.scale"
        :curl="values.curl"
        :warp="values.warp"
        :tone="values.tone"
        :petal="values.petal"
        :grid="values.grid"
        :glow="values.glow"
        :speed="values.speed"
        :texture-size="textureSize"
        :texture-density="textureDensity"
        :texture-opacity="textureOpacity"
        :popout="popoutValue"
        :inward="inwardValue"
        :safe-zone="safeZoneValue"
      />
    </div>

    <div class="fluid-playground__panel">
      <div class="fluid-playground__variants" role="group" :aria-label="t('fluidDemoVariant')">
        <button
          v-for="item in FLUID_VARIANTS"
          :key="item"
          type="button"
          :aria-pressed="variant === item"
          @click="chooseVariant(item)"
        >
          {{ item }}
        </button>
      </div>

      <div class="fluid-playground__groups">
        <fieldset class="fluid-playground__group">
          <legend>{{ t("fluidDemoStructure") }}</legend>
          <label class="fluid-playground__field">
            <span>{{ t("fluidDemoTexture") }}</span>
            <select v-model="texture" @change="onTextureChange">
              <option value="auto">{{ t("fluidDemoTextureAuto") }}</option>
              <option v-for="item in textureOptions" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </label>
          <label class="fluid-playground__field">
            <span>{{ t("fluidDemoTextureTone") }}</span>
            <select v-model="textureTone" :disabled="overlayDisabled">
              <option value="auto">{{ t("dockDemoAuto") }}</option>
              <option value="ink">{{ t("fluidDemoToneInk") }}</option>
              <option value="light">{{ t("fluidDemoToneLight") }}</option>
            </select>
          </label>
          <label class="fluid-playground__field">
            <span>{{ t("fluidDemoTextureColor") }}</span>
            <select v-model="colorMode" :disabled="overlayDisabled">
              <option value="tone">{{ t("fluidDemoColorTone") }}</option>
              <option value="token">{{ t("fluidDemoColorToken") }}</option>
              <option value="custom">{{ t("fluidDemoColorCustom") }}</option>
            </select>
          </label>
          <label v-if="colorMode === 'token'" class="fluid-playground__field">
            <span>{{ t("fluidDemoColorToken") }}</span>
            <select v-model="colorToken" :disabled="overlayDisabled">
              <option value="var(--md-sys-color-primary)">primary</option>
              <option value="var(--md-sys-color-tertiary)">tertiary</option>
              <option value="var(--md-sys-color-secondary)">secondary</option>
              <option value="var(--md-sys-color-on-surface)">on-surface</option>
              <option value="var(--md-sys-color-inverse-on-surface)">inverse-on-surface</option>
            </select>
          </label>
          <label v-if="colorMode === 'custom'" class="fluid-playground__field">
            <span>{{ t("fluidDemoColorPicker") }}</span>
            <input v-model="customColor" class="fluid-playground__color" type="color" :disabled="overlayDisabled" />
          </label>
          <label
            v-if="colorMode === 'custom'"
            class="fluid-playground__field fluid-playground__field--slider"
          >
            <span>{{ t("fluidDemoAlpha") }}</span>
            <input
              v-model.number="customColorAlpha"
              type="range"
              min="0"
              max="1"
              step="0.01"
              :disabled="overlayDisabled"
            />
            <output>{{ customColorAlpha.toFixed(2) }}</output>
          </label>
          <label
            v-for="slider in structureSliders"
            :key="slider.key"
            class="fluid-playground__field fluid-playground__field--slider"
          >
            <span>{{ slider.label }}</span>
            <input
              type="range"
              :min="slider.min"
              :max="slider.max"
              :step="slider.step"
              :value="slider.value"
              @input="onSlider(slider, $event)"
            />
            <output>{{ formatValue(slider.value, slider.decimals) }}</output>
          </label>
        </fieldset>

        <fieldset class="fluid-playground__group">
          <legend>{{ t("fluidDemoFlow") }}</legend>
          <label
            v-for="slider in flowSliders"
            :key="slider.key"
            class="fluid-playground__field fluid-playground__field--slider"
          >
            <span>{{ slider.label }}</span>
            <input
              type="range"
              :min="slider.min"
              :max="slider.max"
              :step="slider.step"
              :value="slider.value"
              @input="onSlider(slider, $event)"
            />
            <output>{{ formatValue(slider.value, slider.decimals) }}</output>
          </label>
        </fieldset>

        <fieldset class="fluid-playground__group">
          <legend>{{ t("fluidDemoLightGroup") }}</legend>
          <label class="fluid-playground__field">
            <span>{{ t("fluidDemoLight") }}</span>
            <select v-model="light">
              <option value="start">{{ t("dockDemoStart") }}</option>
              <option value="center">{{ t("dockDemoCenter") }}</option>
              <option value="end">{{ t("dockDemoEnd") }}</option>
            </select>
          </label>
          <label
            v-for="slider in lightSliders"
            :key="slider.key"
            class="fluid-playground__field fluid-playground__field--slider"
          >
            <span>{{ slider.label }}</span>
            <input
              type="range"
              :min="slider.min"
              :max="slider.max"
              :step="slider.step"
              :value="slider.value"
              @input="onSlider(slider, $event)"
            />
            <output>{{ formatValue(slider.value, slider.decimals) }}</output>
          </label>
        </fieldset>

        <fieldset class="fluid-playground__group">
          <legend>{{ t("fluidDemoOverlay") }}</legend>
          <label
            v-for="slider in overlaySliders"
            :key="slider.key"
            class="fluid-playground__field fluid-playground__field--slider"
            :data-disabled="slider.disabled ? '' : undefined"
          >
            <span>{{ slider.label }}</span>
            <input
              type="range"
              :min="slider.min"
              :max="slider.max"
              :step="slider.step"
              :value="slider.value"
              :disabled="slider.disabled"
              @input="onSlider(slider, $event)"
            />
            <output>{{ formatValue(slider.value, slider.decimals) }}</output>
          </label>
          <template v-if="vineSelected">
            <label class="fluid-playground__field">
              <span>{{ t("fluidDemoPopout") }}</span>
              <select v-model="popout">
                <option value="auto">{{ t("dockDemoAuto") }}</option>
                <option value="on">{{ t("fluidDemoOn") }}</option>
                <option value="off">{{ t("fluidDemoOff") }}</option>
              </select>
            </label>
            <label class="fluid-playground__field">
              <span>{{ t("fluidDemoInward") }}</span>
              <select v-model="inward">
                <option value="auto">{{ t("dockDemoAuto") }}</option>
                <option value="on">{{ t("fluidDemoOn") }}</option>
                <option value="off">{{ t("fluidDemoOff") }}</option>
              </select>
            </label>
            <label class="fluid-playground__field">
              <span>{{ t("fluidDemoSafeZone") }}</span>
              <input
                v-model="safeZone"
                class="fluid-playground__text"
                type="text"
                dir="ltr"
                placeholder="auto, 0 0 70% 60%"
              />
            </label>
            <label
              v-for="slider in rippleSliders"
              :key="slider.key"
              class="fluid-playground__field fluid-playground__field--slider"
            >
              <span>{{ slider.label }}</span>
              <input
                type="range"
                :min="slider.min"
                :max="slider.max"
                :step="slider.step"
                :value="slider.value"
                @input="onSlider(slider, $event)"
              />
              <output>{{ formatValue(slider.value, slider.decimals) }}</output>
            </label>
            <label
              v-for="slider in shadowSliders"
              :key="slider.key"
              class="fluid-playground__field fluid-playground__field--slider"
            >
              <span>{{ slider.label }}</span>
              <input
                type="range"
                :min="slider.min"
                :max="slider.max"
                :step="slider.step"
                :value="slider.value"
                @input="onSlider(slider, $event)"
              />
              <output>{{ formatValue(slider.value, slider.decimals) }}</output>
            </label>
            <label class="fluid-playground__field">
              <span>{{ t("fluidDemoShadowColor") }}</span>
              <input v-model="shadowColor" class="fluid-playground__color" type="color" dir="ltr" />
            </label>
            <label class="fluid-playground__field">
              <span>{{ t("fluidDemoShadowAngle") }}</span>
              <input v-model.number="shadowAngle" type="range" min="0" max="360" step="1" />
              <output>{{ Math.round(shadowAngle) }}°</output>
            </label>
            <label
              v-for="slider in wallShadowSliders"
              :key="slider.key"
              class="fluid-playground__field fluid-playground__field--slider"
            >
              <span>{{ slider.label }}</span>
              <input
                type="range"
                :min="slider.min"
                :max="slider.max"
                :step="slider.step"
                :value="slider.value"
                @input="onSlider(slider, $event)"
              />
              <output>{{ formatValue(slider.value, slider.decimals) }}</output>
            </label>
            <label class="fluid-playground__field">
              <span>{{ t("fluidDemoWallShadowColor") }}</span>
              <input v-model="wallShadowColor" class="fluid-playground__color" type="color" dir="ltr" />
            </label>
            <label class="fluid-playground__field">
              <span>{{ t("fluidDemoWallShadowAngle") }}</span>
              <input v-model.number="wallShadowAngle" type="range" min="0" max="360" step="1" />
              <output>{{ Math.round(wallShadowAngle) }}°</output>
            </label>
            <label class="fluid-playground__field">
              <span>{{ t("fluidDemoVineUnderlayColor") }}</span>
              <input v-model="underlayColor" class="fluid-playground__color" type="color" dir="ltr" />
            </label>
            <label class="fluid-playground__field fluid-playground__field--slider">
              <span>{{ t("fluidDemoVineUnderlay") }}</span>
              <input v-model.number="underlayOpacity" type="range" min="0" max="1" step="0.01" />
              <output>{{ underlayOpacity.toFixed(2) }}</output>
            </label>
            <label class="fluid-playground__field">
              <span>{{ t("fluidDemoVineUnderlayBlend") }}</span>
              <select v-model="underlayBlend">
                <option value="additive">{{ t("fluidDemoBlendScreen") }}</option>
                <option value="screen">{{ t("fluidDemoBlendScreen") }}</option>
                <option value="normal">{{ t("fluidDemoBlendNormal") }}</option>
                <option value="multiply">{{ t("fluidDemoBlendMultiply") }}</option>
                <option value="subtractive">{{ t("fluidDemoBlendDifference") }}</option>
              </select>
            </label>
            <label class="fluid-playground__field fluid-playground__field--slider">
              <span>{{ t("fluidDemoMote") }}</span>
              <input v-model.number="mote" type="range" min="0" max="3" step="0.05" />
              <output>{{ mote.toFixed(2) }}</output>
            </label>
            <label class="fluid-playground__field">
              <span>{{ t("fluidDemoMoteColor") }}</span>
              <input v-model="moteColor" class="fluid-playground__color" type="color" dir="ltr" />
            </label>
            <label class="fluid-playground__field">
              <span>{{ t("fluidDemoMoteBlend") }}</span>
              <select v-model="moteBlend">
                <option value="auto">{{ t("dockDemoAuto") }}</option>
                <option value="normal">{{ t("fluidDemoBlendNormal") }}</option>
                <option value="additive">{{ t("fluidDemoBlendScreen") }}</option>
                <option value="multiply">{{ t("fluidDemoBlendMultiply") }}</option>
                <option value="subtractive">{{ t("fluidDemoBlendDifference") }}</option>
              </select>
            </label>
          </template>
        </fieldset>

        <fieldset v-if="vineSelected" class="fluid-playground__group">
          <legend>{{ t("fluidDemoVineColors") }}</legend>
          <label class="fluid-playground__field">
            <span>{{ t("fluidDemoVineBlend") }}</span>
            <select v-model="vineBlend">
              <option v-for="mode in BLEND_OPTIONS" :key="mode.value" :value="mode.value">
                {{ t(mode.label) }}
              </option>
            </select>
          </label>
          <div class="fluid-playground__parts">
            <div v-for="part in VINE_PART_OPTIONS" :key="part.key" class="fluid-playground__part">
              <span class="fluid-playground__part-name">{{ t(part.label) }}</span>
              <input
                class="fluid-playground__color"
                type="color"
                :value="vinePartHex('wall', part.key)"
                @input="setVinePartColor('wall', part.key, $event)"
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                :value="vinePartAlpha('wall', part.key)"
                @input="setVinePartAlpha('wall', part.key, $event)"
              />
              <output>{{ vinePartAlpha("wall", part.key).toFixed(2) }}</output>
              <button
                type="button"
                class="fluid-playground__part-reset"
                :title="t('fluidDemoVineResetPart')"
                :aria-label="t('fluidDemoVineResetPart')"
                @click="clearVinePart('wall', part.key)"
              >
                ×
              </button>
            </div>
          </div>
        </fieldset>

        <fieldset v-if="vineSelected" class="fluid-playground__group">
          <legend>{{ t("fluidDemoVinePopoutColors") }}</legend>
          <label class="fluid-playground__field">
            <span>{{ t("fluidDemoVinePopoutBlend") }}</span>
            <select v-model="vinePopoutBlend">
              <option v-for="mode in POP_BLEND_OPTIONS" :key="mode.value" :value="mode.value">
                {{ t(mode.label) }}
              </option>
            </select>
          </label>
          <div class="fluid-playground__parts">
            <div v-for="part in VINE_PART_OPTIONS" :key="part.key" class="fluid-playground__part">
              <span class="fluid-playground__part-name">{{ t(part.label) }}</span>
              <input
                class="fluid-playground__color"
                type="color"
                :value="vinePartHex('popout', part.key)"
                @input="setVinePartColor('popout', part.key, $event)"
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                :value="vinePartAlpha('popout', part.key)"
                @input="setVinePartAlpha('popout', part.key, $event)"
              />
              <output>{{ vinePartAlpha("popout", part.key).toFixed(2) }}</output>
              <button
                type="button"
                class="fluid-playground__part-reset"
                :title="t('fluidDemoVineResetPart')"
                :aria-label="t('fluidDemoVineResetPart')"
                @click="clearVinePart('popout', part.key)"
              >
                ×
              </button>
            </div>
          </div>
        </fieldset>

      </div>

      <div class="fluid-playground__actions">
        <button type="button" @click="randomize">{{ t("fluidDemoRandom") }}</button>
        <button type="button" @click="reset">{{ t("fluidDemoReset") }}</button>
        <button type="button" class="fluid-playground__copy" @click="copySnippet">
          {{ copied ? t("fluidDemoCopied") : t("fluidDemoCopy") }}
        </button>
      </div>

      <fieldset class="fluid-playground__group fluid-playground__presets">
        <legend>{{ t("fluidDemoPresets") }}</legend>
        <div class="fluid-playground__preset-row">
          <input
            v-model="presetName"
            class="fluid-playground__text"
            type="text"
            :placeholder="t('fluidDemoPresetName')"
          />
          <button type="button" class="fluid-playground__chip" @click="savePreset">
            {{ t("fluidDemoSavePreset") }}
          </button>
        </div>
        <div v-if="presets.length" class="fluid-playground__preset-row">
          <select v-model="selectedPreset">
            <option v-for="preset in presets" :key="preset.id" :value="preset.id">
              {{ preset.name }}
            </option>
          </select>
          <button type="button" class="fluid-playground__chip" @click="loadPreset">
            {{ t("fluidDemoLoadPreset") }}
          </button>
          <button type="button" class="fluid-playground__chip" @click="deletePreset">
            {{ t("fluidDemoDeletePreset") }}
          </button>
        </div>
      </fieldset>

      <p class="fluid-playground__hint">{{ t("fluidDemoHint") }}</p>

      <pre class="fluid-playground__snippet" dir="ltr"><code>{{ snippet }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.fluid-playground {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(340px, 0.9fr);
  align-items: start;
  gap: 18px;
  min-width: 0;
  margin-block: 20px 28px;
  padding: 20px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-large, 20px);
  background-color: var(--md-sys-color-surface-container-low);
}

.fluid-playground > * {
  min-width: 0;
}

.fluid-playground__stage {
  position: sticky;
  top: calc(var(--akari-doc-app-bar-height, 64px) + 20px);
  align-self: start;
  z-index: 2;
  display: grid;
  gap: 8px;
}

.fluid-playground__badge {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.fluid-playground__badge code {
  color: var(--md-sys-color-on-surface);
  font-size: 0.75rem;
  letter-spacing: 0;
  text-transform: none;
}

.fluid-playground__panel {
  display: grid;
  gap: 16px;
}

.fluid-playground__variants {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fluid-playground__variants button {
  min-block-size: 36px;
  padding-inline: 16px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-full, 999px);
  background-color: transparent;
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
}

.fluid-playground__variants button[aria-pressed="true"] {
  border-color: transparent;
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.fluid-playground__groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.fluid-playground__group {
  display: grid;
  gap: 10px;
  align-content: start;
  min-inline-size: 0;
  margin: 0;
  padding: 14px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-medium, 12px);
  background-color: var(--md-sys-color-surface-container);
}

.fluid-playground__group legend {
  padding-inline: 6px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.fluid-playground__field {
  display: grid;
  gap: 4px;
  min-inline-size: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.75rem;
}

.fluid-playground__field select,
.fluid-playground__field .fluid-playground__text {
  box-sizing: border-box;
  min-block-size: 40px;
  padding-inline: 12px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-full, 999px);
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-size: 0.875rem;
}

.fluid-playground__field .fluid-playground__color {
  box-sizing: border-box;
  inline-size: 100%;
  block-size: 40px;
  padding: 4px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-full, 999px);
  background-color: var(--md-sys-color-surface);
  cursor: pointer;
}

.fluid-playground__field--slider {
  grid-template-columns: 1fr auto;
  align-items: center;
  column-gap: 10px;
}

.fluid-playground__field--slider span {
  grid-column: 1 / -1;
}

.fluid-playground__field--slider input {
  width: 100%;
  margin: 0;
  accent-color: var(--md-sys-color-primary);
}

.fluid-playground__field--slider output {
  min-inline-size: 3.2em;
  color: var(--md-sys-color-on-surface);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
  text-align: end;
}

.fluid-playground__field[data-disabled] {
  opacity: 0.45;
}

.fluid-playground__presets {
  max-inline-size: 620px;
}

.fluid-playground__preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fluid-playground__preset-row .fluid-playground__text,
.fluid-playground__preset-row select {
  flex: 1 1 180px;
  box-sizing: border-box;
  min-block-size: 36px;
  padding-inline: 12px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-full, 999px);
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-size: 0.8125rem;
}

.fluid-playground__parts {
  display: grid;
  gap: 6px;
}

.fluid-playground__part {
  display: grid;
  grid-template-columns: 5.25em 40px minmax(60px, 1fr) 3.2em 28px;
  align-items: center;
  gap: 8px;
  min-inline-size: 0;
}

.fluid-playground__part-name {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.75rem;
}

.fluid-playground__part .fluid-playground__color {
  box-sizing: border-box;
  inline-size: 40px;
  block-size: 30px;
  padding: 2px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 8px;
  background-color: var(--md-sys-color-surface);
  cursor: pointer;
}

.fluid-playground__part input[type="range"] {
  inline-size: 100%;
  margin: 0;
  accent-color: var(--md-sys-color-primary);
}

.fluid-playground__part output {
  color: var(--md-sys-color-on-surface);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  text-align: end;
}

.fluid-playground__part-reset {
  inline-size: 26px;
  block-size: 26px;
  padding: 0;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 50%;
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
  font: inherit;
  line-height: 1;
  cursor: pointer;
}

.fluid-playground__chip {
  justify-self: start;
  min-block-size: 36px;
  padding-inline: 14px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-full, 999px);
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
}

.fluid-playground__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.fluid-playground__actions button {
  min-block-size: 40px;
  padding-inline: 18px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-full, 999px);
  background-color: transparent;
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
}

.fluid-playground__actions .fluid-playground__copy {
  border-color: transparent;
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.fluid-playground__variants button:focus-visible,
.fluid-playground__chip:focus-visible,
.fluid-playground__actions button:focus-visible,
.fluid-playground__field select:focus-visible,
.fluid-playground__field input:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.fluid-playground__hint {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.8125rem;
  line-height: 1.6;
}

.fluid-playground__snippet {
  margin: 0;
  padding: 16px;
  overflow: auto;
  border-radius: var(--md-sys-shape-corner-medium, 12px);
  background-color: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface);
  font-size: 0.8125rem;
  line-height: 1.6;
}

@media (max-width: 1080px) {
  .fluid-playground {
    grid-template-columns: minmax(0, 1fr);
  }

  .fluid-playground__stage {
    position: static;
  }
}

@media (max-width: 700px) {
  .fluid-playground {
    padding: 14px;
  }
}
</style>
