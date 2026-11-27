---
tab: API
---

# ヒーロー：API

## hero

ページのフロントマターの `hero` です。文字列で書いた場合は画像の URL になります。

| フィールド | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `image` | `string \| { src, alt? } \| { light, dark, alt? }` | 必須 | 画像の URL。サイト内のパスには `base` が自動で付き、外部 URL はそのまま使われます。`{ light, dark }` と書くと、2 つの画像がライトモードとダークモードでそれぞれ使われます |
| `alt` | `string` | `""` | 画像の代替テキスト。純粋に装飾的な画像では空にします |
| `date` | `string \| Date` | なし | タイトルの上に表示されます。`2026-05-19` のような日付はページの言語に合わせて書式化され、`<time datetime="2026-05-19">` として出力されます。それ以外のテキストは書いたとおりに表示されます |
| `tagline` | `string` | ページの `description` | タイトルの下の 1 行の概要 |
| `background` | `string` | `--md-sys-color-primary-container` | 画像カードの背景色。任意の CSS カラーまたはトークン |
| `fit` | `"cover" \| "contain"` | `"cover"` | `cover` はカードを埋め、はみ出す部分を切り取ります。`contain` は余白を付けて画像全体を表示し、背景が透明なイラストに向いています |
| `color` | `string \| false` | 画像から取得（ビルド時） | このページのテーマのシードカラー。`#rrggbb` はその色に固定し、`false` は読者が設定で選んだ色を維持します |
| `pattern` | `"dots" \| "grid" \| "plus" \| "diagonal" \| "waves" \| "none" \| "auto"` | `"auto"` | ページに隠れたパターン：ドット、グリッド、プラス記号、斜線、波線。`none` はパターンを表示せず、`auto` はコンテンツを読み込むたびにランダムに 1 つ選びます |

`pattern` はページ全体に適用されます。ヒーローのカードと、コンテンツ内の背景を持つ要素は同じパターンを使います。ヒーローのないページでもランダムに 1 つ選ばれます。

```yaml
hero:
  image:
    light: /hero/theme-hero.svg
    dark: /hero/theme-hero-dark.svg
    alt: デスクトップのウィンドウとスマートフォンに表示したドキュメントテーマの画面
  date: 2026-10-28
  tagline: フロントマターに画像を書く
  fit: contain
  color: "#6750a4"
  pattern: dots
```

## CSS 変数 {#css-variables}

| 変数 | デフォルト | 用途 |
| --- | --- | --- |
| `--akari-doc-hero-inset` | `8px` | カードとサーフェスの端との距離、および 2 枚のカードの間隔 |
| `--akari-doc-hero-text-color` | `--md-sys-color-surface-container` | テキストカードの背景色 |
| `--akari-doc-hero-media-color` | `--md-sys-color-primary-container` | 画像カードのデフォルトの背景色。`background` が優先されます |
| `--akari-pattern-glow` | `4%` | ポインターの周囲の光の強さ |
| `--akari-pattern-spot` | `0.1` | 光の内側でパターンがどれだけはっきり見えるか |

最初の 3 つは `:root` で設定できます。パターンの 2 つの変数はドキュメントサーフェス `.akari-doc` で定義されているため、`.akari-doc` で上書きしてください。

## ヒーローのコンポーネントを置き換える

ヒーローを独自のコンポーネントに置き換えられます。[テーマの拡張](/ja-JP/theme/extending/api#provideakaricomponents)を参照してください。レイアウトはページが画像付きの `hero` を設定しているときだけこのコンポーネントを描画し、コンテンツの最初の `h1` を非表示にします。そのため、独自のコンポーネントはページのタイトルを自分で描画する必要があります。タイトルに `data-akari-page-title` 属性を付けると、アプリバーのタイトルの切り替えがそれに従います。コンポーネント内では、VitePress の `useData()` でフロントマターを読み取ります。レイアウトはコンポーネントのルート要素に `akari-doc__page` クラスを付けるため、同じ並列ページのグループ内でページを切り替えるとヒーローは本文と一緒に左右にスライドします。ただし、ルート要素が複数あるコンポーネントにはこのクラスが付かず、ヒーローはその場に留まります。
