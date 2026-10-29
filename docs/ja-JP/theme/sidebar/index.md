---
icon: view_sidebar
order: 3
tab: 概要
parallel:
  - api
  - details
---

# サイドナビゲーション

デスクトップでは、左側の幅 96px のナビゲーションレールにカテゴリが並び、ナビゲーションドロワーに現在のカテゴリのページが並びます。ウィンドウの幅が 960px より狭いときは、アプリバーのメニューボタンで、すべてのページを含むナビゲーションドロワーを開きます。

## ナビゲーションレールとナビゲーションドロワー

- **レール**：カテゴリごとにアイコンが 1 つあります。現在のページのカテゴリは選択状態で表示され、アイコンが塗りつぶしになります。カテゴリをクリックすると、その最初のページが開きます。レールの下部にはカラーモードボタンがあり、サイトに複数の言語がある場合は言語ボタンもあります。
- **ナビゲーションドロワー**：ウィンドウの幅が 1600px 以上のときは、レールの右側に開いたままになります。960–1599px では、カテゴリにポインターを置くとレールの下からスライドして出てきて、ポインターが離れると戻ります。タッチスクリーンでは、カテゴリをタップすると開閉します。
- **狭い画面**：レールとドロワーは非表示になります。メニューボタンですべてのページを含むナビゲーションドロワーが開き、その最上位のメニューはレールのカテゴリと一致します。カラーモードボタンと言語ボタンはドロワーの下部にあります。

<div class="demo-surface" style="max-width: 320px;">
  <m3e-nav-menu aria-label="サイドナビゲーションのデモ">
    <m3e-nav-menu-item open>
      <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
      <span slot="label">はじめに</span>
      <m3e-nav-menu-item selected>
        <a slot="label" href="/ja-JP/">概要</a>
      </m3e-nav-menu-item>
      <m3e-nav-menu-item>
        <a slot="label" href="/ja-JP/getting-started/installation.html">インストール</a>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
    <m3e-nav-menu-item>
      <m3e-icon slot="icon" name="palette"></m3e-icon>
      <span slot="label">テーマ</span>
      <m3e-nav-menu-item>
        <a slot="label" href="/ja-JP/theme/extending.html">テーマの拡張</a>
        <span slot="badge">拡張</span>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
  </m3e-nav-menu>
</div>

## ナビゲーションの生成元

ナビゲーションは言語フォルダー内のフォルダーから生成されます。各カテゴリフォルダーがレールのカテゴリになり、カテゴリ内の記事フォルダーがそのページになります。名前、アイコン、順序は各記事のフロントマターで設定します。[ページの作成](/ja-JP/getting-started/writing)を参照してください。

カテゴリの名前とアイコンは、設定の `sidebar.categories` に書きます。

```ts
// docs/config.ts
sidebar: {
  categories: {
    "getting-started": { icon: "rocket_launch" },
    theme: { icon: "palette" },
  },
},

// docs/ja-JP/config.ts
sidebar: {
  categories: {
    "getting-started": { text: "はじめに" },
    theme: { text: "テーマ" },
  },
},
```

設定の `sidebar.items` で、ナビゲーション全体を手書きすることもできます。[API](/ja-JP/theme/sidebar/api#navigation-written-by-hand) を参照してください。

## 並列ページ {#parallel-pages}

1 つの記事を複数のページに分けられます。[m3.material.io](https://m3.material.io/styles/icons) の Icons が「概要」「ガイドライン」「仕様」に分かれているのと同じです。これらのページはサイドバーでは 1 つの項目になり、ページ上部のタブバーで切り替えます。

- 下にスクロールすると、タブバーは縮んでアプリバーのタイトルの右側の空きスペースに飛んでいきます。スクロールを戻すと、ページに戻ります。
- アプリバーに収まる余地がない場合、タブバーは代わりにアプリバーの下に留まり、薄い影が付きます。
- グループ内でページを切り替えると、コンテンツが左右にスライドします。タブバーがアプリバーに収まっている場合はそのままの位置に残り、新しいページは本文の先頭から始まります。
- 本文の末尾にある前のページ・次のページのカードは、グループ内にとどまります。グループの最初のページには前のページがなく、最後のページには次のページがありません。

このサイトの[アイコン](/ja-JP/styles/icons)のページと、すべてのテーマのドキュメントは、この形で構成されています。[ページの作成](/ja-JP/getting-started/writing#parallel-pages)を参照してください。

各フィールドは [API](/ja-JP/theme/sidebar/api) を参照してください。ドロワーが開くタイミング、タブバーの飛び方などは[詳細](/ja-JP/theme/sidebar/details)を参照してください。
