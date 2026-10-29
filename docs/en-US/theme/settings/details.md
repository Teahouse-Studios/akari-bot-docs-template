---
tab: Details
---

# Settings and appearance: Details

## Resolving light and dark mode

| Mode | Resolution |
| --- | --- |
| System `auto` | Reads `prefers-color-scheme`, and the page follows when the system switches. When the browser cannot give a system preference (it does not support this media query, or neither light nor dark matches), it is treated as Time of day |
| Light `light` | Light |
| Dark `dark` | Dark |
| Time of day `time` | Dark when local time is before 07:00 or after 18:59, light otherwise |

In Time of day mode, and in System mode when the browser cannot report a system preference, the theme reads the current time once a minute and switches automatically when it passes 7:00 or 19:00. Otherwise this timer does not run. The result (`light` or `dark`) is written to the `scheme` attribute of `m3e-theme` and to the `html.dark` class.

## Before the first frame

`akariHead()` adds a small inline script to `<head>`. It reads the mode saved in `localStorage`, resolves it as in the table above, and sets `html.dark` before the first frame is painted, so a dark page never flashes light first. The script uses the same `storageKey` and default mode as the theme, so when you change either one, pass the same value to `akariHead()`. The dev server does not prerender pages, so only in the build output does the script run before the first frame.

## Switch snackbar

Each press of the appearance button shows an `m3e-snackbar` at the bottom of the screen, which disappears after about 2.5 seconds. Pressing again replaces the old snackbar with a new one. The text comes from the UI strings `schemeChanged` ("Theme switched to: {mode}") and `schemeChangedFollowing` ("Theme switched to: {mode} ({scheme})"). See [Internationalization](/theme/i18n/api#messages).

## Where each option applies

Color, variant, light and dark mode, contrast and motion are bound to the `m3e-theme` at the root of the app:

```vue
<m3e-theme
  :color="heroColor ?? settings.color"
  :variant="settings.variant"
  :scheme="resolvedScheme"
  :contrast="settings.contrast"
  :motion="settings.motion"
  strong-focus
>
  <!-- app -->
</m3e-theme>
```

Text direction and text size do not go through component attributes. They are written to the document's root element:

```ts
document.documentElement.dir =
  settings.direction === "auto" ? dir : settings.direction;
document.documentElement.style.fontSize = settings.textSize;
```

- `auto` (Follow language) takes the `dir` of the current language (`useData().dir`, from the language config, or the language pack when the config doesn't set it) and changes with it when you switch to another language. A right-to-left language, such as Arabic, is therefore right to left by default.
- Switching the direction affects the bidirectional layout and icon direction of m3e components, and the page-switch animation of parallel pages mirrors with it.
- Switching the text size affects every size computed in `rem`: body text, headings, spacing, code blocks and the rest scale proportionally. The text size of m3e components is set by component tokens, so it does not simply double, but the layout stays usable.
- Layout syncs the palette that `m3e-theme` generates to the root element. `html` and `body`, the app bar, the navigation, the document surface, the table of contents and every dialog follow the seed color, variant, light and dark mode and contrast. There is no separate set of fixed colors.

## Reading, writing and fallback

- The server render outputs only the defaults. `localStorage` is read after the page mounts in the browser, to avoid a hydration mismatch. Light and dark mode is applied early by the script above.
- Settings are written to `localStorage` after every change. When the stored content is corrupted, a field is missing or a value is invalid, each field falls back to its default on its own.
- When reading or writing fails because of private browsing or a full quota, the error is silently ignored and the page works as usual.
- With `persist: false`, settings last only as long as the current page, and go back to the defaults on reload.
- Each browser, domain and port has its own `localStorage`. Settings do not sync across devices and are never written back to the repository.

## Settings dialog

The settings dialog uses the same M3 container transform as search and the language picker. The button expands into a centered panel, and the gear icon before the panel title is the button itself. Closing reverses the same path. With expressive motion, both expanding and collapsing have a slight bounce. `Escape`, a click on the scrim or the close button at the top right all close it, and focus returns to the button that opened it. For details of the motion, see [Search](/theme/search/details#container-transform). When the window is too short for all the options (a phone, a short window), the panel's content scrolls below its title, with a thin scrollbar.

- Color uses a native `<input type="color">`. Picking a color generates a new palette at once.
- Variant uses `m3e-filter-chip-set` (multi-select look, single-select behavior). Contrast, motion, direction and text size use `m3e-segmented-button`.
- The settings API provides `reset()`, but the interface has no "Reset to defaults" button, matching the official documentation.
