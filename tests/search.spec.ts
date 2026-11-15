import MiniSearch from "minisearch";
import { describe, expect, it, vi } from "vitest";

import { resolveAkariConfig } from "../docs/.vitepress/theme/config";
import { resolveMessages } from "../docs/.vitepress/theme/i18n";
import {
  computeRevealMorph,
  fullClipPath,
  getSearchMotionPreset,
  insetClipPath,
} from "../docs/.vitepress/theme/search/animation";
import {
  buildHttpRequest,
  createSearchBackend,
  describeSearchError,
  AkariSearchError,
  normalizeSearchResults,
  resolveSearchEndpoint,
} from "../docs/.vitepress/theme/search/backends";
import { splitHighlight } from "../docs/.vitepress/theme/search/highlight";
import {
  LOCAL_SEARCH_OPTIONS,
  searchLocal,
  tokenizeSearchText,
  type LocalSearchDocument,
} from "../docs/.vitepress/theme/search/local";
import { MissingLocalIndexError } from "../docs/.vitepress/theme/search/localIndex";
import { registerSearchBackend } from "../docs/.vitepress/theme/search/registry";
import {
  normalizeSearchDockAnchor,
  searchDockHasRoom,
  searchDockSize,
} from "../docs/.vitepress/theme/search/dock";

// An index as VitePress builds it: one document per section, the page's
// title as the first section's.
function indexOf(documents: LocalSearchDocument[]): MiniSearch<LocalSearchDocument> {
  const index = new MiniSearch<LocalSearchDocument>(LOCAL_SEARCH_OPTIONS);
  index.addAll(documents);
  return index;
}

const doc = (
  id: string,
  title: string,
  titles: string[] = [],
  text = "",
): LocalSearchDocument => ({ id, title, titles, text });

const index = indexOf([
  doc("/components/button#按钮", "按钮", [], "按钮用于触发操作。"),
  doc("/components/button#变体", "变体", ["按钮"], "五种外观，包括 filled、tonal、outlined 与 text。"),
  doc("/theme/sidebar#配置", "配置", ["侧边导航"], "在 sidebar.categories 中配置导航的分类。"),
]);

// The local backend loads indexes through VitePress' virtual module.
vi.mock("../docs/.vitepress/theme/search/localIndex", () => {
  class MissingLocalIndexError extends Error {}
  return {
    MissingLocalIndexError,
    loadLocalIndex: async (locale: string) => {
      if (locale === "root") return index;
      throw new MissingLocalIndexError(locale);
    },
  };
});

describe("resolveAkariConfig search", () => {
  it("uses local defaults", () => {
    expect(resolveAkariConfig().search).toEqual({
      enabled: true,
      placeholder: "Search docs",
      shortcut: "k",
      maxResults: 8,
      debounce: 180,
      backend: { type: "local" },
    });
  });

  it("clamps numbers and rejects invalid backends", () => {
    const { search } = resolveAkariConfig({
      akari: {
        search: {
          maxResults: 100,
          debounce: -10,
          shortcut: "kk",
          backend: { type: "http", endpoint: "" },
        },
      },
    });

    expect(search.maxResults).toBe(20);
    expect(search.debounce).toBe(0);
    expect(search.shortcut).toBe("k");
    expect(
      resolveAkariConfig({ akari: { search: { shortcut: "" } } }).search.shortcut,
    ).toBe("");
    expect(search.backend).toEqual({ type: "local" });
  });

  it("keeps valid http and registered backends, trimmed", () => {
    const backend = (value: unknown) =>
      resolveAkariConfig({ akari: { search: { backend: value as never } } })
        .search.backend;

    expect(
      backend({ type: "http", endpoint: " /api/search ", method: "POST" }),
    ).toEqual({
      type: "http",
      endpoint: "/api/search",
      method: "POST",
      headers: {},
      credentials: "same-origin",
      queryParam: "q",
      limitParam: "limit",
    });
    expect(backend({ type: "registered", id: " my-search " })).toEqual({
      type: "registered",
      id: "my-search",
    });
  });
});

