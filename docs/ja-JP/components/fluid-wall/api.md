---
tab: API
---

# 流動背景壁：API

`AkariFluidWall` は `@m3e/web` の要素ではなくテーマ自身のコンポーネントです。`--md-sys-color-*` と `--md-sys-motion-*` を読むため、配色と動きの設定に追従します。色は WebGL2 のフラグメントシェーダで計算し、uniform として渡すので、配色を変えても同じ場を塗り直すだけで、プログラムは作り直しません。

## AkariFluidWall

| 属性 | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `height` | `string` | `clamp(220px, 34vh, 380px)` | 任意の CSS 長さ |
| `variant` | `string` | `"silk"` | `silk`、`aurora`、`mesh`、`nebula`、`blossom`。不明な値は `silk` |
| `light` | `"start" \| "center" \| "end"` | `"end"` | 仮想光源の位置。周辺減光の向きも決める |
| `placement` | `"start" \| "center" \| "end"` | `"start"` | スロット内容の横位置。ベールも同じ向きに回る |
| `texture` | `string` | `variant` による | `none`、`sakura`、`petals`、`stars`、`lace`、`vine`、`dots` |
| `texture-size` | `number \| string` | `texture` による | 重ね模様のタイル辺、px。80–640 に挟む |
| `texture-density` | `number \| string` | `texture` による | 密度の倍率。0–3 に挟む |
| `vine-density` | `number \| string` | `0.7` | 蔦の密度倍率。0.2〜2 に収められる。値が小さいほど蔦が少なくなる。 |
| `texture-opacity` | `number \| string` | `variant` による | 0–1。実際の透明度は模様ごとの重みも掛ける |
| `texture-tone` | `"auto" \| "ink" \| "light"` | `"auto"` | 線画か塗りか。`auto` は明暗で決める |
| `texture-color` | `string` | — | 任意の CSS カラー。`texture-tone` を上書きし、オーバーレイとつるの両方に適用されます。alpha はオーバーレイのみに作用します。 |
| `vine-colors` | `Partial<Record<"base" \| "leaf" \| "leafStem" \| "flower" \| "flowerStem" \| "bud" \| "fill" \| "tint" \| "halo" \| "edge" \| "fine", string>>` | — | つるの部位ごとの色。値に alpha を含められます。`base` は個別指定のない部位のベース色で、それ以外の未指定部位は `texture-color` に従います。 |
| `vine-blend` | `"normal" \| "multiply" \| "screen" \| "overlay" \| "soft-light" \| "difference"` | `"normal"` | つると流体背景の合成モード（CSS `mix-blend-mode`）。 |
| `vine-popout-blend` | `"normal" \| "multiply" \| "screen" \| "overlay" \| "soft-light" \| "difference"` | `vine-blend` | はみ出しつる専用の合成モード。明示的に設定され `vine-blend` と異なる場合のみ別キャンバスを使用します。 |
| `vine-popout-colors` | `Partial<Record<"base" \| "leaf" \| "leafStem" \| "flower" \| "flowerStem" \| "bud" \| "fill" \| "tint" \| "halo" \| "edge" \| "fine", string>>` | — | 出屏点を越えた出屏部分の部位カラー。 |
| `speed` | `number \| string` | `variant` による | 流速の倍率。1 がバリエーション本来の速さ |
| `scale` | `number \| string` | `variant` による | ノイズの尺度。大きいほど皺が細かい |
| `curl` | `number \| string` | `variant` による | 巻きの強さ。0 は向きのない流れ |
| `warp` | `number \| string` | `variant` による | 二次歪みの引っ張り距離。小さいほど静か |
| `tone` | `number \| string` | `variant` による | 0 が設計上の対比、1 でページの地色まで淡くなる |
| `grid` | `number \| string` | `variant` による | グリッドの間隔、px。0 で描かない |
| `glow` | `number \| string` | `variant` による | ポインタに追う柔光の強さ。0 で切る |
| `petal` | `number \| string` | `variant` による | 皺が花びらの腕に巻く度合い。0 は純粋な流れ |
| `popout` | `boolean \| "auto"` | `"auto"` | 蔓が枠を越えるか。`auto` はページ側の設定に従う |
| `inward` | `boolean \| "auto"` | `"auto"` | 蔓が板の中を拱くか。`auto` は `popout` と同じ |
| `safe-zone` | `boolean \| string \| string[]` | `"auto"` | 蔓が避ける領域。`auto` は壁上の文字を避ける |
| `outside-safe-zone` | `boolean \| string \| string[]` | `"none"` | 壁外セーフゾーン。出屏するつるが避ける壁外の矩形。`safe-zone` と同じ指定方法で、負の値は壁の外側へ広がります。 |
| `wall-vines-in-safe-zone` | `boolean` | `true` | 壁内のつるが `safe-zone` に入れるか。`false` のとき壁内のつるは避け、出屏のつるは常に避ける。 |
| `ripple` | `number` | `1` | 出屏点の波紋の強さ。0 で無効。 |
| `ripple-speed` | `number` | `1` | 波紋の速度倍率。 |
| `ripple-size` | `number` | `1` | 波紋の半径倍率。 |
| `ripple-rings` | `number \| string` | `2.2` | 波紋の半径内の輪数、0.5～6 |
| `ripple-sway` | `number \| string` | `1` | 波紋が蔦を押す振幅の倍率、0～3 |
| `vine-glow` | `number \| string` | `1` | 蔦にかかるポインタ光の強さ、0～2；0 で無効 |
| `shadow` | `number` | `1` | 出屏の影の濃さの倍率。0 で無効。 |
| `shadow-size` | `number` | `1` | 出屏の影の大きさの倍率。 |
| `shadow-color` | `string` | 蔦の塗りを暗くした色 | 影の色。 |
| `shadow-angle` | `number` | `303.5` | 影の方向（度）。0 が +x、90 が +y。 |
| `shadow-blur` | `number` | `6` | 影のぼかし半径（CSS ピクセル）。0 で硬い輪郭。 |
| `wall-shadow` | `number` | `1` | 壁内の影の濃さの倍率。 |
| `wall-shadow-size` | `number` | `1` | 壁内の影の大きさの倍率。 |
| `wall-shadow-color` | `string` | `つるの塗り色から生成` | 壁内の影の色。 |
| `wall-shadow-angle` | `number` | `180` | 壁内の影の、落ち影に対する方向オフセット（度）。 |
| `wall-shadow-blur` | `number` | `6` | 壁内の影のぼかし半径（CSS ピクセル）。0 で硬い輪郭。 |
| `underlay-color` | `string` | `#ffffff` | 藤蔓の下地に重ねるグローの色。 |
| `underlay-opacity` | `number` | `0.18` | グローの不透明度（0–1）。 |
| `underlay-blend` | `string` | `additive` | 下地グローの合成モード：`additive`、`screen`、`normal`、`multiply`、`subtractive`。 |
| `mote` | `number` | `1` | 粒子数の倍率（0–3）。0 で粒子を無効化。 |
| `mote-color` | `string` | 花の色 | 粒子の色。任意の CSS 色。 |
| `mote-blend` | `string` | `auto` | 粒子の混合モード：`auto`、`normal`、`additive`、`multiply`、`subtractive`。 |

