---
icon: package_2
order: 1
---

# インストール

Vitepress Theme Akari Docs は GitHub のテンプレートリポジトリです。このテンプレートから自分のリポジトリを作成すると、テーマのソース、設定、サンプルのドキュメントが手に入ります。別途インストールするテーマパッケージはありません。

## テンプレートからリポジトリを作成する

1. [OasisAkari/vitepress-theme-akari-docs](https://github.com/OasisAkari/vitepress-theme-akari-docs) を開き、**Use this template** → **Create a new repository** をクリックします。
2. リポジトリ名と公開範囲を入力して作成します。新しいリポジトリにはテンプレートのファイルがすべて含まれます。コミット履歴は新しく始まり、テンプレートのフォークにはなりません。
3. クローンして、依存関係をインストールし、起動します。

   ```bash
   git clone https://github.com/<アカウント>/<リポジトリ>.git
   cd <リポジトリ>
   npm install
   npm run dev
   ```

GitHub CLI を使うと、作成とクローンを 1 回で行えます。

```bash
gh repo create my-docs --template OasisAkari/vitepress-theme-akari-docs --public --clone
```

## 動作要件

- Node.js `>=22.12.0`（`package.json` の `engines` フィールド）。テンプレートは Node.js `24.21.0` と npm `12.2.1` で動作を確認しています。
- npm。リポジトリには `package-lock.json` が 1 つだけあります。継続的インテグレーションでは、`npm ci` でロックファイルからインストールします。

## コマンド

開発サーバーはデフォルトで `http://localhost:5173` で起動します。

| コマンド | 用途 |
| --- | --- |
| `npm run dev` | 開発サーバー。Markdown の変更はすぐに反映され、`config.ts` を変更すると自動で再起動します |
| `npm run build` | 静的サイトを `docs/.vitepress/dist` にビルドします |
| `npm run preview` | ビルド結果をローカルでプレビューします |
| `npm run typecheck` | `vue-tsc --noEmit` でテーマとテストを型チェックします |
| `npm test` | Vitest の単体テストを実行します |

## 自分のサイトにする

- サイト名、バージョン、ソーシャルリンク、フッターは `docs/config.ts` と各言語の `config.ts` にあります。[構成](/ja-JP/getting-started/configuration) を参照してください。
- ロゴは `docs/public/logo.svg` です。
- 言語フォルダーには、このサイトのドキュメントが入っています。必要な言語を残して他のフォルダーを削除し、残したフォルダーに自分のページを書きます。[ページの作成](/ja-JP/getting-started/writing) を参照してください。

## テンプレートの更新を取り込む

テンプレートから作成したリポジトリはテンプレートとつながっていないため、テンプレートのその後の更新は自動では入ってきません。取り込みたいときは、テンプレートをリモートとして追加し、テーマのある `docs/.vitepress` を取得します。

```bash
git remote add template https://github.com/OasisAkari/vitepress-theme-akari-docs.git
git fetch template
git checkout template/main -- docs/.vitepress
```

この操作でフォルダーはテンプレートのバージョンに置き換わるため、テーマに加えた変更は改めてマージする必要があります。`package.json` の依存関係もあわせて比較してください。

## バージョンの基準

| 依存関係 | バージョン | 備考 |
| --- | --- | --- |
| `vitepress` | `2.0.0-alpha.21` | 固定。Vite 8 / Rolldown と Vue 3.5 上に構築 |
| `@m3e/web` | `2.10.3` | Material 3 Expressive Web Components |
| `@m3e/icons` | `1.0.21` | Material Symbols のアイコン。必要に応じて登録 |

VitePress はまだアルファ版です。アップグレードするときは、テーマのコード、設定の型、ビルド結果をあわせて確認してください。

## フォルダー構成

```text
.
├── docs/
│   ├── config.ts                  すべての言語で共通の設定
│   ├── en-US/                     英語。サイトのルートで配信
│   │   ├── config.ts              共通設定を上書き
│   │   ├── index.md               ホームページ
│   │   └── getting-started/       レールのカテゴリ
│   │       └── installation/
│   │           └── index.md       記事 /getting-started/installation.html
│   ├── zh-CN/                     簡体字中国語。/zh-CN/ 以下で配信
│   ├── public/                    静的アセット
│   └── .vitepress/
│       ├── config.mts             テーマを VitePress に組み込む
│       ├── content/               フォルダーから言語、パス、ナビゲーションを生成
│       └── theme/                 テーマのソース
├── tests/                         単体テスト
└── package.json
```

ページと設定の置き場所は [構成](/ja-JP/getting-started/configuration) と [ページの作成](/ja-JP/getting-started/writing) を参照してください。テーマのソースの構成は [テーマの拡張](/ja-JP/theme/extending/api#source-layout) を参照してください。

## デプロイ {#deployment}

`npm run build` はプレーンな静的ファイルを出力するため、どの静的ホスティングでも配信できます。

- **ページのパス**：このサイトでは `cleanUrls` を無効にしているため、ページのパスは `.html` で終わり（`/theme/layout.html`）、ビルド結果のファイルと 1 対 1 で対応します。どの静的ホスティングでもそのまま配信できます。拡張子のないパスにしたい場合は、`.vitepress/config.mts` で `cleanUrls: true` を設定します。このとき、ファイルが見つからなければ、ホスティング側で `.html` を付けて再試行する必要があります。GitHub Pages、Netlify、Cloudflare Pages はデフォルトでこの動作をします。Vercel では `vercel.json` に `"cleanUrls": true` が必要です。Nginx では `try_files $uri $uri.html $uri/ =404;` と書きます。
- **サブパスで配信する場合**：たとえば `https://example.com/docs/` では、`.vitepress/config.mts` に `base: "/docs/"` を設定します。ナビゲーション、ヒーロー、ロゴ、検索インデックスの内部パスには自動で付加されます。
- **検索インデックス**：各言語のインデックスは、ビルド時に出力の `assets/chunks/` にまとめられます。追加の手順は不要です。

## よくある質問

### ページが空白になる、またはコンポーネントにスタイルが当たらない

テーマはブラウザーで m3e コンポーネントを登録し、登録が終わると `html` に `data-akari-ready` を付けます。まずブラウザーのコンソールでモジュールの読み込みエラーを確認してください。スクリプトが無効、または読み込みに失敗した場合は、3 秒後にコンテンツがプレーンな HTML として表示されます。ブラウザーは Custom Elements、Shadow DOM、ネイティブの ES モジュールに対応している必要があります。

### コンポーネントをブラウザーでのみ登録する理由

m3e コンポーネントは Lit のカスタム要素です。登録には `customElements.define` が必要ですが、Node.js にはありません。テーマのエントリーはブラウザーでのみ `m3e.ts` をインポートし、サーバーサイドレンダリングでは要素のタグとそのスロットの内容だけを出力します。サーバーで実行されるコードでは、`@m3e/web` のコンポーネントモジュールをインポートしないでください。

### 新しいコンポーネントやアイコンが表示されない

コンポーネントもアイコンも、必要に応じて登録されます。コンポーネントは `docs/.vitepress/theme/m3e.ts` でそのサブパスをインポートします（すべてのコンポーネントを登録する `@m3e/web/all` はインポートしないでください）。アイコンは `icons.ts` でインポートします。登録されていないアイコンは空白で表示されます。

### ビルドで不明な Vue コンポーネントが報告される

`.vitepress/config.mts` では、`vue.template.compilerOptions.isCustomElement` で `m3e-` で始まるタグを通しています。テーマを別のプロジェクトで再利用するときも、この設定を残してください。
