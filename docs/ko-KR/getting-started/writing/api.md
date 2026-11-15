---
tab: API
---

# 페이지 작성: API

## 프런트매터 {#frontmatter}

| 필드 | 타입 | 사용 위치 | 설명 |
| --- | --- | --- | --- |
| `title` | `string` | 모든 페이지 | 페이지 제목이자 내비게이션에 표시되는 글의 이름. 기본값은 첫 번째 h1 제목이고, 없으면 폴더 이름입니다 |
| `description` | `string` | 모든 페이지 | 페이지 설명. `<meta name="description">`에 기록되며, 히어로의 기본 요약이기도 합니다 |
| `icon` | `string` | 글 | 내비게이션 항목의 아이콘. 등록된 아이콘이어야 합니다 |
| `badge` | `string` | 글 | 내비게이션 항목의 배지. 예: `New` |
| `order` | `number` | 글 | 카테고리 안에서의 위치. 작은 값이 앞에 옵니다. `order`가 없는 글은 그 뒤에 폴더 이름순으로 정렬됩니다 |
| `parallel` | `string[]` | 글 | 병렬 페이지. 같은 폴더에 있는 다른 `.md` 파일의 이름(`.md`는 생략 가능)이며, 탭 바 순서대로 글 뒤에 배치됩니다 |
| `tab` | `string` | 글과 병렬 페이지 | 탭 바에 표시되는 제목. 기본값은 페이지 제목입니다 |
| `category` | `string` | 언어 홈 페이지 | 홈 페이지는 기본적으로 내비게이션에 없습니다. 카테고리의 폴더 이름을 지정하면 그 카테고리에 들어가며, `order`가 없으면 맨 앞에 옵니다 |
| `hero` | `string \| object` | 모든 페이지 | 페이지 상단의 히어로. 필드는 [히어로](/ko-KR/theme/hero/api)를 참고하세요 |
| `toc` | `boolean` | 모든 페이지 | `false`이면 오른쪽 목차와 좁은 화면의 목차 버튼을 숨깁니다 |

글은 카테고리 폴더 안에 있는 폴더의 `index.md`입니다. VitePress 자체의 프런트매터 필드(`head`, `titleTemplate` 등)도 평소처럼 동작합니다.

```yaml
---
title: 아이콘
description: 테마가 사용하는 Material Symbols 아이콘
icon: interests
order: 2
badge: New
tab: 개요
parallel:
  - choosing
  - using
hero:
  image: /hero/icons-hero.svg
  fit: contain
---
```

## 표

표준 파이프 문법을 씁니다. `akariMarkdown`을 켜면 각 표는 M3 외곽선 테두리가 있는 컨테이너로 감싸지고, 너무 넓은 표는 테두리 안에서 가로로 스크롤됩니다.

```md
| 필드 | 설명 |
| --- | --- |
| `title` | 페이지 제목 |
```

HTML로 직접 작성한 `<table>`에는 바깥 컨테이너가 없습니다. 표 자체의 스타일은 같습니다.

## 이미지 {#images}

```md
![설명](./image.png)
![설명](/hero/image.svg)
![설명](https://example.com/image.png)
```

페이지를 렌더링할 때 모든 Markdown 이미지에 각자의 `width`와 `height`가 지정됩니다. 페이지는 이미지가 로드되기 전에 그 자리를 확보해 두므로, 로드된 뒤에도 화면이 흔들리지 않습니다. 이미지는 여전히 `max-width: 100%`로 크기가 조절되며 가로세로 비율을 유지합니다.