describe("search dock anchor", () => {
  it("fills in the defaults a tag leaves out", () => {
    expect(normalizeSearchDockAnchor(undefined)).toEqual({
      placeholder: undefined,
      variant: "bar",
      align: "start",
      priority: 0,
    });
  });

  it("keeps valid placeholder, variant, align, and priority", () => {
    expect(
      normalizeSearchDockAnchor({
        placeholder: "  Search the docs  ",
        variant: "hero",
        align: "center",
        priority: 3,
      }),
    ).toEqual({
      placeholder: "Search the docs",
      variant: "hero",
      align: "center",
      priority: 3,
    });
  });

  it("falls back on values the tag cannot use", () => {
    expect(
      normalizeSearchDockAnchor({
        variant: "giant" as never,
        align: "left" as never,
        priority: Number.NaN,
      }),
    ).toEqual({
      placeholder: undefined,
      variant: "bar",
      align: "start",
      priority: 0,
    });
  });

  it("gives each variant its natural box", () => {
    expect(searchDockSize("hero")).toEqual({ width: "420px", height: "56px" });
    expect(searchDockSize("pill", 300, "2.5rem")).toEqual({
      width: "300px",
      height: "2.5rem",
    });
  });

  it("ignores unusable lengths and keeps the variant box", () => {
    expect(searchDockSize("icon", -1, "  ")).toEqual({
      width: "56px",
      height: "56px",
    });
  });

  it("fills the parent box when requested", () => {
    expect(searchDockSize("hero", undefined, undefined, true)).toEqual({
      width: "100%",
      height: "100%",
    });
    expect(searchDockSize("hero", 320, "12rem", true)).toEqual({
      width: "320px",
      height: "12rem",
    });
  });
});

describe("search dock room", () => {
  const viewport = { width: 1000, height: 800 };
  const page = { left: 96, top: 64, right: 900, bottom: 2000 };
  const rect = { left: 200, top: 200, width: 280, height: 40 };

  it("accepts a tag fully inside the page and viewport", () => {
    expect(searchDockHasRoom(rect, viewport, page)).toBe(true);
  });

  it("rejects a tag that leaves the viewport", () => {
    expect(searchDockHasRoom({ ...rect, top: -20 }, viewport, page)).toBe(false);
    expect(
      searchDockHasRoom({ ...rect, left: 760 }, viewport, page),
    ).toBe(false);
  });

  it("rejects a tag outside the page surface", () => {
    expect(
      searchDockHasRoom({ ...rect, top: 20 }, viewport, page),
    ).toBe(false);
    expect(
      searchDockHasRoom({ ...rect, left: 40 }, viewport, page),
    ).toBe(false);
  });

  it("rejects a tag that collides with a tab shelf or app bar", () => {
    expect(
      searchDockHasRoom(rect, viewport, page, [
        { left: 100, top: 190, right: 500, bottom: 230 },
      ]),
    ).toBe(false);
  });
});

