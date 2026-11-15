---
icon: tune
order: 2
tab: 概览
parallel:
  - api
  - details
---

# 配置

配置写在 `docs` 目录中，分两层：

- `docs/config.ts`：各语言共用的配置。
- `docs/<语言代码>/config.ts`：一种语言的配置，例如 `docs/zh-CN/config.ts`。有 `config.ts` 的文件夹就是语言文件夹。

语言配置里的字段会替换共用配置中的同名字段。对象按字段逐个合并，因此语言配置只需写与共用配置不同的部分。`docs/.vitepress/config.mts` 只负责把主题接入 VitePress，一般不需要修改。

```text
docs/
├─ config.ts                 共用配置
├─ en-US/                    English，放在站点根路径
│  ├─ config.ts              语言配置
│  └─ …                      页面，见“撰写页面”
├─ zh-CN/                    简体中文，放在 /zh-CN/
│  ├─ config.ts
│  └─ …
└─ .vitepress/config.mts
```

## 共用配置

以下内容各语言相同：根语言、logo、版本号与社交链接、分类的图标与顺序、设置与搜索。

```ts
// docs/config.ts
import { defineAkariConfig } from "./.vitepress/theme/define.ts";

export default defineAkariConfig({
  // 放在站点根路径的语言文件夹
  rootLanguage: "en-US",
  logo: "/logo.svg",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
  appBar: {
    version: "v1.0.0",
    socialLinks: [
      { icon: "github", link: "https://github.com/OasisAkari/vitepress-theme-akari-docs", label: "GitHub" },
    ],
  },
  sidebar: {
    // 分类的文件夹名与图标，键的顺序就是 rail 中的顺序
    categories: {
      "getting-started": { icon: "rocket_launch" },
      theme: { icon: "palette" },
    },
  },
  settings: { storageKey: "akari-docs-settings" },
  search: { maxResults: 8 },
  footer: { copyright: "Vitepress Theme Akari Docs" },
});
```

## 语言配置

语言配置里写这种语言在本站的标题与文字。`lang` 默认取文件夹名，主题按 `lang` 选择[语言包](/zh-CN/theme/i18n#语言包)。语言菜单中的名称、文字方向、界面文字与代码块复制按钮的文字都由语言包提供，需要时在这里改写。

```ts
// docs/zh-CN/config.ts
import { defineAkariConfig } from "../.vitepress/theme/define.ts";

export default defineAkariConfig({
  // 语言的自称是“中文”，这里改为更明确的名称。
  label: "简体中文",
  title: "Vitepress Theme Akari Docs",
  description: "基于 VitePress 与 M3E Web Components 的文档主题",
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

## 常见改动

| 想要 | 写在 | 字段 |
| --- | --- | --- |
| 改站点名称 | 语言配置 | `title`、`appBar.title` |
| 加版本号或社交链接 | 共用配置 | `appBar.version`、`appBar.socialLinks` |
| 调整分类的顺序或图标 | 共用配置 | `sidebar.categories` |
| 改分类名称 | 语言配置 | `sidebar.categories.<文件夹>.text` |
| 改默认配色与明暗模式 | 共用配置 | `settings.defaults` |
| 关闭搜索或接入搜索后端 | 共用配置 | `search` |
| 改页尾的说明与版权 | 语言配置 / 共用配置 | `footer.message`、`footer.copyright` |
| 改写界面文字 | 语言配置 | `messages` |
| 新增一种语言 | 新的语言文件夹 | 见[国际化](/zh-CN/theme/i18n) |

全部字段的类型与默认值见[接口](/zh-CN/getting-started/configuration/api)。配置怎样叠加、怎样生成语言与导航，见[技术细节](/zh-CN/getting-started/configuration/details)。
