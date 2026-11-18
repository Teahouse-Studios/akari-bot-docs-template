/**
 * Colour and motion of the fluid wall (components/content/AkariFluidWall.vue).
 *
 * The wall is a fragment shader, so everything that changes with the theme
 * travels to it as data: the palette below repaints the design tokens into the
 * fluid's five stops, and the loops below keep the animation's own clock. Both
 * stay free of WebGL and of the DOM, which is what the tests exercise.
 */

/** An sRGB colour with each channel in 0..1, as WebGL wants it. */
export type FluidRgb = readonly [number, number, number];

export const FLUID_SCHEMES = ["light", "dark"] as const;
export type FluidScheme = (typeof FLUID_SCHEMES)[number];

/**
 * The design tokens the wall reads, already resolved to colours. The stops run
 * from the surface it sits on through the primary role to the tertiary one, so
 * a seed change or a different tone variant redraws the wall in the same ramp
 * the rest of the page uses.
 */
export interface FluidTokens {
  readonly primary: FluidRgb;
  readonly primaryContainer: FluidRgb;
  readonly secondary: FluidRgb;
  readonly secondaryContainer: FluidRgb;
  readonly tertiary: FluidRgb;
  readonly tertiaryContainer: FluidRgb;
  readonly surface: FluidRgb;
  readonly surfaceContainer: FluidRgb;
  readonly onSurface: FluidRgb;
}

/** What the shader receives for one scheme and one set of tokens. */
export interface FluidPalette {
  /** The five stops of the ramp, mixed in order by the noise. */
  readonly stops: readonly [FluidRgb, FluidRgb, FluidRgb, FluidRgb, FluidRgb];
  /** Warm core of the virtual light, and its wider, cooler halo. */
  readonly core: FluidRgb;
  readonly halo: FluidRgb;
  /** The motes that drift with the flow. */
  readonly spark: FluidRgb;
  readonly lightCore: number;
  readonly lightHalo: number;
  readonly bloomThreshold: number;
  readonly bloomRange: number;
  readonly bloomStrength: number;
  readonly vignette: number;
  readonly grain: number;
  readonly sparkle: number;
  /** Peak strength of the pointer light; the pale wall takes much less. */
  readonly glow: number;
  /** Additive lift under a blossom, for dark walls. */
  readonly petalLight: number;
  /** Depth pulled into a blossom, for pale walls. */
  readonly petalInk: number;
}

const BLACK: FluidRgb = [0, 0, 0];
const WHITE: FluidRgb = [1, 1, 1];

/** Blends between two colours; `amount` is clamped, as `mix` does in GLSL. */
export function mixFluid(from: FluidRgb, to: FluidRgb, amount: number): FluidRgb {
  const t = Math.min(1, Math.max(0, amount));
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
    from[2] + (to[2] - from[2]) * t,
  ];
}

/**
 * Keeps a figure that arrives from a tag attribute usable. Attributes reach the
 * component as strings, so this parses them, rejects anything that is not a
 * finite number, and clamps the rest to the range the shader can honour.
 */
export function fluidNumber(value: unknown, min: number, max: number, fallback: number): number {
  const numeric = typeof value === "string" ? Number.parseFloat(value) : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}

/** The Material baseline palette, used when the tokens cannot be read. */
export const FLUID_FALLBACK_TOKENS: Readonly<Record<FluidScheme, FluidTokens>> = {
  light: {
    primary: [0x67 / 255, 0x50 / 255, 0xa4 / 255],
    primaryContainer: [0xea / 255, 0xdd / 255, 0xff / 255],
    secondary: [0x62 / 255, 0x5b / 255, 0x71 / 255],
    secondaryContainer: [0xe8 / 255, 0xde / 255, 0xf8 / 255],
    tertiary: [0x7d / 255, 0x52 / 255, 0x60 / 255],
    tertiaryContainer: [0xff / 255, 0xd8 / 255, 0xe4 / 255],
    surface: [0xff / 255, 0xff / 255, 0xff / 255],
    surfaceContainer: [0xf3 / 255, 0xed / 255, 0xf7 / 255],
    onSurface: [0x1d / 255, 0x1b / 255, 0x20 / 255],
  },
  dark: {
    primary: [0xd0 / 255, 0xbc / 255, 0xff / 255],
    primaryContainer: [0x4f / 255, 0x37 / 255, 0x8b / 255],
    secondary: [0xcc / 255, 0xc2 / 255, 0xdc / 255],
    secondaryContainer: [0x33 / 255, 0x2d / 255, 0x41 / 255],
    tertiary: [0xff / 255, 0xd8 / 255, 0xe4 / 255],
    tertiaryContainer: [0x63 / 255, 0x3b / 255, 0x48 / 255],
    surface: [0x0f / 255, 0x0d / 255, 0x13 / 255],
    surfaceContainer: [0x21 / 255, 0x1f / 255, 0x25 / 255],
    onSurface: [0xe6 / 255, 0xe0 / 255, 0xe9 / 255],
  },
};

/**
 * Repaints the tokens into the fluid.
 *
 * In the dark scheme the wall is a night surface with three lit masses: the
 * primary role carries most of the body, `primaryContainer` deepens its shadow
 * side, and the tertiary role closes the ramp with the warm end of the ramp the
 * mascot's hair runs on. In the light scheme the same mass sits on the surface
 * container instead, with the roles mixed in at a fraction, so the wall reads as
 * tinted paper rather than as a darkened hero.
 */
/**
 * The wall for one scheme, before any tone is applied. `tone` lifts every stop
 * towards the surface the wall sits on, so the same field can be shown as a
 * quiet wash or as the designed contrast without rebuilding the program.
 */
