---
tab: API
---

# ボタン：API

以下の内容は `@m3e/web` 2.10.3 のコンポーネントのメタデータに基づいています。

## m3e-button

| 属性 | 値 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `variant` | `elevated`、`filled`、`tonal`、`outlined`、`text` | `text` | 外観 |
| `size` | `extra-small`、`small`、`medium`、`large`、`extra-large` | `small` | サイズ |
| `shape` | `rounded`、`square` | `rounded` | シェイプ |
| `disabled` | 真偽値 | `false` | 無効で、フォーカスもできません |
| `disabled-interactive` | 真偽値 | `false` | 無効だがフォーカス可能なため、読者は操作の存在に気づけます |
| `toggle` | 真偽値 | `false` | 2 状態のトグルとして動作します |
| `selected` | 真偽値 | `false` | トグルの選択状態 |
| `href` | 文字列 | `""` | 設定するとボタンがリンクになります |
| `target` | `_self`、`_blank`、`_parent`、`_top`、またはウィンドウ名 | `""` | リンクを開く場所 |
| `rel` | 文字列 | `""` | リンクと現在のページの関係 |
| `download` | 文字列 | なし | ダウンロードリンクにします。値はファイル名です |
| `type` | `button`、`submit`、`reset` | `button` | フォーム内での動作 |
| `name`、`value` | 文字列 | なし | フォーム送信時に送られる名前と値 |

| スロット | 内容 |
| --- | --- |
| （デフォルト） | ボタンのテキスト |
| `icon` | テキストの前のアイコン |
| `trailing-icon` | テキストの後ろのアイコン |
| `selected` | 選択時のテキスト |
| `selected-icon` | 選択時のアイコン |

| イベント | 発生するタイミング |
| --- | --- |
| `click` | クリック時 |
| `beforeinput` | トグルが切り替わる直前。キャンセルできます |
| `input`、`change` | トグルが切り替わった後 |

## m3e-icon-button

`m3e-button` と同じ属性に加えて、次の属性があります。

| 属性 | 値 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `variant` | `standard`、`filled`、`tonal`、`outlined`、`elevated` | `standard` | 外観 |
| `width` | `default`、`narrow`、`wide` | `default` | 幅 |

| スロット | 内容 |
| --- | --- |
| （デフォルト） | アイコン |
| `selected` | 選択時のアイコン |

イベントは `m3e-button` と同じです。

## m3e-tooltip

| 属性 | 値 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `for` | 要素の id | なし | ツールチップが属するコントロール |
| `position` | `above`、`below`、`before`、`after` | `below` | コントロールに対する位置 |
| `show-delay` | ミリ秒 | `0` | 表示までの遅延 |
| `hide-delay` | ミリ秒 | `200` | 非表示までの遅延 |
| `touch-gestures` | `auto`、`on`、`off` | `auto` | タッチジェスチャーの扱い |
| `disabled` | 真偽値 | `false` | ツールチップを無効にします |

## ドキュメントでボタンを使う

- `href` を持つサイト内の `m3e-button` はテーマが引き継ぎ、ページ内で切り替えます。`target="_self"` のときはページ全体を読み込みます。スクリプトからナビゲーションする必要がある場合は、`useRouter().go()` を呼び出してください。[ナビゲーション](/ja-JP/components/navigation#spa-navigation) を参照してください。
- 見た目のサイズにかかわらず、ボタンは少なくとも 48×48dp のタッチターゲットを保ちます。
- コンポーネント（`@m3e/web/button`、`@m3e/web/icon-button`、`@m3e/web/tooltip`）はテーマの `m3e.ts` で登録されています。
