---
icon: dashboard
order: 2
tab: Overview
parallel:
  - api
---

# Cards

`m3e-card` puts a header, body, actions and footer on one standalone surface. Use it for feature entry points, doc summaries, settings and media.

## Variants

The three variants suit different levels:

<div class="demo-grid">
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Filled</m3e-heading>
    <div slot="content">The default variant. Its container color comes from <code>surface-container-highest</code>, with no outline or shadow.</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Outlined</m3e-heading>
    <div slot="content">Has a 1px outline. Suits dense lists and content blocks that need a clear boundary.</div>
  </m3e-card>
  <m3e-card variant="elevated">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Elevated</m3e-heading>
    <div slot="content">Has a shadow and a surface color. Suits key content that floats above the background.</div>
  </m3e-card>
</div>

```html
<m3e-card variant="filled">
  <m3e-heading slot="header" variant="title" size="large">Filled</m3e-heading>
  <div slot="content">The default variant. Its container color comes from the surface levels.</div>
</m3e-card>
<m3e-card variant="outlined">
  <m3e-heading slot="header" variant="title" size="large">Outlined</m3e-heading>
  <div slot="content">Has a 1px outline.</div>
</m3e-card>
<m3e-card variant="elevated">
  <m3e-heading slot="header" variant="title" size="large">Elevated</m3e-heading>
  <div slot="content">Has a shadow and a surface color.</div>
</m3e-card>
```

Without `variant`, a card uses `filled`.

## Slots

A card has five areas:

- `header`: a title, icon or media, with no extra padding.
- `content`: the body area, with padding.
- `actions`: action buttons, aligned to the start edge by default. Add the `end` attribute to the element to align them to the end edge.
- `footer`: metadata, copyright or secondary notes.
- Default slot: no padding. Suits full-bleed images or custom layouts.

<div class="demo-grid">
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Doc summary</m3e-heading>
    <div slot="content">
      The body area can hold paragraphs, lists, chips and badges. The card controls the padding.
    </div>
    <div slot="actions" end>
      <m3e-button variant="text">Cancel</m3e-button>
      <m3e-button variant="filled">Continue</m3e-button>
    </div>
    <div slot="footer">Updated 2026-10-27</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined">
  <m3e-heading slot="header" variant="title" size="large">Doc summary</m3e-heading>
  <div slot="content">
    The body area can hold paragraphs, lists, chips and badges. The card controls the padding.
  </div>
  <div slot="actions" end>
    <m3e-button variant="text">Cancel</m3e-button>
    <m3e-button variant="filled">Continue</m3e-button>
  </div>
  <div slot="footer">Updated 2026-10-27</div>
</m3e-card>
```

Order the buttons in `actions` by platform convention: cancel on the start side, confirm on the end side. Footer text uses a secondary color so it does not compete with the body for attention.

## Combining content

A card can mix headings, chips, badges and lists:

<m3e-card variant="elevated">
  <m3e-heading m3e-toc-ignore slot="header" variant="headline" size="small">Theme features</m3e-heading>
  <div slot="content">
    <div class="demo-row">
      <m3e-chip>
        <m3e-icon slot="icon" name="palette"></m3e-icon>
        Dynamic color
      </m3e-chip>
      <m3e-chip>
        <m3e-icon slot="icon" name="layers"></m3e-icon>
        Component overrides
      </m3e-chip>
      <m3e-badge size="small">Beta</m3e-badge>
    </div>
    <ul>
      <li>Navigation and table of contents built from config</li>
      <li>Settings saved in the current browser</li>
      <li>Registered on the client, compatible with SSR builds</li>
    </ul>
  </div>
  <div slot="actions">
    <m3e-button variant="tonal" href="/theme/extending.html">
      See how to extend
      <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
    </m3e-button>
  </div>
</m3e-card>

```html
<m3e-card variant="elevated">
  <m3e-heading slot="header" variant="headline" size="small">Theme features</m3e-heading>
  <div slot="content">
    <div class="demo-row">
      <m3e-chip>
        <m3e-icon slot="icon" name="palette"></m3e-icon>
        Dynamic color
      </m3e-chip>
      <m3e-chip>
        <m3e-icon slot="icon" name="layers"></m3e-icon>
        Component overrides
      </m3e-chip>
      <m3e-badge size="small">Beta</m3e-badge>
    </div>
    <ul>
      <li>Navigation and table of contents built from config</li>
      <li>Settings saved in the current browser</li>
      <li>Registered on the client, compatible with SSR builds</li>
    </ul>
  </div>
  <div slot="actions">
    <m3e-button variant="tonal" href="/theme/extending.html">
      See how to extend
      <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
    </m3e-button>
  </div>
