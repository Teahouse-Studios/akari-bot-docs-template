---
tab: API
---

# Side navigation: API

## Article frontmatter

| Field | Type | Description |
| --- | --- | --- |
| `title` | `string` | Name in the navigation; defaults to the first h1, then to the folder name |
| `icon` | `string` | Icon of the navigation item |
| `badge` | `string` | Badge of the navigation item |
| `order` | `number` | Position in the category, smaller first; pages without it come last, sorted by folder name |
| `parallel` | `string[]` | Parallel pages in the same folder |
| `tab` | `string` | Title in the tab bar; defaults to the page title |
| `category` | `string` | Only for a language's home page: which category it joins |

For every frontmatter field, see [Writing pages](/getting-started/writing/api#frontmatter).

## sidebar

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `categories` | `Record<string, AkariSidebarCategory>` | none | Categories for navigation generated from folders. Keys are category folder names; their order is the order in the rail |
| `items` | `AkariSidebarItem[] \| Record<string, AkariSidebarItem[]>` | none | Navigation written by hand; when it is set, the navigation is no longer generated from folders |
| `width` | `number` | `320` | Reference width of the navigation drawer, limited to 240–400 |

Fields of `AkariSidebarCategory`:

| Field | Type | Description |
| --- | --- | --- |
| `text` | `string` | Name of the category; defaults to the folder name |
| `icon` | `string` | Icon in the rail; defaults to `category` |
| `collapsed` | `boolean` | When `false`, the category is expanded by default in the mobile drawer. It opens when you go to a page in it, and stays as the reader left it after they open or close it |

The desktop navigation drawer is `max(240px, width - 96px)` wide: 240px by default, and 304px when `width` is at its maximum of 400. The mobile drawer uses `width` directly.

## Navigation written by hand

`sidebar.items` is a list of `AkariSidebarItem`. Navigation generated from folders has the same structure.

| Field | Type | Description |
| --- | --- | --- |
| `text` | `string` | Required. The text shown |
| `link` | `string` | Target address; addresses on the site start with `/` |
| `icon` | `string` | A registered icon name. Top-level items show it in the rail and in the top-level menu of the mobile drawer; defaults to `category` |
| `badge` | `string` | Badge. On a top-level item it shows at the top right of the rail icon; on a child item it shows in the drawer |
| `collapsed` | `boolean` | When `false`, the group is expanded by default. It opens when you go to a page in it; a group the reader opened or closed stays that way when the drawer switches category and back |
| `items` | `AkariSidebarItem[]` | Child items, nested to any depth |
| `tabs` | `AkariSidebarItem[]` | Parallel pages: the pages of the group become one item in the sidebar that links to the first page, and a tab bar shows at the top of the page |

```ts
sidebar: {
  items: [
    {
      text: "Styles",
      icon: "style",
      items: [
        { text: "Color", link: "/styles/color" },
        {
          text: "Icons",
          tabs: [
            { text: "Overview", link: "/styles/icons" },
            { text: "Choosing icons", link: "/styles/icons/choosing" },
            { text: "Using icons", link: "/styles/icons/using" },
          ],
        },
      ],
    },
  ],
},
```

`items` can also be an object: keys are path prefixes, and values are the navigation shown under those paths. The longest prefix of the current path wins (`/theme/settings` beats `/theme/`, and `/` matches every path).

Only items in `tabs` that have a `link` become tabs. If no tab has a `link`, the item is treated as an ordinary navigation item.

## Native sidebar

When there is no language folder and no `sidebar.items`, the theme reads VitePress's `themeConfig.sidebar` (in `.vitepress/config.mts`) and converts it to the same structure. `icon`, `badge` and `tabs` on native items are kept, and a group's `base` is prepended to the links of its child items and tabs.

```ts
export default defineConfig({
  themeConfig: {
    sidebar: {
      "/theme/": [
        {
          text: "Theme",
          items: [
            { text: "Layout and app bar", link: "/theme/layout", icon: "view_quilt" },
            { text: "Extending the theme", link: "/theme/extending", badge: "Extend" },
          ],
        },
      ],
    },
  },
});
```

## Tab bar CSS variables

| Variable | Default | Effect |
| --- | --- | --- |
| `--akari-app-bar-tabs-gap` | `24px` | Once docked in the app bar, the space between the tab bar and the title, and between the tab bar and the buttons on the right |
| `--akari-page-tabs-docked-max-width` | `none` | Maximum width of the tab bar once docked in the app bar; when set, the tab bar is centered in the empty space |

## useSidebar

```ts
import { useSidebar } from "@theme";

const { items, prevNext, tabGroup, isActive, hasActive } = useSidebar();
```

| Return value | Type | Description |
| --- | --- | --- |
| `items` | `ComputedRef<AkariSidebarItem[]>` | Navigation tree of the current page |
| `prevNext` | `ComputedRef<{ prev?, next? }>` | Previous and next page within the current page's parallel group; missing at either end of the group and outside any group |
| `tabGroup` | `ComputedRef<AkariSidebarItem \| undefined>` | Parallel page group that the current page belongs to |
| `isActive(link)` | `(link?: string) => boolean` | Whether this address is the current page |
| `hasActive(item)` | `(item: AkariSidebarItem) => boolean` | Whether this item, or one of its child items or tabs, is the current page |

Call it only from components inside the layout.

## Icons

Icons used in the navigation must first be registered in `docs/.vitepress/theme/icons.ts`. See [Using icons](/styles/icons/using). Icons that are not registered show as blank.
