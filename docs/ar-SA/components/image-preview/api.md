---
tab: API
---

# معاينة الصور: API

`AkariImagePreview` مكوّن من السمة لا من `@m3e/web`، ولا يقابله عنصر `m3e-`. يقرأ رموز `--md-sys-color-*` و`--md-sys-motion-*`، ولذلك يتبع إعدادات اللون والحركة.

## AkariImagePreview

| الخاصية | النوع | الافتراضي | الوصف |
| --- | --- | --- | --- |
| `src` | `string` | مطلوب | الصورة المعروضة مكبَّرة، وهي مصدر المصغّرة الافتراضية أيضًا |
| `alt` | `string` | `""` | وصف الصورة، ويُستخدم `aria-label` لمربّع المعاينة |
| `label` | `string` | `imagePreviewOpen` في اللغة الحالية | `aria-label` و`title` لزر الفتح |
| `open` | `boolean \| null` | `null` | حالة الفتح المُتحكَّم بها. عند تمريرها لا يُرسم زر الفتح، ويتولى `v-model:open` الحالة |
| `origin` | `HTMLElement \| null` | `null` | العنصر الذي تنطلق منه المعاينة وتعود إليه عند الفتح المُتحكَّم به |

| الفتحة | المحتوى |
| --- | --- |
| الافتراضية | المصغّرة. يلفّها المكوّن في `<button>` ويضيف أيقونة التكبير التي تظهر عند المرور |

| المخرجات | الوصف |
| --- | --- |
| `update:open` | يُطلق عند فتح المعاينة أو إغلاقها، ويُستخدم مع `v-model:open` |

| صنف CSS | الموضع |
| --- | --- |
| `.akari-image-preview` | الجذر، يُعرض في السطر |
| `.akari-image-preview__trigger` | الزر المحيط بالمصغّرة |
| `.akari-image-preview__thumb` | المصغّرة الافتراضية |
| `.akari-image-preview__overlay` | طبقة المعاينة، تُنقل إلى `.akari-frame` |

## التصدير

يُصدَّر المكوّن وحساب الهندسة من مدخل السمة:

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

| الاسم | الوصف |
| --- | --- |
| `IMAGE_PREVIEW_FIT` | مقياس فتح المعاينة، `1` |
| `IMAGE_PREVIEW_MIN_SCALE`، `IMAGE_PREVIEW_MAX_SCALE` | حدّا التكبير، `0.5` و`4` |
| `IMAGE_PREVIEW_ZOOM_STEP` | مقدار التكبير لكل ضغطة، `0.25` |
| `IMAGE_PREVIEW_WHEEL_FACTOR` | معامل نقرة واحدة بالعجلة، `1.1` |
| `IMAGE_PREVIEW_ROTATION_STEP` | زاوية كل ضغطة على زر التدوير، `90` |
| `clampImageScale(scale)` | يحصر القيمة داخل الحدّين ويقرّبها إلى نسبة مئوية صحيحة |
| `zoomImageScale(scale, delta)` | يضيف درجة ثم يحصر |
| `wheelImageScale(scale, direction)` | يطبّق نقرة العجلة ثم يحصر |
| `rotateImage(rotation, delta)` | يدير بالزاوية المعطاة |
| `uprightRotation(rotation)` | أقرب زاوية دورة كاملة، تُستخدم عند إعادة العرض |
| `unwindRotation(rotation)` | أقرب زاوية دورة كاملة للعودة عند الإغلاق، بعكس الاتجاه عند نصف دورة |
| `isImageTransformed(view)` | هل كُبّر العرض أو دُوّر أو حُرّك |
| `previewChrome(viewportWidth)` | الارتفاع الذي تتركه الطبقة لشريطها |
| `rotationFitScale(rotation, image, viewport, chrome)` | النسبة التي تُبقي الصورة المدوّرة ربع دورة داخل النافذة |
| `scaleLabel(scale)` | يقرأ `1.05` على أنه `105%` |
| `ImagePreviewView`، `ImagePreviewSize` | نوعا العرض والحجم |

## إمكانية الوصول

- لزر الفتح اسم، وللمصغّرة `alt`؛ وإذا كان `alt` فارغًا استُخدمت تسمية بلا وصف.
- الطبقة تحمل `role="dialog"` و`aria-modal="true"`، وتتلقّى التركيز عند الفتح، وتُغلق بـ `Esc`، ويعود التركيز إلى زر الفتح.
- يُقفل تمرير الصفحة أثناء الفتح، وتُلغى حركة الانتقال عند تفعيل «تقليل الحركة».
