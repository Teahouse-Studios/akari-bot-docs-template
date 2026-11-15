---
tab: 接口
---

# 撰写页面：接口

## 头部信息

| 字段 | 类型 | 用于 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | 所有页面 | 页面标题，也是文章在导航中的名称。缺省取第一个一级标题，再缺省取文件夹名 |
| `description` | `string` | 所有页面 | 页面描述，写进 `<meta name="description">`，也是头图的默认简介 |
| `icon` | `string` | 文章 | 导航项的图标，需要是已注册的图标 |
| `badge` | `string` | 文章 | 导航项的徽标，例如 `New` |
| `order` | `number` | 文章 | 在分类中的位置，小的在前。没有 `order` 的文章排在后面，按文件夹名排序 |
| `parallel` | `string[]` | 文章 | 平行页面：同一文件夹里其他 `.md` 文件的名字（可省略扩展名），按标签栏顺序排在文章之后 |
| `tab` | `string` | 文章与平行页面 | 在标签栏中的标题，缺省为页面标题 |
| `category` | `string` | 语言首页 | 首页默认不在导航中。写上一个分类的文件夹名后，首页加入该分类。没有 `order` 时排在最前面 |
| `hero` | `string \| object` | 所有页面 | 页面顶部的头图，字段见[头图](/zh-CN/theme/hero/api) |
| `toc` | `boolean` | 所有页面 | `false` 时不显示右侧目录与窄屏的目录按钮 |

本页说的文章，指分类目录中某个文件夹里的 `index.md`。VitePress 自身的头部信息字段（如 `head`、`titleTemplate`）照常可用。

```yaml
---
title: 图标
description: 主题使用的 Material Symbols 图标
icon: interests
order: 2
badge: New
tab: 概览
parallel:
  - choosing
  - using
hero:
  image: /hero/icons-hero.svg
  fit: contain
---
```

## 表格

表格用标准管道语法。开启 `akariMarkdown` 后，每个表格会包在一个带 M3 描边边框的容器里，过宽时在边框内横向滚动。

```md
| 字段 | 说明 |
| --- | --- |
| `title` | 页面标题 |
```

直接写成 HTML `<table>` 的表格没有外层容器，表格本身的样式相同。

## 图片

```md
![说明](./图片.png)
![说明](/hero/图片.svg)
![说明](https://example.com/图片.png)
```

页面渲染时，每张 Markdown 图片都会写上自己的 `width` 与 `height`。图片加载之前页面就为它留出了位置，加载后不会跳动。图片仍按 `max-width: 100%` 缩放，宽高比保持不变。

| 图片 | 由谁测量 |
| --- | --- |
| 文章文件夹中的（`./图片.png`） | VitePress，读取源文件旁的图片 |
| `docs/public` 中的（`/hero/图片.svg`） | VitePress |
| 远程的（`https://…`） | 主题加入的 [markdown-it-image-size](https://github.com/boyum/markdown-it-image-size)：渲染页面时下载图片读取尺寸，按地址缓存一周（`node_modules/markdown-it-image-size/.cache`） |

- 只写了 `width` 或 `height` 之一的本地图片，另一个按比例补上。两者都写了的不作改动。
- 远程图片下载失败时（离线、地址错误），终端给出提示，这张图片不带宽高，页面照常生成。下载在渲染时同步进行。开发服务器渲染带新远程图片的页面时会稍有停顿，之后直接使用缓存。
- 直接写成 HTML 的 `<img>` 不会被测量，需要自己写上宽高。
- 远程图片的测量可以在 `.vitepress/config.mts` 中关闭或调整缓存，见[配置](/zh-CN/getting-started/configuration/api#akarimarkdown)。

## 链接

正文中的链接前带一个与文字等大的图标。站内链接是 `link`，在新标签页打开的链接（`target="_blank"`，包括外部链接）是 `open_in_new`。以下链接不带图标：标题锚点、包着图片的链接、脚注标记，以及放进组件插槽的链接（带 `slot` 属性）。

## 提示块与代码

VitePress 的提示块与代码组都有对应的主题样式：

````md
::: tip 提示
可选的说明。
:::

::: warning
需要注意的事项。
:::

::: code-group

```bash [npm]
npm install
```

```bash [pnpm]
pnpm install
```

:::
````

提示块有 `info`、`tip`、`warning`、`danger` 与 `details`。代码块标注语言后有语法高亮与复制按钮。复制按钮的文字、没写标题的提示块的标题，都来自语言包的 `markdown`。两者可以在语言配置中改写。

## 演示辅助类

| 类名 | 作用 |
| --- | --- |
| `demo-surface` | 带描边与 `surface-container-low` 底色的演示区，16px 圆角与内边距 |
| `demo-row` | 横向排列，自动换行，间距 12px |
| `demo-grid` | 卡片网格，每列至少 240px，窄屏变为单列 |
| `demo-stack` | 纵向排列，间距 16px |

```html
<div class="demo-surface">
  <div class="demo-row">
    <m3e-button variant="filled">确定</m3e-button>
    <m3e-button variant="outlined">取消</m3e-button>
  </div>
</div>
```

## m3e 组件

Markdown 中可以直接写已注册的 m3e 组件。主题在 `docs/.vitepress/theme/m3e.ts` 中注册了：

`app-bar`、`badge`、`button`、`card`、`checkbox`、`chips`、`content-pane`、`dialog`、`divider`、`drawer-container`、`heading`、`icon`、`icon-button`、`list`、`loading-indicator`、`menu`、`nav-bar`、`nav-menu`、`nav-rail`、`search`、`segmented-button`、`snackbar`、`switch`、`tabs`、`theme`、`tooltip`。

用到其他组件时，在 `m3e.ts` 中导入对应的子路径，例如 `import "@m3e/web/slider";`。

- 组件中的标题用 `<m3e-heading>`。加上 `m3e-toc-ignore` 属性后，此标题不会进入目录。
- 图标写 `<m3e-icon name="search"></m3e-icon>`。图标需要先在 `icons.ts` 中注册，见[使用图标](/zh-CN/styles/icons/using)。
- 带 `href` 的组件（按钮、卡片、纸片、列表项等）指向站内页面时，和普通链接一样在页面内切换，不重新加载整个网页。写上 `target="_self"` 时按 VitePress 的约定整页加载。`target="_blank"` 在新标签页打开。
