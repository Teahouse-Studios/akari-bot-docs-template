---
tab: 接口
---

# 导航：接口

以下内容来自 `@m3e/web` 2.10.3 的组件元数据。

## m3e-nav-menu 与 m3e-nav-menu-item

`m3e-nav-menu` 没有属性，默认插槽放 `m3e-nav-menu-item`。

| 属性 | 取值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` | 布尔 | `false` | 展开子项 |
| `selected` | 布尔 | `false` | 当前项。组件把这一项映射为 `aria-current` |
| `disabled` | 布尔 | `false` | 禁用这一项及其所有子项 |

| 插槽 | 内容 |
| --- | --- |
| （默认） | 嵌套的子项 |
| `label` | 文字，通常是一个链接 |
| `icon` | 图标 |
| `selected-icon` | 选中时的图标 |
| `badge` | 徽标 |
| `toggle-icon` | 展开、收起的图标 |

| 事件 | 时机 |
| --- | --- |
| `opening`、`opened`、`closing`、`closed` | 展开与收起的开始、完成 |
| `click` | 点击 |

## m3e-tabs、m3e-tab 与 m3e-tab-panel

| `m3e-tabs` 属性 | 取值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `primary`、`secondary` | `secondary` | 外观 |
| `stretch` | 布尔 | `false` | 标签等宽铺满容器 |
| `header-position` | `before`、`after` | `before` | 标签栏在面板之前还是之后 |
| `disable-pagination` | 布尔 | `false` | 标签溢出时不显示翻页按钮 |
| `disable-swipe` | 布尔 | `false` | 关闭在面板上滑动切换 |
| `previous-page-label`、`next-page-label` | 字符串 | `"Previous page"`、`"Next page"` | 翻页按钮的无障碍名称 |

| `m3e-tab` 属性 | 取值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `for` | 面板 id | 无 | 对应的 `m3e-tab-panel` |
| `selected` | 布尔 | `false` | 当前标签。同一组中只能有一个 |
| `disabled` | 布尔 | `false` | 禁用 |

`m3e-tab` 与 `m3e-tab-panel` 直接写在 `m3e-tabs` 中，写法见[概览](/zh-CN/components/navigation#标签页)的示例。`prev-icon`、`next-icon` 插槽替换翻页图标。切换标签时触发 `beforeinput`（可以取消）、`input` 与 `change`。`m3e-tab` 另有 `icon` 插槽。

## m3e-chip 与 m3e-filter-chip

| 属性 | 用于 | 取值 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `variant` | 两者 | `outlined`、`elevated` | `outlined` | 外观 |
| `value` | 两者 | 字符串 | 无 | 值 |
| `selected` | 过滤 | 布尔 | `false` | 选中 |
| `disabled`、`disabled-interactive` | 过滤 | 布尔 | `false` | 禁用 |

两者都有默认插槽（文字）、`icon` 与 `trailing-icon` 插槽。`m3e-chip` 不可交互。`m3e-filter-chip` 切换时触发 `beforeinput`、`input` 与 `change`。

`m3e-filter-chip-set` 包住一组过滤 Chip。`multi` 允许多选，`vertical` 让整组纵向排列，`hide-selection-indicator` 隐藏选中标记，`disabled` 禁用整组，`name` 用于表单。选择变化时触发 `change`。

## m3e-badge

| 属性 | 取值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `small`、`medium`、`large` | `medium` | 尺寸 |
| `for` | 元素 id | 无 | 锚定到这个元素 |
| `position` | `above-after`、`above-before`、`below-before`、`below-after`、`before`、`after`、`above`、`below` | `above-after` | 锚定时相对元素的位置 |

徽标没有默认的 ARIA 角色。附加到交互元素上时，用 `aria-describedby` 或同步的可见文字说明数量。

组件由主题的 `m3e.ts` 注册（`@m3e/web/nav-menu`、`@m3e/web/tabs`、`@m3e/web/chips`、`@m3e/web/badge`）。
