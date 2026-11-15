---
icon: package_2
order: 1
---

# Installation

Vitepress Theme Akari Docs is a GitHub template repository. Create your own repository from it to get the theme's source, the config and the sample docs; there is no separate theme package to install.

## Creating a repository from the template

1. Open [OasisAkari/vitepress-theme-akari-docs](https://github.com/OasisAkari/vitepress-theme-akari-docs) and click **Use this template** → **Create a new repository**.
2. Fill in the repository name and visibility, and create it. The new repository has all of the template's files, its commit history starts fresh, and it isn't a fork of the template.
3. Clone it, install the dependencies and start:

   ```bash
   git clone https://github.com/<account>/<repository>.git
   cd <repository>
   npm install
   npm run dev
   ```

The GitHub CLI creates and clones it in one step:

```bash
gh repo create my-docs --template OasisAkari/vitepress-theme-akari-docs --public --clone
```

## Requirements

- Node.js `>=22.12.0` (the `engines` field of `package.json`). The template is verified with Node.js `24.21.0` and npm `12.2.1`.
- npm. The repository keeps a single `package-lock.json`; in continuous integration, install from it with `npm ci`.

## Commands

The dev server runs at `http://localhost:5173` by default.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server. Markdown edits show at once; editing a `config.ts` restarts it |
| `npm run build` | Builds the static site into `docs/.vitepress/dist` |
| `npm run preview` | Previews the build locally |
| `npm run typecheck` | Checks the theme and the tests with `vue-tsc --noEmit` |
| `npm test` | Runs the Vitest unit tests |

## Making it your site

- The site name, version, social links and footer are in `docs/config.ts` and each language's `config.ts`; see [Configuration](/getting-started/configuration).
- The logo is `docs/public/logo.svg`.
- The language folders hold this site's docs. Keep the languages you need, delete the other folders, and write your own pages in the ones left; see [Writing pages](/getting-started/writing).

## Getting updates from the template

A repository created from the template has no link to it, so the template's later updates don't come in on their own. When you want them, add the template as a remote and take `docs/.vitepress`, where the theme lives:

```bash
git remote add template https://github.com/OasisAkari/vitepress-theme-akari-docs.git
git fetch template
git checkout template/main -- docs/.vitepress
```

This replaces the folder with the template's version, so changes you made to the theme have to be merged again. Compare the dependencies in `package.json` as well.

## Version baseline

| Dependency | Version | Notes |
| --- | --- | --- |
| `vitepress` | `2.0.0-alpha.21` | Pinned; built on Vite 8 / Rolldown and Vue 3.5 |
| `@m3e/web` | `2.10.3` | Material 3 Expressive Web Components |
| `@m3e/icons` | `1.0.21` | Material Symbols icons, registered on demand |

VitePress is still in alpha. When you upgrade it, check the theme code, the config types and the build output together.

## Folder layout

```text
.
├── docs/
│   ├── config.ts                  config shared by every language
│   ├── en-US/                     English, at the site root
│   │   ├── config.ts              overrides the shared config
│   │   ├── index.md               home page
│   │   └── getting-started/       rail category
│   │       └── installation/
│   │           └── index.md       article /getting-started/installation.html
│   ├── zh-CN/                     Simplified Chinese, under /zh-CN/
│   ├── public/                    static assets
│   └── .vitepress/
│       ├── config.mts             wires the theme into VitePress
│       ├── content/               languages, paths and navigation from the folders
│       └── theme/                 theme source
├── tests/                         unit tests
└── package.json
```

For where pages and config go, see [Configuration](/getting-started/configuration) and [Writing pages](/getting-started/writing). For the structure of the theme source, see [Extending the theme](/theme/extending/api#source-layout).

## Deployment

`npm run build` produces plain static files that any static host can serve.

- **Page paths**: this site turns `cleanUrls` off, so page paths end in `.html` (`/theme/layout.html`) and match the files in the build output one to one; any static host serves them as they are. For paths without the extension, set `cleanUrls: true` in `.vitepress/config.mts`. The host then needs to try again with `.html` added when a file is not found: GitHub Pages, Netlify and Cloudflare Pages do this by default; Vercel needs `"cleanUrls": true` in `vercel.json`; for Nginx, write `try_files $uri $uri.html $uri/ =404;`.
- **Under a subpath**: for example `https://example.com/docs/`, set `base: "/docs/"` in `.vitepress/config.mts`. Internal paths in the navigation, the hero, the logo and the search index get it added automatically.
- **Search index**: each language's index is bundled into `assets/chunks/` of the output at build time. No extra step is needed.

## FAQ

### Blank page, or components without styles

The theme registers the m3e components in the browser, and once they are registered it adds `data-akari-ready` to `html`. First check the browser console for module loading errors. When scripts are disabled or fail to load, the content shows as plain HTML after 3 seconds. The browser needs to support Custom Elements, Shadow DOM and native ES modules.

### Why components are registered only in the browser

m3e components are Lit custom elements. Registering them needs `customElements.define`, which Node.js does not have. The theme entry imports `m3e.ts` only in the browser, and server-side rendering outputs only the element tags and their slot content. Do not import `@m3e/web` component modules in code that runs on the server.

### A new component or icon does not show

Components and icons are both registered on demand. For a component, import its subpath in `docs/.vitepress/theme/m3e.ts` (do not import `@m3e/web/all`, which registers every component). For an icon, import it in `icons.ts`. An icon that is not registered shows as blank.

### The build reports an unknown Vue component

`.vitepress/config.mts` lets tags starting with `m3e-` through with `vue.template.compilerOptions.isCustomElement`. Keep this setting when you reuse the theme in another project.
