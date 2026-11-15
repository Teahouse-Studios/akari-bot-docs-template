---
tab: API
---

# ページの作成：API

## フロントマター {#frontmatter}

| フィールド | 型 | 使う場所 | 説明 |
| --- | --- | --- | --- |
| `title` | `string` | すべてのページ | ページのタイトル。ナビゲーションでの記事の名前にもなります。デフォルトは最初の h1 見出し、それもなければフォルダー名です |
| `description` | `string` | すべてのページ | ページの説明。`<meta name="description">` に書き込まれ、ヒーローのデフォルトの概要にもなります |
| `icon` | `string` | 記事 | ナビゲーション項目のアイコン。登録済みのアイコンである必要があります |
| `badge` | `string` | 記事 | ナビゲーション項目のバッジ。たとえば `New` |
| `order` | `number` | 記事 | カテゴリ内での位置。小さいほど前になります。`order` のない記事は後ろに置かれ、フォルダー名で並べられます |
| `parallel` | `string[]` | 記事 | 並列ページ。同じフォルダー内のほかの `.md` ファイルのファイル名（`.md` は省略可）で、タブバーの順に記事の後ろに並びます |
| `tab` | `string` | 記事と並列ページ | タブバーでのタイトル。デフォルトはページのタイトルです |
| `category` | `string` | 言語のホームページ | ホームページはデフォルトではナビゲーションに含まれません。カテゴリのフォルダー名を指定するとそのカテゴリに加わり、`order` がなければ先頭になります |
| `hero` | `string \| object` | すべてのページ | ページ上部のヒーロー。フィールドは [ヒーロー](/ja-JP/theme/hero/api) を参照 |
| `toc` | `boolean` | すべてのページ | `false` にすると、右側の目次と、狭い画面での目次ボタンを非表示にします |

記事とは、カテゴリフォルダー内のフォルダーにある `index.md` のことです。VitePress 自身のフロントマターのフィールド（`head` や `titleTemplate` など）も通常どおり使えます。

```yaml
---
title: アイコン
description: テーマで使う Material Symbols のアイコン
icon: interests
order: 2
badge: New
tab: 概要
parallel:
  - choosing
  - using
hero:
  image: /hero/icons-hero.svg
  fit: contain
---
```

## テーブル

標準のパイプ記法です。`akariMarkdown` を有効にすると、各テーブルは M3 のアウトラインの枠線が付いたコンテナで囲まれます。幅が広すぎるテーブルは、枠線の中で横にスクロールします。

```md
| フィールド | 説明 |
| --- | --- |
| `title` | ページのタイトル |
```

HTML で直接書いた `<table>` には外側のコンテナが付きません。テーブル自体のスタイルは同じです。

## 画像 {#images}

```md
![説明](./image.png)
![説明](/hero/image.svg)
![説明](https://example.com/image.png)
```

ページのレンダリング時に、すべての Markdown の画像に `width` と `height` が付きます。ページは読み込み前に画像の領域を確保するため、読み込み後に表示がずれません。画像は引き続き `max-width: 100%` で縮小され、縦横比を保ちます。

| 画像 | サイズを測るもの |
| --- | --- |
| 記事フォルダー内（`./image.png`） | VitePress。ソースファイルの隣にある画像を読み込みます |
| `docs/public` 内（`/hero/image.svg`） | VitePress |
| リモート（`https://…`） | テーマが追加した [markdown-it-image-size](https://github.com/boyum/markdown-it-image-size)。ページのレンダリング時に画像をダウンロードしてサイズを読み取り、URL ごとに 1 週間キャッシュします（`node_modules/markdown-it-image-size/.cache`） |

- `width` か `height` の一方だけを指定したローカル画像は、もう一方が比率に合わせて補われます。両方を指定した画像はそのままです。
- リモート画像のダウンロードに失敗した場合（オフライン、URL の誤りなど）、ターミナルに通知が表示され、画像には幅も高さも付かず、ページは通常どおり生成されます。ダウンロードは同期的に行われるため、新しいリモート画像を含むページをレンダリングするとき、開発サーバーは一時的に止まります。それ以降はキャッシュから直接応答します。
- HTML で直接書いた `<img>` はサイズを測りません。幅と高さは自分で書いてください。
- リモート画像のサイズ測定をオフにしたり、そのキャッシュを調整したりするには `.vitepress/config.mts` を使います。[構成](/ja-JP/getting-started/configuration/api#akarimarkdown) を参照してください。

## リンク

本文のリンクの前には、文字と同じ大きさのアイコンが付きます。内部リンクには `link`、新しいタブで開くリンク（`target="_blank"`。外部リンクを含む）には `open_in_new` が付きます。次のリンクにはアイコンが付きません：見出しのアンカー、画像を囲むリンク、脚注の記号、コンポーネントのスロットに置いたリンク（`slot` 属性を持つもの）。

## カスタムコンテナとコード

VitePress のカスタムコンテナとコードグループには、すべて対応するテーマのスタイルがあります。

````md
::: tip ヒント
補足の説明。
:::

::: warning
注意すべきこと。
:::

::: code-group

```bash [npm]
npm install
```

```bash [pnpm]
pnpm install
```

:::
````

カスタムコンテナは `info`、`tip`、`warning`、`danger`、`details` です。言語を指定したコードブロックには、シンタックスハイライトとコピーボタンが付きます。コピーボタンのテキストと、タイトルのないコンテナのタイトルは言語パックの `markdown` から取り、言語設定で上書きできます。

## デモ用のヘルパークラス

| クラス | 用途 |
| --- | --- |
| `demo-surface` | アウトラインと `surface-container-low` の背景を持つデモ領域。角の半径と余白は 16px |
| `demo-row` | 折り返す横並びの行。間隔は 12px |
| `demo-grid` | カードのグリッド。各列は最小 240px で、狭い画面では 1 列 |
| `demo-stack` | 縦方向の積み重ね。間隔は 16px |

```html
<div class="demo-surface">
  <div class="demo-row">
    <m3e-button variant="filled">OK</m3e-button>
    <m3e-button variant="outlined">キャンセル</m3e-button>
  </div>
</div>
```

## m3e コンポーネント

登録済みの m3e コンポーネントは、Markdown に直接書けます。テーマは `docs/.vitepress/theme/m3e.ts` で次のコンポーネントを登録しています。

`app-bar`、`badge`、`button`、`card`、`checkbox`、`chips`、`content-pane`、`dialog`、`divider`、`drawer-container`、`heading`、`icon`、`icon-button`、`list`、`loading-indicator`、`menu`、`nav-bar`、`nav-menu`、`nav-rail`、`search`、`segmented-button`、`snackbar`、`switch`、`tabs`、`theme`、`tooltip`。

ほかのコンポーネントを使うには、`m3e.ts` でそのサブパスをインポートします。たとえば `import "@m3e/web/slider";` です。

- コンポーネント内の見出しには `<m3e-heading>` を使います。`m3e-toc-ignore` 属性を付けると、目次に含まれません。
- アイコンは `<m3e-icon name="search"></m3e-icon>` のように書きます。アイコンは先に `icons.ts` で登録しておく必要があります。[アイコンの使い方](/ja-JP/styles/icons/using) を参照してください。
- `href` を持つコンポーネント（ボタン、カード、チップ、リスト項目など）がサイト内のページを指している場合、通常のリンクと同じように、ページ全体を再読み込みせずにページが切り替わります。`target="_self"` を指定すると、VitePress の慣例に従ってページ全体を読み込みます。`target="_blank"` は新しいタブで開きます。
