---
tab: API
---

# 사이드 내비게이션: API

## 글 프런트매터

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `title` | `string` | 내비게이션에 표시되는 이름. 기본값은 첫 번째 h1이고, 그다음은 폴더 이름입니다 |
| `icon` | `string` | 내비게이션 항목의 아이콘 |
| `badge` | `string` | 내비게이션 항목의 배지 |
| `order` | `number` | 카테고리 안에서의 위치. 작은 값이 먼저 오며, 지정하지 않은 페이지는 맨 뒤에 폴더 이름순으로 놓입니다 |
| `parallel` | `string[]` | 같은 폴더 안의 병렬 페이지 |
| `tab` | `string` | 탭 바에 표시되는 제목. 기본값은 페이지 제목입니다 |
| `category` | `string` | 언어 홈 페이지 전용: 어느 카테고리에 들어갈지 |

모든 프런트매터 필드는 [페이지 작성](/ko-KR/getting-started/writing/api#frontmatter)을 참고하세요.

## sidebar

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `categories` | `Record<string, AkariSidebarCategory>` | 없음 | 폴더에서 생성되는 내비게이션의 카테고리. 키는 카테고리 폴더 이름이고, 키의 순서가 레일의 순서입니다 |
| `items` | `AkariSidebarItem[] \| Record<string, AkariSidebarItem[]>` | 없음 | 직접 작성한 내비게이션. 설정하면 더 이상 폴더에서 내비게이션을 생성하지 않습니다 |
| `width` | `number` | `320` | 내비게이션 드로어의 기준 너비. 240–400으로 제한됩니다 |

`AkariSidebarCategory`의 필드:

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `text` | `string` | 카테고리 이름. 기본값은 폴더 이름입니다 |
| `icon` | `string` | 레일의 아이콘. 기본값은 `category`입니다 |
| `collapsed` | `boolean` | `false`이면 모바일 드로어에서 카테고리가 기본으로 펼쳐집니다. 이 카테고리 안의 페이지로 이동하면 열리며, 독자가 열거나 닫은 뒤에는 그 상태로 유지됩니다 |

데스크톱 내비게이션 드로어의 너비는 `max(240px, width - 96px)`입니다. 기본값은 240px이고, `width`가 최댓값 400일 때 304px입니다. 모바일 드로어는 `width`를 그대로 씁니다.

## 직접 작성한 내비게이션 {#navigation-written-by-hand}

`sidebar.items`는 `AkariSidebarItem`의 목록입니다. 폴더에서 생성된 내비게이션도 같은 구조입니다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `text` | `string` | 필수. 표시되는 텍스트 |
| `link` | `string` | 대상 주소. 사이트 내 주소는 `/`로 시작합니다 |
| `icon` | `string` | 등록된 아이콘 이름. 최상위 항목은 레일과 모바일 드로어의 최상위 메뉴에 아이콘을 표시합니다. 기본값은 `category`입니다 |
| `badge` | `string` | 배지. 최상위 항목에서는 레일 아이콘의 오른쪽 위에, 하위 항목에서는 드로어에 표시됩니다 |
| `collapsed` | `boolean` | `false`이면 그룹이 기본으로 펼쳐집니다. 그룹 안의 페이지로 이동하면 열립니다. 드로어가 다른 카테고리로 바뀌었다가 돌아와도, 독자가 열거나 닫은 그룹은 그 상태로 유지됩니다 |
| `items` | `AkariSidebarItem[]` | 하위 항목. 깊이 제한 없이 중첩할 수 있습니다 |
| `tabs` | `AkariSidebarItem[]` | 병렬 페이지. 그룹의 페이지들은 사이드바에서 첫 페이지로 연결되는 항목 하나가 되고, 페이지 상단에 탭 바가 표시됩니다 |

```ts
sidebar: {
  items: [
    {
      text: "스타일",
      icon: "style",
      items: [
        { text: "색상", link: "/styles/color" },
        {
          text: "아이콘",
          tabs: [
            { text: "개요", link: "/styles/icons" },
            { text: "아이콘 고르기", link: "/styles/icons/choosing" },
            { text: "아이콘 사용하기", link: "/styles/icons/using" },
          ],
        },
      ],
    },
  ],
},
```

`items`는 객체일 수도 있습니다. 키는 경로 접두사이고, 값은 그 경로 아래에서 표시할 내비게이션입니다. 현재 경로와 일치하는 가장 긴 접두사가 우선합니다(`/theme/settings`가 `/theme/`보다 우선하고, `/`는 모든 경로와 일치합니다).

`tabs` 안에서 `link`가 있는 항목만 탭이 됩니다. `link`가 있는 탭이 하나도 없으면 그 항목은 일반 내비게이션 항목으로 취급됩니다.

## 네이티브 사이드바

언어 폴더도 없고 `sidebar.items`도 없으면, 테마는 VitePress의 `themeConfig.sidebar`(`.vitepress/config.mts` 안)를 읽어 같은 구조로 변환합니다. 네이티브 항목의 `icon`, `badge`, `tabs`는 유지되며, 그룹의 `base`는 하위 항목과 탭의 링크 앞에 붙습니다.

```ts
export default defineConfig({
  themeConfig: {
    sidebar: {
      "/theme/": [
        {
          text: "테마",
          items: [
            { text: "레이아웃과 앱 바", link: "/theme/layout", icon: "view_quilt" },
            { text: "테마 확장", link: "/theme/extending", badge: "확장" },
          ],
        },
      ],
    },
  },
});
```

## 탭 바 CSS 변수 {#tab-bar-css-variables}

| 변수 | 기본값 | 효과 |
| --- | --- | --- |
| `--akari-app-bar-tabs-gap` | `24px` | 앱 바에 도킹된 뒤 탭 바와 제목 사이, 탭 바와 오른쪽 버튼 사이의 간격 |
| `--akari-page-tabs-docked-max-width` | `none` | 앱 바에 도킹된 탭 바의 최대 너비. 설정하면 탭 바가 빈 공간의 가운데에 놓입니다 |

## useSidebar

```ts
import { useSidebar } from "@theme";

const { items, prevNext, tabGroup, isActive, hasActive } = useSidebar();
```

| 반환값 | 타입 | 설명 |
| --- | --- | --- |
| `items` | `ComputedRef<AkariSidebarItem[]>` | 현재 페이지의 내비게이션 트리 |
| `prevNext` | `ComputedRef<{ prev?, next? }>` | 현재 페이지의 병렬 그룹 안에서의 이전 페이지와 다음 페이지. 그룹의 양 끝과 그룹에 속하지 않은 페이지에서는 없음 |
| `tabGroup` | `ComputedRef<AkariSidebarItem \| undefined>` | 현재 페이지가 속한 병렬 페이지 그룹 |
| `isActive(link)` | `(link?: string) => boolean` | 이 주소가 현재 페이지인지 여부 |
| `hasActive(item)` | `(item: AkariSidebarItem) => boolean` | 이 항목이나 그 하위 항목·탭 중 하나가 현재 페이지인지 여부 |

레이아웃 안의 컴포넌트에서만 호출하세요.

## 아이콘

내비게이션에 쓰는 아이콘은 먼저 `docs/.vitepress/theme/icons.ts`에 등록해야 합니다. [아이콘 사용하기](/ko-KR/styles/icons/using)를 참고하세요. 등록되지 않은 아이콘은 빈칸으로 표시됩니다.
