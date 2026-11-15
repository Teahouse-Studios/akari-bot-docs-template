---
icon: text_fields
order: 3
tab: 概览
parallel:
  - api
---

# 排版

西文用 Roboto，中文用思源黑体（Noto Sans SC）。日文、韩文与阿拉伯文页面分别用 Noto Sans JP、Noto Sans KR 与 Noto Sans Arabic。这些字体都是可变字重，可以在配置中换成其他字体，也可以不使用 Google Fonts。

正文基准字号 16px，行高 1.65。标题、正文、代码与表格都以 `rem` 计算。在设置中调整字号时，整个阅读区域等比缩放。

## 标题层级

每个页面只有一个一级标题，作为页面标题。章节用二级标题，子节用三级标题，更细的说明用四级标题。

| 层级 | 用途 | 样式 |
| --- | --- | --- |
| 一级 | 页面标题 | display-large，57px，字重 400 |
| 二级 | 章节，进入目录 | headline-medium，28px，字重 500 |
| 三级 | 子节，进入目录 | headline-small，24px，字重 500 |
| 四级 | 细节说明 | 20px，字重 500 |

标题层级要连续，不要跳级，也不要用加粗的段落代替标题。

### 三级标题示例

三级标题把一个章节拆成可以扫读的几部分，每部分只讲一件事。

#### 四级标题示例

四级标题适合补充边界条件、版本差异或参数细节。

## 正文

- 段落保持三到五行，长段落拆成列表或小标题。
- 行内代码用于命令、字段名与标签名，例如 `npm run build`、`appBar.title` 与 `m3e-card`。
- 链接文字要说明去向，例如[安装与运行环境](/zh-CN/getting-started/installation)，不要写“点击这里”。
- 强调只用少量加粗，不要整段加粗。

> 引用块用于来自规格或官方的结论。正文中的引用块与提示块都带一层很淡的图案，与代码块相同。

<small>辅助文字使用较小的字号与 `on-surface-variant` 颜色。</small>

## 组件中的标题

`m3e-heading` 提供 display、headline、title、label 四种外观，可以与文档标题混用。下面的标题都标记了 `m3e-toc-ignore`，不进入目录：

<div class="demo-stack">
  <m3e-heading m3e-toc-ignore variant="display" size="large" level="2">Display Large</m3e-heading>
  <m3e-heading m3e-toc-ignore variant="headline" size="medium" level="3">Headline Medium</m3e-heading>
  <m3e-heading m3e-toc-ignore variant="title" size="large" level="4">Title Large</m3e-heading>
  <m3e-heading m3e-toc-ignore variant="label" size="large" level="5">Label Large</m3e-heading>
</div>

`level` 决定辅助技术读到的标题层级，`variant` 与 `size` 只影响外观。

## 字号

设置中的字号有三档，对应根元素的字号：

| 选项 | 根字号 | 适合 |
| --- | --- | --- |
| 100% | `16px` | 默认的阅读尺寸 |
| 150% | `24px` | 视力较弱或远距离阅读 |
| 200% | `32px` | 演示与无障碍检查 |

字体、正文元素的样式与排版令牌见[接口](/zh-CN/styles/typography/api)。