数値属性は `"1.2"` のような CSS 文字列も受け取り、内部で `fluidNumber` により挟まれます。解析できない値はバリエーションの値に戻ります。

| スロット | 内容 |
| --- | --- |
| 既定 | 中央の列。横位置は `placement` に従う |
| `top` | 右上に固定するバッジ |
| `bottom` | 左下に固定する注記 |

| CSS クラス | 位置 |
| --- | --- |
| `.akari-fluid-wall` | 根。`data-placement` が揃えを表す |
| `.akari-fluid-wall__canvas` | WebGL2 のキャンバス。最初のフレームの後に淡く現れる |
| `.akari-fluid-wall__grid`、`__grid-lit` | グリッドと、ポインタで点灯する複製 |
| `.akari-fluid-wall__texture`、`__texture-pattern`、`__texture-lit` | 重ね模様とその点灯層 |
| `.akari-fluid-wall__ribbons`、`__ribbon-lace`、`__ribbon-scallop` | レース帯の層、模様、扇縁 |
| `.akari-fluid-wall__vine-canvas` | 蔓のキャンバス |
| `.akari-fluid-wall__veil` | スロット文字の下に敷くグラデーション |
| `.akari-fluid-wall__body`、`__block` | スロットの容器と一つの塊 |

## エクスポート

