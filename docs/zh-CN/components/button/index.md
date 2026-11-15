---
icon: radio_button_checked
order: 1
tab: 概览
parallel:
  - api
---

# 按钮

`m3e-button` 用于触发操作，`m3e-icon-button` 是只有图标的紧凑按钮。两者都支持变体、尺寸、形状、禁用、链接与选择状态。

## 变体

五种外观表达不同的强调程度：

<div class="demo-row">
  <m3e-button variant="elevated">Elevated</m3e-button>
  <m3e-button variant="filled">Filled</m3e-button>
  <m3e-button variant="tonal">Tonal</m3e-button>
  <m3e-button variant="outlined">Outlined</m3e-button>
  <m3e-button variant="text">Text</m3e-button>
</div>

```html
<m3e-button variant="elevated">Elevated</m3e-button>
<m3e-button variant="filled">Filled</m3e-button>
<m3e-button variant="tonal">Tonal</m3e-button>
<m3e-button variant="outlined">Outlined</m3e-button>
<m3e-button variant="text">Text</m3e-button>
```

- `filled`：页面中最重要的操作，同一区域通常只出现一个。
- `tonal`：次重要操作，比 `filled` 柔和。
- `outlined`：需要明确边界的操作，强调程度不高。
- `text`：工具栏、卡片页脚中的低强调操作。
- `elevated`：需要浮起感的主操作，适合与卡片或表面搭配。

## 尺寸与形状

尺寸从 `extra-small` 到 `extra-large`，默认 `small`：

<div class="demo-row">
  <m3e-button variant="tonal" size="extra-small">Extra Small</m3e-button>
  <m3e-button variant="tonal" size="small">Small</m3e-button>
  <m3e-button variant="tonal" size="medium">Medium</m3e-button>
  <m3e-button variant="tonal" size="large">Large</m3e-button>
  <m3e-button variant="tonal" size="extra-large">Extra Large</m3e-button>
</div>

```html
<m3e-button variant="tonal" size="extra-small">Extra Small</m3e-button>
<m3e-button variant="tonal" size="small">Small</m3e-button>
<m3e-button variant="tonal" size="medium">Medium</m3e-button>
<m3e-button variant="tonal" size="large">Large</m3e-button>
<m3e-button variant="tonal" size="extra-large">Extra Large</m3e-button>
```

默认形状为 `rounded`，设置 `shape="square"` 可改为方形：

<div class="demo-row">
  <m3e-button variant="filled" shape="square">Square Filled</m3e-button>
  <m3e-button variant="outlined" shape="square">Square Outlined</m3e-button>
  <m3e-button variant="text" shape="square">Square Text</m3e-button>
</div>

```html
<m3e-button variant="filled" shape="square">Square Filled</m3e-button>
<m3e-button variant="outlined" shape="square">Square Outlined</m3e-button>
<m3e-button variant="text" shape="square">Square Text</m3e-button>
```

无论视觉尺寸如何，按钮都保留至少 48×48dp 的触控区域。

## 图标

`icon` 插槽位于文本前，`trailing-icon` 插槽位于文本后：

<div class="demo-row">
  <m3e-button variant="filled">
    <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
    开始构建
  </m3e-button>
  <m3e-button variant="tonal">
    复制配置
    <m3e-icon slot="trailing-icon" name="content_copy"></m3e-icon>
  </m3e-button>
  <m3e-button variant="outlined">
    下一步
    <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
  </m3e-button>
</div>

```html
<m3e-button variant="filled">
  <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
  开始构建
</m3e-button>
<m3e-button variant="tonal">
  复制配置
  <m3e-icon slot="trailing-icon" name="content_copy"></m3e-icon>
</m3e-button>
<m3e-button variant="outlined">
  下一步
  <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
</m3e-button>
```

图标默认对辅助技术隐藏，按钮的可读名称来自可见文本。若按钮只用图标，必须提供 `aria-label`。

## 图标按钮

图标按钮有 `standard`、`filled`、`tonal`、`outlined` 与 `elevated` 五种变体。图标按钮本身没有文字，需要用工具提示说明用途：

