---
icon: tune
order: 2
tab: نظرة عامة
parallel:
  - api
  - details
---

# التهيئة

توجد التهيئة في المجلد `docs`، على مستويين:

- `docs/config.ts`: تهيئة مشتركة بين جميع اللغات.
- `docs/<language code>/config.ts`: تهيئة لغة واحدة، مثل `docs/ar-SA/config.ts`. المجلد الذي يحتوي على هذا الملف هو مجلد لغة.

الحقل في تهيئة اللغة يحل محل الحقل الذي يحمل الاسم نفسه في التهيئة المشتركة، وتُدمج الكائنات حقلًا بحقل، لذا لا تحتوي تهيئة اللغة إلا على ما يختلف في تلك اللغة. أما `docs/.vitepress/config.mts` فيقتصر على ربط السمة بـ VitePress، ونادرًا ما تحتاج إلى تغييره.

```text
docs/
├─ config.ts                 التهيئة المشتركة
├─ en-US/                    الإنجليزية، في جذر الموقع
│  ├─ config.ts              تهيئة اللغة
│  └─ …                      الصفحات، راجع «كتابة الصفحات»
├─ zh-CN/                    الصينية المبسطة، تحت /zh-CN/
│  ├─ config.ts
│  └─ …
└─ .vitepress/config.mts
```

## التهيئة المشتركة

ما هو واحد في كل اللغات: اللغة الجذرية، والشعار، والإصدار والروابط الاجتماعية، وأيقونات الفئات وترتيبها، والإعدادات والبحث.

```ts
// docs/config.ts
import { defineAkariConfig } from "./.vitepress/theme/define.ts";

export default defineAkariConfig({
  // مجلد اللغة الذي يُقدَّم في جذر الموقع
  rootLanguage: "en-US",
  logo: "/logo.svg",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
  appBar: {
    version: "v1.0.0",
    socialLinks: [
      { icon: "github", link: "https://github.com/OasisAkari/vitepress-theme-akari-docs", label: "GitHub" },
    ],
  },
  sidebar: {
    // أسماء مجلدات الفئات وأيقوناتها؛ ترتيب المفاتيح هو ترتيبها في شريط التنقل
    categories: {
      "getting-started": { icon: "rocket_launch" },
      theme: { icon: "palette" },
    },
  },
  settings: { storageKey: "akari-docs-settings" },
  search: { maxResults: 8 },
  images: { webp: true },
  footer: { copyright: "Vitepress Theme Akari Docs" },
});
```

## تهيئة اللغة

عناوين اللغة ونصوصها في هذا الموقع. القيمة الافتراضية لـ `lang` هي اسم المجلد، ومنها تختار السمة [حزمة اللغة](/ar-SA/theme/i18n#language-packs): الاسم في قائمة اللغات واتجاه النص ونصوص الواجهة ونص زر نسخ كتلة الشيفرة كلها تأتي من الحزمة، ويمكنك استبدالها هنا عند الحاجة.

```ts
// docs/ar-SA/config.ts
import { defineAkariConfig } from "../.vitepress/theme/define.ts";

export default defineAkariConfig({
  title: "Vitepress Theme Akari Docs",
  description: "قالب توثيق مبني على VitePress و M3E Web Components",
  appBar: { title: "Vitepress Theme Akari Docs" },
  sidebar: {
    categories: {
      "getting-started": { text: "البدء" },
      theme: { text: "السمة" },
    },
  },
  footer: { message: "صُنع باستخدام VitePress و M3E Web Components" },
});
```

## التغييرات الشائعة

| لكي | اكتب في | الحقل |
| --- | --- | --- |
| تغيّر اسم الموقع | تهيئة اللغة | `title`، `appBar.title` |
| تضيف إصدارًا أو روابط اجتماعية | التهيئة المشتركة | `appBar.version`، `appBar.socialLinks` |
| تغيّر ترتيب الفئات أو أيقوناتها | التهيئة المشتركة | `sidebar.categories` |
| تعيد تسمية فئة | تهيئة اللغة | `sidebar.categories.<folder>.text` |
| تغيّر اللون الافتراضي والوضع الفاتح والوضع الداكن | التهيئة المشتركة | `settings.defaults` |
| توقف البحث أو تربط خدمة بحث | التهيئة المشتركة | `search` |
| تغيّر رسالة التذييل وحقوق النشر | تهيئة اللغة / التهيئة المشتركة | `footer.message`، `footer.copyright` |
| تعيد كتابة نصوص الواجهة | تهيئة اللغة | `messages` |
| تحويل صور الموقع إلى WebP | التهيئة المشتركة | `images.webp` |
| تضيف لغة | مجلد لغة جديد | راجع [التدويل](/ar-SA/theme/i18n) |

لمعرفة نوع كل حقل وقيمته الافتراضية، راجع [API](/ar-SA/getting-started/configuration/api). ولمعرفة كيف تتراكب التهيئة وكيف تُولَّد اللغات والتنقل، راجع [التفاصيل](/ar-SA/getting-started/configuration/details).
