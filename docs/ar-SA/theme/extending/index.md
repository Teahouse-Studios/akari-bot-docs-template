---
icon: integration_instructions
order: 7
badge: توسيع
tab: نظرة عامة
parallel:
  - api
---

# توسيع السمة

توجد ثلاث طرق لتعديل السمة، ولا تتطلب أيٌّ منها تغيير الشيفرة المصدرية للسمة:

| الطريقة | مناسبة لـ | المكان |
| --- | --- | --- |
| التهيئة | العناوين والتنقل وخيارات الإعدادات وجدول المحتويات والتذييل ونصوص الواجهة | `docs/config.ts` وملف `config.ts` لكل لغة؛ راجع [التهيئة](/ar-SA/getting-started/configuration) |
| استبدال المكوّنات | شريط تطبيق بهوية خاصة، أو تذييل خاص، أو حاوية مخصّصة للمحتوى | `enhanceApp` في مدخل السمة |
| متغيرات CSS | نصف قطر الزوايا والمسافات وألوان الأسطح وعرض جدول المحتويات | أنماط الموقع |

## استبدال المكوّنات

في `enhanceApp` داخل مدخل السمة `docs/.vitepress/theme/index.ts`، استدعِ `provideAkariSiteData` لتسليم بيانات اللغة والتهيئة الخاصة بالموقع إلى السمة، ثم مرّر إلى `provideAkariComponents` الأجزاء التي تريد استبدالها. الأجزاء التي لا تمرّرها تبقى على المكوّنات المدمجة:

```ts
import { type Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import { provideAkariSiteData } from "./composables/useLocales";
import { provideAkariComponents } from "./composables/useAkariConfig";
import Layout from "./layouts/AkariLayout.vue";
import CustomFooter from "./CustomFooter.vue";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, siteData }) {
    provideAkariSiteData(app, siteData);
    provideAkariComponents(app, { Footer: CustomFooter });
  },
} satisfies Theme;
```

تقرأ المكوّنات المخصّصة التهيئة والحالة عبر دوال composable التي توفرها السمة، مثل `useAkariConfig()` و`useSidebar()`. راجع [API](/ar-SA/theme/extending/api) لمعرفة الأجزاء القابلة للاستبدال والدوال المتاحة.

## متغيرات CSS

أعِد تعريف متغيرات السمة ومتغيرات مكوّنات m3e في أنماط موقعك:

```css
:root {
  --akari-doc-radius: 24px;
  --akari-doc-max-width: 1440px;
}
```

يمكنك أيضًا تعديل مكوّن واحد في مكانه. البطاقات الثلاث أدناه لا تغيّر سوى نصف قطر الزوايا:

<div class="demo-grid">
  <m3e-card variant="outlined" style="--m3e-card-shape: 4px;">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">زوايا 4px</m3e-heading>
    <div slot="content">بطاقة أكثر إحكامًا، تناسب لوحات الأدوات وكتل البيانات.</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">الزوايا الافتراضية</m3e-heading>
    <div slot="content">تحتفظ برمز الشكل الافتراضي لبطاقة m3e، فتبقى متسقة مع المكوّنات الأخرى.</div>
  </m3e-card>
  <m3e-card variant="outlined" style="--m3e-card-shape: 28px;">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">زوايا 28px</m3e-heading>
    <div slot="content">زوايا أكبر، أقرب إلى اللغة البصرية لسطح المستند.</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined" style="--m3e-card-shape: 28px;">…</m3e-card>
```

استخدم في المقام الأول المتغيرات التي تتيحها السمة والمكوّنات. لا تعتمد على أسماء الأصناف الداخلية للمكوّنات ولا على بنية Shadow DOM؛ فهي تتغير بين الإصدارات.

## أمور يجب مراعاتها

- عند استبدال مكوّن، حافظ على دلالات العنصر الجذري الأصلي وخصائص إمكانية الوصول فيه (مثل `m3e-app-bar` لشريط التطبيق و`m3e-nav-menu` للتنقل)، وحافظ على إمكانية التشغيل بلوحة المفاتيح.
- لا تكتب الألوان بقيم ثابتة. استخدم رموز `--md-sys-color-*` لكي تتبع الألوانُ الألوانَ الديناميكية والوضع الفاتح والوضع الداكن والتباين.
- عند استخدام مكوّن أو أيقونة جديدة من m3e، سجّلها عند الحاجة في `m3e.ts` و`icons.ts`. لا تستورد `@m3e/web/all`.
- لا تصل إلى `window` أو `document` أو `localStorage` في المستوى الأعلى من الوحدة، وإلا فشل العرض من جانب الخادم.
