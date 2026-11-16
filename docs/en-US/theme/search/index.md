---
icon: search
order: 5
tab: Overview
parallel:
  - api
  - details
  - dock
---

# Search

Search sits on the right of the app bar. On wide screens it is a search box with placeholder text and a shortcut hint; on narrow screens it shrinks to a round button. Click it or press `⌘K` (`Ctrl K` on Windows and Linux), and the search box expands into the search panel.

## Usage

| Key | Action |
| --- | --- |
| `⌘K` / `Ctrl K` | Open search on any page |
| `↑` / `↓` | Move between results |
| `Enter` | Open the current result |
| `Esc` | Close search |

Results are listed by page and section, each with an excerpt of the match. Opening a result for a section scrolls to its heading. On a multilingual site, only pages of the current language are returned.

## Floating search

Put `<SearchDock>` where the search field should land. The tag only reserves a box; the real field leaves the app bar, measures that box, and stays there while the page is open.

```md
# Guide

<SearchDock variant="hero" align="center" placeholder="Search the guide" />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `placeholder` | `string` | `search.placeholder` | Placeholder shown while docked here |
| `variant` | `"bar" \| "pill" \| "icon" \| "hero"` | `"bar"` | Look of the field |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Where the icon, label, and shortcut sit |
| `width` | `string \| number` | Variant width | CSS length or pixel width of the reserved box |
| `height` | `string \| number` | Variant height | CSS length or pixel height of the reserved box |
| `fill` | `boolean` | `false` | Fill the parent box instead of the variant's natural size |
| `immersive` | `boolean` | `false` | Type and search inline in the dock instead of opening the dialog |
| `showShortcut` | `boolean` | `true` | Show the keyboard shortcut hint in the docked field |
| `background` | `string` | Variant surface | CSS color of the field surface |
| `borderColor` | `string` | Variant border | CSS color of the field border |
| `shadow` | `boolean` | `true` | Keep the elevation shadow; `false` removes it |
| `elevation` | `number` | Variant level | MD3 elevation level from 0 to 5; `0` removes the shadow |
| `priority` | `number` | `0` | Wins over other tags on the same page |

The tag is globally registered, so a page does not import it. Put it in the flow where the field belongs; the surrounding layout decides the exact spot.

Opening that page directly places the field in the box with no transition. Navigating in from another page flies it from the app bar or its previous dock; navigating to a page without a tag flies it home and fades it out. Changing a prop re-shapes or re-aligns the field in place. If a page has several tags, the highest `priority` wins and ties go to the first one rendered. Add `immersive` to type and see results in the field itself; the dialog stays closed.

While the field is docked, the app bar's title and docked tabs take over the slot it left behind; the slot eases open again as the field flies home. A tag only receives the field when its box has room: it must sit inside the page area and the viewport, clear of the app bar and the tab strip. Otherwise the field stays in the app bar, and flies in later when scrolling brings the tag into a clear area. Scrolling while the field is in flight moves it with the tag instead of leaving it behind and snapping at the end; if a tag becomes usable again while the field is flying home, the flight turns around from its current position instead of restarting. On the way home, the field morphs back to the app-bar surface, type and padding during the flight instead of switching when it lands. Flight and fade use the theme's MD3 motion tokens, so they follow the Standard/Expressive setting and honor `prefers-reduced-motion`.

See [the live demo](/theme/search/dock) and [API](/theme/search/api#searchdock) for every prop.

## Local index

By default you need no backend. The theme uses the index that VitePress' local search builds, one per language, downloaded only on the first search in that language. Pages are split into sections at their headings, and [MiniSearch](https://lucaong.github.io/minisearch/) does the matching: Chinese and Japanese are split into words, a word can be typed only partly, and longer words may have a typo or two. While the dev server runs, the index follows your edits.

## Using another search

When you need semantic search or content from outside the site, switch to an HTTP endpoint or a JS function of your own:

```ts
// docs/config.ts
search: {
  backend: { type: "http", endpoint: "/api/docs/search" },
},
```

See [API](/theme/search/api) for how to write a backend and the result format, and [Details](/theme/search/details) for the panel's motion and how the index is built and ranked.
