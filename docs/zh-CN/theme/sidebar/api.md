---
tab: 接口
---

# 侧边导航：接口

## 文章的头部信息

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | 导航中的名称；缺省取第一个一级标题，再缺省取文件夹名 |
| `icon` | `string` | 导航项的图标 |
| `badge` | `string` | 导航项的徽标 |
| `order` | `number` | 在分类中的位置，小的在前；没有的排在后面，按文件夹名排序 |
| `parallel` | `string[]` | 同一文件夹中的平行页面 |
| `tab` | `string` | 在标签栏中的标题，缺省为页面标题 |
| `category` | `string` | 只用于语言首页：加入哪个分类 |

完整的头部信息字段见[撰写页面](/zh-CN/getting-started/writing/api#头部信息)。

## sidebar

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `categories` | `Record<string, AkariSidebarCategory>` | 无 | 按目录生成导航时的分类，键为分类的文件夹名，键的顺序即 rail 中的顺序 |
| `items` | `AkariSidebarItem[] \| Record<string, AkariSidebarItem[]>` | 无 | 手写的导航；写了它就不再按目录生成 |
| `width` | `number` | `320` | 导航抽屉的参考宽度，限制在 240 到 400 |

`AkariSidebarCategory` 的字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `text` | `string` | 分类的名称，缺省为文件夹名 |
| `icon` | `string` | rail 中的图标，缺省为 `category` |
| `collapsed` | `boolean` | `false` 时这个分类在移动端抽屉中默认展开。进入其中的页面时它会展开；读者手动展开或收起后保持原样 |

桌面导航抽屉的宽度是 `max(240px, width - 96px)`：默认 240px，`width` 设到上限 400 时为 304px。移动端抽屉直接使用 `width`。

## 手写导航

`sidebar.items` 由 `AkariSidebarItem` 组成。按目录生成的导航也是这个结构。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `text` | `string` | 必填，显示的文字 |
| `link` | `string` | 目标地址；站内地址以 `/` 开头 |
| `icon` | `string` | 已注册的图标名；顶层项显示在 rail 与移动端抽屉的一级菜单中，缺省为 `category` |
| `badge` | `string` | 徽标；顶层项的显示在 rail 图标右上角，子项的显示在抽屉中 |
| `collapsed` | `boolean` | `false` 时分组默认展开。进入分组中的页面时它会展开；读者手动展开或收起的分组，在抽屉切换分类后保持原样 |
| `items` | `AkariSidebarItem[]` | 子项，可以任意嵌套 |
| `tabs` | `AkariSidebarItem[]` | 平行页面：组内各页在侧栏中合为一项，链接到第一页，页面顶部显示标签栏 |

```ts
sidebar: {
  items: [
    {
      text: "样式",
      icon: "style",
      items: [
        { text: "色彩", link: "/styles/color" },
        {
          text: "图标",
          tabs: [
            { text: "概览", link: "/styles/icons" },
            { text: "选择图标", link: "/styles/icons/choosing" },
            { text: "使用图标", link: "/styles/icons/using" },
          ],
        },
      ],
    },
  ],
},
```

`items` 也可以写成对象：键为路径前缀，值为这些路径下显示的导航，按当前路径的最长前缀匹配（`/theme/settings` 优先于 `/theme/`，`/` 匹配所有路径）。

`tabs` 中只有带 `link` 的项会成为标签；一个带 `link` 的标签都没有时，这一项按普通导航项处理。

## 原生 sidebar

没有语言文件夹、也没有写 `sidebar.items` 时，主题读取 VitePress 的 `themeConfig.sidebar`（写在 `.vitepress/config.mts` 中），转换为同样的结构。原生项中的 `icon`、`badge` 与 `tabs` 会保留，分组的 `base` 会拼接到子项与标签的链接前。

```ts
export default defineConfig({
  themeConfig: {
    sidebar: {
      "/theme/": [
        {
          text: "主题",
          items: [
            { text: "布局与顶栏", link: "/theme/layout", icon: "view_quilt" },
            { text: "扩展主题", link: "/theme/extending", badge: "扩展" },
          ],
        },
      ],
    },
  },
});
```

## 标签栏的 CSS 变量

| 变量 | 默认值 | 作用 |
| --- | --- | --- |
| `--akari-app-bar-tabs-gap` | `24px` | 收进顶栏后，标签栏与标题、右侧按钮之间的距离 |
| `--akari-page-tabs-docked-max-width` | `none` | 收进顶栏后标签栏的最大宽度；设置后标签栏在空白处居中 |

## useSidebar

```ts
import { useSidebar } from "@theme";

const { items, prevNext, tabGroup, isActive, hasActive } = useSidebar();
```

| 返回值 | 类型 | 说明 |
| --- | --- | --- |
| `items` | `ComputedRef<AkariSidebarItem[]>` | 当前页面的导航树 |
| `prevNext` | `ComputedRef<{ prev?, next? }>` | 当前页面在平行页面组内的上一页与下一页；在组的两端或不在组中时没有对应的一项 |
| `tabGroup` | `ComputedRef<AkariSidebarItem \| undefined>` | 当前页面所在的平行页面组 |
| `isActive(link)` | `(link?: string) => boolean` | 这个地址是否是当前页面 |
| `hasActive(item)` | `(item: AkariSidebarItem) => boolean` | 这一项或它的子项、标签中是否有当前页面 |

只能在布局内部的组件中调用。

## 图标

导航中用到的图标需要先在 `docs/.vitepress/theme/icons.ts` 中注册，见[使用图标](/zh-CN/styles/icons/using)。未注册的图标显示为空白。
