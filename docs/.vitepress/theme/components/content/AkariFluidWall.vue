<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots, watch } from "vue";

import {
  FLUID_FALLBACK_TOKENS,
  fluidLoopOffsets,
  fluidNumber,
  fluidPalette,
  fluidRenderSize,
  type FluidPalette,
  type FluidRgb,
  type FluidScheme,
  type FluidTokens,
} from "../../fluid";

const props = withDefaults(
  defineProps<{
    /** Height of the wall, as any CSS length. */
    height?: string;
    /** Which end of the wall the virtual light sits at. */
    light?: "start" | "center" | "end";
    /** Multiplies the speed of the flow; 1 is the designed drift. */
    speed?: number | string;
    /** How large a slice of the noise field is shown; larger means finer folds. */
    scale?: number | string;
    /** How hard the curl term drags the field; 0 is a plain, undirected flow. */
    curl?: number | string;
    /** 0 is the designed contrast, 1 washes the wall out into its surface. */
    tone?: number | string;
    /** How far the warped noise drags the field; lower is softer and quieter. */
    warp?: number | string;
    /** Cell of the grid laid over the flow, in px; 0 draws no grid. */
    grid?: number | string;
    /** Strength of the soft light that follows the pointer; 0 turns it off. */
    glow?: number | string;
    /**
     * How far the folds curl into petal arms; 0 keeps the plain flow, 1 is the
     * strongest the blossoms get before they read as a drawn flower.
     */
    petal?: number | string;
    /** Where the slotted content sits across the wall. */
    placement?: "start" | "center" | "end";
  }>(),
  {
    height: "clamp(220px, 34vh, 380px)",
    light: "end",
    speed: 1,
    scale: 1.5,
    curl: 8.5,
    tone: 0.2,
    warp: 0.7,
    grid: 72,
    glow: 1,
    petal: 0.6,
    placement: "start",
  },
);

const slots = useSlots();
const hasContent = computed(() => Boolean(slots.default || slots.top || slots.bottom));
/** The grid keeps whole pixels, so its lines stay one device pixel sharp. */
const gridSize = computed(() => fluidNumber(props.grid, 0, 400, 72));

const wall = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);
const litGrid = ref<HTMLElement | null>(null);
/** Set once a frame has been drawn, so the card is never shown empty. */
const painted = ref(false);

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

/**
 * The flow itself: two levels of warped noise, a curl term that drags the
 * grain along with it, and one swirl that decides where the warm end of the
 * ramp lands. The palette arrives as uniforms, so a theme change repaints the
 * same field instead of rebuilding the program.
 */
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_grain_resolution;
uniform vec2 u_loops[4];
uniform vec3 u_c1, u_c2, u_c3, u_c4, u_c5;
uniform vec3 u_core, u_halo, u_spark;
uniform vec2 u_light_pos, u_cursor;
uniform float u_light_core, u_light_halo;
uniform float u_vignette, u_grain;
uniform float u_bloom_threshold, u_bloom_range, u_bloom_strength;
uniform float u_glow, u_petal, u_petal_light, u_petal_ink;
uniform float u_sparkle, u_time, u_scale, u_curl, u_warp;
uniform vec2 u_offset;

out vec4 fragColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float fbm(vec3 p) {
  float v = 0.0;
  float amp = 0.6;
  for (int i = 0; i < 1; i++) {
    v += amp * snoise(p);
    p = p * 2.0 + vec3(100.0);
    amp *= 0.4;
  }
  return v;
}

float fluidNoise(vec2 uv) {
  float n1 = fbm(vec3(uv * 0.6, 0.0) + vec3(u_loops[0].y, 0.0, u_loops[0].x));
  float n2 = fbm(vec3(uv * 0.6 + 5.2, 1.3) + vec3(0.0, u_loops[0].y, u_loops[0].x));
  vec2 w1 = vec2(n1, n2) * 0.6 * u_warp;
  float n3 = fbm(vec3((uv + w1) * 0.7 + 1.7, 3.1) + vec3(u_loops[1].y, 0.0, u_loops[1].x));
  float n4 = fbm(vec3((uv + w1) * 0.7 + 9.2, 5.7) + vec3(0.0, u_loops[1].y, u_loops[1].x));
  vec2 w2 = vec2(n3, n4) * 0.5 * u_warp;
  return fbm(vec3((uv + w1 + w2) * 0.5, 0.0) + vec3(u_loops[2].y, 0.0, u_loops[2].x));
}

