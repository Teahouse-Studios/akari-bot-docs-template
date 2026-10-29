---
icon: view_sidebar
order: 3
tab: 개요
parallel:
  - api
  - details
---

# 사이드 내비게이션

데스크톱에서는 왼쪽의 96px 너비 레일이 카테고리를 나열하고, 내비게이션 드로어가 현재 카테고리의 페이지를 나열합니다. 창 너비가 960px보다 좁으면 앱 바의 메뉴 버튼이 모든 페이지가 담긴 내비게이션 드로어를 엽니다.

## 레일과 내비게이션 드로어

- **레일**: 카테고리마다 아이콘이 하나씩 있습니다. 현재 페이지의 카테고리는 선택된 상태로 표시되고, 아이콘이 채워진 모양으로 바뀝니다. 카테고리를 클릭하면 그 첫 페이지가 열립니다. 레일 하단에는 화면 모드 버튼이 있고, 사이트에 언어가 여러 개이면 언어 버튼도 있습니다.
- **내비게이션 드로어**: 창 너비가 1600px 이상이면 레일 오른쪽에 계속 열려 있습니다. 960–1599px에서는 포인터가 카테고리 위에 머물면 레일 아래에서 미끄러져 나오고, 포인터가 떠나면 다시 들어갑니다. 터치스크린에서는 카테고리를 탭하면 열리거나 닫힙니다.
- **좁은 화면**: 레일과 드로어가 숨겨집니다. 메뉴 버튼이 전체 내비게이션 드로어를 열며, 드로어의 최상위 메뉴는 레일의 카테고리와 일치합니다. 화면 모드 버튼과 언어 버튼은 드로어 하단에 있습니다.

<div class="demo-surface" style="max-width: 320px;">
  <m3e-nav-menu aria-label="사이드 내비게이션 데모">
    <m3e-nav-menu-item open>
      <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
      <span slot="label">시작하기</span>
      <m3e-nav-menu-item selected>
        <a slot="label" href="/ko-KR/">개요</a>
      </m3e-nav-menu-item>
      <m3e-nav-menu-item>
        <a slot="label" href="/ko-KR/getting-started/installation.html">설치</a>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
    <m3e-nav-menu-item>
      <m3e-icon slot="icon" name="palette"></m3e-icon>
      <span slot="label">테마</span>
      <m3e-nav-menu-item>
        <a slot="label" href="/ko-KR/theme/extending.html">테마 확장</a>
        <span slot="badge">확장</span>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
  </m3e-nav-menu>
</div>

## 내비게이션의 출처

내비게이션은 언어 폴더 안의 폴더 구조에서 생성됩니다. 각 카테고리 폴더는 레일의 카테고리 하나가 되고, 카테고리 안의 글 폴더는 그 카테고리의 페이지가 됩니다. 이름, 아이콘, 순서는 각 글의 프런트매터에서 설정합니다. [페이지 작성](/ko-KR/getting-started/writing)을 참고하세요.

카테고리 이름과 아이콘은 구성의 `sidebar.categories`에 씁니다.

```ts
// docs/config.ts
sidebar: {
  categories: {
    "getting-started": { icon: "rocket_launch" },
    theme: { icon: "palette" },
  },
},

// docs/ko-KR/config.ts
sidebar: {
  categories: {
    "getting-started": { text: "시작하기" },
    theme: { text: "테마" },
  },
},
```

구성의 `sidebar.items`로 내비게이션 전체를 직접 작성할 수도 있습니다. [API](/ko-KR/theme/sidebar/api#navigation-written-by-hand)를 참고하세요.

## 병렬 페이지 {#parallel-pages}

[m3.material.io](https://m3.material.io/styles/icons)의 Icons가 Overview, Guidelines, Specs로 나뉘어 있듯이, 글 하나를 여러 페이지로 나눌 수 있습니다. 이 페이지들은 사이드바에서 항목 하나만 차지하며, 페이지 상단의 탭 바로 서로 전환합니다.

- 아래로 스크롤하면 탭 바가 줄어들어 앱 바 제목 오른쪽의 빈 공간으로 날아갑니다. 다시 위로 스크롤하면 페이지로 돌아옵니다.
- 앱 바에 공간이 없으면 탭 바는 대신 옅은 그림자와 함께 앱 바 아래에 고정됩니다.
- 그룹 안에서 페이지를 전환하면 콘텐츠가 왼쪽이나 오른쪽으로 미끄러집니다. 탭 바가 앱 바에 도킹되어 있으면 그 자리에 머물고, 새 페이지는 본문 텍스트에서 바로 시작합니다.
- 콘텐츠 끝의 이전 페이지와 다음 페이지 카드는 그룹 안에서만 이동합니다. 그룹의 첫 페이지에는 이전 페이지가 없고, 마지막 페이지에는 다음 페이지가 없습니다.

[아이콘](/ko-KR/styles/icons) 페이지와 이 사이트의 모든 테마 문서가 이런 방식으로 구성되어 있습니다. [페이지 작성](/ko-KR/getting-started/writing#parallel-pages)을 참고하세요.

각 필드는 [API](/ko-KR/theme/sidebar/api)를, 드로어가 열리는 시점과 탭 바가 날아가는 방식 등은 [세부 사항](/ko-KR/theme/sidebar/details)을 참고하세요.
