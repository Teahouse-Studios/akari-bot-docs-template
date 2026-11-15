---
tab: 接口
---

# 按钮：接口

以下内容来自 `@m3e/web` 2.10.3 的组件元数据。

## m3e-button

| 属性 | 取值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `elevated`、`filled`、`tonal`、`outlined`、`text` | `text` | 外观 |
| `size` | `extra-small`、`small`、`medium`、`large`、`extra-large` | `small` | 尺寸 |
| `shape` | `rounded`、`square` | `rounded` | 形状 |
| `disabled` | 布尔 | `false` | 禁用，不可聚焦 |
| `disabled-interactive` | 布尔 | `false` | 禁用但仍可聚焦，便于读者发现这个操作 |
| `toggle` | 布尔 | `false` | 作为二态开关 |
| `selected` | 布尔 | `false` | 开关的选中状态 |
| `href` | 字符串 | `""` | 设置后作为链接 |
| `target` | `_self`、`_blank`、`_parent`、`_top` 或窗口名 | `""` | 链接的打开位置 |
| `rel` | 字符串 | `""` | 链接与当前页面的关系 |
| `download` | 字符串 | 无 | 作为下载链接，值为文件名 |
| `type` | `button`、`submit`、`reset` | `button` | 在表单中的行为 |
| `name`、`value` | 字符串 | 无 | 提交表单时的名称与值 |

| 插槽 | 内容 |
| --- | --- |
| （默认） | 按钮文字 |
| `icon` | 文字前的图标 |
| `trailing-icon` | 文字后的图标 |
| `selected` | 选中时的文字 |
| `selected-icon` | 选中时的图标 |

| 事件 | 时机 |
| --- | --- |
| `click` | 点击 |
| `beforeinput` | 开关即将切换，可以取消 |
| `input`、`change` | 开关已切换 |

## m3e-icon-button

属性与 `m3e-button` 相同，另有以下属性：

| 属性 | 取值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `standard`、`filled`、`tonal`、`outlined`、`elevated` | `standard` | 外观 |
| `width` | `default`、`narrow`、`wide` | `default` | 宽度 |

| 插槽 | 内容 |
| --- | --- |
| （默认） | 图标 |
| `selected` | 选中时的图标 |

事件同 `m3e-button`。

## m3e-tooltip

| 属性 | 取值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `for` | 元素 id | 无 | 提示所属的控件 |
| `position` | `above`、`below`、`before`、`after` | `below` | 相对控件的位置 |
| `show-delay` | 毫秒 | `0` | 显示前的延迟 |
| `hide-delay` | 毫秒 | `200` | 隐藏前的延迟 |
| `touch-gestures` | `auto`、`on`、`off` | `auto` | 触摸手势的处理方式 |
| `disabled` | 布尔 | `false` | 禁用提示 |

## 在文档中使用

- 带 `href` 的站内 `m3e-button` 由主题接管，在页面内切换。`target="_self"` 时整页加载。需要在脚本中跳转时，可调用 `useRouter().go()`，见[导航](/zh-CN/components/navigation#spa-导航)。
- 无论视觉尺寸多大，按钮都保留至少 48×48dp 的触控区域。
- 主题的 `m3e.ts` 负责注册这三种组件（`@m3e/web/button`、`@m3e/web/icon-button`、`@m3e/web/tooltip`）。
