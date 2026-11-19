import { describe, expect, it } from "vitest";

import { FLUID_TEXTURE_SIZES } from "../docs/.vitepress/theme/fluid";
import {
  buildFluidWallSnippet,
  fluidColorValue,
  fluidPlaygroundValues,
  fluidTextureDefaults,
  type FluidPlaygroundConfig,
} from "../docs/.vitepress/theme/fluid-playground";

function config(overrides: Partial<FluidPlaygroundConfig> = {}): FluidPlaygroundConfig {
  return {
    variant: "silk",
    texture: "auto",
    textureTone: "auto",
    light: "end",
    height: 300,
    values: fluidPlaygroundValues("silk"),
    ...fluidTextureDefaults("silk", "auto"),
    textureColor: "",
    vineBlend: "normal",
    popout: "auto",
    inward: "auto",
    safeZone: "auto",
    ...overrides,
  };
}

describe("fluid playground", () => {
  it("seeds every slider from the chosen variant", () => {
    expect(fluidPlaygroundValues("aurora")).toEqual({
      scale: 1,
      curl: 2.5,
      warp: 1.1,
      tone: 0.08,
      petal: 0,
      grid: 0,
      glow: 0.8,
      speed: 0.5,
    });
  });

  it("brings an overlay's own size and alpha when the variant drew none", () => {
    const defaults = fluidTextureDefaults("silk", "stars");
    expect(defaults.textureSize).toBe(FLUID_TEXTURE_SIZES.stars);
    expect(defaults.textureOpacity).toBe(0.55);
  });

  it("keeps a variant's faint default alpha but lifts a swapped-in overlay", () => {
    expect(fluidTextureDefaults("nebula", "auto").textureOpacity).toBe(0.12);
    expect(fluidTextureDefaults("nebula", "sakura").textureOpacity).toBe(0.12);
    expect(fluidTextureDefaults("nebula", "dots").textureOpacity).toBe(0.55);
  });

  it("leaves untouched values out of the snippet", () => {
    expect(buildFluidWallSnippet(config())).toBe(
      '<AkariFluidWall variant="silk" height="300px" />',
    );
  });

  it("prints the values that differ from the variant", () => {
    const snippet = buildFluidWallSnippet(
      config({
        variant: "mesh",
        light: "center",
        height: 240,
        values: { ...fluidPlaygroundValues("mesh"), scale: 1.8, grid: 56 },
      }),
    );
    expect(snippet).toContain('variant="mesh"');
    expect(snippet).toContain('height="240px"');
    expect(snippet).toContain('light="center"');
    expect(snippet).toContain(':scale="1.8"');
    expect(snippet).toContain(':grid="56"');
    expect(snippet).not.toContain(":curl=");
  });

  it("names a texture override and its tuned overlay props", () => {
    const snippet = buildFluidWallSnippet(
      config({
        variant: "nebula",
        texture: "dots",
        textureSize: 420,
        textureDensity: 1.4,
        textureOpacity: 0.7,
      }),
    );
    expect(snippet).toContain('texture="dots"');
    expect(snippet).toContain(':texture-size="420"');
    expect(snippet).toContain(':texture-density="1.4"');
    expect(snippet).toContain(':texture-opacity="0.7"');
  });

  it("omits the overlay controls when there is no overlay", () => {
    const snippet = buildFluidWallSnippet(
      config({ variant: "mesh", texture: "none", textureOpacity: 0.8 }),
    );
    expect(snippet).not.toContain("texture-opacity");
    expect(snippet).not.toContain("texture-size");
  });

  it("prints a non-default vine blend mode", () => {
    expect(buildFluidWallSnippet(config())).not.toContain("vine-blend");
    expect(buildFluidWallSnippet(config({ texture: "vine", vineBlend: "screen" }))).toContain('vine-blend="screen"');
    expect(
      buildFluidWallSnippet(config({ texture: "vine", vineBlend: "screen", vinePopoutBlend: "difference" })),
    ).toContain('vine-popout-blend="difference"');
    expect(
      buildFluidWallSnippet(config({ texture: "vine", vineBlend: "screen", vinePopoutBlend: "screen" })),
    ).not.toContain("vine-popout-blend");
  });

  it("prints one pop-out palette and blend", () => {
    const snippet = buildFluidWallSnippet(
      config({
        texture: "vine",
        vineBlend: "normal",
        vinePopoutBlend: "difference",
        vinePopoutColors: { fill: "#ff0000", edge: "rgba(0, 255, 0, 0.5)" },
      }),
    );
    expect(snippet).toContain(`:vine-popout-colors="{ fill: '#ff0000', edge: 'rgba(0, 255, 0, 0.5)' }"`);
    expect(snippet).toContain('vine-popout-blend="difference"');
    expect(snippet).not.toContain("vine-popout-outside");
    expect(
      buildFluidWallSnippet(
        config({ texture: "vine", vineBlend: "screen", vinePopoutBlend: "screen" }),
      ),
    ).not.toContain("vine-popout-blend");
  });

  it("prints non-default ripple settings", () => {
    expect(buildFluidWallSnippet(config())).not.toContain(":ripple=");
    const snippet = buildFluidWallSnippet(config({ ripple: 1.6, rippleSpeed: 2, rippleSize: 0.8 }));
    expect(snippet).toContain(':ripple="1.6"');
    expect(snippet).toContain(':ripple-speed="2"');
    expect(snippet).toContain(':ripple-size="0.8"');
  });

  it("prints non-default vine ripple detail", () => {
    const snippet = buildFluidWallSnippet(
      config({ texture: "vine", rippleRings: 3.4, rippleSway: 0.6, vineGlow: 1.4 }),
    );
    expect(snippet).toContain(':ripple-rings="3.4"');
    expect(snippet).toContain(':ripple-sway="0.6"');
    expect(snippet).toContain(':vine-glow="1.4"');
    expect(buildFluidWallSnippet(config())).not.toContain("ripple-rings");
    expect(buildFluidWallSnippet(config())).not.toContain("vine-glow");
  });

  it("prints non-default shadow settings", () => {
    expect(buildFluidWallSnippet(config())).not.toContain(":shadow=");
    const snippet = buildFluidWallSnippet(config({ shadow: 1.8, shadowSize: 0.7 }));
    expect(snippet).toContain(':shadow="1.8"');
    expect(snippet).toContain(':shadow-size="0.7"');
  });

  it("prints a custom shadow colour and angle", () => {
    const snippet = buildFluidWallSnippet(config({ shadowColor: "#7b5270", shadowAngle: 120 }));
    expect(snippet).toContain('shadow-color="#7b5270"');
    expect(snippet).toContain(':shadow-angle="120"');
    expect(buildFluidWallSnippet(config())).not.toContain("shadow-color");
  });

  it("prints a non-default shadow blur", () => {
    expect(buildFluidWallSnippet(config())).not.toContain("shadow-blur");
    expect(buildFluidWallSnippet(config({ shadowBlur: 14 }))).toContain(':shadow-blur="14"');
  });

  it("prints independent wall shadow settings", () => {
    expect(buildFluidWallSnippet(config())).not.toContain("wall-shadow");
    const snippet = buildFluidWallSnippet(
      config({
        wallShadow: 0.6,
        wallShadowSize: 1.4,
        wallShadowColor: "#7b5270",
        wallShadowAngle: 120,
        wallShadowBlur: 12,
      }),
    );
    expect(snippet).toContain(':wall-shadow="0.6"');
    expect(snippet).toContain(':wall-shadow-size="1.4"');
    expect(snippet).toContain('wall-shadow-color="#7b5270"');
    expect(snippet).toContain(':wall-shadow-angle="120"');
    expect(snippet).toContain(':wall-shadow-blur="12"');
  });

  it("prints a non-default mote count", () => {
    expect(buildFluidWallSnippet(config())).not.toContain(":mote");
    expect(buildFluidWallSnippet(config({ mote: 0.45 }))).toContain(':mote="0.45"');
  });

  it("prints a custom mote colour and blend mode", () => {
    const snippet = buildFluidWallSnippet(config({ moteColor: "#ff0000", moteBlend: "screen" }));
    expect(snippet).toContain('mote-color="#ff0000"');
    expect(snippet).toContain('mote-blend="screen"');
  });

  it("prints a non-default underlay blend mode", () => {
    expect(buildFluidWallSnippet(config())).not.toContain("underlay-blend");
    expect(buildFluidWallSnippet(config({ underlayBlend: "screen" }))).toContain('underlay-blend="screen"');
  });

  it("prints a custom vine underlay colour and opacity", () => {
    expect(buildFluidWallSnippet(config())).not.toContain("underlay-color");
    expect(buildFluidWallSnippet(config())).not.toContain("underlay-opacity");
    const snippet = buildFluidWallSnippet(config({ underlayColor: "#c8b6ff", underlayOpacity: 0.32 }));
    expect(snippet).toContain('underlay-color="#c8b6ff"');
    expect(snippet).toContain(':underlay-opacity="0.32"');
  });

  it("prints each underlay attribute once", () => {
    const snippet = buildFluidWallSnippet(
      config({ underlayColor: "#c8b6ff", underlayOpacity: 0.32, underlayBlend: "screen" }),
    );
    for (const attr of ["underlay-color", "underlay-opacity", "underlay-blend"]) {
      expect(snippet.match(new RegExp(attr, "g"))).toHaveLength(1);
    }
  });

  it("prints a custom texture colour and leaves the default out", () => {
    expect(buildFluidWallSnippet(config())).not.toContain("texture-color");
    const snippet = buildFluidWallSnippet(
      config({ texture: "sakura", textureColor: "var(--md-sys-color-tertiary)" }),
    );
    expect(snippet).toContain('texture-color="var(--md-sys-color-tertiary)"');
  });

  it("builds rgba values from a hex and an alpha", () => {
    expect(fluidColorValue("#7b5270", 1)).toBe("#7b5270");
    expect(fluidColorValue("#7B5270", 0.5)).toBe("rgba(123, 82, 112, 0.5)");
    expect(fluidColorValue("#abc", 0.25)).toBe("rgba(170, 187, 204, 0.25)");
  });

  it("prints per-part vine colours and keeps the default empty", () => {
    expect(buildFluidWallSnippet(config({ texture: "vine" }))).not.toContain("vine-colors");
    const snippet = buildFluidWallSnippet(
      config({
        texture: "vine",
        vineColors: { fill: "rgba(255, 0, 0, 0.5)", edge: "#00ff00" },
      }),
    );
    expect(snippet).toContain(`:vine-colors="{ fill: 'rgba(255, 0, 0, 0.5)', edge: '#00ff00' }"`);
  });

  it("prints the vine base colour before the individual parts", () => {
    const snippet = buildFluidWallSnippet(
      config({ texture: "vine", vineColors: { fill: "rgba(255, 0, 0, 0.5)", base: "#ff0000" } }),
    );
    expect(snippet).toContain(`:vine-colors="{ base: '#ff0000', fill: 'rgba(255, 0, 0, 0.5)' }"`);
  });

  it("prints an outside safe zone when configured", () => {
    const snippet = buildFluidWallSnippet(
      config({ texture: "vine", outsideSafeZone: "0 60% 0 -20%" }),
    );
    expect(snippet).toContain('outside-safe-zone="0 60% 0 -20%"');
  });

  it("writes the vine switches and safe zone only for the vine overlay", () => {
    const snippet = buildFluidWallSnippet(
      config({
        texture: "vine",
        popout: true,
        inward: false,
        safeZone: "auto, 0 0 70% 60%",
      }),
    );
    expect(snippet).toContain('texture="vine"');
    expect(snippet).toContain(" popout");
    expect(snippet).toContain(':inward="false"');
    expect(snippet).toContain('safe-zone="auto, 0 0 70% 60%"');

    const other = buildFluidWallSnippet(config({ texture: "stars", popout: true }));
    expect(other).not.toContain("popout");
    expect(other).not.toContain("safe-zone");

    const blankZone = buildFluidWallSnippet(config({ texture: "vine", safeZone: "  " }));
    expect(blankZone).not.toContain("safe-zone");
  });

  it("prints the wall-vines-in-safe-zone switch only when it is off", () => {
    expect(buildFluidWallSnippet(config({ texture: "vine" }))).not.toContain("wall-vines-in-safe-zone");
    expect(
      buildFluidWallSnippet(config({ texture: "vine", wallVinesInSafeZone: false })),
    ).toContain(':wall-vines-in-safe-zone="false"');
    expect(
      buildFluidWallSnippet(config({ texture: "stars", wallVinesInSafeZone: false })),
    ).not.toContain("wall-vines-in-safe-zone");
  });

  it("wraps long tags one attribute per line", () => {
    const snippet = buildFluidWallSnippet(
      config({
        values: {
          scale: 2.1,
          curl: 10,
          warp: 0.9,
          tone: 0.35,
          petal: 0.2,
          grid: 44,
          glow: 1.4,
          speed: 0.8,
        },
      }),
    );
    expect(snippet.startsWith("<AkariFluidWall\n")).toBe(true);
    expect(snippet.trimEnd().endsWith("/>")).toBe(true);
    expect(snippet.split("\n").every((line) => !line.startsWith("  ") || line.endsWith('"') || line.endsWith("/>"))).toBe(true);
  });
});
