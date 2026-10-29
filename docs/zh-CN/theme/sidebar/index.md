---
icon: view_sidebar
order: 3
tab: 概览
parallel:
  - api
  - details
---

# 侧边导航

桌面端左侧是 96px 宽的 rail，列出各个分类；导航抽屉列出当前分类中的页面。窗口窄于 960px 时，顶栏的菜单按钮打开一个包含全部页面的导航抽屉。

## rail 与导航抽屉

- **rail**：每个分类一个图标，当前页面所在的分类显示为选中，图标变为填充样式。点击分类进入它的第一个页面。rail 底部是明暗模式按钮，站点有多种语言时还有语言按钮。
- **导航抽屉**：窗口宽度在 1600px 以上时常驻在 rail 右侧；960–1599px 时，指针停在分类上会从 rail 下方滑出，移开后收回。触屏上点击分类打开或关闭它。
- **窄屏**：rail 与抽屉隐藏，菜单按钮打开全量导航抽屉，一级菜单与 rail 的分类对应；明暗模式与语言按钮在抽屉底部。

<div class="demo-surface" style="max-width: 320px;">
  <m3e-nav-menu aria-label="侧边导航演示">
    <m3e-nav-menu-item open>
      <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
      <span slot="label">开始</span>
      <m3e-nav-menu-item selected>
        <a slot="label" href="/zh-CN/">概览</a>
      </m3e-nav-menu-item>
      <m3e-nav-menu-item>
        <a slot="label" href="/zh-CN/getting-started/installation.html">安装</a>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
    <m3e-nav-menu-item>
      <m3e-icon slot="icon" name="palette"></m3e-icon>
      <span slot="label">主题</span>
      <m3e-nav-menu-item>
        <a slot="label" href="/zh-CN/theme/extending.html">扩展主题</a>
        <span slot="badge">扩展</span>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
  </m3e-nav-menu>
</div>

## 导航从哪里来

导航由语言文件夹的目录生成：分类目录是 rail 中的分类，分类中的文章文件夹是页面，名称、图标与顺序写在文章的头部信息中。写法见[撰写页面](/zh-CN/getting-started/writing)。

分类的名称与图标写在配置的 `sidebar.categories` 中：

```ts
// docs/config.ts
sidebar: {
  categories: {
    "getting-started": { icon: "rocket_launch" },
    theme: { icon: "palette" },
  },
},

// docs/zh-CN/config.ts
sidebar: {
  categories: {
    "getting-started": { text: "开始" },
    theme: { text: "主题" },
  },
},
```

也可以在配置中用 `sidebar.items` 手写整份导航，见[接口](/zh-CN/theme/sidebar/api#手写导航)。

## 平行页面

一篇文章可以分成几页，像 [m3.material.io](https://m3.material.io/styles/icons) 的 Icons 分为 Overview、Guidelines 与 Specs。它们在侧栏中只占一项，页面顶部有一条标签栏在它们之间切换。

- 向下滚动时，标签栏缩小并飞进顶栏标题右侧的空白处；滚回时回到页面中。
- 顶栏放不下时，标签栏改为固定在顶栏下方，带一层轻微的阴影。
- 在组内切换页面时，内容左右滑动；标签栏收在顶栏时保持不动，新页面直接从正文开始。
- 正文末尾的上一页、下一页只在组内翻页：组内第一页没有上一页，最后一页没有下一页。

本站的[图标](/zh-CN/styles/icons)与每篇主题文档都是这样组织的。写法见[撰写页面](/zh-CN/getting-started/writing#平行页面)。

各项字段见[接口](/zh-CN/theme/sidebar/api)；抽屉的展开时机、标签栏的飞行动画等见[技术细节](/zh-CN/theme/sidebar/details)。
