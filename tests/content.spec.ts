import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { akariContent } from "../docs/.vitepress/content";

import {
  buildSidebar,
  contentLanguages,
  mergeCategories,
  pageRoute,
  rewritePage,
  type ContentPage,
} from "../docs/.vitepress/content/structure";
import { defineAkariConfig } from "../docs/.vitepress/theme/define";

const languages = contentLanguages(["en", "zh"], "zh");
const zh = languages[0]!;

function page(
  source: string,
  frontmatter: Record<string, unknown> = {},
  heading?: string,
): ContentPage {
  return { source, frontmatter, heading };
}

function collect() {
  const messages: string[] = [];
  return { messages, logger: { warn: (message: string) => messages.push(message) } };
}

describe("contentLanguages", () => {
  it("puts the root language first and the others in alphabetical order", () => {
    expect(contentLanguages(["ja", "en", "zh"], "zh")).toEqual([
      { folder: "zh", key: "root", prefix: "" },
      { folder: "en", key: "en", prefix: "en/" },
      { folder: "ja", key: "ja", prefix: "ja/" },
    ]);
  });

  it("falls back to the first folder when the root is not a language", () => {
    expect(contentLanguages(["zh", "en"], "fr")[0]?.folder).toBe("en");
    expect(contentLanguages([])).toEqual([]);
  });
});

describe("rewritePage", () => {
  it("serves an article's index under its folder's name", () => {
    expect(rewritePage("zh/theme/layout/index.md", languages)).toBe(
      "theme/layout.md",
    );
    expect(rewritePage("en/theme/i18n/index.md", languages)).toBe(
      "en/theme/i18n.md",
    );
  });

  it("moves other pages out of the root language's folder only", () => {
    expect(rewritePage("zh/index.md", languages)).toBe("index.md");
    expect(rewritePage("zh/styles/icons/using.md", languages)).toBe(
      "styles/icons/using.md",
    );
    expect(rewritePage("en/index.md", languages)).toBe("en/index.md");
    // Pages outside the language folders stay where they are.
    expect(rewritePage("404.md", languages)).toBe("404.md");
    expect(rewritePage("fr/theme/index.md", languages)).toBe(
      "fr/theme/index.md",
    );
  });
});

describe("pageRoute", () => {
  it("drops the extension and a trailing index", () => {
    expect(pageRoute("index.md")).toBe("/");
    expect(pageRoute("en/index.md")).toBe("/en/");
    expect(pageRoute("theme/layout.md")).toBe("/theme/layout");
  });
});

