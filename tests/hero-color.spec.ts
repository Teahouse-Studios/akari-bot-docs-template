import { describe, expect, it } from "vitest";

import type { ResolvedHero } from "../docs/.vitepress/theme/hero";
import { sourceColorFromPixels } from "../docs/.vitepress/theme/heroColor";
import {
  heroColorKey,
  imageMetaKey,
  lookupImageMeta,
  resolveHeroColor,
} from "../docs/.vitepress/theme/heroColorCache";

function image(...colors: Array<[number, number, number, number?]>) {
  return colors.flatMap(([r, g, b, a = 255]) => [r, g, b, a]);
}

function hue(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r!, g!, b!);
  const min = Math.min(r!, g!, b!);
  const d = max - min;
  const h =
    max === r ? ((g! - b!) / d) % 6 : max === g ? (b! - r!) / d + 2 : (r! - g!) / d + 4;
  return (h * 60 + 360) % 360;
}

describe("sourceColorFromPixels", () => {
  it("picks the image's dominant hue as the seed", () => {
    // Mostly teal with some white and grey, like an illustration.
    const pixels = image(
      ...Array.from({ length: 300 }, () => [0, 128, 128] as [number, number, number]),
      ...Array.from({ length: 200 }, () => [255, 255, 255] as [number, number, number]),
      ...Array.from({ length: 100 }, () => [120, 120, 120] as [number, number, number]),
    );

    const color = sourceColorFromPixels(pixels);
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
    expect(hue(color!)).toBeGreaterThan(160);
    expect(hue(color!)).toBeLessThan(200);
  });

  it("skips transparent pixels", () => {
    const pixels = image(
      ...Array.from({ length: 400 }, () => [255, 0, 0, 0] as [number, number, number, number]),
      ...Array.from({ length: 100 }, () => [30, 80, 200] as [number, number, number]),
    );

    const color = sourceColorFromPixels(pixels);
    expect(hue(color!)).toBeGreaterThan(200);
    expect(hue(color!)).toBeLessThan(250);
  });

  it("finds nothing in a colorless or empty image", () => {
    expect(
      sourceColorFromPixels(
        image(...Array.from({ length: 100 }, () => [128, 128, 128] as [number, number, number])),
      ),
    ).toBeNull();
    expect(sourceColorFromPixels([])).toBeNull();
  });
});

function hero(overrides: Partial<ResolvedHero> = {}): ResolvedHero {
  return {
    src: "/hero/light.svg",
    darkSrc: undefined,
    alt: "",
    date: undefined,
    tagline: undefined,
    background: undefined,
    fit: "cover",
    color: "auto",
    pattern: "auto",
    ...overrides,
  };
}

describe("heroColorKey", () => {
  it("keys site-absolute and remote images by themselves", () => {
    expect(heroColorKey("/hero/light.svg", "zh-CN/index.md")).toBe(
      "/hero/light.svg",
    );
    expect(heroColorKey("https://example.com/a.png", "zh-CN/index.md")).toBe(
      "https://example.com/a.png",
    );
    expect(heroColorKey("//cdn.example.com/a.png")).toBe(
      "//cdn.example.com/a.png",
    );
  });

  it("keys a relative image by the page it sits beside", () => {
    expect(heroColorKey("./light.svg", "zh-CN/theme/hero/index.md")).toBe(
      "zh-CN/theme/hero/index.md::./light.svg",
    );
  });
});

