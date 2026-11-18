---
tab: API
---

# الجدار السائل: API

`AkariFluidWall` مكوّن يخص السمة لا `@m3e/web`، فلا يوجد عنصر `m3e-` خلفه. يقرأ رموز `--md-sys-color-*` و`--md-sys-motion-*`، ولهذا يتبع اللوحة اللونية وإعدادات الحركة. يُحسب اللون في تظليل WebGL2 ويُمرَّر كـ uniforms، فتغيير اللوحة يعيد طلاء المجال نفسه دون بناء البرنامج من جديد.

## AkariFluidWall

| السمة | النوع | الافتراضي | الوصف |
| --- | --- | --- | --- |
| `height` | `string` | `clamp(220px, 34vh, 380px)` | أي طول CSS |
| `variant` | `string` | `"silk"` | `silk` أو `aurora` أو `mesh` أو `nebula` أو `blossom`؛ القيمة المجهولة ترجع إلى `silk` |
| `light` | `"start" \| "center" \| "end"` | `"end"` | موضع الضوء الافتراضي، ويوجّه تظليل الحواف |
| `placement` | `"start" \| "center" \| "end"` | `"start"` | موضع محتوى الفتحة أفقياً، ويدور الحجاب معه |
| `texture` | `string` | حسب `variant` | `none` أو `sakura` أو `petals` أو `stars` أو `lace` أو `vine` أو `dots` |
| `texture-size` | `number \| string` | حسب `texture` | حافة بلاطة النقش بالبكسل، محصورة بين 80 و640 |
| `texture-density` | `number \| string` | حسب `texture` | مضاعف الكثافة، محصور بين 0 و3 |
| `texture-opacity` | `number \| string` | حسب `variant` | من 0 إلى 1، والشفافية النهائية تضرب وزن النقش أيضاً |
| `texture-tone` | `"auto" \| "ink" \| "light"` | `"auto"` | خطوط أو ملء؛ و`auto` يتبع الفاتح والداكن |
| `texture-color` | `string` | — | أي لون CSS؛ يتجاوز `texture-tone` ويُطبق على النسيج والكرمة. يُطبق alpha على النسيج فقط. |
| `vine-colors` | `Partial<Record<"base" \| "leaf" \| "leafStem" \| "flower" \| "flowerStem" \| "bud" \| "fill" \| "tint" \| "halo" \| "edge" \| "fine", string>>` | — | ألوان أجزاء الكرمة؛ يمكن أن تحتوي القيم على alpha. يحدد `base` لون الأجزاء غير المحددة، والأجزاء الأخرى تتبع `texture-color`. |
| `vine-blend` | `"normal" \| "multiply" \| "screen" \| "overlay" \| "soft-light" \| "difference"` | `"normal"` | وضع الدمج بين الكرمة والتدفق (قيمة CSS `mix-blend-mode`). |
| `vine-popout-blend` | `"normal" \| "multiply" \| "screen" \| "overlay" \| "soft-light" \| "difference"` | `vine-blend` | وضع دمج البراعم بعد خروجها من الجدار؛ تُستخدم لوحة منفصلة عندما يختلف عن `vine-blend`. |
| `vine-popout-colors` | `Partial<Record<"base" \| "leaf" \| "leafStem" \| "flower" \| "flowerStem" \| "bud" \| "fill" \| "tint" \| "halo" \| "edge" \| "fine", string>>` | — | ألوان أجزاء البراعم بعد خروجها من الجدار. |
| `speed` | `number \| string` | حسب `variant` | مضاعف سرعة التدفق، و1 سرعة النمط نفسه |
| `scale` | `number \| string` | حسب `variant` | مقياس أخذ الضجيج، والأكبر أدق طيّاً |
| `curl` | `number \| string` | حسب `variant` | شدة الالتفاف، و0 تدفق بلا اتجاه |
| `warp` | `number \| string` | حسب `variant` | مسافة سحب التشويه الثاني، والأصغر أهدأ |
| `tone` | `number \| string` | حسب `variant` | 0 التباين المصمم، و1 يغسل الجدار إلى لون الصفحة |
| `grid` | `number \| string` | حسب `variant` | خطوة الشبكة بالبكسل، و0 بلا شبكة |
| `glow` | `number \| string` | حسب `variant` | شدة الضوء الذي يتبع المؤشر، و0 يطفئه |
| `petal` | `number \| string` | حسب `variant` | مقدار التفاف الطيّات إلى أذرع بتلات، و0 تدفق صافٍ |
| `popout` | `boolean \| "auto"` | `"auto"` | هل تخرج السيقان من الإطار؛ و`auto` يتبع إعداد الصفحة |
| `inward` | `boolean \| "auto"` | `"auto"` | هل تقوس السيقان داخل اللوحة؛ و`auto` مثل `popout` |
| `safe-zone` | `boolean \| string \| string[]` | `"auto"` | مناطق تتجنبها السيقان؛ و`auto` يتجنب نص الجدار |
| `outside-safe-zone` | `boolean \| string \| string[]` | `"none"` | مناطق آمنة خارج الجدار: مستطيلات تتجنبها البراعم الخارجة. تستخدم نفس صيغة `safe-zone`، والقيم السالبة تمتد خارج الجدار. |
| `ripple` | `number` | `1` | قوة التموج عند نقاط خروج البراعم؛ 0 يوقفها. |
| `ripple-speed` | `number` | `1` | مضاعف سرعة التموج. |
| `ripple-size` | `number` | `1` | مضاعف نصف قطر التموج. |
| `ripple-rings` | `number \| string` | `2.2` | عدد الحلقات داخل نصف قطر التموج، 0.5–6 |
| `ripple-sway` | `number \| string` | `1` | مقدار دفع التموج للكرمة، 0–3 |
| `vine-glow` | `number \| string` | `1` | شدة توهج المؤشر على الكرمة، 0–2؛ 0 يطفئه |
| `shadow` | `number` | `1` | مضاعف شدة ظل البراعم؛ 0 يوقفها. |
| `shadow-size` | `number` | `1` | مضاعف حجم الظل. |
| `shadow-color` | `string` | تعبئة داكنة | لون الظل. |
| `shadow-angle` | `number` | `303.5` | اتجاه الظل بالدرجات؛ 0 = +x و90 = +y. |
| `shadow-blur` | `number` | `6` | نصف قطر ضبابية الظل بوحدات بكسل CSS؛ 0 يحافظ على حافة حادة. |
| `wall-shadow` | `number` | `1` | مضاعف شفافية ظل الجدار. |
| `wall-shadow-size` | `number` | `1` | مضاعف حجم ظل الجدار. |
| `wall-shadow-color` | `string` | `مشتق من لون تعبئة الكرمة` | لون ظل الجدار. |
| `wall-shadow-angle` | `number` | `180` | إزاحة اتجاه ظل الجدار عن الظل المسقط، بالدرجات. |
| `wall-shadow-blur` | `number` | `6` | نصف قطر ضبابية ظل الجدار بوحدات بكسل CSS؛ 0 يحافظ على حافة حادة. |
| `underlay-color` | `string` | `#ffffff` | لون الطبقة السفلية تحت تعبئة الكرمة. |
| `underlay-opacity` | `number` | `0.18` | عتامة الطبقة السفلية من 0 إلى 1. |
| `underlay-blend` | `string` | `additive` | وضع مزج الطبقة السفلية: `additive`، `screen`، `normal`، `multiply`، `subtractive`. |
| `mote` | `number` | `1` | مضاعف عدد الجسيمات من 0 إلى 3؛ 0 يعطّل الجسيمات. |
| `mote-color` | `string` | لون الزهرة | لون الجسيمات، أي لون CSS. |
| `mote-blend` | `string` | `auto` | وضع مزج الجسيمات: `auto` و`normal` و`additive` و`multiply` و`subtractive`. |

