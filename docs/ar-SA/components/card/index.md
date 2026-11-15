---
icon: dashboard
order: 2
tab: نظرة عامة
parallel:
  - api
---

# البطاقات

يضع `m3e-card` ترويسة ومتنًا وإجراءات وتذييلًا على سطح واحد مستقل. استخدمه لمداخل الميزات وملخصات التوثيق والإعدادات والوسائط.

## التنويعات

تناسب التنويعات الثلاثة مستويات مختلفة:

<div class="demo-grid">
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Filled</m3e-heading>
    <div slot="content">التنويع الافتراضي. يأتي لون حاويته من <code>surface-container-highest</code>، دون حدود ولا ظل.</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Outlined</m3e-heading>
    <div slot="content">له حدّ خارجي بسماكة 1px. يناسب القوائم الكثيفة وكتل المحتوى التي تحتاج إلى حدود واضحة.</div>
  </m3e-card>
  <m3e-card variant="elevated">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Elevated</m3e-heading>
    <div slot="content">له ظل ولون سطح. يناسب المحتوى الأساسي الذي يطفو فوق الخلفية.</div>
  </m3e-card>
</div>

```html
<m3e-card variant="filled">
  <m3e-heading slot="header" variant="title" size="large">Filled</m3e-heading>
  <div slot="content">التنويع الافتراضي. يأتي لون حاويته من مستويات الأسطح.</div>
</m3e-card>
<m3e-card variant="outlined">
  <m3e-heading slot="header" variant="title" size="large">Outlined</m3e-heading>
  <div slot="content">له حدّ خارجي بسماكة 1px.</div>
</m3e-card>
<m3e-card variant="elevated">
  <m3e-heading slot="header" variant="title" size="large">Elevated</m3e-heading>
  <div slot="content">له ظل ولون سطح.</div>
</m3e-card>
```

من دون `variant`، تستخدم البطاقة `filled`.

## المنافذ

للبطاقة خمس مناطق:

- `header`: عنوان أو أيقونة أو وسائط، دون حشوة إضافية.
- `content`: منطقة المتن، مع حشوة.
- `actions`: أزرار الإجراءات، محاذاة إلى حافة البداية افتراضيًا. أضف الخاصية `end` إلى العنصر لمحاذاتها إلى حافة النهاية.
- `footer`: البيانات الوصفية أو حقوق النشر أو الملاحظات الثانوية.
- المنفذ الافتراضي: دون حشوة. يناسب الصور الممتدة حتى الحواف أو التخطيطات المخصصة.

<div class="demo-grid">
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">ملخص المستند</m3e-heading>
    <div slot="content">
      يمكن أن تحتوي منطقة المتن على فقرات وقوائم وشرائح وشارات. وتتحكم البطاقة في الحشوة.
    </div>
    <div slot="actions" end>
      <m3e-button variant="text">إلغاء</m3e-button>
      <m3e-button variant="filled">متابعة</m3e-button>
    </div>
    <div slot="footer">حُدِّث في 2026-10-27</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined">
  <m3e-heading slot="header" variant="title" size="large">ملخص المستند</m3e-heading>
  <div slot="content">
    يمكن أن تحتوي منطقة المتن على فقرات وقوائم وشرائح وشارات. وتتحكم البطاقة في الحشوة.
  </div>
  <div slot="actions" end>
    <m3e-button variant="text">إلغاء</m3e-button>
    <m3e-button variant="filled">متابعة</m3e-button>
  </div>
  <div slot="footer">حُدِّث في 2026-10-27</div>
