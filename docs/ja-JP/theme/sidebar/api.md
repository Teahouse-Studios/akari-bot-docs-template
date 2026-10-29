---
tab: API
---

# サイドナビゲーション：API

## 記事のフロントマター

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `title` | `string` | ナビゲーションでの名前。デフォルトは最初の h1、それもなければフォルダー名 |
| `icon` | `string` | ナビゲーション項目のアイコン |
| `badge` | `string` | ナビゲーション項目のバッジ |
| `order` | `number` | カテゴリ内での位置。小さいほど前。指定のないページは最後に置かれ、フォルダー名で並びます |
| `parallel` | `string[]` | 同じフォルダー内の並列ページ |
| `tab` | `string` | タブバーでのタイトル。デフォルトはページのタイトル |
| `category` | `string` | 言語のホームページ専用。どのカテゴリに加わるか |

フロントマターのすべてのフィールドは、[ページの作成](/ja-JP/getting-started/writing/api#frontmatter)を参照してください。

## sidebar

| フィールド | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `categories` | `Record<string, AkariSidebarCategory>` | なし | フォルダーから生成するナビゲーションのカテゴリ。キーはカテゴリフォルダーの名前で、その順序がレールでの順序になります |
| `items` | `AkariSidebarItem[] \| Record<string, AkariSidebarItem[]>` | なし | 手書きのナビゲーション。設定すると、ナビゲーションはフォルダーから生成されなくなります |
| `width` | `number` | `320` | ナビゲーションドロワーの基準幅。240–400 の範囲に制限されます |

`AkariSidebarCategory` のフィールド：

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `text` | `string` | カテゴリの名前。デフォルトはフォルダー名 |
| `icon` | `string` | レールでのアイコン。デフォルトは `category` |
| `collapsed` | `boolean` | `false` のとき、モバイルのドロワーでこのカテゴリがデフォルトで展開されます。このカテゴリ内のページに移動すると開きます。読者が開いたり閉じたりした後は、その状態のまま保たれます |

デスクトップのナビゲーションドロワーの幅は `max(240px, width - 96px)` です。デフォルトでは 240px、`width` が最大値の 400 のときは 304px になります。モバイルのドロワーは `width` をそのまま使います。

## 手書きのナビゲーション {#navigation-written-by-hand}

`sidebar.items` は `AkariSidebarItem` のリストです。フォルダーから生成されるナビゲーションも同じ構造です。

| フィールド | 型 | 説明 |
| --- | --- | --- |
| `text` | `string` | 必須。表示するテキスト |
| `link` | `string` | リンク先のアドレス。サイト内のアドレスは `/` で始めます |
| `icon` | `string` | 登録済みのアイコン名。最上位の項目では、レールとモバイルのドロワーの最上位のメニューに表示されます。デフォルトは `category` |
| `badge` | `string` | バッジ。最上位の項目ではレールのアイコンの右上に、子項目ではドロワーに表示されます |
| `collapsed` | `boolean` | `false` のとき、グループがデフォルトで展開されます。グループ内のページに移動すると開きます。ドロワーが別のカテゴリに切り替わって戻っても、読者が開閉したグループはその状態のままです |
| `items` | `AkariSidebarItem[]` | 子項目。何階層でも入れ子にできます |
| `tabs` | `AkariSidebarItem[]` | 並列ページ。グループのページはサイドバーで最初のページにリンクする 1 つの項目になり、ページの上部にタブバーが表示されます |

```ts
sidebar: {
  items: [
    {
      text: "スタイル",
      icon: "style",
      items: [
        { text: "カラー", link: "/styles/color" },
        {
          text: "アイコン",
          tabs: [
            { text: "概要", link: "/styles/icons" },
            { text: "アイコンの選び方", link: "/styles/icons/choosing" },
            { text: "アイコンの使い方", link: "/styles/icons/using" },
          ],
        },
      ],
    },
  ],
},
```

`items` はオブジェクトにすることもできます。キーはパスのプレフィックス、値はそのパス以下で表示するナビゲーションです。現在のパスに一致する最も長いプレフィックスが優先されます（`/theme/settings` は `/theme/` より優先され、`/` はすべてのパスに一致します）。

`tabs` の項目のうち、タブになるのは `link` を持つ項目だけです。`link` を持つタブが 1 つもない場合、その項目は通常のナビゲーション項目として扱われます。

## ネイティブのサイドバー

言語フォルダーも `sidebar.items` もない場合、テーマは VitePress の `themeConfig.sidebar`（`.vitepress/config.mts` 内）を読み取り、同じ構造に変換します。ネイティブの項目の `icon`、`badge`、`tabs` は保持され、グループの `base` はその子項目とタブのリンクの前に付けられます。

```ts
export default defineConfig({
  themeConfig: {
    sidebar: {
      "/theme/": [
        {
          text: "テーマ",
          items: [
            { text: "レイアウトとアプリバー", link: "/theme/layout", icon: "view_quilt" },
            { text: "テーマの拡張", link: "/theme/extending", badge: "拡張" },
          ],
        },
      ],
    },
  },
});
```

## タブバーの CSS 変数 {#tab-bar-css-variables}

| 変数 | デフォルト | 効果 |
| --- | --- | --- |
| `--akari-app-bar-tabs-gap` | `24px` | アプリバーに収まった後の、タブバーとタイトルの間隔、およびタブバーと右側のボタンの間隔 |
| `--akari-page-tabs-docked-max-width` | `none` | アプリバーに収まった後のタブバーの最大幅。設定すると、タブバーは空きスペースの中央に置かれます |

## useSidebar

```ts
import { useSidebar } from "@theme";

const { items, prevNext, tabGroup, isActive, hasActive } = useSidebar();
```

| 戻り値 | 型 | 説明 |
| --- | --- | --- |
| `items` | `ComputedRef<AkariSidebarItem[]>` | 現在のページのナビゲーションツリー |
| `prevNext` | `ComputedRef<{ prev?, next? }>` | 現在のページの並列グループ内での前のページと次のページ。グループの両端と、グループに属さないページでは存在しません |
| `tabGroup` | `ComputedRef<AkariSidebarItem \| undefined>` | 現在のページが属する並列ページのグループ |
| `isActive(link)` | `(link?: string) => boolean` | このアドレスが現在のページかどうか |
| `hasActive(item)` | `(item: AkariSidebarItem) => boolean` | この項目、またはその子項目かタブのいずれかが現在のページかどうか |

レイアウト内のコンポーネントからのみ呼び出してください。

## アイコン

ナビゲーションで使うアイコンは、先に `docs/.vitepress/theme/icons.ts` で登録しておく必要があります。[アイコンの使い方](/ja-JP/styles/icons/using)を参照してください。登録されていないアイコンは空白で表示されます。
