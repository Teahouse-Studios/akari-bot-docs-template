---
tab: API
---

# カード：API

以下の内容は `@m3e/web` 2.10.3 のコンポーネントのメタデータに基づいています。

## m3e-card

| 属性 | 値 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `variant` | `elevated`、`filled`、`outlined` | `filled` | 外観 |
| `orientation` | `vertical`、`horizontal` | `vertical` | コンテンツを並べる方向 |
| `inline` | 真偽値 | `false` | カードをインライン要素としてレイアウトします |
| `actionable` | 真偽値 | `false` | カード全体を 1 つのインタラクティブな領域にします |
| `href`、`target`、`rel`、`download` | ボタンと同じ | ボタンと同じ | `actionable` のとき、カードをリンクにします |
| `disabled`、`disabled-interactive` | 真偽値 | `false` | `actionable` のとき、カードを無効にします |
| `type`、`name`、`value` | ボタンと同じ | `button` | `actionable` のときのフォーム内での動作 |

| スロット | 内容 |
| --- | --- |
| （デフォルト） | 余白なし。端まで広がる画像やカスタムのレイアウトに向いています |
| `header` | タイトル、アイコン、メディア。余分な余白はありません |
| `content` | 本文。余白があります |
| `actions` | アクションのボタン。デフォルトでは先頭側に揃います。要素に `end` 属性を付けると末尾側に揃います |
| `footer` | メタデータ、著作権表示、補足の説明 |

| イベント | 発生するタイミング |
| --- | --- |
| `click` | `actionable` のカードがクリックされたとき |

## m3e-dialog

| 属性 | 値 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `open` | 真偽値 | `false` | ダイアログが開いているかどうか |
| `dismissible` | 真偽値 | `false` | 閉じるボタンを表示します |
| `disable-close` | 真偽値 | `false` | スクリムのクリックや `Esc` で閉じないようにします |
| `alert` | 真偽値 | `false` | アラートダイアログとして動作します |
| `close-label` | 文字列 | `"Close"` | 閉じるボタンのアクセシブルな名前 |
| `no-focus-trap` | 真偽値 | `false` | `Tab` によるフォーカスをダイアログ内に閉じ込めません |

| スロット | 内容 |
| --- | --- |
| （デフォルト） | 本文 |
| `header` | タイトル |
| `actions` | アクションのボタン |
| `close-icon` | 閉じるボタンのアイコン |

| イベント | 発生するタイミング |
| --- | --- |
| `opening`、`opened` | 開き始めたとき、開き終わったとき |
| `closing`、`closed` | 閉じ始めたとき、閉じ終わったとき |
| `cancel` | スクリムまたは `Esc` でキャンセルされたとき |

`m3e-dialog-trigger`（属性 `for`：ダイアログの id）はボタンの中に置き、ボタンがクリックされるとダイアログを開きます。`m3e-dialog-action`（属性 `return-value`）はダイアログ内のボタンの中に置き、クリックするとダイアログを閉じてその値を返します。

## 見た目のカスタマイズ

`--m3e-card-*` 変数で、カードの角の丸み、色、余白を調整します。たとえば `--m3e-card-shape` は角の丸みです。

```html
<m3e-card variant="outlined" style="--m3e-card-shape: 28px;">…</m3e-card>
```

コンポーネント（`@m3e/web/card`、`@m3e/web/dialog`）はテーマの `m3e.ts` で登録されています。
