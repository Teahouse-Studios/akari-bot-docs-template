---
tab: 接口
---

# 布局与顶栏：接口

## appBar

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | 站点 `title` | 顶栏中的站点名称 |
| `version` | `string` | 无 | 名称旁的版本标签，例如 `v1.0.0` |
| `logo` | `string` | 配置的 `logo` | 品牌图片；站内路径自动加上 `base` |
| `showSidebarToggle` | `boolean` | `true` | 窄屏时是否显示打开导航抽屉的菜单按钮 |
| `showSettingsToggle` | `boolean` | `true` | 是否显示设置按钮；`settings.enabled` 为 `false` 时始终隐藏 |
| `socialLinks` | `AkariSocialLink[]` | `[]` | 社交链接，在新标签页打开 |

`AkariSocialLink` 的字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `icon` | `string` | `github` 与 `npm` 显示内置的品牌图形，其他值作为已注册的 m3e 图标名 |
| `link` | `string` | 地址 |
| `label` | `string` | 按钮的无障碍名称与提示文字，也是「更多」菜单中的文字 |

## toc

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | 是否显示目录（右侧目录与窄屏的目录按钮） |
| `maxDepth` | `number` | `3` | 列出 `h2` 到 `h{maxDepth}`；限制在 1 到 6 |
| `overline` | `string` | 随语言，「本页内容」 | 目录顶部的小标题，也是目录导航的无障碍名称 |

单个页面在头部信息中写 `toc: false` 关闭目录。带 `m3e-toc-ignore` 属性的标题不进入目录。

## loadingBar

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | 页面加载时是否在窗口顶部显示进度条 |

## footer

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `message` | `string` | 随语言 | 页尾 logo 与站点名称下方的说明 |
| `copyright` | `string` | `""` | 页尾底部的版权信息；为空时不显示 |
| `showPrevNext` | `boolean` | `true` | 是否在平行页面的正文末尾显示组内的上一页、下一页卡片 |
| `links` | `AkariFooterLinkGroup[] \| false` | 取自导航 | 页尾的链接分栏；默认取导航的前四个分类，每栏最多六项；`false` 时不显示 |

```ts
footer: {
  links: [
    {
      title: "资源",
      items: [
        { text: "GitHub", link: "https://github.com/OasisAkari/vitepress-theme-akari-docs" },
        { text: "更新日志", link: "/changelog" },
      ],
    },
  ],
},
```

外部链接在新标签页打开。平行页面在链接分栏中合为一项。

## CSS 变量

在站点样式中覆盖，例如写在 `:root` 上：

| 变量 | 默认值 | 作用 |
| --- | --- | --- |
| `--akari-doc-radius` | `28px` | 文档表面与页尾表面的圆角 |
| `--akari-doc-padding` | `32px` | 表面的内边距，也是正文与目录之间的间距 |
| `--akari-doc-top-space` | `32px` | 文档表面与顶栏之间的距离 |
| `--akari-doc-max-width` | `1280px` | 表面内正文与目录的最大宽度，页尾内容使用同一宽度 |
| `--akari-doc-text-measure` | `760px` | 段落、列表、引用与提示块的最大行宽 |
| `--akari-doc-text-offset` | `22px` | 段落相对标题向内缩进的距离 |
| `--akari-doc-toc-offset` | `128px` | 目录吸附在顶栏下方的距离 |
| `--akari-toc-width` | `208px` | 目录的宽度 |
| `--akari-doc-gap` | `16px` | 锚点跳转时标题与顶栏之间的距离 |
| `--akari-doc-surface-color` | `--md-sys-color-surface` | 文档表面与页尾表面的底色；需要写在 `m3e-theme` 之内（例如 `.akari-main`），颜色令牌才能解析 |
| `--akari-doc-divider-strength` | `30%` | rail 分隔线与滚动后表面描边的深浅 |
| `--akari-wavy-divider-color` | `--md-sys-color-outline-variant` | 页尾波浪分隔线的颜色 |
| `--akari-doc-app-bar-height` | `64px` | 顶栏高度；只读，用于计算吸附位置 |
| `--akari-doc-rail-width` | `96px` | rail 的宽度；只读 |
| `--akari-loading-bar-height` | `4px` | 加载进度条的高度 |
| `--akari-loading-bar-color` | `--md-sys-color-primary` | 加载进度条的颜色 |

```css
:root {
  --akari-doc-radius: 24px;
  --akari-doc-max-width: 1440px;
}

.akari-main {
  --akari-doc-surface-color: var(--md-sys-color-surface-container-lowest);
}
```

## 页面状态

| 标记 | 位置 | 含义 |
| --- | --- | --- |
| `data-akari-ready` | `html` | m3e 组件已注册完成 |
| `data-akari-scrolled` | `html` | 文档表面已滚到顶栏下方 |
| `akari-tabs-pinned` | `html` 的类名 | 平行页面的标签栏固定在顶栏下方 |
| `data-akari-page-title` | 元素 | 顶栏标题替换时跟随的页面标题，默认是正文的 `h1` 或头图中的标题 |

| 元素 id | 内容 |
| --- | --- |
| `akari-doc-content` | 正文容器，目录从中读取标题；即导出的 `AKARI_CONTENT_ID` |
| `akari-sidebar` | 移动端导航抽屉；`AKARI_SIDEBAR_ID` |
| `akari-settings` | 设置面板；`AKARI_SETTINGS_ID` |

## 替换组件

顶栏、桌面导航、移动端抽屉、头图、目录、翻页卡片、页尾与正文容器都可以替换，见[扩展主题](/zh-CN/theme/extending/api#provideakaricomponents)。
