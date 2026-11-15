---
tab: API
---

# ナビゲーション：API

以下の内容は `@m3e/web` 2.10.3 のコンポーネントのメタデータに基づいています。

## m3e-nav-menu と m3e-nav-menu-item

`m3e-nav-menu` には属性がありません。デフォルトスロットに `m3e-nav-menu-item` 要素を入れます。

| 属性 | 値 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `open` | 真偽値 | `false` | 子の項目を展開します |
| `selected` | 真偽値 | `false` | 現在の項目。コンポーネントが `aria-current` に対応付けます |
| `disabled` | 真偽値 | `false` | この項目とすべての子を無効にします |

| スロット | 内容 |
| --- | --- |
| （デフォルト） | 入れ子の子項目 |
| `label` | テキスト。通常はリンク |
| `icon` | アイコン |
| `selected-icon` | 選択時のアイコン |
| `badge` | バッジ |
| `toggle-icon` | 展開・折りたたみのアイコン |

| イベント | 発生するタイミング |
| --- | --- |
| `opening`、`opened`、`closing`、`closed` | 展開と折りたたみの開始時と終了時 |
| `click` | クリック時 |

## m3e-tabs、m3e-tab、m3e-tab-panel

| `m3e-tabs` の属性 | 値 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `variant` | `primary`、`secondary` | `secondary` | 外観 |
| `stretch` | 真偽値 | `false` | タブを同じ幅にしてコンテナを埋めます |
| `header-position` | `before`、`after` | `before` | タブバーをパネルの前と後ろのどちらに置くか |
| `disable-pagination` | 真偽値 | `false` | タブがあふれたときのページ送りボタンを非表示にします |
| `disable-swipe` | 真偽値 | `false` | パネルのスワイプによるタブの切り替えをオフにします |
| `previous-page-label`、`next-page-label` | 文字列 | `"Previous page"`、`"Next page"` | ページ送りボタンのアクセシブルな名前 |

| `m3e-tab` の属性 | 値 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `for` | パネルの id | なし | 対応する `m3e-tab-panel` |
| `selected` | 真偽値 | `false` | 現在のタブ。1 つだけ指定できます |
| `disabled` | 真偽値 | `false` | 無効 |

`m3e-tab` と `m3e-tab-panel` は、[概要](/ja-JP/components/navigation#tabs) の例のように `m3e-tabs` の中に直接書きます。`prev-icon` と `next-icon` のスロットでページ送りのアイコンを置き換えられます。タブを切り替えると `beforeinput`（キャンセル可能）、`input`、`change` が発生します。`m3e-tab` には `icon` スロットもあります。

## m3e-chip と m3e-filter-chip

| 属性 | 対象 | 値 | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `variant` | 両方 | `outlined`、`elevated` | `outlined` | 外観 |
| `value` | 両方 | 文字列 | なし | 値 |
| `selected` | フィルター | 真偽値 | `false` | 選択状態 |
| `disabled`、`disabled-interactive` | フィルター | 真偽値 | `false` | 無効 |

どちらにもデフォルトスロット（テキスト）と、`icon`、`trailing-icon` のスロットがあります。`m3e-chip` は操作できません。`m3e-filter-chip` は切り替え時に `beforeinput`、`input`、`change` を発生させます。

`m3e-filter-chip-set` はフィルターチップのグループを囲みます。`multi` で複数選択を許可し、`vertical` で縦に並べ、`hide-selection-indicator` で選択のマークを非表示にし、`disabled` でグループ全体を無効にします。`name` はフォーム用です。選択が変わると `change` を発生させます。

## m3e-badge

| 属性 | 値 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `size` | `small`、`medium`、`large` | `medium` | サイズ |
| `for` | 要素の id | なし | バッジをこの要素に固定します |
| `position` | `above-after`、`above-before`、`below-before`、`below-after`、`before`、`after`、`above`、`below` | `above-after` | 固定したときの要素に対する位置 |

バッジにはデフォルトの ARIA ロールがありません。操作できる要素に付けるときは、`aria-describedby` または対応する表示テキストで数を説明してください。

コンポーネント（`@m3e/web/nav-menu`、`@m3e/web/tabs`、`@m3e/web/chips`、`@m3e/web/badge`）はテーマの `m3e.ts` で登録されています。
