---
icon: language
order: 3
badge: جديد
tab: نظرة عامة
parallel:
  - api
---

# التنقل

تنقسم مكونات m3e الخاصة بالتنقل إلى ثلاث مجموعات: `m3e-nav-menu` ينظّم الصفحات متعددة المستويات، و`m3e-tabs` يبدّل بين العروض داخل صفحة واحدة، والشرائح والشارات تعرض الحالة وعوامل التصفية.

## التنقل الجانبي

يحتوي `m3e-nav-menu` على التنقل متعدد المستويات. ويرتّب `m3e-nav-menu-item` محتواه بالمنافذ `label` و`icon` و`badge`. استخدم `open` لتوسيع مجموعة و`selected` لتمييز العنصر الطرفي الحالي:

<div class="demo-surface" style="max-width: 320px; max-block-size: 320px;">
  <m3e-nav-menu aria-label="عرض توضيحي لتنقل المكونات">
    <m3e-nav-menu-item open>
      <m3e-icon slot="icon" name="widgets"></m3e-icon>
      <span slot="label">المكونات</span>
      <m3e-nav-menu-item>
        <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
        <a slot="label" href="/ar-SA/components/button.html">الأزرار</a>
      </m3e-nav-menu-item>
      <m3e-nav-menu-item selected>
        <m3e-icon slot="icon" name="language"></m3e-icon>
        <a slot="label" href="/ar-SA/components/navigation.html">التنقل</a>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
    <m3e-nav-menu-item>
      <m3e-icon slot="icon" name="dashboard"></m3e-icon>
      <a slot="label" href="/ar-SA/components/card.html">البطاقات</a>
      <span slot="badge">جديد</span>
    </m3e-nav-menu-item>
  </m3e-nav-menu>
</div>

```html
<m3e-nav-menu aria-label="عرض توضيحي لتنقل المكونات">
  <m3e-nav-menu-item open>
    <m3e-icon slot="icon" name="widgets"></m3e-icon>
    <span slot="label">المكونات</span>
    <m3e-nav-menu-item selected>
      <m3e-icon slot="icon" name="language"></m3e-icon>
      <a slot="label" href="/ar-SA/components/navigation.html">التنقل</a>
    </m3e-nav-menu-item>
  </m3e-nav-menu-item>
  <m3e-nav-menu-item>
    <m3e-icon slot="icon" name="dashboard"></m3e-icon>
    <a slot="label" href="/ar-SA/components/card.html">البطاقات</a>
    <span slot="badge">جديد</span>
  </m3e-nav-menu-item>
</m3e-nav-menu>
```

يتحكم `open` في توسيع المجموعة. وأثناء التشغيل يمكن للمكون أيضًا إدارة ذلك بنفسه، بناءً على حالة تحديد العناصر الفرعية. ويعطّل `disabled` العنصر وكل عناصره الفرعية. وافتراضيًا، تُمرَّر القائمة داخل نفسها عندما يكون ارتفاعها محدودًا.

## علامات التبويب {#tabs}

لا يمكن أن تكون العناصر الفرعية المباشرة لـ `m3e-tabs` إلا `m3e-tab` و`m3e-tab-panel`. تشير الخاصية `for` في كل `m3e-tab` إلى `id` لوحتها، ولا يمكن أن يحمل `selected` إلا تبويب واحد:

<m3e-tabs variant="primary">
  <m3e-tab selected for="nav-demo-panel-overview">
    <m3e-icon slot="icon" name="home"></m3e-icon>
    نظرة عامة
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-button">
    <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
    الأزرار
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-card">
    <m3e-icon slot="icon" name="dashboard"></m3e-icon>
    البطاقات
  </m3e-tab>
  <m3e-tab-panel id="nav-demo-panel-overview">
    لوحة النظرة العامة: الغرض من المكون، وتنويعاته، ونصائح الاستخدام.
  </m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-button">
    لوحة الأزرار: التنويعات الخمسة لـ <code>m3e-button</code> و<code>m3e-icon-button</code>.
  </m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-card">
    لوحة البطاقات: منافذ <code>m3e-card</code> وتنويعاته ووضعه القابل للتفاعل.
  </m3e-tab-panel>
