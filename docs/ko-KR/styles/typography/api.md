---
tab: API
---

# 타이포그래피: API

## 언어별 글꼴

텍스트의 글꼴은 페이지 언어에 따라 달라집니다. 기본값은 [언어 팩](/ko-KR/theme/i18n/api#akarilanguage)의 `fonts`에서 가져옵니다. 기본 제공 언어 팩의 값은 아래와 같으며, [`fonts`](#fonts)로 모두 바꿀 수 있습니다.

| 언어 | Google Fonts에서 불러오는 글꼴 | 글꼴 스택 |
| --- | --- | --- |
| `ja` | Roboto, Noto Sans JP | Roboto, Noto Sans JP, Hiragino Sans, Hiragino Kaku Gothic ProN, Yu Gothic UI, Yu Gothic, Meiryo, system-ui, sans-serif |
| `ko` | Roboto, Noto Sans KR | Roboto, Noto Sans KR, Apple SD Gothic Neo, Malgun Gothic, system-ui, sans-serif |
| `ar` | Roboto, Noto Sans Arabic | Roboto, Noto Sans Arabic, Geeza Pro, Tahoma, system-ui, sans-serif |
| 그 밖의 언어 | Roboto, Noto Sans SC | Roboto, Noto Sans SC, PingFang SC, Microsoft YaHei, system-ui, sans-serif |

언어는 언어 팩 규칙으로 판별합니다. 먼저 전체 코드를, 다음으로 주 언어를 비교하므로 `ja-JP`는 `ja` 행을 따릅니다. 영어와 프랑스어처럼 `fonts`가 없는 언어 팩은 “그 밖의 언어” 행을 따릅니다.

- 이 Google Fonts 글꼴은 모두 가변 굵기 글꼴입니다. Noto Sans SC와 일본어, 한국어 글꼴은 유니코드 범위별로 나뉘어 있어, 페이지는 사용하는 문자만 내려받습니다.
- 각 언어는 자기 글꼴만 불러옵니다. 일본어, 한국어, 아랍어 글꼴은 해당 언어의 페이지에서만 불러오며, 그 언어로 전환할 때 내려받습니다.
- 글꼴은 페이지 표시를 막지 않습니다. `<head>`에는 사전 연결(preconnect)과 `preload` 하나만 있고, 스타일시트는 테마의 스크립트가 삽입하며, `display=swap`으로 텍스트를 먼저 대체 글꼴로 표시합니다. 스크립트가 없으면 `<noscript>` 안의 스타일시트가 적용됩니다. Google Fonts에 연결할 수 없으면 텍스트는 스택에서 그 뒤에 있는 시스템 글꼴을 씁니다.
- 다른 언어로 표시된 부분(언어 대화상자의 언어 이름 등)은 그 언어 팩의 스택 중 기기에 있는 글꼴을 씁니다.

## fonts

```ts
fonts?: {
  google?: boolean | string[];
  family?: string[];
};
```

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `google` | `boolean \| string[]` | `true` | Google Fonts에서 불러올 글꼴. `false`이면 아무것도 불러오지 않고 독자 기기의 글꼴만 씁니다. `true`이면 위 표에서 해당 언어의 글꼴을 불러옵니다. 배열이면 불러올 글꼴을 나열하며, 각 항목은 Google Fonts css2 API의 `family` 매개변수 형식으로 씁니다. 예: `"Noto Sans JP:wght@100..900"` |
| `family` | `string[]` | 위 표에서 해당 언어의 스택 | 텍스트의 `font-family`. 순서대로 적용되어 각 문자는 그 문자를 가진 첫 번째 글꼴을 씁니다. 글꼴 이름은 따옴표 없이 쓰고, `system-ui`, `sans-serif` 같은 일반 글꼴 계열은 그대로 씁니다 |

두 필드는 서로 독립적입니다. 다른 Google Fonts 글꼴로 바꿀 때는 `family`에도 넣으세요. 공통 구성에 쓰면 모든 언어에, 언어 구성에 쓰면 그 언어에만 적용됩니다.

```ts
// docs/config.ts: 모든 언어가 Google Fonts에서 글꼴을 불러오지 않음
export default defineAkariConfig({
  fonts: { google: false },
});
```

```ts
// docs/ja-JP/config.ts: 일본어 페이지에서 M PLUS 1p 사용
export default defineAkariConfig({
  fonts: {
    google: ["M PLUS 1p:wght@400;500;700"],
    family: ["M PLUS 1p", "Hiragino Sans", "Meiryo", "sans-serif"],
  },
});
```

모든 사이트에서 한 언어의 기본 글꼴을 바꾸려면 그 언어 팩의 `fonts`를 바꿉니다. 이 사이트에서만 바꾸려면 `fonts` 구성으로 충분합니다.

`akariContent`는 각 언어의 언어 팩과 구성에서 글꼴 스택(CSS 변수 `--akari-font-family`), `lang`으로 표시한 부분의 글꼴 규칙, 프리로드 태그를 만들어 그 언어 페이지의 `<head>`에 기록합니다. 그래서 첫 화면부터 올바른 글꼴을 씁니다. 언어를 전환하면 테마가 글꼴을 바꿉니다. 코드는 `docs/.vitepress/theme/fonts.ts`에 있습니다. `resolveFonts(fonts, defaults, languages)`는 구성과 언어 팩의 글꼴에서 스타일시트 URL과 `font-family`를 계산하고, `markedFontRules(languages)`는 표시한 부분의 글꼴 규칙을 만들고, `fontHead`는 `<head>` 태그를 만들고, `applyFonts`는 페이지에 적용합니다. `fonts`가 없는 언어 팩은 `AKARI_DEFAULT_FONTS`를 씁니다.

## 타이포그래피 토큰

m3e는 Material 3 타이포그래피 토큰을 제공합니다. 각 단계에는 네 가지 속성이 있습니다.

```text
--md-sys-typescale-{role}-{size}-font-size
--md-sys-typescale-{role}-{size}-line-height
--md-sys-typescale-{role}-{size}-font-weight
--md-sys-typescale-{role}-{size}-tracking
```

역할은 `display`, `headline`, `title`, `body`, `label`이고, 크기는 `large`, `medium`, `small`입니다. 예:

```css
.note {
  font-size: var(--md-sys-typescale-body-medium-font-size);
  line-height: var(--md-sys-typescale-body-medium-line-height);
}
```

## 문서 제목

| 요소 | 크기 | 줄 높이 | 굵기 | 600px 미만 |
| --- | --- | --- | --- | --- |
| `h1` | 3.5625rem (57px) | 1.12 | 400 | 2.5rem |
| `h2` | 1.75rem (28px) | 1.3 | 500 | 1.5rem |
| `h3` | 1.5rem (24px) | 1.35 | 500 | 1.25rem |
| `h4` | 1.25rem (20px) | 1.4 | 500 | 1.125rem |

2단계와 3단계 제목은 목차에 표시됩니다. 제목 위에 포인터를 올리면 앵커 링크가 나타납니다. 앵커 id는 VitePress가 제목 텍스트로 생성합니다.

## 표

`akariMarkdown`을 켜면 Markdown 표는 `.akari-table`로 감싸집니다.

- 틀은 모서리 반경 12px의 `outline-variant` 외곽선입니다. 안쪽에 세로선은 없고, 행은 구분선으로 나뉩니다.
- 머리글 행은 `surface-container` 위에 놓이며, 줄바꿈 없이 `on-surface-variant` 색상의 `label-large`를 씁니다. 셀은 `body-medium`을 씁니다.
- 포인터 아래의 행에는 상태 레이어가 표시됩니다. 너무 넓은 표는 문서 표면을 비좁게 만들지 않고 틀 안에서 가로로 스크롤됩니다.
- HTML로 직접 작성한 `<table>`에는 틀이 없습니다. 표 자체의 스타일은 같습니다.

## 링크

- 밑줄이 없습니다. 텍스트 앞에 텍스트와 같은 크기의 아이콘이 붙습니다. 사이트 안의 링크에는 `link`, `target="_blank"`인 링크에는 `open_in_new`가 붙습니다. 아이콘은 CSS 마스크로 그려지며, 오른쪽에서 왼쪽 레이아웃에서는 좌우가 반전됩니다.
- 포인터를 올리면 링크에 텍스트 버튼과 같은 상태 레이어가 표시됩니다.
- 아이콘이 없는 링크: 제목 앵커(`.header-anchor`), 각주 표시와 돌아가기 링크, 이미지를 감싼 링크, 컴포넌트 슬롯에 놓인 링크(`slot` 속성이 있는 링크).
- 강제 색상 모드에서는 링크에 시스템 링크 색상이 쓰입니다.

## 패턴 {#patterns}

글 안에서 배경이 있는 요소에는 히어로 카드처럼 거의 보이지 않는 패턴이 깔립니다.

| 요소 | 선택자 |
| --- | --- |
| 코드 블록 | `div[class*="language-"]` |
| 코드 그룹 탭 줄 | `.vp-code-group .tabs` |
| 표 | `.akari-table` |
| 콜아웃 블록 | `.custom-block` |
| 인용 | `blockquote` |
| 데모 영역 | `.demo-surface` |

- 페이지 전체가 하나의 패턴을 공유하며, 히어로의 `pattern`으로 정합니다. 기본적으로 콘텐츠가 로드될 때마다 점, 격자, 십자, 사선, 물결 중 하나가 무작위로 선택됩니다. 패턴은 문서 표면의 `data-pattern` 속성에 기록되며, 패턴이 없으면 이 속성도 없습니다.
- 평소에는 요소의 위쪽 끝(end) 모서리에서만 패턴이 희미하게 보입니다. 포인터가 요소 위에 머물면 그 주위로 테마 색상의 아주 옅은 빛이 켜집니다. 빛 안에서는 패턴이 조금 더 또렷해지고, 가장자리는 단계적으로 흐려집니다. 포인터가 떠나면 빛이 서서히 사라집니다.
- 장식은 콘텐츠 아래의 `::before`(패턴)와 `::after`(빛)에 그려지므로 읽기, 선택, 클릭을 방해하지 않습니다. 빛은 포인터가 마우스나 펜으로 가리키는 동안에만 나타납니다. 테마는 브라우저가 `(hover: hover)` 미디어 쿼리로 추측하는 대신 실제 포인터 이벤트의 종류로 판단하므로, 터치스크린이 달린 컴퓨터도 마우스 아래에서는 빛이 나타납니다. 터치스크린에서는 정적인 패턴만 보이며, 탭해도 빛이 남지 않습니다. “동작 줄이기”를 켜면 패턴과 빛이 전환 효과 없이 바로 나타납니다. 강제 색상 모드에서는 장식이 표시되지 않습니다.
- `.akari-doc`의 `--akari-pattern-glow`(기본값 `4%`)와 `--akari-pattern-spot`(기본값 `0.1`)으로 강도를 조절합니다.

## 코드 블록

- 구문 강조는 `github-light`와 `github-dark` 테마를 쓰며, 라이트 모드와 다크 모드에 따라 전환됩니다.
- 복사 버튼은 VitePress의 `button.copy`입니다. 툴팁 텍스트는 언어 팩의 `markdown.codeCopyButton`에서 가져오며, 언어 구성에서 재정의할 수 있습니다.
- 600px 미만에서는 코드 블록의 모서리 반경이 12px로 줄어듭니다.
