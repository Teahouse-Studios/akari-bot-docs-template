---
tab: API
---

# Search: API

## search

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Whether to show the search entry and register the shortcut |
| `placeholder` | `string` | Per language, "Search docs" | Placeholder text of the search box |
| `shortcut` | `string` | `"k"` | Key combined with `⌘` / `Ctrl`; an empty string turns the shortcut off |
| `maxResults` | `number` | `8` | Maximum number of results, clamped between 1 and 20 |
| `debounce` | `number` | `180` | Input debounce in milliseconds, clamped between 0 and 1000 |
| `backend` | `AkariSearchBackendConfig` | Local index | `local`, `http` or `registered` |

`search` can go in a language config, to give each language its own backend.

## SearchDock

`<SearchDock>` is registered globally by the theme. Put it in a page where the search field should land; no import is needed. It renders a reserved box, and the fixed copy of the app-bar trigger flies over it and takes on its props.

```md
<SearchDock variant="hero" align="center" placeholder="Search the guide" />
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `placeholder` | `string` | `search.placeholder` | Placeholder while docked here |
| `variant` | `"bar" \| "pill" \| "icon" \| "hero"` | `"bar"` | Look of the field |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Alignment of the icon, label, and shortcut inside the field |
| `width` | `string \| number` | Variant width | CSS length or pixel width of the reserved box |
| `height` | `string \| number` | Variant height | CSS length or pixel height of the reserved box |
| `fill` | `boolean` | `false` | Fill the parent box instead of the variant's natural size |
| `priority` | `number` | `0` | Wins over other tags on the same page |

`bar` is the app-bar field, `pill` a tonal field, `icon` a round FAB, and `hero` a large tonal field. `width` and `height` accept a CSS length (`"20rem"`, `"min(100%, 30rem)"`) or a pixel number; without them the variant's natural box is used. Add `fill` to take the parent box instead (`width: 100%; height: 100%`); the parent needs a definite width and height, and explicit `width` / `height` still override either axis.

The tag also takes the default slot, laid out inside the reserved box behind the field. It is marked `aria-hidden`; the field itself is the button that opens search.

Several tags may exist on one page. The highest `priority` wins, ties go to the first registered, and tags with a zero-sized or hidden box are skipped. A tag also has to sit fully inside the page area and viewport, clear of the app bar and tab strip; otherwise the field stays in the app bar until scrolling gives the tag room. Leave one tag on a page: when the page unmounts, the field flies home and fades out; moving between pages with tags animates between their boxes. A direct first load snaps into place without a transition. All timing comes from the theme's MD3 spring tokens, so it follows the Standard/Expressive setting and `prefers-reduced-motion`.

`<AkariSearchDock>` is an alias for the same component.

## Local backend

```ts
backend: { type: "local" },
```

It uses the index that VitePress' local search (`provider: "local"`) builds: one per language, loaded by VitePress locale key (`root` for the root language). When any language uses the local backend, `akariContent` turns it on in the site config and has the index keep each section's text, for the excerpts in the results:

```ts
// The site config akariContent generates
themeConfig: {
  search: {
    provider: "local",
    options: { miniSearch: { options: { storeFields: ["title", "titles", "text"] } } },
  },
},
```

Each section is one document in the index: `id` is the page path plus the heading's anchor, `title` is the section's heading, `titles` are the headings above it (the page title first), and `text` is its body text without tags. The section under the page's level-1 heading stands for the page itself, and its result links to the top of the page.

If `.vitepress/config.mts` sets no `themeConfig`, `...content.site` brings this setting along; if it does, merge `content.site.themeConfig` into it.

## HTTP backend

```ts
backend: {
  type: "http",
  endpoint: "/api/docs/search",
  method: "POST",
  headers: { Authorization: "Bearer YOUR_TOKEN" },
  credentials: "include",
  queryParam: "q",
  limitParam: "limit",
},
```

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `endpoint` | `string` | Required | Endpoint URL; relative paths get `base` added, absolute URLs stay as they are |
| `method` | `"GET" \| "POST"` | `"GET"` | `GET` puts the query in query parameters; `POST` sends JSON: `{ "q": "keyword", "limit": 8 }` |
| `headers` | `Record<string, string>` | `{}` | Request headers |
| `credentials` | `RequestCredentials` | `"same-origin"` | Whether to send cookies |
| `queryParam` | `string` | `"q"` | Parameter name of the query |
| `limitParam` | `string` | `"limit"` | Parameter name of the result limit |

The response can be an array of results or `{ "results": [...] }`. The theme reads these fields from each result: `title`; `href` (or `url`, `path`); `pageTitle`; `heading`; `excerpt` (or `content`, `snippet`, `description`); `id`.

```json
{
  "results": [
    {
      "id": "button-variants",
      "title": "Variants",
      "pageTitle": "Buttons",
      "heading": "Variants",
      "href": "/components/button.html#variants",
      "excerpt": "Five styles express emphasis from high to low…"
    }
  ]
}
```

A non-2xx response, a network error or a response with an invalid structure shows an error and a retry button.

## Registered backends

Register a function in the theme entry, then refer to its id in the config:

```ts
// docs/.vitepress/theme/index.ts
import { registerSearchBackend } from "./search/registry";

registerSearchBackend("my-search", async (query, { limit, signal, lang }) => {
  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&lang=${lang}`,
    { signal },
  );
  if (!response.ok) throw new Error("Search failed");
  const data = await response.json();
  return data.results.slice(0, limit);
});
```

```ts
// docs/config.ts
search: { backend: { type: "registered", id: "my-search" } },
```

```ts
function registerSearchBackend(id: string, handler: AkariSearchHandler): void;

type AkariSearchHandler = (
  query: string,
  context: AkariSearchContext,
) => AkariSearchResult[] | Promise<AkariSearchResult[]>;

interface AkariSearchContext {
  limit: number;
  signal?: AbortSignal;   // aborted when a new query is typed or the panel closes
  lang?: string;          // current language, e.g. "zh-CN"
  locale?: string;        // VitePress locale key, "root" for the root language
}
```

If the config refers to an id that is not registered, the panel shows a clear error.

## AkariSearchResult

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique identifier |
| `title` | `string` | Title of the result |
| `href` | `string` | URL; internal URLs use SPA navigation, external URLs open in a new tab |
| `pageTitle` | `string` | Title of the page it belongs to, shown above the result |
| `heading` | `string` | Section it belongs to |
| `excerpt` | `string` | Excerpt; matched words are highlighted |

All text renders as plain text.

## useAkariSearch

```ts
import { useAkariSearch } from "@theme";

const { isOpen, query, results, loading, error, openSearch, closeSearch } =
  useAkariSearch();
```

For a search entry of your own: `openSearch()` opens the panel, and `query`, `results`, `loading` and `error` are the panel's state. Call it only in components inside the layout.
