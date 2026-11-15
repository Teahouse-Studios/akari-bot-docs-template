---
tab: 接口
---

# 扩展主题：接口

## provideAkariComponents

```ts
import { provideAkariComponents } from "./composables/useAkariConfig";

function provideAkariComponents(
  app: App,
  components: Partial<Record<AkariComponentSlot, Component>>,
): void;
```

在主题入口的 `enhanceApp` 中调用。给出的组件替换对应的部分，没有给出的使用内置组件。配置文件只能写数据，所以组件在这里提供，而不是写在配置中。

| 槽位 | 替换的部分 | 内置组件 |
| --- | --- | --- |
| `AppBar` | 顶栏 | `m3e-app-bar` 顶栏 |
| `DesktopNav` | 桌面端 rail 与导航抽屉 | `m3e-nav-rail` 与 `m3e-nav-menu`。根元素 `display: contents`，rail 占页面网格第 1 列整高，常驻抽屉在第 2 列第 2 行 |
| `Sidebar` | 窄屏的导航抽屉 | 递归的 `m3e-nav-menu` |
| `Settings` | 设置模态框中的面板 | 六组选项。标题、关闭按钮与动效由模态框提供 |
| `Hero` | 页面头图 | 标题卡片与图片卡片，只在头部信息有 `hero` 时渲染 |
| `Toc` | 右侧目录 | 悬挂的目录 |
| `Pager` | 正文末尾的翻页 | 上一页、下一页卡片 |
| `Footer` | 页尾 | 波浪分隔线与页尾表面 |
| `Content` | Markdown 内容的外层容器 | 没有样式的 `div` |

一个最简的顶栏：

```vue
<script setup lang="ts">
import { useAkariConfig } from "@theme";

const config = useAkariConfig();
</script>

<template>
  <m3e-app-bar>
    <span slot="title">{{ config.appBar.title }}</span>
    <m3e-chip v-if="config.appBar.version" slot="trailing">
      {{ config.appBar.version }}
    </m3e-chip>
  </m3e-app-bar>
</template>
```

实际替换顶栏时，还要保留打开窄屏导航抽屉的开关（`<m3e-drawer-toggle for="akari-sidebar">`）。否则窄屏无法打开导航。

## 组合式函数

都从主题入口导出（`import { … } from "@theme"`），只能在布局内部的组件中调用。

