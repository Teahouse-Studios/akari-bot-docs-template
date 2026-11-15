---
icon: colorize
order: 1
tab: 概览
parallel:
  - api
---

# 色彩

主题的颜色全部来自 m3e 的动态色。只需一个种子色，`m3e-theme` 就能据此生成整套 `--md-sys-color-*` 令牌。切换明暗、对比度或色调变体时，整套色板一起更新。

## 动态色

种子色决定色相与色调的关系，具体亮度由 Material 3 的色调映射计算。因此同一个种子色在浅色与深色下都能得到可读的配色。以下演示只生成部分令牌，种子色取青绿色：

<m3e-theme color="#006A6A">
  <div class="swatch-grid">
    <div class="swatch">
      <div class="swatch__color" style="background: var(--md-sys-color-primary)"></div>
      <code>--md-sys-color-primary</code>
    </div>
    <div class="swatch">
      <div class="swatch__color" style="background: var(--md-sys-color-primary-container)"></div>
      <code>--md-sys-color-primary-container</code>
    </div>
    <div class="swatch">
      <div class="swatch__color" style="background: var(--md-sys-color-secondary-container)"></div>
      <code>--md-sys-color-secondary-container</code>
    </div>
    <div class="swatch">
      <div class="swatch__color" style="background: var(--md-sys-color-tertiary)"></div>
      <code>--md-sys-color-tertiary</code>
    </div>
  </div>
</m3e-theme>

站点的默认种子色写在共用配置的 `settings.defaults.color` 中。你可以在设置里换成自己喜欢的颜色。带头图的页面从图片中取色，见[头图](/zh-CN/theme/hero)。

## 色调变体

同一个种子色可以按不同的方式生成色板，默认是 `tonal-spot`：

<div class="demo-row">
  <m3e-chip variant="elevated">Tonal Spot</m3e-chip>
  <m3e-chip>Vibrant</m3e-chip>
  <m3e-chip>Fidelity</m3e-chip>
  <m3e-chip>Expressive</m3e-chip>
  <m3e-chip>Monochrome</m3e-chip>
  <m3e-chip>Neutral</m3e-chip>
  <m3e-chip>Rainbow</m3e-chip>
  <m3e-chip>Fruit Salad</m3e-chip>
</div>

| 变体 | 特点 |
| --- | --- |
| `tonal-spot` | 均衡、低饱和，适合大多数文档站点 |
| `vibrant` | 主色更饱和，品牌感更强 |
| `fidelity` | 更贴近种子色本身 |
| `expressive` | 色相偏移更活跃 |
| `monochrome` | 去掉彩色倾向，只保留明度层次 |
| `neutral` | 接近中性的表面色 |
| `rainbow` | 各角色之间的色相差异更大 |
| `fruit-salad` | 色相分离最强，适合演示与创意场景 |

## 明暗与对比度

同一套色板在浅色与深色下的映射如下：

<div class="demo-grid">
  <m3e-theme scheme="light">
    <div class="demo-surface" style="background: var(--md-sys-color-surface-container-low); color: var(--md-sys-color-on-surface);">
      <strong>浅色模式</strong>
      <p>表面色偏亮，正文使用深色。适合日间与投影环境。</p>
    </div>
  </m3e-theme>
  <m3e-theme scheme="dark">
    <div class="demo-surface" style="background: var(--md-sys-color-surface-container-low); color: var(--md-sys-color-on-surface);">
      <strong>深色模式</strong>
      <p>表面色偏暗，正文使用浅色。适合低光环境与长时间阅读。</p>
    </div>
  </m3e-theme>
</div>

对比度分默认、中等、高三档，档位改变前景与背景的明度差，也改变描边强度。明暗模式有四种，见[设置与明暗模式](/zh-CN/theme/settings)。

## 使用规范

- 不要写死颜色，一律使用 `--md-sys-color-*` 令牌或 m3e 组件的变量。
- 容器色与前景色成对使用：`primary` 配 `on-primary`，`surface-container` 配 `on-surface`。
- 用 `surface-container-lowest` 到 `surface-container-highest` 区分层级，不要靠叠加阴影。
- 边框与分隔线用 `outline-variant`，需要强调时用 `outline`。错误状态用 `error` 与 `error-container`。
- 需要固定的品牌色时，把它作为种子色，而不是在组件上逐处覆盖。
- 自绘的背景、阴影与半透明遮罩要在深色模式与高对比度下单独检查。

全部颜色令牌见[接口](/zh-CN/styles/color/api)。
