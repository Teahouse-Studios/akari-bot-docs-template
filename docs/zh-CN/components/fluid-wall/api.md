---
tab: 接口
---

# 流体背景墙：接口

`AkariFluidWall` 是主题内置组件，不是 `m3e-` 元素。组件读取 `--md-sys-color-*` 与 `--md-sys-motion-*` 令牌，因此会跟随设置中的配色与动效。

颜色在 WebGL2 片元着色器中计算。参数通过 uniform 传入，切换配色时只重绘同一块流场，不重建程序。

## AkariFluidWall

| 属性 | 取值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `height` | `string` | `clamp(220px, 34vh, 380px)` | 任意 CSS 长度。 |
| `variant` | `"silk"`、`"aurora"`、`"mesh"`、`"nebula"`、`"blossom"` | `"silk"` | 背景板形态。未知值退回 `silk`。 |
| `light` | `"start"`、`"center"`、`"end"` | `"end"` | 虚拟光源所在的一端。此属性同时决定暗角方向。 |
| `placement` | `"start"`、`"center"`、`"end"` | `"start"` | 插槽内容的横向位置。渐变蒙版随之翻转。 |
| `texture` | `"none"`、`"sakura"`、`"petals"`、`"stars"`、`"lace"`、`"vine"`、`"dots"` | 随 `variant` | 叠加纹理类型。 |
| `texture-size` | `number \| string` | 随 `texture` | 叠加层的瓦片边长，单位为 px。取值夹在 80–640。 |
| `texture-density` | `number \| string` | 随 `texture` | 图案密度倍率。取值夹在 0–3。数值越小，图案越疏。 |
| `vine-density` | `number \| string` | `0.7` | 藤蔓密度倍率。取值夹在 0.2–2。数值越小，藤蔓越少。 |
| `texture-opacity` | `number \| string` | 随 `variant` | 叠加层透明度，取值 0–1。最终透明度还会乘以该纹理的观感权重。 |
| `texture-tone` | `"auto"`、`"ink"`、`"light"` | `"auto"` | 纹理画法。`auto` 按明暗决定，深色模式取 `light`。 |
| `texture-color` | `string` | — | 任意 CSS 颜色。此属性覆盖 `texture-tone`。颜色作用于叠加纹理与藤蔓，alpha 只影响叠加纹理。 |
| `vine-colors` | `Partial<Record<"base" \| "leaf" \| "leafStem" \| "flower" \| "flowerStem" \| "bud" \| "fill" \| "tint" \| "halo" \| "edge" \| "fine", string>>` | — | 逐部位设置藤蔓颜色，值可以包含 alpha。`base` 设置未单独指定部位的底色。未列出的部位依次跟随 `fill`、`base`、`texture-color`。 |
| `vine-blend` | `"normal"`、`"multiply"`、`"screen"`、`"overlay"`、`"soft-light"`、`"difference"` | `"normal"` | 藤蔓与流体背景的混合模式，对应 CSS `mix-blend-mode`。 |
| `vine-popout-blend` | `"normal"`、`"multiply"`、`"screen"`、`"overlay"`、`"soft-light"`、`"difference"` | `vine-blend` | 出屏藤蔓越过出屏点之后的混合模式。仅当此属性与 `vine-blend` 不同时，组件启用独立画布。 |
| `vine-popout-colors` | `Partial<Record<"base" \| "leaf" \| "leafStem" \| "flower" \| "flowerStem" \| "bud" \| "fill" \| "tint" \| "halo" \| "edge" \| "fine", string>>` | — | 出屏藤蔓越过出屏点后的逐部位颜色。 |
| `speed` | `number \| string` | 随 `variant` | 流速倍率。1 表示变体自带的速度。 |
| `scale` | `number \| string` | 随 `variant` | 噪声取样尺度。数值越大，褶皱越细。 |
| `curl` | `number \| string` | 随 `variant` | 卷曲项强度。0 表示无方向的平流。 |
| `warp` | `number \| string` | 随 `variant` | 二级扭曲的拖拽距离。数值越小，流动越安静。 |
| `tone` | `number \| string` | 随 `variant` | 对比调节。0 为设计对比，1 会把背景板淡化到页面底色。 |
| `grid` | `number \| string` | 随 `variant` | 网格格距，单位为 px。0 表示不绘制网格。 |
| `glow` | `number \| string` | 随 `variant` | 跟随指针的柔光强度。0 表示关闭。 |
| `petal` | `number \| string` | 随 `variant` | 褶皱卷成花瓣臂的程度。0 表示纯流场。 |
| `popout` | `boolean \| "auto"` | `"auto"` | 藤蔓是否越过画框。`auto` 跟随页面上的藤蔓开关。 |
| `inward` | `boolean \| "auto"` | `"auto"` | 藤蔓是否从板内向外拱起。`auto` 与 `popout` 一致。 |
| `safe-zone` | `boolean \| string \| string[]` | `"auto"` | 出屏藤蔓的避让区。`auto` 避开墙上的文字。`none` 或 `false` 表示不避让。墙内藤蔓是否避让由 `wall-vines-in-safe-zone` 控制。 |
| `outside-safe-zone` | `boolean \| string \| string[]` | `"none"` | 墙外安全区：出屏藤蔓避让的墙外矩形。语法与 `safe-zone` 相同，负值可伸到墙外。 |
| `wall-vines-in-safe-zone` | `boolean` | `true` | 墙内藤蔓能否进入 `safe-zone`。设为 `false` 时墙内藤蔓避开安全区；出屏藤蔓始终避让。 |
| `ripple` | `number` | `1` | 出屏点波纹的强度。0 表示关闭。 |
| `ripple-speed` | `number` | `1` | 出屏点波纹的速度倍率。 |
| `ripple-size` | `number` | `1` | 出屏点波纹的半径倍率。 |
| `ripple-rings` | `number \| string` | `2.2` | 每道波纹半径内的圈数。取值夹在 0.5–6。 |
| `ripple-sway` | `number \| string` | `1` | 波纹推动藤蔓的幅度倍率。取值夹在 0–3。 |
| `vine-glow` | `number \| string` | `1` | 指针柔光在藤蔓上的强度倍率。取值夹在 0–2。0 表示关闭。 |
| `shadow` | `number` | `1` | 出屏藤蔓投影的深浅倍率。0 表示关闭。 |
| `shadow-size` | `number` | `1` | 出屏藤蔓投影的大小倍率。 |
| `shadow-color` | `string` | 随藤蔓填充加深 | 投影颜色。 |
| `shadow-angle` | `number` | `303.5` | 投影方向，单位为度。0 对应 +x 方向，90 对应 +y 方向。 |
| `shadow-blur` | `number` | `6` | 投影模糊半径，单位为 CSS 像素。0 表示硬边。 |
| `wall-shadow` | `number` | `1` | 墙内藤蔓投影的深浅倍数。 |
| `wall-shadow-size` | `number` | `1` | 墙内藤蔓投影的大小倍数。 |
| `wall-shadow-color` | `string` | `随藤蔓填充色` | 墙内藤蔓投影的颜色。 |
| `wall-shadow-angle` | `number` | `180` | 墙内投影相对墙外投影的方向偏移，单位为度。 |
| `wall-shadow-blur` | `number` | `6` | 墙内投影的模糊半径，单位为 CSS 像素。0 表示硬边。 |
| `underlay-color` | `string` | `#ffffff` | 叠加在藤蔓底色下方的遮罩颜色。 |
| `underlay-opacity` | `number` | `0.18` | 遮罩透明度，范围 0–1。 |
| `underlay-blend` | `string` | `additive` | 遮罩的混合模式：`additive`、`screen`、`normal`、`multiply`、`subtractive`。 |
| `mote` | `number` | `1` | 粒子数量倍率，范围 0–3；0 关闭粒子。 |
| `mote-color` | `string` | 花朵颜色 | 粒子颜色，支持任意 CSS 颜色。 |
| `mote-blend` | `string` | `auto` | 粒子混合模式：`auto`、`normal`、`additive`、`multiply`、`subtractive`。 |

