---
icon: radio_button_checked
order: 1
tab: Overview
parallel:
  - api
---

# Buttons

`m3e-button` triggers an action. `m3e-icon-button` is a compact button with only an icon. Both support variants, sizes, shapes, disabled states, links and selection.

## Variants

The five variants express different levels of emphasis:

<div class="demo-row">
  <m3e-button variant="elevated">Elevated</m3e-button>
  <m3e-button variant="filled">Filled</m3e-button>
  <m3e-button variant="tonal">Tonal</m3e-button>
  <m3e-button variant="outlined">Outlined</m3e-button>
  <m3e-button variant="text">Text</m3e-button>
</div>

```html
<m3e-button variant="elevated">Elevated</m3e-button>
<m3e-button variant="filled">Filled</m3e-button>
<m3e-button variant="tonal">Tonal</m3e-button>
<m3e-button variant="outlined">Outlined</m3e-button>
<m3e-button variant="text">Text</m3e-button>
```

- `filled`: the most important action on the page. Usually only one appears in an area.
- `tonal`: a secondary action, softer than `filled`.
- `outlined`: an action that needs a clear boundary but not high emphasis.
- `text`: a low-emphasis action in a toolbar or card footer.
- `elevated`: a main action that needs to look lifted. It pairs well with cards or surfaces.

## Size and shape

Sizes run from `extra-small` to `extra-large`. The default is `small`:

<div class="demo-row">
  <m3e-button variant="tonal" size="extra-small">Extra Small</m3e-button>
  <m3e-button variant="tonal" size="small">Small</m3e-button>
  <m3e-button variant="tonal" size="medium">Medium</m3e-button>
  <m3e-button variant="tonal" size="large">Large</m3e-button>
  <m3e-button variant="tonal" size="extra-large">Extra Large</m3e-button>
</div>

```html
<m3e-button variant="tonal" size="extra-small">Extra Small</m3e-button>
<m3e-button variant="tonal" size="small">Small</m3e-button>
<m3e-button variant="tonal" size="medium">Medium</m3e-button>
<m3e-button variant="tonal" size="large">Large</m3e-button>
<m3e-button variant="tonal" size="extra-large">Extra Large</m3e-button>
```

The default shape is `rounded`. Set `shape="square"` to make it square:

<div class="demo-row">
  <m3e-button variant="filled" shape="square">Square Filled</m3e-button>
  <m3e-button variant="outlined" shape="square">Square Outlined</m3e-button>
  <m3e-button variant="text" shape="square">Square Text</m3e-button>
</div>

```html
<m3e-button variant="filled" shape="square">Square Filled</m3e-button>
<m3e-button variant="outlined" shape="square">Square Outlined</m3e-button>
<m3e-button variant="text" shape="square">Square Text</m3e-button>
```

Whatever its visual size, a button keeps a touch target of at least 48×48dp.

## Icons

The `icon` slot sits before the text, and the `trailing-icon` slot sits after it:

<div class="demo-row">
  <m3e-button variant="filled">
    <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
    Start building
  </m3e-button>
  <m3e-button variant="tonal">
    Copy config
    <m3e-icon slot="trailing-icon" name="content_copy"></m3e-icon>
  </m3e-button>
  <m3e-button variant="outlined">
    Next
    <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
  </m3e-button>
</div>

```html
<m3e-button variant="filled">
  <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
  Start building
</m3e-button>
<m3e-button variant="tonal">
  Copy config
  <m3e-icon slot="trailing-icon" name="content_copy"></m3e-icon>
</m3e-button>
<m3e-button variant="outlined">
  Next
  <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
</m3e-button>
```

Icons are hidden from assistive technology by default, and the button's accessible name comes from its visible text. A button with only an icon must have an `aria-label`.

## Icon buttons

Icon buttons come in five variants: `standard`, `filled`, `tonal`, `outlined` and `elevated`. They have no text, so use a tooltip to say what they do:

