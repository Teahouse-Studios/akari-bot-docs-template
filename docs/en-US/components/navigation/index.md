---
icon: language
order: 3
badge: New
tab: Overview
parallel:
  - api
---

# Navigation

The m3e components for navigation fall into three groups: `m3e-nav-menu` organizes multi-level pages, `m3e-tabs` switches views within one page, and chips and badges show status and filters.

## Side navigation

`m3e-nav-menu` holds multi-level navigation. `m3e-nav-menu-item` arranges its content with the `label`, `icon` and `badge` slots. Use `open` to expand a group and `selected` to highlight the current leaf item:

<div class="demo-surface" style="max-width: 320px; max-block-size: 320px;">
  <m3e-nav-menu aria-label="Component navigation demo">
    <m3e-nav-menu-item open>
      <m3e-icon slot="icon" name="widgets"></m3e-icon>
      <span slot="label">Components</span>
      <m3e-nav-menu-item>
        <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
        <a slot="label" href="/components/button.html">Buttons</a>
      </m3e-nav-menu-item>
      <m3e-nav-menu-item selected>
        <m3e-icon slot="icon" name="language"></m3e-icon>
        <a slot="label" href="/components/navigation.html">Navigation</a>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
    <m3e-nav-menu-item>
      <m3e-icon slot="icon" name="dashboard"></m3e-icon>
      <a slot="label" href="/components/card.html">Cards</a>
      <span slot="badge">New</span>
    </m3e-nav-menu-item>
  </m3e-nav-menu>
</div>

```html
<m3e-nav-menu aria-label="Component navigation demo">
  <m3e-nav-menu-item open>
    <m3e-icon slot="icon" name="widgets"></m3e-icon>
    <span slot="label">Components</span>
    <m3e-nav-menu-item selected>
      <m3e-icon slot="icon" name="language"></m3e-icon>
      <a slot="label" href="/components/navigation.html">Navigation</a>
    </m3e-nav-menu-item>
  </m3e-nav-menu-item>
  <m3e-nav-menu-item>
    <m3e-icon slot="icon" name="dashboard"></m3e-icon>
    <a slot="label" href="/components/card.html">Cards</a>
    <span slot="badge">New</span>
  </m3e-nav-menu-item>
</m3e-nav-menu>
```

`open` controls whether a group is expanded. At runtime the component can also manage this itself, based on the selection state of the child items. `disabled` disables the item and all its children. By default, the menu scrolls inside itself when its height is limited.

## Tabs

The direct children of `m3e-tabs` can only be `m3e-tab` and `m3e-tab-panel`. The `for` of each `m3e-tab` points to the `id` of its panel, and only one tab can have `selected`:

<m3e-tabs variant="primary">
  <m3e-tab selected for="nav-demo-panel-overview">
    <m3e-icon slot="icon" name="home"></m3e-icon>
    Overview
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-button">
    <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
    Buttons
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-card">
    <m3e-icon slot="icon" name="dashboard"></m3e-icon>
    Cards
  </m3e-tab>
  <m3e-tab-panel id="nav-demo-panel-overview">
    Overview panel: what the component is for, its variants and usage tips.
  </m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-button">
    Buttons panel: the five variants of <code>m3e-button</code> and <code>m3e-icon-button</code>.
  </m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-card">
    Cards panel: the slots, variants and actionable mode of <code>m3e-card</code>.
  </m3e-tab-panel>
</m3e-tabs>

```html
<m3e-tabs variant="primary">
  <m3e-tab selected for="nav-demo-panel-overview">
    <m3e-icon slot="icon" name="home"></m3e-icon>
    Overview
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-button">
    <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
    Buttons
  </m3e-tab>
  <m3e-tab-panel id="nav-demo-panel-overview">Overview panel content.</m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-button">Buttons panel content.</m3e-tab-panel>
</m3e-tabs>
```

`variant="primary"` is the primary tab style (the default is `secondary`), and `stretch` makes the tabs equal width to fill the container. When there are many tabs, allow horizontal scrolling or pagination. Do not squeeze the text until it is unreadable.

## Chips and filters

`m3e-chip` is a non-interactive chip for showing categories, status and tech stacks. Wrap the chips in `.demo-row` to control the spacing:

<div class="demo-row">
  <m3e-chip>
    <m3e-icon slot="icon" name="palette"></m3e-icon>
    Theme
  </m3e-chip>
  <m3e-chip>
    <m3e-icon slot="icon" name="layers"></m3e-icon>
    Components
  </m3e-chip>
  <m3e-chip variant="elevated">
    <m3e-icon slot="icon" name="check"></m3e-icon>
    Enabled
  </m3e-chip>
