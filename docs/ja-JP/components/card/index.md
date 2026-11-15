---
icon: dashboard
order: 2
tab: 概要
parallel:
  - api
---

# カード

`m3e-card` は、ヘッダー、本文、アクション、フッターを 1 つの独立したサーフェスにまとめます。機能への入り口、ドキュメントの概要、設定、メディアに使います。

## バリアント

3 つのバリアントは、それぞれ異なる階層に向いています。

<div class="demo-grid">
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Filled</m3e-heading>
    <div slot="content">デフォルトのバリアントです。コンテナの色は <code>surface-container-highest</code> から取り、アウトラインや影はありません。</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Outlined</m3e-heading>
    <div slot="content">1px のアウトラインがあります。情報量の多いリストや、はっきりした境界が必要なコンテンツのブロックに向いています。</div>
  </m3e-card>
  <m3e-card variant="elevated">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Elevated</m3e-heading>
    <div slot="content">影とサーフェスの色があります。背景から浮かび上がらせたい重要なコンテンツに向いています。</div>
  </m3e-card>
</div>

```html
<m3e-card variant="filled">
  <m3e-heading slot="header" variant="title" size="large">Filled</m3e-heading>
  <div slot="content">デフォルトのバリアントです。コンテナの色はサーフェスの階層から取ります。</div>
</m3e-card>
<m3e-card variant="outlined">
  <m3e-heading slot="header" variant="title" size="large">Outlined</m3e-heading>
  <div slot="content">1px のアウトラインがあります。</div>
</m3e-card>
<m3e-card variant="elevated">
  <m3e-heading slot="header" variant="title" size="large">Elevated</m3e-heading>
  <div slot="content">影とサーフェスの色があります。</div>
</m3e-card>
```

`variant` を指定しない場合、カードは `filled` を使います。

## スロット

カードには 5 つの領域があります。

- `header`：タイトル、アイコン、メディア。余分な余白はありません。
- `content`：本文の領域。余白があります。
- `actions`：アクションのボタン。デフォルトでは先頭側に揃います。要素に `end` 属性を付けると末尾側に揃います。
- `footer`：メタデータ、著作権表示、補足の説明。
- デフォルトスロット：余白はありません。端まで広がる画像やカスタムのレイアウトに向いています。

<div class="demo-grid">
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">ドキュメントの概要</m3e-heading>
    <div slot="content">
      本文の領域には段落、リスト、チップ、バッジを入れられます。余白はカードが管理します。
    </div>
    <div slot="actions" end>
      <m3e-button variant="text">キャンセル</m3e-button>
      <m3e-button variant="filled">続ける</m3e-button>
    </div>
    <div slot="footer">2026-10-27 更新</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined">
  <m3e-heading slot="header" variant="title" size="large">ドキュメントの概要</m3e-heading>
  <div slot="content">
    本文の領域には段落、リスト、チップ、バッジを入れられます。余白はカードが管理します。
  </div>
  <div slot="actions" end>
    <m3e-button variant="text">キャンセル</m3e-button>
    <m3e-button variant="filled">続ける</m3e-button>
  </div>
  <div slot="footer">2026-10-27 更新</div>
</m3e-card>
```

`actions` のボタンは、プラットフォームの慣例に従って並べます。キャンセルは先頭側、確定は末尾側です。フッターのテキストは補助的な色を使うため、本文と注意を奪い合いません。

## コンテンツの組み合わせ

カードには見出し、チップ、バッジ、リストを組み合わせて入れられます。

<m3e-card variant="elevated">
  <m3e-heading m3e-toc-ignore slot="header" variant="headline" size="small">テーマの機能</m3e-heading>
  <div slot="content">
    <div class="demo-row">
      <m3e-chip>
        <m3e-icon slot="icon" name="palette"></m3e-icon>
        ダイナミックカラー
      </m3e-chip>
      <m3e-chip>
        <m3e-icon slot="icon" name="layers"></m3e-icon>
        コンポーネントの置き換え
      </m3e-chip>
      <m3e-badge size="small">Beta</m3e-badge>
    </div>
    <ul>
      <li>設定から作られるナビゲーションと目次</li>
      <li>現在のブラウザーに保存される設定</li>
      <li>クライアントで登録し、SSR のビルドに対応</li>
    </ul>
  </div>
  <div slot="actions">
    <m3e-button variant="tonal" href="/ja-JP/theme/extending.html">
      拡張方法を見る
      <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
    </m3e-button>
  </div>
</m3e-card>

```html
<m3e-card variant="elevated">
  <m3e-heading slot="header" variant="headline" size="small">テーマの機能</m3e-heading>
  <div slot="content">
    <div class="demo-row">
      <m3e-chip>
        <m3e-icon slot="icon" name="palette"></m3e-icon>
        ダイナミックカラー
      </m3e-chip>
      <m3e-chip>
        <m3e-icon slot="icon" name="layers"></m3e-icon>
        コンポーネントの置き換え
      </m3e-chip>
      <m3e-badge size="small">Beta</m3e-badge>
    </div>
    <ul>
      <li>設定から作られるナビゲーションと目次</li>
      <li>現在のブラウザーに保存される設定</li>
      <li>クライアントで登録し、SSR のビルドに対応</li>
    </ul>
  </div>
  <div slot="actions">
    <m3e-button variant="tonal" href="/ja-JP/theme/extending.html">
      拡張方法を見る
      <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
    </m3e-button>
  </div>
