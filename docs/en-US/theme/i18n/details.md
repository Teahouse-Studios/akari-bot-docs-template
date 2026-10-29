---
tab: Details
---

# Internationalization: Details

## Which language a page belongs to

The path decides the language: a page whose path starts with `/<language folder>/` belongs to that language, and every other page belongs to the root language. In the source, the root language's pages sit in their own folder (`docs/en-US/`), and they are served without the folder name; see [Writing pages: Details](/getting-started/writing/details#path-rules).

The config a page ends up with is the `config.ts` of its language folder layered over the shared config and the VitePress locale config; see [Configuration: Details](/getting-started/configuration/details#how-the-two-levels-layer).

## Choosing a language pack

1. The packs to choose from are the six built-in ones (`zh`, `en`, `ja`, `ko`, `fr`, `ar`) plus those in `languages`; one with the code of a built-in pack is laid over it.
2. Take the current language's `lang`, lowercase it (with `_` turned into `-`), and look for a pack with exactly that code.
3. If there is none, compare the primary language: `zh-CN` and `zh-TW` both use Chinese, `en-GB` uses English, and `fr-CA` uses French.
4. If there is still none, use English.
5. Fill the gaps: missing interface strings are English, a pack without `fonts` uses the theme's fonts, and one without `dir` is left to right.
6. The `messages`, `fonts`, `dir` and `markdown` written in the language config are laid over the pack.

When `settings.title`, `settings.labels`, `toc.overline`, `footer.message` and `search.placeholder` are not set, they also come from this table, so one shared config has sensible defaults in every language. Strings written in the shared config are inherited by every language; strings that differ by language belong in the language config.

## Where language packs are used

- At build time, `akariContent` generates a VitePress locale for each language. `label` defaults to the language's own name from `Intl.DisplayNames`, with a capital first letter (such as `Français`); `dir` defaults to the pack's direction; `markdown` is the pack's Markdown strings with the language config's laid over them; and `head` holds the language's font tags. VitePress renders the code block copy button and container titles from the locale's `markdown`.
- In the page, the theme resolves the interface strings and fonts of the current language: the `messages` and `fonts` of `useAkariConfig()`.
- Parts of a page marked with a `lang` attribute (such as the language names in the language dialog) use that language's font stack. These rules are generated from every pack that has `fonts`; the stylesheets don't name any language.

## Where switching language goes

1. Move the current path into the target language: `/getting-started/installation.html` → `/zh-CN/getting-started/installation.html`, and remove the prefix in the other direction.
2. If the target language's navigation has this path, open it. The navigation includes every page of a parallel page group.
3. Otherwise, open the target language's home page: `/` for the root language, `/<language folder>/` for the others.

Only the target language's navigation counts, so a page that is not in the navigation (for example, a page outside the structure) is never a switching target.

## Language dialog

- The language button is a round outlined icon button (`m3e-icon-button variant="outlined"`). It is not rendered when there is only one language.
- The dialog uses the same container transform as the search panel: the button expands into a centered panel, the icon before the panel title is the button itself, and closing returns the panel the way it came.
- Each language takes two lines in the list: its `label` on the first, and below it its name in the current interface language, from `Intl.DisplayNames` (in an English interface, `zh-CN` shows as "Chinese (China)"). The current language is highlighted with a check icon. As with search results, only the list's first item has rounded top corners and its last rounded bottom corners.
- Clicking a language switches to it and closes the dialog, with SPA navigation. Clicking with `⌘`, `Ctrl` or another modifier key held opens it in a new tab.
- On open, focus is on the current language, and `Tab` moves between languages. `Esc`, clicking the scrim or the close button closes the dialog, and focus returns to the language button.
- On narrow screens, the button is at the bottom of the navigation drawer, and the dialog covers the drawer.

## Search scope

Each language has its own local index, and a search loads only the current language's, so results only ever come from the current language. HTTP and registered backends receive the current language's `lang` and `locale` and decide the scope themselves. The search panel's text and error messages follow the language.
