import { describe, expect, it } from "vitest";

import {
  FLUID_FALLBACK_TOKENS,
  FLUID_LOOPS,
  fluidLoopOffset,
  fluidLoopOffsets,
  fluidNumber,
  fluidPalette,
  fluidRenderSize,
  mixFluid,
  type FluidRgb,
} from "../docs/.vitepress/theme/fluid";

function luma([r, g, b]: FluidRgb): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function stopLumas(scheme: "light" | "dark"): number[] {
  return fluidPalette(FLUID_FALLBACK_TOKENS[scheme], scheme).stops.map(luma);
}

describe("mixFluid", () => {
  it("holds the endpoints when the amount leaves 0..1", () => {
    expect(mixFluid([0, 0, 0], [1, 1, 1], -1)).toEqual([0, 0, 0]);
    expect(mixFluid([0, 0, 0], [1, 1, 1], 2)).toEqual([1, 1, 1]);
    const midpoint = mixFluid([0.2, 0.4, 0.6], [0.4, 0.6, 0.2], 0.5);
    expect(midpoint[0]).toBeCloseTo(0.3, 6);
    expect(midpoint[1]).toBeCloseTo(0.5, 6);
    expect(midpoint[2]).toBeCloseTo(0.4, 6);
  });
});

describe("fluidPalette", () => {
  it("keeps the dark wall off both ends of the luminance range", () => {
    // The wall renders additively: a ramp that already reaches white clips, and
    // one anchored on a pure black surface loses every shadow detail.
    const lumas = stopLumas("dark");
    expect(Math.min(...lumas)).toBeLessThan(0.14);
    expect(Math.max(...lumas)).toBeLessThan(0.62);
  });

  it("keeps the light wall a tint rather than a darkened panel", () => {
    const lumas = stopLumas("light");
    expect(Math.min(...lumas)).toBeGreaterThan(0.6);
    expect(Math.max(...lumas)).toBeLessThan(0.95);
  });

  it("lifts the dark wall with light but never adds light to the light wall", () => {
    // On a pale ramp an additive core and its bloom clip to white, so the light
    // scheme carries its depth with the container roles instead.
    const dark = fluidPalette(FLUID_FALLBACK_TOKENS.dark, "dark");
    const light = fluidPalette(FLUID_FALLBACK_TOKENS.light, "light");
    expect(dark.lightCore).toBeGreaterThan(0);
    expect(dark.lightHalo).toBeGreaterThan(0);
    expect(light.lightCore).toBe(0);
    expect(light.lightHalo).toBe(0);
    expect(light.bloomStrength).toBe(0);
  });

  it("takes the neutral from the surface container, not from the bare surface", () => {
    const tokens = { ...FLUID_FALLBACK_TOKENS.dark, surface: [0, 0, 0] as FluidRgb };
    const withContainer = luma(fluidPalette(tokens, "dark").stops[0]!);
    expect(withContainer).toBeCloseTo(luma(FLUID_FALLBACK_TOKENS.dark.surfaceContainer) * 0.2, 2);
    expect(withContainer).toBeGreaterThan(0.005);
  });
});

describe("fluidNumber", () => {
  it("reads the string an attribute hands over and keeps it in range", () => {
    // Attributes arrive as strings from markdown; the shader only survives a
    // finite number inside the range it documents.
    expect(fluidNumber("1.75", 0.6, 5, 1.8)).toBeCloseTo(1.75, 6);
    expect(fluidNumber("9", 0.6, 5, 1.8)).toBe(5);
    expect(fluidNumber(-2, 0.6, 5, 1.8)).toBe(0.6);
  });

  it("falls back instead of passing a broken figure to the shader", () => {
    expect(fluidNumber(undefined, 0, 1, 0.2)).toBe(0.2);
    expect(fluidNumber("wide", 0, 1, 0.2)).toBe(0.2);
    expect(fluidNumber(Number.NaN, 0, 1, 0.2)).toBe(0.2);
  });
});

