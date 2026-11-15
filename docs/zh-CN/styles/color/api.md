---
tab: 接口
---

# 色彩：接口

`m3e-theme` 按 Material 3 的动态色规范（2025 版）生成以下令牌。这些令牌可以直接写进 CSS：

```css
.panel {
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
}
```

令牌只在 `m3e-theme` 之内有值。主题把这些令牌同步到根元素，页面中的任何位置都可以使用。

## 强调色

| 令牌 | 用途 |
| --- | --- |
| `--md-sys-color-primary`、`--md-sys-color-on-primary` | 最重要的操作与它上面的文字 |
| `--md-sys-color-primary-container`、`--md-sys-color-on-primary-container` | 需要突出但不那么强烈的容器 |
| `--md-sys-color-primary-dim` | 较暗的主色 |
| `--md-sys-color-inverse-primary` | 反色表面上的主色 |
| `--md-sys-color-secondary`、`--md-sys-color-on-secondary` | 次要的强调 |
| `--md-sys-color-secondary-container`、`--md-sys-color-on-secondary-container` | 次要的容器，例如选中的导航项、悬浮按钮 |
| `--md-sys-color-secondary-dim` | 较暗的辅助色 |
| `--md-sys-color-tertiary`、`--md-sys-color-on-tertiary` | 与主色形成对比的强调 |
| `--md-sys-color-tertiary-container`、`--md-sys-color-on-tertiary-container` | 第三色的容器 |
| `--md-sys-color-tertiary-dim` | 较暗的第三色 |

每种强调色还有不随明暗变化的固定色：`*-fixed`、`*-fixed-dim`、`on-*-fixed` 与 `on-*-fixed-variant`（`*` 为 `primary`、`secondary` 或 `tertiary`）。

## 表面

| 令牌 | 用途 |
| --- | --- |
| `--md-sys-color-surface`、`--md-sys-color-on-surface` | 默认的表面与文字。文档表面使用 `surface` |
| `--md-sys-color-surface-dim`、`--md-sys-color-surface-bright` | 最暗、最亮的表面 |
| `--md-sys-color-surface-container-lowest` | 最低一层容器 |
| `--md-sys-color-surface-container-low` | 较低的容器，例如演示区 |
| `--md-sys-color-surface-container` | 默认的容器，例如头图的文字卡片、表头 |
| `--md-sys-color-surface-container-high` | 较高的容器 |
| `--md-sys-color-surface-container-highest` | 最高一层容器 |
| `--md-sys-color-on-surface-variant` | 次要文字，例如说明、表头文字 |
| `--md-sys-color-surface-variant` | 次要的表面 |
| `--md-sys-color-inverse-surface`、`--md-sys-color-inverse-on-surface` | 反色的表面与文字，例如提示条 |
| `--md-sys-color-background`、`--md-sys-color-on-background` | 页面背景与文字 |
| `--md-sys-color-surface-tint` | 表面的着色 |

## 描边、错误与遮罩

| 令牌 | 用途 |
| --- | --- |
| `--md-sys-color-outline` | 需要强调的边框 |
| `--md-sys-color-outline-variant` | 分隔线与普通边框，例如表格边框 |
| `--md-sys-color-error`、`--md-sys-color-on-error` | 错误 |
| `--md-sys-color-error-container`、`--md-sys-color-on-error-container` | 错误的容器 |
| `--md-sys-color-error-dim` | 较暗的错误色 |
| `--md-sys-color-shadow` | 阴影 |
| `--md-sys-color-scrim` | 模态框后面的遮罩 |

## 局部色板

在页面中包一层 `m3e-theme`，就能为其中的内容生成另一套色板。[色彩](/zh-CN/styles/color)概览页的演示用的就是这种写法：

```html
<m3e-theme color="#006A6A" scheme="dark" variant="vibrant" contrast="high">
  <!-- 内容 -->
</m3e-theme>
```

| 属性 | 取值 |
| --- | --- |
| `color` | 六位十六进制的种子色 |
| `scheme` | `light`、`dark`、`auto` |
| `variant` | 见[色调变体](/zh-CN/styles/color#色调变体) |
| `contrast` | `standard`、`medium`、`high` |
| `motion` | `standard`、`expressive` |

站点整体的种子色、变体与对比度由设置决定，见[设置与明暗模式](/zh-CN/theme/settings/api#akarithemesettings)。
