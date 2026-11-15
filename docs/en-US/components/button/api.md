---
tab: API
---

# Buttons: API

The content below comes from the component metadata of `@m3e/web` 2.10.3.

## m3e-button

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `variant` | `elevated`, `filled`, `tonal`, `outlined`, `text` | `text` | Appearance |
| `size` | `extra-small`, `small`, `medium`, `large`, `extra-large` | `small` | Size |
| `shape` | `rounded`, `square` | `rounded` | Shape |
| `disabled` | Boolean | `false` | Disabled and not focusable |
| `disabled-interactive` | Boolean | `false` | Disabled but still focusable, so readers can discover the action |
| `toggle` | Boolean | `false` | Acts as a two-state toggle |
| `selected` | Boolean | `false` | Selected state of the toggle |
| `href` | String | `""` | Makes the button a link when set |
| `target` | `_self`, `_blank`, `_parent`, `_top` or a window name | `""` | Where the link opens |
| `rel` | String | `""` | Relationship between the link and the current page |
| `download` | String | None | Makes it a download link; the value is the file name |
| `type` | `button`, `submit`, `reset` | `button` | Behavior in a form |
| `name`, `value` | String | None | Name and value sent when the form is submitted |

| Slot | Content |
| --- | --- |
| (default) | Button text |
| `icon` | Icon before the text |
| `trailing-icon` | Icon after the text |
| `selected` | Text when selected |
| `selected-icon` | Icon when selected |

| Event | When |
| --- | --- |
| `click` | On click |
| `beforeinput` | The toggle is about to switch; can be canceled |
| `input`, `change` | The toggle has switched |

## m3e-icon-button

Same attributes as `m3e-button`, plus:

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `variant` | `standard`, `filled`, `tonal`, `outlined`, `elevated` | `standard` | Appearance |
| `width` | `default`, `narrow`, `wide` | `default` | Width |

| Slot | Content |
| --- | --- |
| (default) | Icon |
| `selected` | Icon when selected |

Events are the same as for `m3e-button`.

## m3e-tooltip

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `for` | Element id | None | The control the tooltip belongs to |
| `position` | `above`, `below`, `before`, `after` | `below` | Position relative to the control |
| `show-delay` | Milliseconds | `0` | Delay before showing |
| `hide-delay` | Milliseconds | `200` | Delay before hiding |
| `touch-gestures` | `auto`, `on`, `off` | `auto` | How touch gestures are handled |
| `disabled` | Boolean | `false` | Disables the tooltip |

## Using buttons in docs

- An internal `m3e-button` with `href` is taken over by the theme and switches pages in place; `target="_self"` loads the full page. When you need to navigate from script, call `useRouter().go()`. See [Navigation](/components/navigation#spa-navigation).
- Whatever its visual size, a button keeps a touch target of at least 48×48dp.
- The theme's `m3e.ts` registers the components (`@m3e/web/button`, `@m3e/web/icon-button`, `@m3e/web/tooltip`).
