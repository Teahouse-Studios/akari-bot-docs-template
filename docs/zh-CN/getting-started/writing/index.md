---
title: 撰写页面
icon: article
order: 3
tab: 概览
parallel:
  - api
  - details
---

# 撰写页面

页面是语言文件夹中的一个 Markdown 文件。文件的放置位置决定页面的地址，也决定它在导航中的位置。

## 新建一篇文章

1. 在分类目录中新建一个文件夹。文件夹名就是文章的地址，建议只用小写字母、数字和连字符。
2. 在其中写 `index.md`，文件以一级标题开头。
3. 在头部信息中写上图标与顺序。

```text
docs/zh-CN/components/
└─ chip/
   └─ index.md          /components/chip
```

```md
---
icon: label
order: 4
---

# 纸片

正文……
```

保存后，文章立即出现在“组件”分类中，不需要重启开发服务器。导航中的名称取页面标题，也就是这里的“纸片”。

新建分类时，先建一个分类目录。图标写在共用配置的 `sidebar.categories` 中，名称写在语言配置中，见[配置](/zh-CN/getting-started/configuration)。

## 平行页面

内容较多的文章可以拆成几页，几页之间用页面顶部的标签栏切换，侧栏中仍然只显示一项。在文章文件夹中新建其他 `.md` 文件，并在 `index.md` 的头部信息中按顺序列出它们：

```text
docs/zh-CN/styles/icons/
├─ index.md           /styles/icons
├─ choosing.md        /styles/icons/choosing
└─ using.md           /styles/icons/using
```

```md
---
title: 图标
tab: 概览
parallel:
  - choosing
  - using
---
```

每一页用自己的 `tab` 设置它在标签栏中的标题。不写 `tab` 时用页面标题。本站的主题文档都分成“概览”“接口”“技术细节”三页。

## 头图

在头部信息中写 `hero`，页面顶部就会并排显示标题卡片与图片，见[头图](/zh-CN/theme/hero)。

## 图片与链接

- 只有一个页面用到的图片，放在文章文件夹中，用 `![说明](./图片.png)` 引用。几个页面共用的放进 `docs/public`，用 `/hero/图片.svg` 这样的绝对路径引用。
- 渲染时会自动写上图片的宽高，远程图片也一样。因此图片加载时页面不会跳动，见[接口](/zh-CN/getting-started/writing/api#图片)。
- 站内链接写页面的地址，以 `/` 开头，不用写 `.html`。VitePress 会按 `cleanUrls` 补上：`[侧边导航](/zh-CN/theme/sidebar)`。不要写文件路径（`/zh-CN/theme/sidebar/index.md`），也不要写相对路径。
- 本站的根语言是英文。英文页面之间的链接不带语言前缀，中文页面之间的链接带上 `/zh-CN/` 前缀。

## Markdown

VitePress 的 Markdown 扩展都可以用，例如代码组、提示块、代码行高亮与脚注。主题在此基础上另有几处扩展：

- 表格有 M3 的描边边框。正文链接前带一个图标。代码块、表格等带背景的元素上有一层淡淡的图案。
- 可以直接在 Markdown 中写 m3e 组件，例如 `<m3e-button>`、`<m3e-card>`。本站的组件演示就是这样写的。
- 另有几个辅助类用来排版演示内容：`demo-surface`、`demo-row`、`demo-grid`、`demo-stack`。

完整的头部信息字段、可用组件与辅助类见[接口](/zh-CN/getting-started/writing/api)。

## 另一种语言的版本

在另一个语言文件夹的相同位置放一个同名文件夹，例如 `docs/en-US/components/chip/index.md`。两个页面就互为对应页面，切换语言时会停留在这一页。没有对应页面时，切换语言会去该语言的首页。