</m3e-card>
```

رتّب الأزرار في `actions` وفق أعراف المنصة: الإلغاء في جهة البداية، والتأكيد في جهة النهاية. ويستخدم نص التذييل لونًا ثانويًا حتى لا ينافس المتن على الانتباه.

## الجمع بين أنواع المحتوى

يمكن للبطاقة أن تجمع بين العناوين والشرائح والشارات والقوائم:

<m3e-card variant="elevated">
  <m3e-heading m3e-toc-ignore slot="header" variant="headline" size="small">ميزات السمة</m3e-heading>
  <div slot="content">
    <div class="demo-row">
      <m3e-chip>
        <m3e-icon slot="icon" name="palette"></m3e-icon>
        الألوان الديناميكية
      </m3e-chip>
      <m3e-chip>
        <m3e-icon slot="icon" name="layers"></m3e-icon>
        استبدال المكونات
      </m3e-chip>
      <m3e-badge size="small">Beta</m3e-badge>
    </div>
    <ul>
      <li>تنقل وجدول محتويات مبنيان من التهيئة</li>
      <li>إعدادات محفوظة في المتصفح الحالي</li>
      <li>تسجيل في جهة العميل، متوافق مع البناء بـ SSR</li>
    </ul>
  </div>
  <div slot="actions">
    <m3e-button variant="tonal" href="/ar-SA/theme/extending.html">
      تعرّف على طرق التوسيع
      <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
    </m3e-button>
  </div>
</m3e-card>

```html
<m3e-card variant="elevated">
  <m3e-heading slot="header" variant="headline" size="small">ميزات السمة</m3e-heading>
  <div slot="content">
    <div class="demo-row">
      <m3e-chip>
        <m3e-icon slot="icon" name="palette"></m3e-icon>
        الألوان الديناميكية
      </m3e-chip>
      <m3e-chip>
        <m3e-icon slot="icon" name="layers"></m3e-icon>
        استبدال المكونات
      </m3e-chip>
      <m3e-badge size="small">Beta</m3e-badge>
    </div>
    <ul>
      <li>تنقل وجدول محتويات مبنيان من التهيئة</li>
      <li>إعدادات محفوظة في المتصفح الحالي</li>
      <li>تسجيل في جهة العميل، متوافق مع البناء بـ SSR</li>
    </ul>
  </div>
  <div slot="actions">
    <m3e-button variant="tonal" href="/ar-SA/theme/extending.html">
      تعرّف على طرق التوسيع
      <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
    </m3e-button>
  </div>
</m3e-card>
```

مع زيادة المحتوى، تكبر البطاقة لتستوعبه. ولا تحصل البطاقات في الشبكة نفسها على ارتفاعات متساوية تلقائيًا، لذا اجعل نصوصها متقاربة الطول.

## البطاقات القابلة للتفاعل

أضف `actionable` إلى بطاقة لتجعل سطحها كله منطقة تفاعل واحدة. ومع `href` تعمل رابطًا مباشرًا:

<div class="demo-grid">
  <m3e-card variant="outlined" actionable href="/ar-SA/getting-started/installation.html">
    <m3e-icon slot="header" name="package_2"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">التثبيت</m3e-heading>
    <div slot="content">جهّز Node والاعتماديات، ثم أنتج أول بناء لك.</div>
  </m3e-card>
  <m3e-card variant="outlined" actionable href="/ar-SA/getting-started/configuration.html">
    <m3e-icon slot="header" name="tune"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">التهيئة</m3e-heading>
    <div slot="content">اضبط شريط التطبيق والتنقل وأقسام الإعدادات وعمق جدول المحتويات.</div>
  </m3e-card>
  <m3e-card variant="outlined" actionable href="/ar-SA/theme/extending.html">
    <m3e-icon slot="header" name="integration_instructions"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">التوسيع</m3e-heading>
    <div slot="content">خصّص الواجهة باستبدال المكونات ورموز CSS.</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined" actionable href="/ar-SA/getting-started/installation.html">
  <m3e-icon slot="header" name="package_2"></m3e-icon>
  <m3e-heading slot="header" variant="title" size="large">التثبيت</m3e-heading>
  <div slot="content">جهّز Node والاعتماديات، ثم أنتج أول بناء لك.</div>
</m3e-card>
```

تُظهر البطاقة القابلة للتفاعل طبقة حالة عند التمرير بالمؤشر والتركيز والضغط. أزل أي عناصر تفاعلية أخرى داخل البطاقة القابلة للنقر بالكامل، حتى لا تتسبب الأزرار المتداخلة في تنفيذ إجراءين معًا. وعندما تحتاج إلى عدة إجراءات، استخدم بطاقة عادية مع المنفذ `actions` بدلًا من ذلك.

