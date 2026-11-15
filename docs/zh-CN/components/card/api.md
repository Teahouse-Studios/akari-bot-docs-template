---
tab: 接口
---

# 卡片：接口

以下内容来自 `@m3e/web` 2.10.3 的组件元数据。

## m3e-card

| 属性 | 取值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `elevated`、`filled`、`outlined` | `filled` | 外观 |
| `orientation` | `vertical`、`horizontal` | `vertical` | 内容的排列方向 |
| `inline` | 布尔 | `false` | 作为行内元素排版 |
| `actionable` | 布尔 | `false` | 整张卡片成为一个可交互的区域 |
| `href`、`target`、`rel`、`download` | 同按钮 | 同按钮 | `actionable` 时作为链接 |
| `disabled`、`disabled-interactive` | 布尔 | `false` | `actionable` 时禁用 |
| `type`、`name`、`value` | 同按钮 | `button` | `actionable` 时在表单中的行为 |

| 插槽 | 内容 |
| --- | --- |
| （默认） | 没有内边距，适合铺满的图片或自定义布局 |
| `header` | 标题、图标或媒体，不额外加内边距 |
| `content` | 带内边距的正文 |
| `actions` | 操作按钮，默认靠起始边。给元素加 `end` 属性改为靠结束边 |
| `footer` | 元信息、版权或次要说明 |

| 事件 | 时机 |
| --- | --- |
| `click` | 点击 `actionable` 的卡片 |

## m3e-dialog

| 属性 | 取值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | 布尔 | `false` | 是否打开 |
| `dismissible` | 布尔 | `false` | 显示关闭按钮 |
| `disable-close` | 布尔 | `false` | 不能通过点击遮罩或按 `Esc` 关闭 |
| `alert` | 布尔 | `false` | 作为警示对话框 |
| `close-label` | 字符串 | `"Close"` | 关闭按钮的无障碍名称 |
| `no-focus-trap` | 布尔 | `false` | 不把 `Tab` 焦点限制在对话框内 |

| 插槽 | 内容 |
| --- | --- |
| （默认） | 正文 |
| `header` | 标题 |
| `actions` | 操作按钮 |
| `close-icon` | 关闭按钮的图标 |

| 事件 | 时机 |
| --- | --- |
| `opening`、`opened` | 开始打开、打开完成 |
| `closing`、`closed` | 开始关闭、关闭完成 |
| `cancel` | 通过遮罩或 `Esc` 取消 |

`m3e-dialog-trigger` 放在按钮内部，属性 `for` 填对话框的 id。点击按钮时，对话框打开。

`m3e-dialog-action` 放在对话框内的按钮内部，属性 `return-value` 指定返回值。点击时对话框关闭，并返回这个值。

## 自定义外观

卡片的圆角、颜色与内边距由 `--m3e-card-*` 变量控制。例如 `--m3e-card-shape` 控制圆角：

```html
<m3e-card variant="outlined" style="--m3e-card-shape: 28px;">…</m3e-card>
```

组件在主题的 `m3e.ts` 中注册，来源是 `@m3e/web/card` 与 `@m3e/web/dialog`。
