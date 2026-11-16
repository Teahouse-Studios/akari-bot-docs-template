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
- 打开**沉浸式**：直接点击搜索框输入，结果会在旁边的紧凑列表中显示（空间允许时在上方或下方），不会打开搜索对话框。

停靠时搜索框仍然可用。关闭沉浸式时，点击它或按 `⌘K`（Windows / Linux 上为 `Ctrl K`）会从它所在的位置展开搜索面板；打开沉浸式后，直接点击并输入即可，快捷键仍会打开完整对话框。