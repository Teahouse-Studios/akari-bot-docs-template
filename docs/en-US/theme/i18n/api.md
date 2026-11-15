---
tab: API
---

# Internationalization: API

## Language config

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `rootLanguage` | `string` | The first language folder in alphabetical order | Only valid in the shared config: the language served at the site root |
| `lang` | `string` | The language folder's name | Language code, used for `<html lang>` and to choose the language pack |
| `label` | `string` | The language's own name | Name in the language menu; `ja-JP`, for example, defaults to "日本語" |
| `dir` | `"ltr" \| "rtl" \| "auto"` | The language pack's | Text direction. Used when the text direction setting is Follow language |
| `markdown` | `MarkdownLocaleOptions` | The language pack's | This language's strings in Markdown, laid over the language pack's, such as `codeCopyButton: { tooltipText, copiedText }` |
| `messages` | `Partial<AkariMessages>` | None | Overrides or fills in interface strings |
| `languages` | `AkariLanguage[]` | None | Language packs besides the built-in ones, or changes to them; usually in the shared config |

The other fields (`title`, `description`, `appBar`, `footer`, `search` and so on) can also go in a language config; see [Configuration](/getting-started/configuration/api).

## AkariLanguage

The shape of a language pack, written with `defineAkariLanguage` (imported from `docs/.vitepress/theme/define.ts`):

