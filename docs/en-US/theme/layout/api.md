---
tab: API
---

# Layout and app bar: API

## appBar

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | Site `title` | Site name in the app bar |
| `version` | `string` | None | Version label next to the name, such as `v1.0.0` |
| `logo` | `string` | The config's `logo` | Brand image; site paths get `base` added automatically |
| `showSidebarToggle` | `boolean` | `true` | Whether to show the menu button that opens the navigation drawer on narrow screens |
| `showSettingsToggle` | `boolean` | `true` | Whether to show the settings button; always hidden when `settings.enabled` is `false` |
| `socialLinks` | `AkariSocialLink[]` | `[]` | Social links, opened in a new tab |

Fields of `AkariSocialLink`:

| Field | Type | Description |
| --- | --- | --- |
| `icon` | `string` | `github` and `npm` show built-in brand marks; any other value is used as the name of a registered m3e icon |
| `link` | `string` | URL |
| `label` | `string` | Accessible name and tooltip text of the button, and also its text in the "More" menu |

## toc

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Whether to show the table of contents (the TOC on the right and the TOC button on narrow screens) |
| `maxDepth` | `number` | `3` | Lists `h2` through `h{maxDepth}`; clamped to 1–6 |
| `overline` | `string` | Per language; "On this page" | Small heading at the top of the TOC, and the accessible name of the TOC navigation |

To turn off the table of contents on a single page, write `toc: false` in its frontmatter. Headings with the `m3e-toc-ignore` attribute are left out of the table of contents.

## loadingBar

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Whether a progress bar shows at the top of the window while a page loads |

## footer

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `message` | `string` | Per language | Text below the logo and site name in the footer |
| `copyright` | `string` | `""` | Copyright notice at the bottom of the footer; not shown when empty |
| `showPrevNext` | `boolean` | `true` | Whether to show the previous and next page cards of the group at the end of parallel pages |
| `links` | `AkariFooterLinkGroup[] \| false` | From the navigation | Link columns of the footer; by default the first four categories of the navigation, with at most six items per column; `false` hides them |

```ts
footer: {
  links: [
    {
      title: "Resources",
      items: [
        { text: "GitHub", link: "https://github.com/OasisAkari/vitepress-theme-akari-docs" },
        { text: "Changelog", link: "/changelog" },
      ],
    },
  ],
},
```

External links open in a new tab. A group of parallel pages becomes a single item in the link columns.

## CSS variables

Override them in your site styles, for example on `:root`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `--akari-doc-radius` | `28px` | Corner radius of the document surface and the footer surface |
| `--akari-doc-padding` | `32px` | Padding of the surfaces, and the gap between the content and the TOC |
| `--akari-doc-top-space` | `32px` | Distance between the document surface and the app bar |
| `--akari-doc-max-width` | `1280px` | Maximum width of the content and TOC inside the surface; the footer content uses the same width |
| `--akari-doc-text-measure` | `760px` | Maximum line length of paragraphs, lists, blockquotes and callouts |
| `--akari-doc-text-offset` | `22px` | How far paragraphs are indented relative to headings |
| `--akari-doc-toc-offset` | `128px` | How far below the app bar the TOC sticks |
| `--akari-toc-width` | `208px` | Width of the TOC |
| `--akari-doc-gap` | `16px` | Distance between a heading and the app bar after an anchor jump |
| `--akari-doc-surface-color` | `--md-sys-color-surface` | Background color of the document surface and the footer surface; set it inside `m3e-theme` (for example on `.akari-main`) so the color tokens resolve |
| `--akari-doc-divider-strength` | `30%` | Strength of the rail divider and of the surface outline after scrolling |
| `--akari-wavy-divider-color` | `--md-sys-color-outline-variant` | Color of the wavy divider above the footer |
| `--akari-doc-app-bar-height` | `64px` | Height of the app bar; read-only, used to work out sticky positions |
| `--akari-doc-rail-width` | `96px` | Width of the rail; read-only |
| `--akari-loading-bar-height` | `4px` | Height of the loading bar |
| `--akari-loading-bar-color` | `--md-sys-color-primary` | Color of the loading bar |

```css
:root {
  --akari-doc-radius: 24px;
  --akari-doc-max-width: 1440px;
}

.akari-main {
  --akari-doc-surface-color: var(--md-sys-color-surface-container-lowest);
}
```

## Page state

| Marker | Where | Meaning |
| --- | --- | --- |
| `data-akari-ready` | `html` | The m3e components have finished registering |
| `data-akari-scrolled` | `html` | The document surface has scrolled under the app bar |
| `akari-tabs-pinned` | Class name on `html` | The tab bar of parallel pages is held below the app bar |
| `data-akari-page-title` | Element | The page title that the app bar title swap follows; by default the `h1` of the content or the title in the hero |

| Element id | Content |
| --- | --- |
| `akari-doc-content` | Content container, which the TOC reads its headings from; the exported `AKARI_CONTENT_ID` |
| `akari-sidebar` | Mobile navigation drawer; `AKARI_SIDEBAR_ID` |
| `akari-settings` | Settings panel; `AKARI_SETTINGS_ID` |

## Replacing components

You can replace the app bar, the desktop navigation, the mobile drawer, the hero, the TOC, the pager cards, the footer and the content container; see [Extending the theme](/theme/extending/api#provideakaricomponents).