export function fluidPalette(
  tokens: FluidTokens,
  scheme: FluidScheme,
  tone = 0,
  accent = 1,
): FluidPalette {
  const palette = basePalette(tokens, scheme, fluidNumber(accent, 0, 1, 1));
  const lift = fluidNumber(tone, 0, 1, 0) * 0.5;
  if (lift === 0) return palette;

  const paper =
    scheme === "dark"
      // Tone lifts toward the page surface in either scheme; on a dark page the
      // paper is darker than the wall's own base, so lift must not brighten it.
      ? mixFluid(BLACK, tokens.surfaceContainer, 0.6)
      : mixFluid(tokens.surface, tokens.surfaceContainer, 0.6);
  const [c1, c2, c3, c4, c5] = palette.stops;
  const stops: FluidPalette["stops"] = [
    mixFluid(c1, paper, lift),
    mixFluid(c2, paper, lift),
    mixFluid(c3, paper, lift),
    mixFluid(c4, paper, lift),
    mixFluid(c5, paper, lift),
  ];

  return {
    ...palette,
    stops,
    vignette: palette.vignette * (1 - lift),
    bloomStrength: palette.bloomStrength * (1 - lift),
  };
}

function basePalette(tokens: FluidTokens, scheme: FluidScheme, accent: number): FluidPalette {
  if (scheme === "dark") {
    // Every stop is pulled toward black: on a dark page the wall has to sit
    // below the text, not glow behind it.
    const shade = (color: FluidRgb, amount: number): FluidRgb => mixFluid(BLACK, color, amount);
    const base = mixFluid(tokens.surfaceContainer, tokens.surface, 0.8);
    return {
      stops: [
        base,
        shade(mixFluid(base, tokens.primaryContainer, 0.78), 0.64),
        shade(mixFluid(tokens.primaryContainer, tokens.primary, 0.22), 0.57),
        shade(mixFluid(tokens.surface, tokens.tertiary, 0.66 * accent), 0.49),
        shade(mixFluid(base, tokens.secondaryContainer, 1), 0.7),
      ],
      core: mixFluid(WHITE, tokens.tertiary, 0.4 * accent),
      halo: mixFluid(tokens.primary, WHITE, 0.2),
      spark: mixFluid(WHITE, tokens.onSurface, 0.4),
      lightCore: 0.105,
      lightHalo: 0.035,
      bloomThreshold: 0.55,
      bloomRange: 0.12,
      bloomStrength: 0.19,
      vignette: 0.51,
      grain: 0.0042,
      sparkle: 0.45,
      glow: 0.12,
      petalLight: 0.085,
      petalInk: 0,
    };
  }

  return {
    stops: [
      mixFluid(tokens.primaryContainer, tokens.primary, 0.42),
      mixFluid(tokens.primaryContainer, tokens.primary, 0.22),
      mixFluid(tokens.surfaceContainer, tokens.primaryContainer, 0.55),
      mixFluid(tokens.tertiaryContainer, tokens.tertiary, 0.2 * accent),
      mixFluid(tokens.surfaceContainer, tokens.secondaryContainer, 0.7),
    ],
    core: mixFluid(WHITE, tokens.tertiary, 0.45 * accent),
    halo: mixFluid(WHITE, tokens.primary, 0.35),
    spark: mixFluid(WHITE, tokens.primary, 0.45),
    lightCore: 0,
    lightHalo: 0,
    bloomThreshold: 0.9,
    bloomRange: 0.1,
    bloomStrength: 0,
    vignette: 0.05,
    grain: 0.003,
    sparkle: 0,
    glow: 0.1,
    petalLight: 0,
    petalInk: 0.12,
  };
}

/** One of the four clocks: a period in seconds, and how far its phase travels. */
export interface FluidLoop {
  readonly period: number;
  readonly radius: number;
}

/**
 * Four loops of different lengths, so the flow never visibly repeats within a
 * page visit. A loop covers its whole circle, which moves the field by twice
 * its radius; with these periods a feature drifts across its own width in about
 * a minute and a half, which reads as breathing rather than as playback.
 */
export const FLUID_LOOPS: readonly FluidLoop[] = [
  { period: 1200, radius: 4.87 },
  { period: 1320, radius: 4.46 },
  { period: 1560, radius: 4.23 },
  { period: 1680, radius: 3.98 },
];

/**
 * Offset of one loop at `elapsedSeconds`. The pair travels a circle back to its
 * start, which the noise reads as a slow evolution rather than as a pan.
 */
export function fluidLoopOffset(elapsedSeconds: number, loop: FluidLoop): [number, number] {
  const phase = ((elapsedSeconds % loop.period) + loop.period) % loop.period;
  const angle = (phase / loop.period) * Math.PI * 2;
  return [loop.radius * Math.sin(angle), loop.radius * (1 - Math.cos(angle))];
}

/** Every loop's offset, flat, in the order the shader's array wants them. */
export function fluidLoopOffsets(elapsedSeconds: number): Float32Array {
  const offsets = new Float32Array(FLUID_LOOPS.length * 2);
  FLUID_LOOPS.forEach((loop, index) => {
    const [x, y] = fluidLoopOffset(elapsedSeconds, loop);
    offsets[index * 2] = x;
    offsets[index * 2 + 1] = y;
  });
  return offsets;
}

/** Largest device pixels per CSS pixel. */
export const FLUID_MAX_DPR = 1.5;
/** The wall is stopped from growing past this edge, and past this area. */
const FLUID_MAX_EDGE = 1400;
const FLUID_MAX_PIXELS = 1_100_000;