| Field | Type | Description |
| --- | --- | --- |
| `code` | `string` | Required. The language code. A page first looks for a pack with its full code (`pt-BR`), then for one with its primary language (`pt`) |
| `dir` | `"ltr" \| "rtl"` | Text direction. Defaults to `"ltr"` |
| `fonts` | `{ google: string[]; family: string[] }` | Fonts; both fields are written as in [`fonts`](/styles/typography/api#fonts). Defaults to the theme's fonts (Roboto and Noto Sans SC) |
| `messages` | `Partial<AkariMessages>` | Interface strings. Missing entries are English |
| `markdown` | `MarkdownLocaleOptions` | Strings in Markdown: `codeCopyButton` is the code block copy button's tooltip, and `container` holds the containers' default titles (`tipLabel`, `warningLabel`, `dangerLabel`, `infoLabel`, `detailsLabel` and so on) |

The built-in packs are in `docs/.vitepress/theme/i18n/languages/`, one file per language, listed by the `index.ts` in the same folder. To give the theme itself another built-in language, add a file there and list it in `AKARI_LANGUAGES`.

## messages

The six built-in language packs, Simplified Chinese (`zh`), English (`en`), Japanese (`ja`), Korean (`ko`), French (`fr`) and Arabic (`ar`), all have every interface string. Entries you write in the language config's `messages` replace the pack's strings; entries you leave out keep the pack's. Entries with `{name}` get the matching value filled in at runtime.

### Navigation and app bar

| Key | English default |
| --- | --- |
| `navigationToggle` | Toggle navigation |
| `navigationLabel` | Documentation |
| `railLabel` | Documentation sections |
| `categoryNavigation` | {category} navigation |
| `categoryPages` | {category} pages |
| `homeLink` | {title} home |
| `moreActions` | More |
| `backToTop` | Back to top |
| `tocButton` | Contents |
| `languageLabel` | Change language |
| `languageDialogTitle` | Choose a language |
| `languageDialogClose` | Close |
| `loadingLabel` | Loading page |

### Table of contents, pager and footer

| Key | English default |
| --- | --- |
| `tocOverline` | On this page |
| `pagerLabel` | Pagination |
| `previousPage` | Previous |
| `nextPage` | Next |
| `footerMessage` | Built with VitePress and M3E |
| `footerLinks` | Footer |
| `notFoundTitle` | Page not found |
| `notFoundText` | The page you are looking for may have been moved or deleted. |
| `notFoundLink` | Back to home |

### Settings

| Key | English default |
| --- | --- |
| `settingsTitle` | Settings |
| `settingsClose` | Close settings |
| `settingsColor` | Color |
| `settingsVariant` | Variant |
| `settingsContrast` | Contrast |
| `settingsMotion` | Motion |
| `settingsDirection` | Text direction |
| `settingsTextSize` | Text size |
| `contrastStandard` | Default |
| `contrastMedium` | Medium |
| `contrastHigh` | High |
| `motionStandard` | Standard |
| `motionExpressive` | Expressive |
| `directionAuto` | Follow language |
| `directionLtr` | Left to right |
| `directionRtl` | Right to left |

### Appearance

| Key | English default |
| --- | --- |
| `schemeToggle` | Appearance: {mode} |
| `schemeLight` | Light |
| `schemeAuto` | System |
| `schemeDark` | Dark |
| `schemeTime` | Time of day |
| `schemeChanged` | Theme switched to: {mode} |
| `schemeChangedFollowing` | Theme switched to: {mode} ({scheme}) |

### Search

| Key | English default |
| --- | --- |
| `searchPlaceholder` | Search docs |
| `searchLabel` | Search documentation |
| `searchShortcutLabel` | {label}, shortcut {shortcut} |
| `searchClose` | Close search |
| `searchIntroTitle` | Search the docs |
| `searchIntroText` | Type a page title, a component name or words from the text. |
| `searchIntroShortcut` | Press {keys} to open it anytime |
| `searchLoading` | Searching… |
| `searchErrorTitle` | Search is unavailable |
| `searchRetry` | Retry |
| `searchEmptyTitle` | No results |
| `searchEmptyText` | Try a shorter keyword, or check the search backend configuration. |
| `searchResultCountOne` | {count} result |
| `searchResultCount` | {count} results |
| `searchResultsLabel` | Search results |
| `searchResultPage` | Page |
| `searchHintSelect` | Select |
| `searchHintOpen` | Open |
| `searchHintClose` | Close |
| `searchFailed` | Search failed. Please try again later. |
| `searchIndexUnavailable` | Couldn't load the local search index. |
| `searchIndexInvalid` | The local search index is not valid. |
| `searchRequestFailed` | The search request failed (HTTP {status}). |
| `searchBackendMissing` | No search backend is registered as "{id}". |

`searchResultCountOne` is used for counts whose plural category is `one` ("1 result" in English); other counts use `searchResultCount`. `Intl.PluralRules` decides the category for the language. `{keys}` is rendered as keycaps when shown.

## useAkariI18n

```ts
import { useAkariI18n } from "@theme";

const { lang, messages, t } = useAkariI18n();
t("homeLink", { title: "Vitepress Theme Akari Docs" }); // "Vitepress Theme Akari Docs home"
```

| Returns | Description |
| --- | --- |
| `lang` | Current language code |
| `messages` | All interface strings of the current language, with the `messages` config merged in |
| `t(key, params?)` | Gets one string and fills in its placeholders |

## useAkariLocales

```ts
import { useAkariLocales } from "@theme";

const { locales, homeHref } = useAkariLocales();
```

| Returns | Description |
| --- | --- |
| `locales` | List of languages, each `{ key, label, lang, href, current }`; `href` is the URL to open when switching to that language. An empty array when the site has only one language |
| `homeHref` | URL of the current language's home page, with `base` added |

Call both functions only in components inside the layout.

## Language pack functions

All are exported from the theme entry (`import { … } from "@theme"`) and can be called anywhere.

| Export | Description |
| --- | --- |
| `AKARI_LANGUAGES` | The built-in language packs |
| `resolveLanguage(lang, languages?)` | The pack a language ends up with: returns `{ code, dir, fonts, messages, markdown }`, with the gaps filled by the rules above. `languages` are the site's own packs |
| `defineAkariLanguage(language)` | Type helper for writing a language pack |

## Languages in search

A registered search backend receives `lang` (such as `zh-CN`) and `locale` (the VitePress locale key, `root` for the root language) in its second argument; see [Search](/theme/search/api#registered-backends).
