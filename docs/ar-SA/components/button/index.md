---
icon: radio_button_checked
order: 1
tab: نظرة عامة
parallel:
  - api
---

# الأزرار

يؤدي `m3e-button` إجراءً. و`m3e-icon-button` زر مدمج لا يحتوي إلا على أيقونة. ويدعم كلاهما التنويعات والأحجام والأشكال وحالات التعطيل والروابط والتحديد.

## التنويعات

تعبّر التنويعات الخمسة عن درجات مختلفة من الإبراز:

<div class="demo-row">
  <m3e-button variant="elevated">Elevated</m3e-button>
  <m3e-button variant="filled">Filled</m3e-button>
  <m3e-button variant="tonal">Tonal</m3e-button>
  <m3e-button variant="outlined">Outlined</m3e-button>
  <m3e-button variant="text">Text</m3e-button>
</div>

```html
<m3e-button variant="elevated">Elevated</m3e-button>
<m3e-button variant="filled">Filled</m3e-button>
<m3e-button variant="tonal">Tonal</m3e-button>
<m3e-button variant="outlined">Outlined</m3e-button>
<m3e-button variant="text">Text</m3e-button>
```

- `filled`: أهم إجراء في الصفحة. وعادةً لا يظهر منه إلا واحد في كل منطقة.
- `tonal`: إجراء ثانوي، أهدأ من `filled`.
- `outlined`: إجراء يحتاج إلى حدود واضحة دون إبراز عالٍ.
- `text`: إجراء منخفض الإبراز في شريط أدوات أو في تذييل بطاقة.
- `elevated`: إجراء رئيسي يحتاج إلى أن يبدو مرتفعًا. ويتناسب جيدًا مع البطاقات أو الأسطح.

## الحجم والشكل

تتراوح الأحجام من `extra-small` إلى `extra-large`. والقيمة الافتراضية `small`:

<div class="demo-row">
  <m3e-button variant="tonal" size="extra-small">Extra Small</m3e-button>
  <m3e-button variant="tonal" size="small">Small</m3e-button>
  <m3e-button variant="tonal" size="medium">Medium</m3e-button>
  <m3e-button variant="tonal" size="large">Large</m3e-button>
  <m3e-button variant="tonal" size="extra-large">Extra Large</m3e-button>
</div>

```html
<m3e-button variant="tonal" size="extra-small">Extra Small</m3e-button>
<m3e-button variant="tonal" size="small">Small</m3e-button>
<m3e-button variant="tonal" size="medium">Medium</m3e-button>
<m3e-button variant="tonal" size="large">Large</m3e-button>
<m3e-button variant="tonal" size="extra-large">Extra Large</m3e-button>
```

الشكل الافتراضي `rounded`. اضبط `shape="square"` لجعله مربعًا:

<div class="demo-row">
  <m3e-button variant="filled" shape="square">Square Filled</m3e-button>
  <m3e-button variant="outlined" shape="square">Square Outlined</m3e-button>
  <m3e-button variant="text" shape="square">Square Text</m3e-button>
</div>

```html
<m3e-button variant="filled" shape="square">Square Filled</m3e-button>
<m3e-button variant="outlined" shape="square">Square Outlined</m3e-button>
<m3e-button variant="text" shape="square">Square Text</m3e-button>
```

مهما كان حجمه المرئي، يحتفظ الزر بمنطقة لمس لا تقل عن 48×48dp.

## الأيقونات

يقع المنفذ `icon` قبل النص، ويقع المنفذ `trailing-icon` بعده:

<div class="demo-row">
  <m3e-button variant="filled">
    <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
    ابدأ البناء
  </m3e-button>
  <m3e-button variant="tonal">
    نسخ التهيئة
    <m3e-icon slot="trailing-icon" name="content_copy"></m3e-icon>
  </m3e-button>
  <m3e-button variant="outlined">
    التالي
    <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
  </m3e-button>
</div>

```html
<m3e-button variant="filled">
  <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
  ابدأ البناء
</m3e-button>
<m3e-button variant="tonal">
  نسخ التهيئة
  <m3e-icon slot="trailing-icon" name="content_copy"></m3e-icon>
</m3e-button>
<m3e-button variant="outlined">
  التالي
  <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
</m3e-button>
```

الأيقونات مخفية عن التقنيات المساعدة افتراضيًا، ويأتي اسم الزر لدى التقنيات المساعدة من نصه المرئي. والزر الذي لا يحتوي إلا على أيقونة يجب أن يكون له `aria-label`.

## أزرار الأيقونات

تأتي أزرار الأيقونات بخمسة تنويعات: `standard` و`filled` و`tonal` و`outlined` و`elevated`. ليس لها نص، لذا استخدم تلميحًا (tooltip) لبيان وظيفتها:

<div class="demo-row">
  <m3e-icon-button id="button-demo-back" aria-label="رجوع">
    <m3e-icon name="arrow_back"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-back">رجوع</m3e-tooltip>

  <m3e-icon-button id="button-demo-settings" aria-label="الإعدادات" variant="tonal">
    <m3e-icon name="settings"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-settings">الإعدادات</m3e-tooltip>

  <m3e-icon-button id="button-demo-close" aria-label="إغلاق" variant="outlined">
    <m3e-icon name="close"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-close">إغلاق</m3e-tooltip>

  <m3e-icon-button id="button-demo-confirm" aria-label="تأكيد" variant="filled">
    <m3e-icon name="check"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-confirm">تأكيد</m3e-tooltip>
