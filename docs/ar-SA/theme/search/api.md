---
tab: API
---

# البحث: API

## search

| الحقل | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | ما إذا كان يُعرض مدخل البحث ويُسجَّل الاختصار |
| `placeholder` | `string` | بحسب اللغة، «ابحث في التوثيق» | النص التوضيحي في مربع البحث |
| `shortcut` | `string` | `"k"` | المفتاح الذي يُضغط مع `⌘` / `Ctrl`؛ والسلسلة الفارغة توقف الاختصار |
| `maxResults` | `number` | `8` | أقصى عدد للنتائج، محصور بين 1 و20 |
| `debounce` | `number` | `180` | تأخير الإدخال (debounce) بالمللي ثانية، محصور بين 0 و1000 |
| `backend` | `AkariSearchBackendConfig` | الفهرس المحلي | `local` أو `http` أو `registered` |

يمكن وضع `search` في تهيئة اللغة، لإعطاء كل لغة خدمة البحث الخاصة بها.

## SearchDock

يسجّل القالب `<SearchDock>` عالميًا. ضعه في الصفحة حيث يجب أن يهبط حقل البحث؛ لا حاجة إلى استيراد. يعرض إطارًا محجوزًا، وتطير النسخة الثابتة من مشغّل شريط التطبيق فوقه وتأخذ خصائصه.

```md
<SearchDock variant="hero" align="center" placeholder="ابحث في الدليل" />
```

| الخاصية | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `placeholder` | `string` | `search.placeholder` | النص التوضيحي عند الإرساء هنا |
| `variant` | `"bar" \| "pill" \| "icon" \| "hero"` | `"bar"` | مظهر الحقل |
| `align` | `"start" \| "center" \| "end"` | `"start"` | محاذاة الأيقونة والنص والاختصار داخل الحقل |
| `width` | `string \| number` | عرض المظهر | طول CSS أو عرض بالبكسل للإطار المحجوز |
| `height` | `string \| number` | ارتفاع المظهر | طول CSS أو ارتفاع بالبكسل للإطار المحجوز |
| `fill` | `boolean` | `false` | ملء الإطار الأب بدل الحجم الطبيعي للمظهر |
| `immersive` | `boolean` | `false` | الكتابة والبحث مباشرة داخل الحقل دون فتح مربع الحوار |
| `showShortcut` | `boolean` | `true` | إظهار تلميح الاختصار في الحقل المرسى |
| `background` | `string` | سطح النمط | لون CSS لسطح حقل البحث |
| `borderColor` | `string` | حدود النمط | لون CSS لحدود حقل البحث |
| `shadow` | `boolean` | `true` | الإبقاء على ظل الارتفاع؛ `false` يزيله |
| `elevation` | `number` | مستوى النمط | مستوى ارتفاع MD3 من 0 إلى 5؛ `0` يزيل الظل |
| `priority` | `number` | `0` | يتقدّم على وسوم الصفحة نفسها |

`bar` حقل شريط التطبيق، و`pill` حقل نغمي، و`icon` زر عائم دائري، و`hero` حقل نغمي كبير. يقبل `width` و`height` طول CSS (`"20rem"`، `"min(100%, 30rem)"`) أو رقمًا بالبكسل؛ وبدونهما يُستخدم الإطار الطبيعي للمظهر. أضف `fill` لملء الإطار الأب (`width: 100%; height: 100%`)؛ ويحتاج الأب إلى عرض وارتفاع محدّدين، ولا يزال `width` / `height` الصريحان يتقدّمان على أحد المحورين.

يحوّل `immersive` الحقل المرسى إلى حقل إدخال: عند النقر عليه يتم التركيز وتظهر قائمة نتائج مختصرة بجانبه (فوقه أو تحته حسب المساحة)، دون فتح مربع حوار. ويظل الاختصار يفتح البحث الكامل. ويتوسّع النمط `icon` إلى حقل إدخال مصغّر في هذا الوضع.

يقبل الوسم أيضًا الفتحة الافتراضية، وتُوضع داخل الإطار المحجوز خلف الحقل. وهو موسوم بـ `aria-hidden`؛ أما زر الحقل نفسه فهو الذي يفتح البحث.

يمكن أن توجد عدة وسوم في الصفحة. يفوز الأعلى `priority`، وعند التساوي أول وسم مسجّل، وتُتجاهل الإطارات ذات الحجم الصفري أو المخفية. ويجب أن يكون الوسم كاملًا داخل منطقة الصفحة وإطار العرض، وخاليًا من شريط التطبيق وشريط التبويبات؛ وإلا بقي الحقل في الشريط حتى يوفّر التمرير مساحة للوسم. اترك وسمًا واحدًا في الصفحة: عند إزالة الصفحة يعود الحقل إلى الشريط ويتلاشى؛ وعند الانتقال بين صفحات فيها وسوم يتحرك بين إطاراتها. التحميل المباشر الأول يضعه دون انتقال. تأتي كل المدد من رموز نابض MD3 في السمة، فتتبع إعداد «قياسي / تعبيري» و`prefers-reduced-motion`.

`<AkariSearchDock>` اسم بديل للمكوّن نفسه.

## خدمة البحث المحلية

```ts
backend: { type: "local" },
```

تستخدم هذه الخدمة الفهرس الذي يبنيه البحث المحلي في VitePress (`provider: "local"`): فهرس لكل لغة، يُحمَّل بحسب مفتاح اللغة في VitePress (`root` للغة الجذرية). وعندما تستخدم أي لغة الخدمة المحلية، يفعّلها `akariContent` في تهيئة الموقع ويجعل الفهرس يحتفظ بنص كل قسم، لأجل المقتطفات في النتائج:

