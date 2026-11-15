---
icon: view_quilt
order: 1
tab: 概览
parallel:
  - api
  - details
---

# 布局与顶栏

布局与 [m3.material.io](https://m3.material.io) 一致：顶栏与左侧导航吸附在窗口中。正文、右侧目录与翻页卡片放在一块圆角的文档表面上，页尾是文档表面下方的另一块表面。

整个页面随浏览器窗口滚动。查找、前进后退与锚点跳转都按浏览器原生的方式工作。

## 顶栏

- **左侧**：站点 logo、名称与版本号。文章标题滚到顶栏下方后，名称换成当前页面的标题。窄屏时最左侧多一个菜单按钮，用来打开导航抽屉。
- **右侧**：搜索框、社交链接与设置按钮。空间不够时，搜索框收成圆形按钮，社交链接与设置收进三个点的“更多”菜单。

<div class="demo-surface">
  <m3e-app-bar>
    <span slot="title">Vitepress Theme Akari Docs</span>
    <m3e-chip slot="trailing">v1.0.0</m3e-chip>
    <m3e-icon-button id="layout-demo-settings" slot="trailing" aria-label="设置">
      <m3e-icon name="settings"></m3e-icon>
    </m3e-icon-button>
    <m3e-tooltip for="layout-demo-settings">打开设置</m3e-tooltip>
  </m3e-app-bar>
</div>

顶栏的内容写在配置的 `appBar` 中：

```ts
appBar: {
  title: "Vitepress Theme Akari Docs",
  version: "v1.0.0",
  socialLinks: [
    { icon: "github", link: "https://github.com/OasisAkari/vitepress-theme-akari-docs", label: "GitHub" },
  ],
},
```

## 文档表面与目录

- 段落与列表的行宽约 760px，标题、表格与代码块占满表面的宽度。
- 右侧目录列出二、三级标题，跟随阅读位置高亮当前章节。点击目录项后平滑滚动到对应位置。
- 窗口窄于 960px 时目录隐藏，需要用右下角的目录按钮打开。
- 在页面头部信息中写 `toc: false`，这一页就没有目录。

页面属于一组平行页面时，表面顶部有一条标签栏，见[侧边导航](/zh-CN/theme/sidebar#平行页面)。页面带头图时，标题与图片显示在表面顶部，见[头图](/zh-CN/theme/hero)。

## 悬浮按钮

- **回到顶部**：页面滚动后出现在右下角。点击后平滑回到顶部，途中展开为“返回顶部”。再次点击或自己滚动可以打断动画。
- **目录**：窗口窄于 960px 时出现在回到顶部按钮上方。点击后展开为当前页的目录面板，点面板外部收起。

## 页尾

翻页卡片之后是一条波浪分隔线，再往下是页尾。页尾左侧是 logo、站点名称与 `footer.message`，右侧是链接分栏，底部是 `footer.copyright`。链接分栏默认取导航的前四个分类。

## 加载进度条

页面还在加载时，窗口顶部出现一条主色的细进度条。打开站点时，进度条等待脚本、图片与字体。站内跳转时，进度条等待下一页的脚本、图片与字体。

加载很快时不出现。进度条可以在配置中关闭，见[接口](/zh-CN/theme/layout/api#loadingbar)。

## 窗口尺寸

| 窗口宽度 | 导航 | 目录 |
| --- | --- | --- |
| 1600px 及以上 | rail 与导航抽屉同时常驻 | 右侧 |
| 960–1599px | rail。指针停在分类上时滑出导航抽屉 | 右侧 |
| 960px 以下 | 顶栏菜单按钮打开导航抽屉 | 右下角按钮 |
| 600px 以下 | 同上。文档表面贴到窗口边缘 | 右下角按钮 |

各项配置、CSS 变量与页面状态见[接口](/zh-CN/theme/layout/api)。滚动、标题替换、按钮收起等行为的细节见[技术细节](/zh-CN/theme/layout/details)。