</m3e-tabs>

```html
<m3e-tabs variant="primary">
  <m3e-tab selected for="nav-demo-panel-overview">
    <m3e-icon slot="icon" name="home"></m3e-icon>
    نظرة عامة
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-button">
    <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
    الأزرار
  </m3e-tab>
  <m3e-tab-panel id="nav-demo-panel-overview">محتوى لوحة النظرة العامة.</m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-button">محتوى لوحة الأزرار.</m3e-tab-panel>
</m3e-tabs>
```

`variant="primary"` هو نمط التبويبات الرئيسي (والقيمة الافتراضية `secondary`)، و`stretch` يجعل التبويبات متساوية العرض لتملأ الحاوية. وعندما تكثر التبويبات، اسمح بالتمرير الأفقي أو بالتصفح بين الصفحات. لا تضغط النص حتى يصبح غير مقروء.

## الشرائح وعوامل التصفية

`m3e-chip` شريحة غير تفاعلية لعرض الفئات والحالة والتقنيات المستخدمة. غلّف الشرائح في `.demo-row` للتحكم في المسافات:

<div class="demo-row">
  <m3e-chip>
    <m3e-icon slot="icon" name="palette"></m3e-icon>
    السمة
  </m3e-chip>
  <m3e-chip>
    <m3e-icon slot="icon" name="layers"></m3e-icon>
    المكونات
  </m3e-chip>
  <m3e-chip variant="elevated">
    <m3e-icon slot="icon" name="check"></m3e-icon>
    مفعّل
  </m3e-chip>
</div>

```html
<div class="demo-row">
  <m3e-chip>
    <m3e-icon slot="icon" name="palette"></m3e-icon>
    السمة
  </m3e-chip>
  <m3e-chip>
    <m3e-icon slot="icon" name="layers"></m3e-icon>
    المكونات
  </m3e-chip>
  <m3e-chip variant="elevated">
    <m3e-icon slot="icon" name="check"></m3e-icon>
    مفعّل
  </m3e-chip>
</div>
```

عندما يحتاج المستخدمون إلى تصفية المحتوى، استخدم شريحة التصفية التفاعلية:

<m3e-filter-chip-set aria-label="تصفية التوثيق">
  <m3e-filter-chip selected value="all">الكل</m3e-filter-chip>
  <m3e-filter-chip value="theme">السمة</m3e-filter-chip>
  <m3e-filter-chip value="style">الأنماط</m3e-filter-chip>
  <m3e-filter-chip value="component">المكونات</m3e-filter-chip>
</m3e-filter-chip-set>

```html
<m3e-filter-chip-set aria-label="تصفية التوثيق">
  <m3e-filter-chip selected value="all">الكل</m3e-filter-chip>
  <m3e-filter-chip value="theme">السمة</m3e-filter-chip>
  <m3e-filter-chip value="style">الأنماط</m3e-filter-chip>
  <m3e-filter-chip value="component">المكونات</m3e-filter-chip>
</m3e-filter-chip-set>
```

لشريحة التصفية حالة تحديد خاصة بها ومعالجة للوحة المفاتيح. يضبط `selected` القيمة الأولية، ويطلق النقر حدث تغيير. ومعناها يختلف عن `m3e-chip` غير التفاعلية، لذا لا تخلط بينهما.

## الشارات

يمكن للشارة أن تعرض عددًا بمفردها، أو أن تُثبَّت على زر أو أيقونة عبر `for`:

<div class="demo-row">
  <m3e-badge size="small">3</m3e-badge>
  <m3e-badge size="medium">12</m3e-badge>
  <m3e-badge size="large">99+</m3e-badge>
  <m3e-button id="navigation-demo-update" variant="outlined">التحديثات</m3e-button>
  <m3e-badge for="navigation-demo-update" position="above-after">4</m3e-badge>
</div>