```ts
// تهيئة الموقع التي يولّدها akariContent
themeConfig: {
  search: {
    provider: "local",
    options: { miniSearch: { options: { storeFields: ["title", "titles", "text"] } } },
  },
},
```

كل قسم مستند واحد في الفهرس: `id` هو مسار الصفحة مضافًا إليه مرساة العنوان، و`title` عنوان القسم، و`titles` العناوين التي فوقه (عنوان الصفحة أولًا)، و`text` نص متنه دون وسوم. والقسم الواقع تحت عنوان الصفحة من المستوى الأول يمثّل الصفحة نفسها، وتشير نتيجته إلى أعلى الصفحة.

إذا لم يضبط `.vitepress/config.mts` أي `themeConfig`، فإن `...content.site` يحمل هذا الإعداد معه؛ وإن ضبطه فادمج `content.site.themeConfig` فيه.

## خدمة HTTP

```ts
backend: {
  type: "http",
  endpoint: "/api/docs/search",
  method: "POST",
  headers: { Authorization: "Bearer YOUR_TOKEN" },
  credentials: "include",
  queryParam: "q",
  limitParam: "limit",
},
```

| الحقل | النوع | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `endpoint` | `string` | مطلوب | رابط نقطة النهاية؛ تُضاف `base` إلى المسارات النسبية، وتبقى الروابط المطلقة كما هي |
| `method` | `"GET" \| "POST"` | `"GET"` | `GET` يضع الاستعلام في معاملات الاستعلام؛ و`POST` يرسل JSON: `{ "q": "keyword", "limit": 8 }` |
| `headers` | `Record<string, string>` | `{}` | ترويسات الطلب |
| `credentials` | `RequestCredentials` | `"same-origin"` | ما إذا كانت تُرسل ملفات تعريف الارتباط |
| `queryParam` | `string` | `"q"` | اسم معامل الاستعلام |
| `limitParam` | `string` | `"limit"` | اسم معامل الحد الأقصى للنتائج |

يمكن أن تكون الاستجابة مصفوفة من النتائج أو `{ "results": [...] }`. تقرأ السمة هذه الحقول من كل نتيجة: `title`؛ و`href` (أو `url` أو `path`)؛ و`pageTitle`؛ و`heading`؛ و`excerpt` (أو `content` أو `snippet` أو `description`)؛ و`id`.

```json
{
  "results": [
    {
      "id": "button-variants",
      "title": "التنويعات",
      "pageTitle": "الأزرار",
      "heading": "التنويعات",
      "href": "/ar-SA/components/button.html#variants",
      "excerpt": "خمسة أنماط تعبّر عن درجة التأكيد من الأعلى إلى الأدنى…"
    }
  ]
}
```

الاستجابة التي ليست 2xx، أو خطأ الشبكة، أو الاستجابة ذات البنية غير الصالحة، تعرض خطأً وزر إعادة المحاولة.

## الخدمات المسجّلة {#registered-backends}

سجّل دالة في مدخل السمة، ثم أشِر إلى معرّفها في التهيئة:

```ts
// docs/.vitepress/theme/index.ts
import { registerSearchBackend } from "./search/registry";

registerSearchBackend("my-search", async (query, { limit, signal, lang }) => {
  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&lang=${lang}`,
    { signal },
  );
  if (!response.ok) throw new Error("Search failed");
  const data = await response.json();
  return data.results.slice(0, limit);
});
```

```ts
// docs/config.ts
search: { backend: { type: "registered", id: "my-search" } },
```

```ts
function registerSearchBackend(id: string, handler: AkariSearchHandler): void;

type AkariSearchHandler = (
  query: string,
  context: AkariSearchContext,
) => AkariSearchResult[] | Promise<AkariSearchResult[]>;

interface AkariSearchContext {
  limit: number;
  signal?: AbortSignal;   // يُلغى عند كتابة استعلام جديد أو إغلاق اللوحة
  lang?: string;          // اللغة الحالية، مثل "zh-CN"
  locale?: string;        // مفتاح لغة VitePress، و"root" للغة الجذرية
}
```

إذا أشارت التهيئة إلى معرّف غير مسجّل، تعرض اللوحة خطأً واضحًا.

## AkariSearchResult

| الحقل | النوع | الوصف |
| --- | --- | --- |
| `id` | `string` | معرّف فريد |
| `title` | `string` | عنوان النتيجة |
| `href` | `string` | الرابط؛ الروابط الداخلية تستخدم التنقل بأسلوب SPA، والروابط الخارجية تُفتح في علامة تبويب جديدة |
| `pageTitle` | `string` | عنوان الصفحة التي تنتمي إليها، ويظهر فوق النتيجة |
| `heading` | `string` | القسم الذي تنتمي إليه |
| `excerpt` | `string` | المقتطف؛ وتُبرز الكلمات المطابقة |

يُعرض كل النص على أنه نص عادي.

## useAkariSearch

```ts
import { useAkariSearch } from "@theme";

const { isOpen, query, results, loading, error, openSearch, closeSearch } =
  useAkariSearch();
```

لمدخل بحث خاص بك: `openSearch()` يفتح اللوحة، و`query` و`results` و`loading` و`error` هي حالة اللوحة. لا تستدعِها إلا في المكوّنات الموجودة داخل التخطيط.
