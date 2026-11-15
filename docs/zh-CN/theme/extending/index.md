---
icon: integration_instructions
order: 7
badge: 扩展
tab: 概览
parallel:
  - api
---

# 扩展主题

有三种方式调整主题，都不需要改动主题源码：

| 方式 | 适合 | 写在 |
| --- | --- | --- |
| 配置 | 标题、导航、设置选项、目录、页尾、界面文字 | `docs/config.ts` 与语言的 `config.ts`，见[配置](/zh-CN/getting-started/configuration) |
| 替换组件 | 品牌顶栏、特殊的页尾、自定义正文容器 | 主题入口的 `enhanceApp` |
| CSS 变量 | 圆角、间距、表面颜色、目录宽度 | 站点样式 |

## 替换组件

在主题入口 `docs/.vitepress/theme/index.ts` 的 `enhanceApp` 中，先调用 `provideAkariSiteData` 把站点的语言与配置数据交给主题，再把要替换的部分交给 `provideAkariComponents`。没有给出的部分仍使用内置组件：

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

在自定义组件中调用主题的组合式函数，读取配置与状态，例如 `useAkariConfig()`、`useSidebar()`。可以替换的部分与可用的函数见[接口](/zh-CN/theme/extending/api)。

## CSS 变量

在站点样式中覆盖主题与 m3e 组件的变量：

```css
:root {
  --akari-doc-radius: 24px;
  --akari-doc-max-width: 1440px;
}
```

单个组件也可以就地覆盖变量。下面三张卡片只改了圆角：

<div class="demo-grid">
  <m3e-card variant="outlined" style="--m3e-card-shape: 4px;">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">4px 圆角</m3e-heading>
    <div slot="content">更紧凑的卡片外观，适合工具面板与数据块。</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">默认圆角</m3e-heading>
    <div slot="content">沿用 m3e 卡片的默认形状令牌，与其它组件一致。</div>
  </m3e-card>
  <m3e-card variant="outlined" style="--m3e-card-shape: 28px;">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">28px 圆角</m3e-heading>
    <div slot="content">更大的圆角，更接近文档表面的视觉语言。</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined" style="--m3e-card-shape: 28px;">…</m3e-card>
```

优先覆盖主题与组件公开的变量。不要依赖组件内部的类名或 Shadow DOM 结构，类名与结构会随版本变化。

## 注意事项

- 替换组件时保留原来的根元素语义与无障碍属性，例如顶栏使用 `m3e-app-bar`、导航使用 `m3e-nav-menu`。键盘操作也要保留。
- 不要写死颜色，使用 `--md-sys-color-*` 令牌，才能跟随动态色、明暗与对比度。
- 用到新的 m3e 组件或图标时，在 `m3e.ts` 与 `icons.ts` 中按需注册，不要导入 `@m3e/web/all`。
- 不要在模块顶层访问 `window`、`document` 或 `localStorage`，否则服务端渲染会失败。
