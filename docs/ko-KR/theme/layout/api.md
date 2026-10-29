---
tab: API
---

# 레이아웃과 앱 바: API

## appBar

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `title` | `string` | 사이트 `title` | 앱 바에 표시되는 사이트 이름 |
| `version` | `string` | 없음 | 이름 옆의 버전 라벨. 예: `v1.0.0` |
| `logo` | `string` | 구성의 `logo` | 브랜드 이미지. 사이트 경로에는 `base`가 자동으로 붙습니다 |
| `showSidebarToggle` | `boolean` | `true` | 좁은 화면에서 내비게이션 드로어를 여는 메뉴 버튼을 표시할지 여부 |
| `showSettingsToggle` | `boolean` | `true` | 설정 버튼을 표시할지 여부. `settings.enabled`가 `false`이면 항상 숨겨집니다 |
| `socialLinks` | `AkariSocialLink[]` | `[]` | 소셜 링크. 새 탭에서 열립니다 |

`AkariSocialLink`의 필드:

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `icon` | `string` | `github`와 `npm`은 기본 제공 브랜드 마크를 표시하고, 그 밖의 값은 등록된 m3e 아이콘의 이름으로 씁니다 |
| `link` | `string` | URL |
| `label` | `string` | 버튼의 접근 가능한 이름과 툴팁 텍스트이며, “더보기” 메뉴에 표시되는 텍스트이기도 합니다 |

## toc

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | 목차(오른쪽 목차와 좁은 화면의 목차 버튼)를 표시할지 여부 |
| `maxDepth` | `number` | `3` | `h2`부터 `h{maxDepth}`까지 나열합니다. 1–6으로 제한됩니다 |
| `overline` | `string` | 언어에 따라 다름. “이 페이지의 내용” | 목차 상단의 작은 제목이자 목차 내비게이션의 접근 가능한 이름 |

한 페이지에서만 목차를 끄려면 그 페이지의 프런트매터에 `toc: false`를 씁니다. `m3e-toc-ignore` 속성이 있는 제목은 목차에서 제외됩니다.

## loadingBar

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | 페이지를 불러오는 동안 창 맨 위에 진행 막대를 표시할지 여부 |

## footer

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `message` | `string` | 언어에 따라 다름 | 푸터에서 로고와 사이트 이름 아래에 표시되는 텍스트 |
| `copyright` | `string` | `""` | 푸터 하단의 저작권 표시. 비어 있으면 표시되지 않습니다 |
| `showPrevNext` | `boolean` | `true` | 병렬 페이지의 콘텐츠 끝에 그룹의 이전 페이지와 다음 페이지 카드를 표시할지 여부 |
| `links` | `AkariFooterLinkGroup[] \| false` | 내비게이션에서 가져옴 | 푸터의 링크 열. 기본값은 내비게이션의 처음 네 카테고리이며, 열마다 최대 6개 항목입니다. `false`이면 숨깁니다 |

```ts
footer: {
  links: [
    {
      title: "자료",
      items: [
        { text: "GitHub", link: "https://github.com/OasisAkari/vitepress-theme-akari-docs" },
        { text: "변경 내역", link: "/changelog" },
      ],
    },
  ],
},
```

외부 링크는 새 탭에서 열립니다. 병렬 페이지 그룹은 링크 열에서 항목 하나가 됩니다.

## CSS 변수 {#css-variables}

사이트 스타일에서(예: `:root`에서) 재정의합니다.

| 변수 | 기본값 | 용도 |
| --- | --- | --- |
| `--akari-doc-radius` | `28px` | 문서 표면과 푸터 표면의 모서리 반경 |
| `--akari-doc-padding` | `32px` | 표면의 안쪽 여백, 그리고 콘텐츠와 목차 사이의 간격 |
| `--akari-doc-top-space` | `32px` | 문서 표면과 앱 바 사이의 거리 |
| `--akari-doc-max-width` | `1280px` | 표면 안 콘텐츠와 목차의 최대 너비. 푸터 콘텐츠도 같은 너비를 씁니다 |
| `--akari-doc-text-measure` | `760px` | 단락, 목록, 인용문, 콜아웃의 최대 줄 길이 |
| `--akari-doc-text-offset` | `22px` | 제목에 비해 단락을 들여 쓰는 정도 |
| `--akari-doc-toc-offset` | `128px` | 목차가 앱 바에서 얼마나 아래에 고정되는지 |
| `--akari-toc-width` | `208px` | 목차의 너비 |
| `--akari-doc-gap` | `16px` | 앵커로 이동한 뒤 제목과 앱 바 사이의 거리 |
| `--akari-doc-surface-color` | `--md-sys-color-surface` | 문서 표면과 푸터 표면의 배경색. 색상 토큰이 해석되도록 `m3e-theme` 안(예: `.akari-main`)에서 설정합니다 |
| `--akari-doc-divider-strength` | `30%` | 레일 구분선과 스크롤 후 표면 외곽선의 세기 |
| `--akari-wavy-divider-color` | `--md-sys-color-outline-variant` | 푸터 위 물결 구분선의 색상 |
| `--akari-doc-app-bar-height` | `64px` | 앱 바의 높이. 읽기 전용이며, 고정 위치를 계산하는 데 씁니다 |
| `--akari-doc-rail-width` | `96px` | 레일의 너비. 읽기 전용 |
| `--akari-loading-bar-height` | `4px` | 로딩 바의 높이 |
| `--akari-loading-bar-color` | `--md-sys-color-primary` | 로딩 바의 색상 |

```css
:root {
  --akari-doc-radius: 24px;
  --akari-doc-max-width: 1440px;
}

.akari-main {
  --akari-doc-surface-color: var(--md-sys-color-surface-container-lowest);
}
```

## 페이지 상태

| 표시 | 위치 | 의미 |
| --- | --- | --- |
| `data-akari-ready` | `html` | m3e 컴포넌트 등록이 끝났습니다 |
| `data-akari-scrolled` | `html` | 문서 표면이 앱 바 아래로 스크롤되었습니다 |
| `akari-tabs-pinned` | `html`의 클래스 이름 | 병렬 페이지의 탭 바가 앱 바 아래에 고정되어 있습니다 |
| `data-akari-page-title` | 요소 | 앱 바 제목 전환이 따르는 페이지 제목. 기본값은 콘텐츠의 `h1` 또는 히어로 안의 제목입니다 |

| 요소 id | 내용 |
| --- | --- |
| `akari-doc-content` | 콘텐츠 컨테이너. 목차가 여기서 제목을 읽습니다. 내보낸 `AKARI_CONTENT_ID` |
| `akari-sidebar` | 모바일 내비게이션 드로어. `AKARI_SIDEBAR_ID` |
| `akari-settings` | 설정 패널. `AKARI_SETTINGS_ID` |

## 컴포넌트 대체

앱 바, 데스크톱 내비게이션, 모바일 드로어, 히어로, 목차, 페이지 이동 카드, 푸터, 콘텐츠 컨테이너를 대체할 수 있습니다. [테마 확장](/ko-KR/theme/extending/api#provideakaricomponents)을 참고하세요.
