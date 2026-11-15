---
icon: integration_instructions
order: 7
badge: 拡張
tab: 概要
parallel:
  - api
---

# テーマの拡張

テーマを調整する方法は 3 つあり、どれもテーマのソースを変更する必要はありません。

| 方法 | 向いている用途 | 書く場所 |
| --- | --- | --- |
| 設定 | タイトル、ナビゲーション、設定の項目、目次、フッター、インターフェースの文字列 | `docs/config.ts` と各言語の `config.ts`。[構成](/ja-JP/getting-started/configuration)を参照 |
| コンポーネントの置き換え | ブランドに合わせたアプリバー、特別なフッター、独自のコンテンツコンテナ | テーマのエントリーの `enhanceApp` |
| CSS 変数 | 角の丸み、余白、サーフェスの色、目次の幅 | サイトのスタイル |

## コンポーネントの置き換え

テーマのエントリー `docs/.vitepress/theme/index.ts` の `enhanceApp` で、置き換えたい部分を `provideAkariComponents` に渡します。渡さなかった部分は組み込みのコンポーネントのままです。

`provideAkariSiteData` はサイトの言語と設定のデータをテーマに渡し、`provideAkariComponents` はその一部のコンポーネントを置き換えます。

```ts
import { type Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import { provideAkariSiteData } from "./composables/useLocales";
import { provideAkariComponents } from "./composables/useAkariConfig";
import Layout from "./layouts/AkariLayout.vue";
import CustomFooter from "./CustomFooter.vue";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, siteData }) {
    provideAkariSiteData(app, siteData);
    provideAkariComponents(app, { Footer: CustomFooter });
  },
} satisfies Theme;
```

独自のコンポーネントは、`useAkariConfig()` や `useSidebar()` などテーマのコンポーザブルを通じて設定と状態を読み取ります。置き換えられる部分と使える関数は [API](/ja-JP/theme/extending/api) を参照してください。

## CSS 変数

テーマと m3e コンポーネントの変数を、サイトのスタイルで上書きします。

```css
:root {
  --akari-doc-radius: 24px;
  --akari-doc-max-width: 1440px;
}
```

1 つのコンポーネントだけをその場で上書きすることもできます。次の 3 枚のカードは角の丸みだけが異なります。

<div class="demo-grid">
  <m3e-card variant="outlined" style="--m3e-card-shape: 4px;">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">角丸 4px</m3e-heading>
    <div slot="content">よりコンパクトなカードです。ツールパネルやデータのブロックに向いています。</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">デフォルトの角丸</m3e-heading>
    <div slot="content">m3e カードのデフォルトの形状トークンを使い、ほかのコンポーネントと揃います。</div>
  </m3e-card>
  <m3e-card variant="outlined" style="--m3e-card-shape: 28px;">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">角丸 28px</m3e-heading>
    <div slot="content">角を大きくして、ドキュメントサーフェスの見た目に近づけます。</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined" style="--m3e-card-shape: 28px;">…</m3e-card>
```

テーマとコンポーネントが公開している変数を優先して使ってください。コンポーネント内部のクラス名や Shadow DOM の構造には依存しないでください。これらはバージョンによって変わります。

## 注意点

- コンポーネントを置き換えるときは、元のルート要素のセマンティクスとアクセシビリティ属性（たとえばアプリバーなら `m3e-app-bar`、ナビゲーションなら `m3e-nav-menu`）を保ち、キーボード操作も維持してください。
- 色をハードコードしないでください。`--md-sys-color-*` トークンを使えば、色がダイナミックカラー、ライトモードとダークモード、コントラストに追従します。
- 新しい m3e コンポーネントやアイコンを使うときは、`m3e.ts` と `icons.ts` でオンデマンドに登録してください。`@m3e/web/all` はインポートしないでください。
- モジュールのトップレベルで `window`、`document`、`localStorage` にアクセスしないでください。サーバーサイドレンダリングが失敗します。
