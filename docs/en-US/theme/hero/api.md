---
tab: API
---

# Hero: API

## hero

`hero` in the page frontmatter. Written as a string, it is the image URL.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `image` | `string \| { src, alt? } \| { light, dark, alt? }` | Required | Image URL; site paths get `base` added automatically, and external URLs are used as they are. Written as `{ light, dark }`, the two images are used in light and dark mode |
| `alt` | `string` | `""` | Alt text of the image; leave it empty for a purely decorative image |
| `date` | `string \| Date` | None | Shown above the title. A date such as `2026-05-19` is formatted for the page language and output as a tag such as `<time datetime="2026-05-19">`; any other text shows as written |
| `tagline` | `string` | The page's `description` | One-line summary below the title |
| `background` | `string` | `--md-sys-color-primary-container` | Background color of the image card; any CSS color or token |
| `fit` | `"cover" \| "contain"` | `"cover"` | `cover` fills the card and crops what does not fit; `contain` shows the whole image with a margin, suited to illustrations with a transparent background |
| `color` | `string \| false` | Taken from the image | Theme seed color of this page: `#rrggbb` fixes it to that color, `false` keeps the color the reader chose in settings |
| `pattern` | `"dots" \| "grid" \| "plus" \| "diagonal" \| "waves" \| "none" \| "auto"` | `"auto"` | Hidden pattern on the page: dots, grid, plus signs, diagonal lines, waves; `none` shows no pattern, `auto` picks one at random each time content loads |

`pattern` applies to the whole page: the hero cards and the elements with a background in the content use the same pattern. Pages without a hero also pick one at random.

```yaml
hero:
  image:
    light: /hero/theme-hero.svg
    dark: /hero/theme-hero-dark.svg
    alt: The docs theme's interface in a desktop window and on a phone
  date: 2026-10-28
  tagline: Put an image in the frontmatter
  fit: contain
  color: "#6750a4"
  pattern: dots
```

## CSS variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `--akari-doc-hero-inset` | `8px` | Distance between the cards and the surface edges, and between the two cards |
| `--akari-doc-hero-text-color` | `--md-sys-color-surface-container` | Background color of the text card |
| `--akari-doc-hero-media-color` | `--md-sys-color-primary-container` | Default background color of the image card; `background` takes precedence |
| `--akari-pattern-glow` | `4%` | Strength of the glow around the pointer |
| `--akari-pattern-spot` | `0.1` | How clearly the pattern shows inside the glow |

You can set the first three on `:root`. The two pattern variables are defined on the document surface `.akari-doc`, so override them on `.akari-doc` as well.

## Replacing the hero component

You can replace the hero with your own component; see [Extending the theme](/theme/extending/api#provideakaricomponents). The layout renders this component only when the page sets a `hero` with an image, and it hides the first `h1` of the content, so a custom component must render the page title itself. Give the title the `data-akari-page-title` attribute, and the app bar's title swap follows it. In the component, read the frontmatter with VitePress's `useData()`. The layout gives the component's root element the `akari-doc__page` class, so when you switch between the parallel pages of a group the hero slides sideways with the content; a component with several root nodes does not get the class, and its hero stays where it is.
