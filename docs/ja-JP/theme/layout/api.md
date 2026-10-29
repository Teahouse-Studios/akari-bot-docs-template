---
tab: API
---

# レイアウトとアプリバー：API

## appBar

| フィールド | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `title` | `string` | サイトの `title` | アプリバーに表示するサイト名 |
| `version` | `string` | なし | 名前の横に表示するバージョンラベル。たとえば `v1.0.0` |
| `logo` | `string` | 設定の `logo` | ブランドの画像。サイト内のパスには `base` が自動で付きます |
| `showSidebarToggle` | `boolean` | `true` | 狭い画面でナビゲーションドロワーを開くメニューボタンを表示するかどうか |
| `showSettingsToggle` | `boolean` | `true` | 設定ボタンを表示するかどうか。`settings.enabled` が `false` のときは常に非表示 |
| `socialLinks` | `AkariSocialLink[]` | `[]` | ソーシャルリンク。新しいタブで開きます |

`AkariSocialLink` のフィールド：

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `icon` | `string` | `github` と `npm` は組み込みのブランドマークを表示します。それ以外の値は登録済みの m3e アイコンの名前として使われます |
| `link` | `string` | URL |
| `label` | `string` | ボタンのアクセシブルな名前とツールチップのテキスト。「その他」メニューでのテキストにもなります |

## toc

| フィールド | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | 目次（右側の目次と、狭い画面の目次ボタン）を表示するかどうか |
| `maxDepth` | `number` | `3` | `h2` から `h{maxDepth}` までを一覧にします。1–6 の範囲に収められます |
| `overline` | `string` | 言語による。「このページの内容」 | 目次の上部の小さな見出しで、目次のナビゲーションのアクセシブルな名前にもなります |

1 つのページだけ目次をオフにするには、そのページのフロントマターに `toc: false` と書きます。`m3e-toc-ignore` 属性を持つ見出しは目次から除外されます。

## loadingBar

| フィールド | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | ページの読み込み中に、ウィンドウの上端に進行状況バーを表示するかどうか |

## footer

| フィールド | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `message` | `string` | 言語による | フッターのロゴとサイト名の下のテキスト |
| `copyright` | `string` | `""` | フッター下部の著作権表示。空のときは表示されません |
| `showPrevNext` | `boolean` | `true` | 並列ページのコンテンツの末尾に、グループ内の前のページ・次のページのカードを表示するかどうか |
| `links` | `AkariFooterLinkGroup[] \| false` | ナビゲーションから生成 | フッターのリンクの列。デフォルトではナビゲーションの最初の 4 つのカテゴリで、1 列あたり最大 6 項目。`false` で非表示 |

```ts
footer: {
  links: [
    {
      title: "リソース",
      items: [
        { text: "GitHub", link: "https://github.com/OasisAkari/vitepress-theme-akari-docs" },
        { text: "変更履歴", link: "/changelog" },
      ],
    },
  ],
},
```

外部リンクは新しいタブで開きます。並列ページのグループは、リンクの列では 1 つの項目になります。

## CSS 変数 {#css-variables}

サイトのスタイルで、たとえば `:root` で上書きします。

| 変数 | デフォルト | 用途 |
| --- | --- | --- |
| `--akari-doc-radius` | `28px` | ドキュメントサーフェスとフッターのサーフェスの角の半径 |
| `--akari-doc-padding` | `32px` | サーフェスのパディング、およびコンテンツと目次の間隔 |
| `--akari-doc-top-space` | `32px` | ドキュメントサーフェスとアプリバーの距離 |
| `--akari-doc-max-width` | `1280px` | サーフェス内のコンテンツと目次の最大幅。フッターの内容も同じ幅を使います |
| `--akari-doc-text-measure` | `760px` | 段落、リスト、引用、コールアウトの 1 行の最大長 |
| `--akari-doc-text-offset` | `22px` | 見出しに対する段落の字下げ量 |
| `--akari-doc-toc-offset` | `128px` | 目次がアプリバーからどれだけ下に留まるか |
| `--akari-toc-width` | `208px` | 目次の幅 |
| `--akari-doc-gap` | `16px` | アンカーへのジャンプ後の見出しとアプリバーの距離 |
| `--akari-doc-surface-color` | `--md-sys-color-surface` | ドキュメントサーフェスとフッターのサーフェスの背景色。カラートークンが解決されるよう、`m3e-theme` の内側（たとえば `.akari-main`）で設定します |
| `--akari-doc-divider-strength` | `30%` | レールの区切り線と、スクロール後のサーフェスの輪郭線の強さ |
| `--akari-wavy-divider-color` | `--md-sys-color-outline-variant` | フッターの上の波線の区切り線の色 |
| `--akari-doc-app-bar-height` | `64px` | アプリバーの高さ。読み取り専用で、追従位置の計算に使われます |
| `--akari-doc-rail-width` | `96px` | レールの幅。読み取り専用 |
| `--akari-loading-bar-height` | `4px` | ローディングバーの高さ |
| `--akari-loading-bar-color` | `--md-sys-color-primary` | ローディングバーの色 |

```css
:root {
  --akari-doc-radius: 24px;
  --akari-doc-max-width: 1440px;
}

.akari-main {
  --akari-doc-surface-color: var(--md-sys-color-surface-container-lowest);
}
```

## ページの状態

| マーカー | 場所 | 意味 |
| --- | --- | --- |
| `data-akari-ready` | `html` | m3e コンポーネントの登録が完了した |
| `data-akari-scrolled` | `html` | ドキュメントサーフェスがアプリバーの下にスクロールした |
| `akari-tabs-pinned` | `html` のクラス名 | 並列ページのタブバーがアプリバーの下に留まっている |
| `data-akari-page-title` | 要素 | アプリバーのタイトルの切り替えが追うページタイトル。デフォルトではコンテンツの `h1` またはヒーロー内のタイトル |

| 要素の id | 内容 |
| --- | --- |
| `akari-doc-content` | コンテンツコンテナ。目次はここから見出しを読み取ります。エクスポートされている `AKARI_CONTENT_ID` |
| `akari-sidebar` | モバイルのナビゲーションドロワー。`AKARI_SIDEBAR_ID` |
| `akari-settings` | 設定パネル。`AKARI_SETTINGS_ID` |

## コンポーネントの置き換え

アプリバー、デスクトップのナビゲーション、モバイルのドロワー、ヒーロー、目次、ページ送りカード、フッター、コンテンツコンテナを置き換えられます。[テーマの拡張](/ja-JP/theme/extending/api#provideakaricomponents)を参照してください。