describe("resolveHeroColor", () => {
  const colors = {
    "/hero/light.svg": "#006a6a",
    "/hero/dark.svg": "#4cdada",
  };

  it("keeps a fixed color and honors color: false", () => {
    expect(
      resolveHeroColor(hero({ color: "#3367d6" }), "light", colors),
    ).toBe("#3367d6");
    expect(resolveHeroColor(hero({ color: false }), "light", colors)).toBeNull();
  });

  it("uses the color of the image the scheme shows", () => {
    expect(resolveHeroColor(hero(), "light", colors)).toBe("#006a6a");
    expect(
      resolveHeroColor(hero({ darkSrc: "/hero/dark.svg" }), "dark", colors),
    ).toBe("#4cdada");
    expect(resolveHeroColor(hero(), "dark", colors)).toBe("#006a6a");
  });

  it("looks up a relative image beside its page", () => {
    expect(
      resolveHeroColor(
        hero({ src: "./light.svg" }),
        "light",
        { "zh-CN/a.md::./light.svg": "#3367d6" },
        "zh-CN/a.md",
      ),
    ).toBe("#3367d6");
  });

  it("keeps the reader's color when nothing was sampled", () => {
    expect(resolveHeroColor(null, "light", colors)).toBeNull();
    expect(resolveHeroColor(hero({ src: "/hero/none.svg" }), "light", colors)).toBeNull();
  });
});

describe("imageMetaKey", () => {
  it("strips the site base before resolving a public image", () => {
    expect(imageMetaKey("/docs/hero/light.svg", "zh-CN/index.md", "/docs/")).toBe(
      "/hero/light.svg",
    );
    expect(imageMetaKey("/hero/light.svg", "zh-CN/index.md", "/")).toBe(
      "/hero/light.svg",
    );
  });

  it("keeps remote and page-relative images distinct", () => {
    expect(imageMetaKey("https://example.com/a.png", "zh-CN/index.md")).toBe(
      "https://example.com/a.png",
    );
    expect(imageMetaKey("./light.svg", "zh-CN/theme/hero/index.md")).toBe(
      "zh-CN/theme/hero/index.md::./light.svg",
    );
  });

  it("ignores cache-busting queries on local images but not remote ones", () => {
    expect(imageMetaKey("/docs/hero/light.svg?v=2", "zh-CN/index.md", "/docs/")).toBe(
      "/hero/light.svg",
    );
    expect(imageMetaKey("./light.svg?v=2", "zh-CN/a.md")).toBe(
      "zh-CN/a.md::./light.svg",
    );
    expect(imageMetaKey("https://example.com/a.png?v=2", "zh-CN/a.md")).toBe(
      "https://example.com/a.png?v=2",
    );
  });

  // The WebP pass swaps a file's encoding after the map was written: the key
  // names the picture, so both encodings have to resolve to the same entry.
  it("files a picture under one key whatever its encoding", () => {
    expect(imageMetaKey("/hero/shot.webp", "zh-CN/a.md")).toBe(
      imageMetaKey("/hero/shot.png", "zh-CN/a.md"),
    );
    expect(imageMetaKey("/hero/shot.webp?v=2", "zh-CN/a.md")).toBe(
      "/hero/shot",
    );
    expect(imageMetaKey("./shot.jpg", "zh-CN/a.md")).toBe(
      "zh-CN/a.md::./shot",
    );
    // An SVG is a picture of its own, not another encoding of a bitmap.
    expect(imageMetaKey("/hero/light.svg", "zh-CN/a.md")).toBe(
      "/hero/light.svg",
    );
    // Remote addresses are served as they are, so they keep their encoding.
    expect(imageMetaKey("https://example.com/a.webp", "zh-CN/a.md")).toBe(
      "https://example.com/a.webp",
    );
  });
});

describe("lookupImageMeta", () => {
  const images = {
    "/hero/light.svg": { color: "#006a6a", width: 1200, height: 860 },
  };

  it("finds the build-time color and size of an image", () => {
    expect(lookupImageMeta(images, "/docs/hero/light.svg", undefined, "/docs/")).toEqual(
      images["/hero/light.svg"],
    );
    expect(lookupImageMeta(images, "/docs/hero/light.svg?v=2", undefined, "/docs/")).toEqual(
      images["/hero/light.svg"],
    );
    expect(lookupImageMeta(images, "/hero/missing.svg")).toBeNull();
  });
});
