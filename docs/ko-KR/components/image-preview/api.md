---
tab: API
---

# 이미지 미리보기: API

`AkariImagePreview` 는 `@m3e/web` 이 아니라 테마 자체의 컴포넌트이며 대응하는 `m3e-` 요소가 없습니다. `--md-sys-color-*` 와 `--md-sys-motion-*` 토큰을 읽으므로 설정의 색과 동작을 따릅니다.

## AkariImagePreview

| 속성 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `src` | `string` | 필수 | 확대해 보여 줄 이미지. 기본 썸네일의 주소로도 쓰인다 |
| `alt` | `string` | `""` | 이미지 설명. 미리보기 대화 상자의 `aria-label` 로도 쓰인다 |
| `label` | `string` | 현재 언어의 `imagePreviewOpen` | 트리거 버튼의 `aria-label` 과 `title` |
| `open` | `boolean \| null` | `null` | 제어용 열림 상태. 지정하면 트리거 버튼을 그리지 않고 `v-model:open` 으로 상태를 다룬다 |
| `origin` | `HTMLElement \| null` | `null` | 제어 모드에서 열 때 확대 표시가 드나드는 기준 요소 |

| 슬롯 | 내용 |
| --- | --- |
| 기본 | 썸네일. 컴포넌트가 `<button>` 으로 감싸고 호버 시 나타나는 확대 아이콘을 붙인다 |

| 출력 | 설명 |
| --- | --- |
| `update:open` | 미리보기가 열리거나 닫힐 때 발생한다. `v-model:open` 과 함께 쓴다 |

| CSS 클래스 | 위치 |
| --- | --- |
| `.akari-image-preview` | 루트 요소, 인라인 배치 |
| `.akari-image-preview__trigger` | 썸네일을 감싸는 버튼 |
| `.akari-image-preview__thumb` | 기본 썸네일 |
| `.akari-image-preview__overlay` | 미리보기 층, `.akari-frame` 으로 텔레포트한다 |

## 내보내기

컴포넌트와 기하 계산은 테마 진입점에서 내보냅니다.

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

| 이름 | 설명 |
| --- | --- |
| `IMAGE_PREVIEW_FIT` | 미리보기를 열 때의 초기 배율, `1` |
| `IMAGE_PREVIEW_MIN_SCALE`, `IMAGE_PREVIEW_MAX_SCALE` | 확대 한계, `0.5` 와 `4` |
| `IMAGE_PREVIEW_ZOOM_STEP` | 버튼 한 번의 확대 거리, `0.25` |
| `IMAGE_PREVIEW_WHEEL_FACTOR` | 휠 한 칸의 배율, `1.1` |
| `IMAGE_PREVIEW_ROTATION_STEP` | 회전 버튼 한 번의 각도, `90` |
| `clampImageScale(scale)` | 범위로 자르고 정수 퍼센트로 반올림한다 |
| `zoomImageScale(scale, delta)` | 한 단계 더하고 자른다 |
| `wheelImageScale(scale, direction)` | 휠 방향으로 배율을 곱하고 자른다 |
| `rotateImage(rotation, delta)` | 주어진 각도만큼 돌린다 |
| `uprightRotation(rotation)` | 가장 가까운 한 바퀴 각도, 보기 초기화에 쓴다 |
| `unwindRotation(rotation)` | 닫을 때 돌아갈 가장 가까운 한 바퀴 각도, 반 바퀴일 때는 반대 방향 |
| `isImageTransformed(view)` | 확대·회전·이동이 있었는지 |
| `previewChrome(viewportWidth)` | 미리보기 층이 도구 모음을 위해 비우는 높이 |
| `rotationFitScale(rotation, image, viewport, chrome)` | 가로세로가 바뀐 뒤 화면에 맞추는 비율 |
| `scaleLabel(scale)` | `1.05` 를 `105%` 로 읽는다 |
| `ImagePreviewView`, `ImagePreviewSize` | 보기와 크기의 타입 정의 |

## 접근성

- 트리거에는 이름이 있고 썸네일에는 `alt` 가 있다. `alt` 가 비면 설명 없는 라벨을 쓴다.
- 미리보기 층은 `role="dialog"` 와 `aria-modal="true"` 를 가지며, 열면 초점을 받고 `Esc` 로 닫히며 닫은 뒤 초점은 트리거로 돌아간다.
- 여는 동안 페이지 스크롤을 잠근다. “동작 줄이기”가 켜져 있으면 이동 애니메이션을 재생하지 않는다.
