---
icon: view_sidebar
order: 3
tab: Overview
parallel:
  - api
  - details
---

# Side navigation

On desktop, a 96px-wide rail on the left lists the categories, and the navigation drawer lists the pages in the current category. When the window is narrower than 960px, the menu button in the app bar opens a navigation drawer with every page.

## Rail and navigation drawer

- **Rail**: one icon per category. The category of the current page shows as selected, and its icon becomes filled. Clicking a category opens its first page. At the bottom of the rail is the appearance button, plus a language button when the site has several languages.
- **Navigation drawer**: at window widths of 1600px and above, it stays open to the right of the rail. At 960–1599px, it slides out from under the rail when the pointer rests on a category, and slides back when the pointer leaves. On touch screens, tapping a category opens or closes it.
- **Narrow screens**: the rail and drawer are hidden. The menu button opens the full navigation drawer, whose top-level menu matches the categories in the rail. The appearance and language buttons are at the bottom of the drawer.

<div class="demo-surface" style="max-width: 320px;">
  <m3e-nav-menu aria-label="Side navigation demo">
    <m3e-nav-menu-item open>
      <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
      <span slot="label">Getting started</span>
      <m3e-nav-menu-item selected>
        <a slot="label" href="/">Overview</a>
      </m3e-nav-menu-item>
      <m3e-nav-menu-item>
        <a slot="label" href="/getting-started/installation.html">Installation</a>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
    <m3e-nav-menu-item>
      <m3e-icon slot="icon" name="palette"></m3e-icon>
      <span slot="label">Theme</span>
      <m3e-nav-menu-item>
        <a slot="label" href="/theme/extending.html">Extending the theme</a>
        <span slot="badge">Extend</span>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
  </m3e-nav-menu>
</div>

## Where the navigation comes from

The navigation is generated from the folders in the language folder: each category folder is a category in the rail, and the article folders in a category are its pages. Names, icons and order are set in each article's frontmatter. See [Writing pages](/getting-started/writing).

Category names and icons go in `sidebar.categories` in the config:

```ts
// docs/config.ts
sidebar: {
  categories: {
    "getting-started": { icon: "rocket_launch" },
    theme: { icon: "palette" },
  },
},

// docs/en-US/config.ts
sidebar: {
  categories: {
    "getting-started": { text: "Getting started" },
    theme: { text: "Theme" },
  },
},
```

You can also write the whole navigation by hand with `sidebar.items` in the config. See [API](/theme/sidebar/api#navigation-written-by-hand).

## Parallel pages

An article can be split into several pages, the way Icons on [m3.material.io](https://m3.material.io/styles/icons) is split into Overview, Guidelines and Specs. The pages take a single entry in the sidebar, and a tab bar at the top of the page switches between them.

- When you scroll down, the tab bar shrinks and flies into the empty space to the right of the app bar title. When you scroll back, it returns to the page.
- When the app bar has no room for it, the tab bar is held below the app bar instead, with a light shadow.
- When you switch pages within the group, the content slides left or right. If the tab bar is docked in the app bar, it stays put, and the new page starts right at the body text.
- The previous and next page cards at the end of the content stay within the group: its first page has no previous one, its last no next one.

The [Icons](/styles/icons) pages and every theme document on this site are organized this way. See [Writing pages](/getting-started/writing#parallel-pages).

For each field, see [API](/theme/sidebar/api). For when the drawer opens, how the tab bar flies and more, see [Details](/theme/sidebar/details).
