---
tab: 接口
---

# 国际化：接口

## 语言配置

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `rootLanguage` | `string` | 按字母顺序的第一个语言文件夹 | 只在共用配置中有效：放在站点根路径的语言 |
| `lang` | `string` | 语言文件夹名 | 语言代码，用于 `<html lang>` 与选择语言包 |
| `label` | `string` | 语言的自称 | 语言菜单中的名称，例如 `ja-JP` 默认为“日本語” |
| `dir` | `"ltr" \| "rtl" \| "auto"` | 语言包的方向 | 文字方向。设置中的文字方向为“跟随语言”时采用此值 |
| `markdown` | `MarkdownLocaleOptions` | 语言包的 | 这种语言在 Markdown 中的文字，叠在语言包之上，例如 `codeCopyButton: { tooltipText, copiedText }` |
| `messages` | `Partial<AkariMessages>` | 无 | 改写或补全界面文字 |
| `languages` | `AkariLanguage[]` | 无 | 内置之外的语言包，或对内置语言包的改写。一般写在共用配置中 |

其余字段（`title`、`description`、`appBar`、`footer`、`search` 等）同样可以写在语言配置中，见[配置](/zh-CN/getting-started/configuration/api)。

## AkariLanguage

用 `defineAkariLanguage` 书写语言包（从 `docs/.vitepress/theme/define.ts` 导入）。结构如下：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `code` | `string` | 必填，语言代码。页面先找完整代码相同的语言包（`pt-BR`），再找主语言相同的（`pt`） |
| `dir` | `"ltr" \| "rtl"` | 文字方向，缺省为 `"ltr"` |
| `fonts` | `{ google: string[]; family: string[] }` | 字体，两项的写法同 [`fonts`](/zh-CN/styles/typography/api#fonts)。缺省为主题的字体（Roboto 与思源黑体） |
| `messages` | `Partial<AkariMessages>` | 界面文字，缺少的条目用英文 |
| `markdown` | `MarkdownLocaleOptions` | Markdown 中的文字：`codeCopyButton` 是代码块复制按钮的提示。`container` 是提示块的默认标题（`tipLabel`、`warningLabel`、`dangerLabel`、`infoLabel`、`detailsLabel` 等） |

内置语言包在 `docs/.vitepress/theme/i18n/languages/`，每种语言一个文件，由同一目录的 `index.ts` 列出。给主题本身增加一种内置语言时，就在这里加一个文件，并把它列入 `AKARI_LANGUAGES`。

## messages

内置语言包有六个：简体中文（`zh`）、英文（`en`）、日文（`ja`）、韩文（`ko`）、法文（`fr`）与阿拉伯文（`ar`）。每个语言包都带完整的界面文字。

语言配置的 `messages` 中写出的条目替换语言包的文字，没写的条目沿用语言包。带 `{name}` 的条目在运行时填入对应的值。

### 导航与顶栏

| 键 | 中文默认值 |
| --- | --- |
| `navigationToggle` | 切换导航 |
| `navigationLabel` | 文档导航 |
| `railLabel` | 文档分类 |
| `categoryNavigation` | {category}导航 |
| `categoryPages` | {category}页面 |
| `homeLink` | {title}首页 |
| `moreActions` | 更多 |
| `backToTop` | 返回顶部 |
| `tocButton` | 目录 |
| `languageLabel` | 切换语言 |
| `languageDialogTitle` | 选择语言 |
| `languageDialogClose` | 关闭 |
| `loadingLabel` | 正在加载页面 |

### 目录、翻页与页尾

| 键 | 中文默认值 |
| --- | --- |
| `tocOverline` | 本页内容 |
| `pagerLabel` | 文档翻页 |
| `previousPage` | 上一页 |
| `nextPage` | 下一页 |
| `footerMessage` | 基于 VitePress 与 M3E 构建 |
| `footerLinks` | 页脚链接 |
| `notFoundTitle` | 页面不存在 |
| `notFoundText` | 你访问的页面可能已被移动或删除。 |
| `notFoundLink` | 返回首页 |

### 设置

| 键 | 中文默认值 |
| --- | --- |
| `settingsTitle` | 设置 |
| `settingsClose` | 关闭设置 |
| `settingsColor` | 颜色 |
| `settingsVariant` | 色调变体 |
| `settingsContrast` | 对比度 |
| `settingsMotion` | 动效 |
| `settingsDirection` | 文字方向 |
| `settingsTextSize` | 字号 |
| `contrastStandard` | 默认 |
| `contrastMedium` | 中等 |
| `contrastHigh` | 高 |
| `motionStandard` | 标准 |
| `motionExpressive` | 表现力 |
| `directionAuto` | 跟随语言 |
| `directionLtr` | 从左到右 |
| `directionRtl` | 从右到左 |

### 明暗模式

| 键 | 中文默认值 |
| --- | --- |
| `schemeToggle` | 明暗模式：{mode} |
| `schemeLight` | 日间 |
| `schemeAuto` | 跟随系统 |
| `schemeDark` | 夜间 |
| `schemeTime` | 跟随时间 |
| `schemeChanged` | 当前主题已切换至：{mode}模式 |
| `schemeChangedFollowing` | 当前主题已切换至：{mode}模式（{scheme}） |

### 搜索

| 键 | 中文默认值 |
| --- | --- |
| `searchPlaceholder` | 搜索文档 |
| `searchLabel` | 搜索文档 |
| `searchShortcutLabel` | {label}，快捷键 {shortcut} |
| `searchClose` | 关闭搜索 |
| `searchIntroTitle` | 搜索文档 |
| `searchIntroText` | 输入页面标题、组件名或正文关键词。 |
| `searchIntroShortcut` | 使用 {keys} 随时打开 |
| `searchLoading` | 正在搜索… |
| `searchErrorTitle` | 搜索暂时不可用 |
| `searchRetry` | 重试 |
| `searchEmptyTitle` | 没有找到结果 |
| `searchEmptyText` | 尝试更短的关键词，或检查搜索后端配置。 |
| `searchResultCountOne` | {count} 个结果 |
| `searchResultCount` | {count} 个结果 |
| `searchResultsLabel` | 搜索结果 |
| `searchResultPage` | 文档 |
| `searchHintSelect` | 选择 |
| `searchHintOpen` | 打开 |
| `searchHintClose` | 关闭 |
| `searchFailed` | 搜索失败，请稍后重试。 |
| `searchIndexUnavailable` | 无法加载本地搜索索引。 |
| `searchIndexInvalid` | 本地搜索索引格式无效。 |
| `searchRequestFailed` | 搜索请求失败（HTTP {status}）。 |
| `searchBackendMissing` | 未找到搜索后端 "{id}"。 |

`searchResultCountOne` 用于复数类别为 `one` 的数量（英文的“1 result”），其他数量用 `searchResultCount`。类别由 `Intl.PluralRules` 按语言判断。`{keys}` 在显示时渲染为键帽。

## useAkariI18n

```ts
import { useAkariI18n } from "@theme";

const { lang, messages, t } = useAkariI18n();
t("homeLink", { title: "Vitepress Theme Akari Docs" }); // "Vitepress Theme Akari Docs首页"
```

| 返回值 | 说明 |
| --- | --- |
| `lang` | 当前语言代码 |
| `messages` | 当前语言的全部界面文字，已合并 `messages` 配置 |
| `t(key, params?)` | 取一条文字并填入占位符 |

## useAkariLocales

```ts
import { useAkariLocales } from "@theme";

const { locales, homeHref } = useAkariLocales();
```

| 返回值 | 说明 |
| --- | --- |
| `locales` | 语言列表，每项为 `{ key, label, lang, href, current }`。`href` 是切换到这种语言时要打开的地址。站点只有一种语言时为空数组 |
| `homeHref` | 当前语言首页的地址，已加上 `base` |

两个函数都只能在布局内部的组件中调用。

## 语言包的函数

都从主题入口导出（`import { … } from "@theme"`），可以在任何地方调用。

| 导出 | 说明 |
| --- | --- |
| `AKARI_LANGUAGES` | 内置的语言包 |
| `resolveLanguage(lang, languages?)` | 一种语言最终使用的语言包：返回 `{ code, dir, fonts, messages, markdown }`，空缺已按上述规则补齐。`languages` 是站点自己的语言包 |
| `defineAkariLanguage(language)` | 书写语言包时的类型辅助 |

## 搜索中的语言

注册的搜索后端在第二个参数中收到 `lang`（如 `zh-CN`）与 `locale`（VitePress 语言键，根语言为 `root`），见[搜索](/zh-CN/theme/search/api#注册的后端)。