تقبل السمات الرقمية نصوص CSS مثل `"1.2"` و`"72"` وتُقص عبر `fluidNumber`، والقيمة غير المقروءة ترجع إلى قيمة النمط.

| الفتحة | المحتوى |
| --- | --- |
| الافتراضية | عمود في الوسط، ومحاذاته الأفقية حسب `placement` |
| `top` | شارة مثبتة أعلى اليمين |
| `bottom` | حاشية مثبتة أسفل اليسار |

| صنف CSS | الموضع |
| --- | --- |
| `.akari-fluid-wall` | الجذر، و`data-placement` يبيّن المحاذاة |
| `.akari-fluid-wall__canvas` | لوحة WebGL2، تظهر بعد الإطار الأول |
| `.akari-fluid-wall__grid` و`__grid-lit` | الشبكة ونسختها المضاءة بالمؤشر |
| `.akari-fluid-wall__texture` و`__texture-pattern` و`__texture-lit` | النقش وطبقته ونسخته المضاءة |
| `.akari-fluid-wall__ribbons` و`__ribbon-lace` و`__ribbon-scallop` | طبقة أشرطة الدانتيل وزخارفها وحوافها المسنّنة |
| `.akari-fluid-wall__vine-canvas` | لوحة السيقان |
| `.akari-fluid-wall__veil` | التدرّج تحت نص الفتحات |
| `.akari-fluid-wall__body` و`__block` | حاوية الفتحات وكتلة واحدة |

