/**
 * Growth of the vine overlay (vine3d.ts meshes and draws it).
 *
 * A vine is grown, not drawn between two points. Each one enters from beyond
 * an edge, walks towards a target well inside the wall on two slow curvature
 * waves, and turns back from the other edges, so its body stays on the wall
 * and its tip ends inside it, pointing into it.
 *
 * Leaves, tendrils, side shoots and blooms grow from nodes along the way. Every
 * child starts on its parent's axis, thinner than the parent there, and peels
 * away from the parent's direction before turning out, so a joint reads as a
 * fork rather than as a stick pushed into a stem. A stem that ends in a bloom
 * narrows into a stalk, turns towards the way the bloom faces, and swells into
 * a receptacle exactly as wide as the bloom's base, so nothing pinches.
 *
 * The plan is plain geometry with no WebGL, which is what the tests exercise.
 */
import * as THREE from "three";

export type VineRandom = () => number;
/** Left, top, right, bottom. */
export type VineEdge = 0 | 1 | 2 | 3;
export type VineLeafShape = "ovate" | "lanceolate" | "heart" | "ivy" | "round";
export type VinePetalShape = "obovate" | "notched" | "pointed" | "broad" | "frilled";
export type VineBladeShape = VineLeafShape | VinePetalShape | "sepal";
export type VineFlowerKind = "blossom" | "star" | "double" | "trumpet" | "bell";
export type VineBudKind = "teardrop" | "furled" | "opening";
export type VineTerminalKind = "flower" | "bud" | "leaf" | "tip";
export type VineStrandRole = "stem" | "branch" | "pedicel" | "petiole" | "tendril";
export type VineStrandEnd = "point" | "round" | "flat";

/** A tube along a centre line, with its radius at every sample. */
export interface VineStrand {
  readonly role: VineStrandRole;
  readonly points: THREE.Vector3[];
  readonly radii: number[];
  /** Strand this one grows from, or -1 for a vine's main stem. */
  readonly parent: number;
  /** Sample of the parent that the first point sits on. */
  readonly parentSample: number;
  readonly end: VineStrandEnd;
}

export interface VineBladeSpec {
  readonly shape: VineBladeShape;
  /** From the point of attachment to the tip, in CSS px. */
  readonly length: number;
  /** Multiplies the outline's half-width. */
  readonly width: number;
  /** Scales the second half against the first. */
  readonly asymmetry: number;
  /** V crease along the midrib, per unit of half-width. */
  readonly fold: number;
  /** Lengthwise curl towards the blade's normal (+) or away from it (−). */
  readonly bend: number;
  /** Crosswise curl, which spoons the blade. */
  readonly cup: number;
  /** Turn about the midrib from base to tip, in radians. */
  readonly twist: number;
  /** Waves along the margin. */
  readonly ruffle: number;
  /** Pairs of side veins; 0 draws none. */
  readonly veins: number;
  readonly venation: "pinnate" | "fan";
  readonly midrib: boolean;
}

/** Anything flat: a leaf, a petal, a sepal. `x` runs to the tip, `n` is the face. */
export interface VineBlade {
  readonly role: "leaf" | "petal" | "sepal" | "bract";
  readonly origin: THREE.Vector3;
  readonly x: THREE.Vector3;
  readonly y: THREE.Vector3;
  readonly n: THREE.Vector3;
  readonly spec: VineBladeSpec;
}

/** A turned body: a bud, a trumpet or bell corolla, a flower's disc. */
export interface VineLathe {
  readonly role: "corolla" | "bud" | "disc";
  readonly origin: THREE.Vector3;
  readonly axis: THREE.Vector3;
  /** Perpendicular to the axis; angle 0 of the lobes and seams. */
  readonly ref: THREE.Vector3;
  /** [height along the axis, radius], base first. */
  readonly rows: ReadonlyArray<readonly [number, number]>;
  readonly lobes: number;
  /** Radial share of the lobes, reached at the rim. */
  readonly lobeDepth: number;
  /** Axial reach of the lobes, as a share of the rim radius. */
  readonly flute: number;
  readonly seams: number;
  /** Turns each seam makes from its start to the top row. */
  readonly seamTwist: number;
  /** Row fraction the seams start at. */
  readonly seamFrom: number;
  readonly seamOffset: number;
  readonly rim: boolean;
  /** Trace the body's silhouette, as seen from the front of the wall. */
  readonly outline: boolean;
}

/** A hair-thin line, such as a stamen, with an optional anther at its end. */
export interface VineStroke {
  readonly points: THREE.Vector3[];
  readonly dot: number;
}

export interface VineTerminal {
  readonly strand: number;
  readonly kind: VineTerminalKind;
  readonly bloom: VineFlowerKind | VineBudKind | null;
  /** End of the stem proper, before any stalk turns it towards a bloom. */
  readonly point: THREE.Vector3;
  readonly tangent: THREE.Vector3;
  /** Radius the stem has there. */
  readonly radius: number;
  /** Radius of the receptacle the bloom sits on; 0 when there is none. */
  readonly receptacle: number;
}

export interface VinePlan {
  /** 0 is the back of the wall, 1 the front. */
  readonly depth: number;
  readonly layer: 0 | 1 | 2;
  readonly species: string;
  readonly edge: VineEdge;
  readonly strands: VineStrand[];
  readonly blades: VineBlade[];
  readonly lathes: VineLathe[];
  readonly strokes: VineStroke[];
  readonly terminals: VineTerminal[];
  /** A 出屏 shoot that grows out past the wall's edge, drawn unclipped. */
  readonly pop?: boolean;
  /** A 出屏 shoot that comes up through the wall and arches back over it (朝内钻出). */
  readonly inward?: boolean;
  /** Where a 出屏 shoot comes up through the wall and starts to come forward. */
  readonly portal?: VinePortal;
}

/**
 * The point a 出屏 shoot comes up through the wall, in plan px. Past it the
 * shoot rises towards the viewer: `z - portal.z` is its height off the wall,
 * and it is drawn as seen from `eye` px in front of the portal, so the lifted
 * stem and its bloom grow as they come closer.
 */
export interface VinePortal {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly eye: number;
  /** Index of the first point past the portal on its strand. */
  readonly from: number;
  /** How far the ripple it raises on the wall spreads, px. */
  readonly ripple: number;
  /** Where the ripple starts in its swell, so neighbours do not beat together. */
  readonly phase: number;
}

/** Most a lifted point slides sideways, per px of lift, when the view tilts with the pointer. */
export const VINE_POP_TILT = 0.06;

/** The scale a point `z` high is drawn at about `portal`. */
export function vinePortalScale(portal: VinePortal, z: number): number {
  const lift = clamp(z - portal.z, 0, portal.eye * 0.6);
  return portal.eye / (portal.eye - lift);
}

const UP = new THREE.Vector3(0, 0, 1);
const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;

function smooth(value: number): number {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function wrapAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

/** mulberry32: small and fast, and the same seed always grows the same garden. */
export function vineRandom(seed: number): VineRandom {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function between(random: VineRandom, min: number, max: number): number {
  return min + (max - min) * random();
}

function pick<T>(random: VineRandom, items: readonly T[]): T {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))]!;
}

function shuffle<T>(random: VineRandom, items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap]!, copy[index]!];
  }
  return copy;
}

function weighted<T extends string>(random: VineRandom, weights: Readonly<Record<T, number>>): T {
  const entries = Object.entries(weights) as Array<[T, number]>;
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * total;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1]![0];
}

/* ------------------------------------------------------------------------ */
/* Outlines                                                                  */
/* ------------------------------------------------------------------------ */

type OutlineSpec =
  | {
      kind: "profile";
      /** Half-width follows x^a (1 − x)^b: `a` shapes the base, `b` the tip. */
      a: number;
      b: number;
      width: number;
      center: number;
      notch?: number;
      frill?: number;
      acuminate?: number;
    }
  | {
      kind: "polar";
      /** Radius around `center` against the angle from the tip, as a share of π. */
      keys: ReadonlyArray<readonly [number, number]>;
      width: number;
      center: number;
      acuminate?: number;
    };

const OUTLINES: Readonly<Record<VineBladeShape, OutlineSpec>> = {
  ovate: { kind: "profile", a: 0.5, b: 1.05, width: 0.27, center: 0.4, acuminate: 0.35 },
  lanceolate: { kind: "profile", a: 0.62, b: 0.95, width: 0.15, center: 0.45, acuminate: 0.2 },
  round: { kind: "profile", a: 0.55, b: 0.62, width: 0.38, center: 0.48, acuminate: 0.2 },
  heart: {
    kind: "polar",
    center: 0.4,
    width: 1.02,
    acuminate: 0.45,
    keys: [
      [0, 0.6],
      [0.07, 0.45],
      [0.22, 0.37],
      [0.5, 0.38],
      [0.72, 0.45],
      [0.86, 0.47],
      [0.95, 0.4],
      [1, 0.33],
    ],
  },
  ivy: {
    kind: "polar",
    center: 0.45,
    width: 1,
    acuminate: 0.25,
    keys: [
      [0, 0.55],
      [0.1, 0.34],
      [0.2, 0.28],
      [0.36, 0.47],
      [0.5, 0.3],
      [0.66, 0.37],
      [0.84, 0.44],
      [0.94, 0.38],
      [1, 0.34],
    ],
  },
  obovate: { kind: "profile", a: 1.1, b: 0.42, width: 0.34, center: 0.58 },
  notched: { kind: "profile", a: 1.05, b: 0.4, width: 0.37, center: 0.58, notch: 0.11 },
  pointed: { kind: "profile", a: 0.85, b: 0.95, width: 0.2, center: 0.5, acuminate: 0.2 },
  broad: { kind: "profile", a: 0.85, b: 0.33, width: 0.42, center: 0.55 },
  frilled: { kind: "profile", a: 1, b: 0.4, width: 0.36, center: 0.56, frill: 0.07 },
  sepal: { kind: "profile", a: 0.55, b: 1.25, width: 0.13, center: 0.4, acuminate: 0.2 },
};

/** Hermite through the keys, with Catmull-Rom slopes. */
function interpolateKeys(keys: ReadonlyArray<readonly [number, number]>, at: number): number {
  const last = keys.length - 1;
  if (at <= keys[0]![0]) return keys[0]![1];
  if (at >= keys[last]![0]) return keys[last]![1];
  let index = 0;
  while (index < last - 1 && keys[index + 1]![0] < at) index += 1;
  const slope = (key: number) => {
    const before = keys[Math.max(0, key - 1)]!;
    const after = keys[Math.min(last, key + 1)]!;
    return (after[1] - before[1]) / (after[0] - before[0]);
  };
  const [f0, r0] = keys[index]!;
  const [f1, r1] = keys[index + 1]!;
  const span = f1 - f0;
  const t = (at - f0) / span;
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * r0 +
    (t3 - 2 * t2 + t) * slope(index) * span +
    (-2 * t3 + 3 * t2) * r1 +
    (t3 - t2) * slope(index + 1) * span
  );
}

export interface VineOutline {
  /** Upper half, tip first, ending at the point of attachment. */
  readonly upper: ReadonlyArray<readonly [number, number]>;
  /** Where along the midrib the blade's fan of rings is centred. */
  readonly center: number;
}

/**
 * One half of a blade, in units of its length from where it is attached. The
 * other half is the mirror; every point is visible from `center`, so the blade
 * can be meshed as rings shrinking towards it.
 */
export function vineBladeOutline(shape: VineBladeShape, samples = 16): VineOutline {
  const spec = OUTLINES[shape];
  const count = Math.max(5, Math.round(samples));
  const upper: Array<[number, number]> = [];
  let center = spec.center;
  if (spec.kind === "profile") {
    const peak = spec.a / (spec.a + spec.b);
    const norm = Math.pow(peak, spec.a) * Math.pow(1 - peak, spec.b);
    for (let index = 0; index < count; index += 1) {
      const x = (1 + Math.cos((Math.PI * index) / (count - 1))) / 2;
      let y = (spec.width * Math.pow(x, spec.a) * Math.pow(1 - x, spec.b)) / norm;
      if (spec.frill) y *= 1 + spec.frill * Math.sin(x * 31) * x * x;
      let along = x;
      if (spec.notch) {
        along -= spec.notch * Math.pow(Math.max(0, 1 - y / (spec.width * 0.55)), 2) * smooth((x - 0.6) / 0.3);
      }
      upper.push([along, y]);
    }
  } else {
    const base = spec.center - interpolateKeys(spec.keys, 1);
    const span = 1 - base;
    center = (spec.center - base) / span;
    for (let index = 0; index < count; index += 1) {
      const fraction = index / (count - 1);
      const angle = Math.PI * fraction;
      const radius = interpolateKeys(spec.keys, fraction);
      upper.push([
        (spec.center + radius * Math.cos(angle) - base) / span,
        (radius * Math.sin(angle) * spec.width) / span,
      ]);
    }
  }
  if (spec.acuminate) {
    for (const point of upper) point[1] *= 1 - spec.acuminate * Math.exp(-(((1 - point[0]) / 0.2) ** 2));
  }
  upper[0]![1] = 0;
  upper[upper.length - 1]![1] = 0;
  return { upper, center };
}

/* ------------------------------------------------------------------------ */
/* The wall                                                                  */
/* ------------------------------------------------------------------------ */

interface Frame {
  readonly width: number;
  readonly height: number;
  readonly hw: number;
  readonly hh: number;
  /** Size every organ scales with: it grows with the wall, but slower. */
  readonly unit: number;
  /** How close to an edge a vine may run once it is on the wall. */
  readonly margin: number;
  readonly step: number;
  /** Safe zones the vines keep out of, so what is written there stays clear. */
  readonly keep: readonly VineRect[];
}

/** A safe zone on the wall, in plan px centred on the wall, y up. */
export interface VineRect {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

function makeFrame(width: number, height: number, keep: readonly VineRect[] = []): Frame {
  const min = Math.min(width, height);
  const unit = 280 * Math.pow(Math.max(min, 140) / 280, 0.6);
  return {
    width,
    height,
    hw: width / 2,
    hh: height / 2,
    unit,
    margin: clamp(min * 0.11, 16, 64),
    step: clamp(unit * 0.012, 2.4, 5),
    keep,
  };
}

/** Distance to the nearest edge of a wall centred on the origin; negative outside. */
export function vineInsideDistance(width: number, height: number, x: number, y: number): number {
  return Math.min(width / 2 - Math.abs(x), height / 2 - Math.abs(y));
}

/** Distance to the wall's nearest edge; negative outside. */
function edgeInside(frame: Frame, x: number, y: number): number {
  return Math.min(frame.hw - Math.abs(x), frame.hh - Math.abs(y));
}

/** Signed distance to `rect`: negative inside it. */
function rectDistance(rect: VineRect, x: number, y: number): number {
  const dx = Math.abs(x - (rect.x0 + rect.x1) / 2) - (rect.x1 - rect.x0) / 2;
  const dy = Math.abs(y - (rect.y0 + rect.y1) / 2) - (rect.y1 - rect.y0) / 2;
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0);
}