<div class="demo-row">
  <m3e-icon-button id="button-demo-back" aria-label="Back">
    <m3e-icon name="arrow_back"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-back">Back</m3e-tooltip>

  <m3e-icon-button id="button-demo-settings" aria-label="Settings" variant="tonal">
    <m3e-icon name="settings"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-settings">Settings</m3e-tooltip>

  <m3e-icon-button id="button-demo-close" aria-label="Close" variant="outlined">
    <m3e-icon name="close"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-close">Close</m3e-tooltip>

  <m3e-icon-button id="button-demo-confirm" aria-label="Confirm" variant="filled">
    <m3e-icon name="check"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-confirm">Confirm</m3e-tooltip>
</div>

```html
<m3e-icon-button id="button-demo-settings" aria-label="Settings" variant="tonal">
  <m3e-icon name="settings"></m3e-icon>
</m3e-icon-button>
<m3e-tooltip for="button-demo-settings">Settings</m3e-tooltip>
```

Each tooltip's `for` points to a unique `id`. Duplicate `id`s on one page make a tooltip show up in the wrong place or work only for the first element.

## Disabled and link buttons

By default, a disabled button cannot take keyboard focus. `disabled-interactive` keeps it focusable, so users can still discover the action:

<div class="demo-row">
  <m3e-button variant="filled" disabled>Disabled</m3e-button>
  <m3e-button variant="filled" disabled-interactive>Disabled but focusable</m3e-button>
  <m3e-button variant="tonal" href="https://m3.material.io/" target="_blank" rel="noreferrer">
    Open Material 3
    <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
  </m3e-button>
  <m3e-button variant="outlined" href="/components/card.html">
    View cards
    <m3e-icon slot="trailing-icon" name="chevron_right"></m3e-icon>
  </m3e-button>
</div>

```html
<m3e-button variant="filled" disabled>Disabled</m3e-button>
<m3e-button variant="filled" disabled-interactive>Disabled but focusable</m3e-button>
<m3e-button
  variant="tonal"
  href="https://m3.material.io/"
  target="_blank"
  rel="noreferrer"
>
  Open Material 3
  <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
</m3e-button>
<m3e-button variant="outlined" href="/components/card.html">
  View cards
  <m3e-icon slot="trailing-icon" name="chevron_right"></m3e-icon>
</m3e-button>
```

With `href` set, the button renders with link semantics and supports `target`, `rel` and `download`. The theme takes over same-site links and switches pages in place; `target="_self"` loads the full page, and `target="_blank"` opens a new tab. When you need to navigate from script, call `useRouter().go()`. See [Navigation](/components/navigation).

## Selection state

`toggle` turns the button into a two-state toggle, and `selected` sets its initial state:

<div class="demo-row">
  <m3e-button variant="filled" toggle selected>
    <m3e-icon slot="icon" name="check"></m3e-icon>
    Selected
  </m3e-button>
  <m3e-button variant="tonal" toggle>Toggle</m3e-button>
  <m3e-button variant="outlined" toggle>
    <m3e-icon slot="icon" name="close"></m3e-icon>
    <m3e-icon slot="selected-icon" name="check"></m3e-icon>
    Follow
    <span slot="selected">Following</span>
  </m3e-button>
</div>

```html
<m3e-button variant="filled" toggle selected>
  <m3e-icon slot="icon" name="check"></m3e-icon>
  Selected
</m3e-button>
<m3e-button variant="tonal" toggle>Toggle</m3e-button>
<m3e-button variant="outlined" toggle>
  <m3e-icon slot="icon" name="close"></m3e-icon>
  <m3e-icon slot="selected-icon" name="check"></m3e-icon>
  Follow
  <span slot="selected">Following</span>
</m3e-button>
```

When the button is selected, `m3e-icon` switches to the filled glyph automatically. You can also replace the icon and the text with the `selected-icon` and `selected` slots. Toggling fires the `beforeinput`, `input` and `change` events, and you can cancel it in `beforeinput`.

## Accessibility tips

- A button with only an icon must set `aria-label` and come with an `m3e-tooltip`.
- Keep tooltip target `id`s unique on a page.
- If users need to know about a disabled action, use `disabled-interactive` and explain why it is unavailable.
- Use `href` for link buttons. Do not bind routing logic to a plain button and lose the link semantics.
- Use `filled` for the main action, and avoid several high-emphasis buttons in the same visual area.

For all attributes, slots and events, see [API](/components/button/api).