</div>

```html
<div class="demo-row">
  <m3e-chip>
    <m3e-icon slot="icon" name="palette"></m3e-icon>
    Theme
  </m3e-chip>
  <m3e-chip>
    <m3e-icon slot="icon" name="layers"></m3e-icon>
    Components
  </m3e-chip>
  <m3e-chip variant="elevated">
    <m3e-icon slot="icon" name="check"></m3e-icon>
    Enabled
  </m3e-chip>
</div>
```

When users need to filter content, use the interactive filter chip:

<m3e-filter-chip-set aria-label="Filter docs">
  <m3e-filter-chip selected value="all">All</m3e-filter-chip>
  <m3e-filter-chip value="theme">Theme</m3e-filter-chip>
  <m3e-filter-chip value="style">Styles</m3e-filter-chip>
  <m3e-filter-chip value="component">Components</m3e-filter-chip>
</m3e-filter-chip-set>

```html
<m3e-filter-chip-set aria-label="Filter docs">
  <m3e-filter-chip selected value="all">All</m3e-filter-chip>
  <m3e-filter-chip value="theme">Theme</m3e-filter-chip>
  <m3e-filter-chip value="style">Styles</m3e-filter-chip>
  <m3e-filter-chip value="component">Components</m3e-filter-chip>
</m3e-filter-chip-set>
```

A filter chip has its own selected state and keyboard handling. `selected` sets the initial value, and a click fires a change event. Its meaning differs from the non-interactive `m3e-chip`, so do not mix the two.

## Badges

A badge can show a count on its own, or anchor to a button or icon through `for`:

<div class="demo-row">
  <m3e-badge size="small">3</m3e-badge>
  <m3e-badge size="medium">12</m3e-badge>
  <m3e-badge size="large">99+</m3e-badge>
  <m3e-button id="navigation-demo-update" variant="outlined">Updates</m3e-button>
  <m3e-badge for="navigation-demo-update" position="above-after">4</m3e-badge>
</div>

```html
<m3e-badge size="small">3</m3e-badge>
<m3e-badge size="medium">12</m3e-badge>
<m3e-badge size="large">99+</m3e-badge>
<m3e-button id="navigation-demo-update" variant="outlined">Updates</m3e-button>
<m3e-badge for="navigation-demo-update" position="above-after">4</m3e-badge>
```

An anchored badge follows layout changes of its target element, and `position` sets where it sits. A badge has no default ARIA role. When you attach one to an interactive element, describe the count with `aria-describedby` or with matching visible text.

## SPA navigation

Internal links in the sidebar and footer should render real `<a>` elements. VitePress 2 intercepts internal clicks in the capture phase and performs the SPA navigation. VitePress 2 has removed vue-router and `RouterLink`, so do not import them or follow older examples:

```vue
<a
  v-if="item.link && !isExternalLink(item.link)"
  slot="label"
  :href="withBase(item.link)"
  :aria-current="isActive(item.link) ? 'page' : undefined"
>
  {{ item.text }}
</a>
<a
  v-else-if="item.link"
  slot="label"
  :href="item.link"
  target="_blank"
  rel="noreferrer"
>
  {{ item.text }}
</a>
```

`withBase` comes from `vitepress` and adds the deployment base to internal paths. VitePress core takes over plain left clicks, while middle-click to open a new tab, copying the link and accessibility semantics all keep working. External links keep their native behavior and get `target="_blank"` and `rel="noreferrer"`.

If you must navigate from a script, use `useRouter().go()`:

```ts
import { useRouter, withBase } from "vitepress";

const router = useRouter();

function navigate(event: MouseEvent, link: string): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
    return;
  }

  event.preventDefault();
  void router.go(withBase(link));
}
```

The anchors generated inside an m3e button or icon button are taken over by the theme: same-site links switch pages in place, `target="_self"` loads the full page, and `target="_blank"` opens a new tab. Only when you fake a click on a non-link element do you need to listen on the host element and call `router.go()` explicitly. The static demos on this page use plain `<a>` elements, so VitePress handles internal clicks, while external links still load the full page. Whichever approach you use, do not fake a link with a `div` and a click handler, and do not drop the real `href` from internal navigation.

## Accessibility

- Set `aria-label` on the menu root, so it is clear that it is the docs navigation landmark.
- Mark the current menu item with `selected`. The component outputs `aria-current`.
- Tabs link to panel `id`s through `for`, and only one tab can be `selected`.
- Keep visible text on filter chips. Do not rely on color alone to show the selected state.
- An icon-only button must have an `aria-label` and a tooltip.

For all attributes, slots and events, see [API](/components/navigation/api).
