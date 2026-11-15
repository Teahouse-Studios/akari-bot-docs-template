---
icon: integration_instructions
order: 7
badge: Extend
tab: Overview
parallel:
  - api
---

# Extending the theme

There are three ways to adjust the theme, and none of them needs changes to the theme's source:

| Way | Good for | Where |
| --- | --- | --- |
| Config | Titles, navigation, settings options, TOC, footer, interface strings | `docs/config.ts` and each language's `config.ts`; see [Configuration](/getting-started/configuration) |
| Replacing components | A branded app bar, a special footer, a custom content container | `enhanceApp` in the theme entry |
| CSS variables | Corner radius, spacing, surface colors, TOC width | Site styles |

## Replacing components

In `enhanceApp` of the theme entry `docs/.vitepress/theme/index.ts`, call `provideAkariSiteData` to hand the site's language and config data to the theme, then pass the parts you want to replace to `provideAkariComponents`. Parts you leave out keep the built-in components:

```ts
import { type Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import { provideAkariSiteData } from "./composables/useLocales";
import { provideAkariComponents } from "./composables/useAkariConfig";
import Layout from "./layouts/AkariLayout.vue";
import CustomFooter from "./CustomFooter.vue";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, siteData }) {
    provideAkariSiteData(app, siteData);
    provideAkariComponents(app, { Footer: CustomFooter });
  },
} satisfies Theme;
```

Custom components read config and state through the theme's composables, such as `useAkariConfig()` and `useSidebar()`. See [API](/theme/extending/api) for the parts you can replace and the functions available.

## CSS variables

Override the variables of the theme and of m3e components in your site styles:

```css
:root {
  --akari-doc-radius: 24px;
  --akari-doc-max-width: 1440px;
}
```

You can also override a single component in place. The three cards below change only the corner radius:

<div class="demo-grid">
  <m3e-card variant="outlined" style="--m3e-card-shape: 4px;">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">4px corners</m3e-heading>
    <div slot="content">A more compact card, suited to tool panels and data blocks.</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">Default corners</m3e-heading>
    <div slot="content">Keeps the m3e card's default shape token, consistent with other components.</div>
  </m3e-card>
  <m3e-card variant="outlined" style="--m3e-card-shape: 28px;">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">28px corners</m3e-heading>
    <div slot="content">Larger corners, closer to the visual language of the document surface.</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined" style="--m3e-card-shape: 28px;">…</m3e-card>
```

Prefer the variables that the theme and components expose. Do not rely on components' internal class names or Shadow DOM structure; they change between versions.

## Things to keep in mind

- When you replace a component, keep the original root element's semantics and accessibility attributes (for example, `m3e-app-bar` for the app bar and `m3e-nav-menu` for navigation), and keep keyboard operation.
- Do not hard-code colors. Use the `--md-sys-color-*` tokens so that colors follow dynamic color, light and dark mode, and contrast.
- When you use a new m3e component or icon, register it on demand in `m3e.ts` and `icons.ts`. Do not import `@m3e/web/all`.
- Do not access `window`, `document` or `localStorage` at the top level of a module, or server-side rendering fails.
