---
icon: translate
order: 6
tab: 概览
parallel:
  - api
  - details
---

# 国际化

每种语言对应 `docs` 下的一个文件夹，文件夹名就是语言代码，例如 `zh-CN`、`en-US`。根语言放在站点根路径，其他语言的地址以文件夹名开头。当前页面的语言决定界面文字、导航、页尾与搜索范围。

界面文字、字体、文字方向与 Markdown 中的文字属于语言本身，不写在站点配置里。这些内容放在[语言包](#语言包)中，按语言代码匹配。所以添加一种语言时，只需要写这个站点自己的内容。

## 添加一种语言

1. 在 `docs` 下新建以语言代码命名的文件夹，在其中写 `config.ts`：

   ```ts
   // docs/zh-CN/config.ts
   import { defineAkariConfig } from "../.vitepress/theme/define.ts";

   export default defineAkariConfig({
     // 语言的自称是“中文”，这里改为更明确的名称。
     label: "简体中文",
     title: "Vitepress Theme Akari Docs",
     appBar: { title: "Vitepress Theme Akari Docs" },
     sidebar: {
       categories: {
         "getting-started": { text: "开始" },
         theme: { text: "主题" },
       },
     },
     footer: { message: "基于 VitePress 与 M3E Web Components 构建" },
   });
   ```

2. 按与根语言相同的结构放入页面。`docs/zh-CN/index.md` 是这种语言的首页。`docs/zh-CN/getting-started/installation/index.md` 对应英文的 `/getting-started/installation.html`，地址为 `/zh-CN/getting-started/installation.html`。
3. 需要时在共用配置中用 `rootLanguage` 指定根语言。

语言配置叠加在共用配置之上，所以只需要写这种语言的标题与分类名称。版本号、社交链接、分类图标等沿用共用配置。

语言菜单中的名称默认取语言的自称（English、日本語）。文字方向、界面文字、代码块复制按钮与提示块标题来自语言包，都可以在语言配置中改写。

## 语言切换

站点有两种以上语言时，rail 底部出现语言按钮，窄屏时按钮在导航抽屉底部。点击后打开“选择语言”对话框。

- 目标语言中有对应页面时，停留在这一页。没有对应页面时，打开目标语言的首页。所以即使一种语言只翻译了一部分页面，也不会把读者带到 404。
- logo、页尾的站点名称与 404 页的“返回首页”都指向当前语言的首页。

## 语言包

一个语言包描述一种语言，内容包括界面文字、字体、文字方向与 Markdown 中的文字。界面文字指按钮、目录、翻页、设置与搜索中的文字，Markdown 中的文字指代码块复制按钮与提示块标题。

主题内置简体中文、英文、日文、韩文、法文与阿拉伯文六个语言包。页面按 `lang` 找语言包，先找完整代码，再找主语言（`zh-TW` 用 `zh`）。两处都找不到时用英文，语言包中没有的条目也取英文。

主题没有内置的语言时，写一个语言包，放进共用配置的 `languages`：

```ts
// docs/.vitepress/languages/de.ts
import { defineAkariLanguage } from "../theme/define.ts";

export default defineAkariLanguage({
  code: "de",
  messages: {
    tocOverline: "Auf dieser Seite",
    previousPage: "Zurück",
    nextPage: "Weiter",
    searchPlaceholder: "Suchen",
  },
  markdown: {
    codeCopyButton: { tooltipText: "Code kopieren", copiedText: "Kopiert" },
    container: { tipLabel: "Tipp", warningLabel: "Warnung" },
  },
});
```

```ts
// docs/config.ts
import de from "./.vitepress/languages/de.ts";

export default defineAkariConfig({
  languages: [de],
});
```

之后 `de-DE`、`de-AT` 等语言文件夹都使用这个语言包。`code` 与内置语言包相同时，这个语言包叠在内置语言包上：写出的文字替换对应条目，`fonts` 与 `dir` 整项替换。只需要改本站某一种语言的个别文字时，也可以直接在这种语言的配置中写 `messages`。

## 本站的语言

本站有英文、中文、日文、韩文、法文与阿拉伯文六个版本，英文放在站点根路径。每一页都有六种语言，切换语言时停留在同一页。阿拉伯文版从右到左排版，可以用来查看主题的 RTL 布局。

全部界面文字与语言相关的函数见[接口](/zh-CN/theme/i18n/api)。语言的识别与切换规则见[技术细节](/zh-CN/theme/i18n/details)。
