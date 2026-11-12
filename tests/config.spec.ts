import { describe, expect, it } from "vitest";

import { resolveAkariConfig } from "../docs/.vitepress/theme/config";
import {
  DEFAULT_SETTINGS,
  SETTINGS_SECTION_KEYS,
  SETTINGS_STORAGE_KEY,
} from "../docs/.vitepress/theme/constants";
import type {
  AkariSocialLink,
  AkariThemeSettings,
} from "../docs/.vitepress/theme/types";

// Takes values of the wrong type on purpose, to check the validation.
function resolve(akari: Record<string, unknown>) {
  return resolveAkariConfig({
    akari,
  } as Parameters<typeof resolveAkariConfig>[0]);
}

describe("resolveAkariConfig command prefix", () => {
  it("站点未配置时为空串", () => {
    expect(resolveAkariConfig().commandPrefix).toBe("");
  });

  it("沿用站点配置的前缀", () => {
    expect(resolve({ commandPrefix: "!" }).commandPrefix).toBe("!");
  });

  it("忽略非字符串取值", () => {
    expect(resolve({ commandPrefix: 3 }).commandPrefix).toBe("");
  });
});

describe("resolveAkariConfig defaults", () => {
  it("fills every group with its defaults", () => {
    const config = resolveAkariConfig();

    expect(config.appBar).toEqual({
      title: "Documentation",
      version: undefined,
      logo: undefined,
      showSidebarToggle: true,
      showSettingsToggle: true,
      socialLinks: [],
    });
    expect(config.settings).toMatchObject({
      enabled: true,
      showSchemeToggle: true,
      title: "Settings",
      sections: SETTINGS_SECTION_KEYS,
      persist: true,
      storageKey: SETTINGS_STORAGE_KEY,
      defaults: { ...DEFAULT_SETTINGS, color: "#6750a4" },
    });
    expect(config.toc).toEqual({
      enabled: true,
      maxDepth: 3,
      overline: "On this page",
    });
    expect(config.footer).toEqual({
      message: "Built with VitePress and M3E",
      copyright: "",
      showPrevNext: true,
      links: undefined,
    });
    expect(config.sidebar).toEqual({
      source: "native",
      akariItems: undefined,
      nativeItems: undefined,
      width: 320,
    });
    expect(config.components).toEqual({});
  });
});

describe("resolveAkariConfig app bar", () => {
  it("prefers its own title and logo over the site's", () => {
    const site = { title: "站点标题" };
    const own = { appBar: { title: "主题文档", logo: "/app.svg" } };

    expect(resolveAkariConfig({ logo: "/site.svg" }, site).appBar).toMatchObject({
      title: "站点标题",
      logo: "/site.svg",
    });
    expect(
      resolveAkariConfig({ logo: "/site.svg", akari: own }, site).appBar,
    ).toMatchObject({ title: "主题文档", logo: "/app.svg" });
  });

  it("keeps only well-formed social links", () => {
    const github: AkariSocialLink = {
      icon: "github",
      link: "https://github.com",
      label: "GitHub",
    };
    const links = [
      { icon: "github", link: "https://github.com" },
      github,
      { ...github, link: 42 },
      null,
    ];

    expect(resolve({ appBar: { socialLinks: links } }).appBar.socialLinks)
      .toEqual([github]);
    expect(resolve({ appBar: { socialLinks: "github" } }).appBar.socialLinks)
      .toEqual([]);
  });
});

describe("resolveAkariConfig sidebar", () => {
  it("uses the rich items if any, else the native sidebar", () => {
    const nativeItems = [{ text: "Native", link: "/native" }];
    const items = { "/": [{ text: "Home", link: "/" }] };

    expect(resolveAkariConfig({ sidebar: nativeItems }).sidebar).toMatchObject({
      source: "native",
      nativeItems,
    });
    expect(
      resolveAkariConfig({ sidebar: nativeItems, akari: { sidebar: { items } } })
        .sidebar,
    ).toMatchObject({ source: "akari", akariItems: items, nativeItems });
  });

  it.each([
    [100, 240],
    [300, 300],
    [1000, 400],
    [Number.NaN, 320],
    ["360", 320],
  ])("clamps the width %s to %s", (width, expected) => {
    expect(resolve({ sidebar: { width } }).sidebar.width).toBe(expected);
  });
});

describe("resolveAkariConfig settings", () => {
  it("filters the sections and falls back to all of them", () => {
    const sections = (value: unknown) =>
      resolve({ settings: { sections: value } }).settings.sections;

    expect(sections(["motion", "color", "motion", "bogus", 42])).toEqual([
      "motion",
      "color",
    ]);
    for (const value of [[], ["bogus"], "color"]) {
      expect(sections(value)).toEqual(SETTINGS_SECTION_KEYS);
    }
  });

  it("merges labels and defaults with the built-in ones", () => {
    const defaults = { scheme: "dark", textSize: "32px", color: "red" };
    const { settings } = resolve({
      settings: {
        enabled: false,
        labels: { color: "主题色" },
        defaults: defaults as unknown as Partial<AkariThemeSettings>,
      },
    });

    expect(settings.enabled).toBe(false);
    expect(settings.labels).toMatchObject({
      color: "主题色",
      motion: "Motion",
    });
    // An invalid color keeps the canonical lowercase default.
    expect(settings.defaults).toEqual({
      ...DEFAULT_SETTINGS,
      color: "#6750a4",
      scheme: "dark",
      textSize: "32px",
    });
  });
});

describe("resolveAkariConfig language", () => {
  it("uses the built-in strings of the site's language, else English", () => {
    const zh = resolveAkariConfig({}, { lang: "zh-CN" });

    expect(zh.lang).toBe("zh-CN");
    expect(zh.settings.title).toBe("设置");
    expect(zh.settings.labels.color).toBe("颜色");
    expect(zh.toc.overline).toBe("本页内容");
    expect(zh.search.placeholder).toBe("搜索文档");
    expect(resolveAkariConfig({}, { lang: "de-DE" }).settings.title).toBe(
      "Settings",
    );
    expect(resolveAkariConfig().lang).toBe("en");
  });

  it("lets messages override the strings, and options override both", () => {
    const config = resolve({
      messages: { tocOverline: "Sur cette page", nextPage: "Suivant" },
    });
    expect(config.toc.overline).toBe("Sur cette page");
    expect(config.messages.nextPage).toBe("Suivant");

    const explicit = resolve({
      messages: { tocOverline: "Contents" },
      toc: { overline: "In this article" },
    });
    expect(explicit.toc.overline).toBe("In this article");
  });
});

describe("resolveAkariConfig toc and footer", () => {
  it.each([
    [0, 1],
    [4, 4],
    [7, 6],
    [2.5, 3],
    ["4", 3],
  ])("clamps maxDepth %s to %s", (maxDepth, expected) => {
    expect(resolve({ toc: { maxDepth } }).toc.maxDepth).toBe(expected);
  });

  it("keeps footer links or false, dropping malformed groups and items", () => {
    const github = { text: "GitHub", link: "https://github.com" };

    expect(resolve({ footer: { links: false } }).footer.links).toBe(false);
    expect(
      resolve({
        footer: {
          links: [
            { title: "资源", items: [github, { text: "缺少链接" }] },
            { items: [] },
          ],
        },
      }).footer.links,
    ).toEqual([{ title: "资源", items: [github] }]);
  });
});
