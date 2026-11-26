import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { loadConfigFromFile, type Plugin } from "vite";
import type { LocaleConfig, SiteConfig, UserConfig } from "vitepress";

import { extractFirstH1, stripFencedCode } from "./markdown";
import { fontHead, resolveFonts } from "../theme/fonts";
import {
  akariLanguages,
  languageName,
  mergeMarkdown,
  resolveLanguage,
} from "../theme/i18n";
import type {
  AkariDirectoryConfig,
  AkariSidebarCategory,
  AkariSidebarItem,
  AkariSiteConfig,
} from "../theme/types";
import {
  buildSidebar,
  contentLanguages,
  mergeCategories,
  pageRoute,
  rewritePage,
  type ContentLanguage,
  type ContentLogger,
  type ContentPage,
} from "./structure";

export * from "./structure";

/** The names VitePress loads a directory's config from. */
const CONFIG_FILES = ["config.ts", "config.mts", "config.js", "config.mjs"];

/**
 * VitePress' local search, for its index only: the theme searches it with
 * its own dialog. The index keeps each section's text, for excerpts.
 */
const LOCAL_SEARCH = {
  provider: "local",
  options: { miniSearch: { options: { storeFields: ["title", "titles", "text"] } } },
} as const;

/** Top-level folders that are never a language. */
const NOT_LANGUAGES = new Set(["public", "node_modules"]);

async function loadDirectoryConfig(
  directory: string,
  root: string,
): Promise<AkariDirectoryConfig | undefined> {
  const file = CONFIG_FILES.map((name) => path.join(directory, name)).find(
    (candidate) => existsSync(candidate),
  );
  if (!file) return undefined;

  const loaded = await loadConfigFromFile(
    { command: "serve", mode: "development" },
    file,
    root,
    "silent",
  );
  return (loaded?.config ?? {}) as AkariDirectoryConfig;
}

async function readPages(
  srcDir: string,
  languages: readonly ContentLanguage[],
): Promise<ContentPage[]> {
  const pages: ContentPage[] = [];

  for (const { folder } of languages) {
    const directory = path.join(srcDir, folder);
    // A language folder can go away while the dev server runs, before the
    // restart its config file brings about.
    if (!existsSync(directory)) continue;
    const files = (await readdir(directory, { recursive: true }))
      .map((file) => file.split(path.sep).join("/"))
      .filter(
        (file) =>
          file.endsWith(".md") &&
          !file.split("/").some((part) => part.startsWith(".")),
      )
      .sort();

    for (const file of files) {
      const { data, content } = matter(
        await readFile(path.join(directory, file), "utf8"),
      );
      pages.push({
        source: `${folder}/${file}`,
        frontmatter: data,
        heading: extractFirstH1(stripFencedCode(content)),
      });
    }
  }

  return pages;
}

function sidebarConfig(config: AkariDirectoryConfig | undefined) {
  return config?.themeConfig?.akari?.sidebar;
}

export interface AkariContent {
  /** The language folders, the root one first. */
  languages: ContentLanguage[];
  /**
   * The config every language shares, as `config.ts` at the top writes it:
   * VitePress layers it over each page, but a build needs some of it — the
   * `images` section — before any page exists.
   */
  config: AkariSiteConfig | undefined;
  /** Where VitePress serves a page of the docs, from its path in them. */
  rewrite(page: string): string;
  /** The route of a page of the docs, from its path in them. */
  route(page: string): string;
  /** VitePress options: the languages as locales, the rewrites, defaults. */
  site: Pick<
    UserConfig,
    "lang" | "title" | "description" | "locales" | "rewrites" | "themeConfig"
  >;
  /** Keeps the navigation up to date while the dev server runs. */
  plugin: Plugin;
}

/**
 * The docs' content as VitePress options, from how `srcDir` is laid out:
 *
 * - `config.ts` at the top holds what every language shares;
 * - each folder with its own `config.ts` is a language, named by its
 *   language code (`zh-CN`, `en-US`), and that file what the language
 *   changes. VitePress itself layers these files over each other for the
 *   pages in their folders; here they also make the locales, so the
 *   language menu lists them;
 * - in a language folder, folders are rail categories and the folders in
 *   them articles, whose `index.md` is served at `/<category>/<article>`
 *   (see `buildSidebar` for the navigation this makes).
 *
 * Without language folders, nothing changes and the navigation is the
 * one written out in the config.
 */
