---
title: 图标
hero:
  image: /hero/icons-hero.svg
  alt: 一组圆角方块上的图标示意，以及从细到粗的笔画
  tagline: 主题使用 Material Symbols 图标，按需注册，不依赖图标字体或 CDN。
  fit: contain
order: 2
tab: 概览
parallel:
  - choosing
  - using
---

# 图标

主题中的图标都是 [Material Symbols](https://fonts.google.com/icons)，由 `@m3e/icons` 以 SVG 路径的形式提供，用 `<m3e-icon>` 显示。[选择图标](/zh-CN/styles/icons/choosing)介绍样式、填充与尺寸，[使用图标](/zh-CN/styles/icons/using)介绍注册方法与无障碍要求。

<div class="demo-row">
  <m3e-icon name="home"></m3e-icon>
  <m3e-icon name="search"></m3e-icon>
  <m3e-icon name="settings"></m3e-icon>
  <m3e-icon name="palette"></m3e-icon>
  <m3e-icon name="translate"></m3e-icon>
  <m3e-icon name="schedule"></m3e-icon>
  <m3e-icon name="dark_mode"></m3e-icon>
  <m3e-icon name="light_mode"></m3e-icon>
</div>

## 特点

- **按需注册**：每个图标是一个独立模块。只有在 `icons.ts` 中导入的图标会进入构建产物，首屏体积与图标总数无关。
- **不依赖网络**：图标随 `@m3e/icons` 一起安装，渲染为内联 SVG。没有字体文件，也不会出现图标字体加载前的文字闪烁。
- **跟随主题**：图标使用 `currentColor`，颜色来自所在组件的 M3 颜色角色，明暗模式、对比度与动态色变化时自动跟随。
- **轮廓与填充**：每个图标都带有填充形态，`filled` 属性在两者之间切换。导航中的选中项用填充形态表示当前位置。

## 主题中的图标

| 位置 | 图标来源 | 说明 |
| --- | --- | --- |
| rail 与移动端抽屉 | 共用配置 `sidebar.categories` 中分类的 `icon` | 缺省为 `category`。当前分类显示填充形态 |
| 顶栏 | 主题内置 | 菜单、搜索、更多、设置与社交链接 |
| 悬浮按钮 | 主题内置 | 回到顶部为 `keyboard_arrow_up`，目录为 `format_list_bulleted` |
| rail 底部 | 主题内置 | 明暗模式的图标随当前模式切换，语言按钮为 `translate` |
| 正文 | Markdown 中的 `<m3e-icon>` | 需要先在 `icons.ts` 注册 |

## 本组页面

这三页是一组平行页面：在侧栏中合为一项，名为“图标”，页面顶部的标签栏在三页之间切换。三页对应 `styles/icons/` 文件夹中的 `index.md`、`choosing.md` 与 `using.md`，写法见[撰写页面](/zh-CN/getting-started/writing#平行页面)。