describe("buildSidebar", () => {
  const pages = [
    page("zh/index.md", { title: "概览", category: "start", icon: "home" }),
    page("zh/start/install/index.md", { order: 1, icon: "package_2" }, "安装"),
    page("zh/start/config/index.md", { order: 2, badge: "New" }, "配置"),
    page("zh/guide/beta/index.md", {}, "乙"),
    page("zh/guide/alpha/index.md", {}, "甲"),
    page("zh/guide/first/index.md", { order: 0, title: "第一篇" }, "标题"),
    page(
      "zh/styles/icons/index.md",
      { title: "图标", tab: "概览", parallel: ["choosing", "./using.md"] },
      "图标",
    ),
    page("zh/styles/icons/choosing.md", {}, "选择图标"),
    page("zh/styles/icons/using.md", { tab: "使用" }, "使用图标"),
    page("en/start/install/index.md", {}, "Install"),
  ];

  it("makes categories of folders and articles of the folders in them", () => {
    const sidebar = buildSidebar(zh, pages, {
      start: { text: "开始", icon: "rocket_launch" },
      styles: { text: "样式" },
    });

    expect(sidebar.map((category) => category.text)).toEqual([
      "开始",
      "样式",
      "guide",
    ]);
    expect(sidebar[0]).toEqual({
      text: "开始",
      icon: "rocket_launch",
      items: [
        { text: "概览", icon: "home", link: "/" },
        { text: "安装", icon: "package_2", link: "/start/install" },
        { text: "配置", badge: "New", link: "/start/config" },
      ],
    });
  });

  it("orders articles by order, then by folder name", () => {
    const guide = buildSidebar(zh, pages).find(
      (category) => category.text === "guide",
    )!;
    expect(guide.items!.map((item) => [item.text, item.link])).toEqual([
      ["第一篇", "/guide/first"],
      ["甲", "/guide/alpha"],
      ["乙", "/guide/beta"],
    ]);
  });

  it("turns parallel pages into tabs instead of sidebar entries", () => {
    const styles = buildSidebar(zh, pages).find(
      (category) => category.text === "styles",
    )!;
    expect(styles.items).toEqual([
      {
        text: "图标",
        tabs: [
          { text: "概览", link: "/styles/icons" },
          { text: "选择图标", link: "/styles/icons/choosing" },
          { text: "使用", link: "/styles/icons/using" },
        ],
      },
    ]);
  });

  it("links another language's pages under its prefix", () => {
    const [en] = contentLanguages(["en", "zh"], "zh").slice(1);
    expect(buildSidebar(en!, pages)).toEqual([
      {
        text: "start",
        items: [{ text: "Install", link: "/en/start/install" }],
      },
    ]);
  });

  it("warns about missing parallel pages and pages outside the structure", () => {
    const { messages, logger } = collect();
    buildSidebar(
      zh,
      [
        page("zh/a/b/index.md", { parallel: ["missing", "../c"] }),
        page("zh/a/b/extra.md"),
        page("zh/a/loose.md"),
      ],
      {},
      logger,
    );

    expect(messages).toHaveLength(4);
    expect(messages[0]).toContain('parallel page "missing"');
    expect(messages[1]).toContain('parallel page "../c"');
    expect(messages.slice(2).join("\n")).toContain("zh/a/b/extra.md");
    expect(messages.slice(2).join("\n")).toContain("zh/a/loose.md");
  });

  it("leaves a home page without a category out", () => {
    const { messages, logger } = collect();
    const sidebar = buildSidebar(
      zh,
      [page("zh/index.md", { title: "首页" }), page("zh/a/b/index.md")],
      {},
      logger,
    );
    expect(sidebar).toEqual([{ text: "a", items: [{ text: "b", link: "/a/b" }] }]);
    expect(messages).toEqual([]);
  });
});

describe("mergeCategories", () => {
  it("lays a language's fields over the shared ones in the shared order", () => {
    expect(
      mergeCategories(
        { start: { icon: "rocket_launch" }, theme: { icon: "palette" } },
        { theme: { text: "主题" }, extra: { text: "其它" } },
      ),
    ).toEqual({
      start: { icon: "rocket_launch" },
      theme: { icon: "palette", text: "主题" },
      extra: { text: "其它" },
    });
  });
});

describe("defineAkariConfig", () => {
  it("puts the theme's fields under themeConfig.akari", () => {
    expect(
      defineAkariConfig({
        lang: "zh-CN",
        label: "简体中文",
        title: "文档",
        logo: "/logo.svg",
        appBar: { title: "文档" },
        sidebar: { categories: { start: { text: "开始" } } },
      }),
    ).toEqual({
      lang: "zh-CN",
      label: "简体中文",
      title: "文档",
      themeConfig: {
        logo: "/logo.svg",
        akari: {
          appBar: { title: "文档" },
          sidebar: { categories: { start: { text: "开始" } } },
        },
      },
    });
  });
});

