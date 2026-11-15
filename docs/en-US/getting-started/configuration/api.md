---
tab: API
---

# Configuration: API

## defineAkariConfig

```ts
import { defineAkariConfig } from "./.vitepress/theme/define.ts";

function defineAkariConfig(config: AkariSiteConfig): AkariDirectoryConfig;
```

Both levels of config file export their config with it. VitePress fields stay as they are. The theme's fields move under the `themeConfig.akari` that VitePress reads, and get type hints. The types are defined in `docs/.vitepress/theme/types.ts`.

## Site and language

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `rootLanguage` | `string` | The first language folder in alphabetical order | Only takes effect in the shared config: the language folder served at the site root. Paths of the other languages start with their folder name |
| `lang` | `string` | The language folder name | Language code. Used for `<html lang>`, and picks the [language pack](/theme/i18n/api#akarilanguage) |
| `label` | `string` | The language's own name | Name in the language menu |
| `dir` | `"ltr" \| "rtl" \| "auto"` | The language pack's | Text direction |
| `title` | `string` | None | Site title; also the default app bar title |
| `titleTemplate` | `string \| boolean` | None | Suffix or template for page titles, as in VitePress |
| `description` | `string` | None | Site description |
| `head` | `HeadConfig[]` | `[]` | Extra `<head>` tags, merged with the level above |
| `logo` | `string` | None | Brand image in the app bar and the footer |
| `markdown` | `MarkdownLocaleOptions` | The language pack's | The language's text in Markdown, such as the tooltip of the code block copy button, laid over the language pack's |

`lang`, `label`, `dir` and `markdown` describe a language and go in the language config. Every other field can go in the shared config as a default, and a language config can override it.

## Theme fields

| Field | Contents | See |
| --- | --- | --- |
| `appBar` | App bar title, version, logo, buttons and social links | [Layout and app bar](/theme/layout/api#appbar) |
| `toc` | Table of contents on the right | [Layout and app bar](/theme/layout/api#toc) |
| `loadingBar` | The bar at the top of the window while a page loads | [Layout and app bar](/theme/layout/api#loadingbar) |
| `footer` | Pager cards and footer | [Layout and app bar](/theme/layout/api#footer) |
| `sidebar` | Categories, navigation written by hand and drawer width | [Side navigation](/theme/sidebar/api#sidebar) |
| `settings` | Settings dialog and appearance button | [Settings and appearance](/theme/settings/api#settings) |
| `search` | Search entry and backends | [Search](/theme/search/api#search) |
| `messages` | Interface text | [Internationalization](/theme/i18n/api#messages) |
| `fonts` | Whether to load fonts from Google Fonts, and the font stack | [Typography](/styles/typography/api#fonts) |
| `languages` | Language packs besides the built-in ones, or changes to them | [Internationalization](/theme/i18n/api#akarilanguage) |

Replacing interface components is not done in the config files; see [Extending the theme](/theme/extending/api#provideakaricomponents).

## .vitepress/config.mts

The part that wires the theme into VitePress. You rarely need to change it:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { akariContent } from "./content";
import { akariHead } from "./theme/head";
import { akariMarkdown } from "./theme/markdown";

const docsDir = fileURLToPath(new URL("../", import.meta.url));
const content = await akariContent(docsDir);

export default defineConfig({
  ...content.site,
  cleanUrls: false,
  appearance: false,
  head: akariHead(),
  markdown: { config: (md) => akariMarkdown(md) },
  vue: {
    template: {
      compilerOptions: { isCustomElement: (tag) => tag.startsWith("m3e-") },
    },
  },
  vite: {
    plugins: [content.plugin],
  },
});
```

| Option | Purpose |
| --- | --- |
| `...content.site` | `locales`, `rewrites` and the site-level `lang`, `title`, `description`, generated from the folders; with local search, also `themeConfig.search`, which turns on VitePress' local search index |
| `cleanUrls: false` | Page paths end in `.html` and match the files in the output one to one; with `true` they have no extension, see [Installation](/getting-started/installation#deployment) for hosting requirements |
| `appearance: false` | Turns off the light and dark toggle built into VitePress; the theme manages it |
| `head: akariHead()` | A script that applies light or dark mode before the first frame |
| `akariMarkdown` | M3 borders for tables and sizes for remote images |
| `isCustomElement` | Makes Vue treat `m3e-*` as custom elements |
| `content.plugin` | In development, updates the navigation as Markdown files are added or removed and as frontmatter changes |

## akariContent

```ts
function akariContent(
  srcDir: string,
  logger?: { warn(message: string): void },
): Promise<AkariContent>;
```

Reads the config files and folders in `srcDir`. `logger` defaults to `console` and receives notices such as pages outside the structure and parallel pages that cannot be found.

| Returned field | Type | Description |
| --- | --- | --- |
| `site` | `{ lang, title, description, locales, rewrites }` | Spread into `defineConfig` |
| `plugin` | Vite `Plugin` | Updates the navigation in the dev server |
| `route` | `(page: string) => string` | Source file path → page path, such as `zh-CN/theme/layout/index.md` → `/zh-CN/theme/layout` |
| `rewrite` | `(page: string) => string` | Source file path → VitePress serving path, such as `zh-CN/theme/layout/index.md` → `theme/layout.md` |
| `languages` | `{ folder, key, prefix }[]` | Language folders, root language first. `key` is the VitePress locale key (`root` for the root language); `prefix` is the path prefix |

## akariHead

```ts
function akariHead(options?: {
  storageKey?: string;
  defaultScheme?: "light" | "dark" | "auto" | "time";
}): HeadConfig[];
```

Returns an inline script that applies light or dark mode before the first frame is painted. The fonts' `<head>` tags differ by language, so `akariContent` writes them into each language's locale; see [Typography](/styles/typography/api#fonts). If you change `settings.storageKey` or `settings.defaults.scheme`, pass the same values here so the script reads the same settings.

## akariMarkdown

```ts
function akariMarkdown(
  md: MarkdownRenderer,
  options?: { remoteImageSize?: boolean | AkariImageSizeOptions },
): void;
```

Call it in `markdown.config`. It does two things:

- Wraps every Markdown table in `<div class="akari-table">`, which gives the table an M3 outlined border and horizontal scrolling.
- Writes the width and height of remote images with [markdown-it-image-size](https://github.com/boyum/markdown-it-image-size). VitePress writes them for local images itself. See [Writing pages](/getting-started/writing/api#images).

| Option | Default | Description |
| --- | --- | --- |
| `remoteImageSize` | `true` | With `false`, remote images are not measured. It can also hold the plugin's options, for example `{ cacheDir: ".image-size" }` to keep the cache in the repository, or `{ cache: false }` for no cache |
