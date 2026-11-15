---
tab: API
---

# タイポグラフィ：API

## 言語ごとのフォント

本文のフォントはページの言語によって決まります。デフォルトは[言語パック](/ja-JP/theme/i18n/api#akarilanguage)の `fonts` から取ります。組み込みの言語パックの値は次のとおりで、[`fonts`](#fonts) ですべて変更できます。

| 言語 | Google Fonts から読み込むもの | フォントスタック |
| --- | --- | --- |
| `ja` | Roboto, Noto Sans JP | Roboto, Noto Sans JP, Hiragino Sans, Hiragino Kaku Gothic ProN, Yu Gothic UI, Yu Gothic, Meiryo, system-ui, sans-serif |
| `ko` | Roboto, Noto Sans KR | Roboto, Noto Sans KR, Apple SD Gothic Neo, Malgun Gothic, system-ui, sans-serif |
| `ar` | Roboto, Noto Sans Arabic | Roboto, Noto Sans Arabic, Geeza Pro, Tahoma, system-ui, sans-serif |
| その他 | Roboto, Noto Sans SC | Roboto, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif |

言語は言語パックの規則で照合されます。まず完全なコード、次に主言語で照合するため、`ja-JP` には `ja` の行が使われます。英語やフランス語のように `fonts` のない言語パックには「その他」の行が使われます。

- これらの Google Fonts はすべて可変ウェイトのフォントです。Noto Sans SC と日本語・韓国語のフォントは Unicode の範囲ごとに分割されているため、ページは使っている文字だけをダウンロードします。
- 各言語は自身のフォントだけを読み込みます。日本語、韓国語、アラビア語のフォントはその言語のページでのみ読み込まれ、その言語に切り替えたときにダウンロードされます。
- フォントはページの表示を妨げません。`<head>` にはプリコネクトと `preload` だけが入ります。スタイルシートはテーマのスクリプトが挿入し、`display=swap` によってまずフォールバックのフォントでテキストを表示します。スクリプトがない場合は `<noscript>` 内のスタイルシートが適用されます。Google Fonts に接続できない場合、テキストはスタックの後ろにあるシステムフォントを使います。
- ページ内でほかの言語として指定された部分（言語ダイアログの言語名など）は、その言語パックのスタックのうち、端末にあるフォントを使います。

## fonts

```ts
fonts?: {
  google?: boolean | string[];
  family?: string[];
};
```

| フィールド | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `google` | `boolean \| string[]` | `true` | Google Fonts から読み込むフォント。`false` では何も読み込まず、読者の端末にあるフォントだけを使います。`true` では上の表にあるその言語のフォントを読み込みます。配列では読み込むフォントを列挙します。各フォントは Google Fonts css2 API の `family` パラメーターの形式で書きます。たとえば `"Noto Sans JP:wght@100..900"` です |
| `family` | `string[]` | 上の表にあるその言語のスタック | 本文の `font-family`。順番に並べ、各文字はその文字を持つ最初のフォントを使います。フォント名は引用符なしで書き、`system-ui` や `sans-serif` などの総称ファミリーはそのまま書きます |

2 つのフィールドは独立しています。別の Google Fonts に切り替えるときは、`family` にも入れてください。共通設定ではすべての言語に適用され、言語設定ではその言語だけに適用されます。

```ts
// docs/config.ts：どの言語も Google Fonts からフォントを読み込まない
export default defineAkariConfig({
  fonts: { google: false },
});
```

```ts
// docs/ja-JP/config.ts：日本語のページで M PLUS 1p を使う
export default defineAkariConfig({
  fonts: {
    google: ["M PLUS 1p:wght@400;500;700"],
    family: ["M PLUS 1p", "Hiragino Sans", "Meiryo", "sans-serif"],
  },
});
```

ある言語のデフォルトのフォントをすべてのサイトで変えるには、その言語パックの `fonts` を変更します。このサイトだけなら、`fonts` の設定で十分です。

`akariContent` は各言語の言語パックと設定から、フォントスタック（CSS 変数 `--akari-font-family`）、`lang` が付いた部分のフォントのルール、プリロードのタグをその言語のページの `<head>` に書き込みます。そのため、最初の描画から正しいフォントが使われます。言語を切り替えると、テーマがそれらを変更します。コードは `docs/.vitepress/theme/fonts.ts` にあります。`resolveFonts(fonts, defaults, languages)` が設定と言語パックのフォントからスタイルシートの URL と `font-family` を求め、`markedFontRules(languages)` が `lang` の付いた部分のフォントのルールを作り、`fontHead` が `<head>` のタグを作り、`applyFonts` がそれらをページに適用します。`fonts` のない言語パックは `AKARI_DEFAULT_FONTS` を使います。

## タイポグラフィのトークン

m3e は Material 3 のタイポグラフィのトークンを提供しています。各段階には 4 つのプロパティがあります。

```text
--md-sys-typescale-{role}-{size}-font-size
--md-sys-typescale-{role}-{size}-line-height
--md-sys-typescale-{role}-{size}-font-weight
--md-sys-typescale-{role}-{size}-tracking
```

ロールは `display`、`headline`、`title`、`body`、`label`、サイズは `large`、`medium`、`small` です。たとえば次のように使います。

```css
.note {
  font-size: var(--md-sys-typescale-body-medium-font-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}
```

## ドキュメントの見出し

| 要素 | サイズ | 行の高さ | ウェイト | 600px 未満 |
| --- | --- | --- | --- | --- |
| `h1` | 3.5625rem (57px) | 1.12 | 400 | 2.5rem |
| `h2` | 1.75rem (28px) | 1.3 | 500 | 1.5rem |
| `h3` | 1.5rem (24px) | 1.35 | 500 | 1.25rem |
| `h4` | 1.25rem (20px) | 1.4 | 500 | 1.125rem |

第 2 レベルと第 3 レベルの見出しは目次に表示されます。見出しにポインターを重ねるとアンカーリンクが表示されます。アンカーの id は、VitePress が見出しのテキストから生成します。

## テーブル

`akariMarkdown` を有効にすると、Markdown のテーブルは `.akari-table` で囲まれます。

- 枠は `outline-variant` のアウトラインで、角の丸みは 12px です。内側に縦線はなく、行は区切り線で分けられます。
- ヘッダー行は `surface-container` の上に置かれ、`on-surface-variant` の色の `label-large` を使い、折り返しません。セルは `body-medium` を使います。
- ポインターが乗っている行には状態レイヤーが表示されます。幅が広すぎるテーブルは、ドキュメントサーフェスを押し縮めるのではなく、枠の中で横にスクロールします。
- HTML で直接書いた `<table>` には枠が付きません。テーブル自体のスタイルは同じです。

## リンク

- 下線はありません。テキストの前に、文字と同じ大きさのアイコンが付きます。サイト内のリンクには `link`、`target="_blank"` のリンクには `open_in_new` が付きます。アイコンは CSS マスクで描画され、右から左のレイアウトでは左右反転します。
- ポインターを重ねると、リンクにはテキストボタンと同じ状態レイヤーが表示されます。
- アイコンのないリンク：見出しのアンカー（`.header-anchor`）、脚注の記号と戻りリンク、画像を囲むリンク、コンポーネントのスロットに置いたリンク（`slot` 属性を持つもの）。
- 強制カラーモードでは、リンクはシステムのリンクの色を使います。

## パターン {#patterns}

記事内で背景を持つ要素には、ヒーローのカードと同様に、ほとんど見えないパターンが入ります。

| 要素 | セレクター |
| --- | --- |
| コードブロック | `div[class*="language-"]` |
| コードグループのタブ列 | `.vp-code-group .tabs` |
| テーブル | `.akari-table` |
| 注意書きのブロック | `.custom-block` |
| 引用 | `blockquote` |
| デモ領域 | `.demo-surface` |

- ページ全体で 1 つのパターンを共有し、ヒーローの `pattern` で設定します。デフォルトでは、コンテンツを読み込むたびにドット、グリッド、十字、斜線、波からランダムに 1 つ選ばれます。パターンはドキュメントサーフェスの `data-pattern` 属性に書き込まれます。パターンがない場合、この属性はありません。
- 通常時、パターンは要素の上部の末尾側の角にうっすらと見えるだけです。ポインターが要素の上にとどまると、その周りにテーマカラーのごく淡い光が灯ります。光の内側ではパターンが少しはっきりし、縁は段階的にフェードアウトします。ポインターが離れると、光はフェードアウトします。
- 装飾は `::before`（パターン）と `::after`（光）に、コンテンツの下に描画されます。そのため、読む、選択する、クリックするといった操作を妨げません。光は読者がマウスまたはペンでポインティングしている間だけ現れます。テーマはブラウザーが `(hover: hover)` メディアクエリで推測する代わりに、実際のポインターイベントの種類で判断します。そのため、タッチスクリーンを備えたパソコンでもマウスで操作すると光が出ます。タッチスクリーンでは静止したパターンだけが表示され、タップしても光は残りません。システムで「モーションを減らす」がオンのときは、パターンと光はトランジションなしですぐに表示されます。強制カラーモードでは装飾は表示されません。
- `.akari-doc` の `--akari-pattern-glow`（デフォルトは `4%`）と `--akari-pattern-spot`（デフォルトは `0.1`）で強さを調整します。

## コードブロック

- シンタックスハイライトには `github-light` と `github-dark` のテーマを使い、ライトモードとダークモードに合わせて切り替わります。
- コピーボタンは VitePress の `button.copy` です。ツールチップのテキストは言語パックの `markdown.codeCopyButton` から取り、言語設定で上書きできます。
- 600px 未満では、コードブロックの角の丸みが 12px に小さくなります。