/** Unit normal pointing out of `rect` at a point, the way its distance grows. */
function rectNormal(rect: VineRect, x: number, y: number): [number, number] {
  const ox = x - (rect.x0 + rect.x1) / 2;
  const oy = y - (rect.y0 + rect.y1) / 2;
  const dx = Math.abs(ox) - (rect.x1 - rect.x0) / 2;
  const dy = Math.abs(oy) - (rect.y1 - rect.y0) / 2;
  const sx = ox < 0 ? -1 : 1;
  const sy = oy < 0 ? -1 : 1;
  if (dx > 0 && dy > 0) {
    const length = Math.hypot(dx, dy);
    return [(sx * dx) / length, (sy * dy) / length];
  }
  return dx > dy ? [sx, 0] : [0, sy];
}

/** Signed distance to the nearest of `keep`: negative inside one, infinite with none. */
export function vineKeepClearance(keep: readonly VineRect[], x: number, y: number): number {
  let clearance = Number.POSITIVE_INFINITY;
  for (const rect of keep) clearance = Math.min(clearance, rectDistance(rect, x, y));
  return clearance;
}

function keepClearance(frame: Frame, x: number, y: number): number {
  return vineKeepClearance(frame.keep, x, y);
}

/** Room left around a point: to the wall's edge or the nearest safe zone, whichever is closer. */
function insideDistance(frame: Frame, x: number, y: number): number {
  const edge = edgeInside(frame, x, y);
  return frame.keep.length ? Math.min(edge, keepClearance(frame, x, y)) : edge;
}

/** Share of the wall left free of safe zones (overlaps counted twice, which only errs low). */
function freeShare(frame: Frame): number {
  let covered = 0;
  for (const rect of frame.keep) {
    const w = Math.min(rect.x1, frame.hw) - Math.max(rect.x0, -frame.hw);
    const h = Math.min(rect.y1, frame.hh) - Math.max(rect.y0, -frame.hh);
    if (w > 0 && h > 0) covered += w * h;
  }
  return clamp(1 - covered / (frame.width * frame.height), 0, 1);
}

/** Inward normal of each edge. */
export const VINE_EDGE_INWARD: readonly (readonly [number, number])[] = [
  [1, 0],
  [0, -1],
  [-1, 0],
  [0, 1],
];

function edgeAnchor(frame: Frame, edge: VineEdge, along: number): THREE.Vector2 {
  if (edge === 0) return new THREE.Vector2(-frame.hw, frame.hh - along * frame.height);
  if (edge === 1) return new THREE.Vector2(-frame.hw + along * frame.width, frame.hh);
  if (edge === 2) return new THREE.Vector2(frame.hw, -frame.hh + along * frame.height);
  return new THREE.Vector2(frame.hw - along * frame.width, -frame.hh);
}

function edgeDistance(frame: Frame, edge: number, x: number, y: number): number {
  if (edge === 0) return x + frame.hw;
  if (edge === 1) return frame.hh - y;
  if (edge === 2) return frame.hw - x;
  return y + frame.hh;
}

/* ------------------------------------------------------------------------ */
/* Walking                                                                   */
/* ------------------------------------------------------------------------ */

interface Path {
  readonly points: THREE.Vector3[];
  readonly arcs: number[];
  readonly headings: number[];
}

interface WalkSpec {
  length: number;
  step: number;
  target: THREE.Vector2 | null;
  /** Curvature per radian between the heading and the target. */
  steer: number;
  /** Arc length over which the steering fades in, so the start keeps its heading. */
  steerRamp: number;
  arrive: number;
  /** [curvature, wavelength, phase] of each wander wave. */
  wander: ReadonlyArray<readonly [number, number, number]>;
  bias: number;
  maxCurvature: number;
  avoid: { frame: Frame; margin: number; entry: number } | null;
  /** Extra turn spread over the first `distance`: how a child peels off its parent. */
  fork: { angle: number; distance: number } | null;
  z: { base: number; amp: number; wave: number; phase: number; rise: number };
}

function beginPath(start: THREE.Vector3, heading: number): Path {
  return { points: [start.clone()], arcs: [0], headings: [heading] };
}

function avoidance(spec: NonNullable<WalkSpec["avoid"]>, x: number, y: number, heading: number, entered: boolean): number {
  const hx = Math.cos(heading);
  const hy = Math.sin(heading);
  let turn = 0;
  for (let edge = 0; edge < 4; edge += 1) {
    if (edge === spec.entry && !entered) continue;
    const distance = edgeDistance(spec.frame, edge, x, y);
    if (distance >= spec.margin) continue;
    const [ix, iy] = VINE_EDGE_INWARD[edge]!;
    const toward = -(hx * ix + hy * iy);
    if (toward < -0.3) continue;
    const proximity = 1 - Math.max(0, distance) / spec.margin;
    const cross = hx * iy - hy * ix;
    const sign = Math.abs(cross) < 1e-3 ? 1 : Math.sign(cross);
    turn += sign * (1.7 / spec.margin) * proximity * proximity * (toward + 0.3);
  }
  for (const rect of spec.frame.keep) {
    const distance = rectDistance(rect, x, y);
    if (distance >= spec.margin) continue;
    const [nx, ny] = rectNormal(rect, x, y);
    const toward = -(hx * nx + hy * ny);
    if (toward < -0.3) continue;
    const proximity = 1 - Math.max(0, distance) / spec.margin;
    const cross = hx * ny - hy * nx;
    const sign = Math.abs(cross) < 1e-3 ? 1 : Math.sign(cross);
    turn += sign * (2.2 / spec.margin) * proximity * proximity * (toward + 0.3);
  }
  return turn;
}

function extend(path: Path, spec: WalkSpec): void {
  let heading = path.headings[path.headings.length - 1]!;
  const origin = path.arcs[path.arcs.length - 1]!;
  const point = path.points[path.points.length - 1]!.clone();
  const entry = spec.avoid?.entry ?? -1;
  let entered = entry < 0;
  for (let travelled = 0; travelled < spec.length - 1e-6; ) {
    const step = Math.min(spec.step, spec.length - travelled);
    let curvature = spec.bias;
    for (const [amp, wave, phase] of spec.wander) {
      curvature += amp * Math.sin((travelled / wave) * TAU + phase);
    }
    if (spec.target) {
      const desired = Math.atan2(spec.target.y - point.y, spec.target.x - point.x);
      curvature +=
        clamp(wrapAngle(desired - heading), -1.2, 1.2) * spec.steer * smooth(travelled / Math.max(1, spec.steerRamp));
    }
    curvature = clamp(curvature, -spec.maxCurvature, spec.maxCurvature);
    if (spec.fork && travelled < spec.fork.distance) curvature += spec.fork.angle / spec.fork.distance;
    if (spec.avoid) {
      if (!entered && edgeDistance(spec.avoid.frame, entry, point.x, point.y) >= spec.avoid.margin * 0.6) {
        entered = true;
      }
      curvature += avoidance(spec.avoid, point.x, point.y, heading, entered);
    }
    heading += curvature * step;
    point.x += Math.cos(heading) * step;
    point.y += Math.sin(heading) * step;
    travelled += step;
    point.z =
      spec.z.base +
      spec.z.amp * Math.sin(((origin + travelled) / spec.z.wave) * TAU + spec.z.phase) +
      spec.z.rise * travelled;
    path.points.push(point.clone());
    path.arcs.push(origin + travelled);
    path.headings.push(heading);
    if (spec.target && Math.hypot(spec.target.x - point.x, spec.target.y - point.y) < spec.arrive) break;
  }
}

/**
 * A logarithmic spiral off the end of the path: the radius shrinks from `from`
 * to `to` while the curl turns `turns` times, which is how a fern head or a
 * tendril's end rolls up.
 */
function curl(path: Path, turns: number, from: number, to: number, side: number, step: number, rise = 0): void {
  const ratio = from / Math.max(to, 1e-3);
  const length = (turns * TAU * from * Math.log(ratio)) / (ratio - 1);
  let heading = path.headings[path.headings.length - 1]!;
  const origin = path.arcs[path.arcs.length - 1]!;
  const point = path.points[path.points.length - 1]!.clone();
  for (let travelled = 0; travelled < length - 1e-6; ) {
    const radius = from * Math.pow(to / from, travelled / length);
    const advance = Math.min(step, radius * 0.3, length - travelled);
    heading += (side * advance) / radius;
    point.x += Math.cos(heading) * advance;
    point.y += Math.sin(heading) * advance;
    point.z += rise * advance;
    travelled += advance;
    path.points.push(point.clone());
    path.arcs.push(origin + travelled);
    path.headings.push(heading);
  }
}

/** Winds the tail of a path into a coil spring around its own centre line. */
function coil(path: Path, from: number, radius: number, turns: number, tilt: number): void {
  const axis = path.points.map((point) => point.clone());
  const count = axis.length - from;
  if (count < 4) return;
  for (let index = from; index < axis.length; index += 1) {
    const amount = (index - from) / (count - 1);
    const tangent = tangentAt(axis, index);
    const across = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
    const lift = UP.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(tangent, Math.sin(tilt));
    const angle = amount * turns * TAU;
    const size = radius * smooth(amount / 0.22) * (1 - 0.4 * amount);
    path.points[index]!.copy(axis[index]!)
      .addScaledVector(across, size * Math.sin(angle))
      .addScaledVector(lift, size * (1 - Math.cos(angle)));
  }
}

export function tangentAt(points: readonly THREE.Vector3[], index: number): THREE.Vector3 {
  const last = points.length - 1;
  for (let reach = 1; reach <= Math.max(1, last); reach += 1) {
    const before = points[Math.max(0, index - reach)]!;
    const after = points[Math.min(last, index + reach)]!;
    const tangent = after.clone().sub(before);
    if (tangent.lengthSq() > 1e-10) return tangent.normalize();
  }
  return new THREE.Vector3(1, 0, 0);
}

function sampleAt(arcs: readonly number[], arc: number): number {
  let low = 0;
  let high = arcs.length - 1;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (arcs[middle]! < arc) low = middle + 1;
    else high = middle;
  }
  return low;
}

/* ------------------------------------------------------------------------ */
/* Species                                                                   */
/* ------------------------------------------------------------------------ */

interface Species {
  readonly name: string;
  readonly leaf: VineLeafShape;
  readonly leafWidth: number;
  /** Chance a leaf is three leaflets on one stalk. */
  readonly trifoliate: number;
  readonly flower: VineFlowerKind;
  readonly petal: VinePetalShape;
  readonly petals: readonly number[];
  readonly bud: VineBudKind;
  /** Chance per node of a tendril opposite the leaf. */
  readonly tendril: number;
  /** Chance per node of a bloom on its own stalk in the leaf's axil. */
  readonly axillary: number;
}

/**
 * One plant per vine, so leaves, blooms and tendrils on a vine agree with each
 * other while the wall as a whole stays varied.
 */
const SPECIES: readonly Species[] = [
  {
    name: "glory",
    leaf: "heart",
    leafWidth: 1,
    trifoliate: 0,
    flower: "trumpet",
    petal: "broad",
    petals: [5],
    bud: "furled",
    tendril: 0.34,
    axillary: 0.16,
  },
  {
    name: "clematis",
    leaf: "lanceolate",
    leafWidth: 1.2,
    trifoliate: 0.55,
    flower: "star",
    petal: "pointed",
    petals: [4, 5, 6, 6],
    bud: "teardrop",
    tendril: 0.2,
    axillary: 0.14,
  },
  {
    name: "sakura",
    leaf: "ovate",
    leafWidth: 1,
    trifoliate: 0,
    flower: "blossom",
    petal: "notched",
    petals: [5],
    bud: "teardrop",
    tendril: 0.3,
    axillary: 0.2,
  },
  {
    name: "camellia",
    leaf: "round",
    leafWidth: 0.9,
    trifoliate: 0,
    flower: "double",
    petal: "broad",
    petals: [5, 6],
    bud: "opening",
    tendril: 0.22,
    axillary: 0.12,
  },
  {
    name: "bellflower",
    leaf: "ivy",
    leafWidth: 1,
    trifoliate: 0,
    flower: "bell",
    petal: "obovate",
    petals: [5],
    bud: "teardrop",
    tendril: 0.4,
    axillary: 0.18,
  },
  {
    name: "rambler",
    leaf: "ovate",
    leafWidth: 0.82,
    trifoliate: 0.4,
    flower: "blossom",
    petal: "frilled",
    petals: [5, 6],
    bud: "opening",
    tendril: 0.26,
    axillary: 0.16,
  },
];

const FLOWER_SCALE: Readonly<Record<VineFlowerKind, number>> = {
  blossom: 1,
  star: 1.1,
  double: 0.96,
  trumpet: 1.15,
  bell: 0.95,
};

const MAIN_TERMINALS: Readonly<Record<VineTerminalKind, number>> = { flower: 0.38, bud: 0.17, leaf: 0.15, tip: 0.3 };
const BRANCH_TERMINALS: Readonly<Record<VineTerminalKind, number>> = { flower: 0.28, bud: 0.26, leaf: 0.16, tip: 0.3 };
/** What a terminal falls back to when its bloom has no room. */
const TERMINAL_FALLBACK: Readonly<Record<VineTerminalKind, readonly VineTerminalKind[]>> = {
  flower: ["flower", "bud", "leaf", "tip"],
  bud: ["bud", "leaf", "tip"],
  leaf: ["leaf", "tip"],
  tip: ["tip"],
};

/* ------------------------------------------------------------------------ */
/* Garden                                                                    */
/* ------------------------------------------------------------------------ */

