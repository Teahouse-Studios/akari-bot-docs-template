---
tab: 接口
---

# 图片预览：接口

`AkariImagePreview` 是主题自己的组件，不是 `m3e-` 元素。它读取 `--md-sys-color-*` 与 `--md-sys-motion-*` 令牌，因此跟随设置里的配色与动效。

## AkariImagePreview

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | 必填 | 打开后显示的图片地址。不写默认插槽时也用于缩略图 |
| `alt` | `string` | `""` | 图片描述，同时作为预览对话框的 `aria-label` |
| `label` | `string` | 当前语言的 `imagePreviewOpen` | 触发按钮的 `aria-label` 与 `title` |

| 插槽 | 内容 |
| --- | --- |
| 默认 | 缩略图。组件把它包在一个 `<button>` 里，并附上悬停时出现的放大图标 |

| 输出 | 说明 |
| --- | --- |
| 无事件 | 预览的开关与视图状态都由组件自己持有 |

| CSS 类 | 位置 |
| --- | --- |
| `.akari-image-preview` | 根元素，行内排版 |
| `.akari-image-preview__trigger` | 缩略图外层的按钮 |
| `.akari-image-preview__thumb` | 默认缩略图 |
| `.akari-image-preview__overlay` | 预览层，传送到 `.akari-frame` |

## 导出

组件与几何逻辑都从主题入口导出：

```ts
import {
  AkariImagePreview,
  clampImageScale,
  zoomImageScale,
  wheelImageScale,
  rotateImage,
  uprightRotation,
  unwindRotation,
  isImageTransformed,
  previewChrome,
  rotationFitScale,
  scaleLabel,
} from "vitepress-akari-theme-docs";
```

| 名称 | 说明 |
| --- | --- |
| `IMAGE_PREVIEW_FIT` | 打开预览时的初始缩放，`1` |
| `IMAGE_PREVIEW_MIN_SCALE`、`IMAGE_PREVIEW_MAX_SCALE` | 缩放上下限，`0.5` 与 `4` |
| `IMAGE_PREVIEW_ZOOM_STEP` | 按钮一次缩放的距离，`0.25` |
| `IMAGE_PREVIEW_WHEEL_FACTOR` | 滚轮一格的倍率，`1.1` |
| `IMAGE_PREVIEW_ROTATION_STEP` | 旋转按钮每次转过的角度，`90` |
| `clampImageScale(scale)` | 夹到区间内并按整数百分比取整 |
| `zoomImageScale(scale, delta)` | 加减一级并夹紧 |
| `wheelImageScale(scale, direction)` | 按滚轮方向乘倍率并夹紧 |
| `rotateImage(rotation, delta)` | 旋转指定角度 |
| `uprightRotation(rotation)` | 最近的整圈角度，还原视图时使用 |
| `unwindRotation(rotation)` | 关闭时回到最近的整圈角度，半圈时反向 |
| `isImageTransformed(view)` | 视图是否被缩放、旋转或平移过 |
| `previewChrome(viewportWidth)` | 预览层留给工具条的高度 |
| `rotationFitScale(rotation, image, viewport, chrome)` | 横竖互换后仍需缩进视口的比例 |
| `scaleLabel(scale)` | `1.05` 读作 `105%` |
| `ImagePreviewView`、`ImagePreviewSize` | 视图和尺寸的类型定义 |

## 无障碍

- 触发按钮有名称，缩略图有 `alt`。`alt` 为空时预览对话框使用不带描述的标题。
- 预览层是 `role="dialog"`、`aria-modal="true"`，打开时获得焦点，`Esc` 关闭，关闭后焦点回到触发按钮。
- 打开期间锁定页面滚动。系统开启“减少动态效果”时不播放位移动画。
