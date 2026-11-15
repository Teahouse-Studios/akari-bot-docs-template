---
tab: 接口
---

# 设置与明暗模式：接口

## settings

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | 是否有设置模态框。`false` 时齿轮按钮也隐藏 |
| `showSchemeToggle` | `boolean` | `true` | 是否显示明暗模式按钮，与 `enabled` 无关 |
| `title` | `string` | 随语言，“设置” | 设置模态框的标题 |
| `sections` | `SettingsSectionKey[]` | 全部六项 | 显示哪些选项及其顺序 |
| `labels` | `Partial<Record<SettingsSectionKey, string>>` | 随语言 | 改写单个选项的标题 |
| `defaults` | `Partial<AkariThemeSettings>` | 见下表 | 所有读者第一次看到的外观 |
| `persist` | `boolean` | `true` | 是否把读者的选择写进 `localStorage` |
| `storageKey` | `string` | `"akari-docs-settings"` | `localStorage` 的键名 |

`appBar.showSettingsToggle: false` 只隐藏齿轮按钮，设置功能本身还在（例如由自定义组件打开）。

```ts
settings: {
  sections: ["color", "textSize"],
  labels: { textSize: "正文字号" },
  defaults: { color: "#0b57d0", scheme: "time" },
},
```

`sections` 中的非法项会被过滤，重复项只保留第一次出现的那一项。结果为空时显示全部六项。

## AkariThemeSettings

| 字段 | 选项键 | 取值 | 默认值 |
| --- | --- | --- | --- |
| `color` | `color` | 六位十六进制颜色 | `"#6750A4"` |
| `variant` | `variant` | `tonal-spot`、`vibrant`、`fidelity`、`expressive`、`monochrome`、`neutral`、`rainbow`、`fruit-salad` | `"tonal-spot"` |
| `scheme` | 明暗模式按钮 | `auto`、`light`、`dark`、`time` | `"auto"` |
| `contrast` | `contrast` | `standard`、`medium`、`high` | `"standard"` |
| `motion` | `motion` | `standard`、`expressive` | `"expressive"` |
| `direction` | `direction` | `auto`、`ltr`、`rtl` | `"auto"` |
| `textSize` | `textSize` | `16px`、`24px`、`32px`（显示为 100%、150%、200%） | `"16px"` |

## akariHead 与明暗模式

`.vitepress/config.mts` 中的 `head: akariHead()` 包含一段脚本，在首帧绘制前应用明暗模式。修改了 `storageKey` 或 `defaults.scheme` 时，把同样的值传给它：

```ts
head: akariHead({ storageKey: "my-docs", defaultScheme: "time" }),
```

同时保留 `appearance: false`，让主题独自管理 `html.dark`。

## 存储格式

`localStorage[storageKey]` 中是一个 JSON 对象，字段同 `AkariThemeSettings`：

```json
{
  "color": "#6750A4",
  "variant": "tonal-spot",
  "scheme": "dark",
  "contrast": "standard",
  "motion": "expressive",
  "direction": "auto",
  "textSize": "16px"
}
```

缺少或非法的字段逐项回退到默认值。

## useAkariSettings

```ts
import { useAkariSettings } from "@theme";

const { settings, setSetting, reset, isDefault } = useAkariSettings();
setSetting("textSize", "24px");
```

| 返回值 | 说明 |
| --- | --- |
| `settings` | 当前设置，响应式对象 |
| `setSetting(key, value)` | 修改一项。`persist` 为真时同时写入 `localStorage` |
| `reset()` | 恢复默认值 |
| `isDefault()` | 当前设置是否全部等于默认值 |
| `defaults` | 合并后的默认值 |
| `sections`、`labels` | 解析后的选项列表与标题 |

## useAkariColorScheme

```ts
import { useAkariColorScheme } from "@theme";

const { mode, resolved, cycle } = useAkariColorScheme();
```

| 返回值 | 类型 | 说明 |
| --- | --- | --- |
| `mode` | `ComputedRef<"auto" \| "light" \| "dark" \| "time">` | 读者选择的模式 |
| `resolved` | `Ref<"light" \| "dark" \| null>` | 页面实际显示的明暗。在浏览器中挂载之前为 `null` |
| `cycle()` | `() => void` | 切换到下一种模式：跟随系统 → 日间 → 夜间 → 跟随时间 → 跟随系统 |

这两个函数都只能在布局内部的组件中调用。

## 替换设置面板

设置模态框中的面板可以换成自定义组件（槽位 `Settings`）。标题、关闭按钮与动效仍由模态框提供，见[扩展主题](/zh-CN/theme/extending/api#provideakaricomponents)。