数值属性接受字符串形式的 CSS 值，例如 `"1.2"` 或 `"72"`。解析由 `fluidNumber` 完成。传入非法值时，组件使用变体自带的值。

| 插槽 | 内容 |
| --- | --- |
| 默认 | 中间一列内容。垂直居中，横向按 `placement` 对齐。 |
| `top` | 右上角的角标。 |
| `bottom` | 左下角的脚注。 |

| CSS 类 | 位置 |
| --- | --- |
| `.akari-fluid-wall` | 根元素。`data-placement` 标出对齐方向。 |
| `.akari-fluid-wall__canvas` | WebGL2 画布层。首帧绘制完成后淡入。 |
| `.akari-fluid-wall__grid`、`__grid-lit` | 网格层与跟随指针的点亮层。 |
| `.akari-fluid-wall__texture`、`__texture-pattern`、`__texture-lit` | 叠加纹理及其点亮层。 |
| `.akari-fluid-wall__ribbons`、`__ribbon-lace`、`__ribbon-scallop` | 蕾丝带图层及其花边与扇贝边。 |
| `.akari-fluid-wall__vine-canvas` | 藤蔓画布。 |
| `.akari-fluid-wall__veil` | 有插槽内容时压在文字下的渐变。 |
| `.akari-fluid-wall__body`、`__block` | 插槽容器与单个块。 |