vec2 curlish(vec2 uv) {
  float eps = 0.02;
  float n = snoise(vec3(uv * 0.8, 0.0) + vec3(0.0, u_loops[2].y, u_loops[2].x));
  float nx = snoise(vec3((uv + vec2(eps, 0.0)) * 0.8, 0.0) + vec3(0.0, u_loops[2].y, u_loops[2].x));
  float ny = snoise(vec3((uv + vec2(0.0, eps)) * 0.8, 0.0) + vec3(0.0, u_loops[2].y, u_loops[2].x));
  return vec2(-(ny - n) / eps, (nx - n) / eps) * 0.003;
}

/*
 * Three loose five-armed swirls. They bend the sampling domain itself, so the
 * creases of the silk curl into petal-like arms instead of having a flower
 * painted over them.
 */
vec2 petalSwirl(vec2 screen, float strength) {
  vec2 total = vec2(0.0);
  for (int i = 0; i < 3; i++) {
    vec2 centre = vec2(0.15 + 0.38 * float(i), 0.54 + 0.13 * sin(float(i) * 2.1));
    vec2 d = screen - centre;
    float r = length(d) + 0.08;
    float a = atan(d.y, d.x);
    float arm = 0.5 + 0.5 * cos(a * 5.0 + r * 2.2 + float(i));
    total += vec2(-d.y, d.x) / r * arm;
  }
  return total * strength;
}