describe("akariContent", () => {
  let docs = "";

  async function write(file: string, text: string): Promise<void> {
    await mkdir(path.dirname(path.join(docs, file)), { recursive: true });
    await writeFile(path.join(docs, file), text);
  }

  beforeAll(async () => {
    docs = await mkdtemp(path.join(tmpdir(), "akari-content-"));
    await write(
      "config.ts",
      `export default { rootLanguage: "zh-CN", themeConfig: { akari: { sidebar: { categories: { start: { icon: "rocket_launch" } } }, fonts: { google: ["Inter:wght@100..900"], family: ["Inter", "sans-serif"] }, images: { webp: true } } } };`,
    );
    await write(
      "zh-CN/config.ts",
      `export default { label: "简体中文", title: "文档", themeConfig: { akari: { sidebar: { categories: { start: { text: "开始" } } } } } };`,
    );
    await write(
      "en-US/config.ts",
      `export default { label: "English", lang: "en", markdown: { codeCopyButton: { tooltipText: "Copy" } }, themeConfig: { akari: { fonts: { google: false } } } };`,
    );
    // A language whose config leaves everything to the theme.
    await write("ar-SA/config.ts", "export default {};");
    await write("zh-CN/index.md", "---\ncategory: start\n---\n\n# 概览\n");
    await write("zh-CN/start/install/index.md", "# 安装\n");
    await write("en-US/start/install/index.md", "# Install\n");
    await write("public/config.ts", "export default {};");
  });

  afterAll(async () => {
    await rm(docs, { recursive: true, force: true });
  });

  it("makes a locale of each language folder, the root one first", async () => {
    const content = await akariContent(docs, { warn() {} });
    const { locales } = content.site;

    expect(content.languages.map((language) => language.folder)).toEqual([
      "zh-CN",
      "ar-SA",
      "en-US",
    ]);
    expect(Object.keys(locales!)).toEqual(["root", "ar-SA", "en-US"]);
    // The folder is the language code unless the config says otherwise.
    expect(locales!.root).toMatchObject({ lang: "zh-CN", label: "简体中文", title: "文档" });
    expect(locales!["en-US"]).toMatchObject({
      lang: "en",
      label: "English",
      dir: "ltr",
      // The config's strings over the language's.
      markdown: { codeCopyButton: { tooltipText: "Copy", copiedText: "Copied" } },
    });
    expect(content.site.lang).toBe("zh-CN");
    // Searching locally, so VitePress builds its index for the theme.
    expect(content.site.themeConfig).toMatchObject({ search: { provider: "local" } });
  });

  it("hands a build the shared config, which no page-level merge reaches", async () => {
    // VitePress layers `config.ts` over each page as it renders; the build
    // reads its config before that, so the hook gets it from here.
    const content = await akariContent(docs, { warn() {} });

    expect(content.config).toMatchObject({ images: { webp: true } });
  });

  it("takes what a language's config leaves out from the language", async () => {
    const { locales } = (await akariContent(docs, { warn() {} })).site;
    expect(locales!["ar-SA"]).toMatchObject({
      lang: "ar-SA",
      label: "العربية",
      dir: "rtl",
      markdown: {
        codeCopyButton: { tooltipText: "نسخ الشيفرة" },
        container: { tipLabel: "تلميح" },
      },
    });
  });

  it("sets up each language's fonts in its head, its config over the shared one", async () => {
    const { locales } = (await akariContent(docs, { warn() {} })).site;
    const style = (head: unknown[] | undefined) =>
      head?.find((tag) => Array.isArray(tag) && tag[0] === "style") as
        | [string, object, string]
        | undefined;

    expect(locales!.root!.head).toContainEqual([
      "link",
      {
        rel: "preload",
        as: "style",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
      },
    ]);
    expect(style(locales!.root!.head)?.[2]).toMatch(
      /^:root \{ --akari-font-family: "Inter", sans-serif; \}\nhtml:not\(:lang\(zh\)\)/,
    );
    // English loads nothing from Google Fonts, with the same stack.
    expect(locales!["en-US"]!.head).toHaveLength(1);
    expect(style(locales!["en-US"]!.head)).toEqual(style(locales!.root!.head));
  });

  it("serves the pages out of their folders and builds the navigation", async () => {
    const content = await akariContent(docs, { warn() {} });
    expect(content.route("zh-CN/start/install/index.md")).toBe("/start/install");
    expect(content.route("en-US/start/install/index.md")).toBe(
      "/en-US/start/install",
    );
    expect(content.site.locales!.root!.themeConfig.akari.sidebar.items).toEqual([
      {
        text: "开始",
        icon: "rocket_launch",
        items: [
          { text: "概览", link: "/" },
          { text: "安装", link: "/start/install" },
        ],
      },
    ]);
  });
});
