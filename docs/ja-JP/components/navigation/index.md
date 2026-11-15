---
icon: language
order: 3
badge: New
tab: 概要
parallel:
  - api
---

# ナビゲーション

ナビゲーション用の m3e コンポーネントは 3 つのグループに分かれます。`m3e-nav-menu` は複数階層のページを整理し、`m3e-tabs` は 1 つのページ内でビューを切り替え、チップとバッジは状態やフィルターを示します。

## サイドナビゲーション

`m3e-nav-menu` は複数階層のナビゲーションを保持します。`m3e-nav-menu-item` は `label`、`icon`、`badge` のスロットで内容を配置します。`open` でグループを展開し、`selected` で現在の末端の項目をハイライトします。

<div class="demo-surface" style="max-width: 320px; max-block-size: 320px;">
  <m3e-nav-menu aria-label="コンポーネントのナビゲーションのデモ">
    <m3e-nav-menu-item open>
      <m3e-icon slot="icon" name="widgets"></m3e-icon>
      <span slot="label">コンポーネント</span>
      <m3e-nav-menu-item>
        <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
        <a slot="label" href="/ja-JP/components/button.html">ボタン</a>
      </m3e-nav-menu-item>
      <m3e-nav-menu-item selected>
        <m3e-icon slot="icon" name="language"></m3e-icon>
        <a slot="label" href="/ja-JP/components/navigation.html">ナビゲーション</a>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
    <m3e-nav-menu-item>
      <m3e-icon slot="icon" name="dashboard"></m3e-icon>
      <a slot="label" href="/ja-JP/components/card.html">カード</a>
      <span slot="badge">New</span>
    </m3e-nav-menu-item>
  </m3e-nav-menu>
</div>

```html
<m3e-nav-menu aria-label="コンポーネントのナビゲーションのデモ">
  <m3e-nav-menu-item open>
    <m3e-icon slot="icon" name="widgets"></m3e-icon>
    <span slot="label">コンポーネント</span>
    <m3e-nav-menu-item selected>
      <m3e-icon slot="icon" name="language"></m3e-icon>
      <a slot="label" href="/ja-JP/components/navigation.html">ナビゲーション</a>
    </m3e-nav-menu-item>
  </m3e-nav-menu-item>
  <m3e-nav-menu-item>
    <m3e-icon slot="icon" name="dashboard"></m3e-icon>
    <a slot="label" href="/ja-JP/components/card.html">カード</a>
    <span slot="badge">New</span>
  </m3e-nav-menu-item>
</m3e-nav-menu>
```

`open` はグループを展開するかどうかを制御します。実行時には、子の項目の選択状態に応じてコンポーネント自身が管理することもできます。`disabled` はその項目とすべての子を無効にします。デフォルトでは、高さが制限されているとメニューはその内部でスクロールします。

## タブ {#tabs}

`m3e-tabs` の直接の子にできるのは `m3e-tab` と `m3e-tab-panel` だけです。各 `m3e-tab` の `for` は対応するパネルの `id` を指し、`selected` を持てるタブは 1 つだけです。

<m3e-tabs variant="primary">
  <m3e-tab selected for="nav-demo-panel-overview">
    <m3e-icon slot="icon" name="home"></m3e-icon>
    概要
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-button">
    <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
    ボタン
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-card">
    <m3e-icon slot="icon" name="dashboard"></m3e-icon>
    カード
  </m3e-tab>
  <m3e-tab-panel id="nav-demo-panel-overview">
    概要のパネル：コンポーネントの用途、バリアント、使い方のヒント。
  </m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-button">
    ボタンのパネル：<code>m3e-button</code> の 5 つのバリアントと <code>m3e-icon-button</code>。
  </m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-card">
    カードのパネル：<code>m3e-card</code> のスロット、バリアント、操作可能モード。
  </m3e-tab-panel>
</m3e-tabs>

```html
<m3e-tabs variant="primary">
  <m3e-tab selected for="nav-demo-panel-overview">
    <m3e-icon slot="icon" name="home"></m3e-icon>
    概要
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-button">
    <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
    ボタン
  </m3e-tab>
  <m3e-tab-panel id="nav-demo-panel-overview">概要のパネルの内容。</m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-button">ボタンのパネルの内容。</m3e-tab-panel>
</m3e-tabs>
```

`variant="primary"` はプライマリのタブのスタイルです（デフォルトは `secondary`）。`stretch` を付けると、タブが同じ幅になってコンテナを埋めます。タブが多い場合は、横スクロールやページ送りを許可してください。テキストが読めなくなるまで詰め込まないでください。

## チップとフィルター

`m3e-chip` は操作できないチップで、カテゴリ、状態、技術スタックを示すのに使います。チップを `.demo-row` で囲んで間隔を調整します。

<div class="demo-row">
  <m3e-chip>
    <m3e-icon slot="icon" name="palette"></m3e-icon>
    テーマ
  </m3e-chip>
  <m3e-chip>
    <m3e-icon slot="icon" name="layers"></m3e-icon>
    コンポーネント
  </m3e-chip>
  <m3e-chip variant="elevated">
    <m3e-icon slot="icon" name="check"></m3e-icon>
    有効
  </m3e-chip>
</div>

