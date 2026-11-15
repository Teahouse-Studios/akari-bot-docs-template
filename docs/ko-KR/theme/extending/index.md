---
icon: integration_instructions
order: 7
badge: 확장
tab: 개요
parallel:
  - api
---

# 테마 확장

테마를 조정하는 방법은 세 가지이며, 어느 것도 테마 소스를 수정할 필요가 없습니다.

| 방법 | 적합한 용도 | 위치 |
| --- | --- | --- |
| 구성 | 제목, 내비게이션, 설정 옵션, 목차, 푸터, 인터페이스 문자열 | `docs/config.ts`와 각 언어의 `config.ts`. [구성](/ko-KR/getting-started/configuration) 참고 |
| 컴포넌트 대체 | 브랜드를 반영한 앱 바, 특별한 푸터, 사용자 지정 콘텐츠 컨테이너 | 테마 엔트리의 `enhanceApp` |
| CSS 변수 | 모서리 반경, 간격, 표면 색상, 목차 너비 | 사이트 스타일 |

## 컴포넌트 대체

테마 엔트리 `docs/.vitepress/theme/index.ts`의 `enhanceApp`에서 먼저 `provideAkariSiteData`로 사이트의 언어와 구성 데이터를 테마에 넘기고, 이어서 대체할 부분을 `provideAkariComponents`에 전달합니다. 전달하지 않은 부분은 기본 제공 컴포넌트를 그대로 씁니다.

```ts
import { type Theme } from "vitepress";
import DefaultTheme from "vitepress/theme-without-fonts";
import { provideAkariSiteData } from "./composables/useLocales";
import { provideAkariComponents } from "./composables/useAkariConfig";
import Layout from "./layouts/AkariLayout.vue";
import CustomFooter from "./CustomFooter.vue";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, siteData }) {
    provideAkariSiteData(app, siteData);
    provideAkariComponents(app, { Footer: CustomFooter });
  },
} satisfies Theme;
```

사용자 지정 컴포넌트는 `useAkariConfig()`, `useSidebar()` 같은 테마의 컴포저블로 구성과 상태를 읽습니다. 대체할 수 있는 부분과 사용할 수 있는 함수는 [API](/ko-KR/theme/extending/api)를 참고하세요.

## CSS 변수

사이트 스타일에서 테마와 m3e 컴포넌트의 변수를 재정의합니다.

```css
:root {
  --akari-doc-radius: 24px;
  --akari-doc-max-width: 1440px;
}
```

컴포넌트 하나만 그 자리에서 재정의할 수도 있습니다. 아래 세 카드는 모서리 반경만 바꾼 것입니다.

<div class="demo-grid">
  <m3e-card variant="outlined" style="--m3e-card-shape: 4px;">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">4px 모서리</m3e-heading>
    <div slot="content">더 촘촘한 카드로, 도구 패널과 데이터 블록에 어울립니다.</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">기본 모서리</m3e-heading>
    <div slot="content">m3e 카드의 기본 모양 토큰을 유지하므로 다른 컴포넌트와 일관됩니다.</div>
  </m3e-card>
  <m3e-card variant="outlined" style="--m3e-card-shape: 28px;">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">28px 모서리</m3e-heading>
    <div slot="content">모서리가 더 커서 문서 표면의 시각 언어에 가깝습니다.</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined" style="--m3e-card-shape: 28px;">…</m3e-card>
```

테마와 컴포넌트가 공개하는 변수를 우선 사용하세요. 컴포넌트 내부의 클래스 이름이나 Shadow DOM 구조에는 의존하지 마세요. 버전에 따라 바뀝니다.

## 유의할 점

- 컴포넌트를 대체할 때는 원래 루트 요소의 의미와 접근성 속성(예: 앱 바는 `m3e-app-bar`, 내비게이션은 `m3e-nav-menu`)을 유지하고, 키보드 조작도 유지하세요.
- 색상을 하드코딩하지 마세요. `--md-sys-color-*` 토큰을 써야 색상이 동적 색상, 라이트 모드와 다크 모드, 대비를 따릅니다.
- 새 m3e 컴포넌트나 아이콘을 쓸 때는 `m3e.ts`와 `icons.ts`에 필요한 것만 등록하세요. `@m3e/web/all`은 가져오지 마세요.
- 모듈 최상위에서 `window`, `document`, `localStorage`에 접근하지 마세요. 서버 사이드 렌더링이 실패합니다.