/**
 * Backing store for a wall `cssWidth` × `cssHeight` on a screen of `dpr`. The
 * shader costs nine noise samples per pixel, so a large, sharply scaled canvas
 * is worth less than a smooth one; the crop keeps both within budget while the
 * grain keeps the upscale from reading as blur.
 */
export function fluidRenderSize(
  cssWidth: number,
  cssHeight: number,
  dpr: number,
): { width: number; height: number } {
  const density = Math.min(Math.max(dpr, 1), FLUID_MAX_DPR);
  const width = Math.max(cssWidth * density, 1);
  const height = Math.max(cssHeight * density, 1);
  const scale = Math.min(1, FLUID_MAX_EDGE / width, Math.sqrt(FLUID_MAX_PIXELS / (width * height)));
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
  };
}

/** The five shapes the wall can take. `silk` is the wall as first designed. */
export const FLUID_VARIANTS = ["silk", "aurora", "mesh", "nebula", "blossom"] as const;
export type FluidVariant = (typeof FLUID_VARIANTS)[number];

/** Overlays drawn above the flow. They read as texture, not as another flow. */
export const FLUID_TEXTURES = ["none", "sakura", "petals", "stars", "lace", "vine", "dots"] as const;
export type FluidTexture = (typeof FLUID_TEXTURES)[number];

/** Which way the sakura overlay is painted: dark strokes, or lit petals. */
export const FLUID_TEXTURE_TONES = ["auto", "ink", "light"] as const;

/** How the vine layer composites with the flow beneath it. Values match CSS `mix-blend-mode`. */
export const FLUID_BLEND_MODES = ["normal", "multiply", "screen", "overlay", "soft-light", "difference"] as const;
export type FluidBlendMode = (typeof FLUID_BLEND_MODES)[number];

/**
 * Tile size each overlay is drawn at, in CSS px. They differ because a sparse
 * star field needs a wider cell than a lace border before the repeat shows.
 */
export const FLUID_TEXTURE_SIZES: Readonly<Record<FluidTexture, number>> = {
  none: 320,
  sakura: 320,
  petals: 300,
  stars: 440,
  lace: 280,
  vine: 360,
  dots: 360,
};

/**
 * Alpha each overlay needs to read at the same weight. Sparse shapes carry
 * further, so they are pulled back; dense line work is lifted.
 */
export const FLUID_TEXTURE_WEIGHTS: Readonly<Record<FluidTexture, number>> = {
  none: 0,
  sakura: 1.2,
  petals: 1.35,
  stars: 2.8,
  lace: 2.2,
  vine: 2.5,
  dots: 2,
};
export type FluidTextureTone = (typeof FLUID_TEXTURE_TONES)[number];

/**
 * Everything a variant decides. A variant is a starting point rather than a
 * lock: every field here can be overridden from the tag, and `resolveFluid`
 * keeps that precedence in one place.
 */
export interface FluidVariantSpec {
  /** Slice of the noise field; larger means finer folds. */
  readonly scale: number;
  /** How hard the curl term drags the field. */
  readonly curl: number;
  /** How far the warped noise drags the field. */
  readonly warp: number;
  /** How far the folds curl into petal arms. */
  readonly petal: number;
  /** Cell of the grid, in CSS px; 0 draws none. */
  readonly grid: number;
  /** Strength of the pointer light. */
  readonly glow: number;
  /** Multiplies the flow's clock. */
  readonly speed: number;
  /** Lifts the ramp towards the page surface. */
  readonly tone: number;
  /** Per-axis scale of the noise domain, which is what makes curtains. */
  readonly stretch: readonly [number, number];
  /** Grid of the drifting motes, in CSS px; 0 draws none. */
  readonly mote: number;
  /** Multiplies the alpha of the grid lines. */
  readonly gridAlpha: number;
  /** How strongly the vertical curtain term modulates the ramp. */
  readonly curtain: number;
  /** How much of the mascot's warm role reaches the ramp. */
  readonly accent: number;
  /** Overlay above the flow. */
  readonly texture: FluidTexture;
  /** Alpha of that overlay, before the per-scheme baseline. */
  readonly textureOpacity: number;
}

/**
 * The five presets. `silk` reproduces the wall as it shipped; the others trade
 * its folds for a different silhouette, and rebalance the ramp to match.
 */
export const FLUID_VARIANT_SPECS: Readonly<Record<FluidVariant, FluidVariantSpec>> = {
  silk: {
    scale: 1.5,
    curl: 8.5,
    warp: 0.7,
    petal: 0.6,
    grid: 72,
    glow: 1,
    speed: 1,
    tone: 0.2,
    stretch: [1, 1],
    mote: 30,
    gridAlpha: 1,
    curtain: 0,
    accent: 1,
    texture: "none",
    textureOpacity: 0,
  },
  aurora: {
    scale: 1.0,
    curl: 2.5,
    warp: 1.1,
    petal: 0,
    grid: 0,
    glow: 0.8,
    speed: 0.5,
    tone: 0.08,
    stretch: [1, 0.14],
    mote: 26,
    gridAlpha: 1,
    curtain: 1,
    accent: 0.2,
    texture: "none",
    textureOpacity: 0,
  },
  mesh: {
    scale: 0.75,
    curl: 1.6,
    warp: 0.25,
    petal: 0,
    grid: 44,
    glow: 1.5,
    speed: 0.5,
    tone: 0.55,
    stretch: [1, 1],
    mote: 34,
    gridAlpha: 1.5,
    curtain: 0,
    accent: 0.6,
    texture: "none",
    textureOpacity: 0,
  },
  nebula: {
    scale: 2.2,
    curl: 9,
    warp: 0.45,
    petal: 0,
    grid: 0,
    glow: 0.5,
    speed: 0.4,
    tone: 0.45,
    stretch: [1, 1],
    mote: 18,
    gridAlpha: 1,
    curtain: 0,
    accent: 0.14,
    texture: "sakura",
    textureOpacity: 0.12,
  },
  blossom: {
    scale: 1.35,
    curl: 6,
    warp: 0.62,
    petal: 0.3,
    grid: 0,
    glow: 1,
    speed: 1,
    tone: 0.12,
    stretch: [1, 1],
    mote: 30,
    gridAlpha: 0.8,
    curtain: 0,
    accent: 1,
    texture: "sakura",
    textureOpacity: 0.42,
  },
};

