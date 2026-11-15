# 使用图标

图标需要先注册再使用。注册只做一次，之后在 Markdown、配置与组件中都可以按名称引用。

## 注册

在 `docs/.vitepress/theme/icons.ts` 中导入图标模块，导入即注册：

```ts
import "@m3e/icons/outlined/home";
import "@m3e/icons/outlined/search";
import "@m3e/icons/outlined/rocket_launch";
```

- 模块名就是 Material Symbols 的图标名，可以在 [fonts.google.com/icons](https://fonts.google.com/icons) 查到。
- 不要导入整个图标包，只导入用到的图标，未导入的图标不会进入构建产物。
- 使用了未注册的图标时，`<m3e-icon>` 显示为空白。图标不显示时，先检查是否已注册。

## 在页面中使用

Markdown 中直接写 `<m3e-icon>`：

```html
<m3e-icon name="rocket_launch"></m3e-icon>
```

放在按钮等组件中时，用 `slot="icon"` 指定位置：

<div class="demo-row">
  <m3e-button variant="filled">
    <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
    开始使用
  </m3e-button>
  <m3e-button variant="tonal">
    <m3e-icon slot="icon" name="tune"></m3e-icon>
    调整
  </m3e-button>
</div>

```html
<m3e-button variant="filled">
  <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
  开始使用
</m3e-button>
```

## 在导航中使用

rail 与移动端抽屉一级菜单中的图标是分类的图标，写在共用配置的 `sidebar.categories` 中。文章的图标则写在文章头部信息中：

```ts
// docs/config.ts
sidebar: {
  categories: {
    "getting-started": { icon: "rocket_launch" },
    styles: { icon: "style" },
  },
},
```

```yaml
# docs/zh-CN/styles/color/index.md
---
icon: colorize
---
```

这些图标同样需要在 `icons.ts` 中注册。分类没有设置图标时，图标显示为 `category`。

## 无障碍

- 有文字相伴的图标是装饰，不需要额外处理：`<m3e-icon>` 默认对辅助技术隐藏。
- 只有图标、没有文字的按钮必须提供名称，例如 `<m3e-icon-button aria-label="搜索">`，并配合 `m3e-tooltip` 显示同样的文字。
- 方向性图标（箭头、前进后退）在从右到左的排版下需要成对替换，例如用 `arrow_forward` 与 `arrow_back` 互换。不要用图标单独传达方向以外的含义。
- 在高对比度模式下，图标跟随文字颜色，不要给图标设置固定颜色。