</div>

```html
<m3e-icon-button id="button-demo-settings" aria-label="الإعدادات" variant="tonal">
  <m3e-icon name="settings"></m3e-icon>
</m3e-icon-button>
<m3e-tooltip for="button-demo-settings">الإعدادات</m3e-tooltip>
```

تشير الخاصية `for` في كل تلميح إلى `id` فريد. وتكرار `id` في الصفحة الواحدة يجعل التلميح يظهر في المكان الخطأ أو لا يعمل إلا مع العنصر الأول.

## الأزرار المعطّلة وأزرار الروابط

افتراضيًا، لا يمكن للزر المعطّل أن يتلقى تركيز لوحة المفاتيح. أما `disabled-interactive` فيبقيه قابلًا للتركيز، ليظل المستخدمون قادرين على اكتشاف الإجراء:

<div class="demo-row">
  <m3e-button variant="filled" disabled>معطّل</m3e-button>
  <m3e-button variant="filled" disabled-interactive>معطّل لكنه قابل للتركيز</m3e-button>
  <m3e-button variant="tonal" href="https://m3.material.io/" target="_blank" rel="noreferrer">
    فتح Material 3
    <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
  </m3e-button>
  <m3e-button variant="outlined" href="/ar-SA/components/card.html">
    عرض البطاقات
    <m3e-icon slot="trailing-icon" name="chevron_right"></m3e-icon>
  </m3e-button>
</div>

```html
<m3e-button variant="filled" disabled>معطّل</m3e-button>
<m3e-button variant="filled" disabled-interactive>معطّل لكنه قابل للتركيز</m3e-button>
<m3e-button
  variant="tonal"
  href="https://m3.material.io/"
  target="_blank"
  rel="noreferrer"
>
  فتح Material 3
  <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
</m3e-button>
<m3e-button variant="outlined" href="/ar-SA/components/card.html">
  عرض البطاقات
  <m3e-icon slot="trailing-icon" name="chevron_right"></m3e-icon>
</m3e-button>
```

عند ضبط `href`، يُعرض الزر بدلالة الرابط ويدعم `target` و`rel` و`download`. تتولّى السمة روابط الموقع الداخلية، فينتقل الرابط الداخلي في مكانه دون إعادة تحميل الصفحة كاملة؛ ومع `target="_self"` تُحمَّل الصفحة كاملة، ومع `target="_blank"` يُفتح الرابط في علامة تبويب جديدة. وعندما تحتاج إلى التنقل من برنامج نصي، استدعِ `useRouter().go()`. راجع [التنقل](/ar-SA/components/navigation).

## حالة التحديد

يحوّل `toggle` الزر إلى مفتاح تبديل بحالتين، ويضبط `selected` حالته الأولية:

<div class="demo-row">
  <m3e-button variant="filled" toggle selected>
    <m3e-icon slot="icon" name="check"></m3e-icon>
    محدد
  </m3e-button>
  <m3e-button variant="tonal" toggle>تبديل</m3e-button>
  <m3e-button variant="outlined" toggle>
    <m3e-icon slot="icon" name="close"></m3e-icon>
    <m3e-icon slot="selected-icon" name="check"></m3e-icon>
    متابعة
    <span slot="selected">تتم المتابعة</span>
  </m3e-button>
</div>

```html
<m3e-button variant="filled" toggle selected>
  <m3e-icon slot="icon" name="check"></m3e-icon>
  محدد
</m3e-button>
<m3e-button variant="tonal" toggle>تبديل</m3e-button>
<m3e-button variant="outlined" toggle>
  <m3e-icon slot="icon" name="close"></m3e-icon>
  <m3e-icon slot="selected-icon" name="check"></m3e-icon>
  متابعة
  <span slot="selected">تتم المتابعة</span>
</m3e-button>
```

عندما يكون الزر محددًا، يتحول `m3e-icon` تلقائيًا إلى الرمز المعبّأ. ويمكنك أيضًا استبدال الأيقونة والنص بالمنفذين `selected-icon` و`selected`. يطلق التبديل الأحداث `beforeinput` و`input` و`change`، ويمكنك إلغاؤه في `beforeinput`.

## نصائح لإمكانية الوصول

- الزر الذي لا يحتوي إلا على أيقونة يجب أن يضبط `aria-label` وأن يرافقه `m3e-tooltip`.
- اجعل قيم `id` لأهداف التلميحات فريدة في الصفحة.
- إذا كان المستخدمون بحاجة إلى معرفة وجود إجراء معطّل، فاستخدم `disabled-interactive` واشرح سبب عدم توفره.
- استخدم `href` لأزرار الروابط. لا تربط منطق التوجيه بزر عادي فتفقد دلالة الرابط.
- استخدم `filled` للإجراء الرئيسي، وتجنب وجود عدة أزرار عالية الإبراز في المنطقة المرئية نفسها.

لجميع الخصائص والمنافذ والأحداث، راجع [API](/ar-SA/components/button/api).
