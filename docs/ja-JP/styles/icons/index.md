---
title: アイコン
hero:
  image: /hero/icons-hero.svg
  alt: 角丸の正方形の上に並んだアイコンと、細いものから太いものまでの線
  tagline: テーマは Material Symbols のアイコンを使い、必要に応じて登録します。アイコンフォントや CDN は使いません。
  fit: contain
order: 2
tab: 概要
parallel:
  - choosing
  - using
---

# アイコン

テーマのアイコンはすべて [Material Symbols](https://fonts.google.com/icons) です。`@m3e/icons` がそれらを SVG のパスとして提供し、`<m3e-icon>` が表示します。スタイル、塗りつぶし、サイズについては [アイコンの選び方](/ja-JP/styles/icons/choosing) で、登録とアクセシビリティの要件については [アイコンの使い方](/ja-JP/styles/icons/using) で説明します。

<div class="demo-row">
  <m3e-icon name="home"></m3e-icon>
  <m3e-icon name="search"></m3e-icon>
  <m3e-icon name="settings"></m3e-icon>
  <m3e-icon name="palette"></m3e-icon>
  <m3e-icon name="translate"></m3e-icon>
  <m3e-icon name="schedule"></m3e-icon>
  <m3e-icon name="dark_mode"></m3e-icon>
  <m3e-icon name="light_mode"></m3e-icon>
</div>

## 特長

- **必要に応じて登録**：各アイコンは個別のモジュールです。`icons.ts` でインポートしたアイコンだけがビルド結果に含まれるため、初期表示の容量はアイコンの総数に左右されません。
- **ネットワーク不要**：アイコンは `@m3e/icons` とともにインストールされ、インライン SVG として描画されます。フォントファイルはなく、アイコンフォントの読み込み前に文字が一瞬表示されることもありません。
- **テーマに追従**：アイコンは `currentColor` を使うため、配置されたコンポーネントの M3 のカラーロールから色を取ります。カラーモード、コントラスト、ダイナミックカラーの変更にも自動で追従します。
- **アウトラインと塗りつぶし**：すべてのアイコンには塗りつぶしの形があり、`filled` 属性で切り替えます。ナビゲーションで選択中の項目は、これを使って現在の位置を示します。

## テーマ内のアイコン

| 場所 | アイコンの出どころ | 備考 |
| --- | --- | --- |
| ナビゲーションレールとモバイルのドロワー | 共通設定の `sidebar.categories` にある各カテゴリの `icon` | デフォルトは `category`。現在のカテゴリは塗りつぶしの形で表示されます |
| アプリバー | テーマに組み込み | メニュー、検索、その他、設定、ソーシャルリンク |
| フローティングアクションボタン | テーマに組み込み | 「トップに戻る」は `keyboard_arrow_up`、目次は `format_list_bulleted` |
| レールの下部 | テーマに組み込み | カラーモードボタンのアイコンはモードに応じて変わります。言語ボタンは `translate` です |
| 記事の本文 | Markdown 内の `<m3e-icon>` | 先に `icons.ts` で登録する必要があります |

## このグループのページ

この 3 つのページは 1 組の並列ページです。サイドバーには「アイコン」という 1 つの項目として表示され、ページ上部のタブバーで切り替えます。`styles/icons/` フォルダーの `index.md`、`choosing.md`、`using.md` がそれにあたります。このようなページの書き方は [ページの作成](/ja-JP/getting-started/writing#parallel-pages) を参照してください。