export async function akariContent(
  srcDir: string,
  logger: ContentLogger = console,
): Promise<AkariContent> {
  const shared = await loadDirectoryConfig(srcDir, srcDir);
  const configs = new Map<string, AkariDirectoryConfig>();

  for (const entry of await readdir(srcDir, { withFileTypes: true })) {
    if (
      !entry.isDirectory() ||
      entry.name.startsWith(".") ||
      NOT_LANGUAGES.has(entry.name)
    ) {
      continue;
    }
    const config = await loadDirectoryConfig(
      path.join(srcDir, entry.name),
      srcDir,
    );
    if (config) configs.set(entry.name, config);
  }

  const root = shared?.rootLanguage;
  if (root && !configs.has(root)) {
    logger.warn(
      `[akari] rootLanguage "${root}" is not a language folder (a folder of the docs with its own config.ts).`,
    );
  }

  const languages = contentLanguages([...configs.keys()], root);
  const rewrite = (page: string) => rewritePage(page, languages);
  const warned = new Set<string>();
  const once: ContentLogger = {
    warn(message) {
      if (warned.has(message)) return;
      warned.add(message);
      logger.warn(`[akari] ${message}`);
    },
  };

  /** A language's navigation, unless its config writes one out. */
  function sidebarOf(
    language: ContentLanguage,
    pages: readonly ContentPage[],
  ): AkariSidebarItem[] | undefined {
    const own = sidebarConfig(configs.get(language.folder));
    if (own?.items ?? sidebarConfig(shared)?.items) return undefined;
    const categories: Record<string, AkariSidebarCategory> = mergeCategories(
      sidebarConfig(shared)?.categories,
      own?.categories,
    );
    return buildSidebar(language, pages, categories, once);
  }

  const pages = await readPages(srcDir, languages);
  const locales: LocaleConfig = {};

  for (const language of languages) {
    // The language's config already applies to its pages; as the locale it
    // also names the language in the menu, covers pages outside its folder
    // (the 404 page) and carries the generated navigation. Its own head
    // entries would be added twice; the locale's head holds the language's
    // fonts.
    const { rootLanguage, head, themeConfig, ...config } =
      configs.get(language.folder)!;
    const sidebar = sidebarOf(language, pages);
    const lang = config.lang ?? language.folder;
    // What the config leaves out comes from the language serving `lang`:
    // its name, direction, Markdown strings and fonts.
    const known =
      themeConfig?.akari?.languages ?? shared?.themeConfig?.akari?.languages;
    const spoken = resolveLanguage(lang, known);
    const fonts = resolveFonts(
      { ...shared?.themeConfig?.akari?.fonts, ...themeConfig?.akari?.fonts },
      spoken.fonts,
      akariLanguages(known),
    );

    locales[language.key] = {
      ...config,
      lang,
      label: config.label ?? languageName(lang),
      dir: config.dir ?? spoken.dir,
      markdown: mergeMarkdown(spoken.markdown, config.markdown),
      head: fontHead(fonts),
      themeConfig: sidebar
        ? {
            ...themeConfig,
            akari: {
              ...themeConfig?.akari,
              sidebar: { ...themeConfig?.akari?.sidebar, items: sidebar },
            },
          }
        : themeConfig,
    };
  }

  const rootConfig = languages[0] && configs.get(languages[0].folder);

  // The theme's local search reads the index VitePress' own local search
  // builds, one per locale. It is built when any language searches locally.
  const sharedSearch = shared?.themeConfig?.akari?.search;
  const searches = languages.length
    ? languages.map((language) => ({
        ...sharedSearch,
        ...configs.get(language.folder)?.themeConfig?.akari?.search,
      }))
    : [sharedSearch ?? {}];
  const searchesLocally = searches.some(
    (search) =>
      (search.enabled ?? true) && (search.backend?.type ?? "local") === "local",
  );

  return {
    languages,
    config: shared?.themeConfig?.akari,
    rewrite,
    route: (page) => pageRoute(rewrite(page)),
    site: {
      lang: rootConfig?.lang ?? languages[0]?.folder ?? shared?.lang,
      title: rootConfig?.title ?? shared?.title,
      description: rootConfig?.description ?? shared?.description,
      locales,
      rewrites: rewrite,
      ...(searchesLocally ? { themeConfig: { search: LOCAL_SEARCH } } : {}),
    },
    plugin: {
      name: "akari-content",
      configureServer(server) {
        const vitepress = (server.config as { vitepress?: SiteConfig })
          .vitepress;
        let timer: ReturnType<typeof setTimeout> | undefined;

        // Pages come and go and their frontmatter changes without a
        // restart; the navigation follows, and the page reloads with it.
        async function refresh(): Promise<void> {
          const next = await readPages(srcDir, languages);
          const current = vitepress?.site.locales ?? locales;
          let changed = false;

          for (const language of languages) {
            const items = sidebarOf(language, next);
            const sidebar = current[language.key]?.themeConfig?.akari?.sidebar;
            if (!items || !sidebar) continue;
            if (JSON.stringify(sidebar.items) === JSON.stringify(items)) {
              continue;
            }
            sidebar.items = items;
            changed = true;
          }
          if (!changed) return;

          const client = server.environments.client;
          const data = client.moduleGraph.getModuleById("/@siteData");
          if (data) client.moduleGraph.invalidateModule(data);
          client.hot.send({ type: "full-reload" });
        }

        server.watcher.on("all", (event, file) => {
          if (!["add", "change", "unlink"].includes(event)) return;
          if (!file.endsWith(".md")) return;
          const folder = path.relative(srcDir, file).split(path.sep)[0];
          if (!languages.some((language) => language.folder === folder)) {
            return;
          }
          clearTimeout(timer);
          timer = setTimeout(() => {
            refresh().catch((error: unknown) => {
              console.error("[akari] failed to update the navigation", error);
            });
          }, 120);
        });
      },
    },
  };
}