interface Disc {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

interface Garden {
  readonly frame: Frame;
  readonly random: VineRandom;
  /** Room taken by organs, so later ones grow into free space. */
  readonly occupied: Disc[];
  readonly targets: THREE.Vector2[];
  readonly trails: THREE.Vector2[];
  /** Stems and branches of finished vines, so new shoots can avoid crossing them. */
  readonly wires: Wire[];
}

interface VineBuilder {
  readonly garden: Garden;
  readonly plan: VinePlan;
  readonly species: Species;
  readonly size: number;
  /** Leaf length at the base of the main stem, as a share of the unit. */
  readonly leafBase: number;
  /** How far leaves hang towards the bottom of the wall, as on a real climber. */
  readonly droop: number;
  branches: number;
  blooms: number;
}

interface Shoot {
  readonly role: "stem" | "branch" | "pedicel";
  readonly path: Path;
  readonly r0: number;
  readonly generation: number;
  readonly size: number;
  readonly terminal: VineTerminalKind;
  /** A pedicel exists only for its bloom: if that has no room it is not grown. */
  readonly fixed: boolean;
  readonly bloomSize?: number;
  readonly parent: number;
  readonly parentSample: number;
}

function crowding(garden: Garden, x: number, y: number, r: number): number {
  let worst = 0;
  for (const disc of garden.occupied) {
    const gap = Math.hypot(x - disc.x, y - disc.y);
    const overlap = (r + disc.r - gap) / (2 * Math.min(r, disc.r));
    if (overlap > worst) worst = overlap;
  }
  return worst;
}

function vineCount(frame: Frame, density: number): number {
  return Math.round(clamp((Math.sqrt(frame.width * frame.height) / frame.unit) * 2.3 * density, 2, 10));
}

/**
 * Entry points spread around the edge, so vines come from every side. Short
 * edges are weighted up on a wide strip; otherwise almost every vine would
 * drop from the top or rise from the bottom.
 */
function perimeterEntries(frame: Frame, count: number, random: VineRandom): Array<{ edge: VineEdge; along: number }> {
  const vertical = clamp(Math.sqrt(frame.width / frame.height), 1, 2.2);
  const horizontal = clamp(Math.sqrt(frame.height / frame.width), 1, 2.2);
  const lengths = [
    frame.height * vertical,
    frame.width * horizontal,
    frame.height * vertical,
    frame.width * horizontal,
  ];
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const offset = random();
  const entries: Array<{ edge: VineEdge; along: number }> = [];
  for (let index = 0; index < count; index += 1) {
    const share = (((index + offset + (random() - 0.5) * 0.55) / count) % 1 + 1) % 1;
    let distance = share * total;
    let edge = 0;
    while (edge < 3 && distance > lengths[edge]!) {
      distance -= lengths[edge]!;
      edge += 1;
    }
    entries.push({ edge: edge as VineEdge, along: clamp(distance / lengths[edge]!, 0.05, 0.95) });
  }
  return entries;
}

function chooseTarget(garden: Garden, anchor: THREE.Vector2, inward: THREE.Vector2, reach: number): THREE.Vector2 {
  const { frame, random } = garden;
  const insetX = Math.min(frame.margin * 1.6, frame.hw * 0.6);
  const insetY = Math.min(frame.margin * 1.6, frame.hh * 0.6);
  const minimumDepth = Math.min(frame.width, frame.height) * 0.3;
  let best: THREE.Vector2 | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = new THREE.Vector2(
      between(random, -frame.hw + insetX, frame.hw - insetX),
      between(random, -frame.hh + insetY, frame.hh - insetY),
    );
    const offset = candidate.clone().sub(anchor);
    if (offset.dot(inward) < minimumDepth) continue;
    if (frame.keep.length && keepClearance(frame, candidate.x, candidate.y) < frame.margin * 0.7) continue;
    let spacing = Number.POSITIVE_INFINITY;
    for (const target of garden.targets) spacing = Math.min(spacing, candidate.distanceTo(target));
    let trail = Number.POSITIVE_INFINITY;
    for (const point of garden.trails) trail = Math.min(trail, candidate.distanceTo(point));
    const score =
      -Math.abs(offset.length() - reach) / reach +
      Math.min(1, spacing / (frame.unit * 0.9)) * 0.7 +
      Math.min(1, trail / (frame.unit * 0.55)) * 0.9;
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  const target = best ?? anchor.clone().addScaledVector(inward, minimumDepth);
  garden.targets.push(target);
  return target;
}

/** Share of a path that runs off the wall after it has entered, plus a fault for an outside tip. */
function pathFault(frame: Frame, path: Path): number {
  let entered = false;
  let inside = 0;
  let outside = 0;
  for (const point of path.points) {
    const distance = edgeInside(frame, point.x, point.y);
    if (!entered) {
      if (distance < 0) continue;
      entered = true;
    }
    inside += 1;
    if (distance < -1) outside += 1;
    // Running over a safe zone is worse than leaving the wall: it covers what is written there.
    else if (frame.keep.length && keepClearance(frame, point.x, point.y) < -1) outside += 4;
  }
  if (!entered) return 99;
  const tip = path.points[path.points.length - 1]!;
  return outside / Math.max(1, inside) + (insideDistance(frame, tip.x, tip.y) < frame.margin * 0.4 ? 1 : 0);
}

export interface VineGardenStats {
  readonly unit: number;
  readonly margin: number;
}

export function vineGardenStats(width: number, height: number): VineGardenStats {
  const frame = makeFrame(width, height);
  return { unit: frame.unit, margin: frame.margin };
}

/**
 * Every vine on a wall `width` × `height`, back to front. `popout` adds 出屏
 * shoots on top: `true` lets them leave by any edge, a number only by the
 * edges whose bits are set (`1 << edge`, see {@link VINE_POP_ALL}).
 */
export interface VineGardenOptions {
  /** Safe zones, in plan px centred on the wall, y up: no vine grows over them. */
  readonly keep?: readonly VineRect[];
  /** 朝内: a few shoots that come up through the wall inside it and rise towards the viewer. */
  readonly inward?: boolean;
}

export function planVineGarden(
  width: number,
  height: number,
  seed: number,
  density = 1,
  popout: boolean | number = false,
  options: VineGardenOptions = {},
): VinePlan[] {
  if (!(width > 0) || !(height > 0) || !(density > 0)) return [];
  const random = vineRandom(seed);
  const frame = makeFrame(width, height, options.keep ?? []);
  const garden: Garden = { frame, random, occupied: [], targets: [], trails: [], wires: [] };
  // Fewer vines on a wall that is mostly safe zone, so the rest is not crammed.
  const count = vineCount(frame, density * Math.max(0.5, freeShare(frame)));
  const species = shuffle(random, SPECIES);
  // Drawn for the full count either way, so the stream does not hang on which are dropped.
  const entries = perimeterEntries(frame, count, random).flatMap((entry) => {
    const along = clearAlong(frame, entry.edge, entry.along);
    return along === null ? [] : [{ edge: entry.edge, along }];
  });
  const depths = shuffle(
    random,
    Array.from({ length: count }, (_, index) => (index + 0.2 + random() * 0.6) / count),
  );
  // Front vines grow first, so their blooms take the room they want.
  const order = entries
    .map((entry, index) => ({ entry, depth: depths[index]!, species: species[index % species.length]! }))
    .sort((a, b) => b.depth - a.depth);
  const plans: VinePlan[] = [];
  for (const { entry, depth, species: kind } of order) {
    const plan = growVine(garden, entry.edge, entry.along, depth, kind);
    if (plan) plans.push(plan);
  }
  const used = species.slice(0, Math.min(species.length, count));
  for (let extra = 0; extra < 4; extra += 1) {
    const plan = fillGap(garden, used);
    if (!plan) break;
    plans.push(plan);
  }
  // Planned last, so the wall underneath is the same with them on or off. One
  // draw seeds both kinds, each on its own copy of the garden, so neither
  // depends on whether the other is there.
  const edges = popout === true ? VINE_POP_ALL : popout === false ? 0 : popout & VINE_POP_ALL;
  const salt = Math.floor(random() * 4294967296);
  const extra: VinePlan[] = [];
  if (edges) extra.push(...planPopShoots(garden, plans, edges, salt));
  if (options.inward) extra.push(...planInwardShoots(garden, plans, salt));
  plans.push(...extra);
  return plans.sort((a, b) => a.depth - b.depth);
}

/**
 * Where along `edge` a vine can come in clear of the safe zones: `along` if
 * it already is, else the nearest clear spot a little way off, or null.
 */
function clearAlong(frame: Frame, edge: VineEdge, along: number): number | null {
  if (!frame.keep.length) return along;
  for (let step = 0; step <= 12; step += 1) {
    for (const sign of step ? [1, -1] : [1]) {
      const at = along + sign * step * 0.03;
      if (at < 0.05 || at > 0.95) continue;
      const anchor = edgeAnchor(frame, edge, at);
      if (keepClearance(frame, anchor.x, anchor.y) >= frame.margin * 1.2) return at;
    }
  }
  return null;
}

function growVine(
  garden: Garden,
  edge: VineEdge,
  along: number,
  depth: number,
  species: Species,
  goal: THREE.Vector2 | null = null,
): VinePlan | null {
  const { frame, random } = garden;
  const size = 0.82 + depth * 0.36;
  const r0 = frame.unit * between(random, 0.0068, 0.0108) * size;
  const anchor = edgeAnchor(frame, edge, along);
  const [ix, iy] = VINE_EDGE_INWARD[edge]!;
  const inward = new THREE.Vector2(ix, iy);
  const beyond = r0 * 3 + 10;
  const zBase = (depth - 0.5) * frame.unit * 0.12;
  const start = new THREE.Vector3(anchor.x - ix * beyond, anchor.y - iy * beyond, zBase);
  const reach = between(random, 0.3, 0.62) * (frame.width + frame.height) * 0.5;
  const target = goal ?? chooseTarget(garden, anchor, inward, reach);
  const inwardAngle = Math.atan2(iy, ix);
  const scale = 280 / frame.unit;
  const distance = Math.hypot(target.x - start.x, target.y - start.y);

  // Keep the stem inside the wall and, where it can, off the stems already grown.
  let best: { path: Path; score: number } | null = null;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const aim = Math.atan2(target.y - start.y, target.x - start.x);
    const heading = inwardAngle + clamp(wrapAngle(aim - inwardAngle) + between(random, -0.55, 0.55), -1.15, 1.15);
    const path = beginPath(start, heading);
    extend(path, {
      length: distance * 1.8,
      step: frame.step,
      target,
      steer: between(random, 0.0035, 0.0065) * scale,
      steerRamp: Math.min(distance * 0.45, frame.unit * 0.8),
      arrive: frame.step * 2.5,
      wander: [
        [between(random, 0.003, 0.0075) * scale * (random() < 0.5 ? -1 : 1), frame.unit * between(random, 0.9, 1.7), random() * TAU],
        [between(random, 0.0015, 0.0038) * scale, frame.unit * between(random, 0.35, 0.6), random() * TAU],
      ],
      bias: 0,
      maxCurvature: 1 / (frame.unit * 0.06),
      avoid: { frame, margin: frame.margin, entry: edge },
      fork: null,
      z: { base: zBase, amp: frame.unit * 0.02, wave: frame.unit * between(random, 0.5, 0.9), phase: random() * TAU, rise: 0 },
    });
    const fault = pathFault(frame, path);
    if (fault >= 0.5) continue;
    const score = fault + crossings(null, garden, path, 0) * STEM_CROSSING_COST;
    if (!best || score < best.score) best = { path, score };
    if (score < 0.02) break;
  }
  if (!best) return null;

  const path = best.path;
  const length = path.arcs[path.arcs.length - 1]!;
  const plan: VinePlan = {
    depth,
    layer: depth < 0.34 ? 0 : depth < 0.67 ? 1 : 2,
    species: species.name,
    edge,
    strands: [],
    blades: [],
    lathes: [],
    strokes: [],
    terminals: [],
  };
  const vine: VineBuilder = {
    garden,
    plan,
    species,
    size,
    leafBase: between(random, 0.088, 0.118) * size,
    droop: between(random, 0.15, 0.95),
    branches: (length > frame.unit * 1.1 ? 2 : 1) + (random() < 0.5 ? 1 : 0),
    blooms: 1 + (random() < 0.55 ? 1 : 0),
  };
  develop(vine, {
    role: "stem",
    path,
    r0,
    generation: 0,
    size,
    terminal: weighted(random, MAIN_TERMINALS),
    fixed: false,
    parent: -1,
    parentSample: -1,
  });
  for (const strand of plan.strands) {
    if (strand.role !== "stem" && strand.role !== "branch") continue;
    for (let index = 0; index < strand.points.length; index += 5) {
      const point = strand.points[index]!;
      garden.trails.push(new THREE.Vector2(point.x, point.y));
    }
    garden.wires.push(...wiresOf(strand.points));
  }
  return plan;
}

/** The emptiest point of the wall, and how far it is from anything grown. */
function largestGap(garden: Garden): { point: THREE.Vector2; distance: number } {
  const { frame } = garden;
  const columns = Math.max(4, Math.round(frame.width / (frame.unit * 0.18)));
  const rowsCount = Math.max(3, Math.round(frame.height / (frame.unit * 0.18)));
  let best = { point: new THREE.Vector2(), distance: -1 };
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rowsCount; row += 1) {
      const x = -frame.hw + ((column + 0.5) / columns) * frame.width;
      const y = -frame.hh + ((row + 0.5) / rowsCount) * frame.height;
      if (insideDistance(frame, x, y) < frame.margin * 0.8) continue;
      let distance = Number.POSITIVE_INFINITY;
      for (const point of garden.trails) distance = Math.min(distance, Math.hypot(x - point.x, y - point.y));
      for (const disc of garden.occupied) distance = Math.min(distance, Math.hypot(x - disc.x, y - disc.y) - disc.r);
      if (distance > best.distance) best = { point: new THREE.Vector2(x, y), distance };
    }
  }
  return best;
}

/** Grows an extra vine into the emptiest part of the wall, from the nearest edge that leaves it room. */
function fillGap(garden: Garden, species: readonly Species[]): VinePlan | null {
  const { frame, random } = garden;
  const gap = largestGap(garden);
  if (gap.distance < frame.unit * 0.3) return null;
  const { point } = gap;
  const minimumDepth = Math.min(frame.width, frame.height) * 0.25;
  const edges = ([0, 1, 2, 3] as VineEdge[])
    .map((edge) => ({ edge, depth: edgeDistance(frame, edge, point.x, point.y) }))
    .filter(({ depth }) => depth >= minimumDepth)
    .sort((a, b) => a.depth - b.depth);
  if (!edges.length) return null;
  const { edge } = edges[edges.length > 1 && random() < 0.3 ? 1 : 0]!;
  const length = edge % 2 === 0 ? frame.height : frame.width;
  const projection =
    edge === 0
      ? (frame.hh - point.y) / frame.height
      : edge === 1
        ? (point.x + frame.hw) / frame.width
        : edge === 2
          ? (point.y + frame.hh) / frame.height
          : (frame.hw - point.x) / frame.width;
  const along = clamp(projection + (between(random, -0.3, 0.3) * Math.min(frame.width, frame.height)) / length, 0.05, 0.95);
  garden.targets.push(point);
  return growVine(garden, edge, along, between(random, 0.15, 0.85), pick(random, species), point);
}

function leafLengthAt(vine: VineBuilder, generation: number, t: number): number {
  const shrink = generation === 0 ? 1 : generation === 1 ? 0.82 : 0.7;
  return vine.garden.frame.unit * vine.leafBase * (1 - 0.42 * Math.pow(clamp(t, 0, 1), 1.5)) * shrink;
}

/** Lays a shoot down as a strand, then grows its nodes and its end. */
/** Fade the first few radii into the host so a shoot does not read as a cut stub. */
function taperShootRoot(strand: VineStrand): void {
  const count = Math.min(8, strand.radii.length);
  for (let index = 0; index < count; index += 1) {
    strand.radii[index]! *= 0.12 + (0.88 * index) / count;
  }
}

