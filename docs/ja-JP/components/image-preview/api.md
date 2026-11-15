---
tab: API
---

# 画像プレビュー：API

`AkariImagePreview` は `@m3e/web` ではなくテーマ側のコンポーネントで、対応する `m3e-` 要素はありません。`--md-sys-color-*` と `--md-sys-motion-*` のトークンを読むため、設定の配色とモーションに追従します。

## AkariImagePreview

| プロパティ | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `src` | `string` | 必須 | 開いたときに表示する画像。既定のサムネイルの取得先にもなる |
| `alt` | `string` | `""` | 画像の説明。プレビューダイアログの `aria-label` にもなる |
| `label` | `string` | 現在の言語の `imagePreviewOpen` | トリガーのボタンの `aria-label` と `title` |

| スロット | 内容 |
| --- | --- |
| 既定 | サムネイル。コンポーネントはこれを `<button>` で包み、ホバーで現れる拡大アイコンを添える |

| 出力 | 説明 |
| --- | --- |
| イベントなし | 開閉と表示状態はコンポーネント自身が持つ |

| CSS クラス | 位置 |
| --- | --- |
| `.akari-image-preview` | ルート要素。インラインで並ぶ |
| `.akari-image-preview__trigger` | サムネイルを包むボタン |
| `.akari-image-preview__thumb` | 既定のサムネイル |
| `.akari-image-preview__overlay` | プレビュー層。`.akari-frame` にテレポートする |

## エクスポート

コンポーネントと幾何計算はテーマのエントリーからエクスポートされます。

```ts
import {
  AkariImagePreview,
  clampImageScale,
  zoomImageScale,
  wheelImageScale,
  rotateImage,
  uprightRotation,
  unwindRotation,
  isImageTransformed,
  previewChrome,
  rotationFitScale,
  scaleLabel,
} from "vitepress-akari-theme-docs";
```

| 名前 | 説明 |
| --- | --- |
| `IMAGE_PREVIEW_FIT` | プレビューを開くときの初期倍率。`1` |
| `IMAGE_PREVIEW_MIN_SCALE`、`IMAGE_PREVIEW_MAX_SCALE` | 拡大率の上下限。`0.5` と `4` |
| `IMAGE_PREVIEW_ZOOM_STEP` | ボタン一回の拡大距離。`0.25` |
| `IMAGE_PREVIEW_WHEEL_FACTOR` | ホイール一目盛りの倍率。`1.1` |
| `IMAGE_PREVIEW_ROTATION_STEP` | 回転ボタン一回の角度。`90` |
| `clampImageScale(scale)` | 範囲に収め、整数パーセントに丸める |
| `zoomImageScale(scale, delta)` | 一段階足して収める |
| `wheelImageScale(scale, direction)` | ホイールの向きで倍率をかけ収める |
| `rotateImage(rotation, delta)` | 指定した角度だけ回す |
| `uprightRotation(rotation)` | 最も近い一周の角度。表示の初期化に使う |
| `unwindRotation(rotation)` | 閉じるときに戻る最も近い一周の角度。半周のときは逆方向 |
| `isImageTransformed(view)` | 拡大・回転・移動が行われたか |
| `previewChrome(viewportWidth)` | プレビュー層がツールバーに空ける高さ |
| `rotationFitScale(rotation, image, viewport, chrome)` | 縦横が入れ替わったあと画面に収めるための比率 |
| `scaleLabel(scale)` | `1.05` を `105%` と読む |
| `ImagePreviewView`、`ImagePreviewSize` | 表示とサイズの型定義 |

## アクセシビリティ

- トリガーには名前があり、サムネイルには `alt` がある。`alt` が空のときは説明のないラベルを使う。
- プレビュー層は `role="dialog"` と `aria-modal="true"` を持ち、開くとフォーカスを得て、`Esc` で閉じ、閉じたあとはトリガーにフォーカスが戻る。
- 開いている間はページのスクロールを止める。「モーションを減らす」が有効なときは移動のアニメーションを再生しない。