<div class="demo-row">
  <m3e-icon-button id="button-demo-back" aria-label="返回">
    <m3e-icon name="arrow_back"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-back">返回</m3e-tooltip>

  <m3e-icon-button id="button-demo-settings" aria-label="设置" variant="tonal">
    <m3e-icon name="settings"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-settings">设置</m3e-tooltip>

  <m3e-icon-button id="button-demo-close" aria-label="关闭" variant="outlined">
    <m3e-icon name="close"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-close">关闭</m3e-tooltip>

  <m3e-icon-button id="button-demo-confirm" aria-label="确认" variant="filled">
    <m3e-icon name="check"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-confirm">确认</m3e-tooltip>
</div>

```html
<m3e-icon-button id="button-demo-settings" aria-label="设置" variant="tonal">
  <m3e-icon name="settings"></m3e-icon>
</m3e-icon-button>
<m3e-tooltip for="button-demo-settings">设置</m3e-tooltip>
```

每个工具提示的 `for` 指向唯一的 `id`。同一页面中若出现重复的 `id`，提示会错位，或只对第一个元素生效。

## 禁用与链接

禁用按钮默认不进入键盘焦点。`disabled-interactive` 保留可聚焦性，便于用户发现该操作：

<div class="demo-row">
  <m3e-button variant="filled" disabled>禁用</m3e-button>
  <m3e-button variant="filled" disabled-interactive>禁用但可聚焦</m3e-button>
  <m3e-button variant="tonal" href="https://m3.material.io/" target="_blank" rel="noreferrer">
    打开 Material 3
    <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
  </m3e-button>
  <m3e-button variant="outlined" href="/zh-CN/components/card.html">
    查看卡片
    <m3e-icon slot="trailing-icon" name="chevron_right"></m3e-icon>
  </m3e-button>
</div>

```html
<m3e-button variant="filled" disabled>禁用</m3e-button>
<m3e-button variant="filled" disabled-interactive>禁用但可聚焦</m3e-button>
<m3e-button
  variant="tonal"
  href="https://m3.material.io/"
  target="_blank"
  rel="noreferrer"
>
  打开 Material 3
  <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
</m3e-button>
<m3e-button variant="outlined" href="/zh-CN/components/card.html">
  查看卡片
  <m3e-icon slot="trailing-icon" name="chevron_right"></m3e-icon>
</m3e-button>
```

设置 `href` 后按钮渲染为链接语义，支持 `target`、`rel` 与 `download`。主题会接管站内链接，在页面内切换。`target="_self"` 时整页加载，`target="_blank"` 时在新标签页打开。需要在脚本中跳转时，可调用 `useRouter().go()`，详见[导航](/zh-CN/components/navigation)。

## 选择状态

`toggle` 让按钮承担二态选择，`selected` 控制初始状态：

<div class="demo-row">
  <m3e-button variant="filled" toggle selected>
    <m3e-icon slot="icon" name="check"></m3e-icon>
    已选中
  </m3e-button>
  <m3e-button variant="tonal" toggle>可切换</m3e-button>
  <m3e-button variant="outlined" toggle>
    <m3e-icon slot="icon" name="close"></m3e-icon>
    <m3e-icon slot="selected-icon" name="check"></m3e-icon>
    关注
    <span slot="selected">已关注</span>
  </m3e-button>
</div>

```html
<m3e-button variant="filled" toggle selected>
  <m3e-icon slot="icon" name="check"></m3e-icon>
  已选中
</m3e-button>
<m3e-button variant="tonal" toggle>可切换</m3e-button>
<m3e-button variant="outlined" toggle>
  <m3e-icon slot="icon" name="close"></m3e-icon>
  <m3e-icon slot="selected-icon" name="check"></m3e-icon>
  关注
  <span slot="selected">已关注</span>
</m3e-button>
```

选中时，`m3e-icon` 会自动使用填充字形。也可以用 `selected-icon` 与 `selected` 插槽替换图标和文本。切换会触发 `beforeinput`、`input` 与 `change` 事件，可在 `beforeinput` 中取消。

## 无障碍建议

- 只含图标的按钮必须设置 `aria-label`，并搭配 `m3e-tooltip`。
- 同一页面内工具提示目标 `id` 保持唯一。
- 禁用操作若需要用户知晓，使用 `disabled-interactive`，并说明不可用的原因。
- 链接式按钮使用 `href`。不要给普通按钮绑定路由逻辑，否则会丢失链接语义。
- 主操作使用 `filled`，同一视觉区域避免出现多个高强调按钮。

全部属性、插槽与事件见[接口](/zh-CN/components/button/api)。
