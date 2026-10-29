---
tab: 技术细节
---

# 设置与明暗模式：技术细节

## 明暗模式的解析

| 模式 | 解析 |
| --- | --- |
| 跟随系统 `auto` | 读 `prefers-color-scheme`，系统切换时页面随之切换。浏览器给不出系统偏好时（不支持这个媒体查询，或浅色、深色都不匹配），按跟随时间处理 |
| 日间 `light` | 浅色 |
| 夜间 `dark` | 深色 |
| 跟随时间 `time` | 本地时间早于 07:00 或晚于 18:59 时深色，其余为浅色 |

跟随时间模式下，以及跟随系统但浏览器给不出系统偏好时，主题每分钟读一次当前时间，跨过 7 点或 19 点时自动切换；其他情况下不运行这个定时器。解析结果（`light` 或 `dark`）写到 `m3e-theme` 的 `scheme` 属性与 `html.dark` 类上。

## 首帧之前

`akariHead()` 在 `<head>` 中加入一段很小的内联脚本：它读取 `localStorage` 中保存的模式，按上表解析，在首帧绘制之前设置 `html.dark`，深色页面不会先闪一下浅色。这段脚本与主题使用同一个 `storageKey` 和默认模式，所以修改其中之一时要把同样的值传给 `akariHead()`。开发服务器不预渲染页面，这段脚本只在构建产物中先于首帧执行。

## 切换提示

每次按下明暗模式按钮，屏幕底部弹出一条 `m3e-snackbar`，约 2.5 秒后消失，连续按下时新的提示替换旧的。文字来自界面文字 `schemeChanged`（「当前主题已切换至：{mode}模式」）与 `schemeChangedFollowing`（再加「（{scheme}）」），见[国际化](/zh-CN/theme/i18n/api#messages)。

## 各选项作用在哪里

颜色、变体、明暗、对比度与动效绑定到应用根部的 `m3e-theme`：

```vue
<m3e-theme
  :color="heroColor ?? settings.color"
  :variant="settings.variant"
  :scheme="resolvedScheme"
  :contrast="settings.contrast"
  :motion="settings.motion"
  strong-focus
>
  <!-- 应用 -->
</m3e-theme>
```

文字方向与字号不经过组件属性，而是写到文档根元素上：

```ts
document.documentElement.dir =
  settings.direction === "auto" ? dir : settings.direction;
document.documentElement.style.fontSize = settings.textSize;
```

- `auto`（跟随语言）取当前语言的 `dir`（`useData().dir`，来自语言配置，没写时来自语言包），切换到另一种语言时随之改变；阿拉伯文等从右到左的语言因此默认从右到左。
- 方向切换影响 m3e 组件的双向布局与图标方向，平行页面的切页动画也随之镜像。
- 字号切换影响所有以 `rem` 计算的尺寸：正文、标题、间距与代码块等比缩放；m3e 组件的字号由组件令牌决定，不会简单地放大两倍，但布局保持可用。
- Layout 把 `m3e-theme` 生成的色板同步到根元素，`html` 与 `body`、顶栏、导航、文档表面、目录与各个模态框都随种子色、变体、明暗与对比度变化，没有另外一套固定的颜色。

## 读写与回退

- 服务端渲染只输出默认值；浏览器挂载后再读 `localStorage`，避免水合不一致。明暗模式由上面的脚本提前应用。
- 每次修改后写入 `localStorage`。存储内容损坏、字段缺失或取值非法时，逐项回退到默认值。
- 隐私模式或配额耗尽导致读写失败时静默忽略，页面照常运行。
- `persist: false` 时设置只在当前页面的生命周期内有效，刷新后回到默认值。
- 不同浏览器、不同域名或端口各有一份 `localStorage`；设置不跨设备同步，也不会写回仓库。

## 设置模态框

设置模态框与搜索、语言选择使用同一种 M3 容器变换：按钮展开为居中的面板，面板标题前的齿轮图标就是按钮本身，关闭时原路收回，表现力动效下展开与收回都带一点回弹。`Escape`、点击遮罩或右上角的关闭按钮都会收起，焦点回到打开它的按钮。动效的细节见[搜索](/zh-CN/theme/search/details#容器变换)。窗口高度放不下全部选项时（手机、矮窗口），面板内容在标题下方滚动，带一条细滚动条。

- 颜色使用原生 `<input type="color">`，选择后立即生成新的色板。
- 色调变体使用 `m3e-filter-chip-set`（多选的外观、单选的行为）；对比度、动效、方向与字号使用 `m3e-segmented-button`。
- 设置 API 提供 `reset()`，但界面上不放「恢复默认」按钮，与官方文档一致。
