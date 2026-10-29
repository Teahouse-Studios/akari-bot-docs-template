---
tab: Details
---

# Search: Details

## Container transform

The search panel is a native modal `<dialog>`. It expands with an M3 container transform built on the Web Animations API. The language picker and the settings dialog use the same implementation (`useContainerTransform`).

- What animates is always the real panel, laid out at its final size from the first frame. At the start, a window shaped like the button (a `clip-path` capsule) shows only the start of the panel's own search bar, and a translation places that window over the button. The first frame therefore still looks like the "icon + placeholder" search box.
- As it expands, the translation returns to zero and the window grows to the whole panel (shadow included). The content is revealed step by step, the results area and the close button fade in together, and no blank surface appears midway. The end state of the animation is the panel's resting style, so removing the animation causes no jump.
- A pixel copy of the button sits on the window and moves with it. The button's and the panel's content do not cross-fade; one fades out before the other fades in (M3 fade through). On open, the panel surface first fades in under the copy, the copy then fades out, and then the panel's own search bar fades in. Text in two different sizes never shows at once.
- On close, it returns the way it came: the results area and the search bar fade out first, the button copy fades in midway to take over, and the panel surface then fades out beneath it. In the last stretch back into the button, including the bounce of expressive motion, what you see is the button itself, and it ends exactly like the real button. A button without a background (such as the gear button) therefore does not flash a patch of background at the end. If opening or closing is interrupted, the motion reverses from the current frame.
- The window's size and corner radius come from the button's current position and size. The panel's position is measured again when the animation starts; nothing depends on fixed coordinates.

| Motion | Expand | Collapse |
| --- | --- | --- |
| Standard | About 300ms, `cubic-bezier(0.2, 0, 0, 1)` | About 250ms, no bounce |
| Expressive | About 500ms, `cubic-bezier(0.38, 1.21, 0.22, 1)`, overshoots slightly and settles | About 400ms, same curve, with a slight bounce on collapse |

When the system's "reduce motion" setting is on, the panel opens and closes without animation. The native dialog provides top-layer display, an inert background and closing with `Esc`. On open, focus moves into the input; on close, it returns to where it was before opening, or to the search button when that element is no longer available.

## Building the index

- VitePress' local search builds the index: it renders each page with the site's Markdown renderer, splits it into sections at the headings that have anchors, and builds one index per language, each bundled into one file at build time. While the dev server runs, the index is updated as pages change and pushed to the browser.
- Paths and anchors come from the rendered pages, so they match the pages' real paths and heading ids, including rewritten paths and `{#anchor}` headings.
- The body text is the rendered HTML without tags, code blocks included, so names in code can be searched too. Pages with `search: false` in their frontmatter are left out.
- Chinese and Japanese have no spaces, so they are split into words with `Intl.Segmenter`. The theme splits queries the same way (`tokenizeSearchText`), so queries and the index meet on the same words.

## Matching and ranking

The query is split into words the same way as the index, and MiniSearch matches them:

- A word matches as typed, or as the start of a longer word. Longer words may be misspelled, by an edit distance of up to 20% of their length.
- Every word has to match. When no section has them all, sections with any of them are accepted instead.
- Relevance is BM25, with a weight of 4 for the section heading, 2 for the body text and 1 for the headings above.

The results are then ranked in tiers by the query as typed, where "heading" is the section's own heading:

| Tier | Condition |
| --- | --- |
| 4 | The heading is exactly the whole query |
| 3 | The heading starts with the whole query |
| 2 | The heading contains the whole query |
| 1 | The headings above or the body text contain the whole query word for word, such as a Chinese phrase |
| 0 | Anything else |

Higher tiers come first. In tiers 4 and 3, a page comes before its sections. Within a tier, results follow MiniSearch's relevance, then their heading. Only one result per URL is kept, and at most `maxResults` are returned. Each result carries the words that matched (`terms`), including ones typed only partly or misspelled, and the panel highlights them.

Each language has its own index, so results only ever come from the current language.

## Loading and caching

- Each language's index loads on the first search in that language and is then cached in the page. In development, the cache is cleared when the index is updated.
- Input is debounced by `debounce`. When a new query is typed or the panel closes, the request in progress is aborted through `AbortSignal`.
- If the index fails to load or is malformed, the panel shows an error and a retry button.

## Panel states

| State | Shows |
| --- | --- |
| Empty input | Search hint and shortcut help |
| Loading | M3 loading indicator |
| Results | Page title, section heading, excerpt and highlighted matches; the current item has a `secondary-container` background. The list reads as one block: only the first item's top and the last item's bottom corners are rounded, the items between are square |
| No results | A suggestion to try another keyword |
| Failed | The cause of the error and a retry button |

Opening a result goes through the VitePress router, keeping SPA navigation. The input, the result list and the error message each have an ARIA name. The shortcut hint in the app bar uses the `label-small` type style and fully rounded keycaps; the arrow-key, `Enter` and `Esc` hints in the panel use `shape-extra-small` corners.

## Known limitations

- The local search matches words, with no semantic search or synonyms. When you need them, use an HTTP or registered backend. Splitting Chinese and Japanese into words depends on the browser's `Intl.Segmenter`; browsers without it can only split at spaces and punctuation.
- The local index is built only while the dev server runs or during a build. Markdown you edit while the dev server is not running becomes searchable after the next `npm run dev` or `npm run build`.
