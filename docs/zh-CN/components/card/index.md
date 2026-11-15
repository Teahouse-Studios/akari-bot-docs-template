---
icon: dashboard
order: 2
tab: 概览
parallel:
  - api
---

# 卡片

`m3e-card` 把标题、正文、操作与页脚放在一个独立的表面上。它适用于功能入口、文档摘要、设置项与媒体内容。

## 变体

三种外观分别对应不同的层级：

<div class="demo-grid">
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Filled</m3e-heading>
    <div slot="content">默认变体，容器色来自 <code>surface-container-highest</code>，不使用描边与阴影。</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Outlined</m3e-heading>
    <div slot="content">带 1px 描边，适合密集列表与需要明确边界的内容块。</div>
  </m3e-card>
  <m3e-card variant="elevated">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Elevated</m3e-heading>
    <div slot="content">带阴影与表面色，适合浮在背景上的重点内容。</div>
  </m3e-card>
</div>

```html
<m3e-card variant="filled">
  <m3e-heading slot="header" variant="title" size="large">Filled</m3e-heading>
  <div slot="content">默认变体，容器色来自表面层级。</div>
</m3e-card>
<m3e-card variant="outlined">
  <m3e-heading slot="header" variant="title" size="large">Outlined</m3e-heading>
  <div slot="content">带 1px 描边。</div>
</m3e-card>
<m3e-card variant="elevated">
  <m3e-heading slot="header" variant="title" size="large">Elevated</m3e-heading>
  <div slot="content">带阴影与表面色。</div>
</m3e-card>
```

未设置 `variant` 时使用 `filled`。

## 插槽结构

卡片提供五个区域：

- `header`：标题、图标或媒体，不额外增加内边距。
- `content`：带内边距的正文区域。
- `actions`：操作按钮，默认靠起始边排列。给元素加 `end` 属性可改为靠结束边。
- `footer`：元信息、版权或次级说明。
- 默认插槽：无内边距，适合全出血图片或自定义布局。

<div class="demo-grid">
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">文档摘要</m3e-heading>
    <div slot="content">
      正文区域可以放段落、列表、Chip 与徽标，内边距由卡片统一控制。
    </div>
    <div slot="actions" end>
      <m3e-button variant="text">取消</m3e-button>
      <m3e-button variant="filled">继续</m3e-button>
    </div>
    <div slot="footer">更新于 2026-10-27</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined">
  <m3e-heading slot="header" variant="title" size="large">文档摘要</m3e-heading>
  <div slot="content">
    正文区域可以放段落、列表、Chip 与徽标，内边距由卡片统一控制。
  </div>
  <div slot="actions" end>
    <m3e-button variant="text">取消</m3e-button>
    <m3e-button variant="filled">继续</m3e-button>
  </div>
  <div slot="footer">更新于 2026-10-27</div>
</m3e-card>
```

`actions` 中的按钮顺序应遵循平台习惯：取消在起始侧，确认在结束侧。页脚文字使用辅助色，避免与正文争夺注意力。

## 组合内容

卡片内部可以混排标题、Chip、徽标与列表：

<m3e-card variant="elevated">
  <m3e-heading m3e-toc-ignore slot="header" variant="headline" size="small">主题能力</m3e-heading>
  <div slot="content">
    <div class="demo-row">
      <m3e-chip>
        <m3e-icon slot="icon" name="palette"></m3e-icon>
        动态色
      </m3e-chip>
      <m3e-chip>
        <m3e-icon slot="icon" name="layers"></m3e-icon>
        组件覆盖
      </m3e-chip>
      <m3e-badge size="small">Beta</m3e-badge>
    </div>
    <ul>
      <li>基于配置的导航与目录</li>
      <li>设置持久化到当前浏览器</li>
      <li>客户端注册，兼容 SSR 构建</li>
    </ul>
  </div>
  <div slot="actions">
    <m3e-button variant="tonal" href="/zh-CN/theme/extending.html">
      查看扩展方式
      <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
    </m3e-button>
  </div>
</m3e-card>

```html
<m3e-card variant="elevated">
  <m3e-heading slot="header" variant="headline" size="small">主题能力</m3e-heading>
  <div slot="content">
    <div class="demo-row">
      <m3e-chip>
        <m3e-icon slot="icon" name="palette"></m3e-icon>
        动态色
      </m3e-chip>
      <m3e-chip>
        <m3e-icon slot="icon" name="layers"></m3e-icon>
        组件覆盖
      </m3e-chip>
      <m3e-badge size="small">Beta</m3e-badge>
    </div>
    <ul>
      <li>基于配置的导航与目录</li>
      <li>设置持久化到当前浏览器</li>
      <li>客户端注册，兼容 SSR 构建</li>
    </ul>
  </div>
  <div slot="actions">
    <m3e-button variant="tonal" href="/zh-CN/theme/extending.html">
      查看扩展方式
      <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
    </m3e-button>
  </div>
