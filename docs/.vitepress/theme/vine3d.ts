import * as THREE from "three";

import type { FluidRgb } from "./fluid";
import {
  planVineGarden,
  tangentAt,
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
export const VINE_SEED_STORAGE_KEY = "akari-vine-seed";
export const VINE_SEED_EVENT = "akari-vine-seed-change";
export const VINE_POPOUT_STORAGE_KEY = "akari-vine-popout";
export const VINE_POPOUT_EVENT = "akari-vine-popout-change";

/** How far the canvas reaches past each edge of the wall, in CSS pixels. */
export type VineBleed = { readonly left: number; readonly top: number; readonly right: number; readonly bottom: number };

export type Vine3dOptions = {
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
  /** 出屏 inward too: a few shoots come up through the wall inside it and arch toward the viewer. */
  inward?: boolean;
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
  setColor(color: FluidRgb): void;
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
  /** Ripples where shoots leave the wall: centre x, centre y, radius (plan px), phase. */
  ripples: THREE.Vector4[];
  rippleCount: { value: number };
  time: { value: number };
  /** The safe zone: x0, y0, x1, y1 in wall px about its centre (y up). */
  keep: THREE.Vector4[];
  keepCount: { value: number };
};

/** Most ripples one wall draws; one per 出屏 shoot, outward and inward. */
export const VINE_MAX_RIPPLES = 12;
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
const VineDepth = { Wall: 0, Pop: 1, Shadow: 2 } as const;
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

export function normalizeVineSeed(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return VINE_DEFAULT_SEED;
  return Math.min(0x7fffffff, Math.max(1, Math.trunc(parsed)));
}

export function readVineSeed(): number {
  if (typeof window === "undefined") return VINE_DEFAULT_SEED;
  try {
    return normalizeVineSeed(window.localStorage.getItem(VINE_SEED_STORAGE_KEY));
  } catch {
    return VINE_DEFAULT_SEED;
  }
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

export function writeVineSeed(value: unknown): number {
  const seed = normalizeVineSeed(value);
  if (typeof window === "undefined") return seed;
  try {
    window.localStorage.setItem(VINE_SEED_STORAGE_KEY, String(seed));
  } catch {
    return seed;
  }
  window.dispatchEvent(new CustomEvent<number>(VINE_SEED_EVENT, { detail: seed }));
  return seed;
}

/**
 * Hover glow, plus the wall's outline: vines on the wall are clipped to its
 * rounded rectangle, while 出屏 shoots (`pop`) are drawn over the page too and
 * only fade out where the canvas itself ends.
 */
function attachHover(material: THREE.Material, hover: VineHover, depth: VineDepth): void {
  const popUniform = { value: depth === VineDepth.Pop ? 1 : 0 };
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
    shader.uniforms.u_vine_warp = { value: hover.warp };
    shader.uniforms.u_vine_depth = depthUniform;
    shader.uniforms.u_vine_tilt = { value: hover.tilt };
    shader.uniforms.u_vine_ripples = { value: hover.ripples };
    shader.uniforms.u_vine_ripple_count = hover.rippleCount;
    shader.uniforms.u_vine_time = hover.time;
    shader.uniforms.u_vine_keep = { value: hover.keep };
    shader.uniforms.u_vine_keep_count = hover.keepCount;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute vec2 ${VINE_ANCHOR};
attribute vec4 ${VINE_PORTAL};
uniform vec2 u_vine_warp;
uniform float u_vine_depth;
uniform vec2 u_vine_tilt;
uniform vec4 u_vine_ripples[${VINE_MAX_RIPPLES}];
uniform int u_vine_ripple_count;
uniform float u_vine_time;
varying float vVineLift;
varying float vVineShade;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
transformed.xy += (u_vine_warp - 1.0) * ${VINE_ANCHOR};
// 出屏 shoots rise off the wall past their portal; everything else lies on it.
float vineEye = max(${VINE_PORTAL}.w, 1.0);
float vineUp = u_vine_depth > 0.5 ? clamp(transformed.z - ${VINE_PORTAL}.z, 0.0, vineEye * 0.6) : 0.0;
vVineLift = vineUp / (vineEye * 0.6);
vVineShade = smoothstep(0.0, 12.0, vineUp);
// What lies on the wall sways as the ripples where shoots leave it pass.
float vineFlat = 1.0 - smoothstep(0.0, 6.0, vineUp);
for (int i = 0; i < ${VINE_MAX_RIPPLES}; i++) {
  if (i >= u_vine_ripple_count) break;
  vec4 vineRipple = u_vine_ripples[i];
  vec2 vineFrom = transformed.xy - vineRipple.xy * u_vine_warp;
  float vineDist = length(vineFrom);
  float vineX = vineDist / vineRipple.z;
  if (vineX < 1.0 && vineDist > 0.01) {
    float vineEnv = (1.0 - vineX) * (1.0 - vineX) * smoothstep(0.0, 0.2, vineX);
    float vineWave = sin(PI2 * (vineX * ${VINE_RIPPLE_RINGS.toFixed(2)} - u_vine_time * ${VINE_RIPPLE_SPEED.toFixed(2)}) + vineRipple.w);
    transformed.xy += vineFrom / vineDist * vineWave * vineEnv * vineFlat * ${VINE_RIPPLE_SWAY.toFixed(2)};
  }
}
vec2 vinePortalAt = ${VINE_PORTAL}.xy * u_vine_warp;
if (u_vine_depth > 1.5) {
  // The shadow falls on the wall, away from the key light at the upper left.
  transformed.xy += vec2(0.55, -0.83) * vineUp * 0.34;
} else if (u_vine_depth > 0.5) {
  // Seen from the eye in front of the portal, so what comes closer grows,
  // and it leans away from the pointer as if the view tilted with it.
  transformed.xy = vinePortalAt + (transformed.xy - vinePortalAt) * vineEye / (vineEye - vineUp);
  transformed.xy -= u_vine_tilt * vineUp * ${VINE_POP_TILT.toFixed(3)};
}`,
      );
    shader.fragmentShader = shader.fragmentShader
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
uniform vec4 u_vine_keep[${VINE_MAX_KEEP}];
uniform int u_vine_keep_count;
varying float vVineLift;
varying float vVineShade;`,
      )
      .replace(
        "#include <opaque_fragment>",
        `float vineDistance = distance(
  gl_FragCoord.xy,
  vec2(u_vine_pointer.x * u_vine_resolution.x, (1.0 - u_vine_pointer.y) * u_vine_resolution.y)
);
float vineGlow = 1.0 - smoothstep(u_vine_radius * 0.18, u_vine_radius, vineDistance);
diffuseColor.a *= 1.0 + vineGlow * u_vine_strength;
vec2 vineAt = gl_FragCoord.xy / u_vine_resolution * u_vine_canvas;
vec2 vineCorner = abs(vineAt - u_vine_card.xy) - (u_vine_card.zw - u_vine_corner.x);
float vineCard = length(max(vineCorner, 0.0)) + min(max(vineCorner.x, vineCorner.y), 0.0) - u_vine_corner.x;
float vineInside = 1.0 - smoothstep(-u_vine_corner.y, u_vine_corner.y, vineCard);
vec2 vineRim = min(vineAt, u_vine_canvas - vineAt);
float vineOpen = smoothstep(0.0, 6.0, min(vineRim.x, vineRim.y));
diffuseColor.a *= mix(vineInside, vineOpen, u_vine_pop);
// Nothing covers the safe zone, whatever depth it is drawn at.
vec2 vineLocal = vineAt - u_vine_card.xy;
float vineKeep = 1e5;
for (int i = 0; i < ${VINE_MAX_KEEP}; i++) {
  if (i >= u_vine_keep_count) break;
  vec4 vineRect = u_vine_keep[i];
  vec2 vineBox = abs(vineLocal - (vineRect.xy + vineRect.zw) * 0.5) - (vineRect.zw - vineRect.xy) * 0.5;
  vineKeep = min(vineKeep, length(max(vineBox, 0.0)) + min(max(vineBox.x, vineBox.y), 0.0));
}
diffuseColor.a *= smoothstep(-${VINE_KEEP_FEATHER.toFixed(1)}, 0.0, vineKeep);
if (u_vine_depth > 1.5) {
  // A shadow is only there once the shoot is off the wall, and blurs away as it rises.
  diffuseColor.a *= vVineShade * (1.0 - 0.6 * vVineLift);
} else if (u_vine_depth > 0.5) {
  // Nearer reads stronger.
  diffuseColor.a *= 1.0 + 0.55 * vVineLift;
}
#include <opaque_fragment>`,
      );
  };
  material.customProgramCacheKey = () => "akari-vine-hover-clip-warp-depth-keep";
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

  get size(): number {
    return this.positions.length / 3;
  }

  vertex(point: THREE.Vector3): number {
    const pin = this.anchor ?? point;
    this.positions.push(point.x, point.y, point.z);
    this.anchors.push(pin.x, pin.y);
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
  anchor: THREE.Vector3 | null = null;

  segment(a: THREE.Vector3, b: THREE.Vector3): void {
    const pinA = this.anchor ?? a;
    const pinB = this.anchor ?? b;
    this.positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    this.anchors.push(pinA.x, pinA.y, pinB.x, pinB.y);
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
function tube(sink: MeshSink, strand: VineStrand, scale: number, pad: number): void {
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
  for (const strand of plan.strands) {
    tube(sinks.tube, strand, 1, 0);
    tube(sinks.halo, strand, HALO_SCALE, HALO_PAD);
  }
  // Leaves, flowers, tendrils and stamens are pinned whole at their base, so a
  // stretched wall moves them with their stem but never squashes them.
  for (const item of plan.blades) {
    pin(sinks, item.origin);
    blade(sinks, item);
  }
  for (const item of plan.lathes) {
    pin(sinks, item.origin);
    lathe(sinks, item);
  }
  for (const item of plan.strokes) {
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

type LayerMaterials = {
  fill: THREE.MeshStandardMaterial;
  tint: THREE.MeshBasicMaterial;
  halo: THREE.MeshBasicMaterial;
  edge: THREE.LineBasicMaterial;
  fine: THREE.LineBasicMaterial;
};

/** Vines further back are fainter: the only depth cue an orthographic wall has besides size. */
const LAYER_ALPHA = [0.6, 0.8, 1] as const;

/** 出屏 shoots stand off the wall, so they read a little stronger than the front layer. */
const POP_ALPHA = 1.45;

function layerMaterials(
  base: THREE.Color,
  alpha: number,
  hover: VineHover,
  depth: VineDepth = VineDepth.Wall,
): LayerMaterials {
  const light = base.clone().lerp(new THREE.Color(0xffffff), 0.72);
  const common = { transparent: true, depthWrite: false, side: THREE.DoubleSide } as const;
  const materials: LayerMaterials = {
    fill: new THREE.MeshStandardMaterial({
      ...common,
      color: light,
      roughness: 0.52,
      metalness: 0.03,
      emissive: light.clone().multiplyScalar(0.04),
      emissiveIntensity: 0.12,
      opacity: 0.085 * alpha,
    }),
    tint: new THREE.MeshBasicMaterial({ ...common, color: base, opacity: 0.06 * alpha }),
    halo: new THREE.MeshBasicMaterial({ ...common, color: base, opacity: 0.2 * alpha }),
    edge: new THREE.LineBasicMaterial({ color: base, transparent: true, depthWrite: false, opacity: 0.3 * alpha }),
    fine: new THREE.LineBasicMaterial({ color: base, transparent: true, depthWrite: false, opacity: 0.16 * alpha }),
  };
  for (const material of Object.values(materials)) attachHover(material, hover, depth);
  return materials;
}

/** Shade a lifted shoot casts on the wall beneath it; drawn only where it has left the wall. */
function shadowMaterial(alpha: number, hover: VineHover): THREE.MeshBasicMaterial {
  const material = new THREE.MeshBasicMaterial({
    color: 0x12091c,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    opacity: 0.14 * alpha,
  });
  attachHover(material, hover, VineDepth.Shadow);
  return material;
}

/** Tags every vertex of a 出屏 shoot with its portal, which the shader lifts it about. */
function stampPortal(geometry: THREE.BufferGeometry, portal: VinePortal): void {
  const count = geometry.getAttribute("position").count;
  const data = new Float32Array(count * 4);
  for (let index = 0; index < count; index += 1) data.set([portal.x, portal.y, portal.z, portal.eye], index * 4);
  geometry.setAttribute(VINE_PORTAL, new THREE.BufferAttribute(data, 4));
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
    ripples: Array.from({ length: VINE_MAX_RIPPLES }, () => new THREE.Vector4(0, 0, 1, 0)),
    rippleCount: { value: 0 },
    time: { value: 0 },
    keep: Array.from({ length: VINE_MAX_KEEP }, () => new THREE.Vector4()),
    keepCount: { value: 0 },
  };
  const baseColor = colorFromRgb(color);
  const layers = LAYER_ALPHA.map((share) => layerMaterials(baseColor, alpha * share, hover));
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
  const plans = planVineGarden(width, height, seed, density, edges, { keep, inward: options.inward });
  const popMaterials = plans.some((plan) => plan.pop)
    ? layerMaterials(baseColor, Math.min(1.6, alpha * POP_ALPHA), hover, VineDepth.Pop)
    : null;
  const shadow = popMaterials ? shadowMaterial(alpha, hover) : null;
  const materialSets = popMaterials ? [...layers, popMaterials] : layers;
  const portals = plans.flatMap((plan) => (plan.pop && plan.portal ? [plan.portal] : [])).slice(0, VINE_MAX_RIPPLES);
  portals.forEach((portal, index) => hover.ripples[index]!.set(portal.x, portal.y, portal.ripple, portal.phase));
  hover.rippleCount.value = portals.length;
  plans.forEach((plan, index) => {
    const materials = (plan.pop && popMaterials) || layers[plan.layer]!;
    const geometry = buildVineGeometry(plan);
    // Shoots that come off the wall are drawn after all that lies on it.
    const order = (plan.pop ? plans.length + index : index) * 10;
    const add = (object: THREE.Object3D, offset: number) => {
      object.renderOrder = order + offset;
      // Bounds are those of the plan; the shader stretches it past them.
      object.frustumCulled = false;
      scene.add(object);
    };
    if (geometry.halo) add(new THREE.Mesh(geometry.halo, materials.halo), 0);
    if (geometry.organ) {
      add(new THREE.Mesh(geometry.organ, materials.tint), 1);
      add(new THREE.Mesh(geometry.organ, materials.fill), 2);
    }
    if (geometry.tube) add(new THREE.Mesh(geometry.tube, materials.fill), 3);
    if (geometry.fine) add(new THREE.LineSegments(geometry.fine, materials.fine), 4);
    if (geometry.edge) add(new THREE.LineSegments(geometry.edge, materials.edge), 5);
    if (plan.pop && plan.portal) {
      for (const part of [geometry.halo, geometry.organ, geometry.tube, geometry.fine, geometry.edge]) {
        if (part) stampPortal(part, plan.portal);
      }
      if (shadow) {
        if (geometry.organ) add(new THREE.Mesh(geometry.organ, shadow), -2);
        if (geometry.tube) add(new THREE.Mesh(geometry.tube, shadow), -1);
      }
    }
  });
  const pointerTarget = new THREE.Vector3();
  const pointer = new THREE.Vector3();
  const pointerUvTarget = new THREE.Vector2(0.5, 0.5);
  const tiltTarget = new THREE.Vector2();
  let pointerActive = 0;
  let hoverLevel = 0;
  const lift = Math.max(40, Math.min(width, height) * 0.2);
  let cardWidth = width;
  let cardHeight = height;
  const resize = (nextWidth: number, nextHeight: number) => {
    cardWidth = nextWidth;
    cardHeight = nextHeight;
    hover.warp.set(nextWidth / width, nextHeight / height);
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
    hover.canvas.set(canvasWidth, canvasHeight);
    hover.card.set(bleed.left + nextWidth / 2, bleed.bottom + nextHeight / 2, nextWidth / 2, nextHeight / 2);
    hover.corner.x = Math.min(radius, nextWidth / 2, nextHeight / 2);
    const glowRadius = Math.max(96, Math.min(160, Math.max(nextWidth, nextHeight) * 0.48));
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
    setColor(nextColor) {
      const next = colorFromRgb(nextColor);
      const light = next.clone().lerp(new THREE.Color(0xffffff), 0.72);
      for (const materials of materialSets) {
        materials.fill.color.copy(light);
        materials.fill.emissive.copy(light).multiplyScalar(0.04);
        materials.tint.color.copy(next);
        materials.halo.color.copy(next);
        materials.edge.color.copy(next);
        materials.fine.color.copy(next);
      }
    },
    portals,
    setKeep,
    render(time) {
      if (time !== undefined) hover.time.value = time;
      hover.tilt.lerp(tiltTarget, 0.06);
      pointer.lerp(pointerTarget, 0.16);
      hover.pointer.lerp(pointerUvTarget, 0.16);
      pointerLight.position.copy(pointer);
      pointerLight.intensity += (pointerActive * 1.3 - pointerLight.intensity) * 0.12;
      hoverLevel += (pointerActive - hoverLevel) * (pointerActive > hoverLevel ? 0.18 : 0.08);
      hover.strength.value = hoverLevel * 2.8;
      renderer.render(scene, camera);
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
      renderer.dispose();
    },
  };
}
