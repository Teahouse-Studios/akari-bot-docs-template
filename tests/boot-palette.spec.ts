import { describe, expect, it } from "vitest";

import { akariBootPageStyle } from "../docs/.vitepress/theme/boot";
import { akariBootPalette } from "../docs/.vitepress/theme/bootColors";
import { heroColorKey } from "../docs/.vitepress/theme/heroColorCache";

const PAGE = "zh-CN/theme/hero/index.md";
const LIGHT = "/hero/theme-hero.svg";
const DARK = "/hero/theme-hero-dark.svg";
const LIGHT_SEED = "#47a8a7";
const DARK_SEED = "#4cdada";

function heroFrontmatter(hero: unknown): Record<string, unknown> {
  return { hero };
}

describe("akariBootPageStyle", () => {
  it("leaves pages without a hero to the stylesheet's palette", () => {
    expect(akariBootPageStyle({}, PAGE, {})).toBe("");
    expect(akariBootPageStyle(heroFrontmatter({ color: "auto" }), PAGE, {})).toBe(
      "",
    );
  });

  it("keeps the reader's color when the hero opts out", () => {
    const style = akariBootPageStyle(
      heroFrontmatter({ image: LIGHT, color: false }),
      PAGE,
      { [heroColorKey(LIGHT, PAGE)]: LIGHT_SEED },
    );
    expect(style).toBe("");
  });

  it("paints the sampled hero color, per scheme", () => {
    const heroes = {
      [heroColorKey(LIGHT, PAGE)]: LIGHT_SEED,
      [heroColorKey(DARK, PAGE)]: DARK_SEED,
    };
    const style = akariBootPageStyle(
      heroFrontmatter({ image: { light: LIGHT, dark: DARK } }),
      PAGE,
      heroes,
    );

    const light = akariBootPalette({ seed: LIGHT_SEED }).light;
    const dark = akariBootPalette({ seed: DARK_SEED }).dark;

    expect(style.startsWith("<style>")).toBe(true);
    expect(style.endsWith("</style>")).toBe(true);
    expect(style).toContain(`--akari-boot-background: ${light.background};`);
    expect(style).toContain(`--akari-boot-block: ${light.block};`);
    expect(style).toContain(`--akari-boot-background: ${dark.background};`);
    expect(style).toContain(`--akari-boot-block: ${dark.block};`);
  });

  it("uses a fixed hero color for both schemes", () => {
    const style = akariBootPageStyle(
      heroFrontmatter({ image: LIGHT, color: "#ff8800" }),
      PAGE,
      {},
      { variant: "vibrant", contrast: "high" },
    );

    const palette = akariBootPalette({
      seed: "#ff8800",
      variant: "vibrant",
      contrast: "high",
    });
    expect(style).toContain(`--akari-boot-background: ${palette.light.background};`);
    expect(style).toContain(`--akari-boot-background: ${palette.dark.background};`);
  });

  it("falls back to the site seed where a scheme has no sample", () => {
    // A dark image the build could not sample: the theme keeps the site's
    // color in that scheme, so the skeleton must too.
    const style = akariBootPageStyle(
      heroFrontmatter({ image: { light: LIGHT, dark: DARK } }),
      PAGE,
      { [heroColorKey(LIGHT, PAGE)]: LIGHT_SEED, [heroColorKey(DARK, PAGE)]: null },
    );

    const palette = akariBootPalette({ seed: LIGHT_SEED, darkSeed: null });
    expect(style).toContain(`--akari-boot-background: ${palette.light.background};`);
    expect(style).toContain(`--akari-boot-background: ${palette.dark.background};`);
  });
});