</m3e-card>
```

内容较多时，卡片高度由内容决定。同一网格中的卡片不会自动等高，因此文案长度要统一。

## 可点击卡片

给卡片添加 `actionable` 后，整块表面成为单一交互区域。配合 `href` 后，卡片可直接作为链接：

<div class="demo-grid">
  <m3e-card variant="outlined" actionable href="/zh-CN/getting-started/installation.html">
    <m3e-icon slot="header" name="package_2"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">安装</m3e-heading>
    <div slot="content">准备 Node 环境与依赖，生成第一份构建。</div>
  </m3e-card>
  <m3e-card variant="outlined" actionable href="/zh-CN/getting-started/configuration.html">
    <m3e-icon slot="header" name="tune"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">配置</m3e-heading>
    <div slot="content">调整顶栏、导航、设置区块与目录深度。</div>
  </m3e-card>
  <m3e-card variant="outlined" actionable href="/zh-CN/theme/extending.html">
    <m3e-icon slot="header" name="integration_instructions"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">扩展</m3e-heading>
    <div slot="content">通过组件覆盖与 CSS 令牌定制界面。</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined" actionable href="/zh-CN/getting-started/installation.html">
  <m3e-icon slot="header" name="package_2"></m3e-icon>
  <m3e-heading slot="header" variant="title" size="large">安装</m3e-heading>
  <div slot="content">准备 Node 环境与依赖，生成第一份构建。</div>
</m3e-card>
```

可点击卡片会在悬停、聚焦与按下时显示状态层。整卡点击区域内的其它交互元素应移除，避免嵌套按钮造成双重行为。需要多个操作时，改用普通卡片加 `actions` 插槽。

## 对话框操作

卡片的操作可以打开对话框。`m3e-dialog-trigger` 放在按钮内部，`m3e-dialog-action` 负责关闭并返回结果：

<m3e-card variant="outlined">
  <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">版本信息</m3e-heading>
  <div slot="content">当前文档对应 VitePress 2.0.0-alpha.21 与 @m3e/web 2.10.3。</div>
  <div slot="actions" end>
    <m3e-button variant="filled">
      <m3e-dialog-trigger for="card-demo-dialog">查看详情</m3e-dialog-trigger>
    </m3e-button>
  </div>
</m3e-card>

<m3e-dialog id="card-demo-dialog" dismissible>
  <span slot="header">Vitepress Theme Akari Docs</span>
  <p>主题使用 VitePress 负责静态生成与路由，m3e 负责界面组件与动态色。</p>
  <p>设置保存在浏览器本地，不会写入站点配置。</p>
  <div slot="actions" end>
    <m3e-button>
      <m3e-dialog-action return-value="close">关闭</m3e-dialog-action>
    </m3e-button>
  </div>
</m3e-dialog>

```html
<m3e-button variant="filled">
  <m3e-dialog-trigger for="card-demo-dialog">查看详情</m3e-dialog-trigger>
</m3e-button>
<m3e-dialog id="card-demo-dialog" dismissible>
  <span slot="header">Vitepress Theme Akari Docs</span>
  <p>主题使用 VitePress 负责静态生成与路由，m3e 负责界面组件与动态色。</p>
  <div slot="actions" end>
    <m3e-button>
      <m3e-dialog-action return-value="close">关闭</m3e-dialog-action>
    </m3e-button>
  </div>
</m3e-dialog>
```

对话框通过 `dismissible` 提供关闭按钮，点击遮罩或按 `Escape` 也可关闭。若需要阻塞式流程，再加 `disable-close` 与明确的确认操作。

## 网格布局

卡片网格使用 `.demo-grid`，该网格在窄屏自动变为单列。每张卡片保持一个主题与一个主操作，避免把整页内容塞进单个卡片。

<div class="demo-grid">
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">入门</m3e-heading>
    <div slot="content">从安装到首次构建，约十分钟。</div>
  </m3e-card>
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">主题</m3e-heading>
    <div slot="content">理解应用壳、侧边栏与设置模态框。</div>
  </m3e-card>
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">样式</m3e-heading>
    <div slot="content">掌握色彩令牌与排版层级。</div>
  </m3e-card>
</div>

## 使用建议

- 卡片标题保持简短，正文不超过三行。内容较长时改用独立页面。
- 同一网格只使用一种变体，避免视觉噪声。
- 整卡可点击时不要再嵌套按钮。需要多个操作时使用 `actions`。
- 图片放在默认插槽或 `header` 插槽，并设置替代文本。
- 卡片圆角、颜色与内边距通过 `--m3e-card-*` 变量调整。详见[扩展主题](/zh-CN/theme/extending)。

全部属性、插槽与事件见[接口](/zh-CN/components/card/api)。
