---
icon: text_fields
order: 3
tab: 概要
parallel:
  - api
---

# タイポグラフィ

ラテン文字には Roboto、中国語には Noto Sans SC（Source Han Sans SC）を使います。日本語、韓国語、アラビア語のページでは Noto Sans JP、Noto Sans KR、Noto Sans Arabic を使います。いずれも可変ウェイトのフォントで、設定で変更したり Google Fonts をオフにしたりできます。本文の基本サイズは 16px、行の高さは 1.65 です。見出し、本文、コード、テーブルはすべて `rem` でサイズを指定しているため、設定で文字サイズを変えると、読む領域全体が比例して拡大・縮小します。

## 見出しのレベル

各ページには第 1 レベルの見出しがちょうど 1 つあり、それがページのタイトルです。セクションには第 2 レベル、サブセクションには第 3 レベル、さらに細かい説明には第 4 レベルの見出しを使います。

| レベル | 用途 | スタイル |
| --- | --- | --- |
| 第 1 レベル | ページのタイトル | display-large、57px、ウェイト 400 |
| 第 2 レベル | セクション。目次に表示 | headline-medium、28px、ウェイト 500 |
| 第 3 レベル | サブセクション。目次に表示 | headline-small、24px、ウェイト 500 |
| 第 4 レベル | 詳細な説明 | 20px、ウェイト 500 |

見出しのレベルは連続させてください。レベルを飛ばしたり、見出しの代わりに太字の段落を使ったりしないでください。

### 第 3 レベルの見出しの例

第 3 レベルの見出しは、セクションを読み取りやすい部分に分けます。各部分では 1 つのことを扱います。

#### 第 4 レベルの見出しの例

第 4 レベルの見出しは、エッジケース、バージョンによる違い、パラメーターの詳細などの補足に向いています。

## 本文

- 段落は 3〜5 行程度に収めます。長い段落はリストや小見出しに分けます。
- コマンド、フィールド名、タグ名にはインラインコードを使います。たとえば `npm run build`、`appBar.title`、`m3e-card` です。
- リンクのテキストにはリンク先を書きます。たとえば [インストールと動作要件](/ja-JP/getting-started/installation) です。「ここをクリック」とは書かないでください。
- 強調のための太字は控えめに使います。段落全体を太字にしないでください。

> 引用は、仕様や公式の情報源から取った結論に使います。本文の引用と注意書きのブロックには、コードブロックと同じ薄いパターンが入ります。

<small>補足のテキストには、小さめのサイズと `on-surface-variant` の色を使います。</small>

## コンポーネント内の見出し

`m3e-heading` には display、headline、title、label の 4 つの見た目があり、ドキュメントの見出しと組み合わせて使えます。次の見出しにはすべて `m3e-toc-ignore` が付いているため、目次には含まれません。

<div class="demo-stack">
  <m3e-heading m3e-toc-ignore variant="display" size="large" level="2">Display Large</m3e-heading>
  <m3e-heading m3e-toc-ignore variant="headline" size="medium" level="3">Headline Medium</m3e-heading>
  <m3e-heading m3e-toc-ignore variant="title" size="large" level="4">Title Large</m3e-heading>
  <m3e-heading m3e-toc-ignore variant="label" size="large" level="5">Label Large</m3e-heading>
</div>

`level` は支援技術が読み上げる見出しのレベルを設定します。`variant` と `size` は見た目だけを変えます。

## 文字サイズ

文字サイズの設定には 3 つの段階があり、ルート要素のフォントサイズを設定します。

| オプション | ルートのサイズ | 向いている用途 |
| --- | --- | --- |
| 100% | `16px` | デフォルトの読みやすいサイズ |
| 150% | `24px` | 弱視の方や、離れた場所から読む場合 |
| 200% | `32px` | デモやアクセシビリティのチェック |

フォント、本文の要素のスタイル、タイポグラフィのトークンは [API](/ja-JP/styles/typography/api) を参照してください。