## الصادرات

تعيش الهندسة والتلوين في `fluid.ts` وتُصدَّر مع المكوّن من مدخل السمة:

```ts
import {
  AkariFluidWall,
  FLUID_VARIANTS,
  FLUID_VARIANT_SPECS,
  FLUID_TEXTURES,
  FLUID_TEXTURE_SIZES,
  FLUID_TEXTURE_WEIGHTS,
  resolveFluid,
  fluidVariant,
  fluidTexture,
  fluidTextureTone,
  fluidNumber,
  fluidPalette,
  mixFluid,
  FLUID_LOOPS,
  fluidLoopOffset,
  fluidLoopOffsets,
  fluidRenderSize,
  FLUID_MAX_DPR,
  buildFluidRibbons,
  ribbonLacePitch,
  ribbonLacePath,
  ribbonScallopPath,
  ribbonScallopAmplitude,
  ribbonEdgePath,
  ribbonBandPath,
} from "vitepress-akari-theme-docs";
```

| الاسم | الوصف |
| --- | --- |
| `FLUID_VARIANTS` و`FLUID_VARIANT_SPECS` | أسماء الأنماط الخمسة ومجموعة قيم كل منها |
| `FLUID_TEXTURES` و`FLUID_TEXTURE_SIZES` و`FLUID_TEXTURE_WEIGHTS` | الأنماط السبعة وأحجام بلاطاتها وأوزانها |
| `resolveFluid(variant, overrides)` | الجدول أساساً ثم القيم الصريحة ثم القص إلى `FluidVariantSpec` |
| `fluidVariant(v)` و`fluidTexture(v)` | يحصران أي إدخال في تعداد صالح، وإلا `silk` أو `none` |
| `fluidTextureTone(tone, scheme)` | يحل `auto` إلى `ink` أو `light` |
| `fluidNumber(value, min, max, fallback)` | القص والرجوع، وكل سمة رقمية تمر به |
| `fluidPalette(tokens, scheme, tone, accent)` | تسعة رموز لونية وقرصان ينتجان `FluidPalette` |
| `mixFluid(from, to, amount)` | استكمال خطي بمنطق `mix` في GLSL |
| `FLUID_LOOPS` و`fluidLoopOffset` و`fluidLoopOffsets` | دورات الانجرافات الأربعة المغلقة وأطوارها |
| `fluidRenderSize` و`FLUID_MAX_DPR` | دقة اللوحة وميزانية 1.1 مليون بكسل |
| `buildFluidRibbons(w, h, seed, count)` | هندسة الأشرطة: الطرفان والمنحنى والعرض والمحور العمودي، ونفس seed يعيد نفس المجموعة |
| `ribbonLacePitch(width)` | خطوة الدانتيل، `max(26, width × 1.45)` |
| `ribbonLacePath(ribbon)` | زهرات وأحلقات وأزواج نقاط وخرز الفرجات كمسارات أقواس |
| `ribbonScallopPath(ribbon, side)` | حافة مسنّنة واحدة |
| `ribbonScallopAmplitude(ribbon)` | سعة التسنين لتلك الحافة |
| `ribbonEdgePath` و`ribbonBandPath` | خط متعدد لجهة واحدة والمحيط المغلق للشريط |
| `FluidPalette` و`FluidTokens` و`FluidRibbon` و`FluidVariantSpec` | أنواع كل طبقة |

## إمكانية الوصول

- طبقات الخلفية `aria-hidden` واللوحة خارج شجرة الوصول، فلا يقرأ قارئ الشاشة إلا محتوى الفتحات.
- لا يلتقط لوحة المفاتيح ولا المؤشر: `pointer-events: none` على اللوحة وطبقات النقش فقط، فتبقى أزرار الفتحات عاملة.
- مع «تقليل الحركة» يرسم الإطار الأول ثم يتوقف، فلا وميض ولا انجراف.
- للفاتح والداكن لوحة وتدرّج احتياطي مستقلان، مع ضبط الحواف والتوهج والحبيبات لكل منهما، فلا يحترق الفاتح بالضوء الجمعي.

## ملاحظات

- الأنماط ساكنة ولا تتحرك مع التدفق؛ تحريكها يتطلب تغيير التظليل.
- `lace` يسحب بذرة جديدة عند كل تركيب، فتتغير مواضع الأشرطة عند إعادة التحميل، ولا يعرض المكوّن بذرة ثابتة.
- لا اعتماد على صور خارجية: النقوش والدانتيل SVG مضمّنة ومسارات تُبنى وقت التشغيل، بلا طلبات إضافية.
