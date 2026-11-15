---
tab: API
---

# Navigation: API

The content below comes from the component metadata of `@m3e/web` 2.10.3.

## m3e-nav-menu and m3e-nav-menu-item

`m3e-nav-menu` has no attributes. Its default slot holds `m3e-nav-menu-item` elements.

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `open` | Boolean | `false` | Expands the child items |
| `selected` | Boolean | `false` | The current item; the component maps it to `aria-current` |
| `disabled` | Boolean | `false` | Disables this item and all its children |

| Slot | Content |
| --- | --- |
| (default) | Nested child items |
| `label` | Text, usually a link |
| `icon` | Icon |
| `selected-icon` | Icon when selected |
| `badge` | Badge |
| `toggle-icon` | Expand and collapse icon |

| Event | When |
| --- | --- |
| `opening`, `opened`, `closing`, `closed` | Expanding and collapsing start and finish |
| `click` | On click |

## m3e-tabs, m3e-tab and m3e-tab-panel

| `m3e-tabs` attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `variant` | `primary`, `secondary` | `secondary` | Appearance |
| `stretch` | Boolean | `false` | Tabs get equal widths and fill the container |
| `header-position` | `before`, `after` | `before` | Whether the tab bar comes before or after the panels |
| `disable-pagination` | Boolean | `false` | Hides the pagination buttons when tabs overflow |
| `disable-swipe` | Boolean | `false` | Turns off swiping on a panel to switch tabs |
| `previous-page-label`, `next-page-label` | String | `"Previous page"`, `"Next page"` | Accessible names of the pagination buttons |

| `m3e-tab` attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `for` | Panel id | None | The matching `m3e-tab-panel` |
| `selected` | Boolean | `false` | The current tab; only one is allowed |
| `disabled` | Boolean | `false` | Disabled |

Write `m3e-tab` and `m3e-tab-panel` directly inside `m3e-tabs`, as in the example in [Overview](/components/navigation#tabs). The `prev-icon` and `next-icon` slots replace the pagination icons. Switching tabs fires `beforeinput` (can be canceled), `input` and `change`. `m3e-tab` also has an `icon` slot.

## m3e-chip and m3e-filter-chip

| Attribute | Used by | Values | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | Both | `outlined`, `elevated` | `outlined` | Appearance |
| `value` | Both | String | None | Value |
| `selected` | Filter | Boolean | `false` | Selected |
| `disabled`, `disabled-interactive` | Filter | Boolean | `false` | Disabled |

Both have a default slot (text) plus `icon` and `trailing-icon` slots. `m3e-chip` is not interactive. `m3e-filter-chip` fires `beforeinput`, `input` and `change` when it toggles.

`m3e-filter-chip-set` wraps a group of filter chips: `multi` allows several selections, `vertical` stacks them vertically, `hide-selection-indicator` hides the selection mark, `disabled` disables the whole group, and `name` is for forms. It fires `change` when the selection changes.

## m3e-badge

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `size` | `small`, `medium`, `large` | `medium` | Size |
| `for` | Element id | None | Anchors the badge to this element |
| `position` | `above-after`, `above-before`, `below-before`, `below-after`, `before`, `after`, `above`, `below` | `above-after` | Position relative to the element when anchored |

A badge has no default ARIA role. When you attach one to an interactive element, describe the count with `aria-describedby` or with matching visible text.

The theme's `m3e.ts` registers the components (`@m3e/web/nav-menu`, `@m3e/web/tabs`, `@m3e/web/chips`, `@m3e/web/badge`).
