---
icon: radio_button_checked
order: 1
tab: 概要
parallel:
  - api
---

# ボタン

`m3e-button` は操作を実行します。`m3e-icon-button` はアイコンだけのコンパクトなボタンです。どちらもバリアント、サイズ、シェイプ、無効状態、リンク、選択に対応しています。

## バリアント

5 つのバリアントは、それぞれ異なる強調の度合いを表します。

<div class="demo-row">
  <m3e-button variant="elevated">Elevated</m3e-button>
  <m3e-button variant="filled">Filled</m3e-button>
  <m3e-button variant="tonal">Tonal</m3e-button>
  <m3e-button variant="outlined">Outlined</m3e-button>
  <m3e-button variant="text">Text</m3e-button>
</div>

```html
<m3e-button variant="elevated">Elevated</m3e-button>
<m3e-button variant="filled">Filled</m3e-button>
<m3e-button variant="tonal">Tonal</m3e-button>
<m3e-button variant="outlined">Outlined</m3e-button>
<m3e-button variant="text">Text</m3e-button>
```

- `filled`：ページで最も重要な操作。通常、1 つの領域に 1 つだけ置きます。
- `tonal`：副次的な操作。`filled` より控えめです。
- `outlined`：はっきりした境界は必要だが、強い強調は必要ない操作。
- `text`：ツールバーやカードのフッターにある、強調の低い操作。
- `elevated`：浮き上がって見せたい主要な操作。カードやサーフェスとよく合います。

## サイズとシェイプ

サイズは `extra-small` から `extra-large` まであります。デフォルトは `small` です。

<div class="demo-row">
  <m3e-button variant="tonal" size="extra-small">Extra Small</m3e-button>
  <m3e-button variant="tonal" size="small">Small</m3e-button>
  <m3e-button variant="tonal" size="medium">Medium</m3e-button>
  <m3e-button variant="tonal" size="large">Large</m3e-button>
  <m3e-button variant="tonal" size="extra-large">Extra Large</m3e-button>
</div>

```html
<m3e-button variant="tonal" size="extra-small">Extra Small</m3e-button>
<m3e-button variant="tonal" size="small">Small</m3e-button>
<m3e-button variant="tonal" size="medium">Medium</m3e-button>
<m3e-button variant="tonal" size="large">Large</m3e-button>
<m3e-button variant="tonal" size="extra-large">Extra Large</m3e-button>
```

デフォルトのシェイプは `rounded` です。`shape="square"` を設定すると四角になります。

<div class="demo-row">
  <m3e-button variant="filled" shape="square">Square Filled</m3e-button>
  <m3e-button variant="outlined" shape="square">Square Outlined</m3e-button>
  <m3e-button variant="text" shape="square">Square Text</m3e-button>
</div>

```html
<m3e-button variant="filled" shape="square">Square Filled</m3e-button>
<m3e-button variant="outlined" shape="square">Square Outlined</m3e-button>
<m3e-button variant="text" shape="square">Square Text</m3e-button>
```

見た目のサイズにかかわらず、ボタンは少なくとも 48×48dp のタッチターゲットを保ちます。

## アイコン

`icon` スロットはテキストの前に、`trailing-icon` スロットはテキストの後ろに置かれます。

<div class="demo-row">
  <m3e-button variant="filled">
    <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
    作成を始める
  </m3e-button>
  <m3e-button variant="tonal">
    設定をコピー
    <m3e-icon slot="trailing-icon" name="content_copy"></m3e-icon>
  </m3e-button>
  <m3e-button variant="outlined">
    次へ
    <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
  </m3e-button>
</div>

```html
<m3e-button variant="filled">
  <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
  作成を始める
</m3e-button>
<m3e-button variant="tonal">
  設定をコピー
  <m3e-icon slot="trailing-icon" name="content_copy"></m3e-icon>
</m3e-button>
<m3e-button variant="outlined">
  次へ
  <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
</m3e-button>
```

アイコンはデフォルトで支援技術から隠され、ボタンのアクセシブルな名前は表示されているテキストから取られます。アイコンだけのボタンには `aria-label` が必要です。

## アイコンボタン

アイコンボタンには `standard`、`filled`、`tonal`、`outlined`、`elevated` の 5 つのバリアントがあります。テキストがないため、ツールチップで何をするボタンかを示します。

<div class="demo-row">
  <m3e-icon-button id="button-demo-back" aria-label="戻る">
    <m3e-icon name="arrow_back"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-back">戻る</m3e-tooltip>

  <m3e-icon-button id="button-demo-settings" aria-label="設定" variant="tonal">
    <m3e-icon name="settings"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-settings">設定</m3e-tooltip>

  <m3e-icon-button id="button-demo-close" aria-label="閉じる" variant="outlined">
    <m3e-icon name="close"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-close">閉じる</m3e-tooltip>

  <m3e-icon-button id="button-demo-confirm" aria-label="確認" variant="filled">
    <m3e-icon name="check"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-confirm">確認</m3e-tooltip>