describe("fluidPalette tone", () => {
  it("pulls the ramp towards the paper as the tone rises", () => {
    // Tone is convergence, not brightening: the dark ramp lifts its shadows and
    // dims its rose crest, and both ends move towards the surface either way.
    const spread = (scheme: "light" | "dark", tone: number) => {
      const lumas = fluidPalette(FLUID_FALLBACK_TOKENS[scheme], scheme, tone).stops.map(luma);
      return Math.max(...lumas) - Math.min(...lumas);
    };
    for (const scheme of ["light", "dark"] as const) {
      expect(spread(scheme, 0.6)).toBeLessThan(spread(scheme, 0));
    }
  });

  it("clamps a tone outside 0..1 to the ends it already has", () => {
    const tokens = FLUID_FALLBACK_TOKENS.dark;
    const full = fluidPalette(tokens, "dark", 1);
    expect(fluidPalette(tokens, "dark", 4).stops).toEqual(full.stops);
    expect(fluidPalette(tokens, "dark", -1).stops).toEqual(fluidPalette(tokens, "dark", 0).stops);
  });

  it("softens the vignette and the bloom as the wall washes out", () => {
    const dark = FLUID_FALLBACK_TOKENS.dark;
    const designed = fluidPalette(dark, "dark", 0);
    const washed = fluidPalette(dark, "dark", 1);
    expect(washed.vignette).toBeLessThan(designed.vignette);
    expect(washed.bloomStrength).toBeLessThan(designed.bloomStrength);
  });
});

describe("fluidLoopOffset", () => {
  it("walks a circle back to its start", () => {
    const loop = { period: 4000, radius: 3 };
    expect(fluidLoopOffset(0, loop).map((v) => Math.round(v * 1e6) / 1e6)).toEqual([0, 0]);
    expect(fluidLoopOffset(1000, loop).map((v) => Math.round(v * 1e6) / 1e6)).toEqual([3, 3]);
    expect(fluidLoopOffset(4000, loop).map((v) => Math.round(v * 1e6) / 1e6)).toEqual([0, 0]);
  });

  it("wraps a negative or oversized clock instead of drifting apart", () => {
    const loop = { period: 4000, radius: 3 };
    expect(fluidLoopOffset(-1000, loop)).toEqual(fluidLoopOffset(3000, loop));
    expect(fluidLoopOffset(9000, loop)).toEqual(fluidLoopOffset(1000, loop));
  });

  it("moves a loop by a fraction of its radius per frame", () => {
    // A period read in the wrong unit turns a fifty-minute drift into a
    // four-second spin; at 30fps every loop must creep, not jump.
    const step = 1 / 30;
    for (const loop of FLUID_LOOPS) {
      const [x0, y0] = fluidLoopOffset(0, loop);
      const [x1, y1] = fluidLoopOffset(step, loop);
      expect(Math.hypot(x1 - x0, y1 - y0) / loop.radius).toBeLessThan(0.02);
    }
  });

  it("packs every loop as an x/y pair for the shader array", () => {
    const elapsed = 1234;
    const offsets = fluidLoopOffsets(elapsed);
    expect(offsets).toHaveLength(FLUID_LOOPS.length * 2);
    FLUID_LOOPS.forEach((loop, index) => {
      expect(offsets[index * 2]).toBeCloseTo(fluidLoopOffset(elapsed, loop)[0], 5);
      expect(offsets[index * 2 + 1]).toBeCloseTo(fluidLoopOffset(elapsed, loop)[1], 5);
    });
  });
});

describe("fluidRenderSize", () => {
  it("caps the backing store by density, edge and area", () => {
    expect(fluidRenderSize(400, 200, 3)).toEqual({ width: 600, height: 300 });

    const wide = fluidRenderSize(2400, 300, 1);
    expect(wide.width).toBe(1400);
    expect(wide.width / wide.height).toBeCloseTo(8, 1);

    const huge = fluidRenderSize(2000, 1600, 2);
    expect(huge.width * huge.height).toBeLessThanOrEqual(1_100_000);
  });

  it("never returns an empty canvas", () => {
    expect(fluidRenderSize(0, 0, 1)).toEqual({ width: 1, height: 1 });
    expect(fluidRenderSize(10, 10, 0)).toEqual({ width: 10, height: 10 });
  });
});