/** What a tag may override, in the shape the props arrive in. */
export interface FluidOverrides {
  readonly scale?: unknown;
  readonly curl?: unknown;
  readonly warp?: unknown;
  readonly petal?: unknown;
  readonly grid?: unknown;
  readonly glow?: unknown;
  readonly speed?: unknown;
  readonly tone?: unknown;
  readonly mote?: unknown;
  readonly gridAlpha?: unknown;
  readonly curtain?: unknown;
  readonly accent?: unknown;
  readonly texture?: unknown;
  readonly textureOpacity?: unknown;
}

const SPEC_RANGES = {
  scale: [0.6, 5],
  curl: [0, 24],
  warp: [0, 1.6],
  petal: [0, 1],
  grid: [0, 400],
  glow: [0, 2],
  speed: [0.1, 4],
  tone: [0, 1],
  mote: [0, 60],
  gridAlpha: [0, 3],
  curtain: [0, 1],
  accent: [0, 1],
  textureOpacity: [0, 1],
} as const;

const NUMERIC_SPEC_KEYS = Object.keys(SPEC_RANGES) as (keyof typeof SPEC_RANGES)[];

/** A variant name that the wall knows, falling back to `silk`. */
export function fluidVariant(value: unknown): FluidVariant {
  return (FLUID_VARIANTS as readonly unknown[]).includes(value) ? (value as FluidVariant) : "silk";
}

/** A texture name that the wall knows, falling back to `none`. */
export function fluidTexture(value: unknown): FluidTexture {
  return (FLUID_TEXTURES as readonly unknown[]).includes(value) ? (value as FluidTexture) : "none";
}

/** A blend mode the vine layer knows, falling back to `normal`. */
export function fluidBlendMode(value: unknown): FluidBlendMode {
  return (FLUID_BLEND_MODES as readonly unknown[]).includes(value) ? (value as FluidBlendMode) : "normal";
}

/**
 * The spec a wall actually runs with: the variant's table first, then whatever
 * the tag says. Overrides are parsed and clamped, so a stray attribute cannot
 * push a uniform out of the range the shader was tuned for.
 */
export function resolveFluid(variant: unknown, overrides: FluidOverrides = {}): FluidVariantSpec {
  const base = FLUID_VARIANT_SPECS[fluidVariant(variant)];
  const spec: Record<string, unknown> = { ...base };
  for (const key of NUMERIC_SPEC_KEYS) {
    const [min, max] = SPEC_RANGES[key];
    const fallback = base[key];
    spec[key] = overrides[key] === undefined ? fallback : fluidNumber(overrides[key], min, max, fallback);
  }
  if (overrides.texture !== undefined) {
    spec.texture = fluidTexture(overrides.texture);
    // A variant that drew no overlay has no alpha of its own; naming one from
    // the tag has to bring a usable default with it.
    if (Number(spec.textureOpacity) === 0 && spec.texture !== "none") spec.textureOpacity = 0.55;
  }
  return spec as unknown as FluidVariantSpec;
}

/**
 * Phase of the aurora curtain at `elapsedSeconds`. Kept out of the shader so
 * the sweep has the same clock as everything else the wall animates.
 */
export function fluidCurtain(elapsedSeconds: number, speed = 1): number {
  return elapsedSeconds * 0.12 * fluidNumber(speed, 0.1, 4, 1);
}

/**
 * Which way the sakura overlay is painted. A pale wall takes ink, because a lit
 * petal on paper is invisible; a dark wall takes light, for the same reason.
 */
export function fluidTextureTone(tone: unknown, scheme: FluidScheme): "ink" | "light" {
  if (tone === "ink" || tone === "light") return tone;
  return scheme === "dark" ? "light" : "ink";
}

/** One lace ribbon, in wall coordinates. */
export type FluidRibbon = {
  /** Cubic control points: entry, two handles, exit. */
  curve: readonly [number, number, number, number, number, number, number, number];
  /** Draw order from the back of the wall to the front. */
  layer: number;
  /** Body width in CSS px. */
  width: number;
  /** Gradient axis across the body, so the ribbon reads as a rounded surface. */
  gradient: readonly [number, number, number, number];
  /** Points along the centre line, used for the lace eyelets. */
  points: ReadonlyArray<readonly [number, number]>;
  /**
   * Centre-line length in the frame the ribbon was laid out in. The trim
   * counts its repeats from this, so a stretched wall stretches the repeats
   * instead of sliding new ones in from the ends.
   */
  span?: number;
};

const RIBBON_WIDTH = [20, 34] as const;
const RIBBON_EDGES = 4;
const RIBBON_SAMPLES = 32;

/**
 * Everything the seed decides about one ribbon, as shares of the wall rather
 * than pixels, so the same draw can be laid into any wall size.
 */
type RibbonRecipe = {
  layer: number;
  entry: number;
  exit: number;
  /** Where along the entry and exit edges the ribbon crosses, 0–1. */
  alongFrom: number;
  alongTo: number;
  /** Handle bows as shares of the bow limit. */
  bowOne: number;
  bowTwo: number;
  easeOne: number;
  easeTwo: number;
  width: number;
};