</m3e-card>
```

With more content, a card grows to fit it. Cards in the same grid do not get equal heights automatically, so keep their text to a similar length.

## Actionable cards

Add `actionable` to a card to make its whole surface one interactive area. With `href`, it works directly as a link:

<div class="demo-grid">
  <m3e-card variant="outlined" actionable href="/getting-started/installation.html">
    <m3e-icon slot="header" name="package_2"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Installation</m3e-heading>
    <div slot="content">Set up Node and the dependencies, then produce your first build.</div>
  </m3e-card>
  <m3e-card variant="outlined" actionable href="/getting-started/configuration.html">
    <m3e-icon slot="header" name="tune"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Configuration</m3e-heading>
    <div slot="content">Adjust the app bar, navigation, settings sections and TOC depth.</div>
  </m3e-card>
  <m3e-card variant="outlined" actionable href="/theme/extending.html">
    <m3e-icon slot="header" name="integration_instructions"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Extending</m3e-heading>
    <div slot="content">Customize the interface with component overrides and CSS tokens.</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined" actionable href="/getting-started/installation.html">
  <m3e-icon slot="header" name="package_2"></m3e-icon>
  <m3e-heading slot="header" variant="title" size="large">Installation</m3e-heading>
  <div slot="content">Set up Node and the dependencies, then produce your first build.</div>
</m3e-card>
```

An actionable card shows a state layer on hover, focus and press. Remove any other interactive elements inside a card that is clickable as a whole, so nested buttons do not cause two actions at once. When you need several actions, use a plain card with the `actions` slot instead.

## Dialog actions

A card's action can open a dialog. Put `m3e-dialog-trigger` inside the button. `m3e-dialog-action` closes the dialog and returns a result:

<m3e-card variant="outlined">
  <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Version info</m3e-heading>
  <div slot="content">These docs match VitePress 2.0.0-alpha.21 and @m3e/web 2.10.3.</div>
  <div slot="actions" end>
    <m3e-button variant="filled">
      <m3e-dialog-trigger for="card-demo-dialog">View details</m3e-dialog-trigger>
    </m3e-button>
  </div>
</m3e-card>

<m3e-dialog id="card-demo-dialog" dismissible>
  <span slot="header">Vitepress Theme Akari Docs</span>
  <p>The theme uses VitePress for static generation and routing, and m3e for UI components and dynamic color.</p>
  <p>Settings are saved locally in the browser and are not written to the site config.</p>
  <div slot="actions" end>
    <m3e-button>
      <m3e-dialog-action return-value="close">Close</m3e-dialog-action>
    </m3e-button>
  </div>
</m3e-dialog>

```html
<m3e-button variant="filled">
  <m3e-dialog-trigger for="card-demo-dialog">View details</m3e-dialog-trigger>
</m3e-button>
<m3e-dialog id="card-demo-dialog" dismissible>
  <span slot="header">Vitepress Theme Akari Docs</span>
  <p>The theme uses VitePress for static generation and routing, and m3e for UI components and dynamic color.</p>
  <div slot="actions" end>
    <m3e-button>
      <m3e-dialog-action return-value="close">Close</m3e-dialog-action>
    </m3e-button>
  </div>
</m3e-dialog>
```

`dismissible` gives the dialog a close button. Clicking the scrim or pressing `Escape` also closes it. For a blocking flow, add `disable-close` and an explicit confirm action.

## Grid layout

Card grids use `.demo-grid`, which becomes a single column on narrow screens. Keep each card to one topic and one main action, and do not pack a whole page of content into one card.

<div class="demo-grid">
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">Getting started</m3e-heading>
    <div slot="content">From installation to your first build in about ten minutes.</div>
  </m3e-card>
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">Theme</m3e-heading>
    <div slot="content">Understand the app shell, the sidebar and the settings dialog.</div>
  </m3e-card>
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">Styles</m3e-heading>
    <div slot="content">Learn the color tokens and the type hierarchy.</div>
  </m3e-card>
</div>

## Usage tips

- Keep card titles short and body text to three lines at most. Move long content to its own page.
- Use only one variant in a grid to avoid visual noise.
- Do not nest buttons in a card that is clickable as a whole. Use `actions` when you need several actions.
- Put images in the default slot or the `header` slot, and give them alt text.
- Adjust the card's corner radius, color and padding with the `--m3e-card-*` variables. See [Extending the theme](/theme/extending).

For all attributes, slots and events, see [API](/components/card/api).
