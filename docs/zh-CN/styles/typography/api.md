---
tab: 接口
---

# 排版：接口

## 字体

正文的字体按页面的语言选择，默认值来自[语言包](/zh-CN/theme/i18n/api#akarilanguage)的 `fonts`。下表是内置语言包的字体，都可以用 [`fonts`](#fonts) 改写：

| 语言 | 从 Google Fonts 加载 | 字体序列 |
| --- | --- | --- |
| `ja` | Roboto、Noto Sans JP | Roboto、Noto Sans JP、Hiragino Sans、Hiragino Kaku Gothic ProN、Yu Gothic UI、Yu Gothic、Meiryo、system-ui、sans-serif |
| `ko` | Roboto、Noto Sans KR | Roboto、Noto Sans KR、Apple SD Gothic Neo、Malgun Gothic、system-ui、sans-serif |
| `ar` | Roboto、Noto Sans Arabic | Roboto、Noto Sans Arabic、Geeza Pro、Tahoma、system-ui、sans-serif |
| 其他 | Roboto、Noto Sans SC | Roboto、Noto Sans SC、PingFang SC、Microsoft YaHei、system-ui、sans-serif |

语言按语言包的规则匹配：先找完整代码，再找主语言，例如 `ja-JP` 取 `ja` 一行。英文、法文等没有 `fonts` 的语言包取“其他”一行。

- 上表中从 Google Fonts 加载的字体都是可变字重。思源黑体与日文、韩文字体按 Unicode 范围切片，页面只下载用到的字符。
- 每种语言只加载自己的字体。日文、韩文与阿拉伯文字体只在这种语言的页面上加载，切换到这种语言时才下载。
- 字体不阻塞页面显示。`<head>` 中只有预连接与 `preload`，样式表由主题脚本插入。
- `display=swap` 让文字先用回退字体显示。没有脚本时，由 `<noscript>` 中的样式表生效。
- Google Fonts 无法访问时，文字使用序列中后面的系统字体。
- 页面中标记了另一种语言的片段使用那种语言包的字体序列，只取本机已有的字体。语言对话框中各种语言的名称就属于这种片段。

## fonts

```ts
fonts?: {
  google?: boolean | string[];
  family?: string[];
};
```

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `google` | `boolean \| string[]` | `true` | 从 Google Fonts 加载的字体。`false` 不加载，只使用读者设备上的字体。`true` 加载上表中这种语言的字体。数组列出要加载的字体，每项写成 Google Fonts css2 接口的 `family` 参数，例如 `"Noto Sans JP:wght@100..900"` |
| `family` | `string[]` | 上表中这种语言的序列 | 正文的 `font-family`，按顺序排列，每个字符使用第一个包含它的字体。字体名不加引号。`system-ui`、`sans-serif` 等通用字体族照原样写 |

两个字段互不影响。换用其他 Google Fonts 字体时，也要把该字体写进 `family`。`fonts` 写在共用配置中时对所有语言生效，写在语言配置中时只对这种语言生效：

```ts
// docs/config.ts：所有语言都不从 Google Fonts 加载字体
export default defineAkariConfig({
  fonts: { google: false },
});
```

```ts
// docs/ja-JP/config.ts：日文页面改用 M PLUS 1p
export default defineAkariConfig({
  fonts: {
    google: ["M PLUS 1p:wght@400;500;700"],
    family: ["M PLUS 1p", "Hiragino Sans", "Meiryo", "sans-serif"],
  },
});
```

要改一种语言在所有站点中的默认字体，请改该语言包的 `fonts`。只改本站时，写 `fonts` 配置即可。

`akariContent` 按每种语言的语言包与配置，在该语言的页面 `<head>` 中写入三项内容：字体序列（CSS 变量 `--akari-font-family`）、标了 `lang` 的片段的字体规则与预加载标签。首帧就使用正确的字体，切换语言时主题随之更换。

实现在 `docs/.vitepress/theme/fonts.ts`：

- `resolveFonts(fonts, defaults, languages)` 由配置与语言包的字体得出样式表地址与 `font-family`。
- `markedFontRules(languages)` 生成片段的字体规则。
- `fontHead` 生成 `<head>` 标签。
- `applyFonts` 在页面中应用。
- 没有 `fonts` 的语言包使用 `AKARI_DEFAULT_FONTS`。

## 排版令牌

m3e 提供 Material 3 的排版令牌，每一级有四个属性：

```text
--md-sys-typescale-{角色}-{尺寸}-font-size
--md-sys-typescale-{角色}-{尺寸}-line-height
--md-sys-typescale-{角色}-{尺寸}-font-weight
--md-sys-typescale-{角色}-{尺寸}-tracking
```

角色为 `display`、`headline`、`title`、`body`、`label`，尺寸为 `large`、`medium`、`small`。例如：

```css
.note {
  font-size: var(--md-sys-typescale-body-medium-font-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}
```

## 正文标题

| 元素 | 字号 | 行高 | 字重 | 600px 以下 |
| --- | --- | --- | --- | --- |
| `h1` | 3.5625rem（57px） | 1.12 | 400 | 2.5rem |
| `h2` | 1.75rem（28px） | 1.3 | 500 | 1.5rem |
| `h3` | 1.5rem（24px） | 1.35 | 500 | 1.25rem |
| `h4` | 1.25rem（20px） | 1.4 | 500 | 1.125rem |

二级与三级标题进入目录。标题悬停时显示锚点链接。锚点 id 由 VitePress 按标题文字生成。

## 表格

开启 `akariMarkdown` 后，Markdown 表格包在 `.akari-table` 中：

- 外框是一圈 `outline-variant` 描边与 12px 圆角，内部没有竖线，行之间用分隔线隔开。
- 表头行在 `surface-container` 上，字体用 `label-large`，颜色用 `on-surface-variant`，不换行。
- 单元格用 `body-medium`。
- 指针所在的行显示状态层。过宽的表格在边框内横向滚动，不挤压文档表面。
- 直接写成 HTML 的 `<table>` 没有外框，表格本身的样式相同。

## 链接

- 不加下划线，文字前带一个与字号等大的图标：站内链接是 `link`，`target="_blank"` 的链接是 `open_in_new`。图标通过 CSS 遮罩绘制，从右到左排版时镜像。
- 指针悬停时显示与文字按钮相同的状态层。
- 不带图标的链接：标题锚点（`.header-anchor`）、脚注标记与返回链接、包着图片的链接、放进组件插槽的链接（带 `slot` 属性）。
- 强制颜色模式下使用系统的链接颜色。

## 图案

正文中带背景的元素和头图卡片一样，带一层几乎看不出的图案：

| 元素 | 选择器 |
| --- | --- |
| 代码块 | `div[class*="language-"]` |
| 代码组的标签条 | `.vp-code-group .tabs` |
| 表格 | `.akari-table` |
| 提示块 | `.custom-block` |
| 引用 | `blockquote` |
| 演示区 | `.demo-surface` |

- 整页共用一种图案，由头图的 `pattern` 决定。默认每次加载内容时随机挑一种：点阵、网格、十字、斜线或波纹。
- 图案写在文档表面的 `data-pattern` 属性上，没有图案时不带这个属性。
- 平时图案只在元素末端的上角隐约可见。
- 指针停在元素上时，周围亮起一圈很淡的主题色柔光。柔光中的图案清楚一些，边缘逐级淡出，移开指针时淡出。
- 装饰画在 `::before`（图案）与 `::after`（柔光）上，位于内容之下，不影响阅读、选择与点击。
- 柔光只在读者用鼠标或触控笔指着时出现。主题按指针事件的实际类型判断，不依据浏览器推测的 `(hover: hover)` 媒体查询，因此带触屏的电脑接着鼠标时也有柔光。
- 触屏只显示静态图案，点按后不会留下亮着的柔光。
- “减少动态效果”下图案与柔光直接出现，不过渡。强制颜色模式下不显示装饰。
- 强度由 `.akari-doc` 上的 `--akari-pattern-glow`（默认 `4%`）与 `--akari-pattern-spot`（默认 `0.1`）控制。

## 代码块

- 语法高亮使用 `github-light` 与 `github-dark` 两套主题，随明暗模式切换。
- 复制按钮沿用 VitePress 的 `button.copy`。提示文字来自语言包的 `markdown.codeCopyButton`，可以在语言配置中改写。
- 600px 以下代码块的圆角收为 12px。
