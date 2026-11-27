---
tab: 接口
---

# 头图：接口

## hero

页面头部信息中的 `hero`。写成字符串时就是图片地址。

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `image` | `string \| { src, alt? } \| { light, dark, alt? }` | 必填 | 图片地址。站内路径自动加上 `base`，外部地址原样使用。写成 `{ light, dark }` 时分别用于日间与夜间 |
| `alt` | `string` | `""` | 图片的替代文本。纯装饰性的图片留空 |
| `date` | `string \| Date` | 无 | 显示在标题上方。`2026-05-19` 这样的日期按页面语言格式化，并输出为 `<time datetime="2026-05-19">` 这样的标签。其他文字原样显示 |
| `tagline` | `string` | 页面的 `description` | 标题下方的一行简介 |
| `background` | `string` | `--md-sys-color-primary-container` | 图片卡片的底色，任意 CSS 颜色或令牌 |
| `fit` | `"cover" \| "contain"` | `"cover"` | `cover` 铺满卡片并裁去多余部分。`contain` 完整显示并留出边距，适合透明背景的插画 |
| `color` | `string \| false` | 从图片取色（构建时） | 这一页的主题种子色：`#rrggbb` 固定为该颜色，`false` 保留读者在设置中选择的颜色 |
| `pattern` | `"dots" \| "grid" \| "plus" \| "diagonal" \| "waves" \| "none" \| "auto"` | `"auto"` | 页面上的隐藏图案：点阵、网格、十字、斜线、波纹。`none` 不显示，`auto` 每次加载内容时随机挑一种 |

`pattern` 对整页生效：头图卡片与正文中带背景的元素用同一种图案。没有头图的页面也会随机挑一种。

```yaml
hero:
  image:
    light: /hero/theme-hero.svg
    dark: /hero/theme-hero-dark.svg
    alt: 文档主题在桌面窗口与手机上的界面示意
  date: 2026-10-28
  tagline: 在头部信息中写一张图片
  fit: contain
  color: "#6750a4"
  pattern: dots
```

## CSS 变量

| 变量 | 默认值 | 作用 |
| --- | --- | --- |
| `--akari-doc-hero-inset` | `8px` | 卡片到上、左、右三条边缘的距离，以及两张卡片之间的距离 |
| `--akari-doc-hero-text-color` | `--md-sys-color-surface-container` | 文字卡片的底色 |
| `--akari-doc-hero-media-color` | `--md-sys-color-primary-container` | 图片卡片的默认底色。`background` 优先 |
| `--akari-pattern-glow` | `4%` | 指针周围柔光的强度 |
| `--akari-pattern-spot` | `0.1` | 柔光范围内图案的清晰程度 |

前三个变量可以写在 `:root` 上。两个图案变量定义在文档表面 `.akari-doc` 上，覆盖时也要写在 `.akari-doc` 上。

## 替换头图组件

头图可以替换为自己的组件，见[扩展主题](/zh-CN/theme/extending/api#provideakaricomponents)。布局只在页面配置了带图片的 `hero` 时渲染这个组件，并隐藏正文的第一个 `h1`。因此自定义组件要自己渲染页面标题，并给标题加上 `data-akari-page-title` 属性。顶栏的标题替换会跟随加了此属性的元素。

组件中用 VitePress 的 `useData()` 读取头部信息。布局给组件的根元素加上 `akari-doc__page` 类。在同一组平行页面之间切换时，头图随正文一起左右滑动。组件有多个根节点时拿不到这个类，头图就停在原处。
