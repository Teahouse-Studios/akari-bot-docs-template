---
tab: 接口
---

# 配置：接口

## defineAkariConfig

```ts
import { defineAkariConfig } from "./.vitepress/theme/define.ts";

function defineAkariConfig(config: AkariSiteConfig): AkariDirectoryConfig;
```

两层配置文件都用 `defineAkariConfig` 导出配置。VitePress 的字段原样保留，主题的字段放进 `themeConfig.akari`，由 VitePress 读取，并带有类型提示。类型定义在 `docs/.vitepress/theme/types.ts`。

## 站点与语言

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `rootLanguage` | `string` | 按字母顺序的第一个语言文件夹 | 只在共用配置中有效：这是放在站点根路径的语言文件夹。其他语言的地址以文件夹名开头 |
| `lang` | `string` | 语言文件夹名 | 语言代码。用于 `<html lang>`，也用于选择[语言包](/zh-CN/theme/i18n/api#akarilanguage) |
| `label` | `string` | 语言的自称 | 语言菜单中的名称 |
| `dir` | `"ltr" \| "rtl" \| "auto"` | 语言包的方向 | 文字方向 |
| `title` | `string` | 无 | 站点标题，也是顶栏标题的默认值 |
| `titleTemplate` | `string \| boolean` | 无 | 页面标题的后缀或模板，同 VitePress |
| `description` | `string` | 无 | 站点描述 |
| `head` | `HeadConfig[]` | `[]` | 额外的 `<head>` 标签，与上层合并 |
| `logo` | `string` | 无 | 顶栏与页尾的品牌图片 |
| `markdown` | `MarkdownLocaleOptions` | 语言包的 | 这种语言在 Markdown 中的文字，例如代码块复制按钮的提示，会叠在语言包之上 |
| `images` | `AkariImagesConfig` | 无 | 构建时如何处理站点用到的图片：`webp` 会把构建后页面引用到的所有位图转换成 WebP，并让页面指向它 |

`lang`、`label`、`dir` 与 `markdown` 描述一种语言，写在语言配置中。其余字段都可以写在共用配置中作为默认值，再由语言配置覆写。

## 主题字段

| 字段 | 内容 | 详见 |
| --- | --- | --- |
| `appBar` | 顶栏标题、版本、logo、按钮与社交链接 | [布局与顶栏](/zh-CN/theme/layout/api#appbar) |
| `toc` | 右侧目录 | [布局与顶栏](/zh-CN/theme/layout/api#toc) |
| `loadingBar` | 页面加载时窗口顶部的进度条 | [布局与顶栏](/zh-CN/theme/layout/api#loadingbar) |
| `footer` | 翻页卡片与页尾 | [布局与顶栏](/zh-CN/theme/layout/api#footer) |
| `sidebar` | 分类、手写导航与抽屉宽度 | [侧边导航](/zh-CN/theme/sidebar/api#sidebar) |
| `settings` | 设置模态框与明暗模式按钮 | [设置与明暗模式](/zh-CN/theme/settings/api#settings) |
| `search` | 搜索入口与后端 | [搜索](/zh-CN/theme/search/api#search) |
| `messages` | 界面文字 | [国际化](/zh-CN/theme/i18n/api#messages) |
| `fonts` | 是否从 Google Fonts 加载字体，以及字体序列 | [排版](/zh-CN/styles/typography/api#fonts) |
| `languages` | 内置之外的语言包，或对内置语言包的改写 | [国际化](/zh-CN/theme/i18n/api#akarilanguage) |

替换界面组件不通过配置文件完成，见[扩展主题](/zh-CN/theme/extending/api#provideakaricomponents)。

## .vitepress/config.mts

把主题接入 VitePress 的部分，一般不需要修改：

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { akariContent } from "./content";
import { akariHead } from "./theme/head";
import { akariMarkdown } from "./theme/markdown";

const docsDir = fileURLToPath(new URL("../", import.meta.url));
const content = await akariContent(docsDir);

export default defineConfig({
  ...content.site,
  cleanUrls: false,
  appearance: false,
  head: akariHead(),
  markdown: { config: (md) => akariMarkdown(md) },
  vue: {
    template: {
      compilerOptions: { isCustomElement: (tag) => tag.startsWith("m3e-") },
    },
  },
  vite: {
    plugins: [content.plugin],
  },
});
```

| 选项 | 作用 |
| --- | --- |
| `...content.site` | 由目录生成的 `locales`、`rewrites` 与站点级 `lang`、`title`、`description`。使用本地搜索时，还会带上 `themeConfig.search`，用于开启 VitePress 的本地搜索索引 |
| `cleanUrls: false` | 页面地址带 `.html`，与产物中的文件一一对应。改为 `true` 时地址不带扩展名，部署要求见[安装](/zh-CN/getting-started/installation#部署) |
| `appearance: false` | 关闭 VitePress 自带的明暗切换，由主题管理 |
| `head: akariHead()` | 首帧前应用明暗模式的脚本 |
| `akariMarkdown` | 表格的 M3 边框与远程图片的尺寸 |
| `isCustomElement` | 让 Vue 把 `m3e-*` 当作自定义元素 |
| `content.plugin` | 开发时随 Markdown 的增删与头部信息更新导航 |

## akariContent

```ts
function akariContent(
  srcDir: string,
  logger?: { warn(message: string): void },
): Promise<AkariContent>;
```

读取 `srcDir` 中的配置文件与目录。`logger` 默认是 `console`，会收到结构之外的页面、找不到的平行页面等提示。

| 返回字段 | 类型 | 说明 |
| --- | --- | --- |
| `site` | `{ lang, title, description, locales, rewrites }` | 展开到 `defineConfig` 中 |
| `plugin` | Vite `Plugin` | 开发服务器中更新导航 |
| `route` | `(page: string) => string` | 源文件路径 → 页面地址，如 `zh-CN/theme/layout/index.md` → `/zh-CN/theme/layout` |
| `rewrite` | `(page: string) => string` | 源文件路径 → VitePress 的服务路径，如 `zh-CN/theme/layout/index.md` → `theme/layout.md` |
| `languages` | `{ folder, key, prefix }[]` | 语言文件夹，根语言在前。`key` 是 VitePress 的语言键（根语言为 `root`），`prefix` 是地址前缀 |
| `config` | `AkariSiteConfig \| undefined` | 共用配置按 `config.ts` 写下的样子，供构建在任何页面存在之前读取，例如 `images` |

## akariHead

```ts
function akariHead(options?: {
  storageKey?: string;
  defaultScheme?: "light" | "dark" | "auto" | "time";
}): HeadConfig[];
```

返回一段在首帧绘制前应用明暗模式的内联脚本。字体的 `<head>` 标签随语言不同，由 `akariContent` 写入各语言的 locale，见[排版](/zh-CN/styles/typography/api#fonts)。修改 `settings.storageKey` 或 `settings.defaults.scheme` 时，把同样的值传进来，脚本才会读到同一份设置。

## akariMarkdown

```ts
function akariMarkdown(
  md: MarkdownRenderer,
  options?: { remoteImageSize?: boolean | AkariImageSizeOptions },
): void;
```

在 `markdown.config` 中调用，做两件事：

- 把每个 Markdown 表格包进 `<div class="akari-table">`，表格因此有 M3 的描边边框与横向滚动。
- 用 [markdown-it-image-size](https://github.com/boyum/markdown-it-image-size) 给远程图片写上宽高。本地图片的宽高由 VitePress 自己写入。详见[撰写页面](/zh-CN/getting-started/writing/api#图片)。

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `remoteImageSize` | `true` | `false` 时不测量远程图片。也可以写成插件的选项，例如 `{ cacheDir: ".image-size" }` 把缓存放进仓库，`{ cache: false }` 不缓存 |
