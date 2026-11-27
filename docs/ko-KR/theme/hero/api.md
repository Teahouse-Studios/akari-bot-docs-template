---
tab: API
---

# 히어로: API

## hero

페이지 프런트매터의 `hero`입니다. 문자열로 쓰면 이미지 URL로 취급합니다.

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `image` | `string \| { src, alt? } \| { light, dark, alt? }` | 필수 | 이미지 URL. 사이트 경로에는 `base`가 자동으로 붙고, 외부 URL은 그대로 씁니다. `{ light, dark }`로 쓰면 두 이미지를 각각 라이트 모드와 다크 모드에서 씁니다 |
| `alt` | `string` | `""` | 이미지의 대체 텍스트. 순수한 장식용 이미지라면 비워 둡니다 |
| `date` | `string \| Date` | 없음 | 제목 위에 표시됩니다. `2026-05-19` 같은 날짜는 페이지 언어에 맞게 형식화되어 `<time datetime="2026-05-19">` 태그로 출력되고, 그 밖의 텍스트는 쓴 그대로 표시됩니다 |
| `tagline` | `string` | 페이지의 `description` | 제목 아래의 한 줄 요약 |
| `background` | `string` | `--md-sys-color-primary-container` | 이미지 카드의 배경색. CSS 색상이나 토큰이면 무엇이든 됩니다 |
| `fit` | `"cover" \| "contain"` | `"cover"` | `cover`는 카드를 채우고 넘치는 부분을 잘라 냅니다. `contain`은 여백을 두고 이미지 전체를 보여 주며, 배경이 투명한 일러스트에 어울립니다 |
| `color` | `string \| false` | 이미지에서 추출(빌드 시) | 이 페이지의 테마 시드 색상. `#rrggbb`는 그 색상으로 고정하고, `false`는 독자가 설정에서 고른 색상을 유지합니다 |
| `pattern` | `"dots" \| "grid" \| "plus" \| "diagonal" \| "waves" \| "none" \| "auto"` | `"auto"` | 페이지에 숨어 있는 패턴: 점, 격자, 더하기 기호, 대각선, 물결. `none`은 패턴을 표시하지 않고, `auto`는 콘텐츠를 불러올 때마다 무작위로 하나를 고릅니다 |

`pattern`은 페이지 전체에 적용됩니다. 히어로 카드와 콘텐츠 안에서 배경이 있는 요소가 같은 패턴을 씁니다. 히어로가 없는 페이지도 무작위로 하나를 고릅니다.

```yaml
hero:
  image:
    light: /hero/theme-hero.svg
    dark: /hero/theme-hero-dark.svg
    alt: 데스크톱 창과 휴대폰에 표시된 문서 테마 인터페이스
  date: 2026-10-28
  tagline: 프런트매터에 이미지를 넣습니다
  fit: contain
  color: "#6750a4"
  pattern: dots
```

## CSS 변수 {#css-variables}

| 변수 | 기본값 | 용도 |
| --- | --- | --- |
| `--akari-doc-hero-inset` | `8px` | 카드와 표면 가장자리 사이, 그리고 두 카드 사이의 거리 |
| `--akari-doc-hero-text-color` | `--md-sys-color-surface-container` | 텍스트 카드의 배경색 |
| `--akari-doc-hero-media-color` | `--md-sys-color-primary-container` | 이미지 카드의 기본 배경색. `background`가 우선합니다 |
| `--akari-pattern-glow` | `4%` | 포인터 주변 빛의 세기 |
| `--akari-pattern-spot` | `0.1` | 빛 안에서 패턴이 드러나는 정도 |

처음 세 변수는 `:root`에 설정할 수 있습니다. 두 패턴 변수는 문서 표면 `.akari-doc`에 정의되어 있으므로 `.akari-doc`에서 재정의하세요.

## 히어로 컴포넌트 대체

히어로를 직접 만든 컴포넌트로 대체할 수 있습니다. [테마 확장](/ko-KR/theme/extending/api#provideakaricomponents)을 참고하세요. 레이아웃은 페이지가 이미지가 있는 `hero`를 설정했을 때만 이 컴포넌트를 렌더링하고 콘텐츠의 첫 번째 `h1`을 숨기므로, 사용자 지정 컴포넌트는 페이지 제목을 직접 렌더링해야 합니다. 제목에 `data-akari-page-title` 속성을 주면 앱 바의 제목 전환이 이 제목을 따릅니다. 컴포넌트 안에서는 VitePress의 `useData()`로 프런트매터를 읽습니다. 레이아웃은 컴포넌트의 루트 요소에 `akari-doc__page` 클래스를 붙이므로, 같은 병렬 페이지 그룹의 페이지 사이를 전환하면 히어로가 본문과 함께 좌우로 슬라이드됩니다. 다만 루트 노드가 여러 개인 컴포넌트에는 이 클래스가 붙지 않아서, 히어로는 제자리에 머뭅니다.