function develop(vine: VineBuilder, shoot: Shoot): number {
  const { garden, plan, species } = vine;
  const { frame, random } = garden;
  const path = shoot.path;
  const stemEnd = path.points.length - 1;
  const end = path.points[stemEnd]!.clone();
  const tangent = tangentAt(path.points, stemEnd);
  const flat = new THREE.Vector2(tangent.x, tangent.y);
  if (flat.lengthSq() < 1e-8) flat.set(1, 0);
  flat.normalize();

  const flowerRadius =
    shoot.bloomSize ?? frame.unit * between(random, 0.068, 0.094) * shoot.size * FLOWER_SCALE[species.flower];
  const budLength = shoot.bloomSize ?? frame.unit * between(random, 0.062, 0.085) * shoot.size;
  const leafLength = leafLengthAt(vine, shoot.generation, 0.6) * 1.1;
  const order = shoot.fixed ? [shoot.terminal] : TERMINAL_FALLBACK[shoot.terminal];
  let kind: VineTerminalKind | null = null;
  for (const candidate of order) {
    if (candidate === "tip") {
      kind = "tip";
      break;
    }
    const extent =
      candidate === "flower" ? flowerRadius * 1.05 : candidate === "bud" ? budLength * 0.62 : leafLength * 0.5;
    const cx = end.x + flat.x * extent * 0.8;
    const cy = end.y + flat.y * extent * 0.8;
    if (edgeInside(frame, cx, cy) < extent * 0.55) continue;
    if (frame.keep.length && keepClearance(frame, cx, cy) < extent) continue;
    if (crowding(garden, cx, cy, extent) > (candidate === "leaf" ? 0.5 : 0.3)) continue;
    garden.occupied.push({ x: cx, y: cy, r: extent });
    kind = candidate;
    break;
  }
  if (kind === null) return -1;

  // A bare tip rolls up, mostly towards the middle of the wall.
  let curlLength = 0;
  if (kind === "tip") {
    const before = path.arcs[path.arcs.length - 1]!;
    const inwardSide = Math.sign(flat.x * -end.y - flat.y * -end.x) || 1;
    curl(
      path,
      between(random, 0.5, 1.4),
      frame.unit * between(random, 0.026, 0.044) * shoot.size,
      0.45 + frame.unit * 0.005,
      random() < 0.75 ? inwardSide : -inwardSide,
      frame.step,
    );
    curlLength = path.arcs[path.arcs.length - 1]! - before;
  }

  const total = path.arcs[path.arcs.length - 1]!;
  const stalkRadius =
    kind === "flower"
      ? Math.max(shoot.r0 * 0.46, 0.75)
      : kind === "bud"
        ? Math.max(shoot.r0 * 0.44, 0.7)
        : kind === "leaf"
          ? Math.max(shoot.r0 * 0.34, 0.55)
          : 0;
  const endRadius = Math.min(stalkRadius, shoot.r0 * (shoot.role === "pedicel" ? 0.82 : 1));
  const radii = path.arcs.map((arc) => {
    const t = arc / total;
    if (kind === "tip") return shoot.r0 * Math.pow(1 - t, 0.85) + 0.04;
    return endRadius + (shoot.r0 - endRadius) * Math.pow(1 - t, 1.2);
  });
  const strand: VineStrand = {
    role: shoot.role,
    points: path.points,
    radii,
    parent: shoot.parent,
    parentSample: shoot.parentSample,
    end: kind === "tip" ? "point" : kind === "leaf" ? "round" : "flat",
  };
  const index = plan.strands.push(strand) - 1;

  if (shoot.role !== "pedicel") {
    placeNodes(vine, index, shoot, path.arcs, total, endClearance(kind, flowerRadius, budLength, leafLength, curlLength, frame));
  }

  const tipTangent = tangentAt(strand.points, stemEnd);
  if (kind === "flower" || kind === "bud") {
    const bloom = kind === "flower" ? species.flower : shoot.fixed || random() < 0.7 ? species.bud : "opening";
    const shape = bloomOutline(kind, bloom, flowerRadius, budLength, endRadius, random);
    const axis = bloomAxis(tipTangent, shape.elevation, shape.swing);
    if (kind === "flower" ? random() < 0.6 : random() < 0.35) {
      addBracts(vine, index, stemEnd, Math.min(flowerRadius, leafLength) * between(random, 0.5, 0.7));
    }
    const top = appendNeck(strand, tipTangent, axis, shape.neck, endRadius, shape.receptacle);
    plan.terminals.push({
      strand: index,
      kind,
      bloom,
      point: end,
      tangent: tipTangent,
      radius: endRadius,
      receptacle: shape.receptacle,
    });
    if (kind === "flower") planFlower(vine, bloom as VineFlowerKind, top, axis, flowerRadius, shape.receptacle);
    else planBud(vine, bloom as VineBudKind, top, axis, budLength, shape.receptacle);
  } else {
    plan.terminals.push({
      strand: index,
      kind,
      bloom: null,
      point: end,
      tangent: tipTangent,
      radius: kind === "tip" ? radii[radii.length - 1]! : endRadius,
      receptacle: 0,
    });
    if (kind === "leaf") {
      const direction = tipTangent.clone().setZ(tipTangent.z + 0.12).normalize();
      addLeafBlade(vine, end, direction, leafLength, random() < 0.5 ? 1 : -1, "leaf");
      if (random() < 0.55) addBracts(vine, index, Math.max(0, stemEnd - 2), leafLength * 0.42);
    } else if (random() < 0.45 && curlLength > 0) {
      // A young, still-folded leaf just behind a rolled tip.
      const arc = Math.max(0, total - curlLength - leafLength * 0.25);
      addBracts(vine, index, sampleAt(path.arcs, arc), leafLength * 0.45, 1);
    }
  }
  return index;
}

function endClearance(
  kind: VineTerminalKind,
  flowerRadius: number,
  budLength: number,
  leafLength: number,
  curlLength: number,
  frame: Frame,
): number {
  if (kind === "flower") return flowerRadius * 1.25;
  if (kind === "bud") return budLength * 1.05;
  if (kind === "leaf") return leafLength * 0.95;
  return curlLength + frame.unit * 0.03;
}

/** Nodes along a shoot, each with a leaf and maybe a shoot, a bloom or a tendril. */
function placeNodes(
  vine: VineBuilder,
  strandIndex: number,
  shoot: Shoot,
  arcs: readonly number[],
  total: number,
  clearance: number,
): void {
  const { garden, plan, species } = vine;
  const { frame, random } = garden;
  const strand = plan.strands[strandIndex]!;
  const points = strand.points;
  let first = 0;
  while (first < points.length && edgeInside(frame, points[first]!.x, points[first]!.y) < 2) first += 1;
  if (first >= points.length) return;
  const startArc = Math.max(arcs[first]! + frame.unit * 0.02, shoot.role === "branch" ? shoot.r0 * 10 + 6 : 0);
  const endArc = total - clearance;
  let side = random() < 0.5 ? 1 : -1;
  let arc = startArc + between(random, 0.1, 0.7) * leafLengthAt(vine, shoot.generation, 0);
  const bumps: Array<readonly [number, number]> = [];
  // A real shoot grows in spurts: vigour swells and fades along it, and nodes
  // bunch up then spread out, so the leaves never read as evenly spaced rungs.
  const phrase = frame.unit * between(random, 0.45, 0.9);
  const phase = random() * TAU;
  let cluster = 0;
  while (arc < endArc) {
    const t = arc / total;
    const sample = sampleAt(arcs, arc);
    const point = points[sample]!;
    const vigour = 1 + 0.2 * Math.sin((arc / phrase) * TAU + phase);
    const leafLength = leafLengthAt(vine, shoot.generation, t) * vigour * (cluster > 0 ? 0.82 : 1);
    if (insideDistance(frame, point.x, point.y) > -2) {
      if (random() < 0.84) {
        planLeaf(vine, strandIndex, sample, side, leafLength);
        // Now and then a node carries a smaller leaf on the other side too.
        if (random() < 0.1) planLeaf(vine, strandIndex, sample, -side, leafLength * between(random, 0.55, 0.78));
      }
      let axillary = false;
      if (
        shoot.generation < 2 &&
        vine.branches > 0 &&
        t > 0.12 &&
        t < 0.72 &&
        random() < (shoot.generation === 0 ? 0.34 : 0.2)
      ) {
        axillary = planBranch(vine, strandIndex, sample, side, shoot);
        if (axillary) vine.branches -= 1;
      }
      if (!axillary && vine.blooms > 0 && t > 0.18 && t < 0.92 && random() < species.axillary) {
        if (planAxillaryBloom(vine, strandIndex, sample, side, shoot)) vine.blooms -= 1;
      }
      if (random() < Math.min(0.82, species.tendril * 1.55)) planTendril(vine, strandIndex, sample, -side, shoot.size);
      bumps.push([arc, strand.radii[sample]!]);
    }
    let internode = leafLength * between(random, 0.85, 1.6);
    if (cluster > 0) {
      cluster -= 1;
      internode *= cluster === 0 ? between(random, 1.7, 2.5) : between(random, 0.38, 0.6);
    } else if (random() < 0.2) {
      cluster = random() < 0.5 ? 1 : 2;
      internode *= between(random, 0.38, 0.6);
    } else if (random() < 0.1) {
      internode *= 2.1;
    }
    arc += internode;
    if (random() < 0.82) side = -side;
  }
  // A node swells a little, the way a real stem thickens where a leaf leaves it.
  for (let index = 0; index < strand.radii.length; index += 1) {
    let swell = 0;
    for (const [at, radius] of bumps) {
      swell += 0.14 * Math.exp(-(((arcs[index]! - at) / (radius * 2.6 + 0.5)) ** 2));
    }
    strand.radii[index]! *= 1 + Math.min(0.22, swell);
  }
}

/** A short stalk that starts along its parent and turns out to `end`. */
function addStalk(
  plan: VinePlan,
  role: VineStrandRole,
  parent: number,
  parentSample: number,
  base: THREE.Vector3,
  along: THREE.Vector3,
  finish: THREE.Vector3,
  end: THREE.Vector3,
  length: number,
  r0: number,
  r1: number,
  samples = 9,
): number {
  const curve = new THREE.CubicBezierCurve3(
    base.clone(),
    base.clone().addScaledVector(along, length * 0.3),
    end.clone().addScaledVector(finish, -length * 0.35),
    end.clone(),
  );
  const points = curve.getSpacedPoints(samples - 1);
  const radii = points.map((_, index) => {
    const amount = index / (samples - 1);
    return (r0 + (r1 - r0) * smooth(amount)) * (index === 0 ? 1.12 : 1);
  });
  return plan.strands.push({ role, points, radii, parent, parentSample, end: "round" }) - 1;
}

function bladeFrame(direction: THREE.Vector3, roll: number): { x: THREE.Vector3; y: THREE.Vector3; n: THREE.Vector3 } {
  const x = direction.clone().normalize();
  const n = UP.clone().addScaledVector(x, -UP.dot(x));
  if (n.lengthSq() < 1e-6) n.set(0, 1, 0);
  n.normalize();
  if (roll) n.applyAxisAngle(x, roll);
  const y = new THREE.Vector3().crossVectors(n, x).normalize();
  return { x, y, n };
}

function addLeafBlade(
  vine: VineBuilder,
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  length: number,
  side: number,
  role: "leaf" | "bract",
  fold?: number,
): void {
  const { random } = vine.garden;
  const frame = bladeFrame(direction, side * between(random, -0.25, 0.8));
  vine.plan.blades.push({
    role,
    origin: origin.clone(),
    ...frame,
    spec: {
      shape: vine.species.leaf,
      length,
      width: vine.species.leafWidth * between(random, 0.88, 1.12),
      asymmetry: between(random, 0.88, 1.1),
      fold: fold ?? between(random, 0.05, 0.18),
      bend: between(random, -0.28, 0.06),
      cup: between(random, -0.04, 0.1),
      twist: between(random, -0.3, 0.3),
      ruffle: 0,
      veins: length > 18 ? 4 : length > 10 ? 3 : 0,
      venation: "pinnate",
      midrib: length > 7,
    },
  });
}

function planLeaf(vine: VineBuilder, parent: number, sample: number, side: number, length: number): boolean {
  const { garden, plan, species } = vine;
  const { frame, random } = garden;
  const strand = plan.strands[parent]!;
  const base = strand.points[sample]!;
  const tangent = tangentAt(strand.points, sample);
  const heading = Math.atan2(tangent.y, tangent.x);
  const parentRadius = strand.radii[sample]!;
  const size = length * between(random, 0.76, 1.16) * (random() < 0.1 ? 1.25 : 1);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const facing = attempt === 1 ? -side : side;
    const spread = between(random, 0.45, 1.25) * (attempt === 2 ? 0.65 : 1);
    const lift = between(random, -0.1, 0.32);
    const compound = species.trifoliate > 0 && random() < species.trifoliate;
    const petiole = size * (compound ? between(random, 0.34, 0.46) : between(random, 0.16, 0.38));
    const out = heading + facing * spread;
    let turn = out + facing * between(random, 0.05, 0.42);
    // Leaves hang a little, but never across their own stem.
    const droop = vine.droop * random();
    const hanging = Math.atan2(Math.sin(turn) - droop, Math.cos(turn));
    if (Math.sign(Math.sin(hanging - heading)) === facing) turn = hanging;
    const startDirection = new THREE.Vector3(Math.cos(out), Math.sin(out), lift).normalize();
    const finish = new THREE.Vector3(Math.cos(turn), Math.sin(turn), lift * 0.3 - 0.06).normalize();
    const joint = base.clone().addScaledVector(startDirection, petiole);
    const reach = compound ? size * 0.8 : size;
    const cx = joint.x + finish.x * reach * 0.5;
    const cy = joint.y + finish.y * reach * 0.5;
    if (edgeInside(frame, cx, cy) < -reach * 0.2) continue;
    if (frame.keep.length && keepClearance(frame, cx, cy) < reach * 0.55) continue;
    if (crowding(garden, cx, cy, reach * 0.42) > 0.55) continue;
    garden.occupied.push({ x: cx, y: cy, r: reach * 0.42 });
    const r0 = Math.min(parentRadius * 0.7, clamp(parentRadius * 0.55, 0.45, Math.max(0.6, size * 0.042)));
    const r1 = r0 * 0.68;
    const stalk = addStalk(plan, "petiole", parent, sample, base, tangent, finish, joint, petiole, r0, r1);
    if (!compound) {
      addLeafBlade(vine, joint, finish, size, facing, "leaf");
      return true;
    }
    addLeafBlade(vine, joint, finish, size * 0.64, facing, "leaf");
    const stalkEnd = plan.strands[stalk]!.points.length - 1;
    for (const flank of [-1, 1]) {
      const angle = Math.atan2(finish.y, finish.x) + flank * between(random, 0.75, 1.05);
      const direction = new THREE.Vector3(Math.cos(angle), Math.sin(angle), finish.z).normalize();
      const reachOut = size * 0.08;
      const tip = joint.clone().addScaledVector(direction, reachOut);
      addStalk(plan, "petiole", stalk, stalkEnd, joint, finish, direction, tip, reachOut, r1 * 0.8, r1 * 0.6, 5);
      addLeafBlade(vine, tip, direction, size * 0.5, flank, "leaf");
    }
    return true;
  }
  return false;
}