describe("local search", () => {
  it("splits Chinese and Japanese into words, as the index does", () => {
    const words = tokenizeSearchText("搜索与导航 search-backend");
    expect(words).toEqual(expect.arrayContaining(["搜索", "search", "backend"]));
    expect(words).not.toContain("搜索与导航");
  });

  it("ranks the heading that matches first", () => {
    expect(searchLocal(index, "变体", 5)[0]?.href).toBe("/components/button#变体");
  });

  it("requires every word, or any when none has them all", () => {
    expect(searchLocal(index, "配置 导航", 5).map((r) => r.href)).toEqual([
      "/theme/sidebar#配置",
    ]);
    // No section has both words: the one with either still shows.
    const results = searchLocal(index, "按钮 不存在的词", 5);
    expect(results[0]?.href).toBe("/components/button");
    const [result, ...rest] = searchLocal(index, "按钮", 1);
    expect(rest).toHaveLength(0);
    expect(result!.excerpt).toBeTruthy();
  });

  it("finds a misspelled word and reports the word it matched", () => {
    const [result] = searchLocal(index, "tonnal", 5);
    expect(result?.href).toBe("/components/button#变体");
    expect(result?.terms).toContain("tonal");
  });

  it("links a page's first section to the page, under its title", () => {
    expect(searchLocal(index, "触发", 5)[0]).toMatchObject({
      href: "/components/button",
      title: "按钮",
      pageTitle: "按钮",
      heading: undefined,
    });
    expect(searchLocal(index, "分类", 5)[0]).toMatchObject({
      href: "/theme/sidebar#配置",
      pageTitle: "侧边导航",
      heading: "配置",
    });
  });

  it("puts the page whose title is the query first", () => {
    const pages = indexOf([
      doc("/config/details#what", "配置文件中能写什么", ["配置：技术细节"]),
      doc("/search/api#search", "search", ["Search: API"]),
      doc("/config#配置", "配置"),
      doc("/search#search", "Search"),
    ]);

    expect(searchLocal(pages, "配置", 2)[0]?.href).toBe("/config");
    expect(searchLocal(pages, "Search", 2).map((r) => r.href)).toEqual([
      "/search",
      "/search/api#search",
    ]);
  });

  it("puts a phrase as typed over its words apart", () => {
    const sections = indexOf([
      doc("/components/button#图标", "图标", ["按钮"], "按钮可以带图标；复制、粘贴等常用操作各有图标。"),
      doc("/styles/typography/api#代码块", "代码块", ["排版"], "复制按钮的提示文字来自语言包。"),
    ]);
    expect(searchLocal(sections, "复制按钮", 2)[0]?.href).toBe(
      "/styles/typography/api#代码块",
    );
  });

  it("searches the index of the locale being read", async () => {
    const backend = createSearchBackend({ type: "local" });
    const results = await backend.search("变体", { limit: 5, locale: "root" });
    expect(results[0]?.href).toBe("/components/button#变体");

    await expect(
      backend.search("变体", { limit: 5, locale: "en-US" }),
    ).rejects.toMatchObject({ code: "index-unavailable" });
    expect(MissingLocalIndexError).toBeTypeOf("function");
  });
});

describe("highlight splitting", () => {
  it("highlights the words a backend says matched, too", () => {
    expect(splitHighlight("Tonal Spot", "tonnal", ["tonal"])).toEqual([
      { text: "Tonal", match: true },
      { text: " Spot", match: false },
    ]);
  });

  it("splits case-insensitive highlights, none for an empty query", () => {
    expect(splitHighlight("Filled 和 filled", "filled")).toEqual([
      { text: "Filled", match: true },
      { text: " 和 ", match: false },
      { text: "filled", match: true },
    ]);
    expect(splitHighlight("文档搜索", "   ")).toEqual([
      { text: "文档搜索", match: false },
    ]);
  });
});

describe("search morph animation", () => {
  const trigger = { left: 900, top: 12, width: 300, height: 40 };
  const panel = { left: 280, top: 200, width: 720, height: 400 };
  const bar = { left: 304, top: 224, width: 616, height: 56 };

  it("opens a trigger-sized window that lands exactly on the trigger", () => {
    const morph = computeRevealMorph(trigger, panel, bar);

    // Window: 300×40 at the bar's start, vertically centred on the bar.
    expect(morph.clip).toEqual({ top: 32, right: 396, bottom: 328, left: 24 });
    expect(morph.radius).toBe(20);
    expect(panel.left + morph.clip.left + morph.translateX).toBe(trigger.left);
    expect(panel.top + morph.clip.top + morph.translateY).toBe(trigger.top);
  });

  it("aligns to the inline end in right-to-left, inside the panel", () => {
    const rtl = computeRevealMorph(trigger, panel, bar, true);
    const barEnd = bar.left + bar.width;
    expect(rtl.clip.left).toBe(barEnd - 300 - panel.left);
    expect(rtl.clip.right).toBe(panel.left + panel.width - barEnd);

    const wide = computeRevealMorph({ ...trigger, width: 900 }, panel, bar);
    expect([wide.clip.left, wide.clip.right]).toEqual([0, 0]);
  });

  it("serializes the window and the fully open clip", () => {
    expect(insetClipPath({ top: 1, right: 2, bottom: 3, left: 4 }, 20)).toBe(
      "inset(1px 2px 3px 4px round 20px)",
    );
    expect(fullClipPath(28, 32)).toBe("inset(-32px round 60px)");
  });

  it("takes longer when expressive, and exits faster than it enters", () => {
    const standard = getSearchMotionPreset("standard");
    const expressive = getSearchMotionPreset("expressive");

    expect(expressive.duration).toBeGreaterThan(standard.duration);
    for (const preset of [standard, expressive]) {
      expect(preset.exitDuration).toBeLessThan(preset.duration);
    }
  });
});

