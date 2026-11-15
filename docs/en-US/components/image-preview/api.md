---
tab: API
---

# Image preview: API

`AkariImagePreview` belongs to the theme rather than to `@m3e/web`, so it has no `m3e-` element behind it. It reads the `--md-sys-color-*` and `--md-sys-motion-*` tokens, which is why it follows the color and motion settings.

## AkariImagePreview

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | `string` | required | Picture shown enlarged; also the default thumbnail's source |
| `alt` | `string` | `""` | Description, also the dialog's `aria-label` |
| `label` | `string` | the locale's `imagePreviewOpen` | The trigger button's `aria-label` and `title` |

| Slot | Content |
| --- | --- |
| default | The thumbnail. The component wraps it in a `<button>` and adds the zoom icon that appears on hover |

| Output | Description |
| --- | --- |
| No events | The component owns both the open state and the view state |

| Class | Where |
| --- | --- |
| `.akari-image-preview` | The root, laid out inline |
| `.akari-image-preview__trigger` | The button around the thumbnail |
| `.akari-image-preview__thumb` | The default thumbnail |
| `.akari-image-preview__overlay` | The overlay, teleported to `.akari-frame` |

## Exports

The component and its geometry are exported from the theme entry:

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

| Name | Description |
| --- | --- |
| `IMAGE_PREVIEW_FIT` | The scale a preview opens at, `1` |
| `IMAGE_PREVIEW_MIN_SCALE`, `IMAGE_PREVIEW_MAX_SCALE` | Zoom limits, `0.5` and `4` |
| `IMAGE_PREVIEW_ZOOM_STEP` | How far one click zooms, `0.25` |
| `IMAGE_PREVIEW_WHEEL_FACTOR` | How much one wheel notch scales, `1.1` |
| `IMAGE_PREVIEW_ROTATION_STEP` | Degrees each rotate button turns, `90` |
| `clampImageScale(scale)` | Limits the scale and rounds it to whole percents |
| `zoomImageScale(scale, delta)` | Adds a step and clamps |
| `wheelImageScale(scale, direction)` | Applies a wheel notch and clamps |
| `rotateImage(rotation, delta)` | Turns by the given angle |
| `uprightRotation(rotation)` | The nearest whole turn, used when resetting |
| `unwindRotation(rotation)` | The nearest whole turn to return to on close, reversing on a half turn |
| `isImageTransformed(view)` | Whether the view was zoomed, turned or panned |
| `previewChrome(viewportWidth)` | Height the overlay leaves for its bar |
| `rotationFitScale(rotation, image, viewport, chrome)` | The factor that keeps a quarter-turned picture inside the viewport |
| `scaleLabel(scale)` | Reads `1.05` as `105%` |
| `ImagePreviewView`, `ImagePreviewSize` | Types for a view and a size |

## Accessibility

- The trigger has a name and the thumbnail has its `alt`; an empty `alt` uses the label without a description.
- The overlay is `role="dialog"` with `aria-modal="true"`, takes focus when it opens, closes on `Esc`, and returns focus to the trigger.
- Page scrolling is locked while open; reduced motion turns the flying transition off.
