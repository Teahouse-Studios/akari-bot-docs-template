---
tab: API
---

# Cards: API

The content below comes from the component metadata of `@m3e/web` 2.10.3.

## m3e-card

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `variant` | `elevated`, `filled`, `outlined` | `filled` | Appearance |
| `orientation` | `vertical`, `horizontal` | `vertical` | Direction the content is laid out in |
| `inline` | Boolean | `false` | Lays the card out as an inline element |
| `actionable` | Boolean | `false` | Makes the whole card one interactive area |
| `href`, `target`, `rel`, `download` | Same as the button | Same as the button | Makes the card a link when `actionable` |
| `disabled`, `disabled-interactive` | Boolean | `false` | Disables the card when `actionable` |
| `type`, `name`, `value` | Same as the button | `button` | Behavior in a form when `actionable` |

| Slot | Content |
| --- | --- |
| (default) | No padding; suits full-bleed images or custom layouts |
| `header` | Title, icon or media, with no extra padding |
| `content` | Body, with padding |
| `actions` | Action buttons, aligned to the start edge by default; add the `end` attribute to the element to align them to the end edge |
| `footer` | Metadata, copyright or secondary notes |

| Event | When |
| --- | --- |
| `click` | An `actionable` card is clicked |

## m3e-dialog

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `open` | Boolean | `false` | Whether the dialog is open |
| `dismissible` | Boolean | `false` | Shows a close button |
| `disable-close` | Boolean | `false` | Prevents closing by clicking the scrim or pressing `Esc` |
| `alert` | Boolean | `false` | Acts as an alert dialog |
| `close-label` | String | `"Close"` | Accessible name of the close button |
| `no-focus-trap` | Boolean | `false` | Does not keep `Tab` focus inside the dialog |

| Slot | Content |
| --- | --- |
| (default) | Body |
| `header` | Title |
| `actions` | Action buttons |
| `close-icon` | Icon of the close button |

| Event | When |
| --- | --- |
| `opening`, `opened` | Opening starts, opening finishes |
| `closing`, `closed` | Closing starts, closing finishes |
| `cancel` | Canceled by the scrim or `Esc` |

`m3e-dialog-trigger` (attribute `for`: the dialog's id) goes inside a button and opens the dialog when the button is clicked. `m3e-dialog-action` (attribute `return-value`) goes inside a button in the dialog; clicking it closes the dialog and returns that value.

## Customizing the look

The `--m3e-card-*` variables control the card's corner radius, color and padding. For example, `--m3e-card-shape` is the corner radius:

```html
<m3e-card variant="outlined" style="--m3e-card-shape: 28px;">…</m3e-card>
```

The theme's `m3e.ts` registers the components (`@m3e/web/card`, `@m3e/web/dialog`).
