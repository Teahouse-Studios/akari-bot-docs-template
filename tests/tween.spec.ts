import { describe, expect, it } from "vitest";

import {
  cubicBezier,
  parseColor,
  parseEasing,
  springAt,
  springSettle,
} from "../docs/.vitepress/theme/tween";

// The y of a cubic Bézier at a given x, found by halving the t interval.
function bisect(x1: number, y1: number, x2: number, y2: number, x: number) {
  const curve = (a: number, b: number, t: number) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 60; i++) {
    const middle = (low + high) / 2;
    if (curve(x1, x2, middle) < x) low = middle;
    else high = middle;
  }
  return curve(y1, y2, (low + high) / 2);
}

describe("cubicBezier", () => {
  it("pins both ends and is the identity for a straight curve", () => {
    const ease = cubicBezier(0.2, 0, 0, 1);
    expect([ease(-0.5), ease(0), ease(1), ease(1.5)]).toEqual([0, 0, 1, 1]);

    const linear = cubicBezier(0, 0, 1, 1);
    for (const t of [0.1, 0.5, 0.9]) expect(linear(t)).toBeCloseTo(t, 4);
  });

  it("matches a bisection solve of the same curve", () => {
    const curves: [number, number, number, number][] = [
      [0.25, 0.1, 0.25, 1],
      [0.2, 0, 0, 1],
      [0.38, 1.21, 0.22, 1],
    ];
    for (const points of curves) {
      const ease = cubicBezier(...points);
      for (let i = 1; i < 20; i++) {
        expect(ease(i / 20)).toBeCloseTo(bisect(...points, i / 20), 4);
      }
    }
  });

  it("overshoots on the expressive spring and settles", () => {
    const ease = cubicBezier(0.38, 1.21, 0.22, 1);
    const samples = Array.from({ length: 99 }, (_, i) => ease((i + 1) / 100));
    const peak = Math.max(...samples);
    expect(peak).toBeGreaterThan(1);
    expect(peak).toBeLessThan(1.05);
    expect(samples.at(-1)).toBeCloseTo(1, 2);
  });
});

describe("parseEasing", () => {
  it("reads cubic-bezier(), and falls back to linear for anything else", () => {
    const ease = parseEasing("cubic-bezier(0.25, 0.1, 0.25, 1)");
    expect(ease(0.5)).toBeCloseTo(bisect(0.25, 0.1, 0.25, 1, 0.5), 4);

    for (const easing of [
      "linear",
      "ease-out",
      "cubic-bezier(0.2, 0)",
      "cubic-bezier(0.2, 0, x, 1)",
      "linear(0.4)",
    ]) {
      expect(parseEasing(easing)(0.3)).toBe(0.3);
    }
  });

  it("reads linear() stops, percentages and omitted positions", () => {
    const ease = parseEasing("linear(0, 0.25, 1)");
    expect(ease(0)).toBe(0);
    expect(ease(0.25)).toBeCloseTo(0.125, 6);
    expect(ease(0.5)).toBeCloseTo(0.25, 6);
    expect(ease(0.75)).toBeCloseTo(0.625, 6);
    expect(ease(1)).toBe(1);

    const positioned = parseEasing("linear(0, 1 80%, 1)");
    expect(positioned(0.4)).toBeCloseTo(0.5, 6);
    expect(positioned(0.8)).toBe(1);
    expect(positioned(1)).toBe(1);
  });

  it("keeps a spring's overshoot instead of flattening it", () => {
    const ease = parseEasing(
      "linear(0, 0.4754 14.8%, 0.9953 41.5%, 1.0152 53.7%, 0.9999 99.9%, 1)",
    );
    expect(ease(0.537)).toBeCloseTo(1.0152, 4);
    expect(ease(0.2)).toBeGreaterThan(0.5);
    expect(ease(1.4)).toBe(1);
    expect(ease(-1)).toBe(0);
  });

  it("pins a curve that runs past the ends", () => {
    expect(parseEasing("linear(0 10%, 1 90%)")(0.05)).toBe(0);
    expect(parseEasing("linear(0 10%, 1 90%)")(0.5)).toBeCloseTo(0.5, 6);
    expect(parseEasing("linear(0 10%, 1 90%)")(0.95)).toBe(1);
  });
});

describe("parseColor", () => {
  it("reads rgb(), rgba() and space-separated rgb()", () => {
    expect(parseColor("rgb(12, 34, 56)")).toEqual([12, 34, 56, 1]);
    expect(parseColor("rgba(12, 34, 56, 0.5)")).toEqual([12, 34, 56, 0.5]);
    expect(parseColor("rgb(12 34 56 / 0.25)")).toEqual([12, 34, 56, 0.25]);
    expect(parseColor("")).toEqual([0, 0, 0, 1]);
  });

  it("scales color(srgb …) channels to 0–255", () => {
    const [r, g, b, a] = parseColor("color(srgb 1 0.5 0 / 0.8)");
    expect(r).toBeCloseTo(255);
    expect(g).toBeCloseTo(127.5);
    expect(b).toBeCloseTo(0);
    expect(a).toBeCloseTo(0.8);
  });
});

describe("springAt", () => {
  const expressive = { dampingRatio: 0.8, stiffness: 380 };
  const critical = { dampingRatio: 1, stiffness: 380 };
  const overdamped = { dampingRatio: 1.5, stiffness: 380 };

  it("starts at rest at 0 and comes to 1", () => {
    for (const spring of [expressive, critical, overdamped]) {
      expect(springAt(spring, 0)).toBe(0);
      expect(springAt(spring, -1)).toBe(0);
      expect(springAt(spring, 0.001)).toBeLessThan(0.001);
      expect(springAt(spring, 3)).toBeCloseTo(1, 6);
    }
  });

  it("overshoots by the amount its damping ratio sets", () => {
    let peak = 0;
    for (let ms = 0; ms < 1000; ms++) {
      peak = Math.max(peak, springAt(expressive, ms / 1000));
    }
    // exp(-πζ/√(1-ζ²)) for ζ = 0.8: about 1.5%.
    expect(peak - 1).toBeCloseTo(Math.exp((-Math.PI * 0.8) / 0.6), 3);
  });

  it("does not overshoot when critically damped or overdamped", () => {
    for (const spring of [critical, overdamped]) {
      let previous = 0;
      for (let ms = 1; ms < 1500; ms++) {
        const value = springAt(spring, ms / 1000);
        expect(value).toBeLessThanOrEqual(1);
        expect(value).toBeGreaterThanOrEqual(previous);
        previous = value;
      }
    }
  });

  it("is continuous across the damping regimes", () => {
    const near = (z: number) =>
      springAt({ dampingRatio: z, stiffness: 380 }, 0.05);
    expect(near(0.9999)).toBeCloseTo(near(1), 3);
    expect(near(1.0001)).toBeCloseTo(near(1), 3);
  });
});

describe("springSettle", () => {
  it("is when the spring stays within the tolerance for good", () => {
    const spring = { dampingRatio: 0.8, stiffness: 380 };
    const settle = springSettle(spring, 0.002);
    expect(settle).toBeGreaterThan(0.3);
    expect(settle).toBeLessThan(0.5);
    for (let ms = Math.ceil(settle * 1000); ms < 2000; ms += 7) {
      expect(Math.abs(1 - springAt(spring, ms / 1000))).toBeLessThanOrEqual(0.002);
    }
    expect(Math.abs(1 - springAt(spring, settle - 0.001))).toBeGreaterThan(0.002);
  });

});
