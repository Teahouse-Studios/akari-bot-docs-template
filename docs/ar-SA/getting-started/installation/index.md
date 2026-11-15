---
icon: package_2
order: 1
---

# التثبيت

السمة Vitepress Theme Akari Docs هي مستودع قالب على GitHub. أنشئ مستودعك الخاص منه لتحصل على الشيفرة المصدرية للسمة والتهيئة وصفحات التوثيق النموذجية؛ لا توجد حزمة سمة منفصلة لتثبيتها.

## إنشاء مستودع من القالب

1. افتح [OasisAkari/vitepress-theme-akari-docs](https://github.com/OasisAkari/vitepress-theme-akari-docs) وانقر **Use this template** ← **Create a new repository**.
2. أدخل اسم المستودع ومستوى ظهوره، ثم أنشئه. يحتوي المستودع الجديد على كل ملفات القالب، ويبدأ سجل الإيداعات فيه من جديد، وليس نسخة متفرعة (fork) من القالب.
3. استنسخه، ثم ثبّت الاعتماديات وشغّل الموقع:

   ```bash
   git clone https://github.com/<account>/<repository>.git
   cd <repository>
   npm install
   npm run dev
   ```

تنشئ أداة GitHub CLI المستودع وتستنسخه في خطوة واحدة:

```bash
gh repo create my-docs --template OasisAkari/vitepress-theme-akari-docs --public --clone
```

## المتطلبات

- Node.js `>=22.12.0` (الحقل `engines` في `package.json`). جرى التحقق من القالب باستخدام Node.js `24.21.0` وnpm `12.2.1`.
- npm. يحتفظ المستودع بملف `package-lock.json` واحد فقط؛ في التكامل المستمر، ثبّت منه باستخدام `npm ci`.

## الأوامر

يعمل خادم التطوير افتراضيًا على `http://localhost:5173`.

| الأمر | الغرض |
| --- | --- |
| `npm run dev` | خادم التطوير. تظهر تغييرات Markdown فورًا، وتغيير `config.ts` يعيد تشغيله تلقائيًا |
| `npm run build` | يبني الموقع الثابت في `docs/.vitepress/dist` |
| `npm run preview` | يعاين نتيجة البناء محليًا |
| `npm run typecheck` | يفحص أنواع السمة والاختبارات باستخدام `vue-tsc --noEmit` |
| `npm test` | يشغّل اختبارات الوحدة في Vitest |

## تحويله إلى موقعك

- اسم الموقع والإصدار وروابط التواصل والتذييل موجودة في `docs/config.ts` وفي `config.ts` الخاص بكل لغة؛ راجع [التهيئة](/ar-SA/getting-started/configuration).
- الشعار هو `docs/public/logo.svg`.
- تحتوي مجلدات اللغات على صفحات توثيق هذا الموقع. احتفظ باللغات التي تحتاج إليها، واحذف المجلدات الأخرى، واكتب صفحاتك في المجلدات المتبقية؛ راجع [كتابة الصفحات](/ar-SA/getting-started/writing).

## الحصول على تحديثات القالب

ليس للمستودع المنشأ من القالب أي ارتباط به، لذا لا تصل تحديثات القالب اللاحقة من تلقاء نفسها. عندما تريدها، أضف القالب مستودعًا بعيدًا (remote) وخذ `docs/.vitepress`، حيث توجد السمة:

```bash
git remote add template https://github.com/OasisAkari/vitepress-theme-akari-docs.git
git fetch template
git checkout template/main -- docs/.vitepress
```

يستبدل هذا المجلد بنسخة القالب، لذا يجب دمج التغييرات التي أجريتها على السمة من جديد. قارن أيضًا الاعتماديات في `package.json`.

## الإصدارات المعتمدة

| الاعتمادية | الإصدار | ملاحظات |
| --- | --- | --- |
| `vitepress` | `2.0.0-alpha.21` | إصدار مثبّت؛ مبني على Vite 8 / Rolldown وVue 3.5 |
| `@m3e/web` | `2.10.3` | مكونات الويب Material 3 Expressive |
| `@m3e/icons` | `1.0.21` | أيقونات Material Symbols، تُسجَّل عند الحاجة |

ما زال VitePress في مرحلة alpha. عند ترقيته، افحص شيفرة السمة وأنواع التهيئة ونتيجة البناء معًا.

## بنية المجلدات

```text
.
├── docs/
│   ├── config.ts                  تهيئة مشتركة بين جميع اللغات
│   ├── en-US/                     الإنجليزية، في جذر الموقع
│   │   ├── config.ts              يتجاوز التهيئة المشتركة
│   │   ├── index.md               الصفحة الرئيسية
│   │   └── getting-started/       فئة في شريط التنقل
│   │       └── installation/
│   │           └── index.md       المقالة /getting-started/installation.html
│   ├── zh-CN/                     الصينية المبسطة، تحت /zh-CN/
│   ├── public/                    الملفات الثابتة
│   └── .vitepress/
│       ├── config.mts             يربط السمة بـ VitePress
│       ├── content/               اللغات والمسارات والتنقل من المجلدات
│       └── theme/                 الشيفرة المصدرية للسمة
├── tests/                         اختبارات الوحدة
└── package.json
```

لمعرفة أين توضع الصفحات والتهيئة، راجع [التهيئة](/ar-SA/getting-started/configuration) و[كتابة الصفحات](/ar-SA/getting-started/writing). ولمعرفة بنية الشيفرة المصدرية للسمة، راجع [توسيع السمة](/ar-SA/theme/extending/api#source-layout).

## النشر {#deployment}

ينتج `npm run build` ملفات ثابتة عادية يمكن لأي استضافة ثابتة تقديمها.

- **مسارات الصفحات**: يعطّل الموقع `cleanUrls`، لذا تنتهي مسارات الصفحات بـ `.html` (`/theme/layout.html`) وتطابق ملفات مخرجات البناء واحدًا لواحد؛ وتقدّمها أي استضافة ثابتة كما هي. وللحصول على مسارات بلا امتداد، اضبط `cleanUrls: true` في `.vitepress/config.mts`. عندها يجب أن تعيد الاستضافة المحاولة بعد إضافة `.html` عندما لا يُعثر على ملف. تفعل GitHub Pages وNetlify وCloudflare Pages ذلك افتراضيًا؛ ويحتاج Vercel إلى `"cleanUrls": true` في `vercel.json`؛ وفي Nginx اكتب `try_files $uri $uri.html $uri/ =404;`.
- **تحت مسار فرعي**: مثل `https://example.com/docs/`، اضبط `base: "/docs/"` في `.vitepress/config.mts`. تُضاف هذه البادئة تلقائيًا إلى المسارات الداخلية في التنقل وقسم الواجهة والشعار وفهرس البحث.
- **فهرس البحث**: يُجمَّع فهرس كل لغة وقت البناء داخل `assets/chunks/` في المخرجات. لا حاجة إلى أي خطوة إضافية.

## الأسئلة الشائعة

### صفحة فارغة، أو مكونات بلا أنماط

تسجّل السمة مكونات m3e في المتصفح، وبعد تسجيلها تضيف `data-akari-ready` إلى `html`. ابدأ بفحص وحدة تحكم المتصفح بحثًا عن أخطاء في تحميل الوحدات. وعندما تكون البرامج النصية معطّلة أو يفشل تحميلها، يظهر المحتوى بصيغة HTML عادية بعد 3 ثوانٍ. يجب أن يدعم المتصفح Custom Elements وShadow DOM ووحدات ES الأصلية.

### لماذا تُسجَّل المكونات في المتصفح فقط

مكونات m3e عناصر مخصصة مبنية بـ Lit. يتطلب تسجيلها `customElements.define`، وهي غير موجودة في Node.js. لذلك تستورد نقطة دخول السمة `m3e.ts` في المتصفح فقط، ولا يُخرج العرض من جهة الخادم سوى وسوم العناصر ومحتوى منافذها. لا تستورد وحدات مكونات `@m3e/web` في شيفرة تعمل على الخادم.

### مكون أو أيقونة جديدة لا تظهر

تُسجَّل المكونات والأيقونات كلاهما عند الحاجة. للمكون، استورد مساره الفرعي في `docs/.vitepress/theme/m3e.ts` (لا تستورد `@m3e/web/all`، فهو يسجّل كل المكونات). وللأيقونة، استوردها في `icons.ts`. الأيقونة غير المسجّلة تظهر فارغة.

### يبلّغ البناء عن مكون Vue غير معروف

يسمح `.vitepress/config.mts` بمرور الوسوم التي تبدأ بـ `m3e-` عبر `vue.template.compilerOptions.isCustomElement`. احتفظ بهذا الإعداد عند إعادة استخدام السمة في مشروع آخر.