## إجراءات مربع الحوار

يمكن لإجراء البطاقة أن يفتح مربع حوار. ضع `m3e-dialog-trigger` داخل الزر. ويغلق `m3e-dialog-action` مربع الحوار ويعيد نتيجة:

<m3e-card variant="outlined">
  <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">معلومات الإصدار</m3e-heading>
  <div slot="content">يطابق هذا التوثيق VitePress 2.0.0-alpha.21 و@m3e/web 2.10.3.</div>
  <div slot="actions" end>
    <m3e-button variant="filled">
      <m3e-dialog-trigger for="card-demo-dialog">عرض التفاصيل</m3e-dialog-trigger>
    </m3e-button>
  </div>
</m3e-card>

<m3e-dialog id="card-demo-dialog" dismissible>
  <span slot="header">Vitepress Theme Akari Docs</span>
  <p>تستخدم السمة VitePress للتوليد الثابت والتوجيه، وm3e لمكونات الواجهة والألوان الديناميكية.</p>
  <p>تُحفظ الإعدادات محليًا في المتصفح ولا تُكتب في تهيئة الموقع.</p>
  <div slot="actions" end>
    <m3e-button>
      <m3e-dialog-action return-value="close">إغلاق</m3e-dialog-action>
    </m3e-button>
  </div>
</m3e-dialog>

```html
<m3e-button variant="filled">
  <m3e-dialog-trigger for="card-demo-dialog">عرض التفاصيل</m3e-dialog-trigger>
</m3e-button>
<m3e-dialog id="card-demo-dialog" dismissible>
  <span slot="header">Vitepress Theme Akari Docs</span>
  <p>تستخدم السمة VitePress للتوليد الثابت والتوجيه، وm3e لمكونات الواجهة والألوان الديناميكية.</p>
  <div slot="actions" end>
    <m3e-button>
      <m3e-dialog-action return-value="close">إغلاق</m3e-dialog-action>
    </m3e-button>
  </div>
</m3e-dialog>
```

يمنح `dismissible` مربع الحوار زر إغلاق. والنقر على طبقة التعتيم (scrim) أو الضغط على `Escape` يغلقه أيضًا. وللتدفقات التي يجب ألا تُقاطَع، أضف `disable-close` وإجراء تأكيد صريحًا.

## تخطيط الشبكة

تستخدم شبكات البطاقات `.demo-grid`، التي تصبح عمودًا واحدًا في الشاشات الضيقة. اجعل لكل بطاقة موضوعًا واحدًا وإجراءً رئيسيًا واحدًا، ولا تحشر محتوى صفحة كاملة في بطاقة واحدة.

<div class="demo-grid">
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">البدء</m3e-heading>
    <div slot="content">من التثبيت إلى أول بناء في نحو عشر دقائق.</div>
  </m3e-card>
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">السمة</m3e-heading>
    <div slot="content">افهم هيكل التطبيق والشريط الجانبي ومربع حوار الإعدادات.</div>
  </m3e-card>
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">الأنماط</m3e-heading>
    <div slot="content">تعرّف على رموز الألوان والتسلسل الهرمي للطباعة.</div>
  </m3e-card>
</div>

## نصائح الاستخدام

- اجعل عناوين البطاقات قصيرة ونص المتن ثلاثة أسطر على الأكثر. انقل المحتوى الطويل إلى صفحة خاصة به.
- لا تستخدم إلا تنويعًا واحدًا في الشبكة لتجنب الضوضاء البصرية.
- لا تضع أزرارًا داخل بطاقة قابلة للنقر بالكامل. استخدم `actions` عندما تحتاج إلى عدة إجراءات.
- ضع الصور في المنفذ الافتراضي أو في المنفذ `header`، وامنحها نصًا بديلًا.
- اضبط نصف قطر زوايا البطاقة ولونها وحشوتها بمتغيرات `--m3e-card-*`. راجع [توسيع السمة](/ar-SA/theme/extending).

لجميع الخصائص والمنافذ والأحداث، راجع [API](/ar-SA/components/card/api).
