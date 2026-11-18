---
icon: search
order: 5
tab: 概览
parallel:
  - api
  - details
  - dock
---

# 搜索

顶栏右侧是搜索入口。宽屏下它是搜索框，带占位文字与快捷键提示。窄屏收成圆形按钮。点击入口或按 `⌘K`（Windows 与 Linux 上是 `Ctrl K`），搜索框展开为搜索面板。

## 使用

| 按键 | 作用 |
| --- | --- |
| `⌘K` / `Ctrl K` | 在任意页面打开搜索 |
| `↑` / `↓` | 在结果之间移动 |
| `Enter` | 打开当前结果 |
| `Esc` | 关闭搜索 |

结果按页面与章节列出，并附上命中位置的摘要。打开带章节的结果时，页面滚动到对应的标题。多语言站点只返回当前语言的页面。

## 浮动搜索

把 `<SearchDock>` 放在希望搜索框停下的位置。这个标签只预留一个盒子。真正的搜索框会离开顶栏，测量这个盒子，在页面打开期间留在那里。

```md
# 指南

<SearchDock variant="hero" align="center" placeholder="搜索指南" />
```

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `placeholder` | `string` | `search.placeholder` | 停靠在此处时的占位文字 |
| `variant` | `"bar" \| "pill" \| "icon" \| "hero"` | `"bar"` | 搜索框外观 |
| `align` | `"start" \| "center" \| "end"` | `"start"` | 图标、文字与快捷键的对齐方式 |
| `width` | `string \| number` | 外观宽度 | 预留盒子的 CSS 长度或像素宽度 |
| `height` | `string \| number` | 外观高度 | 预留盒子的 CSS 长度或像素高度 |
| `fill` | `boolean` | `false` | 占满外层盒子，而不是使用外观固有尺寸 |
| `immersive` | `boolean` | `false` | 在浮层内直接输入并搜索，不打开对话框 |
| `showShortcut` | `boolean` | `true` | 显示停靠搜索框里的快捷键提示 |
| `background` | `string` | 外观底色 | 搜索框表面的 CSS 颜色 |
| `borderColor` | `string` | 外观边框 | 搜索框边框的 CSS 颜色 |
| `shadow` | `boolean` | `true` | 是否保留浮起阴影；`false` 去掉 |
| `elevation` | `number` | 外观层级 | 0 到 5 的 MD3 阴影层级；`0` 去掉阴影 |
| `priority` | `number` | `0` | 同一页面有多个标签时优先使用 |

标签已全局注册，页面不需要导入。把它写进文档流，放在希望搜索框出现的位置。具体落点由周围的布局决定。

直接打开这个页面时，搜索框就落在盒子里，没有过渡动画。从其他页面进入时，搜索框从顶栏或上一处停靠位置飞过来。进入没有标签的页面时，它飞回顶栏并淡出。

改这些属性时，搜索框在原处改变形状或对齐。同一页面有多个标签时，`priority` 最大的生效，相同时取先渲染的那个。

搜索框停靠在页面中时，顶栏里的标题和标签会占用它空出的位置。飞回顶栏时，这块空间随飞行一起平滑让出。

标签只有在空间合适时才接收搜索框。盒子必须完整落在页面区域和视口内，并避开顶栏与标签栏。否则搜索框留在顶栏，等滚动让标签回到空白区域后再飞入。

飞行途中滚动页面时，搜索框跟着标签一起移动。它不会留在旧位置，等到最后一帧才跳过去。若飞回顶栏途中标签重新可用，搜索框从当前位置直接折返，不重新播放。

飞回顶栏的过程中，它的底色、字号和内边距也一起过渡，不会落位后才突然变回顶栏样式。

飞行与淡出使用主题的 MD3 动效令牌，因此跟随“标准 / 表现力”设置，并尊重 `prefers-reduced-motion`。

每个属性的完整说明见[在线示例](/zh-CN/theme/search/dock)与[接口](/zh-CN/theme/search/api#searchdock)。

## 本地索引

默认不依赖后端。主题使用 VitePress 本地搜索生成的索引。每种语言一个索引，只在这种语言第一次搜索时下载。

页面按标题分成章节，匹配由 [MiniSearch](https://lucaong.github.io/minisearch/) 完成。中文与日文按词切分。输入词的开头即可命中，较长的词允许拼错一两个字母。开发时修改页面，索引随之更新。

## 接入其他搜索

需要语义搜索或站外内容时，换成 HTTP 接口或自己的 JS 函数：

```ts
// docs/config.ts
search: {
  backend: { type: "http", endpoint: "/api/docs/search" },
},
```

后端的写法与结果格式见[接口](/zh-CN/theme/search/api)。面板的动效、索引的生成与排序见[技术细节](/zh-CN/theme/search/details)。