/** Small sessile leaves that cup the base of a bloom or a terminal leaf. */
function addBracts(vine: VineBuilder, strandIndex: number, sample: number, length: number, count = 2): void {
  const { random } = vine.garden;
  const strand = vine.plan.strands[strandIndex]!;
  const point = strand.points[sample]!;
  const tangent = tangentAt(strand.points, sample);
  const heading = Math.atan2(tangent.y, tangent.x);
  const first = random() < 0.5 ? 1 : -1;
  for (let index = 0; index < count; index += 1) {
    const side = index === 0 ? first : -first;
    const angle = heading + side * between(random, 0.45, 0.85);
    const direction = new THREE.Vector3(Math.cos(angle), Math.sin(angle), between(random, 0.05, 0.3)).normalize();
    const across = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize().multiplyScalar(side * strand.radii[sample]! * 0.5);
    addLeafBlade(vine, point.clone().add(across), direction, length * between(random, 0.8, 1.1), side, "bract", between(random, 0.22, 0.4));
  }
}

type TendrilStyle = "spring" | "coil" | "hook" | "wave" | "fork";
const TENDRIL_STYLES: Readonly<Record<TendrilStyle, number>> = {
  spring: 0.32,
  coil: 0.18,
  hook: 0.2,
  wave: 0.14,
  fork: 0.16,
};

/**
 * A tendril: a thin feeler from a node. They come in several habits, so a run
 * of them never reads as one stamp repeated: a tight spring, a helix, a long
 * loose hook, a wavering thread, or a feeler that splits in two.
 */
function planTendril(vine: VineBuilder, parent: number, sample: number, side: number, size: number): boolean {
  const { garden, plan } = vine;
  const { frame, random } = garden;
  const strand = plan.strands[parent]!;
  const base = strand.points[sample]!;
  const tangent = tangentAt(strand.points, sample);
  const heading = Math.atan2(tangent.y, tangent.x);
  const style = weighted(random, TENDRIL_STYLES);
  const stretch = style === "hook" ? between(random, 1.3, 1.75) : style === "wave" ? between(random, 1.15, 1.6) : 1;
  const length = frame.unit * between(random, 0.09, 0.16) * size * stretch;
  const turn = side * between(random, 0.5, 1.15);
  const reach = length * (style === "hook" ? between(random, 0.62, 0.78) : style === "wave" ? 1 : between(random, 0.36, 0.52));
  const aim = heading + turn;
  const cx = base.x + Math.cos(aim) * Math.min(reach, length * 0.6) * 1.15;
  const cy = base.y + Math.sin(aim) * Math.min(reach, length * 0.6) * 1.15;
  if (edgeInside(frame, cx, cy) < 0) return false;
  if (frame.keep.length && keepClearance(frame, cx, cy) < length * 0.3) return false;
  if (crowding(garden, cx, cy, length * 0.3) > 0.75) return false;
  garden.occupied.push({ x: cx, y: cy, r: length * 0.22 });
  const step = Math.min(frame.step, 2);
  const path = beginPath(base, heading + turn * 0.3);
  const rise = between(random, 0.02, 0.08);
  const wave = style === "wave";
  extend(path, {
    length: reach,
    step,
    target: null,
    steer: 0,
    steerRamp: 1,
    arrive: 0,
    wander: wave
      ? [[between(random, 0.035, 0.06), reach * between(random, 0.45, 0.65), random() * TAU]]
      : [[between(random, 0.004, 0.014), reach * 1.6, random() * TAU]],
    bias: style === "hook" ? side * between(random, 0.006, 0.014) : -side * between(random, 0, 0.012),
    maxCurvature: wave ? 0.12 : 0.2,
    avoid: null,
    fork: { angle: turn * 0.7, distance: reach * 0.45 },
    z: { base: base.z, amp: 0, wave: 1, phase: 0, rise },
  });
  const curlSide = random() < 0.6 ? side : -side;
  if (style === "spring" || style === "fork") {
    curl(path, between(random, 1.4, 2.5), length * between(random, 0.14, 0.2), length * 0.035 + 0.4, curlSide, step, rise * 0.5);
  } else if (style === "hook") {
    // One open crook at the end, the way a feeler still searching for a hold looks.
    curl(path, between(random, 0.7, 1.3), length * between(random, 0.09, 0.14), length * between(random, 0.04, 0.06) + 0.4, curlSide, step, rise * 0.5);
  } else if (style === "coil") {
    const from = path.points.length - 1;
    extend(path, {
      length: length - reach,
      step: 1.2,
      target: null,
      steer: 0,
      steerRamp: 1,
      arrive: 0,
      wander: [],
      bias: side * between(random, 0.004, 0.016),
      maxCurvature: 0.2,
      avoid: null,
      fork: null,
      z: { base: path.points[from]!.z, amp: 0, wave: 1, phase: 0, rise: rise * 0.5 },
    });
    coil(path, from, length * between(random, 0.12, 0.18), between(random, 2, 3.2), between(random, 0.5, 0.9));
  }
  if (frame.keep.length && path.points.some((point) => keepClearance(frame, point.x, point.y) < 0)) return false;
  const total = path.arcs[path.arcs.length - 1]!;
  const r0 = Math.min(strand.radii[sample]! * 0.7, clamp(strand.radii[sample]! * 0.32, 0.4, 1.3));
  const taper = wave ? 0.9 : 0.84;
  const radii = path.arcs.map((arc) => r0 * (1 - taper * Math.pow(arc / total, 0.7)));
  const index = plan.strands.push({ role: "tendril", points: path.points, radii, parent, parentSample: sample, end: "point" }) - 1;
  if (style === "fork") planTendrilFork(vine, index, path, reach, length, -curlSide, rise);
  return true;
}

/** The second arm of a forked tendril, curling the other way from the first. */
function planTendrilFork(vine: VineBuilder, parent: number, main: Path, reach: number, length: number, side: number, rise: number): void {
  const { garden, plan } = vine;
  const { random } = garden;
  const at = sampleAt(main.arcs, reach * between(random, 0.45, 0.75));
  const origin = main.points[at]!;
  const step = Math.min(garden.frame.step, 2);
  const arm = beginPath(origin, main.headings[at]! + side * between(random, 0.45, 0.8));
  const armReach = length * between(random, 0.18, 0.28);
  extend(arm, {
    length: armReach,
    step,
    target: null,
    steer: 0,
    steerRamp: 1,
    arrive: 0,
    wander: [[between(random, 0.004, 0.012), armReach * 1.6, random() * TAU]],
    bias: -side * between(random, 0, 0.01),
    maxCurvature: 0.2,
    avoid: null,
    fork: null,
    z: { base: origin.z, amp: 0, wave: 1, phase: 0, rise },
  });
  curl(arm, between(random, 1, 2), length * between(random, 0.08, 0.12), length * 0.03 + 0.35, side, step, rise * 0.5);
  const total = arm.arcs[arm.arcs.length - 1]!;
  const r0 = plan.strands[parent]!.radii[at]! * 0.85;
  const radii = arm.arcs.map((arc) => r0 * (1 - 0.84 * Math.pow(arc / total, 0.7)));
  plan.strands.push({ role: "tendril", points: arm.points, radii, parent, parentSample: at, end: "point" });
}

/* ------------------------------------------------------------------------ */
/* 出屏                                                                      */
/* ------------------------------------------------------------------------ */

/** Room the canvas leaves past each edge for 出屏 shoots, as a share of the unit. */
const POP_BLEED = 0.3;
/** How far a 出屏 shoot's stem may reach past the wall; its organs take the rest. */
const POP_REACH = 0.26;
/** The canvas fades out over this many px at its rim; organs stay clear of it. */
const POP_RIM = 8;
/** How far a 出屏 shoot comes forward off the wall, as a share of the unit. */
const POP_LIFT = [0.3, 0.46] as const;
/** How far in front of the wall the eye is that lifted shoots are drawn for, in units. */
const POP_EYE = 2.4;
const POP_TERMINALS: Readonly<Record<VineTerminalKind, number>> = { flower: 0.6, bud: 0.28, leaf: 0.12, tip: 0 };

/** Every edge open to 出屏 shoots; edge `e` is bit `1 << e` (left, top, right, bottom). */
export const VINE_POP_ALL = 0b1111;

/** Room the canvas needs past each open edge of a `width` × `height` wall for its 出屏 shoots. */
export function vinePopBleed(width: number, height: number): number {
  if (!(width > 0) || !(height > 0)) return 0;
  return Math.ceil(makeFrame(width, height).unit * POP_BLEED);
}

interface PopSeat {
  readonly plan: VinePlan;
  readonly strand: number;
  readonly sample: number;
  readonly edge: VineEdge;
  /** Which side of its parent the shoot leaves on, and how sharply. */
  readonly facing: number;
  readonly angle: number;
  readonly score: number;
}

const EDGES = [0, 1, 2, 3] as const;

function nearestEdge(frame: Frame, x: number, y: number): VineEdge {
  let best: VineEdge = 0;
  for (const edge of [1, 2, 3] as const) {
    if (edgeDistance(frame, edge, x, y) < edgeDistance(frame, best, x, y)) best = edge;
  }
  return best;
}

/**
 * 出屏: a few side shoots leave front vines close to the wall's edge and grow
 * out past it, each ending in a bloom, bud or leaf that hangs over the page.
 */
function planPopShoots(garden: Garden, plans: readonly VinePlan[], edges: number, salt: number): VinePlan[] {
  const { frame } = garden;
  // `salt`, drawn whichever edges are open, seeds each edge on its own.
  // Shutting an edge (the wall moved near the window's side) then takes only
  // its own shoots away and leaves the rest as they were.
  const reach = frame.unit * POP_REACH;
  const wide: Frame = {
    ...frame,
    width: frame.width + reach * 2,
    height: frame.height + reach * 2,
    hw: frame.hw + reach,
    hh: frame.hh + reach,
  };
  // The budget is for the whole rim, shared out by edge length, so it does not
  // depend on which edges are open either.
  const total = clamp(3 + ((frame.width + frame.height) / frame.unit) * 1.25, 5, 10);
  const rim = (frame.width + frame.height) * 2;
  const pops: VinePlan[] = [];
  for (const edge of EDGES) {
    if (!(edges & (1 << edge))) continue;
    const random = vineRandom(salt ^ Math.imul(edge + 1, 0x9e3779b1));
    // Each edge grows into its own copy of the garden, so the others' shoots
    // do not steer it.
    const own: Garden = {
      frame,
      random,
      occupied: [...garden.occupied],
      targets: [...garden.targets],
      trails: [...garden.trails],
      wires: [...garden.wires],
    };
    const length = edge % 2 ? frame.width : frame.height;
    const want = Math.max(1, Math.round((total * length) / rim));
    pops.push(...planEdgeShoots({ ...own, frame: wide }, frame, plans, edge, edges, want));
  }
  return pops;
}

function planEdgeShoots(
  outer: Garden,
  frame: Frame,
  plans: readonly VinePlan[],
  edge: VineEdge,
  edges: number,
  want: number,
): VinePlan[] {
  const { random } = outer;
  const near = frame.unit * 0.32;
  const corner = frame.unit * 0.14;
  const [ix, iy] = VINE_EDGE_INWARD[edge]!;
  const seats: PopSeat[] = [];
  for (const plan of plans) {
    if (plan.depth < 0.4) continue;
    plan.strands.forEach((strand, index) => {
      if (strand.role !== "stem" && strand.role !== "branch") return;
      const points = strand.points;
      const root = points[0]!;
      for (let sample = 4; sample < points.length - 4; sample += 3) {
        const point = points[sample]!;
        const inside = edgeInside(frame, point.x, point.y);
        if (inside < frame.margin * 0.2 || inside > near) continue;
        if (frame.keep.length && keepClearance(frame, point.x, point.y) < frame.margin * 0.5) continue;
        if (Math.abs(point.x) > frame.hw - corner && Math.abs(point.y) > frame.hh - corner) continue;
        // Not right where the vine itself comes in.
        if (Math.hypot(point.x - root.x, point.y - root.y) < frame.unit * 0.3) continue;
        if (nearestEdge(frame, point.x, point.y) !== edge) continue;
        // Drawn before the checks below that depend on the other edges, so
        // this edge's stream stays the same whichever of them are open.
        const angle = between(random, 0.5, 0.95);
        const jitter = random() * 0.5;
        // Nor close to an edge that is shut, where its bloom would be cut off.
        if (EDGES.some((shut) => !(edges & (1 << shut)) && edgeDistance(frame, shut, point.x, point.y) < near)) continue;
        const tangent = tangentAt(points, sample);
        const heading = Math.atan2(tangent.y, tangent.x);
        const outward = (side: number) =>
          -(Math.cos(heading + side * angle) * ix + Math.sin(heading + side * angle) * iy);
        const facing = outward(1) >= outward(-1) ? 1 : -1;
        const out = outward(facing);
        if (out < 0.3) continue;
        seats.push({
          plan,
          strand: index,
          sample,
          edge,
          facing,
          angle,
          score: plan.depth + out * 0.6 + (1 - inside / near) * 0.4 + jitter,
        });
      }
    });
  }
  {
    for (const plan of plans) {
      if (plan.depth < 0.4) continue;
      plan.strands.forEach((strand, index) => {
        if (strand.role !== "stem" && strand.role !== "branch") return;
        const points = strand.points;
        for (let sample = 4; sample < points.length - 4; sample += 6) {
          seats.push({ plan, strand: index, sample, edge, facing: 1, angle: 0.6, score: 0 });
        }
      });
    }
  }
  seats.sort((a, b) => b.score - a.score);
  const pops: VinePlan[] = [];
  const bases: THREE.Vector3[] = [];
  let tries = 0;
  for (const seat of seats) {
    if (pops.length >= want || tries >= want * 12) break;
    const base = seat.plan.strands[seat.strand]!.points[seat.sample]!;
    if (bases.some((other) => Math.hypot(other.x - base.x, other.y - base.y) < frame.unit * 0.55)) continue;
    tries += 1;
    const pop = planPopShoot(outer, frame, seat);
    if (!pop) continue;
    bases.push(base);
    pops.push(pop);
  }
  return pops;
}