</div>

```html
<m3e-icon-button id="button-demo-settings" aria-label="設定" variant="tonal">
  <m3e-icon name="settings"></m3e-icon>
</m3e-icon-button>
<m3e-tooltip for="button-demo-settings">設定</m3e-tooltip>
```

各ツールチップの `for` は一意の `id` を指します。1 つのページで `id` が重複すると、ツールチップが間違った場所に表示されたり、最初の要素でしか動作しなかったりします。

## 無効なボタンとリンクボタン

デフォルトでは、無効なボタンはキーボードのフォーカスを受け取れません。`disabled-interactive` を使うとフォーカス可能なままになり、ユーザーはその操作の存在に気づけます。

<div class="demo-row">
  <m3e-button variant="filled" disabled>無効</m3e-button>
  <m3e-button variant="filled" disabled-interactive>無効だがフォーカス可能</m3e-button>
  <m3e-button variant="tonal" href="https://m3.material.io/" target="_blank" rel="noreferrer">
    Material 3 を開く
    <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
  </m3e-button>
  <m3e-button variant="outlined" href="/ja-JP/components/card.html">
    カードを見る
    <m3e-icon slot="trailing-icon" name="chevron_right"></m3e-icon>
  </m3e-button>
</div>

```html
<m3e-button variant="filled" disabled>無効</m3e-button>
<m3e-button variant="filled" disabled-interactive>無効だがフォーカス可能</m3e-button>
<m3e-button
  variant="tonal"
  href="https://m3.material.io/"
  target="_blank"
  rel="noreferrer"
>
  Material 3 を開く
  <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
</m3e-button>
<m3e-button variant="outlined" href="/ja-JP/components/card.html">
  カードを見る
  <m3e-icon slot="trailing-icon" name="chevron_right"></m3e-icon>
</m3e-button>
```

`href` を設定すると、ボタンはリンクのセマンティクスで描画され、`target`、`rel`、`download` に対応します。テーマはサイト内のリンクを引き継ぎ、ページ内で切り替えます。`target="_self"` のときはページ全体を読み込み、`target="_blank"` のときは新しいタブで開きます。スクリプトからナビゲーションする必要がある場合は、`useRouter().go()` を呼び出してください。[ナビゲーション](/ja-JP/components/navigation) を参照してください。

## 選択状態

`toggle` を付けるとボタンは 2 状態のトグルになり、`selected` で初期状態を設定します。

<div class="demo-row">
  <m3e-button variant="filled" toggle selected>
    <m3e-icon slot="icon" name="check"></m3e-icon>
    選択済み
  </m3e-button>
  <m3e-button variant="tonal" toggle>トグル</m3e-button>
  <m3e-button variant="outlined" toggle>
    <m3e-icon slot="icon" name="close"></m3e-icon>
    <m3e-icon slot="selected-icon" name="check"></m3e-icon>
    フォロー
    <span slot="selected">フォロー中</span>
  </m3e-button>
</div>

```html
<m3e-button variant="filled" toggle selected>
  <m3e-icon slot="icon" name="check"></m3e-icon>
  選択済み
</m3e-button>
<m3e-button variant="tonal" toggle>トグル</m3e-button>
<m3e-button variant="outlined" toggle>
  <m3e-icon slot="icon" name="close"></m3e-icon>
  <m3e-icon slot="selected-icon" name="check"></m3e-icon>
  フォロー
  <span slot="selected">フォロー中</span>
</m3e-button>
```

ボタンが選択されると、`m3e-icon` は自動で塗りつぶしのグリフに切り替わります。`selected-icon` と `selected` のスロットで、アイコンとテキストを置き換えることもできます。切り替え時には `beforeinput`、`input`、`change` のイベントが発生し、`beforeinput` でキャンセルできます。

## アクセシビリティのヒント

- アイコンだけのボタンには `aria-label` を設定し、`m3e-tooltip` を添えます。
- ツールチップの対象の `id` は、ページ内で一意にします。
- 無効な操作をユーザーに知らせる必要がある場合は、`disabled-interactive` を使い、使えない理由を説明します。
- リンクボタンには `href` を使います。普通のボタンにルーティングの処理を結び付けると、リンクのセマンティクスが失われます。
- 主要な操作には `filled` を使い、同じ視覚的な領域に強調の高いボタンを複数置かないようにします。

すべての属性、スロット、イベントは [API](/ja-JP/components/button/api) を参照してください。
