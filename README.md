English | [简体中文](README.zh-CN.md)

# Vitepress Theme Akari Docs

A Material You / Expressive stylized documentation theme for vitepress, built with VitePress and [`@m3e/web`](https://github.com/matraic/m3e) Material 3 Expressive Web Components. Compared with [Vitepress Theme Akari Blog](https://github.com/OasisAkari/vitepress-theme-akari-blog), its layout is optimized for technical documentation.

## Showcase

![](./imgs/overview.png)

![](./imgs/overview-dark.png)

## Requirements

- Node.js >= 22.12
- npm

## Development

```bash
npm install
npm run dev
```

The default development address is `http://localhost:5173`.

## Build and checks

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

The production output is in `docs/.vitepress/dist`.

## Configuration docs

For more configuration documentation for this theme, see [here](https://vitepress-theme-akari-docs.vercel.app/).

## Q&A

### Wow, a new theme!

Yay!

### Wait, why named it Akari again, not MD3 docs??

Well you know I am just a complete idiot at naming things so...

But however I added "docs" suffix at the end of the name to distinguish from [the Blog style theme](https://github.com/OasisAkari/vitepress-theme-akari-blog), so that. 

### Why not just call it "vitepress-theme-akari-2"?

Just as I said above, it is optimized for technical documentation, not suitable for personal blog. You may think this theme just looks better than old ones, but I plan to redesign the styling in the future--stay tuned!

### What else you want to say?

I dunno at this point, so that's all.
## Using with the AkariBot docs engine

The theme is consumed as a source checkout. `docs-theme.json` at the repository root is the contract:
it names the theme directory, the VitePress and Node versions, the npm dependencies, and the generated
config options. The engine copies `theme_dir` into the generated site and never imports the theme code.

Set the theme in the instance's `docs.toml`:

```toml
[theme]
source = "file:/path/to/akari-bot-docs-template"
```

The following components are registered globally and are available to every Markdown page:

- `ModuleMeta` — module name, aliases, capabilities, permission and platform badges.
- `NoticeBox` — tinted notice with `info`, `tip`, `warning`, `danger`, `example` or `help`.
- `CommandUsage` — command usage, permission badge and options table.

They are styled with the M3E color tokens, so their surfaces follow the reader's seed color, light/dark
scheme and contrast setting.
