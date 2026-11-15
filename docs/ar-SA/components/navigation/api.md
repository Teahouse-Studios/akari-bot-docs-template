---
tab: API
---

# التنقل: API

المحتوى أدناه مأخوذ من البيانات الوصفية لمكونات `@m3e/web` 2.10.3.

## m3e-nav-menu و m3e-nav-menu-item

ليست لـ `m3e-nav-menu` خصائص. ويحتوي منفذه الافتراضي على عناصر `m3e-nav-menu-item`.

| الخاصية | القيم | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `open` | منطقية | `false` | يوسّع العناصر الفرعية |
| `selected` | منطقية | `false` | العنصر الحالي؛ ويحوّله المكون إلى `aria-current` |
| `disabled` | منطقية | `false` | يعطّل هذا العنصر وكل عناصره الفرعية |

| المنفذ | المحتوى |
| --- | --- |
| (الافتراضي) | العناصر الفرعية المتداخلة |
| `label` | النص، وعادةً رابط |
| `icon` | الأيقونة |
| `selected-icon` | الأيقونة عند التحديد |
| `badge` | الشارة |
| `toggle-icon` | أيقونة التوسيع والطي |

| الحدث | متى |
| --- | --- |
| `opening`، `opened`، `closing`، `closed` | بدء التوسيع والطي وانتهاؤهما |
| `click` | عند النقر |

## m3e-tabs و m3e-tab و m3e-tab-panel

| خاصية `m3e-tabs` | القيم | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `variant` | `primary`، `secondary` | `secondary` | المظهر |
| `stretch` | منطقية | `false` | تحصل التبويبات على عروض متساوية وتملأ الحاوية |
| `header-position` | `before`، `after` | `before` | هل يأتي شريط التبويب قبل اللوحات أم بعدها |
| `disable-pagination` | منطقية | `false` | يخفي أزرار التصفح بين الصفحات عندما تفيض التبويبات |
| `disable-swipe` | منطقية | `false` | يوقف السحب على اللوحة للتبديل بين التبويبات |
| `previous-page-label`، `next-page-label` | نص | `"Previous page"`، `"Next page"` | اسما زرَّي التصفح بين الصفحات لدى التقنيات المساعدة |

| خاصية `m3e-tab` | القيم | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `for` | معرّف اللوحة | لا يوجد | عنصر `m3e-tab-panel` المطابق |
| `selected` | منطقية | `false` | التبويب الحالي؛ ولا يُسمح إلا بواحد |
| `disabled` | منطقية | `false` | معطّل |

اكتب `m3e-tab` و`m3e-tab-panel` مباشرة داخل `m3e-tabs`، كما في المثال في [نظرة عامة](/ar-SA/components/navigation#tabs). ويستبدل المنفذان `prev-icon` و`next-icon` أيقونتي التصفح بين الصفحات. ويطلق التبديل بين التبويبات `beforeinput` (ويمكن إلغاؤه) و`input` و`change`. ولـ `m3e-tab` أيضًا منفذ `icon`.

## m3e-chip و m3e-filter-chip

| الخاصية | يستخدمها | القيم | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- | --- |
| `variant` | كلاهما | `outlined`، `elevated` | `outlined` | المظهر |
| `value` | كلاهما | نص | لا يوجد | القيمة |
| `selected` | شريحة التصفية | منطقية | `false` | محددة |
| `disabled`، `disabled-interactive` | شريحة التصفية | منطقية | `false` | معطّلة |

لكليهما منفذ افتراضي (النص) بالإضافة إلى المنفذين `icon` و`trailing-icon`. و`m3e-chip` غير تفاعلية. أما `m3e-filter-chip` فتطلق `beforeinput` و`input` و`change` عند تبديلها.

يغلّف `m3e-filter-chip-set` مجموعة من شرائح التصفية: يسمح `multi` بتحديد عدة شرائح، ويكدّسها `vertical` عموديًا، ويخفي `hide-selection-indicator` علامة التحديد، ويعطّل `disabled` المجموعة كلها، و`name` مخصص للنماذج. ويطلق `change` عند تغيّر التحديد.

## m3e-badge

| الخاصية | القيم | القيمة الافتراضية | الوصف |
| --- | --- | --- | --- |
| `size` | `small`، `medium`، `large` | `medium` | الحجم |
| `for` | معرّف عنصر | لا يوجد | يثبّت الشارة على هذا العنصر |
| `position` | `above-after`، `above-before`، `below-before`، `below-after`، `before`، `after`، `above`، `below` | `above-after` | الموضع بالنسبة إلى العنصر عند التثبيت |

ليس للشارة دور ARIA افتراضي. وعندما تربطها بعنصر تفاعلي، صِف العدد باستخدام `aria-describedby` أو بنص مرئي مطابق.

يسجّل الملف `m3e.ts` في السمة هذه المكونات (`@m3e/web/nav-menu`، `@m3e/web/tabs`، `@m3e/web/chips`، `@m3e/web/badge`).
