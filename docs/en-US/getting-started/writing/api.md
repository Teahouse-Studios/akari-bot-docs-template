---
tab: API
---

# Writing pages: API

## Frontmatter

| Field | Type | Used on | Description |
| --- | --- | --- | --- |
| `title` | `string` | All pages | Page title, also the article's name in the navigation. Defaults to the first h1 heading, then to the folder name |
| `description` | `string` | All pages | Page description, written to `<meta name="description">`; also the default summary of the hero |
| `icon` | `string` | Articles | Icon of the navigation item; must be a registered icon |
| `badge` | `string` | Articles | Badge of the navigation item, such as `New` |
| `order` | `number` | Articles | Position in the category, smaller first. Articles without `order` come after, sorted by folder name |
| `parallel` | `string[]` | Articles | Parallel pages: the file names of other `.md` files in the same folder (`.md` can be left out), placed after the article in tab bar order |
| `tab` | `string` | Articles and parallel pages | Title in the tab bar; defaults to the page title |
| `category` | `string` | Language home page | The home page is not in the navigation by default. Give it a category's folder name and it joins that category, first unless it has an `order` |
| `hero` | `string \| object` | All pages | The hero at the top of the page; for its fields see [Hero](/theme/hero/api) |
| `toc` | `boolean` | All pages | With `false`, hides the table of contents on the right and the TOC button on narrow screens |

An article is the `index.md` of a folder in a category folder. The frontmatter fields of VitePress itself (such as `head` and `titleTemplate`) work as usual.

```yaml
---
title: Icons
description: The Material Symbols icons the theme uses
icon: interests
order: 2
badge: New
tab: Overview
parallel:
  - choosing
  - using
hero:
  image: /hero/icons-hero.svg
  fit: contain
---
```

## Tables

Standard pipe syntax. With `akariMarkdown` on, each table is wrapped in a container with an M3 outlined border, and a table that is too wide scrolls horizontally inside the border.

```md
| Field | Description |
| --- | --- |
| `title` | Page title |
```

A `<table>` written directly in HTML has no outer container. The table itself is styled the same.

## Images

```md
![Description](./image.png)
![Description](/hero/image.svg)
![Description](https://example.com/image.png)
```

When a page renders, every Markdown image gets its own `width` and `height`. The page reserves the image's space before it loads, so nothing jumps once it loads. Images still scale with `max-width: 100%` and keep their aspect ratio.

| Image | Measured by |
| --- | --- |
| In the article folder (`./image.png`) | VitePress, which reads the image next to the source file |
| In `docs/public` (`/hero/image.svg`) | VitePress |
| Remote (`https://…`) | [markdown-it-image-size](https://github.com/boyum/markdown-it-image-size), added by the theme: it downloads the image when rendering the page to read its size, and caches it by URL for a week (`node_modules/markdown-it-image-size/.cache`) |

- A local image with only `width` or only `height` gets the other filled in to scale. An image with both is left as it is.
- When a remote image fails to download (offline, wrong URL), the terminal shows a notice, the image gets no width or height, and the page is generated as usual. The download is synchronous, so the dev server pauses briefly when it renders a page with a new remote image; after that, the cache answers directly.
- An `<img>` written directly in HTML is not measured. Write its width and height yourself.
- You can turn off measuring remote images, or adjust its cache, in `.vitepress/config.mts`; see [Configuration](/getting-started/configuration/api#akarimarkdown).

## Links

Links in the body have an icon in front, the same size as the text: `link` for internal links, and `open_in_new` for links that open in a new tab (`target="_blank"`, external links included). These links have no icon: heading anchors, links that wrap an image, footnote markers, and links placed in a component slot (with a `slot` attribute).

## Custom containers and code

VitePress custom containers and code groups all have matching theme styles:

````md
::: tip Tip
An optional note.
:::

::: warning
Something to watch out for.
:::

::: code-group

```bash [npm]
npm install
```

```bash [pnpm]
pnpm install
```

:::
````

The custom containers are `info`, `tip`, `warning`, `danger` and `details`. A code block with a language gets syntax highlighting and a copy button. The copy button's text and the titles of containers without one come from the language pack's `markdown`, and the language config can override them.

## Demo helper classes

| Class | Purpose |
| --- | --- |
| `demo-surface` | Demo area with an outline and a `surface-container-low` background, 16px corner radius and padding |
| `demo-row` | Horizontal row that wraps, 12px gap |
| `demo-grid` | Card grid, each column at least 240px, a single column on narrow screens |
| `demo-stack` | Vertical stack, 16px gap |

```html
<div class="demo-surface">
  <div class="demo-row">
    <m3e-button variant="filled">OK</m3e-button>
    <m3e-button variant="outlined">Cancel</m3e-button>
  </div>
</div>
```

## m3e components

You can write registered m3e components directly in Markdown. The theme registers these in `docs/.vitepress/theme/m3e.ts`:

`app-bar`, `badge`, `button`, `card`, `checkbox`, `chips`, `content-pane`, `dialog`, `divider`, `drawer-container`, `heading`, `icon`, `icon-button`, `list`, `loading-indicator`, `menu`, `nav-bar`, `nav-menu`, `nav-rail`, `search`, `segmented-button`, `snackbar`, `switch`, `tabs`, `theme`, `tooltip`.

To use another component, import its subpath in `m3e.ts`, for example `import "@m3e/web/slider";`.

- For a heading inside a component, use `<m3e-heading>`. With the `m3e-toc-ignore` attribute, it stays out of the table of contents.
- Write an icon as `<m3e-icon name="search"></m3e-icon>`. The icon must be registered in `icons.ts` first; see [Using icons](/styles/icons/using).
- A component with an `href` (a button, card, chip, list item and so on) that points to a page of the site switches pages in place like a plain link, without reloading the whole page. With `target="_self"` it loads the page in full, by VitePress's convention, and `target="_blank"` opens it in a new tab.
