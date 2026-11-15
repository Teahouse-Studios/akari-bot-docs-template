---
title: 概览
toc: false
category: getting-started
icon: home
---

# 概览

Vitepress Theme Akari Docs 是一个基于 VitePress 与 `@m3e/web` 的文档主题。

<div class="demo-row">
  <m3e-button variant="filled" href="/zh-CN/getting-started/installation.html">
    <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
    安装指南
  </m3e-button>
  <m3e-chip>
    <m3e-icon slot="icon" name="check"></m3e-icon>
    主题已就绪
  </m3e-chip>
  <m3e-chip variant="elevated">
    <m3e-icon slot="icon" name="layers"></m3e-icon>
    Web Components
  </m3e-chip>
  <m3e-badge size="large">v1.0.0</m3e-badge>
</div>

## 特性

<div class="demo-grid">
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Material 3 Expressive</m3e-heading>
    <div slot="content">颜色、形状、动效与排版都来自 m3e 的设计令牌，与官方 Material 3 一致。</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">按目录组织</m3e-heading>
    <div slot="content">语言文件夹下的目录是分类，分类里的文件夹是文章。导航与语言列表都根据目录与头部信息生成。</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">平行页面与头图</m3e-heading>
    <div slot="content">一篇文章可以分成几页，用标签栏切换。带头图的页面按图片取配色。</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">设置与明暗模式</m3e-heading>
    <div slot="content">四种明暗模式。颜色、色调变体、对比度、动效、方向与字号即时生效，设置保存在当前浏览器。</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">搜索与多语言</m3e-heading>
    <div slot="content">搜索默认使用本地索引，也可以换成 HTTP 或自定义后端。切换语言时停留在对应页面。</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">可替换、可扩展</m3e-heading>
    <div slot="content">可以替换顶栏、目录、页尾等组件，也可以覆盖 CSS 变量调整外观。</div>
  </m3e-card>
</div>

## 快速开始

```bash
npm install
npm run dev
```

按顺序阅读：

- [安装](/zh-CN/getting-started/installation)：从模板创建仓库、运行环境与部署。
- [配置](/zh-CN/getting-started/configuration)：共用配置与语言配置。
- [撰写页面](/zh-CN/getting-started/writing)：新建文章、头部信息与 Markdown 写法。
- [布局与顶栏](/zh-CN/theme/layout)、[侧边导航](/zh-CN/theme/sidebar)：主题外壳的各个部分。

本站有中文、英文、日文、韩文、法文与阿拉伯文六个版本。切换版本用 rail 底部的语言按钮。