```html
<m3e-badge size="small">3</m3e-badge>
<m3e-badge size="medium">12</m3e-badge>
<m3e-badge size="large">99+</m3e-badge>
<m3e-button id="navigation-demo-update" variant="outlined">التحديثات</m3e-button>
<m3e-badge for="navigation-demo-update" position="above-after">4</m3e-badge>
```

تتبع الشارة المثبَّتة تغيّرات تخطيط العنصر الهدف، ويضبط `position` موضعها. ليس للشارة دور ARIA افتراضي. وعندما تربطها بعنصر تفاعلي، صِف العدد باستخدام `aria-describedby` أو بنص مرئي مطابق.

## تنقل SPA {#spa-navigation}

يجب أن تعرض الروابط الداخلية في الشريط الجانبي والتذييل عناصر `<a>` حقيقية. يعترض VitePress 2 النقرات الداخلية في مرحلة الالتقاط وينفّذ تنقل SPA. وقد أزال VitePress 2 كلًّا من vue-router و`RouterLink`، لذا لا تستوردهما ولا تتبع الأمثلة القديمة:

```vue
<a
  v-if="item.link && !isExternalLink(item.link)"
  slot="label"
  :href="withBase(item.link)"
  :aria-current="isActive(item.link) ? 'page' : undefined"
>
  {{ item.text }}
</a>
<a
  v-else-if="item.link"
  slot="label"
  :href="item.link"
  target="_blank"
  rel="noreferrer"
>
  {{ item.text }}
</a>
```

تأتي `withBase` من `vitepress` وتضيف قاعدة النشر إلى المسارات الداخلية. تتولى نواة VitePress النقرات اليسرى العادية، بينما تعمل النقرة الوسطى لفتح علامة تبويب جديدة، ويعمل نسخ الرابط، وتبقى دلالات إمكانية الوصول سليمة. وتحتفظ الروابط الخارجية بسلوكها الأصلي وتحصل على `target="_blank"` و`rel="noreferrer"`.

إذا كان لا بد من التنقل من برنامج نصي، فاستخدم `useRouter().go()`:

```ts
import { useRouter, withBase } from "vitepress";

const router = useRouter();

function navigate(event: MouseEvent, link: string): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
    return;
  }

  event.preventDefault();
  void router.go(withBase(link));
}
```

تتولّى السمة المراسي التي يولّدها زر m3e أو زر الأيقونة داخليًا، فينتقل الرابط الداخلي في مكانه دون إعادة تحميل الصفحة كاملة؛ ومع `target="_self"` تُحمَّل الصفحة كاملة، ومع `target="_blank"` يُفتح في علامة تبويب جديدة. ولا تحتاج إلى الاستماع إلى النقرات على العنصر المضيف واستدعاء `router.go()` إلا عندما تحاكي النقر بنفسك بعنصر غير رابط. تستخدم العروض التوضيحية الثابتة في هذه الصفحة عناصر `<a>` عادية، فيتولى VitePress النقرات الداخلية، بينما تظل الروابط الخارجية تحمّل الصفحة كاملة. وأيًّا كانت الطريقة التي تستخدمها، لا تزيّف رابطًا بعنصر `div` ومعالج نقر، ولا تحذف `href` الحقيقي من التنقل الداخلي.

## إمكانية الوصول

- اضبط `aria-label` على جذر القائمة، ليتضح أنها معلم التنقل في التوثيق.
- ميّز عنصر القائمة الحالي بـ `selected`. ويُخرج المكون `aria-current`.
- ترتبط التبويبات بقيم `id` للوحات عبر `for`، ولا يمكن أن يكون `selected` إلا تبويب واحد.
- احتفظ بنص مرئي على شرائح التصفية. لا تعتمد على اللون وحده لإظهار حالة التحديد.
- الزر الذي لا يحتوي إلا على أيقونة يجب أن يكون له `aria-label` وتلميح.

لجميع الخصائص والمنافذ والأحداث، راجع [API](/ar-SA/components/navigation/api).