幾何と調色の論理は `fluid.ts` にあり、コンポーネントと一緒にテーマの入口から出ています。

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

| 名前 | 説明 |
| --- | --- |
| `FLUID_VARIANTS`、`FLUID_VARIANT_SPECS` | 五つのバリエーション名と、それぞれの完全な値の組 |
| `FLUID_TEXTURES`、`FLUID_TEXTURE_SIZES`、`FLUID_TEXTURE_WEIGHTS` | 七つの重ね模様、タイル寸法、重み |
| `resolveFluid(variant, overrides)` | 表を下地に明示値を重ね、夾んで `FluidVariantSpec` を返す |
| `fluidVariant(v)`、`fluidTexture(v)` | 任意の入力を合法な列挙に寄せ、不明なら `silk` / `none` |
| `fluidTextureTone(tone, scheme)` | `auto` を `ink` か `light` に解く |
| `fluidNumber(value, min, max, fallback)` | 挟みと既定値。数値属性はすべてここを通る |
| `fluidPalette(tokens, scheme, tone, accent)` | 九つの色トークンと二つの調整値から `FluidPalette` を出す |
| `mixFluid(from, to, amount)` | GLSL の `mix` と同じ意味の線形補間 |
| `FLUID_LOOPS`、`fluidLoopOffset`、`fluidLoopOffsets` | 四本の閉じた漂流の周期と位相 |
| `fluidRenderSize`、`FLUID_MAX_DPR` | キャンバス解像度と 1.1M 画素の予算 |
| `buildFluidRibbons(w, h, seed, count)` | レース帯の幾何。端点、曲線、幅、法線軸。同じ seed で再現 |
| `ribbonLacePitch(width)` | レースのピッチ、`max(26, width × 1.45)` |
| `ribbonLacePath(ribbon)` | 花、環、対の点、切れ込みの珠を円弧の子経路で描く |
| `ribbonScallopPath(ribbon, side)` | 片側の扇縁 |
| `ribbonScallopAmplitude(ribbon)` | その帯の扇縁の振幅 |
| `ribbonEdgePath`、`ribbonBandPath` | 片側の折れ線と閉じた帯の輪郭 |
| `FluidPalette`、`FluidTokens`、`FluidRibbon`、`FluidVariantSpec` | 各層の型 |

## アクセシビリティ

- 背景層は `aria-hidden`、キャンバスはアクセシビリティツリーに入りません。読み上げはスロットの内容だけです。
- キーボードとポインタを取りません。`pointer-events: none` はキャンバスと模様の層だけで、スロット内のボタンはそのまま使えます。
- `prefers-reduced-motion` が有効なら最初のフレームだけ描いて止まります。閃きも漂流もありません。
- 明色と暗色はそれぞれ配色と退避グラデーションを持ち、周辺減光・発光・粒子の強さを分けています。明色に切り替えても加算光で白飛びしません。

## その他

- 重ね模様は静的で、流れに乗って動きません。動かすにはシェーダを変える必要があります。
- `lace` はマウントのたびに種を振り直すため、再読み込みで帯の位置が変わります。固定の種は属性として公開していません。
- 外部画像に依存しません。模様もレースも実行時に生成するインライン SVG と経路で、追加の通信はありません。
