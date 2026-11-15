---
tab: API
---

# التدويل: API

## تهيئة اللغة

| الحقل | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `rootLanguage` | `string` | أول مجلد لغة بالترتيب الأبجدي | صالح في التهيئة المشتركة فقط: اللغة التي تُقدَّم في جذر الموقع |
| `lang` | `string` | اسم مجلد اللغة | رمز اللغة، ويُستخدم في `<html lang>` ولاختيار حزمة اللغة |
| `label` | `string` | اسم اللغة بلغتها نفسها | الاسم في قائمة اللغات؛ فمثلًا القيمة الافتراضية لـ `ja-JP` هي «日本語» |
| `dir` | `"ltr" \| "rtl" \| "auto"` | قيمة حزمة اللغة | اتجاه النص. يُستخدم عندما يكون إعداد «اتجاه النص» على «حسب اللغة» |
| `markdown` | `MarkdownLocaleOptions` | قيمة حزمة اللغة | نصوص هذه اللغة في Markdown، وتُطبَّق فوق نصوص حزمة اللغة، مثل `codeCopyButton: { tooltipText, copiedText }` |
| `messages` | `Partial<AkariMessages>` | لا شيء | يستبدل نصوص الواجهة أو يُكملها |
| `languages` | `AkariLanguage[]` | لا شيء | حزم لغات إضافة إلى الحزم المدمجة، أو تعديلات عليها؛ ويوضع عادةً في التهيئة المشتركة |

يمكن أيضًا وضع الحقول الأخرى (`title` و`description` و`appBar` و`footer` و`search` وغيرها) في تهيئة اللغة؛ راجع [التهيئة](/ar-SA/getting-started/configuration/api).

## AkariLanguage

شكل حزمة اللغة، وتُكتب باستخدام `defineAkariLanguage` (المستوردة من `docs/.vitepress/theme/define.ts`):