## 导出的函数

几何与调色逻辑位于 `fluid.ts`，与组件一起从主题入口导出。

示例：

```ts
import {
  AkariFluidWall,
  FLUID_VARIANTS,
  FLUID_TEXTURES,
  FLUID_TEXTURE_SIZES,
  FLUID_TEXTURE_WEIGHTS,
  FLUID_VARIANT_SPECS,
  resolveFluid,
  fluidPalette,
  fluidVariant,
  fluidTexture,
  fluidTextureTone,
  fluidNumber,
  mixFluid,
  fluidLoopOffset,
  fluidLoopOffsets,
  FLUID_LOOPS,
  fluidRenderSize,
  FLUID_MAX_DPR,
  buildFluidRibbons,
  ribbonLacePitch,
  ribbonLacePath,
  ribbonScallopPath,
  ribbonScallopAmplitude,
  ribbonEdgePath,
  ribbonBandPath,
} from "vitepress-akari-theme-docs";
```

| 名称 | 说明 |
| --- | --- |
| `FLUID_VARIANTS`、`FLUID_VARIANT_SPECS` | 五个变体名，以及每个变体的完整参数表。 |
| `FLUID_TEXTURES`、`FLUID_TEXTURE_SIZES`、`FLUID_TEXTURE_WEIGHTS` | 七种叠加层的名称、瓦片尺寸与观感权重。 |
| `resolveFluid(variant, overrides)` | 以参数表为默认值，应用显式值并夹紧越界值，返回一份 `FluidVariantSpec`。 |
| `fluidVariant(v)`、`fluidTexture(v)` | 把任意输入收敛为合法枚举。未知值退回 `silk` 或 `none`。 |
| `fluidTextureTone(tone, scheme)` | 把 `auto` 按明暗解析为 `ink` 或 `light`。 |
| `fluidNumber(value, min, max, fallback)` | 夹紧并返回兜底值。所有数值属性的解析都经过此函数。 |
| `fluidPalette(tokens, scheme, tone, accent)` | 由九个颜色令牌与两档调节量计算一份 `FluidPalette`。 |
| `mixFluid(from, to, amount)` | 线性插值，口径与 GLSL `mix` 相同。 |
| `FLUID_LOOPS`、`fluidLoopOffset(s, loop)`、`fluidLoopOffsets(s)` | 四路闭合漂移的周期，以及单路与整体的相位偏移。 |
| `fluidRenderSize(w, h, dpr)`、`FLUID_MAX_DPR` | 换算画布分辨率与像素预算（`1.1M`）。 |
| `buildFluidRibbons(w, h, seed, count)` | 生成蕾丝带几何，包括端点、曲线、宽度与法向轴。相同 seed 可复现。 |
| `ribbonLacePitch(width)` | 蕾丝图案的节距，值为 `max(26, width × 1.45)`。 |
| `ribbonLacePath(ribbon)` | 带内的四瓣花、小环、对点与凹口珠。全部为圆弧子路径。 |
| `ribbonScallopPath(ribbon, side)` | 一条扇贝边线。 |
| `ribbonScallopAmplitude(ribbon)` | 该带子扇贝的振幅。 |
| `ribbonEdgePath(ribbon, side)`、`ribbonBandPath(ribbon)` | 单侧折线与闭合的带子轮廓。 |
| `FluidPalette`、`FluidTokens`、`FluidRibbon`、`FluidVariantSpec` | 各层的类型定义。 |

## 无障碍

- 背景层带有 `aria-hidden`。画布不参与可访问性树，读屏只读取插槽内容。
- 组件不接管键盘与点击。`pointer-events: none` 只加在画布与纹理层上，插槽中的按钮照常可用。
- 系统开启“减少动态效果”时，组件只绘制首帧，不闪烁，不漂移。
- 深色与浅色各有一份调色与兜底渐变。暗角、自发光与颗粒强度分档，切换到浅色时不会因加性光而曝白。

## 使用限制

- 叠加纹理是静态图案，不随流场移动。需要动画时必须修改着色器。
- `lace` 的带子每次挂载都会重新生成随机种子，因此刷新页面后花边位置会变化。需要固定位置时，请使用组件之外的随机源缓存，组件目前不提供固定种子的属性。
- 组件不依赖外部图片。纹理与蕾丝都是运行时生成的内联 SVG 与路径，不产生额外网络请求。
