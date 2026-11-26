---
icon: tune
order: 2
tab: 概要
parallel:
  - api
  - details
---

# 構成

設定は `docs` フォルダーに、2 つのレベルで書きます。

- `docs/config.ts`：すべての言語で共通の設定。
- `docs/<言語コード>/config.ts`：1 つの言語の設定。たとえば `docs/ja-JP/config.ts` です。このファイルがあるフォルダーが言語フォルダーになります。

言語設定のフィールドは共通設定の同名のフィールドを置き換え、オブジェクトはフィールドごとにマージされます。そのため、言語設定にはその言語で異なる部分だけを書けば済みます。`docs/.vitepress/config.mts` はテーマを VitePress に組み込むだけなので、変更が必要になることはほとんどありません。

```text
docs/
├─ config.ts                 共通設定
├─ en-US/                    英語。サイトのルートで配信
│  ├─ config.ts              言語設定
│  └─ …                      ページ。「ページの作成」を参照
├─ zh-CN/                    簡体字中国語。/zh-CN/ 以下で配信
│  ├─ config.ts
│  └─ …
└─ .vitepress/config.mts
```

## 共通設定

すべての言語で同じもの：ルート言語、ロゴ、バージョンとソーシャルリンク、カテゴリのアイコンと順序、設定、検索。

```ts
// docs/config.ts
import { defineAkariConfig } from "./.vitepress/theme/define.ts";

export default defineAkariConfig({
  // サイトのルートで配信する言語フォルダー
  rootLanguage: "en-US",
  logo: "/logo.svg",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
  appBar: {
    version: "v1.0.0",
    socialLinks: [
      { icon: "github", link: "https://github.com/OasisAkari/vitepress-theme-akari-docs", label: "GitHub" },
    ],
  },
  sidebar: {
    // カテゴリのフォルダー名とアイコン。キーの順序がレールでの順序になります
    categories: {
      "getting-started": { icon: "rocket_launch" },
      theme: { icon: "palette" },
    },
  },
  settings: { storageKey: "akari-docs-settings" },
  search: { maxResults: 8 },
  images: { webp: true },
  footer: { copyright: "Vitepress Theme Akari Docs" },
});
```

## 言語設定

このサイトでのその言語のタイトルとテキスト。`lang` のデフォルトはフォルダー名で、テーマはこれをもとに[言語パック](/ja-JP/theme/i18n#language-packs)を選びます。言語メニューでの名前、文字の方向、インターフェーステキスト、コードブロックのコピーボタンのテキストはすべて言語パックから取り、必要に応じてここで上書きします。

```ts
// docs/ja-JP/config.ts
import { defineAkariConfig } from "../.vitepress/theme/define.ts";

export default defineAkariConfig({
  title: "Vitepress Theme Akari Docs",
  description: "VitePress と M3E Web Components で作られたドキュメントテーマ",
  appBar: { title: "Vitepress Theme Akari Docs" },
  sidebar: {
    categories: {
      "getting-started": { text: "はじめに" },
      theme: { text: "テーマ" },
    },
  },
  footer: { message: "VitePress と M3E Web Components で構築" },
});
```

## よくある変更

| 目的 | 書く場所 | フィールド |
| --- | --- | --- |
| サイト名を変更する | 言語設定 | `title`、`appBar.title` |
| バージョンやソーシャルリンクを追加する | 共通設定 | `appBar.version`、`appBar.socialLinks` |
| カテゴリの順序やアイコンを変更する | 共通設定 | `sidebar.categories` |
| カテゴリの名前を変更する | 言語設定 | `sidebar.categories.<folder>.text` |
| デフォルトのカラーとカラーモードを変更する | 共通設定 | `settings.defaults` |
| 検索をオフにする、または検索バックエンドを接続する | 共通設定 | `search` |
| フッターのメッセージと著作権表示を変更する | 言語設定 / 共通設定 | `footer.message`、`footer.copyright` |
| インターフェーステキストを書き換える | 言語設定 | `messages` |
| サイトが使う画像を WebP に変換する | 共通設定 | `images.webp` |
| 言語を追加する | 新しい言語フォルダー | [国際化](/ja-JP/theme/i18n) を参照 |

各フィールドの型とデフォルト値は [API](/ja-JP/getting-started/configuration/api) を参照してください。設定のレイヤー構造と、言語やナビゲーションの生成方法は [詳細](/ja-JP/getting-started/configuration/details) を参照してください。