| 函数 | 返回 | 详见 |
| --- | --- | --- |
| `useAkariConfig()` | `ComputedRef<ResolvedAkariThemeConfig>`：合并默认值后的主题配置 | 下文 |
| `useSidebar()` | `{ items, prevNext, tabGroup, isActive, hasActive }` | [侧边导航](/zh-CN/theme/sidebar/api#usesidebar) |
| `useAkariSettings()` | `{ settings, setSetting, reset, isDefault, defaults, sections, labels }` | [设置](/zh-CN/theme/settings/api#useakarisettings) |
| `useAkariColorScheme()` | `{ mode, resolved, cycle }` | [设置](/zh-CN/theme/settings/api#useakaricolorscheme) |
| `useAkariI18n()` | `{ lang, messages, t }` | [国际化](/zh-CN/theme/i18n/api#useakarii18n) |
| `useAkariLocales()` | `{ locales, homeHref }` | [国际化](/zh-CN/theme/i18n/api#useakarilocales) |
| `useAkariSearch()` | 搜索面板的状态与操作 | [搜索](/zh-CN/theme/search/api#useakarisearch) |

`useAkariConfig()` 的结果包含 `lang`、`messages`、`appBar`、`sidebar`、`settings`、`toc`、`footer`、`search`、`fonts` 与 `components`。每一组都已填好默认值并做过校验，例如 `toc.maxDepth` 限制在 1 到 6。

## 其他导出

| 导出 | 类型 | 用途 |
| --- | --- | --- |
| `defineAkariConfig` | `(config: AkariSiteConfig) => AkariDirectoryConfig` | 写配置文件，见[配置](/zh-CN/getting-started/configuration/api#defineakariconfig) |
| `defineAkariThemeConfig` | `(config: AkariThemeConfig) => AkariThemeConfig` | 只写主题字段时的类型辅助 |
| `registerSearchBackend` | `(id, handler) => void` | 注册搜索后端，见[搜索](/zh-CN/theme/search/api#注册的后端) |
| `defineAkariLanguage` | `(language: AkariLanguage) => AkariLanguage` | 写语言包，见[国际化](/zh-CN/theme/i18n/api#akarilanguage) |
| `AKARI_LANGUAGES` | `AkariLanguage[]` | 内置的语言包 |
| `resolveLanguage` | `(lang, languages?) => ResolvedAkariLanguage` | 一种语言最终使用的语言包 |
| `AKARI_CONTENT_ID` | `"akari-doc-content"` | 正文容器的 id |
| `AKARI_SIDEBAR_ID` | `"akari-sidebar"` | 窄屏导航抽屉的 id |
| `AKARI_SETTINGS_ID` | `"akari-settings"` | 设置面板的 id |

类型（`AkariThemeConfig`、`AkariSidebarItem`、`AkariSearchResult` 等）都从 `types.ts` 导出。

## CSS 变量

| 范围 | 变量 | 详见 |
| --- | --- | --- |
| 文档表面、目录、页尾 | `--akari-doc-*`、`--akari-toc-width`、`--akari-wavy-divider-color` | [布局与顶栏](/zh-CN/theme/layout/api#css-变量) |
| 平行页面的标签栏 | `--akari-app-bar-tabs-gap`、`--akari-page-tabs-docked-max-width` | [侧边导航](/zh-CN/theme/sidebar/api#标签栏的-css-变量) |
| 头图与图案 | `--akari-doc-hero-*`、`--akari-pattern-*` | [头图](/zh-CN/theme/hero/api#css-变量) |
| 颜色 | `--md-sys-color-*` | [色彩](/zh-CN/styles/color/api) |
| 排版 | `--md-sys-typescale-*` | [排版](/zh-CN/styles/typography/api) |
| m3e 组件 | 如 `--m3e-card-shape`、`--m3e-button-*` | m3e 组件文档 |

## 源码结构

```text
docs/.vitepress/
├── config.mts             把主题接入 VitePress
├── content/               由目录生成语言、地址与导航（Node）
└── theme/
    ├── index.ts           主题入口与公开导出
    ├── define.ts          defineAkariConfig 与 defineAkariLanguage
    ├── config.ts          配置的默认值与校验
    ├── types.ts           类型定义
    ├── constants.ts       默认值、断点与 id
    ├── i18n/              语言包与语言的解析
    │   └── languages/     内置语言包，每种语言一个文件
    ├── locales.ts         语言切换的路径换算
    ├── sidebar.ts         导航的归一化、匹配与翻页
    ├── settings.ts        设置的校验与存储
    ├── scheme.ts          明暗模式的解析与首帧脚本
    ├── hero.ts            头图头部信息的解析
    ├── loading.ts         加载进度条的进度计算
    ├── head.ts / fonts.ts akariHead 与字体
    ├── markdown.ts        akariMarkdown
    ├── m3e.ts / icons.ts  按需注册组件与图标
    ├── layouts/           AkariLayout.vue
    ├── components/
    │   ├── shell/         顶栏、更多菜单、明暗模式与语言按钮、对话框、加载进度条
    │   ├── sidebar/       rail、桌面导航抽屉、窄屏导航
    │   ├── content/       头图、标签栏、目录、翻页、悬浮按钮、页尾
    │   └── settings/      设置模态框与面板
    ├── composables/       组合式函数
    ├── search/            搜索面板、后端与状态
    └── styles/            令牌、外壳、正文、图案与标签栏样式
```

与浏览器无关的逻辑（配置解析、导航匹配、语言路径、设置校验、头图解析、动效曲线等）都是纯函数。单元测试在仓库根目录的 `tests/` 中。
