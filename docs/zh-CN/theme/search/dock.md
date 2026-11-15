---
tab: 浮动
---
<script setup>
import SearchDockDemo from "../../../.vitepress/theme/components/content/SearchDockDemo.vue";
</script>


# 浮动搜索示例

这是 [`<SearchDock>`](/zh-CN/theme/search/api#searchdock) 的在线示例。这个标签就放在下方虚线画出的落点框里。搜索框会离开顶栏，落到这个框上。

<SearchDockDemo />

可以这样试：

- 重新载入本页：搜索框已经落在框里，没有飞入动画。
- 离开本页（例如点“概览”）再回来，搜索框从顶栏飞到框里。
- 改变**外观**或**对齐**时，搜索框在原处改变形状与对齐方式。
- 打开 **Fill box**：标签会占满外层盒子（`width: 100%; height: 100%`），搜索框随外围布局的尺寸变化。关闭后回到外观的固有尺寸。

停靠时搜索框仍然可用。点击它或按 `⌘K`（Windows / Linux 上为 `Ctrl K`），搜索面板从它所在的位置展开。