| 이미지 | 측정 주체 |
| --- | --- |
| 글 폴더 안(`./image.png`) | 소스 파일 옆의 이미지를 읽는 VitePress |
| `docs/public` 안(`/hero/image.svg`) | VitePress |
| 원격(`https://…`) | 테마가 추가한 [markdown-it-image-size](https://github.com/boyum/markdown-it-image-size). 페이지를 렌더링할 때 이미지를 내려받아 크기를 읽고, URL별로 일주일 동안 캐시합니다(`node_modules/markdown-it-image-size/.cache`) |

- `width`나 `height` 중 하나만 있는 로컬 이미지는 나머지 값이 비율에 맞게 채워집니다. 둘 다 있는 이미지는 그대로 둡니다.
- 원격 이미지를 내려받지 못하면(오프라인, 잘못된 URL) 터미널에 알림이 표시되고, 그 이미지에는 너비와 높이가 지정되지 않으며, 페이지는 평소처럼 생성됩니다. 다운로드는 동기적으로 이루어지므로 개발 서버가 새 원격 이미지가 있는 페이지를 렌더링할 때 잠시 멈춥니다. 그 뒤에는 캐시가 바로 응답합니다.
- HTML로 직접 작성한 `<img>`는 측정하지 않습니다. 너비와 높이를 직접 작성하세요.
- 원격 이미지 측정을 끄거나 캐시를 조정하려면 `.vitepress/config.mts`에서 설정합니다. [구성](/ko-KR/getting-started/configuration/api#akarimarkdown)을 참고하세요.

## 링크

본문의 링크 앞에는 텍스트와 같은 크기의 아이콘이 붙습니다. 내부 링크에는 `link`, 새 탭에서 열리는 링크(`target="_blank"`, 외부 링크 포함)에는 `open_in_new`가 붙습니다. 다음 링크에는 아이콘이 없습니다: 제목 앵커, 이미지를 감싼 링크, 각주 표시, 컴포넌트 슬롯에 놓인 링크(`slot` 속성이 있는 링크).

## 사용자 정의 컨테이너와 코드

VitePress의 사용자 정의 컨테이너와 코드 그룹에는 모두 대응하는 테마 스타일이 있습니다.

````md
::: tip 팁
선택적인 참고 사항입니다.
:::

::: warning
주의해야 할 사항입니다.
:::

::: code-group

```bash [npm]
npm install
```

```bash [pnpm]
pnpm install
```

:::
````

사용자 정의 컨테이너에는 `info`, `tip`, `warning`, `danger`, `details`가 있습니다. 언어를 지정한 코드 블록에는 구문 강조와 복사 버튼이 붙습니다. 복사 버튼의 텍스트와 제목을 쓰지 않은 컨테이너의 제목은 언어 팩의 `markdown`에서 가져오며, 언어 구성에서 재정의할 수 있습니다.

## 데모 보조 클래스

| 클래스 | 용도 |
| --- | --- |
| `demo-surface` | 외곽선과 `surface-container-low` 배경이 있는 데모 영역. 모서리 반경과 안쪽 여백 16px |
| `demo-row` | 줄바꿈되는 가로 행. 간격 12px |
| `demo-grid` | 카드 그리드. 각 열은 최소 240px이고, 좁은 화면에서는 한 열 |
| `demo-stack` | 세로 스택. 간격 16px |

```html
<div class="demo-surface">
  <div class="demo-row">
    <m3e-button variant="filled">확인</m3e-button>
    <m3e-button variant="outlined">취소</m3e-button>
  </div>
</div>
```

## m3e 컴포넌트

등록된 m3e 컴포넌트는 Markdown에 직접 쓸 수 있습니다. 테마는 `docs/.vitepress/theme/m3e.ts`에서 다음 컴포넌트를 등록합니다.

`app-bar`, `badge`, `button`, `card`, `checkbox`, `chips`, `content-pane`, `dialog`, `divider`, `drawer-container`, `heading`, `icon`, `icon-button`, `list`, `loading-indicator`, `menu`, `nav-bar`, `nav-menu`, `nav-rail`, `search`, `segmented-button`, `snackbar`, `switch`, `tabs`, `theme`, `tooltip`.

다른 컴포넌트를 쓰려면 `m3e.ts`에서 해당 하위 경로를 가져옵니다. 예: `import "@m3e/web/slider";`.

- 컴포넌트 안의 제목에는 `<m3e-heading>`을 씁니다. `m3e-toc-ignore` 속성을 주면 목차에 포함되지 않습니다.
- 아이콘은 `<m3e-icon name="search"></m3e-icon>`처럼 작성합니다. 아이콘은 먼저 `icons.ts`에 등록되어 있어야 합니다. [아이콘 사용하기](/ko-KR/styles/icons/using)를 참고하세요.
- `href`가 있는 컴포넌트(버튼, 카드, 칩, 목록 항목 등)가 사이트 안의 페이지를 가리키면, 일반 링크와 마찬가지로 전체 페이지를 다시 불러오지 않고 페이지가 전환됩니다. `target="_self"`를 지정하면 VitePress의 관례에 따라 페이지 전체를 불러옵니다. `target="_blank"`는 새 탭에서 엽니다.
