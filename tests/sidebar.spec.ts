import { describe, expect, it } from "vitest";

import {
  findFirstLink,
  findPrevNext,
  findTabGroup,
  flattenSidebar,
  hasActiveItem,
  isActiveLink,
  isExternalLink,
  isTabGroup,
  normalizePath,
  pageLink,
  resolveSidebarItems,
} from "../docs/.vitepress/theme/sidebar";
import type {
  AkariSidebarItem,
  ResolvedSidebarConfig,
} from "../docs/.vitepress/theme/types";

const nestedItems: AkariSidebarItem[] = [
  { text: "A", link: "/a" },
  {
    text: "B",
    items: [
      { text: "B1", link: "/b1" },
      { text: "B2", items: [{ text: "B2a", link: "/b2a" }] },
    ],
  },
  { text: "C", link: "/c" },
];

function native(nativeItems: unknown): ResolvedSidebarConfig {
  return { source: "native", nativeItems, width: 320 };
}

describe("normalizePath", () => {
  it.each([
    ["/guide/intro.html?tab=1#section", "/", "/guide/intro"],
    ["/guide/", "/", "/guide"],
    ["", "/", "/"],
    ["guide/intro", "/", "/guide/intro"],
    ["/docs/guide/install.html", "/docs/", "/guide/install"],
    ["/docs/", "/docs/", "/"],
    ["/docs-other/guide", "/docs/", "/docs-other/guide"],
  ])("normalizes %s with base %s to %s", (input, base, expected) => {
    expect(normalizePath(input, base)).toBe(expected);
  });
});

describe("links", () => {
  it("tells external links from internal ones", () => {
    for (const link of ["https://a.com", "//cdn.a.com/x", "mailto:a@b.c"]) {
      expect(isExternalLink(link)).toBe(true);
    }
    for (const link of ["/guide", "guide", "#section", ""]) {
      expect(isExternalLink(link)).toBe(false);
    }
  });

  it.each([
    ["/guide/", "/guide", "/", true],
    ["/guide/intro.html?x=1#s", "/guide/intro", "/", true],
    ["/docs/guide/install/", "/guide/install", "/docs/", true],
    ["/guide/advanced", "/guide", "/", false],
    ["/guide/intro", "https://github.com", "/", false],
    ["/guide/intro", "#installation", "/", false],
  ])("isActiveLink(%s, %s, base %s) is %s", (current, target, base, active) => {
    expect(isActiveLink(current, target, base)).toBe(active);
  });
});

describe("resolveSidebarItems", () => {
  it("picks the longest matching prefix, after the base", () => {
    const config: ResolvedSidebarConfig = {
      source: "akari",
      akariItems: {
        "/": [{ text: "概览", link: "/" }],
        "/guide/": [{ text: "指南", link: "/guide/install" }],
        "/guide/advanced/": [{ text: "高级", link: "/guide/advanced/one" }],
      },
      width: 320,
    };
    const text = (path: string, base?: string) =>
      resolveSidebarItems(config, path, base)[0]?.text;

    expect(text("/guide/advanced/one")).toBe("高级");
    expect(text("/guide")).toBe("指南");
    expect(text("/docs/guide/advanced/one.html#x", "/docs/")).toBe("高级");
    expect(text("/api/reference")).toBe("概览");
    expect(
      resolveSidebarItems({ ...config, akariItems: { "/guide/": [] } }, "/api"),
    ).toEqual([]);
  });

  it("converts a native sidebar, keeping extras and joining bases", () => {
    const nativeItems = [
      {
        text: "指南",
        base: "/guide/",
        icon: "menu_book",
        badge: "New",
        collapsed: true,
        items: [
          { text: "安装", link: "install" },
          { link: "/guide/config" },
          {
            text: "高级",
            base: "advanced/",
            items: [{ text: "One", link: "one" }],
          },
        ],
      },
    ];

    expect(resolveSidebarItems(native(nativeItems), "/")).toEqual([
      {
        text: "指南",
        icon: "menu_book",
        badge: "New",
        collapsed: true,
        items: [
          { text: "安装", link: "/guide/install" },
          { text: "/guide/config", link: "/guide/config" },
          {
            text: "高级",
            items: [{ text: "One", link: "/guide/advanced/one" }],
          },
        ],
      },
    ]);
    // The user's config is left as it was.
    expect(nativeItems[0]!.items[0]!.link).toBe("install");
  });

  it("matches native dictionaries and ignores invalid native sidebars", () => {
    const config = native({
      "/": [{ text: "Home", link: "/" }],
      "/guide/": [{ text: "Install", link: "/guide/install" }],
    });
    expect(resolveSidebarItems(config, "/guide/install")[0]?.text).toBe(
      "Install",
    );
    expect(resolveSidebarItems(config, "/api")[0]?.text).toBe("Home");

    for (const value of [undefined, null, "not-a-sidebar", 42]) {
      expect(resolveSidebarItems(native(value), "/guide")).toEqual([]);
    }
  });

  it("falls back to native items when the akari source has none", () => {
    const home = [{ text: "Home", link: "/" }];
    const config = { ...native(home), source: "akari" as const };
    expect(resolveSidebarItems(config, "/")).toEqual(home);
  });
});

