# 选择图标

Material Symbols 的每个图标都有三种样式与两种形态。主题默认使用轮廓（outlined）样式，配合填充形态表示选中、开启等状态。

## 样式

| 样式 | 特征 | 导入路径 |
| --- | --- | --- |
| Outlined | 均匀的描边，留白清晰，与 M3 组件最协调 | `@m3e/icons/outlined/<name>` |
| Rounded | 圆角端点与转角，更柔和 | `@m3e/icons/rounded/<name>` |
| Sharp | 直角转角，更硬朗 | `@m3e/icons/sharp/<name>` |

同一界面中保持一种样式。主题的导航、顶栏与按钮全部使用 Outlined。如果站点整体换成 Rounded，需要同时做两件事：替换 `icons.ts` 中的全部导入，并给 `<m3e-icon>` 设置 `variant="rounded"`。

## 轮廓与填充

`filled` 属性显示图标的填充形态：

<div class="demo-row">
  <m3e-icon name="home"></m3e-icon>
  <m3e-icon name="home" filled></m3e-icon>
  <m3e-icon name="settings"></m3e-icon>
  <m3e-icon name="settings" filled></m3e-icon>
  <m3e-icon name="palette"></m3e-icon>
  <m3e-icon name="palette" filled></m3e-icon>
</div>

```html
<m3e-icon name="home"></m3e-icon>
<m3e-icon name="home" filled></m3e-icon>
```

M3 用填充表示“当前”或“已开启”：rail 中当前分类的图标是填充的，其余为轮廓。不要只靠填充区分状态，选中项同时有背景色与文字变化。

## 尺寸

图标默认 24px，跟随 `font-size` 缩放。常用尺寸：

| 尺寸 | 用途 |
| --- | --- |
| 20px | 紧凑列表、行内说明 |
| 24px | 默认：按钮、导航、列表项 |
| 40px 及以上 | 空状态插画、引导页 |

```html
<m3e-icon name="search" style="font-size: 20px"></m3e-icon>
<m3e-icon name="search_off" style="font-size: 48px"></m3e-icon>
```

在按钮、导航项等组件内部不要单独改尺寸，组件已经按 M3 规范设置好图标大小与间距。

## 选择合适的图标

- 优先使用含义约定俗成的图标：`search` 表示搜索，`settings` 表示设置，`translate` 表示语言。
- 一个含义只用一个图标，同一个图标不要在不同位置表示不同操作。
- 抽象概念（如“主题”“组件”）没有通用图标时，选择形状简单、在 24px 下仍清晰的图标，并始终配合文字。