void main() {
  float aspect = u_resolution.x / u_resolution.y;
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 suv = vec2(uv.x * aspect, uv.y) * u_scale + u_offset;

  vec2 curl = curlish(suv);
  vec2 uvD = suv + curl * u_curl;
  if (u_petal > 0.0) {
    uvD += petalSwirl(vec2(uv.x * aspect, uv.y), 0.2 * u_petal) / max(u_scale, 0.4);
  }
  float f = fluidNoise(uvD);
  float swirl = snoise(vec3(uvD * 0.8 + f * 1.5, 0.0) + vec3(u_loops[3].y, 0.0, u_loops[3].x)) * 0.5 + 0.5;
  float n = f * 0.5 + 0.5;

  /*
   * Five-lobed blossoms around a drifting centre, bent by the same noise as the
   * folds. The field is folded into the colour value instead of drawn on top:
   * the masses turn into petal shapes where the silk creases, and vanish into
   * the flow elsewhere, which is the misty look rather than an ornament.
   */
  float petalField = 0.0;
  if (u_petal > 0.0) {
    // A faint swell left where the swirls turn, so the petals also read as a
    // breath of light in the mist rather than only as a change of the folds.
    for (int i = 0; i < 3; i++) {
      vec2 centre = vec2(0.15 + 0.38 * float(i), 0.54 + 0.13 * sin(float(i) * 2.1));
      vec2 pc = (uv - centre) * vec2(aspect, 1.0);
      float pr = length(pc);
      float lobe = 0.5 + 0.5 * cos(atan(pc.y, pc.x) * 5.0 + float(i));
      petalField += smoothstep(mix(0.2, 0.44, lobe) + 0.24, mix(0.2, 0.44, lobe) - 0.16, pr);
    }
    petalField = clamp(petalField * 0.6, 0.0, 1.0);
  }

  // Wide windows: the masses have to run into each other, not sit side by side
  // as patches.
  vec3 col = mix(u_c1, u_c2, smoothstep(0.12, 0.62, n));
  col = mix(col, u_c3, smoothstep(0.24, 0.78, n + swirl * 0.25));
  col = mix(col, u_c4, smoothstep(0.42, 0.95, swirl) * 0.42);
  col = mix(col, u_c5, smoothstep(0.4, 0.9, n * swirl) * 0.28);
  if (u_petal > 0.0) {
    // Faint light inside the blossoms on a dark wall, a faint shade inside them
    // on a pale one: the same shape, read as glow or as depth.
    float bloomShape = smoothstep(0.0, 1.0, petalField);
    col += u_core * bloomShape * u_petal_light * u_petal;
    col = mix(col, u_c3, bloomShape * u_petal_ink * u_petal);
  }

  vec2 flow = (uvD - suv) * u_grain_resolution;

  if (u_grain > 0.0) {
    vec2 grain = floor((uv * u_grain_resolution + flow) / 5.0);
    col += (hash(grain) * 2.0 - 1.0) * u_grain;
  }

  if (u_sparkle > 0.0) {
    // A lattice that only shifts by a fraction of a cell with the flow: the
    // motes drift, but stay round instead of smearing along the curl.
    vec2 cell = (uv * u_grain_resolution + flow * 0.06) / 30.0;
    float seed = hash(floor(cell) + 17.3);
    float mote = exp(-dot(fract(cell) - 0.5, fract(cell) - 0.5) * 52.0);
    float twinkle = 0.55 + 0.45 * sin(u_time * 1.4 + seed * 40.0);
    col += u_spark * mote * step(0.992, seed) * twinkle * u_sparkle;
  }

  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  float bloom = smoothstep(u_bloom_threshold - u_bloom_range, u_bloom_threshold + u_bloom_range, luma);
  col += (col * 0.85 + vec3(0.15, 0.145, 0.13)) * bloom * u_bloom_strength;

  float ld = length((uv - u_light_pos) * vec2(min(aspect, 2.0), 1.0));
  col += u_core * exp(-ld * ld * 7.0) * u_light_core;
  col += u_halo * exp(-ld * 2.4) * u_light_halo;

  float vig = 1.0 - smoothstep(0.35, 0.75, length(uv - 0.5));
  // A soft light under the pointer, wide and weak: it lifts the flow without
  // turning into a spotlight. Added before the vignette so corners still sink.
  float gd = length((uv - u_cursor) * vec2(aspect, 1.0));
  float g2 = gd * gd;
  col += u_core * u_glow * exp(-g2 * 3.4) * 0.32;

  col = mix(col * (1.0 - u_vignette), col, vig);

  fragColor = vec4(col, 1.0);
}`;

const UNIFORMS = [
  "u_resolution",
  "u_grain_resolution",
  "u_loops",
  "u_c1",
  "u_c2",
  "u_c3",
  "u_c4",
  "u_c5",
  "u_core",
  "u_halo",
  "u_spark",
  "u_light_pos",
  "u_cursor",
  "u_glow",
  "u_petal",
  "u_petal_light",
  "u_petal_ink",
  "u_light_core",
  "u_light_halo",
  "u_vignette",
  "u_grain",
  "u_bloom_threshold",
  "u_bloom_range",
  "u_bloom_strength",
  "u_sparkle",
  "u_time",
  "u_scale",
  "u_curl",
  "u_warp",
  "u_offset",
] as const;

type UniformName = (typeof UNIFORMS)[number];

/** Tokens the shader's palette is built from. */
const TOKEN_NAMES = [
  "primary",
  "primary-container",
  "secondary",
  "secondary-container",
  "tertiary",
  "tertiary-container",
  "surface-container-lowest",
  "surface-container",
  "on-surface",
] as const;

/** Where the noise field starts inside its tile. */
const FIELD_OFFSET: readonly [number, number] = [-1.0, -0.22];
/** Frames are capped here: the flow reads the same at 30 as at 60. */
const FRAME_INTERVAL = 1000 / 30;
const LIGHT_POSITIONS = { start: 0.2, center: 0.5, end: 0.82 } as const;

let context: WebGL2RenderingContext | null = null;
let program: WebGLProgram | null = null;
let locations = new Map<UniformName, WebGLUniformLocation | null>();
let palette: FluidPalette = fluidPalette(FLUID_FALLBACK_TOKENS.light, "light");
let frame = 0;
let drawnAt = 0;
let elapsed = 0; /* seconds */
/** The pointer drags the field and the light a little, so the wall answers it. */
const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
/** The glow reads this raw position: easing it made the light trail the cursor. */
const cursor = { x: 0.5, y: 0.5 };
/** The pointer light is eased in and out, so the wall never snaps. */
let glow = 0;
let glowTarget = 0;
let probe: HTMLElement | null = null;
let sample: CanvasRenderingContext2D | null = null;
let paintedFrame = false;
let reduced = false;
let onScreen = false;
let refreshFrame = 0;
let themeObserver: MutationObserver | null = null;
let resizeObserver: ResizeObserver | null = null;
let intersectionObserver: IntersectionObserver | null = null;
let motionQuery: MediaQueryList | null = null;

function compile(type: number, source: string): WebGLShader | null {
  if (!context) return null;
  const shader = context.createShader(type);
  if (!shader) return null;
  context.shaderSource(shader, source);
  context.compileShader(shader);
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    context.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(): boolean {
  if (!context) return false;
  const vertex = compile(context.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(context.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) return false;

  const created = context.createProgram();
  if (!created) return false;
  context.attachShader(created, vertex);
  context.attachShader(created, fragment);
  context.linkProgram(created);
  context.deleteShader(vertex);
  context.deleteShader(fragment);
  if (!context.getProgramParameter(created, context.LINK_STATUS)) return false;

  const buffer = context.createBuffer();
  context.bindBuffer(context.ARRAY_BUFFER, buffer);
  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    context.STATIC_DRAW,
  );
  const position = context.getAttribLocation(created, "a_position");
  context.enableVertexAttribArray(position);
  context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);

  context.useProgram(created);
  program = created;
  locations = new Map(
    UNIFORMS.map((name) => [name, context!.getUniformLocation(created, name)]),
  );
  return true;
}

function setColor3(name: UniformName, color: FluidRgb): void {
  const location = locations.get(name);
  if (context && location) context.uniform3f(location, color[0], color[1], color[2]);
}

function setFloat(name: UniformName, value: number): void {
  const location = locations.get(name);
  if (context && location) context.uniform1f(location, value);
}

/** Reads one token as a colour, through a hidden probe inside the wall. */
function readToken(name: string): FluidRgb | null {
  if (!probe || !sample) return null;
  probe.style.color = `var(--md-sys-color-${name})`;
  const value = getComputedStyle(probe).color;
  if (!value || value === "rgba(0, 0, 0, 0)" || value === "transparent") return null;
  try {
    sample.clearRect(0, 0, 1, 1);
    sample.fillStyle = value;
    sample.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = sample.getImageData(0, 0, 1, 1).data;
    if (!a) return null;
    return [r! / 255, g! / 255, b! / 255];
  } catch {
    return null;
  }
}

function currentScheme(): FluidScheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function readTokens(scheme: FluidScheme): FluidTokens {
  const fallback = FLUID_FALLBACK_TOKENS[scheme];
  const read = (name: (typeof TOKEN_NAMES)[number], key: keyof FluidTokens): FluidRgb =>
    readToken(name) ?? fallback[key];
  return {
    primary: read("primary", "primary"),
    primaryContainer: read("primary-container", "primaryContainer"),
    secondary: read("secondary", "secondary"),
    secondaryContainer: read("secondary-container", "secondaryContainer"),
    tertiary: read("tertiary", "tertiary"),
    tertiaryContainer: read("tertiary-container", "tertiaryContainer"),
    surface: read("surface-container-lowest", "surface"),
    surfaceContainer: read("surface-container", "surfaceContainer"),
    onSurface: read("on-surface", "onSurface"),
  };
}

/** Pushes the parts of the palette that never change between frames. */
function applyPalette(): void {
  if (!context || !program) return;
  const [c1, c2, c3, c4, c5] = palette.stops;
  setColor3("u_c1", c1);
  setColor3("u_c2", c2);
  setColor3("u_c3", c3);
  setColor3("u_c4", c4);
  setColor3("u_c5", c5);
  setColor3("u_core", palette.core);
  setColor3("u_halo", palette.halo);
  setColor3("u_spark", palette.spark);
  setFloat("u_light_core", palette.lightCore);
  setFloat("u_light_halo", palette.lightHalo);
  setFloat("u_bloom_threshold", palette.bloomThreshold);
  setFloat("u_bloom_range", palette.bloomRange);
  setFloat("u_bloom_strength", palette.bloomStrength);
  setFloat("u_vignette", palette.vignette);
  setFloat("u_grain", palette.grain);
  setFloat("u_sparkle", palette.sparkle);
  setFloat("u_scale", fluidNumber(props.scale, 0.6, 5, 1.5));
  setFloat("u_curl", fluidNumber(props.curl, 0, 24, 8.5));
  setFloat("u_warp", fluidNumber(props.warp, 0, 1.6, 0.7));
}

/** Re-reads the tokens; a seed, variant, contrast or scheme change lands here. */
function refresh(): void {
  if (!context || !program) return;
  const scheme = currentScheme();
  palette = fluidPalette(readTokens(scheme), scheme, fluidNumber(props.tone, 0, 1, 0.2));
  applyPalette();
  if (!frame) draw();
}

function scheduleRefresh(): void {
  if (refreshFrame) return;
  refreshFrame = requestAnimationFrame(() => {
    refreshFrame = 0;
    refresh();
  });
}

function resize(): boolean {
  const element = canvas.value;
  if (!context || !element) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return false;
  const size = fluidRenderSize(rect.width, rect.height, window.devicePixelRatio || 1);
  if (element.width !== size.width || element.height !== size.height) {
    element.width = size.width;
    element.height = size.height;
  }
  context.viewport(0, 0, size.width, size.height);
  const resolution = locations.get("u_resolution");
  const grain = locations.get("u_grain_resolution");
  if (resolution) context.uniform2f(resolution, size.width, size.height);
  // The grain and the motes are measured in CSS pixels, so they keep their
  // size on screen whatever the backing store was scaled to.
  if (grain) context.uniform2f(grain, rect.width, rect.height);
  return true;
}

function draw(): void {
  if (!context || !program) return;
  pointer.x += (pointer.targetX - pointer.x) * 0.14;
  pointer.y += (pointer.targetY - pointer.y) * 0.14;

  const loops = locations.get("u_loops");
  if (loops) context.uniform2fv(loops, fluidLoopOffsets(elapsed));
  setFloat("u_time", elapsed);

  const drift = 0.06;
  const offset = locations.get("u_offset");
  if (offset) {
    context.uniform2f(
      offset,
      FIELD_OFFSET[0] + (pointer.x - 0.5) * drift,
      FIELD_OFFSET[1] + (pointer.y - 0.5) * drift * 0.8,
    );
  }
  const light = locations.get("u_light_pos");
  if (light) {
    context.uniform2f(
      light,
      LIGHT_POSITIONS[props.light] + (pointer.x - 0.5) * 0.1,
      0.48 + (pointer.y - 0.5) * 0.08,
    );
  }

  setFloat("u_petal", fluidNumber(props.petal, 0, 1, 0.6));
  setFloat("u_petal_light", palette.petalLight);
  setFloat("u_petal_ink", palette.petalInk);

  // Lights up quickly, dies away slowly, the way a real highlight does.
  glow += (glowTarget - glow) * (glowTarget > glow ? 0.5 : 0.08);
  const cursorUniform = locations.get("u_cursor");
  if (cursorUniform) context.uniform2f(cursorUniform, cursor.x, 1 - cursor.y);
  setFloat("u_glow", glow * palette.glow * fluidNumber(props.glow, 0, 2, 1));

  context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
  if (!paintedFrame) {
    paintedFrame = true;
    painted.value = true;
  }
}

function tick(now: number): void {
  frame = requestAnimationFrame(tick);
  if (drawnAt && now - drawnAt < FRAME_INTERVAL - 1) return;
  const delta = drawnAt ? Math.min(now - drawnAt, 100) : FRAME_INTERVAL;
  drawnAt = now;
  elapsed += (delta / 1000) * (Number(props.speed) || 1);
  draw();
}

function start(): void {
  if (frame || reduced || !context || !onScreen || document.hidden) return;
  drawnAt = 0;
  frame = requestAnimationFrame(tick);
}

function stop(): void {
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  drawnAt = 0;
}

function onPointerMove(event: PointerEvent): void {
  if (event.pointerType === "touch") return;
  const element = wall.value;
  if (!element) return;
  const rect = element.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  pointer.targetX = x;
  pointer.targetY = y;
  cursor.x = x;
  cursor.y = y;
  // Written straight to the element: the grid light must not wait for a render
  // pass, and inline custom properties skip Vue's diffing entirely.
  const lit = litGrid.value;
  if (lit) {
    lit.style.setProperty("--_glow-x", `${(x * 100).toFixed(2)}%`);
    lit.style.setProperty("--_glow-y", `${(y * 100).toFixed(2)}%`);
    lit.style.setProperty("--_glow-radius", `${(gridSize.value * 3.4).toFixed(0)}px`);
    lit.style.setProperty("--_lit-alpha", String(Math.min(1, fluidNumber(props.glow, 0, 2, 1)) * 0.9));
  }
  glowTarget = 1;
  // With the loop stopped (reduced motion, or a still frame) the light still
  // answers the pointer, so the wall is not dead under the cursor.
  if (!frame) requestAnimationFrame(draw);
}

function onPointerLeave(): void {
  glowTarget = 0;
  litGrid.value?.style.setProperty("--_lit-alpha", "0");
}

function onVisibilityChange(): void {
  if (document.hidden) stop();
  else start();
}

function onContextLost(event: Event): void {
  event.preventDefault();
  stop();
  program = null;
}

function onContextRestored(): void {
  if (createProgram()) {
    resize();
    refresh();
    start();
  }
}

function onMotionChange(): void {
  reduced = motionQuery?.matches ?? false;
  if (reduced) {
    stop();
    elapsed = 0;
    draw();
  } else {
    start();
  }
}

function bootstrap(): void {
  const element = canvas.value;
  const host = wall.value;
  if (!element || !host || context) return;

  context = element.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: "low-power",
  });
  if (!context) return;

  // A probe the shader never sees: computed style resolves `var()` for us, and
  // a one-pixel canvas turns whatever colour space the token uses into sRGB.
  probe = document.createElement("span");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText =
    "position:absolute;inline-size:0;block-size:0;overflow:hidden;visibility:hidden;pointer-events:none";
  host.appendChild(probe);
  sample = document.createElement("canvas").getContext("2d", { willReadFrequently: false });

  if (!createProgram()) {
    context = null;
    return;
  }
  if (!resize()) return;
  refresh();
  draw();

  element.addEventListener("webglcontextlost", onContextLost);
  element.addEventListener("webglcontextrestored", onContextRestored);
  host.addEventListener("pointermove", onPointerMove, { passive: true });
  host.addEventListener("pointerleave", onPointerLeave, { passive: true });

  // The token values live on whichever element carries them, so both the
  // document (scheme) and the theme host (seed, variant, contrast) are watched.
  const scope = host.closest("m3e-theme") ?? document.documentElement;
  themeObserver = new MutationObserver(scheduleRefresh);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "style"],
  });
  if (scope !== document.documentElement) {
    themeObserver.observe(scope, {
      attributes: true,
      attributeFilter: ["color", "variant", "scheme", "contrast"],
    });
  }
  window.addEventListener("akari-ready", scheduleRefresh);

  resizeObserver = new ResizeObserver(() => {
    if (resize()) draw();
  });
  resizeObserver.observe(element);

  intersectionObserver = new IntersectionObserver((entries) => {
    onScreen = entries.some((entry) => entry.isIntersecting);
    if (onScreen) start();
    else stop();
  });
  intersectionObserver.observe(host);

  document.addEventListener("visibilitychange", onVisibilityChange);
  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionQuery.addEventListener("change", onMotionChange);
  onMotionChange();
}

// The wall's look is set from the tag, so a changed attribute repaints the
// same program instead of remounting it.
watch(
  () => [props.scale, props.curl, props.tone, props.warp, props.light],
  () => {
    applyPalette();
    if (!frame) draw();
  },
);

onMounted(bootstrap);

onBeforeUnmount(() => {
  stop();
  if (refreshFrame) cancelAnimationFrame(refreshFrame);
  themeObserver?.disconnect();
  resizeObserver?.disconnect();
  intersectionObserver?.disconnect();
  motionQuery?.removeEventListener("change", onMotionChange);
  window.removeEventListener("akari-ready", scheduleRefresh);
  document.removeEventListener("visibilitychange", onVisibilityChange);
  wall.value?.removeEventListener("pointermove", onPointerMove);
  wall.value?.removeEventListener("pointerleave", onPointerLeave);
  canvas.value?.removeEventListener("webglcontextlost", onContextLost);
  canvas.value?.removeEventListener("webglcontextrestored", onContextRestored);
  probe?.remove();
  probe = null;
  sample = null;
  program = null;
  context = null;
});
</script>

<template>
  <!--
    A wall of the fluid, either as decoration or as the ground for a heading.
    The canvas is drawn by the fragment shader above; the card's own gradient
    stands in for it where WebGL is missing, before the first frame, and behind
    a slow machine's single frame.
  -->
  <div
    ref="wall"
    class="akari-fluid-wall"
    :class="{ 'is-painted': painted }"
    :style="{ '--_wall-height': props.height }"
    :data-placement="props.placement"
  >
    <div class="akari-fluid-wall__canvas" aria-hidden="true">
      <canvas ref="canvas"></canvas>
    </div>
    <div
      v-if="gridSize > 0"
      class="akari-fluid-wall__grid"
      aria-hidden="true"
      :style="{ '--_grid-size': `${gridSize}px` }"
    >
      <div ref="litGrid" class="akari-fluid-wall__grid-lit"></div>
    </div>
    <div v-if="hasContent" class="akari-fluid-wall__veil" aria-hidden="true"></div>
    <div v-if="hasContent" class="akari-fluid-wall__body">
      <div v-if="slots.top" class="akari-fluid-wall__block" data-slot="top">
        <slot name="top" />
      </div>
      <div v-if="slots.default" class="akari-fluid-wall__block" data-slot="main">
        <slot />
      </div>
      <div v-if="slots.bottom" class="akari-fluid-wall__block" data-slot="bottom">
        <slot name="bottom" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * The wall fills the width its container gives it and keeps the page's corner
 * radius, so it reads as one more Material surface rather than as a banner.
 * The gradient under the canvas is the same field the shader draws, coarse:
 * a lit mass toward the light, the primary role folded into the surface.
 */
.akari-fluid-wall {
  position: relative;
  display: block;
  overflow: hidden;
  block-size: var(--_wall-height, clamp(220px, 34vh, 380px));
  border-radius: calc(var(--akari-doc-radius, 28px) * 0.72);
  isolation: isolate;
  contain: paint;
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-lowest, #ffffff) 82%,
    var(--md-sys-color-primary, #6750a4) 18%
  );
  background-image: radial-gradient(
    118% 132% at 84% 48%,
    color-mix(in srgb, var(--md-sys-color-primary, #6750a4) 34%, transparent) 0%,
    transparent 62%
  );
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--md-sys-color-outline-variant, #cac4d0) 26%, transparent);
}

html.dark .akari-fluid-wall {
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-surface-container-lowest, #0f0d13) 88%,
    var(--md-sys-color-primary-container, #4f378b) 12%
  );
  background-image: radial-gradient(
    118% 132% at 84% 48%,
    color-mix(in srgb, var(--md-sys-color-primary, #d0bcff) 22%, transparent) 0%,
    transparent 64%
  );
}

.akari-fluid-wall__canvas {
  position: absolute;
  inset: 0;
}

.akari-fluid-wall__canvas canvas {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  opacity: 0;
  transition: opacity 900ms cubic-bezier(0.2, 0, 0, 1);
}

.akari-fluid-wall.is-painted .akari-fluid-wall__canvas canvas {
  opacity: 1;
}

/*
 * The grid is CSS, not part of the shader: it costs no second draw call, stays
 * one physical pixel wide at any density, and lines up with the card's corners.
 * A fine cell every `--_grid-size`, a stronger line every fifth.
 */
.akari-fluid-wall__grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* Lines need more weight on the dark wall, less on the pale one. */
  --_grid-fine: rgb(from var(--md-sys-color-on-surface, #1d1b20) r g b / 0.05);
  --_grid-coarse: rgb(from var(--md-sys-color-on-surface, #1d1b20) r g b / 0.08);
  background-image:
    linear-gradient(to right, var(--_grid-fine) 1px, transparent 1px),
    linear-gradient(to bottom, var(--_grid-fine) 1px, transparent 1px),
    linear-gradient(to right, var(--_grid-coarse) 1px, transparent 1px),
    linear-gradient(to bottom, var(--_grid-coarse) 1px, transparent 1px);
  background-size:
    var(--_grid-size) var(--_grid-size),
    var(--_grid-size) var(--_grid-size),
    calc(var(--_grid-size) * 4) calc(var(--_grid-size) * 4),
    calc(var(--_grid-size) * 4) calc(var(--_grid-size) * 4);
  mask-image: radial-gradient(135% 155% at 80% 46%, #000 0%, rgba(0, 0, 0, 0.55) 58%, transparent 96%);
}

/*
 * The pointer lights the grid, not the liquid: a second copy of the same grid
 * in brighter ink, masked to a soft circle under the cursor. Because it is a
 * child of the masked grid, the two masks intersect and the light dies out
 * toward the corner exactly as the plain lines do.
 */
.akari-fluid-wall__grid-lit {
  position: absolute;
  inset: 0;
  pointer-events: none;
  --_glow-x: 50%;
  --_glow-y: 50%;
  --_lit-alpha: 0;
  --_lit-fine: rgb(from var(--md-sys-color-on-surface, #1d1b20) r g b / 0.22);
  --_lit-coarse: rgb(from var(--md-sys-color-on-surface, #1d1b20) r g b / 0.34);
  background-image:
    linear-gradient(to right, var(--_lit-fine) 1px, transparent 1px),
    linear-gradient(to bottom, var(--_lit-fine) 1px, transparent 1px),
    linear-gradient(to right, var(--_lit-coarse) 1px, transparent 1px),
    linear-gradient(to bottom, var(--_lit-coarse) 1px, transparent 1px);
  background-size:
    var(--_grid-size) var(--_grid-size),
    var(--_grid-size) var(--_grid-size),
    calc(var(--_grid-size) * 4) calc(var(--_grid-size) * 4),
    calc(var(--_grid-size) * 4) calc(var(--_grid-size) * 4);
  mask-image: radial-gradient(
    circle var(--_glow-radius, 240px) at var(--_glow-x) var(--_glow-y),
    #000 0%,
    rgba(0, 0, 0, 0.55) 42%,
    transparent 74%
  );
  opacity: var(--_lit-alpha);
  transition: opacity 460ms cubic-bezier(0.2, 0, 0, 1);
}

html.dark .akari-fluid-wall__grid-lit {
  --_lit-fine: rgb(from var(--md-sys-color-on-surface, #e6e1e5) r g b / 0.3);
  --_lit-coarse: rgb(from var(--md-sys-color-on-surface, #e6e1e5) r g b / 0.46);
}

html.dark .akari-fluid-wall__grid {
  --_grid-fine: rgb(from var(--md-sys-color-on-surface, #e6e1e5) r g b / 0.06);
  --_grid-coarse: rgb(from var(--md-sys-color-on-surface, #e6e1e5) r g b / 0.1);
}

/*
 * The scrim follows the content instead of sitting on one edge: a wall that
 * hosts a headline on the left must not wash out its right side, where the
 * flow is supposed to show.
 */
.akari-fluid-wall__veil {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
    100deg,
    color-mix(in srgb, var(--md-sys-color-surface, #fef7ff) 72%, transparent) 0%,
    color-mix(in srgb, var(--md-sys-color-surface, #fef7ff) 32%, transparent) 48%,
    transparent 86%
  );
}

.akari-fluid-wall[data-placement="center"] .akari-fluid-wall__veil {
  background-image: radial-gradient(
    130% 170% at 50% 62%,
    color-mix(in srgb, var(--md-sys-color-surface, #fef7ff) 74%, transparent) 0%,
    color-mix(in srgb, var(--md-sys-color-surface, #fef7ff) 34%, transparent) 52%,
    transparent 86%
  );
}

.akari-fluid-wall[data-placement="end"] .akari-fluid-wall__veil {
  background-image: linear-gradient(
    260deg,
    color-mix(in srgb, var(--md-sys-color-surface, #fef7ff) 72%, transparent) 0%,
    color-mix(in srgb, var(--md-sys-color-surface, #fef7ff) 32%, transparent) 48%,
    transparent 86%
  );
}

html.dark .akari-fluid-wall__veil {
  background-image: linear-gradient(
    100deg,
    color-mix(in srgb, var(--md-sys-color-surface-container-lowest, #0f0d13) 64%, transparent) 0%,
    color-mix(in srgb, var(--md-sys-color-surface-container-lowest, #0f0d13) 22%, transparent) 50%,
    transparent 88%
  );
}

html.dark .akari-fluid-wall[data-placement="center"] .akari-fluid-wall__veil {
  background-image: radial-gradient(
    130% 170% at 50% 62%,
    color-mix(in srgb, var(--md-sys-color-surface-container-lowest, #0f0d13) 76%, transparent) 0%,
    color-mix(in srgb, var(--md-sys-color-surface-container-lowest, #0f0d13) 32%, transparent) 54%,
    transparent 88%
  );
}

html.dark .akari-fluid-wall[data-placement="end"] .akari-fluid-wall__veil {
  background-image: linear-gradient(
    260deg,
    color-mix(in srgb, var(--md-sys-color-surface-container-lowest, #0f0d13) 64%, transparent) 0%,
    color-mix(in srgb, var(--md-sys-color-surface-container-lowest, #0f0d13) 22%, transparent) 50%,
    transparent 88%
  );
}

/*
 * Slots share one column: a header rail, the body, a footer rail. Each block is
 * a plain flex child, so a caller can drop in headings, chips or a form without
 * the wall imposing its own rhythm.
 */
.akari-fluid-wall__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(8px, 1.2vw, 14px);
  block-size: 100%;
  padding: clamp(20px, 3.4vw, 34px);
  color: var(--md-sys-color-on-surface, CanvasText);
}

.akari-fluid-wall[data-placement="center"] .akari-fluid-wall__body {
  align-items: center;
  text-align: center;
}

.akari-fluid-wall[data-placement="end"] .akari-fluid-wall__body {
  align-items: flex-end;
  text-align: right;
}

.akari-fluid-wall__block {
  inline-size: 100%;
  max-inline-size: min(62ch, var(--akari-doc-text-measure, 760px));
}

.akari-fluid-wall__block[data-slot="main"] {
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 1vw, 10px);
}

.akari-fluid-wall__block[data-slot="top"] {
  position: absolute;
  inset-block-start: clamp(20px, 3.4vw, 34px);
  inset-inline-end: clamp(20px, 3.4vw, 34px);
  inline-size: auto;
}

.akari-fluid-wall__block[data-slot="bottom"] {
  position: absolute;
  inset-block-end: clamp(20px, 3.4vw, 34px);
  inset-inline-start: clamp(20px, 3.4vw, 34px);
  inline-size: auto;
}

/* Headings inside a slot inherit the wall's ink rather than the page's. */
.akari-fluid-wall__block :is(h1, h2, h3, p) {
  margin: 0;
  color: inherit;
}

@media (prefers-reduced-motion: reduce) {
  .akari-fluid-wall__canvas canvas {
    transition: none;
  }
}
</style>