function ribbonLength(points: ReadonlyArray<readonly [number, number]>): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += Math.hypot(points[index][0] - points[index - 1][0], points[index][1] - points[index - 1][1]);
  }
  return total;
}

/**
 * Evenly spaced repeats along a curve of length `total`. The count comes from
 * the layout length, so it holds while the wall is stretched.
 */
function ribbonRepeat(ribbon: FluidRibbon, total: number, base: number): { count: number; step: number } {
  const count = Math.max(1, Math.round((ribbon.span ?? total) / base));
  return { count, step: total / count };
}

function ribbonTangentAt(
  points: ReadonlyArray<readonly [number, number]>,
  amount: number,
): readonly [number, number] {
  const index = Math.min(points.length - 1, Math.max(0, Math.round(amount * (points.length - 1))));
  const before = points[Math.max(0, index - 1)];
  const after = points[Math.min(points.length - 1, index + 1)];
  const dx = after[0] - before[0];
  const dy = after[1] - before[1];
  const length = Math.hypot(dx, dy) || 1;
  return [dx / length, dy / length];
}

/** Lays a recipe into a wall of the given size. */
function ribbonFromRecipe(recipe: RibbonRecipe, width: number, height: number): FluidRibbon {
  const beyond = Math.max(48, Math.round(Math.min(width, height) * 0.25));
  const from = ribbonEdgePoint(recipe.entry, width, height, recipe.alongFrom, beyond);
  const to = ribbonEdgePoint(recipe.exit, width, height, recipe.alongTo, beyond);
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const bowLimit = Math.min(height * 0.95, length * 0.34);
  const bowOne = recipe.bowOne * bowLimit;
  const bowTwo = recipe.bowTwo * bowLimit;
  const curve = [
    from[0],
    from[1],
    from[0] + dx * recipe.easeOne + nx * bowOne,
    from[1] + dy * recipe.easeOne + ny * bowOne,
    to[0] - dx * recipe.easeTwo + nx * bowTwo,
    to[1] - dy * recipe.easeTwo + ny * bowTwo,
    to[0],
    to[1],
  ] as const;
  const points: Array<readonly [number, number]> = [];
  for (let step = 0; step <= RIBBON_SAMPLES; step += 1) {
    const t = step / RIBBON_SAMPLES;
    const u = 1 - t;
    const x =
      u * u * u * curve[0] + 3 * u * u * t * curve[2] + 3 * u * t * t * curve[4] + t * t * t * curve[6];
    const y =
      u * u * u * curve[1] + 3 * u * u * t * curve[3] + 3 * u * t * t * curve[5] + t * t * t * curve[7];
    points.push([x, y]);
  }
  const middle = points[Math.floor(RIBBON_SAMPLES / 2)];
  const middleTangent = ribbonTangentAt(points, 0.5);
  const middleNormal: readonly [number, number] = [-middleTangent[1], middleTangent[0]];
  const ribbonWidth = recipe.width;
  return {
    curve,
    layer: recipe.layer,
    width: ribbonWidth,
    gradient: [
      middle[0] - middleNormal[0] * ribbonWidth * 0.5,
      middle[1] - middleNormal[1] * ribbonWidth * 0.5,
      middle[0] + middleNormal[0] * ribbonWidth * 0.5,
      middle[1] + middleNormal[1] * ribbonWidth * 0.5,
    ],
    points,
    span: ribbonLength(points),
  };
}