```html
<div class="demo-row">
  <m3e-chip>
    <m3e-icon slot="icon" name="palette"></m3e-icon>
    テーマ
  </m3e-chip>
  <m3e-chip>
    <m3e-icon slot="icon" name="layers"></m3e-icon>
    コンポーネント
  </m3e-chip>
  <m3e-chip variant="elevated">
    <m3e-icon slot="icon" name="check"></m3e-icon>
    有効
  </m3e-chip>
</div>
```

ユーザーがコンテンツを絞り込む必要がある場合は、操作できるフィルターチップを使います。

<m3e-filter-chip-set aria-label="ドキュメントの絞り込み">
  <m3e-filter-chip selected value="all">すべて</m3e-filter-chip>
  <m3e-filter-chip value="theme">テーマ</m3e-filter-chip>
  <m3e-filter-chip value="style">スタイル</m3e-filter-chip>
  <m3e-filter-chip value="component">コンポーネント</m3e-filter-chip>
</m3e-filter-chip-set>

```html
<m3e-filter-chip-set aria-label="ドキュメントの絞り込み">
  <m3e-filter-chip selected value="all">すべて</m3e-filter-chip>
  <m3e-filter-chip value="theme">テーマ</m3e-filter-chip>
  <m3e-filter-chip value="style">スタイル</m3e-filter-chip>
  <m3e-filter-chip value="component">コンポーネント</m3e-filter-chip>
</m3e-filter-chip-set>
```

フィルターチップは独自の選択状態とキーボード操作を持ちます。`selected` で初期値を設定し、クリックすると変更のイベントが発生します。操作できない `m3e-chip` とは意味が異なるため、両者を混在させないでください。

## バッジ

バッジは単独で数を表示することも、`for` でボタンやアイコンに固定することもできます。

<div class="demo-row">
  <m3e-badge size="small">3</m3e-badge>
  <m3e-badge size="medium">12</m3e-badge>
  <m3e-badge size="large">99+</m3e-badge>
  <m3e-button id="navigation-demo-update" variant="outlined">更新</m3e-button>
  <m3e-badge for="navigation-demo-update" position="above-after">4</m3e-badge>
</div>

```html
<m3e-badge size="small">3</m3e-badge>
<m3e-badge size="medium">12</m3e-badge>
<m3e-badge size="large">99+</m3e-badge>
<m3e-button id="navigation-demo-update" variant="outlined">更新</m3e-button>
<m3e-badge for="navigation-demo-update" position="above-after">4</m3e-badge>
```

固定したバッジは対象の要素のレイアウトの変化に追従し、`position` で位置を設定します。バッジにはデフォルトの ARIA ロールがありません。操作できる要素に付けるときは、`aria-describedby` または対応する表示テキストで数を説明してください。

## SPA ナビゲーション {#spa-navigation}

サイドバーとフッターの内部リンクは、実際の `<a>` 要素として描画します。VitePress 2 はキャプチャフェーズで内部のクリックを捕捉し、SPA のナビゲーションを行います。VitePress 2 では vue-router と `RouterLink` が削除されているため、それらをインポートしたり、古い例に従ったりしないでください。

```vue
<a
  v-if="item.link && !isExternalLink(item.link)"
  slot="label"
  :href="withBase(item.link)"
  :aria-current="isActive(item.link) ? 'page' : undefined"
>
  {{ item.text }}
</a>
<a
  v-else-if="item.link"
  slot="label"
  :href="item.link"
  target="_blank"
  rel="noreferrer"
>
  {{ item.text }}
</a>
```

`withBase` は `vitepress` から取り込み、内部パスにデプロイ先のベースを付加します。通常の左クリックは VitePress のコアが引き継ぎますが、中クリックで新しいタブで開く操作、リンクのコピー、アクセシビリティのセマンティクスはすべてそのまま機能します。外部リンクはネイティブの動作を保ち、`target="_blank"` と `rel="noreferrer"` が付きます。

スクリプトからナビゲーションする必要がある場合は、`useRouter().go()` を使います。

```ts
import { useRouter, withBase } from "vitepress";

const router = useRouter();

function navigate(event: MouseEvent, link: string): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
    return;
  }

  event.preventDefault();
  void router.go(withBase(link));
}
```

m3e のボタンやアイコンボタンの内部に生成されるアンカーはテーマが引き継ぎ、サイト内のリンクはページ内で切り替えます。`target="_self"` のときはページ全体を読み込み、`target="_blank"` のときは新しいタブで開きます。リンクではない要素でクリックを模す場合にだけ、ホスト要素でクリックを監視して `router.go()` を呼び出してください。このページの静的なデモは普通の `<a>` 要素を使っているので、内部のクリックは VitePress が処理し、外部リンクは引き続きページ全体を読み込みます。どの方法を使う場合でも、`div` とクリックハンドラーでリンクを偽装したり、内部ナビゲーションから実際の `href` を取り除いたりしないでください。

## アクセシビリティ

- メニューのルートに `aria-label` を設定し、それがドキュメントのナビゲーションのランドマークであることを明確にします。
- 現在のメニュー項目には `selected` を付けます。コンポーネントが `aria-current` を出力します。
- タブは `for` でパネルの `id` に関連付け、`selected` にできるタブは 1 つだけです。
- フィルターチップには表示テキストを残します。色だけで選択状態を示さないでください。
- アイコンだけのボタンには `aria-label` とツールチップが必要です。

すべての属性、スロット、イベントは [API](/ja-JP/components/navigation/api) を参照してください。
