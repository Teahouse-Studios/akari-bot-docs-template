---
tab: API
---

# التهيئة: API

## defineAkariConfig

```ts
import { defineAkariConfig } from "./.vitepress/theme/define.ts";

function defineAkariConfig(config: AkariSiteConfig): AkariDirectoryConfig;
```

يصدّر كلا مستويي ملفات التهيئة تهيئتهما بها. تبقى حقول VitePress كما هي. أما حقول السمة فتنتقل إلى `themeConfig.akari` الذي يقرؤه VitePress، وتحصل على تلميحات الأنواع. الأنواع معرّفة في `docs/.vitepress/theme/types.ts`.

## الموقع واللغة

| الحقل | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `rootLanguage` | `string` | أول مجلد لغة بالترتيب الأبجدي | لا يسري إلا في التهيئة المشتركة: مجلد اللغة الذي يُقدَّم في جذر الموقع. تبدأ مسارات اللغات الأخرى باسم مجلدها |
| `lang` | `string` | اسم مجلد اللغة | رمز اللغة. يُستخدم في `<html lang>`، ويختار [حزمة اللغة](/ar-SA/theme/i18n/api#akarilanguage) |
| `label` | `string` | اسم اللغة بلغتها نفسها | الاسم في قائمة اللغات |
| `dir` | `"ltr" \| "rtl" \| "auto"` | قيمة حزمة اللغة | اتجاه النص |
| `title` | `string` | لا يوجد | عنوان الموقع؛ وهو أيضًا العنوان الافتراضي لشريط التطبيق |
| `titleTemplate` | `string \| boolean` | لا يوجد | لاحقة عناوين الصفحات أو قالبها، كما في VitePress |
| `description` | `string` | لا يوجد | وصف الموقع |
| `head` | `HeadConfig[]` | `[]` | وسوم `<head>` إضافية، تُدمج مع المستوى الأعلى |
| `logo` | `string` | لا يوجد | صورة العلامة في شريط التطبيق والتذييل |
| `markdown` | `MarkdownLocaleOptions` | قيمة حزمة اللغة | نصوص اللغة في Markdown، مثل تلميح زر نسخ كتلة الشيفرة، وتُطبَّق فوق نصوص حزمة اللغة |

الحقول `lang` و`label` و`dir` و`markdown` تصف اللغة، ومكانها تهيئة اللغة. أما بقية الحقول فيمكن وضعها في التهيئة المشتركة قيمًا افتراضية، ويمكن لتهيئة اللغة تجاوزها.

## حقول السمة

| الحقل | المحتوى | راجع |
| --- | --- | --- |
| `appBar` | عنوان شريط التطبيق والإصدار والشعار والأزرار والروابط الاجتماعية | [التخطيط وشريط التطبيق](/ar-SA/theme/layout/api#appbar) |
| `toc` | جدول المحتويات على اليسار | [التخطيط وشريط التطبيق](/ar-SA/theme/layout/api#toc) |
| `loadingBar` | الشريط في أعلى النافذة أثناء تحميل الصفحة | [التخطيط وشريط التطبيق](/ar-SA/theme/layout/api#loadingbar) |
| `footer` | بطاقات التنقل بين الصفحات والتذييل | [التخطيط وشريط التطبيق](/ar-SA/theme/layout/api#footer) |
| `sidebar` | الفئات والتنقل المكتوب يدويًا وعرض الدرج | [التنقل الجانبي](/ar-SA/theme/sidebar/api#sidebar) |
| `settings` | مربع حوار الإعدادات وزر المظهر | [الإعدادات والمظهر](/ar-SA/theme/settings/api#settings) |
| `search` | مدخل البحث وخدماته | [البحث](/ar-SA/theme/search/api#search) |
| `messages` | نصوص الواجهة | [التدويل](/ar-SA/theme/i18n/api#messages) |
| `fonts` | هل تُحمَّل الخطوط من Google Fonts، وقائمة الخطوط | [الطباعة](/ar-SA/styles/typography/api#fonts) |
| `languages` | حزم لغات إضافة إلى الحزم المدمجة، أو تعديلات عليها | [التدويل](/ar-SA/theme/i18n/api#akarilanguage) |

لا يجري استبدال مكونات الواجهة في ملفات التهيئة؛ راجع [توسيع السمة](/ar-SA/theme/extending/api#provideakaricomponents).

## .vitepress/config.mts

الجزء الذي يربط السمة بـ VitePress. نادرًا ما تحتاج إلى تغييره:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { akariContent } from "./content";
import { akariHead } from "./theme/head";
import { akariMarkdown } from "./theme/markdown";

const docsDir = fileURLToPath(new URL("../", import.meta.url));
const content = await akariContent(docsDir);

export default defineConfig({
  ...content.site,
  cleanUrls: false,
  appearance: false,
  head: akariHead(),
  markdown: { config: (md) => akariMarkdown(md) },
  vue: {
    template: {
      compilerOptions: { isCustomElement: (tag) => tag.startsWith("m3e-") },
    },
  },
  vite: {
    plugins: [content.plugin],
  },
});
```

| الخيار | الغرض |
| --- | --- |
| `...content.site` | `locales` و`rewrites` و`lang` و`title` و`description` على مستوى الموقع، مولَّدة من المجلدات؛ ومع البحث المحلي أيضًا `themeConfig.search`، الذي يشغّل فهرس البحث المحلي في VitePress |
| `cleanUrls: false` | مسارات الصفحات تنتهي بـ `.html` وتطابق ملفات المخرجات واحدًا لواحد؛ ومع `true` تكون بلا امتداد، ولمتطلبات الاستضافة راجع [التثبيت](/ar-SA/getting-started/installation#deployment) |
| `appearance: false` | يوقف مفتاح التبديل بين الوضع الفاتح والداكن المدمج في VitePress؛ فالسمة تتولى ذلك |
| `head: akariHead()` | برنامج نصي يطبّق الوضع الفاتح أو الداكن قبل الإطار الأول |
| `akariMarkdown` | حدود M3 للجداول وأبعاد للصور البعيدة |
| `isCustomElement` | يجعل Vue يعامل `m3e-*` عناصرَ مخصصة |
| `content.plugin` | أثناء التطوير، يحدّث التنقل عند إضافة ملفات Markdown أو حذفها وعند تغيّر البيانات الأمامية (frontmatter) |

## akariContent

```ts
function akariContent(
  srcDir: string,
  logger?: { warn(message: string): void },
): Promise<AkariContent>;
```

يقرأ ملفات التهيئة والمجلدات في `srcDir`. القيمة الافتراضية لـ `logger` هي `console`، ويتلقى تنبيهات مثل الصفحات الواقعة خارج البنية والصفحات المتوازية التي لا يُعثر عليها.

| الحقل المُعاد | النوع | الوصف |
| --- | --- | --- |
| `site` | `{ lang, title, description, locales, rewrites }` | يُفرد داخل `defineConfig` |
| `plugin` | `Plugin` من Vite | يحدّث التنقل في خادم التطوير |
| `route` | `(page: string) => string` | مسار الملف المصدري ← مسار الصفحة، فمثلًا يصبح `zh-CN/theme/layout/index.md` المسار `/zh-CN/theme/layout` |
| `rewrite` | `(page: string) => string` | مسار الملف المصدري ← مسار التقديم في VitePress، مثل `zh-CN/theme/layout/index.md` ← `theme/layout.md` |
| `languages` | `{ folder, key, prefix }[]` | مجلدات اللغات، واللغة الجذرية أولًا. `key` هو مفتاح locale في VitePress (`root` للغة الجذرية)؛ و`prefix` هو بادئة المسار |

## akariHead

```ts
function akariHead(options?: {
  storageKey?: string;
  defaultScheme?: "light" | "dark" | "auto" | "time";
}): HeadConfig[];
```

يعيد برنامجًا نصيًا مضمّنًا يطبّق الوضع الفاتح أو الداكن قبل رسم الإطار الأول. تختلف وسوم `<head>` الخاصة بالخطوط بحسب اللغة، لذا يكتبها `akariContent` في locale كل لغة؛ راجع [الطباعة](/ar-SA/styles/typography/api#fonts). إذا غيّرت `settings.storageKey` أو `settings.defaults.scheme`، فمرّر القيم نفسها هنا ليقرأ البرنامج النصي الإعدادات نفسها.

## akariMarkdown

```ts
function akariMarkdown(
  md: MarkdownRenderer,
  options?: { remoteImageSize?: boolean | AkariImageSizeOptions },
): void;
```

استدعها في `markdown.config`. تقوم بأمرين:

- تغلّف كل جدول Markdown في `<div class="akari-table">`، مما يمنح الجدول حدًّا خارجيًا بأسلوب M3 وتمريرًا أفقيًا.
- تكتب عرض الصور البعيدة وارتفاعها باستخدام [markdown-it-image-size](https://github.com/boyum/markdown-it-image-size). أما الصور المحلية فيكتبها VitePress بنفسه. راجع [كتابة الصفحات](/ar-SA/getting-started/writing/api#images).

| الخيار | القيمة الافتراضية | الوصف |
| --- | --- | --- |
| `remoteImageSize` | `true` | مع `false` لا تُقاس الصور البعيدة. ويمكن أن يحمل أيضًا خيارات الإضافة، مثل `{ cacheDir: ".image-size" }` للاحتفاظ بذاكرة التخزين المؤقت في المستودع، أو `{ cache: false }` لعدم استخدامها |
