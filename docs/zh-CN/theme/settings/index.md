---
icon: settings
order: 4
tab: 概览
parallel:
  - api
  - details
---

# 设置与明暗模式

读者可以自己调整页面外观。rail 底部的圆形按钮切换明暗模式，窄屏时这个按钮在导航抽屉底部。顶栏的齿轮按钮打开设置。这些选项只作用于读者自己的浏览器，保存在 `localStorage` 中，不影响其他访问者。

## 明暗模式

每按一次按钮，就切换到下一种模式，屏幕底部弹出一条提示，例如“当前主题已切换至：夜间模式”。

| 模式 | 图标 | 效果 |
| --- | --- | --- |
| 跟随系统 | `brightness_auto` | 跟随系统的浅色、深色设置（默认） |
| 日间 | `light_mode` | 始终浅色 |
| 夜间 | `dark_mode` | 始终深色 |
| 跟随时间 | `schedule` | 19:00 到次日 07:00 为深色，其余时间为浅色 |

选择跟随系统或跟随时间时，提示中会注明当前实际是日间还是夜间，例如“当前主题已切换至：跟随系统模式（夜间）”。

## 设置

设置模态框由齿轮按钮打开，内有六组选项，调整后立即生效：

| 选项 | 内容 |
| --- | --- |
| 颜色 | 主题的种子色 |
| 色调变体 | 由种子色生成色板的方式，例如 Tonal Spot、Vibrant |
| 对比度 | 默认、中等、高 |
| 动效 | 标准、表现力 |
| 文字方向 | 跟随语言、从左到右、从右到左 |
| 字号 | 100%、150%、200% |

<div class="demo-surface">
  <div class="demo-stack">
    <div class="demo-row">
      <strong>色调变体</strong>
      <m3e-filter-chip-set aria-label="色调变体示例">
        <m3e-filter-chip selected value="tonal-spot">Tonal Spot</m3e-filter-chip>
        <m3e-filter-chip value="vibrant">Vibrant</m3e-filter-chip>
        <m3e-filter-chip value="expressive">Expressive</m3e-filter-chip>
        <m3e-filter-chip value="monochrome">Monochrome</m3e-filter-chip>
      </m3e-filter-chip-set>
    </div>
    <div class="demo-row">
      <strong>持久化</strong>
      <m3e-switch id="settings-demo-persist" checked aria-label="持久化示例"></m3e-switch>
      <span>保存到当前浏览器</span>
    </div>
  </div>
</div>

以上控件只是外观演示，修改它们不会改变主题。

带头图的页面改用图片中取到的颜色。离开这一页后，恢复设置中的颜色。

## 站点的默认外观

读者的选择只保存在他们自己的浏览器中。要改变所有人第一次看到的外观，在共用配置中设置默认值：

```ts
// docs/config.ts
settings: {
  defaults: {
    color: "#6750A4",
    scheme: "auto",
    motion: "expressive",
  },
},
```

也可以只显示部分选项，或者隐藏明暗模式按钮，见[接口](/zh-CN/theme/settings/api)。明暗模式如何在首帧之前生效、各选项作用在哪里，见[技术细节](/zh-CN/theme/settings/details)。
