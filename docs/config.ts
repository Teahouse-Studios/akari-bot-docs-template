import { defineAkariConfig } from "./.vitepress/theme/define.ts";

// What every language shares. Each language folder's config.ts (zh-CN/,
// en-US/) lays its own fields over these for its pages.
export default defineAkariConfig({
  rootLanguage: "en-US",
  logo: "/logo.svg",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
  appBar: {
    version: "v1.0.0",
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/OasisAkari/vitepress-theme-akari-docs",
        label: "GitHub",
      },
    ],
  },
  sidebar: {
    // The folders of a language folder, in rail order; their names are in
    // each language's config.
    categories: {
      "getting-started": { icon: "rocket_launch" },
      theme: { icon: "palette" },
      styles: { icon: "style" },
      components: { icon: "widgets" },
    },
  },
  settings: {
    enabled: true,
    persist: true,
    storageKey: "akari-docs-settings",
  },
  search: {
    enabled: true,
    shortcut: "k",
    maxResults: 8,
    backend: { type: "local" },
  },
  toc: {
    enabled: true,
    maxDepth: 3,
  },
  images: {
    // Every raster image the built pages use becomes a WebP copy of itself.
    webp: true,
  },
  footer: {
    copyright: "Vitepress Theme Akari Docs",
  },
});