describe("search backend adapters", () => {
  it("normalizes arrays and wrapped responses", () => {
    expect(
      normalizeSearchResults({ results: [{ title: "A", href: "/a" }] }, 8)[0],
    ).toMatchObject({ title: "A", href: "/a", pageTitle: "A" });

    expect(
      normalizeSearchResults(
        [{ title: "B", url: "/b", content: "正文", id: "b" }],
        8,
      )[0],
    ).toMatchObject({ title: "B", href: "/b", excerpt: "正文", id: "b" });

    expect(normalizeSearchResults([{ title: "C" }], 8)).toHaveLength(0);
    expect(
      normalizeSearchResults([{ title: "D", href: "/d" }], 1),
    ).toHaveLength(1);
  });

  it("resolves endpoints against the site base", () => {
    expect(resolveSearchEndpoint("/search-index.json", "/docs/")).toBe(
      "/docs/search-index.json",
    );
    expect(resolveSearchEndpoint("search-index.json", "/")).toBe(
      "/search-index.json",
    );
    expect(resolveSearchEndpoint("https://api.example.com/search", "/docs/")).toBe(
      "https://api.example.com/search",
    );
  });

  it("builds GET and POST HTTP requests", () => {
    const get = buildHttpRequest(
      {
        type: "http",
        endpoint: "/api/search",
        queryParam: "keyword",
        limitParam: "size",
      },
      "按钮 配置",
      5,
      "/docs/",
    );

    expect(get.url).toBe(
      "/docs/api/search?keyword=%E6%8C%89%E9%92%AE+%E9%85%8D%E7%BD%AE&size=5",
    );
    expect(get.init.method).toBe("GET");

    const post = buildHttpRequest(
      { type: "http", endpoint: "/api/search", method: "POST" },
      "按钮",
      5,
    );

    expect(post.init.method).toBe("POST");
    expect(post.init.headers).toMatchObject({
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(post.init.body))).toEqual({
      q: "按钮",
      limit: 5,
    });
  });

  it("calls registered backends and reports missing IDs", async () => {
    registerSearchBackend("test-search", async (query) => [
      {
        id: "test",
        title: query,
        href: "/test",
        pageTitle: "测试",
        excerpt: "结果",
      },
    ]);

    const backend = createSearchBackend({
      type: "registered",
      id: "test-search",
    });
    const result = await backend.search("自定义", { limit: 5 });
    expect(result[0]).toMatchObject({
      title: "自定义",
      href: "/test",
    });

    const missing = createSearchBackend({
      type: "registered",
      id: "does-not-exist",
    });
    await expect(
      missing.search("x", { limit: 5 }),
    ).rejects.toMatchObject({
      code: "backend-missing",
      params: { id: "does-not-exist" },
    });
  });

  it("passes the locale being read to registered backends", async () => {
    let received: unknown;
    registerSearchBackend("locale-search", (_query, context) => {
      received = context;
      return [];
    });

    await createSearchBackend({ type: "registered", id: "locale-search" })
      .search("x", { limit: 3, lang: "en-US", locale: "en-US" });

    expect(received).toMatchObject({ lang: "en-US", locale: "en-US" });
  });

  it("describes built-in failures in the reader's language", () => {
    const zh = resolveMessages("zh-CN");
    const en = resolveMessages("en");

    const unavailable = new AkariSearchError("index-unavailable");
    const missing = new AkariSearchError("backend-missing", { id: "x" });

    expect(describeSearchError(unavailable, zh)).toBe(
      "无法加载本地搜索索引。",
    );
    expect(describeSearchError(missing, en)).toBe(
      'No search backend is registered as "x".',
    );
    expect(describeSearchError(new Error("Custom failure"), zh)).toBe(
      "Custom failure",
    );
    expect(describeSearchError("unknown", zh)).toBe("搜索失败，请稍后重试。");
  });
});