| الحقل | النوع | الوصف |
| --- | --- | --- |
| `code` | `string` | مطلوب. رمز اللغة. تبحث الصفحة أولًا عن حزمة برمزها الكامل (`pt-BR`)، ثم عن حزمة بلغتها الأساسية (`pt`) |
| `dir` | `"ltr" \| "rtl"` | اتجاه النص. القيمة الافتراضية `"ltr"` |
| `fonts` | `{ google: string[]; family: string[] }` | الخطوط؛ ويُكتب الحقلان كما في [`fonts`](/ar-SA/styles/typography/api#fonts). القيمة الافتراضية هي خطوط السمة (Roboto وNoto Sans SC) |
| `messages` | `Partial<AkariMessages>` | نصوص الواجهة. المدخلات الناقصة تكون بالإنجليزية |
| `markdown` | `MarkdownLocaleOptions` | النصوص في Markdown: `codeCopyButton` هو تلميح زر النسخ في كتل الشيفرة، و`container` يحمل العناوين الافتراضية للحاويات (`tipLabel` و`warningLabel` و`dangerLabel` و`infoLabel` و`detailsLabel` وغيرها) |

توجد الحزم المدمجة في `docs/.vitepress/theme/i18n/languages/`، ملف لكل لغة، ويسردها ملف `index.ts` في المجلد نفسه. ولإضافة لغة مدمجة أخرى إلى السمة نفسها، أضف ملفًا هناك وأدرجه في `AKARI_LANGUAGES`.

## messages

تحتوي حزم اللغات المدمجة الست، وهي الصينية المبسّطة (`zh`) والإنجليزية (`en`) واليابانية (`ja`) والكورية (`ko`) والفرنسية (`fr`) والعربية (`ar`)، على جميع نصوص الواجهة. المدخلات التي تكتبها في `messages` ضمن تهيئة اللغة تحلّ محل نصوص الحزمة؛ والمدخلات التي لا تكتبها تحتفظ بنصوص الحزمة. المدخلات التي تحتوي على `{name}` تُملأ بالقيمة المطابقة وقت التشغيل.

### التنقل وشريط التطبيق

| المفتاح | القيمة العربية الافتراضية |
| --- | --- |
| `navigationToggle` | تبديل التنقل |
| `navigationLabel` | التوثيق |
| `railLabel` | أقسام التوثيق |
| `categoryNavigation` | التنقل في {category} |
| `categoryPages` | صفحات {category} |
| `homeLink` | الصفحة الرئيسية لـ {title} |
| `moreActions` | المزيد |
| `backToTop` | العودة إلى الأعلى |
| `tocButton` | المحتويات |
| `languageLabel` | تغيير اللغة |
| `languageDialogTitle` | اختر لغة |
| `languageDialogClose` | إغلاق |
| `loadingLabel` | جارٍ تحميل الصفحة |

### جدول المحتويات والتنقل بين الصفحات والتذييل

| المفتاح | القيمة العربية الافتراضية |
| --- | --- |
| `tocOverline` | في هذه الصفحة |
| `pagerLabel` | التنقل بين الصفحات |
| `previousPage` | السابق |
| `nextPage` | التالي |
| `footerMessage` | صُنع باستخدام VitePress و M3E |
| `footerLinks` | روابط التذييل |
| `notFoundTitle` | الصفحة غير موجودة |
| `notFoundText` | ربما نُقلت الصفحة التي تبحث عنها أو حُذفت. |
| `notFoundLink` | العودة إلى الصفحة الرئيسية |

### الإعدادات

| المفتاح | القيمة العربية الافتراضية |
| --- | --- |
| `settingsTitle` | الإعدادات |
| `settingsClose` | إغلاق الإعدادات |
| `settingsColor` | اللون |
| `settingsVariant` | التنويع |
| `settingsContrast` | التباين |
| `settingsMotion` | الحركة |
| `settingsDirection` | اتجاه النص |
| `settingsTextSize` | حجم النص |
| `contrastStandard` | افتراضي |
| `contrastMedium` | متوسط |
| `contrastHigh` | عالٍ |
| `motionStandard` | قياسية |
| `motionExpressive` | تعبيرية |
| `directionAuto` | حسب اللغة |
| `directionLtr` | من اليسار إلى اليمين |
| `directionRtl` | من اليمين إلى اليسار |

### المظهر

| المفتاح | القيمة العربية الافتراضية |
| --- | --- |
| `schemeToggle` | المظهر: {mode} |
| `schemeLight` | فاتح |
| `schemeAuto` | النظام |
| `schemeDark` | داكن |
| `schemeTime` | حسب الوقت |
| `schemeChanged` | تم تبديل المظهر إلى: {mode} |
| `schemeChangedFollowing` | تم تبديل المظهر إلى: {mode} ({scheme}) |

### البحث

| المفتاح | القيمة العربية الافتراضية |
| --- | --- |
| `searchPlaceholder` | ابحث في التوثيق |
| `searchLabel` | البحث في التوثيق |
| `searchShortcutLabel` | {label}، الاختصار {shortcut} |
| `searchClose` | إغلاق البحث |
| `searchIntroTitle` | ابحث في التوثيق |
| `searchIntroText` | اكتب عنوان صفحة أو اسم مكوّن أو كلمات من النص. |
| `searchIntroShortcut` | اضغط {keys} لفتحه في أي وقت |
| `searchLoading` | جارٍ البحث… |
| `searchErrorTitle` | البحث غير متاح |
| `searchRetry` | إعادة المحاولة |
| `searchEmptyTitle` | لا توجد نتائج |
| `searchEmptyText` | جرّب كلمة أقصر، أو تحقّق من إعدادات خدمة البحث. |
| `searchResultCountOne` | {count} نتيجة |
| `searchResultCount` | {count} نتائج |
| `searchResultsLabel` | نتائج البحث |
| `searchResultPage` | صفحة |
| `searchHintSelect` | اختيار |
| `searchHintOpen` | فتح |
| `searchHintClose` | إغلاق |
| `searchFailed` | فشل البحث. حاول مرة أخرى لاحقًا. |
| `searchIndexUnavailable` | تعذّر تحميل فهرس البحث المحلي. |
| `searchIndexInvalid` | فهرس البحث المحلي غير صالح. |
| `searchRequestFailed` | فشل طلب البحث (HTTP {status}). |
| `searchBackendMissing` | لا توجد خدمة بحث مسجّلة باسم "{id}". |

يُستخدم `searchResultCountOne` للأعداد التي تكون فئة الجمع الخاصة بها `one` («1 نتيجة» بالعربية)؛ وتستخدم الأعداد الأخرى `searchResultCount`. يحدّد `Intl.PluralRules` الفئة بحسب اللغة. ويُعرض `{keys}` على شكل مفاتيح لوحة مفاتيح عند ظهوره.

## useAkariI18n

```ts
import { useAkariI18n } from "@theme";

const { lang, messages, t } = useAkariI18n();
t("homeLink", { title: "Vitepress Theme Akari Docs" }); // "الصفحة الرئيسية لـ Vitepress Theme Akari Docs"
```

| ما تُرجعه | الوصف |
| --- | --- |
| `lang` | رمز اللغة الحالية |
| `messages` | كل نصوص الواجهة للغة الحالية، مدموجة مع تهيئة `messages` |
| `t(key, params?)` | يجلب نصًا واحدًا ويملأ العناصر النائبة فيه |

## useAkariLocales

```ts
import { useAkariLocales } from "@theme";

const { locales, homeHref } = useAkariLocales();
```

| ما تُرجعه | الوصف |
| --- | --- |
| `locales` | قائمة اللغات، وكل عنصر فيها `{ key, label, lang, href, current }`؛ و`href` هو الرابط الذي يُفتح عند التبديل إلى تلك اللغة. تكون مصفوفة فارغة عندما يحتوي الموقع على لغة واحدة فقط |
| `homeHref` | رابط الصفحة الرئيسية للغة الحالية، مع إضافة `base` |

لا تستدعِ الدالتين إلا في المكوّنات الموجودة داخل التخطيط.

## دوال حزم اللغات

كلها مُصدَّرة من مدخل السمة (`import { … } from "@theme"`)، ويمكن استدعاؤها في أي مكان.

| المُصدَّر | الوصف |
| --- | --- |
| `AKARI_LANGUAGES` | حزم اللغات المدمجة |
| `resolveLanguage(lang, languages?)` | الحزمة التي تنتهي إليها اللغة: تُرجع `{ code, dir, fonts, messages, markdown }`، مع ملء الناقص وفق القواعد السابقة. و`languages` هي حزم الموقع الخاصة |
| `defineAkariLanguage(language)` | مساعد للأنواع لكتابة حزمة لغة |

## اللغات في البحث

تتلقى خدمة البحث المسجّلة في وسيطها الثاني `lang` (مثل `zh-CN`) و`locale` (مفتاح لغة VitePress، و`root` للغة الجذرية)؛ راجع [البحث](/ar-SA/theme/search/api#registered-backends).