/** One 出屏 shoot from `seat`, planned on `garden`'s widened frame; `card` is the wall itself. */
function planPopShoot(garden: Garden, card: Frame, seat: PopSeat): VinePlan | null {
  const { frame: wide, random } = garden;
  const host = seat.plan;
  const strand = host.strands[seat.strand]!;
  const seatBase = strand.points[seat.sample]!;
  const hugging = true;
  // Keep the root on the host vine; shifting it inward leaves a loose stub in the wall.
  const base = seatBase;
  const tangent = tangentAt(strand.points, seat.sample);
  const heading = Math.atan2(tangent.y, tangent.x);
  const edgeHeading = seat.edge % 2 === 0 ? Math.PI / 2 : 0;
  const species = SPECIES.find((kind) => kind.name === host.species) ?? SPECIES[0]!;
  const size = (0.82 + host.depth * 0.36) * 0.94 * (hugging ? 0.78 : 1) * between(random, 0.86, 1.14);
  const plan: VinePlan = {
    depth: 1 + host.depth * 0.01,
    layer: 2,
    species: species.name,
    edge: seat.edge,
    strands: [],
    blades: [],
    lathes: [],
    strokes: [],
    terminals: [],
    pop: true,
  };
  const vine: VineBuilder = {
    garden,
    plan,
    species,
    size,
    leafBase: between(random, 0.088, 0.118) * size,
    droop: between(random, 0.15, 0.95),
    branches: 0,
    blooms: 0,
  };
  const [ix, iy] = VINE_EDGE_INWARD[seat.edge]!;
  const reach = wide.hw - card.hw;
  const inside = edgeDistance(card, seat.edge, base.x, base.y);
  const parentRadius = strand.radii[seat.sample]!;
  const r0 = parentRadius * between(random, 0.6, 0.72);
  const forkDistance = Math.max(parentRadius * 10, 12);
  const start = hugging
    ? Math.atan2(-iy, -ix) + (random() < 0.5 ? -1 : 1) * between(random, 0.15, 0.42)
    : heading + seat.facing * seat.angle;
  // Keep drifting the way it set off, so it arcs out instead of sticking straight out.
  const drift = ix !== 0 ? Math.sin(start) : Math.cos(start);
  const along = card.unit * between(random, hugging ? 0.32 : 0.14, hugging ? 0.9 : 0.5) * (random() < 0.5 ? 1 : -1);
  const outward = card.unit * between(random, 0.015, 0.07);
  const turn = between(random, 0.22, 0.52) * (random() < 0.5 ? 1 : -1) * (hugging ? 0.35 : 1);
  const wave = between(random, 0.65, 1.05);
  const phase = random() * TAU;
  // Some shoots run along the rim instead of straight out, then roll into a
  // spiral at the tip so the edge reads as a curling decorative vine.
  // Spiral edge runners end in a thin point: no leaf, bloom or bud at the tip.
  const kinds = hugging ? (["tip"] as const) : TERMINAL_FALLBACK[weighted(random, POP_TERMINALS)].filter((kind) => kind !== "tip");
  const room = Math.ceil(card.unit * POP_BLEED) - POP_RIM;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    // Far enough out to read as leaving the wall, not just touching its edge.
    const past = reach * between(random, attempt < 3 ? 0.4 : 0.22, 0.8 - attempt * 0.1);
    const slide = drift * (inside + past) * between(random, 0.5, 1.1) + between(random, -0.06, 0.06) * card.unit;
    const target =
      ix !== 0
        ? new THREE.Vector2(
            -ix * (card.hw + (hugging ? outward : past)),
            clamp(base.y + (hugging ? along : slide), -wide.hh + reach, wide.hh - reach),
          )
        : new THREE.Vector2(
            clamp(base.x + (hugging ? along : slide), -wide.hw + reach, wide.hw - reach),
            -iy * (card.hh + (hugging ? outward : past)),
          );
    const span = Math.hypot(target.x - base.x, target.y - base.y);
    if (span < card.unit * 0.1) continue;
    const path = beginPath(base, heading + seat.facing * seat.angle * 0.3);
    extend(path, {
      length: span * 1.6,
      step: card.step,
      target,
      steer: between(random, 2, 3) / span,
      steerRamp: Math.max(forkDistance * 1.5, span * 0.35),
      arrive: card.unit * 0.015,
      wander: hugging
        ? [[(turn * Math.PI) / (span * wave), span * wave, phase]]
        : [[(turn * Math.PI) / (span * wave), span * wave, phase]],
      bias: 0,
      maxCurvature: 1 / (card.unit * 0.03),
      avoid: null,
      fork: { angle: seat.facing * seat.angle * (hugging ? 0.2 : 0.7), distance: forkDistance },
      // Flat on the wall up to its portal; `liftShoot` raises the rest.
      z: { base: base.z, amp: 0, wave: card.unit, phase: 0, rise: 0 },
    });
    const curlFrom = card.unit * between(random, 0.07, 0.13);
    curl(path, between(random, 1.4, 2.8), curlFrom, curlFrom * 0.2, random() < 0.5 ? 1 : -1, card.step, 0);
    const points = path.points;
    const end = points[points.length - 1]!;
    if (points.length < 6 || edgeInside(card, end.x, end.y) > -reach * 0.06) continue;
    if (points.some((point) => edgeInside(wide, point.x, point.y) < 2)) continue;
    // Once out, it stays out.
    let left = false;
    let back = false;
    for (const point of points) {
      const at = edgeInside(card, point.x, point.y);
      if (at < -2) left = true;
      else if (left && at > 3) back = true;
    }
    if (back || crossings(null, garden, path, forkDistance * 2) > (attempt < 2 ? 0 : 1)) continue;
    const portal = liftShoot(path, card, between(random, POP_LIFT[0], POP_LIFT[1]) * card.unit, random);
    // Hold out for the chosen organ first; a shorter reach may still fit it.
    for (const kind of attempt < 3 ? kinds.slice(0, 1) : kinds) {
      const mark = markPlan(plan, garden);
      const index = develop(vine, {
        role: "branch",
        // A bloom's neck is appended to the strand's points; a rejected try must not leave it on the path.
        path: { ...path, points: path.points.slice() },
        r0,
        generation: 1,
        size,
        terminal: kind,
        fixed: true,
        parent: -1,
        parentSample: -1,
      });
      if (index < 0) continue;
      // Organs can spread past the stem's end; the canvas has to hold all of it.
      if (!(planOverhang(plan, card, portal) <= room) || !(planIntrusion(plan, card, portal) <= 0)) {
        rewindPlan(plan, garden, mark);
        continue;
      }
      taperShootRoot(plan.strands[index]!);
      garden.wires.push(...wiresOf(plan.strands[index]!.points));
      return { ...plan, portal };
    }
  }
  return null;
}

const INWARD_SALT = 0x2c1b3c6d;
/** How high an inward shoot rises off the wall, as a share of the unit. */
const INWARD_LIFT = [0.22, 0.34] as const;
/** Where along an inward shoot it comes up through the wall. */
const INWARD_PORTAL = [0.25, 0.4] as const;

/**
 * 朝内钻出: shoots that leave a vine well inside the wall, come up through it
 * and arch towards the viewer over the wall itself, staying inside its edges
 * and clear of the safe zones as drawn.
 */
function planInwardShoots(garden: Garden, plans: readonly VinePlan[], salt: number): VinePlan[] {
  const { frame } = garden;
  const random = vineRandom(salt ^ INWARD_SALT);
  const own: Garden = {
    frame,
    random,
    occupied: [...garden.occupied],
    targets: [...garden.targets],
    trails: [...garden.trails],
    wires: [...garden.wires],
  };
  const want = clamp(Math.round((Math.sqrt(frame.width * frame.height) / frame.unit) * 1.6), 2, 5);
  const deep = frame.unit * 0.24;
  const probe = frame.unit * 0.3;
  const seats: PopSeat[] = [];
  for (const plan of plans) {
    if (plan.depth < 0.4 || plan.pop) continue;
    plan.strands.forEach((strand, index) => {
      if (strand.role !== "stem" && strand.role !== "branch") return;
      const points = strand.points;
      const root = points[0]!;
      for (let sample = 4; sample < points.length - 4; sample += 3) {
        const point = points[sample]!;
        if (edgeInside(frame, point.x, point.y) < deep) continue;
        if (frame.keep.length && keepClearance(frame, point.x, point.y) < frame.margin * 0.6) continue;
        if (Math.hypot(point.x - root.x, point.y - root.y) < frame.unit * 0.3) continue;
        const angle = between(random, 0.5, 0.95);
        const jitter = random() * 0.5;
        const tangent = tangentAt(points, sample);
        const heading = Math.atan2(tangent.y, tangent.x);
        // Off to the side with more room in front of it.
        const room = (side: number) =>
          insideDistance(
            frame,
            point.x + Math.cos(heading + side * angle) * probe,
            point.y + Math.sin(heading + side * angle) * probe,
          );
        const facing = room(1) >= room(-1) ? 1 : -1;
        const clear = room(facing);
        if (clear < frame.margin * 0.6) continue;
        seats.push({
          plan,
          strand: index,
          sample,
          edge: plan.edge,
          facing,
          angle,
          score: plan.depth + Math.min(1, clear / frame.unit) * 0.6 + jitter,
        });
      }
    });
  }
  seats.sort((a, b) => b.score - a.score);
  const shoots: VinePlan[] = [];
  const bases: THREE.Vector3[] = [];
  let tries = 0;
  for (const seat of seats) {
    if (shoots.length >= want || tries >= want * 5) break;
    const base = seat.plan.strands[seat.strand]!.points[seat.sample]!;
    if (bases.some((other) => Math.hypot(other.x - base.x, other.y - base.y) < frame.unit * 0.8)) continue;
    tries += 1;
    const shoot = planInwardShoot(own, seat);
    if (!shoot) continue;
    bases.push(base);
    shoots.push(shoot);
  }
  return shoots;
}

function planInwardShoot(garden: Garden, seat: PopSeat): VinePlan | null {
  const { frame, random } = garden;
  const host = seat.plan;
  const strand = host.strands[seat.strand]!;
  const base = strand.points[seat.sample]!;
  const tangent = tangentAt(strand.points, seat.sample);
  const heading = Math.atan2(tangent.y, tangent.x);
  const species = SPECIES.find((kind) => kind.name === host.species) ?? SPECIES[0]!;
  const size = (0.82 + host.depth * 0.36) * 0.94;
  const plan: VinePlan = {
    depth: 1 + host.depth * 0.01,
    layer: 2,
    species: species.name,
    edge: host.edge,
    strands: [],
    blades: [],
    lathes: [],
    strokes: [],
    terminals: [],
    pop: true,
    inward: true,
  };
  const vine: VineBuilder = {
    garden,
    plan,
    species,
    size,
    leafBase: between(random, 0.088, 0.118) * size,
    droop: between(random, 0.15, 0.95),
    branches: 0,
    blooms: 0,
  };
  const parentRadius = strand.radii[seat.sample]!;
  const r0 = parentRadius * between(random, 0.6, 0.72);
  const forkDistance = Math.max(parentRadius * 10, 12);
  const start = heading + seat.facing * seat.angle;
  const turn = between(random, 0.12, 0.3) * (random() < 0.5 ? 1 : -1);
  const wave = between(random, 0.7, 1.1);
  const phase = random() * TAU;
  const kinds = TERMINAL_FALLBACK[weighted(random, POP_TERMINALS)].filter((kind) => kind !== "tip");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const span = frame.unit * between(random, 0.26, 0.4) * (1 - attempt * 0.1);
    const aim = start + seat.facing * between(random, -0.2, 0.35);
    const target = new THREE.Vector2(base.x + Math.cos(aim) * span, base.y + Math.sin(aim) * span);
    const lift = between(random, INWARD_LIFT[0], INWARD_LIFT[1]) * frame.unit;
    const at = between(random, INWARD_PORTAL[0], INWARD_PORTAL[1]);
    if (insideDistance(frame, target.x, target.y) < frame.margin * 0.6) continue;
    const path = beginPath(base, heading + seat.facing * seat.angle * 0.3);
    extend(path, {
      length: span * 1.6,
      step: frame.step,
      target,
      steer: between(random, 2, 3) / span,
      steerRamp: Math.max(forkDistance * 1.5, span * 0.35),
      arrive: frame.unit * 0.015,
      wander: [[(turn * Math.PI) / (span * wave), span * wave, phase]],
      bias: 0,
      maxCurvature: 1 / (frame.unit * 0.035),
      avoid: { frame, margin: frame.margin, entry: -1 },
      fork: { angle: seat.facing * seat.angle * 0.7, distance: forkDistance },
      z: { base: base.z, amp: 0, wave: frame.unit, phase: 0, rise: 0 },
    });
    if (path.points.length < 6 || pathFault(frame, path) > 0.2) continue;
    if (crossings(null, garden, path, forkDistance * 2) > (attempt < 2 ? 0 : 1)) continue;
    const portal = liftShoot(path, frame, lift, random, at);
    // Its ripple spreads over the wall around the portal; not over what is written there.
    if (frame.keep.length && keepClearance(frame, portal.x, portal.y) < portal.ripple * 0.6) continue;
    for (const kind of attempt < 3 ? kinds.slice(0, 1) : kinds) {
      const mark = markPlan(plan, garden);
      const index = develop(vine, {
        role: "branch",
        path: { ...path, points: path.points.slice() },
        r0,
        generation: 1,
        size,
        terminal: kind,
        fixed: true,
        parent: -1,
        parentSample: -1,
      });
      if (index < 0) continue;
      // As drawn, lifted and seen in perspective, it has to stay on the wall and off the safe zones.
      // Written so a non-finite measure rejects rather than slips through.
      if (!(planOverhang(plan, frame, portal) <= -2) || !(planIntrusion(plan, frame, portal) <= 0)) {
        rewindPlan(plan, garden, mark);
        continue;
      }
      taperShootRoot(plan.strands[index]!);
      garden.wires.push(...wiresOf(plan.strands[index]!.points));
      return { ...plan, portal };
    }
  }
  return null;
}

/**
 * 出屏 in depth: the shoot runs along the wall to its portal, partway to the
 * rim, comes up through the surface there and rises towards the viewer,
 * levelling off at `lift` so the bloom at its end faces out of the page.
 */
function liftShoot(path: Path, card: Frame, lift: number, random: VineRandom, at?: number): VinePortal {
  const { points, arcs } = path;
  let rim = points.findIndex((point) => edgeInside(card, point.x, point.y) <= 0);
  if (rim < 0) rim = points.length - 1;
  const first = arcs[0]!;
  const portalArc =
    at === undefined
      ? first + Math.max(arcs[Math.min(2, rim)]! - first, (arcs[rim]! - first) * 0.45)
      : first + (arcs[arcs.length - 1]! - first) * at;
  let from = arcs.findIndex((arc) => arc >= portalArc);
  if (from < 0) from = points.length - 1;
  const origin = points[from]!;
  const span = Math.max(arcs[arcs.length - 1]! - arcs[from]!, 1);
  for (let index = from + 1; index < points.length; index += 1) {
    // Steepest just past the portal, level at the end.
    points[index]!.z = origin.z + lift * smooth(Math.pow((arcs[index]! - arcs[from]!) / span, 0.7));
  }
  return {
    x: origin.x,
    y: origin.y,
    z: origin.z,
    eye: card.unit * POP_EYE,
    from,
    ripple: card.unit * between(random, 0.22, 0.3),
    phase: random() * TAU,
  };
}

type PlanMark = readonly number[];

function planArrays(plan: VinePlan, garden: Garden): unknown[][] {
  return [
    plan.strands,
    plan.blades,
    plan.lathes,
    plan.strokes,
    plan.terminals,
    garden.occupied,
    garden.targets,
    garden.trails,
    garden.wires,
  ];
}

function markPlan(plan: VinePlan, garden: Garden): PlanMark {
  return planArrays(plan, garden).map((list) => list.length);
}

/** Drops everything added to `plan` and `garden` since `mark`. */
function rewindPlan(plan: VinePlan, garden: Garden, mark: PlanMark): void {
  planArrays(plan, garden).forEach((list, index) => {
    list.length = mark[index]!;
  });
}

/**
 * How far the plan's geometry reaches past `frame`, organs included, in px.
 * With a `portal`, lifted points are measured where they are drawn, with
 * room for the view to tilt.
 */
