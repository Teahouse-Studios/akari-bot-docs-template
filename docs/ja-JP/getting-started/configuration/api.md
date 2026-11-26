---
tab: API
---

# 構成：API

## defineAkariConfig

```ts
import { defineAkariConfig } from "./.vitepress/theme/define.ts";

function defineAkariConfig(config: AkariSiteConfig): AkariDirectoryConfig;
```

どちらのレベルの設定ファイルも、この関数で設定をエクスポートします。VitePress のフィールドはそのまま残ります。テーマのフィールドは VitePress が読み込む `themeConfig.akari` の下に移され、型ヒントが付きます。型は `docs/.vitepress/theme/types.ts` で定義されています。

## サイトと言語

| フィールド | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `rootLanguage` | `string` | アルファベット順で最初の言語フォルダー | 共通設定でのみ有効。サイトのルートで配信する言語フォルダーです。ほかの言語のパスはフォルダー名で始まります |
| `lang` | `string` | 言語フォルダー名 | 言語コード。`<html lang>` に使われ、[言語パック](/ja-JP/theme/i18n/api#akarilanguage)を選びます |
| `label` | `string` | その言語自身による呼び名 | 言語メニューでの名前 |
| `dir` | `"ltr" \| "rtl" \| "auto"` | 言語パックの値 | 文字の方向 |
| `title` | `string` | なし | サイトのタイトル。アプリバーのデフォルトのタイトルにもなります |
| `titleTemplate` | `string \| boolean` | なし | ページタイトルの接尾辞またはテンプレート。VitePress と同じです |
| `description` | `string` | なし | サイトの説明 |
| `head` | `HeadConfig[]` | `[]` | 追加の `<head>` タグ。上のレベルとマージされます |
| `logo` | `string` | なし | アプリバーとフッターに表示するブランド画像 |
| `markdown` | `MarkdownLocaleOptions` | 言語パックの値 | Markdown 内のその言語のテキスト。コードブロックのコピーボタンのツールチップなど。言語パックの値の上に重ねられます |
| `images` | `AkariImagesConfig` | なし | ビルドがサイトの使う画像をどう扱うか。`webp` はビルド後のページが参照するすべてのラスター画像を WebP に変換し、ページの参照先もそちらにします |

`lang`、`label`、`dir`、`markdown` は言語を表すもので、言語設定に書きます。それ以外のフィールドはすべて、デフォルトとして共通設定に書くことができ、言語設定で上書きできます。

## テーマのフィールド

| フィールド | 内容 | 参照 |
| --- | --- | --- |
| `appBar` | アプリバーのタイトル、バージョン、ロゴ、ボタン、ソーシャルリンク | [レイアウトとアプリバー](/ja-JP/theme/layout/api#appbar) |
| `toc` | 右側の目次 | [レイアウトとアプリバー](/ja-JP/theme/layout/api#toc) |
| `loadingBar` | ページの読み込み中にウィンドウの上端に表示されるバー | [レイアウトとアプリバー](/ja-JP/theme/layout/api#loadingbar) |
| `footer` | ページ送りカードとフッター | [レイアウトとアプリバー](/ja-JP/theme/layout/api#footer) |
| `sidebar` | カテゴリ、手書きのナビゲーション、ドロワーの幅 | [サイドナビゲーション](/ja-JP/theme/sidebar/api#sidebar) |
| `settings` | 設定ダイアログとカラーモードボタン | [設定と外観](/ja-JP/theme/settings/api#settings) |
| `search` | 検索の入り口とバックエンド | [検索](/ja-JP/theme/search/api#search) |
| `messages` | インターフェーステキスト | [国際化](/ja-JP/theme/i18n/api#messages) |
| `fonts` | Google Fonts からフォントを読み込むかどうかと、フォントスタック | [タイポグラフィ](/ja-JP/styles/typography/api#fonts) |
| `languages` | 組み込み以外の言語パック、または組み込みの言語パックへの変更 | [国際化](/ja-JP/theme/i18n/api#akarilanguage) |

インターフェースのコンポーネントの置き換えは、設定ファイルでは行いません。[テーマの拡張](/ja-JP/theme/extending/api#provideakaricomponents) を参照してください。

## .vitepress/config.mts

テーマを VitePress に組み込む部分です。変更が必要になることはほとんどありません。

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { akariContent } from "./content";
import { akariHead } from "./theme/head";
import { akariMarkdown } from "./theme/markdown";

const docsDir = fileURLToPath(new URL("../", import.meta.url));
const content = await akariContent(docsDir);

export default defineConfig({
  ...content.site,
  cleanUrls: false,
  appearance: false,
  head: akariHead(),
  markdown: { config: (md) => akariMarkdown(md) },
  vue: {
    template: {
      compilerOptions: { isCustomElement: (tag) => tag.startsWith("m3e-") },
    },
  },
  vite: {
    plugins: [content.plugin],
  },
});
```

| オプション | 用途 |
| --- | --- |
| `...content.site` | フォルダーから生成される `locales`、`rewrites`、およびサイトレベルの `lang`、`title`、`description`。ローカル検索では `themeConfig.search` も含まれ、VitePress のローカル検索インデックスが有効になります |
| `cleanUrls: false` | ページのパスは `.html` で終わり、出力のファイルと 1 対 1 で対応します。`true` にするとパスに拡張子が付きません。ホスティングの要件は [インストール](/ja-JP/getting-started/installation#deployment) を参照 |
| `appearance: false` | VitePress に組み込まれたライト・ダークの切り替えをオフにします。テーマが管理します |
| `head: akariHead()` | 最初のフレームの前にライトモードまたはダークモードを適用するスクリプト |
| `akariMarkdown` | テーブルの M3 の枠線と、リモート画像のサイズ |
| `isCustomElement` | Vue に `m3e-*` をカスタム要素として扱わせます |
| `content.plugin` | 開発中、Markdown ファイルの追加や削除、フロントマターの変更に合わせてナビゲーションを更新します |

## akariContent

```ts
function akariContent(
  srcDir: string,
  logger?: { warn(message: string): void },
): Promise<AkariContent>;
```

`srcDir` 内の設定ファイルとフォルダーを読み込みます。`logger` のデフォルトは `console` で、構造の外にあるページや、見つからない並列ページなどの通知を受け取ります。

| 戻り値のフィールド | 型 | 説明 |
| --- | --- | --- |
| `site` | `{ lang, title, description, locales, rewrites }` | `defineConfig` に展開します |
| `plugin` | Vite の `Plugin` | 開発サーバーでナビゲーションを更新します |
| `route` | `(page: string) => string` | ソースファイルのパス → ページのパス。たとえば `zh-CN/theme/layout/index.md` → `/zh-CN/theme/layout` |
| `rewrite` | `(page: string) => string` | ソースファイルのパス → VitePress の配信パス。たとえば `zh-CN/theme/layout/index.md` → `theme/layout.md` |
| `languages` | `{ folder, key, prefix }[]` | 言語フォルダー。ルート言語が先頭です。`key` は VitePress のロケールキー（ルート言語は `root`）、`prefix` はパスの接頭辞です |
| `config` | `AkariSiteConfig \| undefined` | 共有設定を `config.ts` に書いたままの形。ページが存在する前にビルドが読むもの（`images` など）に使います |

## akariHead

```ts
function akariHead(options?: {
  storageKey?: string;
  defaultScheme?: "light" | "dark" | "auto" | "time";
}): HeadConfig[];
```

最初のフレームが描画される前にライトモードまたはダークモードを適用する、インラインスクリプトを返します。フォントの `<head>` タグは言語によって異なるため、`akariContent` が各言語のロケールに書き込みます。[タイポグラフィ](/ja-JP/styles/typography/api#fonts) を参照してください。`settings.storageKey` や `settings.defaults.scheme` を変更した場合は、スクリプトが同じ設定を読み込むように、ここにも同じ値を渡してください。

## akariMarkdown

```ts
function akariMarkdown(
  md: MarkdownRenderer,
  options?: { remoteImageSize?: boolean | AkariImageSizeOptions },
): void;
```

`markdown.config` で呼び出します。行うことは 2 つです。

- すべての Markdown のテーブルを `<div class="akari-table">` で囲みます。これにより、テーブルに M3 のアウトラインの枠線と横スクロールが付きます。
- [markdown-it-image-size](https://github.com/boyum/markdown-it-image-size) でリモート画像の幅と高さを書き込みます。ローカル画像の幅と高さは VitePress 自身が書き込みます。[ページの作成](/ja-JP/getting-started/writing/api#images) を参照してください。

| オプション | デフォルト | 説明 |
| --- | --- | --- |
| `remoteImageSize` | `true` | `false` にすると、リモート画像のサイズを測りません。プラグインのオプションを渡すこともできます。たとえば `{ cacheDir: ".image-size" }` でキャッシュをリポジトリ内に置き、`{ cache: false }` でキャッシュを使いません |
