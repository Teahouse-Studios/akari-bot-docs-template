---
icon: tune
order: 2
tab: Overview
parallel:
  - api
  - details
---

# Configuration

Config lives in the `docs` folder, at two levels:

- `docs/config.ts`: config shared by every language.
- `docs/<language code>/config.ts`: the config of one language, for example `docs/en-US/config.ts`. A folder with this file is a language folder.

A field in a language config replaces the field of the same name in the shared config, and objects merge field by field, so a language config only holds what differs for that language. `docs/.vitepress/config.mts` only wires the theme into VitePress; you rarely need to change it.

```text
docs/
├─ config.ts                 shared config
├─ en-US/                    English, at the site root
│  ├─ config.ts              language config
│  └─ …                      pages, see "Writing pages"
├─ zh-CN/                    Simplified Chinese, under /zh-CN/
│  ├─ config.ts
│  └─ …
└─ .vitepress/config.mts
```

## Shared config

What is the same in every language: the root language, the logo, the version and social links, the icons and order of the categories, settings and search.

```ts
// docs/config.ts
import { defineAkariConfig } from "./.vitepress/theme/define.ts";

export default defineAkariConfig({
  // The language folder served at the site root
  rootLanguage: "en-US",
  logo: "/logo.svg",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
  appBar: {
    version: "v1.0.0",
    socialLinks: [
      { icon: "github", link: "https://github.com/OasisAkari/vitepress-theme-akari-docs", label: "GitHub" },
    ],
  },
  sidebar: {
    // Category folder names and icons; the key order is the order in the rail
    categories: {
      "getting-started": { icon: "rocket_launch" },
      theme: { icon: "palette" },
    },
  },
  settings: { storageKey: "akari-docs-settings" },
  search: { maxResults: 8 },
  images: { webp: true },
  footer: { copyright: "Vitepress Theme Akari Docs" },
});
```

## Language config

The language's titles and text on this site. `lang` defaults to the folder name, and the theme picks the [language pack](/theme/i18n#language-packs) from it: the name in the language menu, the text direction, the interface strings and the code block copy button's text all come from the pack, and you override them here when needed.

```ts
// docs/en-US/config.ts
import { defineAkariConfig } from "../.vitepress/theme/define.ts";

export default defineAkariConfig({
  title: "Vitepress Theme Akari Docs",
  description: "A documentation theme built on VitePress and M3E Web Components",
  appBar: { title: "Vitepress Theme Akari Docs" },
  sidebar: {
    categories: {
      "getting-started": { text: "Getting started" },
      theme: { text: "Theme" },
    },
  },
  footer: { message: "Built with VitePress and M3E Web Components" },
});
```

## Common changes

| To | Write in | Field |
| --- | --- | --- |
| Change the site name | Language config | `title`, `appBar.title` |
| Add a version or social links | Shared config | `appBar.version`, `appBar.socialLinks` |
| Change the order or icons of categories | Shared config | `sidebar.categories` |
| Rename a category | Language config | `sidebar.categories.<folder>.text` |
| Change the default color and light and dark mode | Shared config | `settings.defaults` |
| Turn off search or connect a search backend | Shared config | `search` |
| Change the footer message and copyright | Language config / shared config | `footer.message`, `footer.copyright` |
| Rewrite interface text | Language config | `messages` |
| Convert the images the site uses to WebP | Shared config | `images.webp` |
| Add a language | A new language folder | See [Internationalization](/theme/i18n) |

For the type and default of every field, see [API](/getting-started/configuration/api). For how the config layers and how languages and navigation are generated, see [Details](/getting-started/configuration/details).