function planOverhang(plan: VinePlan, frame: Frame, portal?: VinePortal): number {
  return planReach(plan, (x, y) => edgeInside(frame, x, y), portal);
}

/** How far the plan's geometry, as drawn, reaches into a safe zone, in px; -Infinity with none. */
function planIntrusion(plan: VinePlan, frame: Frame, portal?: VinePortal): number {
  return frame.keep.length ? planReach(plan, (x, y) => keepClearance(frame, x, y), portal) : -Infinity;
}

/** The most any of the plan's geometry pokes past `room`, a signed distance to free space. */
function planReach(plan: VinePlan, room: (x: number, y: number) => number, portal?: VinePortal): number {
  let overhang = -Infinity;
  const reach = (x: number, y: number, z: number, r: number) => {
    if (!portal) {
      overhang = Math.max(overhang, r - room(x, y));
      return;
    }
    const scale = vinePortalScale(portal, z);
    const tilt = Math.max(0, z - portal.z) * VINE_POP_TILT;
    const at = room(portal.x + (x - portal.x) * scale, portal.y + (y - portal.y) * scale);
    overhang = Math.max(overhang, r * scale + tilt - at);
  };
  for (const strand of plan.strands) {
    strand.points.forEach((point, index) => reach(point.x, point.y, point.z, strand.radii[index] ?? 0));
  }
  for (const blade of plan.blades) {
    const { origin, x, spec } = blade;
    const half = spec.length * spec.width * 0.4;
    reach(origin.x + x.x * spec.length, origin.y + x.y * spec.length, origin.z + x.z * spec.length, 0);
    reach(origin.x + x.x * spec.length * 0.5, origin.y + x.y * spec.length * 0.5, origin.z + x.z * spec.length * 0.5, half);
  }
  for (const lathe of plan.lathes) {
    const top = lathe.rows[lathe.rows.length - 1]?.[0] ?? 0;
    const radius = Math.max(0, ...lathe.rows.map((row) => row[1]));
    reach(lathe.origin.x + lathe.axis.x * top, lathe.origin.y + lathe.axis.y * top, lathe.origin.z + lathe.axis.z * top, radius);
    reach(lathe.origin.x, lathe.origin.y, lathe.origin.z, radius);
  }
  for (const stroke of plan.strokes) {
    for (const point of stroke.points) reach(point.x, point.y, point.z, 0);
  }
  return overhang;
}

function pickTerminal(random: VineRandom): VineTerminalKind {
  return weighted(random, BRANCH_TERMINALS);
}

function planBranch(vine: VineBuilder, parent: number, sample: number, side: number, shoot: Shoot): boolean {
  const { garden, plan } = vine;
  const { frame, random } = garden;
  const strand = plan.strands[parent]!;
  const base = strand.points[sample]!;
  const tangent = tangentAt(strand.points, sample);
  const heading = Math.atan2(tangent.y, tangent.x);
  const parentRadius = strand.radii[sample]!;
  const angle = between(random, 0.45, 0.9);
  // Lean towards the side that heads into the wall.
  const toCentre = new THREE.Vector2(-base.x, -base.y).normalize();
  const inwardness = (direction: number) => Math.cos(direction) * toCentre.x + Math.sin(direction) * toCentre.y;
  let facing = side;
  if (inwardness(heading - side * angle) > inwardness(heading + side * angle) && random() < 0.7) facing = -side;
  const second = shoot.generation >= 1;
  const remaining = shoot.path.arcs[shoot.path.arcs.length - 1]! - shoot.path.arcs[sample]!;
  let length = second
    ? clamp(between(random, 0.6, 1) * Math.max(remaining * 0.8, frame.unit * 0.35), frame.unit * 0.24, frame.unit * 0.62)
    : clamp(between(random, 0.7, 1.15) * Math.max(remaining, frame.unit * 0.6), frame.unit * 0.42, frame.unit * 1.3);
  const r0 = parentRadius * between(random, 0.55, 0.68);
  const forkDistance = Math.max(parentRadius * 10, 12);

  // A side shoot makes one gesture: it either keeps arching away from its
  // parent or swings back to run alongside, and a long one may sag.
  const start = heading + facing * angle;
  const sweep = between(random, 0.6, 1.6);
  const score = (bend: number) => {
    const finish = start + bend * sweep;
    return inwardness(start + bend * sweep * 0.5) + vine.droop * 0.8 * -Math.sin(finish) + random() * 0.6;
  };
  let bend = score(facing) >= score(-facing) ? facing : -facing;
  const longWave = between(random, 0.65, 1.25);
  const longTurn = between(random, 0.5, 1.15) * (random() < 0.5 ? 1 : -1);
  const shortWave = between(random, 0.24, 0.4);
  const shortTurn = between(random, 0.08, 0.22);
  const phases = [random() * TAU, random() * TAU, random() * TAU] as const;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const path = beginPath(base, heading + facing * angle * 0.3);
    extend(path, {
      length,
      step: frame.step,
      target: null,
      steer: 0,
      steerRamp: 1,
      arrive: 0,
      wander: [
        [(longTurn * Math.PI) / (length * longWave), length * longWave, phases[0]],
        [(shortTurn * Math.PI) / (length * shortWave), length * shortWave, phases[1]],
      ],
      bias: (bend * sweep) / length,
      maxCurvature: 1 / (frame.unit * 0.04),
      avoid: { frame, margin: frame.margin, entry: -1 },
      fork: { angle: facing * angle * 0.7, distance: forkDistance },
      z: { base: base.z, amp: frame.unit * 0.012, wave: frame.unit * 0.6, phase: phases[2], rise: 0 },
    });
    if (
      path.points.length >= 6 &&
      pathFault(frame, path) < 0.2 &&
      hugging(vine, path, parent, base, forkDistance * 2, Math.max(parentRadius * 3, frame.unit * 0.03)) < 0.12 &&
      crossings(vine, garden, path, forkDistance * 2, parent, base) <= (attempt < 2 ? 0 : 1)
    ) {
      return (
        develop(vine, {
          role: "branch",
          path,
          r0,
          generation: shoot.generation + 1,
          size: shoot.size * 0.92,
          terminal: pickTerminal(random),
          fixed: false,
          parent,
          parentSample: sample,
        }) >= 0
      );
    }
    // Try the other gesture, then a shorter shoot.
    bend = -bend;
    if (attempt % 2 === 1) length *= 0.8;
    if (length < frame.unit * (second ? 0.2 : 0.32)) break;
  }
  return false;
}

/** Share of a new shoot's points that run along the vine's own stems instead of leaving them. */
function hugging(vine: VineBuilder, path: Path, parent: number, base: THREE.Vector3, skip: number, clearance: number): number {
  const strands = vine.plan.strands;
  let checked = 0;
  let close = 0;
  for (let index = 0; index < path.points.length; index += 2) {
    if (path.arcs[index]! < skip) continue;
    const point = path.points[index]!;
    checked += 1;
    search: for (let other = 0; other < strands.length; other += 1) {
      const strand = strands[other]!;
      if (strand.role !== "stem" && strand.role !== "branch") continue;
      for (let at = 0; at < strand.points.length; at += 2) {
        const near = strand.points[at]!;
        if (other === parent && Math.hypot(near.x - base.x, near.y - base.y) < skip) continue;
        if (Math.hypot(near.x - point.x, near.y - point.y) < clearance) {
          close += 1;
          break search;
        }
      }
    }
  }
  return checked > 0 ? close / checked : 0;
}