</m3e-card>
```

コンテンツが増えると、カードはそれに合わせて大きくなります。同じグリッド内のカードの高さは自動では揃わないため、テキストの長さを同じくらいにしておきます。

## 操作可能なカード

カードに `actionable` を付けると、サーフェス全体が 1 つのインタラクティブな領域になります。`href` を付ければ、そのままリンクとして動作します。

<div class="demo-grid">
  <m3e-card variant="outlined" actionable href="/ja-JP/getting-started/installation.html">
    <m3e-icon slot="header" name="package_2"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">インストール</m3e-heading>
    <div slot="content">Node と依存関係を準備して、最初のビルドを作ります。</div>
  </m3e-card>
  <m3e-card variant="outlined" actionable href="/ja-JP/getting-started/configuration.html">
    <m3e-icon slot="header" name="tune"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">構成</m3e-heading>
    <div slot="content">アプリバー、ナビゲーション、設定のセクション、目次の深さを調整します。</div>
  </m3e-card>
  <m3e-card variant="outlined" actionable href="/ja-JP/theme/extending.html">
    <m3e-icon slot="header" name="integration_instructions"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">拡張</m3e-heading>
    <div slot="content">コンポーネントの置き換えと CSS トークンでインターフェースをカスタマイズします。</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined" actionable href="/ja-JP/getting-started/installation.html">
  <m3e-icon slot="header" name="package_2"></m3e-icon>
  <m3e-heading slot="header" variant="title" size="large">インストール</m3e-heading>
  <div slot="content">Node と依存関係を準備して、最初のビルドを作ります。</div>
</m3e-card>
```

操作可能なカードは、ホバー、フォーカス、押下時に状態レイヤーを表示します。全体をクリックできるカードの中には、ほかのインタラクティブな要素を置かないでください。入れ子のボタンによって 2 つの操作が同時に起きるのを防ぐためです。複数の操作が必要な場合は、代わりに `actions` スロットを持つ普通のカードを使います。

## ダイアログのアクション

カードのアクションからダイアログを開けます。ボタンの中に `m3e-dialog-trigger` を入れます。`m3e-dialog-action` はダイアログを閉じて結果を返します。

<m3e-card variant="outlined">
  <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">バージョン情報</m3e-heading>
  <div slot="content">このドキュメントは VitePress 2.0.0-alpha.21 と @m3e/web 2.10.3 に対応しています。</div>
  <div slot="actions" end>
    <m3e-button variant="filled">
      <m3e-dialog-trigger for="card-demo-dialog">詳細を見る</m3e-dialog-trigger>
    </m3e-button>
  </div>
</m3e-card>

<m3e-dialog id="card-demo-dialog" dismissible>
  <span slot="header">Vitepress Theme Akari Docs</span>
  <p>テーマは静的生成とルーティングに VitePress を、UI コンポーネントとダイナミックカラーに m3e を使っています。</p>
  <p>設定はブラウザーにローカルで保存され、サイトの設定には書き込まれません。</p>
  <div slot="actions" end>
    <m3e-button>
      <m3e-dialog-action return-value="close">閉じる</m3e-dialog-action>
    </m3e-button>
  </div>
</m3e-dialog>

```html
<m3e-button variant="filled">
  <m3e-dialog-trigger for="card-demo-dialog">詳細を見る</m3e-dialog-trigger>
</m3e-button>
<m3e-dialog id="card-demo-dialog" dismissible>
  <span slot="header">Vitepress Theme Akari Docs</span>
  <p>テーマは静的生成とルーティングに VitePress を、UI コンポーネントとダイナミックカラーに m3e を使っています。</p>
  <div slot="actions" end>
    <m3e-button>
      <m3e-dialog-action return-value="close">閉じる</m3e-dialog-action>
    </m3e-button>
  </div>
</m3e-dialog>
```

`dismissible` を付けると、ダイアログに閉じるボタンが付きます。スクリムをクリックするか `Escape` を押しても閉じます。処理を止める必要があるフローでは、`disable-close` と明示的な確定のアクションを加えます。

## グリッドレイアウト

カードのグリッドには `.demo-grid` を使います。狭い画面では 1 列になります。各カードは 1 つのトピックと 1 つの主要な操作に絞り、1 ページ分のコンテンツを 1 枚のカードに詰め込まないでください。

<div class="demo-grid">
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">はじめに</m3e-heading>
    <div slot="content">インストールから最初のビルドまで約 10 分です。</div>
  </m3e-card>
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">テーマ</m3e-heading>
    <div slot="content">アプリの外枠、サイドバー、設定ダイアログについて理解します。</div>
  </m3e-card>
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">スタイル</m3e-heading>
    <div slot="content">カラートークンと文字の階層を学びます。</div>
  </m3e-card>
</div>

## 使い方のヒント

- カードのタイトルは短くし、本文は最大 3 行に収めます。長いコンテンツは独立したページに移します。
- 視覚的なノイズを避けるため、1 つのグリッドでは 1 つのバリアントだけを使います。
- 全体をクリックできるカードにボタンを入れ子にしないでください。複数の操作が必要な場合は `actions` を使います。
- 画像はデフォルトスロットか `header` スロットに置き、代替テキストを付けます。
- カードの角の丸み、色、余白は `--m3e-card-*` 変数で調整します。[テーマの拡張](/ja-JP/theme/extending) を参照してください。

すべての属性、スロット、イベントは [API](/ja-JP/components/card/api) を参照してください。
