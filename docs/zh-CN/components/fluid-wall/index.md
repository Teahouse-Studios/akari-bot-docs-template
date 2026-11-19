---
icon: wallpaper
order: 5
tab: 概览
parallel:
  - api
---

<script setup>
import FluidWallPlayground from "../../../.vitepress/theme/components/content/FluidWallPlayground.vue";
</script>

# 流体背景墙：概览

`AkariFluidWall` 是一块使用 WebGL2 绘制的背景板。组件用两层扭曲噪声生成流动纹理。颜色来自主题的 `--md-sys-color-*` 令牌，因此切换配色或明暗模式时会自动更新。

组件可以单独作为页面装饰，也可以承载标题与说明文字。

::: tip
系统开启“减少动态效果”、标签页切到后台或元素离开视口时，组件只绘制首帧。回到前台或重新进入视口后，动画继续。
:::

## 最小用法

示例：

```html
<AkariFluidWall />
```

未设置属性时，组件使用 `silk` 变体。此变体包含中等尺度褶皱、伪花瓣、72px 网格和跟随指针的柔光。默认高度为 `clamp(220px, 34vh, 380px)`。

## 预览编辑器

预览区与控件在同一页。改动只影响当前实例。代码示例会随配置更新，可以直接复制回页面。

<FluidWallPlayground />

## 变体

`variant` 控制背景板的整体形态。五个变体各是一组参数起点。单独设置属性会覆盖起点值。

例如，`silk` 设置更大的 `scale` 后仍是 `silk` 变体，只是褶皱更细。

`silk` 是默认值。此变体开启褶皱、伪花瓣与细网格。

`aurora` 把噪声域沿横向压扁，形成竖向光带。组件再叠加一条更快的条纹，使光带缓慢扫过。此变体没有花瓣与网格，颜色偏冷，适合页面顶部的横向光带。

`mesh` 把流动压到接近静止，只保留柔光底。网格线更明显，指针聚光范围更大。此变体适合在上方放置文字。

`nebula` 的噪声尺度最大，漂移速度最慢，暗角最重。组件额外叠加一层很淡的樱花。此变体在深色模式下更接近星点纹理。

`blossom` 在 `silk` 基础上减弱褶皱，叠加明显的樱花纹理，不绘制网格。此变体适合春季或偏柔和的场景。

## 叠加纹理

`texture` 在流体层上叠加一层静态图案。图案不随流场移动，适合作为暗纹或花边。

<div class="demo-row">
  <m3e-chip>sakura</m3e-chip>
  <m3e-chip>petals</m3e-chip>
  <m3e-chip>stars</m3e-chip>
  <m3e-chip>lace</m3e-chip>
  <m3e-chip>vine</m3e-chip>
  <m3e-chip>dots</m3e-chip>
</div>

在预览编辑器中切换“纹理”，可以查看各种纹理的效果。

`sakura` 绘制五瓣樱花。浅色模式下绘制线稿，深色模式下绘制实心花瓣。`texture-tone` 可以覆盖此行为。

`petals` 只绘制散落花瓣，密度低于 `sakura`。

`stars` 绘制四角星点，在深色模式下对比最清楚。

`lace` 不使用贴图。组件按条生成蕾丝带，每条从画面一端穿到另一端。每条带子有两条扇贝边线和一排花边。位置与方向由 `seed` 决定；省略时每次加载不同，固定 `seed` 可复现。

`vine` 绘制藤蔓，可以越过画框，见“藤蔓出屏”一节。

`dots` 绘制交错圆点阵，是透明度最低的一种纹理。

::: tip
单独设置 `texture="stars"` 且不设置 `variant` 时，`silk` 自带的叠加透明度为 0。`resolveFluid` 会把纹理透明度补到 `0.55`，因此纹理可见。需要更淡时，请设置 `texture-opacity`。
:::

## 在墙上写字

默认插槽位于中间一列。`top` 插槽位于右上角，`bottom` 插槽位于左下角。`placement` 控制中间列的横向位置。

示例：

```html
<AkariFluidWall height="240px" placement="start">
  <h2>小可的文档</h2>
  <p>背景是一块流体墙，文字直接排在上面。</p>
  <template #top><span>v1.0</span></template>
  <template #bottom><span>AkariBot</span></template>
</AkariFluidWall>
```

有插槽内容时，组件在文字下绘制一层渐变（`--akari-fluid-wall__veil`）。此渐变用于保证文字对比度。`placement` 为 `start`、`center`、`end` 时，渐变方向随之改变。没有插槽内容时不绘制此层。

## 藤蔓出屏

`texture="vine"` 时，部分藤蔓可以越过画框，也可以从板内向外拱起。

`popout` 控制藤蔓是否越过画框。`inward` 控制藤蔓是否向内拱起。`safe-zone` 指定藤蔓需要避开的区域。

`vine-colors` 的 `base` 设置所有未单独指定部位的底色。`fill` 同时作为其余部位的默认色。显式指定某个部位时，该部位使用显式值。以上都未设置时，使用 `texture-color`。

## 跟随配色

颜色读取自 `--md-sys-color-*` 与 `--md-sys-motion-*`。因此，右上角的配色按钮切换主题色或明暗时不需要额外配置。

组件通过隐藏的取色探针读取令牌，不解析 `getComputedStyle` 字符串。因此，`color-mix` 与 `rgb(from …)` 等相对颜色也能正确读取。

## GPU 检测

组件在创建 WebGL 上下文之前调用 `detect-gpu.js` 的 `getGPUTier("BAD")`。整页只检测一次。

检测结果写入 `document.documentElement.dataset.akariGpuTier`。结果为 `BAD` 时，组件不创建 WebGL2 上下文，也不创建藤蔓 3D 场景。此时组件只显示 CSS 回退渐变。`BAD` 包括无 WebGL2、SwiftShader 或 llvmpipe 软件渲染等情况。

此时控制台输出一条以 `[akari]` 开头的警告，并附带检测原因。

## 性能

- 着色器按需启动。元素进入视口后才绘制。元素离开视口或标签页隐藏时停止。`prefers-reduced-motion: reduce` 时只绘制首帧。
- 帧率上限为 30fps。DPR 上限为 1.5。像素预算为 `1.1M`。超出预算的画布按比例缩小，再由 CSS 拉伸。
- 无法获取 WebGL2 时使用 CSS 渐变回退。此回退不产生动画。
- 不建议在同一页放置十几块背景墙。每块墙都有自己的 rAF 循环与画布。

属性、插槽、CSS 类与导出的几何函数见[接口](/zh-CN/components/fluid-wall/api)页。