/** A short run of a stem or branch with its bounding box, so crossing tests skip far-away pieces. */
interface Wire {
  readonly points: readonly THREE.Vector3[];
  readonly from: number;
  readonly to: number;
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

const WIRE_RUN = 16;
/** How much a stem crossing counts against a stem path, in the units of `pathFault`. */
const STEM_CROSSING_COST = 0.06;

function wiresOf(points: readonly THREE.Vector3[], from = 0, to = points.length - 1): Wire[] {
  const wires: Wire[] = [];
  for (let start = from; start < to; start += WIRE_RUN) {
    const end = Math.min(start + WIRE_RUN, to);
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let index = start; index <= end; index += 1) {
      const point = points[index]!;
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    wires.push({ points, from: start, to: end, minX, maxX, minY, maxY });
  }
  return wires;
}

function turnOf(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function wireCrossings(mine: readonly Wire[], others: readonly Wire[]): number {
  let count = 0;
  for (const a of mine) {
    for (const b of others) {
      if (a.maxX < b.minX || b.maxX < a.minX || a.maxY < b.minY || b.maxY < a.minY) continue;
      for (let i = a.from; i < a.to; i += 1) {
        const p = a.points[i]!;
        const q = a.points[i + 1]!;
        for (let j = b.from; j < b.to; j += 1) {
          const r = b.points[j]!;
          const s = b.points[j + 1]!;
          if (turnOf(r, s, p) * turnOf(r, s, q) < 0 && turnOf(p, q, r) * turnOf(p, q, s) < 0) count += 1;
        }
      }
    }
  }
  return count;
}

/**
 * Times a new shoot would cross the stems and branches already on the wall,
 * its own vine's included. The first `skip` of the shoot and the stretch of
 * its parent around the fork are left out, since they meet there by design.
 */
function crossings(
  vine: VineBuilder | null,
  garden: Garden,
  path: Path,
  skip: number,
  parent = -1,
  base: THREE.Vector3 | null = null,
): number {
  let first = 0;
  while (first < path.points.length - 1 && path.arcs[first]! < skip) first += 1;
  if (first >= path.points.length - 1) return 0;
  const mine = wiresOf(path.points, first);
  let count = wireCrossings(mine, garden.wires);
  if (!vine) return count;
  vine.plan.strands.forEach((strand, index) => {
    if (strand.role !== "stem" && strand.role !== "branch") return;
    const points = strand.points;
    if (index !== parent || !base) {
      count += wireCrossings(mine, wiresOf(points));
      return;
    }
    let low = -1;
    let high = -1;
    points.forEach((point, at) => {
      if (Math.hypot(point.x - base.x, point.y - base.y) >= skip) return;
      if (low < 0) low = at;
      high = at;
    });
    if (low < 0) {
      count += wireCrossings(mine, wiresOf(points));
      return;
    }
    if (low > 0) count += wireCrossings(mine, wiresOf(points, 0, low));
    if (high < points.length - 1) count += wireCrossings(mine, wiresOf(points, high));
  });
  return count;
}

function planAxillaryBloom(vine: VineBuilder, parent: number, sample: number, side: number, shoot: Shoot): boolean {
  const { garden, plan, species } = vine;
  const { frame, random } = garden;
  const strand = plan.strands[parent]!;
  const base = strand.points[sample]!;
  const tangent = tangentAt(strand.points, sample);
  const heading = Math.atan2(tangent.y, tangent.x);
  const stage: VineTerminalKind = random() < 0.5 ? "flower" : "bud";
  const bloomSize =
    stage === "flower"
      ? frame.unit * between(random, 0.058, 0.078) * shoot.size * FLOWER_SCALE[species.flower]
      : frame.unit * between(random, 0.055, 0.074) * shoot.size;
  const length = bloomSize * between(random, 0.9, 1.6);
  const turn = side * between(random, 0.35, 0.8);
  const path = beginPath(base, heading + turn * 0.35);
  extend(path, {
    length,
    step: Math.min(frame.step, 2.5),
    target: null,
    steer: 0,
    steerRamp: 1,
    arrive: 0,
    wander: [[between(random, -0.01, 0.01), length * 2, random() * TAU]],
    bias: -turn * between(random, 0.1, 0.5) / length,
    maxCurvature: 0.1,
    avoid: null,
    fork: { angle: turn * 0.65, distance: length * 0.4 },
    z: { base: base.z, amp: 0, wave: 1, phase: 0, rise: between(random, 0.02, 0.12) },
  });
  const r0 = Math.min(strand.radii[sample]! * 0.7, clamp(strand.radii[sample]! * 0.5, 0.5, Math.max(0.6, bloomSize * 0.06)));
  return (
    develop(vine, {
      role: "pedicel",
      path,
      r0,
      generation: shoot.generation + 1,
      size: shoot.size,
      terminal: stage,
      fixed: true,
      bloomSize,
      parent,
      parentSample: sample,
    }) >= 0
  );
}

/* ------------------------------------------------------------------------ */
/* Blooms                                                                    */
/* ------------------------------------------------------------------------ */

interface BloomShape {
  /** Angle of the bloom's axis out of the wall's plane. */
  readonly elevation: number;
  /** Turn of the axis off the stem's heading, within the plane. */
  readonly swing: number;
  readonly neck: number;
  /** Radius the stalk swells to, which is also the radius of the bloom's base. */
  readonly receptacle: number;
}

function bloomOutline(
  stage: "flower" | "bud",
  kind: VineFlowerKind | VineBudKind,
  flowerRadius: number,
  budLength: number,
  stalk: number,
  random: VineRandom,
): BloomShape {
  if (stage === "flower") {
    const receptacle = Math.max(stalk * 1.6, flowerRadius * 0.07);
    const elevation =
      kind === "bell"
        ? between(random, 0.05, 0.4)
        : kind === "trumpet"
          ? between(random, 0.25, 1.2)
          : between(random, 0.55, 1.35);
    return {
      elevation,
      swing: kind === "bell" ? between(random, -0.6, 0.6) : between(random, -0.3, 0.3),
      neck: flowerRadius * between(random, 0.3, 0.5),
      receptacle,
    };
  }
  const receptacle = Math.max(stalk * 1.35, budLength * (kind === "furled" ? 0.1 : 0.13));
  return {
    elevation: kind === "opening" ? between(random, 0.3, 0.8) : between(random, 0, 0.45),
    swing: between(random, -0.35, 0.35),
    neck: budLength * between(random, 0.18, 0.3),
    receptacle,
  };
}

function bloomAxis(tangent: THREE.Vector3, elevation: number, swing: number): THREE.Vector3 {
  const flat = new THREE.Vector3(tangent.x, tangent.y, 0);
  if (flat.lengthSq() < 1e-8) flat.set(1, 0, 0);
  flat.normalize().applyAxisAngle(UP, swing);
  return flat.multiplyScalar(Math.cos(elevation)).add(new THREE.Vector3(0, 0, Math.sin(elevation))).normalize();
}

/**
 * The stalk turns from the stem's heading to the bloom's axis, then swells
 * into the receptacle. Both are part of the same strand, so the stem, the
 * stalk and the bloom's base are one continuous surface.
 */
function appendNeck(
  strand: VineStrand,
  tangent: THREE.Vector3,
  axis: THREE.Vector3,
  length: number,
  radius: number,
  receptacle: number,
): THREE.Vector3 {
  const point = strand.points[strand.points.length - 1]!.clone();
  const steps = 8;
  for (let step = 1; step <= steps; step += 1) {
    const direction = tangent.clone().lerp(axis, smooth(step / steps)).normalize();
    point.addScaledVector(direction, length / steps);
    strand.points.push(point.clone());
    strand.radii.push(radius);
  }
  const flare = receptacle * 1.1;
  const flareSteps = 4;
  for (let step = 1; step <= flareSteps; step += 1) {
    const amount = step / flareSteps;
    point.addScaledVector(axis, flare / flareSteps);
    strand.points.push(point.clone());
    strand.radii.push(radius + (receptacle - radius) * Math.pow(amount, 1.6));
  }
  return point;
}

function axisFrame(axis: THREE.Vector3, spin: number): { e1: THREE.Vector3; e2: THREE.Vector3 } {
  const helper = Math.abs(axis.z) > 0.92 ? new THREE.Vector3(1, 0, 0) : UP;
  const e1 = new THREE.Vector3().crossVectors(axis, helper).normalize().applyAxisAngle(axis, spin);
  const e2 = new THREE.Vector3().crossVectors(axis, e1).normalize();
  return { e1, e2 };
}

function petalFrame(
  axis: THREE.Vector3,
  e1: THREE.Vector3,
  e2: THREE.Vector3,
  theta: number,
  alpha: number,
): { x: THREE.Vector3; y: THREE.Vector3; n: THREE.Vector3; radial: THREE.Vector3 } {
  const radial = e1.clone().multiplyScalar(Math.cos(theta)).addScaledVector(e2, Math.sin(theta));
  const x = radial.clone().multiplyScalar(Math.cos(alpha)).addScaledVector(axis, Math.sin(alpha)).normalize();
  const y = new THREE.Vector3().crossVectors(axis, radial).normalize();
  const n = new THREE.Vector3().crossVectors(x, y).normalize();
  return { x, y, n, radial };
}

type Range = readonly [number, number];

interface WhorlSpec {
  readonly role: "petal" | "sepal";
  readonly count: number;
  readonly spin: number;
  readonly alpha: Range;
  readonly length: Range;
  readonly shape: VineBladeShape;
  readonly width: Range;
  readonly bend: Range;
  readonly cup: Range;
  readonly twist: number;
  readonly ruffle: number;
  readonly veins: number;
  /** Distance from the axis the blades start at. */
  readonly offset: number;
  readonly lift: number;
}

function whorl(
  vine: VineBuilder,
  origin: THREE.Vector3,
  axis: THREE.Vector3,
  e1: THREE.Vector3,
  e2: THREE.Vector3,
  size: number,
  spec: WhorlSpec,
): void {
  const { random } = vine.garden;
  for (let index = 0; index < spec.count; index += 1) {
    const theta = spec.spin + (index / spec.count) * TAU + between(random, -0.07, 0.07);
    const frame = petalFrame(axis, e1, e2, theta, between(random, ...spec.alpha));
    vine.plan.blades.push({
      role: spec.role,
      origin: origin.clone().addScaledVector(frame.radial, spec.offset).addScaledVector(axis, spec.lift),
      x: frame.x,
      y: frame.y,
      n: frame.n,
      spec: {
        shape: spec.shape,
        length: size * between(random, ...spec.length),
        width: between(random, ...spec.width),
        asymmetry: between(random, 0.9, 1.1),
        fold: 0.03,
        bend: between(random, ...spec.bend),
        cup: between(random, ...spec.cup),
        twist: between(random, -spec.twist, spec.twist),
        ruffle: spec.ruffle,
        veins: spec.veins,
        venation: "fan",
        midrib: spec.role === "petal" && spec.veins > 0,
      },
    });
  }
}

function stamens(
  vine: VineBuilder,
  origin: THREE.Vector3,
  axis: THREE.Vector3,
  e1: THREE.Vector3,
  e2: THREE.Vector3,
  count: number,
  alpha: Range,
  length: Range,
  size: number,
  dot: number,
): void {
  const { random } = vine.garden;
  for (let index = 0; index < count; index += 1) {
    const theta = (index / count) * TAU + between(random, -0.12, 0.12);
    const tilt = between(random, ...alpha);
    const reach = size * between(random, ...length);
    const radial = e1.clone().multiplyScalar(Math.cos(theta)).addScaledVector(e2, Math.sin(theta));
    const direction = radial.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(axis, Math.sin(tilt));
    const start = origin.clone().addScaledVector(axis, size * 0.03).addScaledVector(radial, size * 0.05);
    vine.plan.strokes.push({
      points: [
        start,
        start.clone().addScaledVector(direction, reach * 0.5).addScaledVector(radial, reach * 0.07),
        start.clone().addScaledVector(direction, reach),
      ],
      dot,
    });
  }
}

function rows(count: number, profile: (amount: number) => readonly [number, number]): Array<readonly [number, number]> {
  return Array.from({ length: count }, (_, index) => profile(index / (count - 1)));
}

function lathe(vine: VineBuilder, spec: Partial<VineLathe> & Pick<VineLathe, "role" | "origin" | "axis" | "ref" | "rows">): void {
  vine.plan.lathes.push({
    lobes: 0,
    lobeDepth: 0,
    flute: 0,
    seams: 0,
    seamTwist: 0,
    seamFrom: 0,
    seamOffset: 0,
    rim: false,
    outline: false,
    ...spec,
  });
}

function planFlower(
  vine: VineBuilder,
  kind: VineFlowerKind,
  origin: THREE.Vector3,
  axis: THREE.Vector3,
  radius: number,
  receptacle: number,
): void {
  const { random } = vine.garden;
  const species = vine.species;
  const spin = random() * TAU;
  const { e1, e2 } = axisFrame(axis, spin);
  const sepals = (count: number, alpha: Range, length: number) =>
    whorl(vine, origin, axis, e1, e2, radius, {
      role: "sepal",
      count,
      spin: Math.PI / count,
      alpha,
      length: [length * 0.9, length * 1.1],
      shape: "sepal",
      width: [0.9, 1.2],
      bend: [-0.2, 0.05],
      cup: [0, 0.1],
      twist: 0.2,
      ruffle: 0,
      veins: 0,
      offset: receptacle * 0.6,
      lift: -receptacle * 0.3,
    });

  if (kind === "trumpet") {
    const length = radius * between(random, 0.95, 1.12);
    const throat = radius * 0.13;
    lathe(vine, {
      role: "corolla",
      origin,
      axis,
      ref: e1,
      rows: rows(12, (q) => [
        length * q,
        receptacle + (throat - receptacle) * smooth(q / 0.35) + (radius * 0.95 - throat) * Math.pow(q, 3),
      ]),
      lobes: 5,
      lobeDepth: 0.05,
      flute: 0.07,
      seams: 5,
      seamFrom: 0.28,
      rim: true,
      outline: true,
    });
    whorl(vine, origin, axis, e1, e2, radius, {
      role: "sepal",
      count: 5,
      spin: Math.PI / 5,
      alpha: [1.1, 1.3],
      length: [0.28, 0.36],
      shape: "sepal",
      width: [0.9, 1.1],
      bend: [0.05, 0.15],
      cup: [0, 0.1],
      twist: 0.15,
      ruffle: 0,
      veins: 0,
      offset: receptacle * 0.7,
      lift: 0,
    });
    stamens(vine, origin, axis, e1, e2, 3, [1.35, 1.5], [0.5, 0.62], radius, radius * 0.03);
    return;
  }

  if (kind === "bell") {
    const length = radius * between(random, 0.88, 1.02);
    lathe(vine, {
      role: "corolla",
      origin,
      axis,
      ref: e1,
      rows: rows(13, (q) => [
        length * q,
        receptacle +
          (radius * 0.42 - receptacle) * Math.pow(Math.sin((q * Math.PI) / 2), 0.55) +
          radius * 0.16 * Math.pow(Math.max(0, (q - 0.7) / 0.3), 2),
      ]),
      lobes: 5,
      lobeDepth: 0.09,
      flute: 0.12,
      seams: 5,
      seamOffset: Math.PI / 5,
      seamFrom: 0.05,
      rim: true,
      outline: true,
    });
    sepals(5, [-0.15, 0.3], 0.3);
    const tip = origin.clone().addScaledVector(axis, length * 1.12);
    vine.plan.strokes.push({ points: [origin.clone().addScaledVector(axis, length * 0.2), tip], dot: radius * 0.05 });
    return;
  }

  if (kind === "double") {
    const outer = pick(random, species.petals);
    whorl(vine, origin, axis, e1, e2, radius, {
      role: "petal",
      count: outer,
      spin: 0,
      alpha: [0.18, 0.32],
      length: [0.92, 1.04],
      shape: species.petal,
      width: [1, 1.15],
      bend: [0.2, 0.35],
      cup: [0.14, 0.24],
      twist: 0.15,
      ruffle: 0.015,
      veins: 2,
      offset: receptacle * 0.5,
      lift: receptacle * 0.1,
    });
    whorl(vine, origin, axis, e1, e2, radius, {
      role: "petal",
      count: 5,
      spin: Math.PI / 5,
      alpha: [0.75, 0.95],
      length: [0.66, 0.76],
      shape: species.petal,
      width: [0.95, 1.1],
      bend: [0.3, 0.42],
      cup: [0.25, 0.35],
      twist: 0.2,
      ruffle: 0.01,
      veins: 0,
      offset: receptacle * 0.35,
      lift: receptacle * 0.4,
    });
    whorl(vine, origin, axis, e1, e2, radius, {
      role: "petal",
      count: 3,
      spin: random() * TAU,
      alpha: [1.12, 1.32],
      length: [0.4, 0.48],
      shape: "obovate",
      width: [0.95, 1.1],
      bend: [0.45, 0.6],
      cup: [0.35, 0.45],
      twist: 0.3,
      ruffle: 0,
      veins: 0,
      offset: receptacle * 0.2,
      lift: receptacle * 0.7,
    });
    sepals(5, [-0.5, -0.2], 0.38);
    return;
  }

  if (kind === "star") {
    const count = pick(random, species.petals);
    whorl(vine, origin, axis, e1, e2, radius, {
      role: "petal",
      count,
      spin: 0,
      alpha: [0.02, 0.16],
      length: [0.95, 1.08],
      shape: species.petal,
      width: [1.05, 1.35],
      bend: [-0.12, 0.08],
      cup: [0.02, 0.1],
      twist: 0.35,
      ruffle: 0.01,
      veins: 3,
      offset: receptacle * 0.5,
      lift: receptacle * 0.1,
    });
    discAndStamens(vine, origin, axis, e1, e2, radius, 0.1, Math.round(between(random, 22, 30)), [1, 1.35], [0.2, 0.32], 0.025);
    return;
  }

  // blossom
  const count = pick(random, species.petals);
  whorl(vine, origin, axis, e1, e2, radius, {
    role: "petal",
    count,
    spin: 0,
    alpha: [0.12, 0.36],
    length: [0.9, 1.05],
    shape: species.petal,
    width: [0.95, 1.12],
    bend: [0.12, 0.3],
    cup: [0.08, 0.2],
    twist: 0.18,
    ruffle: species.petal === "frilled" ? 0.05 : 0.012,
    veins: 2,
    offset: receptacle * 0.5,
    lift: receptacle * 0.15,
  });
  sepals(count, [-0.55, -0.2], 0.42);
  discAndStamens(vine, origin, axis, e1, e2, radius, 0.12, Math.round(between(random, 12, 18)), [0.6, 1.05], [0.3, 0.44], 0.035);
}

function discAndStamens(
  vine: VineBuilder,
  origin: THREE.Vector3,
  axis: THREE.Vector3,
  e1: THREE.Vector3,
  e2: THREE.Vector3,
  radius: number,
  disc: number,
  count: number,
  alpha: Range,
  length: Range,
  dot: number,
): void {
  const size = radius * disc;
  lathe(vine, {
    role: "disc",
    origin,
    axis,
    ref: e1,
    rows: [
      [0, size],
      [size * 0.3, size * 0.88],
      [size * 0.55, size * 0.5],
      [size * 0.62, 0],
    ],
  });
  stamens(vine, origin, axis, e1, e2, count, alpha, length, radius, radius * dot);
  vine.plan.strokes.push({ points: [origin.clone(), origin.clone().addScaledVector(axis, radius * 0.26)], dot: radius * 0.045 });
}

function planBud(
  vine: VineBuilder,
  kind: VineBudKind,
  origin: THREE.Vector3,
  axis: THREE.Vector3,
  length: number,
  receptacle: number,
): void {
  const { random } = vine.garden;
  const species = vine.species;
  const { e1, e2 } = axisFrame(axis, random() * TAU);
  if (kind === "opening") {
    whorl(vine, origin, axis, e1, e2, length, {
      role: "petal",
      count: pick(random, species.petals),
      spin: 0,
      alpha: [0.95, 1.2],
      length: [0.92, 1.05],
      shape: species.petal === "pointed" ? "pointed" : "obovate",
      width: [0.95, 1.1],
      bend: [0.3, 0.42],
      cup: [0.28, 0.38],
      twist: 0.25,
      ruffle: 0,
      veins: 0,
      offset: receptacle * 0.5,
      lift: receptacle * 0.1,
    });
    whorl(vine, origin, axis, e1, e2, length, {
      role: "petal",
      count: 3,
      spin: Math.PI / 3,
      alpha: [1.3, 1.42],
      length: [0.78, 0.88],
      shape: "obovate",
      width: [0.9, 1],
      bend: [0.4, 0.5],
      cup: [0.35, 0.45],
      twist: 0.3,
      ruffle: 0,
      veins: 0,
      offset: receptacle * 0.3,
      lift: receptacle * 0.3,
    });
    whorl(vine, origin, axis, e1, e2, length, {
      role: "sepal",
      count: 5,
      spin: Math.PI / 5,
      alpha: [0.1, 0.45],
      length: [0.42, 0.52],
      shape: "sepal",
      width: [0.9, 1.15],
      bend: [-0.15, 0.05],
      cup: [0, 0.1],
      twist: 0.2,
      ruffle: 0,
      veins: 0,
      offset: receptacle * 0.6,
      lift: 0,
    });
    return;
  }

  const furled = kind === "furled";
  const span = furled ? length * 1.3 : length;
  const half = (furled ? length * 0.3 : length * between(random, 0.36, 0.46)) / 2;
  const body = (q: number): number =>
    furled
      ? q < 0.28
        ? half * smooth(q / 0.28)
        : half * Math.pow(1 - (q - 0.28) / 0.72, 1.15)
      : half * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(q, 0.72))), 0.85);
  lathe(vine, {
    role: "bud",
    origin,
    axis,
    ref: e1,
    rows: rows(14, (q) => {
      const shape = body(q);
      return [span * q, shape + (receptacle - shape) * (1 - smooth(q / 0.18))];
    }),
    seams: 5,
    seamTwist: furled ? between(random, 0.75, 1.1) : between(random, 0.2, 0.45),
    seamFrom: furled ? 0.1 : 0.2,
    outline: true,
  });
  whorl(vine, origin, axis, e1, e2, span, {
    role: "sepal",
    count: 5,
    spin: 0,
    alpha: furled ? [0.95, 1.1] : [0.75, 0.95],
    length: furled ? [0.26, 0.34] : [0.44, 0.54],
    shape: "sepal",
    width: [0.9, 1.15],
    bend: [0.35, 0.5],
    cup: [0.15, 0.25],
    twist: 0.25,
    ruffle: 0,
    veins: 0,
    offset: receptacle * 0.75,
    lift: 0,
  });
}