/** Deterministic little PRNG: the same seed always draws the same ribbons. */
function ribbonRandom(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function ribbonEdgePoint(
  edge: number,
  width: number,
  height: number,
  along: number,
  beyond: number,
): readonly [number, number] {
  const span = edge % 2 === 0 ? height : width;
  const position = -beyond + along * (span + beyond * 2);
  if (edge === 0) return [-beyond, position];
  if (edge === 1) return [position, -beyond];
  if (edge === 2) return [width + beyond, position];
  return [position, height + beyond];
}

/**
 * Draws lace ribbons across the wall. Every ribbon enters and leaves through an
 * edge, never starting or ending inside the frame, and the pattern is redrawn
 * per mount so the crossings differ from visit to visit.
 */

/** Unit normal of the band at a sample, pointing to the outside of the curve. */
function ribbonNormal(points: ReadonlyArray<readonly [number, number]>, index: number): [number, number] {
  const last = points.length - 1;
  const before = points[Math.max(0, index - 1)];
  const after = points[Math.min(last, index + 1)];
  const dx = after[0] - before[0];
  const dy = after[1] - before[1];
  const length = Math.hypot(dx, dy) || 1;
  return [-dy / length, dx / length];
}

/**
 * The band itself, as one closed outline: the samples offset to both sides,
 * so it can be filled instead of stroked. A stroke has no edges to decorate.
 */
export function ribbonBandPath(ribbon: FluidRibbon, expand = 0): string {
  const points = ribbon.points;
  if (points.length < 2) return "";
  const half = ribbon.width / 2 + Math.max(0, expand);
  const left = points.map((point, index) => {
    const [nx, ny] = ribbonNormal(points, index);
    return [point[0] + nx * half, point[1] + ny * half] as const;
  });
  const right = points.map((point, index) => {
    const [nx, ny] = ribbonNormal(points, index);
    return [point[0] - nx * half, point[1] - ny * half] as const;
  });
  const forward = [`M${left[0][0].toFixed(1)} ${left[0][1].toFixed(1)}`];
  for (let index = 1; index < left.length; index += 1) {
    const [px, py] = left[index - 1];
    const [x, y] = left[index];
    forward.push(`L${((px + x) / 2).toFixed(1)} ${((py + y) / 2).toFixed(1)}`);
  }
  forward.push(`L${left[left.length - 1][0].toFixed(1)} ${left[left.length - 1][1].toFixed(1)}`);
  forward.push(`L${right[right.length - 1][0].toFixed(1)} ${right[right.length - 1][1].toFixed(1)}`);
  for (let index = right.length - 2; index >= 0; index -= 1) {
    const [px, py] = right[index + 1];
    const [x, y] = right[index];
    forward.push(`L${((px + x) / 2).toFixed(1)} ${((py + y) / 2).toFixed(1)}`);
  }
  forward.push(`L${right[0][0].toFixed(1)} ${right[0][1].toFixed(1)} Z`);
  return forward.join(" ");
}

/** Outward reach of the lace edge, used to extend the hover fill to the trim. */
export function ribbonScallopAmplitude(ribbon: FluidRibbon): number {
  return Math.max(1.4, ribbonLacePitch(ribbon.width) * 0.52 * 0.34);
}

/** One edge of the band, as a polyline: the trim that frames a lace ribbon. */
export function ribbonEdgePath(ribbon: FluidRibbon, side: 1 | -1): string {
  const points = ribbon.points;
  if (points.length < 2) return "";
  const half = ribbon.width / 2;
  const commands = points.map((point, index) => {
    const [nx, ny] = ribbonNormal(points, index);
    const x = point[0] + nx * half * side;
    const y = point[1] + ny * half * side;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return commands.join(" ");
}

function ribbonDistanceSquared(x: number, y: number, ribbon: FluidRibbon): number {
  let closest = Number.POSITIVE_INFINITY;
  for (let index = 1; index < ribbon.points.length; index += 1) {
    const start = ribbon.points[index - 1];
    const end = ribbon.points[index];
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const lengthSquared = dx * dx + dy * dy;
    const ratio = lengthSquared
      ? Math.max(0, Math.min(1, ((x - start[0]) * dx + (y - start[1]) * dy) / lengthSquared))
      : 0;
    const closestX = start[0] + dx * ratio;
    const closestY = start[1] + dy * ratio;
    closest = Math.min(closest, (x - closestX) ** 2 + (y - closestY) ** 2);
  }
  return closest;
}

function ribbonPointOccluded(
  x: number,
  y: number,
  occluders: ReadonlyArray<FluidRibbon>,
  includeTrim = false,
): boolean {
  return occluders.some((other) => {
    const radius = other.width * 0.5 + (includeTrim ? ribbonScallopAmplitude(other) : 0) + 1.2;
    return ribbonDistanceSquared(x, y, other) <= radius * radius;
  });
}

/** The scalloped edge: large outward lobes with smaller arcs attached along them. */
export function ribbonScallopPath(
  ribbon: FluidRibbon,
  side: 1 | -1,
  wavelength = 0,
  occluders: ReadonlyArray<FluidRibbon> = [],
): string {
  const points = ribbon.points;
  if (points.length < 2) return "";
  const half = ribbon.width / 2;
  const base = wavelength > 0 ? wavelength : ribbonLacePitch(ribbon.width) * 0.52;
  const amplitude = Math.max(1.4, base * 0.34);

  const lengths: number[] = [0];
  for (let index = 1; index < points.length; index += 1) {
    const dx = points[index][0] - points[index - 1][0];
    const dy = points[index][1] - points[index - 1][1];
    lengths.push(lengths[index - 1] + Math.hypot(dx, dy));
  }
  const total = lengths[lengths.length - 1] || 1;
  const point = (distance: number, across: number): readonly [number, number] => {
    const clamped = Math.min(total, Math.max(0, distance));
    let cursor = 1;
    while (cursor < lengths.length - 1 && lengths[cursor] < clamped) cursor += 1;
    const previous = cursor - 1;
    const segment = lengths[cursor] - lengths[previous] || 1;
    const ratio = Math.min(1, Math.max(0, (clamped - lengths[previous]) / segment));
    const x = points[previous][0] + (points[cursor][0] - points[previous][0]) * ratio;
    const y = points[previous][1] + (points[cursor][1] - points[previous][1]) * ratio;
    const [nx, ny] = ribbonNormal(points, cursor);
    return [x + nx * across * side, y + ny * across * side];
  };

  const archOffset = (amount: number, base: number, depth: number): number => {
    const radius = Math.max(0, 1 - (amount * 2 - 1) ** 2);
    return base + depth * Math.sqrt(radius);
  };
  const archPoint = (start: number, span: number, amount: number, extra = 0): readonly [number, number] =>
    point(start + span * amount, archOffset(amount, half, amplitude) + extra);

  const detailArc = (start: number, span: number, fromAmount: number, toAmount: number): string => {
    const depth = Math.max(0.8, span * (toAmount - fromAmount) * 0.45);
    const steps = 8;
    const samples = Array.from({ length: 5 }, (_, index) => {
      const amount = fromAmount + ((toAmount - fromAmount) * index) / 4;
      const radius = Math.max(0, 1 - (index / 2 - 1) ** 2);
      return archPoint(start, span, amount, depth * radius);
    });
    if (samples.some(([x, y]) => ribbonPointOccluded(x, y, occluders, true))) return "";
    return Array.from({ length: steps + 1 }, (_, index) => {
      const amount = index / steps;
      const onArch = fromAmount + (toAmount - fromAmount) * amount;
      const radius = Math.max(0, 1 - (amount * 2 - 1) ** 2);
      const [x, y] = archPoint(start, span, onArch, depth * Math.sqrt(radius));
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
  };

  const commands: string[] = [];
  const { count, step } = ribbonRepeat(ribbon, total, base);
  if (step < 1) return "";
  for (let lobe = 0; lobe < count; lobe += 1) {
    for (let index = 0; index < 8; index += 1) {
      commands.push(detailArc(lobe * step, step, index / 8, (index + 1) / 8));
    }
  }
  return commands.filter(Boolean).join(" ");
}


/**
 * Lays `count` ribbons across a wall. The seed draws each ribbon as shares of
 * the wall; the best of a few draws is picked in the `layout` frame (the wall
 * size by default) and then laid into the real size. Passing the same layout
 * while the wall is resized keeps the picks, so the ribbons stretch with the
 * wall instead of jumping to new ones.
 */
export function buildFluidRibbons(
  width: number,
  height: number,
  seed = 1,
  count = 5,
  layout?: { readonly width: number; readonly height: number },
): FluidRibbon[] {
  if (!(width > 0) || !(height > 0) || count < 1) return [];
  const frameWidth = layout && layout.width > 0 && layout.height > 0 ? layout.width : width;
  const frameHeight = layout && layout.width > 0 && layout.height > 0 ? layout.height : height;
  const random = ribbonRandom(seed);
  const candidateCount = 8;
  const separation = Math.max(56, Math.min(frameWidth, frameHeight) * 0.32);
  const endpointInset = 0.14;
  const edgeClearance = Math.max(28, Math.min(frameWidth, frameHeight) * 0.16);
  const fractions = [0.25, 0.5, 0.75];

  const makeRecipe = (index: number, option: number): RibbonRecipe => {
    const entry = (index + option + Math.floor(random() * 4)) % 4;
    let exit = Math.floor(random() * 4);
    if (exit === entry) exit = (exit + 1 + Math.floor(random() * 3)) % 4;
    const horizontalAllowed = index === 0 && option === 0;
    const isHorizontalPair = (fromEdge: number, toEdge: number): boolean =>
      (fromEdge === 0 && toEdge === 2) || (fromEdge === 2 && toEdge === 0);
    if (!horizontalAllowed && isHorizontalPair(entry, exit)) {
      const alternatives = [0, 1, 2, 3].filter(
        (edge) => edge !== entry && !isHorizontalPair(entry, edge),
      );
      exit = alternatives[Math.floor(random() * alternatives.length)]!;
    }
    const alongFrom = endpointInset + random() * (1 - endpointInset * 2);
    const alongTo = endpointInset + random() * (1 - endpointInset * 2);
    const bowOne = random() - 0.5;
    const bowTwo = random() < 0.84 ? -bowOne * (0.68 + random() * 0.3) : random() - 0.5;
    const easeOne = 0.2 + random() * 0.16;
    const easeTwo = 0.2 + random() * 0.16;
    const ribbonWidth = RIBBON_WIDTH[0] + random() * (RIBBON_WIDTH[1] - RIBBON_WIDTH[0]);
    return { layer: index, entry, exit, alongFrom, alongTo, bowOne, bowTwo, easeOne, easeTwo, width: ribbonWidth };
  };

  const overlapScore = (candidate: FluidRibbon, existing: ReadonlyArray<FluidRibbon>): number => {
    let score = 0;
    for (const amount of fractions) {
      const point = candidate.points[Math.round(amount * RIBBON_SAMPLES)];
      const clearance = Math.min(point[0], frameWidth - point[0], point[1], frameHeight - point[1]);
      if (clearance < edgeClearance) score += (edgeClearance - clearance) * 2.4;
    }
    for (const other of existing) {
      for (const amount of fractions) {
        const candidatePoint = candidate.points[Math.round(amount * RIBBON_SAMPLES)];
        const otherPoint = other.points[Math.round(amount * (other.points.length - 1))];
        const distance = Math.hypot(candidatePoint[0] - otherPoint[0], candidatePoint[1] - otherPoint[1]);
        const threshold = separation + (candidate.width + other.width) * 0.5;
        if (distance >= threshold) continue;
        const candidateTangent = ribbonTangentAt(candidate.points, amount);
        const otherTangent = ribbonTangentAt(other.points, amount);
        const alignment = Math.abs(candidateTangent[0] * otherTangent[0] + candidateTangent[1] * otherTangent[1]);
        score += (threshold - distance) * (0.35 + alignment);
      }
    }
    return score;
  };

  const picked: FluidRibbon[] = [];
  const recipes: RibbonRecipe[] = [];
  for (let index = 0; index < count; index += 1) {
    let recipe = makeRecipe(index, 0);
    let selected = ribbonFromRecipe(recipe, frameWidth, frameHeight);
    let selectedScore = overlapScore(selected, picked);
    for (let option = 1; option < candidateCount; option += 1) {
      const candidateRecipe = makeRecipe(index, option);
      const candidate = ribbonFromRecipe(candidateRecipe, frameWidth, frameHeight);
      const score = overlapScore(candidate, picked);
      if (score < selectedScore) {
        recipe = candidateRecipe;
        selected = candidate;
        selectedScore = score;
      }
    }
    picked.push(selected);
    recipes.push(recipe);
  }
  if (frameWidth === width && frameHeight === height) return picked;
  return recipes.map((recipe, index) => ({
    ...ribbonFromRecipe(recipe, width, height),
    span: picked[index].span,
  }));
}
/** The lace repeat: one floret, two dot pairs and a ring per pitch. */
export function ribbonLacePitch(width: number): number {
  return Math.max(26, width * 1.45);
}

/**
 * The pattern inside the band: outlined four-petal florets, small dots and
 * edge eyelets. Everything is drawn in the ribbon's own frame, so the trim
 * follows the curve instead of being laid over it.
 */
export function ribbonLacePath(ribbon: FluidRibbon, occluders: ReadonlyArray<FluidRibbon> = []): string {
  const points = ribbon.points;
  if (points.length < 2) return "";
  const width = ribbon.width;
  const half = width / 2;
  const pitch = ribbonLacePitch(width);

  const lengths: number[] = [0];
  for (let index = 1; index < points.length; index += 1) {
    const dx = points[index][0] - points[index - 1][0];
    const dy = points[index][1] - points[index - 1][1];
    lengths.push(lengths[index - 1] + Math.hypot(dx, dy));
  }
  const total = lengths[lengths.length - 1];
  if (!total) return "";

  const frame = (distance: number) => {
    let cursor = 1;
    while (cursor < lengths.length - 1 && lengths[cursor] < distance) cursor += 1;
    const previous = cursor - 1;
    const segment = lengths[cursor] - lengths[previous] || 1;
    const ratio = Math.min(1, Math.max(0, (distance - lengths[previous]) / segment));
    const x = points[previous][0] + (points[cursor][0] - points[previous][0]) * ratio;
    const y = points[previous][1] + (points[cursor][1] - points[previous][1]) * ratio;
    const [nx, ny] = ribbonNormal(points, cursor);
    return { x, y, nx, ny, tx: -ny, ty: nx };
  };

  const point = (distance: number, along: number, across: number): readonly [number, number] => {
    const { x, y, nx, ny, tx, ty } = frame(distance);
    return [x + tx * along + nx * across, y + ty * along + ny * across];
  };
  const commands: string[] = [];
  const dot = (distance: number, along: number, across: number, radius: number) => {
    const [cx, cy] = point(distance, along, across);
    commands.push(
      `M${(cx - radius).toFixed(1)} ${cy.toFixed(1)} a${radius.toFixed(1)} ${radius.toFixed(1)} 0 1 0 ${(radius * 2).toFixed(1)} 0 a${radius.toFixed(1)} ${radius.toFixed(1)} 0 1 0 ${(-radius * 2).toFixed(1)} 0`,
    );
  };
  const leaf = (distance: number, along: number, across: number, directionAlong: number, directionAcross: number) => {
    const reach = width * 0.3;
    const flank = width * 0.13;
    const perpendicularAlong = -directionAcross;
    const perpendicularAcross = directionAlong;
    const at = (distanceAlong: number, distanceAcross: number) =>
      point(
        distance,
        along + directionAlong * distanceAlong + perpendicularAlong * distanceAcross,
        across + directionAcross * distanceAlong + perpendicularAcross * distanceAcross,
      );
    const [start, controlOne, controlTwo, tip, controlThree, controlFour] = [
      at(0, 0),
      at(reach * 0.3, flank),
      at(reach * 0.78, flank * 0.78),
      at(reach, 0),
      at(reach * 0.78, -flank * 0.78),
      at(reach * 0.3, -flank),
    ];
    commands.push(
      `M${start[0].toFixed(1)} ${start[1].toFixed(1)} C${controlOne[0].toFixed(1)} ${controlOne[1].toFixed(1)} ${controlTwo[0].toFixed(1)} ${controlTwo[1].toFixed(1)} ${tip[0].toFixed(1)} ${tip[1].toFixed(1)} C${controlThree[0].toFixed(1)} ${controlThree[1].toFixed(1)} ${controlFour[0].toFixed(1)} ${controlFour[1].toFixed(1)} ${start[0].toFixed(1)} ${start[1].toFixed(1)} Z`,
    );
  };

  const { count, step } = ribbonRepeat(ribbon, total, pitch);
  for (let floret = 0; floret < count; floret += 1) {
    const distance = (floret + 0.5) * step;
    const [centerX, centerY] = point(distance, 0, 0);
    const diagonal = Math.SQRT1_2;
    const directions = [
      [diagonal, diagonal],
      [-diagonal, diagonal],
      [-diagonal, -diagonal],
      [diagonal, -diagonal],
    ] as const;
    const reach = width * 0.3;
    const flank = width * 0.13;
    const unitSamples: Array<readonly [number, number]> = [[centerX, centerY]];
    for (const [directionAlong, directionAcross] of directions) {
      const perpendicularAlong = -directionAcross;
      const perpendicularAcross = directionAlong;
      for (const [distanceAlong, distanceAcross] of [
        [0, 0],
        [reach * 0.3, flank],
        [reach * 0.78, flank * 0.78],
        [reach, 0],
        [reach * 0.78, -flank * 0.78],
        [reach * 0.3, -flank],
      ]) {
        unitSamples.push(
          point(
            distance,
            directionAlong * distanceAlong + perpendicularAlong * distanceAcross,
            directionAcross * distanceAlong + perpendicularAcross * distanceAcross,
          ),
        );
      }
    }
    for (const side of [1, -1]) {
      for (const share of [0.24, 0.76]) {
        unitSamples.push(point(distance, step * share, side * (half - width * 0.1)));
      }
    }
    unitSamples.push(point(distance, step / 2, 0));
    if (unitSamples.some(([x, y]) => ribbonPointOccluded(x, y, occluders))) continue;

    for (const [directionAlong, directionAcross] of directions) {
      leaf(distance, 0, 0, directionAlong, directionAcross);
    }
    dot(distance, 0, 0, Math.max(1.1, width * 0.04));
    for (const side of [1, -1]) {
      for (const share of [0.24, 0.76]) {
        dot(distance, step * share, side * (half - width * 0.1), Math.max(0.9, width * 0.028));
      }
    }
    dot(distance, step / 2, 0, Math.max(1.7, width * 0.06));
  }

  return commands.join(" ");
}
