---
tab: 接口
---

# 搜索：接口

## search

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | 是否显示搜索入口并注册快捷键 |
| `placeholder` | `string` | 随语言，“搜索文档” | 搜索框的占位文字 |
| `shortcut` | `string` | `"k"` | 与 `⌘` / `Ctrl` 组合的按键。空字符串关闭快捷键 |
| `maxResults` | `number` | `8` | 结果上限，限制在 1 到 20 |
| `debounce` | `number` | `180` | 输入防抖的毫秒数，限制在 0 到 1000 |
| `backend` | `AkariSearchBackendConfig` | 本地索引 | `local`、`http` 或 `registered` |

`search` 可以写在语言配置中，为不同语言指定不同的后端。

## SearchDock

`<SearchDock>` 由主题全局注册。把它放在页面中希望搜索框落下的位置，不需要导入。这个标签渲染一个预留盒子。顶栏入口的固定副本飞到这个盒子上，并采用盒子的属性。

```md
<SearchDock variant="hero" align="center" placeholder="搜索指南" />
```

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `placeholder` | `string` | `search.placeholder` | 停靠在此处时的占位文字 |
| `variant` | `"bar" \| "pill" \| "icon" \| "hero"` | `"bar"` | 搜索框外观 |
| `align` | `"start" \| "center" \| "end"` | `"start"` | 图标、文字与快捷键在框内的对齐方式 |
| `width` | `string \| number` | 外观宽度 | 预留盒子的 CSS 长度或像素宽度 |
| `height` | `string \| number` | 外观高度 | 预留盒子的 CSS 长度或像素高度 |
| `fill` | `boolean` | `false` | 占满外层盒子，而不是使用外观固有尺寸 |
| `priority` | `number` | `0` | 同一页面有多个标签时优先使用 |

`bar` 是顶栏搜索框，`pill` 是色调搜索框，`icon` 是圆形浮动按钮，`hero` 是大号色调入口。`width` 与 `height` 接受 CSS 长度（`"20rem"`、`"min(100%, 30rem)"`）或像素数字。不写时使用该外观的自然尺寸。加上 `fill` 会改为占满外层盒子（`width: 100%; height: 100%`）。外层需要有确定的宽高，显式 `width` / `height` 仍可单独覆盖某一轴。

标签还接受默认插槽。插槽内容排在预留盒子里，位于搜索框后面。标签本身标记为 `aria-hidden`。真正打开搜索的是搜索框按钮。

同一页面可以有多个标签。`priority` 最大的生效，相同时取先注册的那个，尺寸为零或隐藏的标签会被跳过。

标签还必须完整落在页面区域和视口内，并避开顶栏与标签栏。否则搜索框留在顶栏，等滚动让标签获得空间后再飞入。一个页面通常只留一个标签。

页面卸载时搜索框飞回顶栏并淡出。在带标签的页面之间移动时，搜索框从一处盒子飞到另一处。首次打开就是这一页时，它直接落位，不播放过渡。

所有时长与曲线都来自主题的 MD3 弹簧令牌，因此跟随“标准 / 表现力”设置，并尊重 `prefers-reduced-motion`。

`<AkariSearchDock>` 是同一个组件的别名。

## 本地后端

```ts
backend: { type: "local" },
```

本地后端使用 VitePress 本地搜索（`provider: "local"`）生成的索引。每种语言一个索引，按 VitePress 的语言键加载，根语言为 `root`。若有语言使用本地后端，`akariContent` 在站点配置中开启它，并让索引保存每一节的正文，用于结果中的摘要：

```ts
// akariContent 生成的站点配置
themeConfig: {
  search: {
    provider: "local",
    options: { miniSearch: { options: { storeFields: ["title", "titles", "text"] } } },
  },
},
```

索引中每一节是一条文档。`id` 是页面地址加标题的锚点，`title` 是这一节的标题。`titles` 是这一节上面的各级标题，第一项为页面标题。`text` 是去掉标签的正文。

页面一级标题下的那一节代表页面本身，结果链接到页面顶部。

没有在 `.vitepress/config.mts` 中写 `themeConfig` 时，`...content.site` 带上这项设置。若已经写了，要把 `content.site.themeConfig` 合并进去。

## HTTP 后端

```ts
backend: {
  type: "http",
  endpoint: "/api/docs/search",
  method: "POST",
  headers: { Authorization: "Bearer YOUR_TOKEN" },
  credentials: "include",
  queryParam: "q",
  limitParam: "limit",
},
```

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `endpoint` | `string` | 必填 | 接口地址。相对路径自动加上 `base`，绝对地址不变 |
| `method` | `"GET" \| "POST"` | `"GET"` | `GET` 把查询写进查询参数。`POST` 发送 JSON：`{ "q": "关键词", "limit": 8 }` |
| `headers` | `Record<string, string>` | `{}` | 请求头 |
| `credentials` | `RequestCredentials` | `"same-origin"` | 是否携带 Cookie |
| `queryParam` | `string` | `"q"` | 查询词的参数名 |
| `limitParam` | `string` | `"limit"` | 结果上限的参数名 |

响应可以是结果数组，也可以是 `{ "results": [...] }`。每个结果识别以下字段：`title`、`href`（或 `url`、`path`）、`pageTitle`、`heading`、`excerpt`（或 `content`、`snippet`、`description`）、`id`。

```json
{
  "results": [
    {
      "id": "button-variants",
      "title": "变体",
      "pageTitle": "按钮",
      "heading": "变体",
      "href": "/zh-CN/components/button.html#变体",
      "excerpt": "五种外观从高到低表达强调程度……"
    }
  ]
}
```

响应非 2xx、网络出错或结构不合法时，面板显示错误与重试按钮。

## 注册的后端

在主题入口注册一个函数，再在配置中引用它的 id：

```ts
// docs/.vitepress/theme/index.ts
import { registerSearchBackend } from "./search/registry";

registerSearchBackend("my-search", async (query, { limit, signal, lang }) => {
  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&lang=${lang}`,
    { signal },
  );
  if (!response.ok) throw new Error("搜索失败");
  const data = await response.json();
  return data.results.slice(0, limit);
});
```

```ts
// docs/config.ts
search: { backend: { type: "registered", id: "my-search" } },
```

```ts
function registerSearchBackend(id: string, handler: AkariSearchHandler): void;

type AkariSearchHandler = (
  query: string,
  context: AkariSearchContext,
) => AkariSearchResult[] | Promise<AkariSearchResult[]>;

interface AkariSearchContext {
  limit: number;
  signal?: AbortSignal;   // 输入新查询或关闭面板时中止
  lang?: string;          // 当前语言，例如 "zh-CN"
  locale?: string;        // VitePress 语言键，根语言为 "root"
}
```

配置中引用了不存在的 id 时，面板显示明确的错误。

## AkariSearchResult

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 唯一标识 |
| `title` | `string` | 结果的标题 |
| `href` | `string` | 地址。站内地址走 SPA 导航，外部地址在新标签页打开 |
| `pageTitle` | `string` | 所在页面的标题，显示在结果上方 |
| `heading` | `string` | 所在章节 |
| `excerpt` | `string` | 摘要，命中的词会高亮 |

所有文字按纯文本渲染。

## useAkariSearch

```ts
import { useAkariSearch } from "@theme";

const { isOpen, query, results, loading, error, openSearch, closeSearch } =
  useAkariSearch();
```

用于自行实现的搜索入口。`openSearch()` 打开面板，`query`、`results`、`loading` 与 `error` 是面板的状态。`useAkariSearch` 只能在布局内部的组件中调用。
