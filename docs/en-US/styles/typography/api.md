---
tab: API
---

# Typography: API

## Fonts by language

The text's fonts depend on the page's language. The defaults come from the `fonts` of the [language pack](/theme/i18n/api#akarilanguage); the built-in packs' are below, and [`fonts`](#fonts) can change all of them:

| Language | Loaded from Google Fonts | Font stack |
| --- | --- | --- |
| `ja` | Roboto, Noto Sans JP | Roboto, Noto Sans JP, Hiragino Sans, Hiragino Kaku Gothic ProN, Yu Gothic UI, Yu Gothic, Meiryo, system-ui, sans-serif |
| `ko` | Roboto, Noto Sans KR | Roboto, Noto Sans KR, Apple SD Gothic Neo, Malgun Gothic, system-ui, sans-serif |
| `ar` | Roboto, Noto Sans Arabic | Roboto, Noto Sans Arabic, Geeza Pro, Tahoma, system-ui, sans-serif |
| Others | Roboto, Noto Sans SC | Roboto, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif |

The language is matched by the language pack rules: first the full code, then the primary language, so `ja-JP` takes the `ja` row. Packs without `fonts`, such as English and French, take the "Others" row.

- These Google Fonts are all variable-weight fonts. Noto Sans SC and the Japanese and Korean fonts are split by Unicode range, so a page only downloads the characters it uses.
- Each language loads only its own fonts: the Japanese, Korean and Arabic fonts load only on that language's pages, and are downloaded when you switch to that language.
- Fonts don't block page display. `<head>` only holds preconnects and a `preload`; the theme's script inserts the stylesheet, and `display=swap` shows text in a fallback font first. Without scripts, the stylesheet in `<noscript>` applies. When Google Fonts can't be reached, text uses the system fonts further down the stack.
- Parts of a page marked as another language (such as the language names in the language dialog) use whatever fonts of that language pack's stack the device has.

## fonts

```ts
fonts?: {
  google?: boolean | string[];
  family?: string[];
};
```

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `google` | `boolean \| string[]` | `true` | Fonts loaded from Google Fonts. `false` loads none and uses only the fonts on the reader's device; `true` loads the language's fonts from the table above; an array lists the fonts to load, each written as the `family` parameter of the Google Fonts css2 API, for example `"Noto Sans JP:wght@100..900"` |
| `family` | `string[]` | The language's stack from the table above | The text's `font-family`, in order: each character uses the first font that has it. Write font names without quotes, and generic families such as `system-ui` and `sans-serif` as they are |

The two fields are independent: when you switch to other Google Fonts, also put them in `family`. In the shared config they apply to every language; in a language config, only to that language:

```ts
// docs/config.ts: no language loads fonts from Google Fonts
export default defineAkariConfig({
  fonts: { google: false },
});
```

```ts
// docs/ja-JP/config.ts: Japanese pages use M PLUS 1p
export default defineAkariConfig({
  fonts: {
    google: ["M PLUS 1p:wght@400;500;700"],
    family: ["M PLUS 1p", "Hiragino Sans", "Meiryo", "sans-serif"],
  },
});
```

To change a language's default fonts for every site, change the `fonts` of its language pack; for this site only, the `fonts` config is enough.

`akariContent` writes each language's font stack (the CSS variable `--akari-font-family`), the font rules for parts marked with `lang`, and preload tags into the `<head>` of its pages, from its language pack and config, so the first paint already uses the right fonts; when you switch language, the theme changes them. The code is in `docs/.vitepress/theme/fonts.ts`: `resolveFonts(fonts, defaults, languages)` works out the stylesheet URL and the `font-family` from the config and the pack's fonts, `markedFontRules(languages)` makes the font rules for marked parts, `fontHead` makes the `<head>` tags, and `applyFonts` applies them in the page. Packs without `fonts` use `AKARI_DEFAULT_FONTS`.

## Typography tokens

m3e provides the Material 3 typography tokens. Each step has four properties:

```text
--md-sys-typescale-{role}-{size}-font-size
--md-sys-typescale-{role}-{size}-line-height
--md-sys-typescale-{role}-{size}-font-weight
--md-sys-typescale-{role}-{size}-tracking
```

The roles are `display`, `headline`, `title`, `body` and `label`, and the sizes are `large`, `medium` and `small`. For example:

```css
.note {
  font-size: var(--md-sys-typescale-body-medium-font-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}
```

## Document headings

| Element | Size | Line height | Weight | Below 600px |
| --- | --- | --- | --- | --- |
| `h1` | 3.5625rem (57px) | 1.12 | 400 | 2.5rem |
| `h2` | 1.75rem (28px) | 1.3 | 500 | 1.5rem |
| `h3` | 1.5rem (24px) | 1.35 | 500 | 1.25rem |
| `h4` | 1.25rem (20px) | 1.4 | 500 | 1.125rem |

Second- and third-level headings are listed in the TOC. Hovering a heading shows its anchor link; VitePress generates the anchor id from the heading text.

## Tables

With `akariMarkdown` on, Markdown tables are wrapped in `.akari-table`:

- The frame is an `outline-variant` outline with 12px rounded corners. There are no vertical lines inside; dividers separate the rows.
- The header row sits on `surface-container` and uses `label-large` in the `on-surface-variant` color, without wrapping. Cells use `body-medium`.
- The row under the pointer shows a state layer. A table that is too wide scrolls sideways inside its frame instead of squeezing the document surface.
- A `<table>` written directly in HTML has no frame; the table itself has the same styles.

## Links

- No underline. The text is preceded by an icon as large as the text: `link` for links within the site, `open_in_new` for links with `target="_blank"`. The icons are drawn with a CSS mask and mirrored in right-to-left layouts.
- When the pointer hovers, a link shows the same state layer as a text button.
- Links without an icon: heading anchors (`.header-anchor`), footnote markers and back links, links that wrap images, and links placed in a component slot (with a `slot` attribute).
- In forced colors mode, links use the system link color.

## Patterns

Elements with a background in the article carry an almost invisible pattern, like the hero cards:

| Element | Selector |
| --- | --- |
| Code blocks | `div[class*="language-"]` |
| Code group tab strip | `.vp-code-group .tabs` |
| Tables | `.akari-table` |
| Callout blocks | `.custom-block` |
| Quotes | `blockquote` |
| Demo areas | `.demo-surface` |

- The whole page shares one pattern, set by the hero's `pattern`. By default, one is picked at random each time content loads: dots, grid, crosses, diagonal lines or waves. The pattern is written to the `data-pattern` attribute of the document surface; without a pattern, the attribute is absent.
- At rest, the pattern is only faintly visible in the element's top end corner. When the pointer rests on the element, a very faint glow in the theme color lights up around it. Inside the glow the pattern is a little clearer, and the edge fades out in steps. When the pointer leaves, the glow fades out.
- The decoration is drawn on `::before` (pattern) and `::after` (glow), below the content, so it doesn't get in the way of reading, selecting or clicking. The glow only appears while the reader points with a mouse or pen. The theme goes by the type of the actual pointer events rather than the browser's guess in the `(hover: hover)` media query, so a computer with a touch screen still gets the glow under its mouse; touch screens show only the static pattern, and a tap leaves no glow behind. With "reduce motion", the pattern and glow appear at once, without a transition. In forced colors mode, no decoration is shown.
- `--akari-pattern-glow` (default `4%`) and `--akari-pattern-spot` (default `0.1`) on `.akari-doc` control the strength.

## Code blocks

- Syntax highlighting uses the `github-light` and `github-dark` themes and switches with light and dark mode.
- The copy button is VitePress's `button.copy`. Its tooltip text comes from the language pack's `markdown.codeCopyButton`, and the language config can override it.
- Below 600px, the corner radius of code blocks shrinks to 12px.
