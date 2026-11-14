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
export function fluidPalette(tokens: FluidTokens, scheme: FluidScheme, tone = 0): FluidPalette {
  const palette = basePalette(tokens, scheme);
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

function basePalette(tokens: FluidTokens, scheme: FluidScheme): FluidPalette {
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
        shade(mixFluid(tokens.surface, tokens.tertiary, 0.66), 0.49),
        shade(mixFluid(base, tokens.secondaryContainer, 1), 0.7),
      ],
      core: mixFluid(WHITE, tokens.tertiary, 0.4),
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
      mixFluid(tokens.tertiaryContainer, tokens.tertiary, 0.2),
      mixFluid(tokens.surfaceContainer, tokens.secondaryContainer, 0.7),
    ],
    core: mixFluid(WHITE, tokens.tertiary, 0.45),
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
