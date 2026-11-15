---
title: 头图
hero:
  image:
    light: /hero/theme-hero.svg
    dark: /hero/theme-hero-dark.svg
    alt: 文档主题在桌面窗口与手机上的界面示意
  date: 2026-10-28
  tagline: 在头部信息中写一张图片，页面标题、日期与简介会和它并排显示在页面顶部。
  fit: contain
icon: image
order: 2
tab: 概览
parallel:
  - api
  - details
---

# 头图

页面可以像 [Material Design 博客](https://m3.material.io/blog)那样带一张头图。文档表面顶部并排显示两张卡片：左边是日期、标题与简介，右边是图片。本页顶部就是一个例子。

## 添加头图

在页面的头部信息中写 `hero`：

```yaml
---
title: Google I/O 2026 的新变化
hero:
  image: /hero/io-2026.png
  alt: 新组件在手机与平板上的效果
  date: 2026-05-19
  tagline: Material 的最新更新让富有表现力的自适应产品更容易实现
---
```

只需要图片时可以简写：

```yaml
hero: /hero/io-2026.png
```

页面标题显示在头图卡片中，正文开头的一级标题随之隐藏。

## 夜间图片

为夜间模式单独提供一张图片时，写成 `light` 与 `dark`：

```yaml
hero:
  image:
    light: /hero/io-2026.png
    dark: /hero/io-2026-dark.png
    alt: 新组件在手机与平板上的效果
```

切换明暗模式时立即替换，当前不显示的那张不会被下载。

## 配色

带头图的页面会从图片中取一个颜色作为这一页的主题种子色，顶栏、导航、按钮与链接都换成与图片协调的色板。离开这一页后，恢复读者自己选择的颜色。写 `color: "#3367d6"` 固定颜色，写 `color: false` 保留读者的颜色。

## 透明图片与图案

透明背景的插画适合配 `fit: contain`：图片完整显示，并在卡片中留出边距。

两张卡片上都有一层很淡的图案，在图片透明的地方也看得到。指针停在卡片上时，周围会亮起一圈柔光。用 `pattern` 指定图案，写 `none` 关闭。

全部字段见[接口](/zh-CN/theme/hero/api)。取色、排版与图案的实现见[技术细节](/zh-CN/theme/hero/details)。
