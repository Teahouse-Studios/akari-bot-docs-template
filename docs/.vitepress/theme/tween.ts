/** Red, green and blue on 0–255, then alpha on 0–1. */
export type Rgba = [number, number, number, number];

/** `cubic-bezier()` as a function of time, solved for x by Newton steps. */
export function cubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): (t: number) => number {
  const curve = (a: number, b: number, t: number) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  const slope = (a: number, b: number, t: number) =>
    3 * (1 - t) ** 2 * a + 6 * (1 - t) * t * (b - a) + 3 * t ** 2 * (1 - b);

  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const error = curve(x1, x2, t) - x;
      const d = slope(x1, x2, t);
      if (Math.abs(error) < 1e-5 || Math.abs(d) < 1e-6) break;
      t -= error / d;
    }
    return curve(y1, y2, Math.min(1, Math.max(0, t)));
  };
}

/** One point of a CSS `linear()` easing curve, with both axes normalised. */
interface LinearStop {
  x: number;
  y: number;
}

/** Parses the stops of a CSS `linear()` curve, filling in omitted positions. */
function parseLinearStops(body: string): LinearStop[] {
  const tokens = body.split(",").map((token) => token.trim()).filter(Boolean);
  const stops: { y: number; x?: number }[] = [];

  for (const token of tokens) {
    const [yText, xText] = token.split(/\s+/);
    const y = Number.parseFloat(yText ?? "");
    if (!Number.isFinite(y)) return [];
    if (!xText) {
      stops.push({ y });
      continue;
    }
    const x = xText.endsWith("%")
      ? Number.parseFloat(xText) / 100
      : Number.parseFloat(xText);
    if (!Number.isFinite(x)) return [];
    stops.push({ y, x });
  }

  if (stops.length < 2) return [];
  if (stops[0]!.x === undefined) stops[0]!.x = 0;
  if (stops.at(-1)!.x === undefined) stops.at(-1)!.x = 1;

  // A point without a position sits evenly between its defined neighbours;
  // CSS normalises all of them before the curve is sampled.
  for (let index = 1; index < stops.length - 1; index++) {
    if (stops[index]!.x !== undefined) continue;
    const previous = stops[index - 1]!.x!;
    let next = index;
    while (stops[next]!.x === undefined) next += 1;
    const span = stops[next]!.x! - previous;
    const step = span / (next - index + 1);
    for (let fill = index; fill < next; fill++) {
      stops[fill]!.x = previous + step * (fill - index + 1);
    }
    index = next - 1;
  }

  return stops.map(({ x, y }) => ({ x: x!, y }));
}

/** Samples a piecewise-linear easing curve. */
function sampleLinear(stops: LinearStop[], t: number): number {
  const first = stops[0]!;
  const last = stops[stops.length - 1]!;
  if (t <= first.x) return first.y;
  if (t >= last.x) return last.y;

  let low = 0;
  let high = stops.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (stops[middle]!.x <= t) low = middle;
    else high = middle;
  }

  const from = stops[low]!;
  const to = stops[high]!;
  const span = to.x - from.x;
  return span <= 0 ? to.y : from.y + ((to.y - from.y) * (t - from.x)) / span;
}

/**
 * A CSS easing as a function of time. `cubic-bezier()` and the multi-stop
 * `linear()` form are read exactly; any other keyword is linear.
 */
export function parseEasing(easing: string): (t: number) => number {
  const bezier = /cubic-bezier\(([^)]+)\)/.exec(easing);
  const values = bezier?.[1]?.split(",").map(Number);
  if (values?.length === 4 && values.every(Number.isFinite)) {
    return cubicBezier(values[0]!, values[1]!, values[2]!, values[3]!);
  }

  const linear = /linear\(([^)]+)\)/.exec(easing);
  if (linear) {
    const stops = parseLinearStops(linear[1]!);
    if (stops.length >= 2) return (t) => sampleLinear(stops, t);
  }

  return (t) => t;
}

/** `rgb()`, `rgba()` or `color(srgb …)` as 0–255 channels and alpha. */
export function parseColor(value: string): Rgba {
  const numbers = value.match(/-?[\d.]+/g)?.map(Number) ?? [];
  const [r = 0, g = 0, b = 0, a = 1] = numbers;
  return value.trim().startsWith("color(")
    ? [r * 255, g * 255, b * 255, a]
    : [r, g, b, a];
}

/** A damped spring as M3's motion physics defines one (unit mass). */
export interface Spring {
  dampingRatio: number;
  stiffness: number;
}

/**
 * Progress of a spring released from rest at 0 towards 1, after `t`
 * seconds. Underdamped springs overshoot 1 before they settle.
 */
export function springAt(spring: Spring, t: number): number {
  if (t <= 0) return 0;
  const { dampingRatio: z, stiffness } = spring;
  const w = Math.sqrt(stiffness);
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z);
    return (
      1 -
      Math.exp(-z * w * t) *
        (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t))
    );
  }
  if (z === 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const r1 = -w * (z - Math.sqrt(z * z - 1));
  const r2 = -w * (z + Math.sqrt(z * z - 1));
  return 1 + (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r1 - r2);
}

/**
 * Seconds after which the spring stays within `tolerance` of 1, found in
 * steps of a millisecond (up to five seconds).
 */
export function springSettle(spring: Spring, tolerance = 0.001): number {
  let settled = 0;
  for (let ms = 0; ms <= 5000; ms++) {
    if (Math.abs(1 - springAt(spring, ms / 1000)) > tolerance) settled = ms + 1;
  }
  return settled / 1000;
}