describe("reading order", () => {
  it("flattens depth-first, a group's own link before its children", () => {
    expect(flattenSidebar(nestedItems).map((item) => item.text)).toEqual([
      "A",
      "B1",
      "B2a",
      "C",
    ]);
    expect(
      flattenSidebar([
        { text: "G", link: "/g", items: [{ text: "G1", link: "/g1" }] },
      ]).map((item) => item.text),
    ).toEqual(["G", "G1"]);
  });

  it("finds an item's first link, its own or depth-first", () => {
    expect(findFirstLink({ text: "G", link: "/g", items: nestedItems })).toBe(
      "/g",
    );
    expect(findFirstLink(nestedItems[1]!)).toBe("/b1");
    expect(findFirstLink({ text: "Empty", items: [{ text: "X" }] })).toBe(
      undefined,
    );
  });

  it("gives pages outside a parallel group no neighbours", () => {
    const around = (path: string) => {
      const { prev, next } = findPrevNext(nestedItems, path);
      return [prev?.text, next?.text];
    };

    expect(around("/a")).toEqual([undefined, undefined]);
    expect(around("/b2a")).toEqual([undefined, undefined]);
    expect(around("/missing")).toEqual([undefined, undefined]);
  });
});

describe("hasActiveItem", () => {
  const group: AkariSidebarItem = {
    text: "Guide",
    items: [
      {
        text: "Advanced",
        items: [{ text: "One", link: "/guide/advanced/one" }],
      },
      { text: "Install", link: "/guide/install" },
      { text: "GitHub", link: "https://github.com" },
      { text: "Anchor", link: "#top" },
    ],
  };

  it("finds the current page anywhere below an item", () => {
    expect(hasActiveItem(group, "/guide/advanced/one")).toBe(true);
    expect(hasActiveItem(group, "/docs/guide/install/", "/docs/")).toBe(true);
    expect(hasActiveItem({ text: "Guide", link: "/guide/" }, "/guide")).toBe(
      true,
    );
    expect(hasActiveItem(group, "/guide/config")).toBe(false);
  });
});

describe("tab groups", () => {
  const items: AkariSidebarItem[] = [
    { text: "概览", link: "/" },
    {
      text: "样式",
      items: [
        { text: "色彩", link: "/styles/color" },
        {
          text: "图标",
          tabs: [
            { text: "概览", link: "/styles/icons" },
            { text: "选择", link: "/styles/icons/choosing" },
            { text: "使用", link: "/styles/icons/using" },
          ],
        },
        { text: "排版", link: "/styles/typography" },
      ],
    },
  ];
  const group = items[1]!.items![1]!;

  it("is one entry, active on any of its tabs and linking to the first", () => {
    expect(isTabGroup(group)).toBe(true);
    expect(hasActiveItem(items[1]!, "/styles/icons/using")).toBe(true);
    expect(hasActiveItem(group, "/styles/color")).toBe(false);
    expect(findFirstLink(group)).toBe("/styles/icons");
    expect(findTabGroup(items, "/docs/styles/icons", "/docs/")).toBe(group);
    expect(findTabGroup(items, "/styles/color")).toBeUndefined();
  });

  it("reads tab by tab, or as one entry", () => {
    expect(flattenSidebar(items).map((item) => item.link)).toEqual([
      "/",
      "/styles/color",
      "/styles/icons",
      "/styles/icons/choosing",
      "/styles/icons/using",
      "/styles/typography",
    ]);
    expect(
      flattenSidebar(items, { tabs: "group" }).map((item) => item.text),
    ).toEqual(["概览", "色彩", "图标", "排版"]);
    // The pager stays within the group: no way out at either end.
    const around = (path: string, base?: string) => {
      const { prev, next } = findPrevNext(items, path, base);
      return [prev?.link, next?.link];
    };
    expect(around("/styles/icons")).toEqual([undefined, "/styles/icons/choosing"]);
    expect(around("/docs/styles/icons/choosing.html", "/docs/")).toEqual([
      "/styles/icons",
      "/styles/icons/using",
    ]);
    expect(around("/styles/icons/using")).toEqual(["/styles/icons/choosing", undefined]);
    expect(around("/styles/color")).toEqual([undefined, undefined]);
  });

  it("needs a tab with a link", () => {
    expect(isTabGroup({ text: "空", tabs: [{ text: "无链接" }] })).toBe(false);
  });

  it("survives native sidebar normalization", () => {
    const resolved = resolveSidebarItems(
      native([
        {
          text: "图标",
          base: "/styles/icons/",
          tabs: [
            { text: "选择", link: "choosing" },
            { text: "使用", link: "using" },
          ],
        },
      ]),
      "/",
    );

    expect(resolved[0]?.tabs?.map((tab) => tab.link)).toEqual([
      "/styles/icons/choosing",
      "/styles/icons/using",
    ]);
  });
});

describe("pageLink", () => {
  it("ends a page's link in .html when clean URLs are off", () => {
    expect(pageLink("/theme/layout")).toBe("/theme/layout.html");
    expect(pageLink("/theme/layout#css-variables")).toBe(
      "/theme/layout.html#css-variables",
    );
    expect(pageLink("/search?q=x")).toBe("/search.html?q=x");
  });

  it("leaves folders, files, anchors and other sites alone", () => {
    for (const link of ["/", "/zh-CN/", "/logo.svg", "/theme/layout.html", "#top", "https://example.com/a"]) {
      expect(pageLink(link)).toBe(link);
    }
  });

  it("changes nothing with clean URLs on", () => {
    expect(pageLink("/theme/layout", true)).toBe("/theme/layout");
  });
});
