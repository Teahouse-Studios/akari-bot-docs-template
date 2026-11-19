import { describe, expect, it } from "vitest";

import {
  FLUID_FALLBACK_TOKENS,
  FLUID_LOOPS,
  FLUID_TEXTURE_SIZES,
  FLUID_TEXTURE_WEIGHTS,
  FLUID_TEXTURES,
  FLUID_VARIANT_SPECS,
  FLUID_VARIANTS,
  fluidCurtain,
  fluidLoopOffset,
  fluidLoopOffsets,
  fluidNumber,
  fluidPalette,
  fluidRenderSize,
  fluidSeedOffset,
  fluidTextureTone,
  buildFluidRibbons,
  ribbonBandPath,
  ribbonLacePath,
  ribbonScallopPath,
  mixFluid,
  resolveFluid,
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
    // The wall sits under the page text: a stop brighter than this reads as a
    // lit panel instead of a background.
    expect(Math.max(...lumas)).toBeLessThan(0.3);
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

  it("lights the blossoms on a dark wall and shades them on a pale one", () => {
    const dark = fluidPalette(FLUID_FALLBACK_TOKENS.dark, "dark");
    const light = fluidPalette(FLUID_FALLBACK_TOKENS.light, "light");
    // Additive light only works over a dark ground; over a pale one it blows the
    // petal out, so the same shape is read as depth there instead.
    expect(dark.petalLight).toBeGreaterThan(0);
    expect(dark.petalInk).toBe(0);
    expect(light.petalLight).toBe(0);
    expect(light.petalInk).toBeGreaterThan(0);
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

describe("fluid variants", () => {
  it("gives every name a complete spec", () => {
    for (const variant of FLUID_VARIANTS) {
      const spec = FLUID_VARIANT_SPECS[variant];
      expect(spec.scale).toBeGreaterThan(0);
      expect(spec.speed).toBeGreaterThan(0);
      expect(spec.stretch).toHaveLength(2);
      expect(["none", "sakura"]).toContain(spec.texture);
    }
  });

  it("keeps silk on the values the wall shipped with", () => {
    const spec = resolveFluid("silk");
    expect(spec).toMatchObject({
      scale: 1.5,
      curl: 8.5,
      warp: 0.7,
      petal: 0.6,
      grid: 72,
      glow: 1,
      speed: 1,
      tone: 0.2,
      mote: 30,
      curtain: 0,
      texture: "none",
    });
  });

  it("lets a tag override the table, clamped to the shader's range", () => {
    expect(resolveFluid("aurora", { scale: 2 }).scale).toBe(2);
    expect(resolveFluid("aurora", { scale: 99 }).scale).toBe(5);
    expect(resolveFluid("aurora", { scale: "not a number" }).scale).toBe(FLUID_VARIANT_SPECS.aurora.scale);
    expect(resolveFluid("aurora", { texture: "sakura" }).texture).toBe("sakura");
    expect(resolveFluid("aurora", { texture: "lace" }).texture).toBe("lace");
    expect(resolveFluid("aurora", { texture: "confetti" }).texture).toBe("none");
  });

  it("gives every overlay a tile size, a weight and a usable alpha", () => {
    for (const texture of FLUID_TEXTURES) {
      expect(FLUID_TEXTURE_SIZES[texture]).toBeGreaterThan(0);
      expect(FLUID_TEXTURE_WEIGHTS[texture]).toBeGreaterThanOrEqual(0);
      if (texture !== "none") expect(FLUID_TEXTURE_WEIGHTS[texture]).toBeGreaterThan(0);
    }
    expect(FLUID_TEXTURE_WEIGHTS.none).toBe(0);
    expect(resolveFluid("aurora", { texture: "dots" }).textureOpacity).toBeGreaterThan(0);
    expect(resolveFluid("silk", { texture: "vine" }).texture).toBe("vine");
    expect(resolveFluid("silk", { texture: "waves" }).texture).toBe("none");
  });

  it("falls back to silk for a name it does not know", () => {
    expect(resolveFluid("plasma").scale).toBe(FLUID_VARIANT_SPECS.silk.scale);
    expect(resolveFluid(undefined).scale).toBe(FLUID_VARIANT_SPECS.silk.scale);
  });

  it("gives the curtain a clock that follows the speed", () => {
    expect(fluidCurtain(10)).toBeCloseTo(fluidCurtain(10, 1), 6);
    expect(fluidCurtain(10, 2)).toBeGreaterThan(fluidCurtain(10, 1));
    expect(fluidCurtain(0)).toBe(0);
  });

  it("paints ink on paper and light on a dark wall", () => {
    expect(fluidTextureTone("auto", "light")).toBe("ink");
    expect(fluidTextureTone("auto", "dark")).toBe("light");
    expect(fluidTextureTone("ink", "dark")).toBe("ink");
    expect(fluidTextureTone(undefined, "dark")).toBe("light");
  });

  it("lets the accent decide how much of the warm role reaches the ramp", () => {
    const cool = fluidPalette(FLUID_FALLBACK_TOKENS.dark, "dark", 0, 0).stops[3];
    const warm = fluidPalette(FLUID_FALLBACK_TOKENS.dark, "dark", 0, 1).stops[3];
    expect(warm[0]).toBeGreaterThan(cool[0]);
  });
});

describe("buildFluidRibbons", () => {
  it("lays ribbons across the wall, entering and leaving outside it", () => {
    const ribbons = buildFluidRibbons(1200, 320, 7, 5);
    expect(ribbons).toHaveLength(5);
    expect(ribbons.map((ribbon) => ribbon.layer)).toEqual([0, 1, 2, 3, 4]);
    let horizontalCrossings = 0;
    for (const ribbon of ribbons) {
      const [x0, y0, , , , , x3, y3] = ribbon.curve;
      const startsOutside = x0 < 0 || y0 < 0 || x0 > 1200 || y0 > 320;
      const endsOutside = x3 < 0 || y3 < 0 || x3 > 1200 || y3 > 320;
      expect(startsOutside || endsOutside).toBe(true);
      expect(ribbon.width).toBeGreaterThanOrEqual(20);
      expect(ribbon.width).toBeLessThanOrEqual(34);
      expect(ribbon.points.length).toBeGreaterThan(4);
      if ((x0 < 0 && x3 > 1200) || (x0 > 1200 && x3 < 0)) horizontalCrossings += 1;
    }
    expect(horizontalCrossings).toBeLessThanOrEqual(1);
  });

  it("redraws the same ribbons for the same seed and nothing for an empty wall", () => {
    expect(buildFluidRibbons(800, 240, 11, 4)).toEqual(buildFluidRibbons(800, 240, 11, 4));
    expect(buildFluidRibbons(800, 240, 12, 4)).not.toEqual(buildFluidRibbons(800, 240, 11, 4));
    expect(buildFluidRibbons(0, 0, 1, 3)).toEqual([]);
  });

  it("stretches the ribbons picked for a layout frame instead of re-picking them", () => {
    const layout = { width: 800, height: 240 };
    expect(buildFluidRibbons(800, 240, 11, 6, layout)).toEqual(buildFluidRibbons(800, 240, 11, 6));
    let previous = buildFluidRibbons(640, 240, 11, 6, layout);
    for (let width = 644; width <= 1040; width += 4) {
      const ribbons = buildFluidRibbons(width, 240, 11, 6, layout);
      ribbons.forEach((ribbon, index) => {
        expect(ribbon.width).toBe(previous[index].width);
        expect(ribbon.span).toBe(previous[index].span);
        ribbon.points.forEach(([x, y], point) => {
          const [px, py] = previous[index].points[point];
          expect(Math.hypot(x - px, y - py)).toBeLessThanOrEqual(4.01);
        });
      });
      previous = ribbons;
    }
    const florets = (width: number) =>
      buildFluidRibbons(width, 240, 11, 6, layout).map((ribbon) => ribbonLacePath(ribbon).split("Z").length);
    expect(florets(640)).toEqual(florets(1040));
  });

  it("adds independent bends and spreads ribbon centerlines", () => {
    const ribbons = buildFluidRibbons(1200, 320, 7, 5);
    const signatures = new Set(
      ribbons.map((ribbon) =>
        [8, 16, 24]
          .map((index) => ribbon.points[index].map((value) => Math.round(value / 24)).join(","))
          .join("|"),
      ),
    );
    expect(signatures.size).toBe(ribbons.length);

    for (const ribbon of ribbons) {
      const [x0, y0, x1, y1, x2, y2, x3, y3] = ribbon.curve;
      const chordX = x3 - x0;
      const chordY = y3 - y0;
      const chordLength = Math.hypot(chordX, chordY) || 1;
      const maxDeviation = Math.max(
        ...ribbon.points.slice(1, -1).map((point) =>
          Math.abs((point[0] - x0) * chordY - (point[1] - y0) * chordX) / chordLength,
        ),
      );
      expect(maxDeviation).toBeGreaterThan(1);
    }
  });

  it("cuts both edges of the band into a continuous scallop", () => {
    const [ribbon] = buildFluidRibbons(900, 300, 3, 1);
    const band = ribbonBandPath(ribbon);
    expect(band.startsWith("M")).toBe(true);
    expect(band.endsWith("Z")).toBe(true);

    const outer = ribbonScallopPath(ribbon, 1);
    const inner = ribbonScallopPath(ribbon, -1);
    expect(outer.split("L").length).toBeGreaterThan(40);
    expect((outer.match(/M/g) ?? []).length).toBeGreaterThan(20);
    expect(outer).not.toBe(inner);
    expect(ribbonScallopPath(ribbon, 1, 40)).not.toBe(outer);
    const occluder = { ...ribbon, width: ribbon.width + 24 };
    expect(ribbonScallopPath(ribbon, 1, 0, [occluder])).toBe("");
    expect(ribbonLacePath(ribbon, [ribbon])).toBe("");

    // The trim rides the band's own edge, so it cannot leave the ribbon's box
    // by more than the scallop amplitude.
    const xs = ribbon.points.map((point) => point[0]);
    const ys = ribbon.points.map((point) => point[1]);
    const margin = ribbon.width / 2 + Math.max(1.6, ribbon.width * 0.42) + 2;
    const numbers = outer.match(/-?\d+(\.\d+)?/g)!.map(Number);
    for (let index = 0; index < numbers.length; index += 2) {
      expect(numbers[index]).toBeGreaterThanOrEqual(Math.min(...xs) - margin);
      expect(numbers[index]).toBeLessThanOrEqual(Math.max(...xs) + margin);
      expect(numbers[index + 1]).toBeGreaterThanOrEqual(Math.min(...ys) - margin);
      expect(numbers[index + 1]).toBeLessThanOrEqual(Math.max(...ys) + margin);
    }
  });

  it("draws leaf florets inside the ribbon", () => {
    const [ribbon] = buildFluidRibbons(900, 300, 3, 1);
    const lace = ribbonLacePath(ribbon);
    expect(lace).toContain("C");
    expect(lace).toContain("Z");
    expect((lace.match(/M/g) ?? []).length).toBeGreaterThan(10);
  });

});


describe("fluidSeedOffset", () => {
  it("is reproducible and moves the field for a different seed", () => {
    expect(fluidSeedOffset(7)).toEqual(fluidSeedOffset(7));
    expect(fluidSeedOffset(7)).not.toEqual(fluidSeedOffset(8));
  });

  it("stays inside the tile the shader expects", () => {
    for (let seed = 1; seed <= 64; seed += 1) {
      const [x, y] = fluidSeedOffset(seed);
      expect(Math.abs(x)).toBeLessThanOrEqual(16);
      expect(Math.abs(y)).toBeLessThanOrEqual(16);
    }
  });
});
