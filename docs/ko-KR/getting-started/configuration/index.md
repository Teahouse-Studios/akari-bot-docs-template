---
icon: tune
order: 2
tab: 개요
parallel:
  - api
  - details
---

# 구성

구성은 `docs` 폴더에 두 단계로 나뉘어 있습니다.

- `docs/config.ts`: 모든 언어의 공통 구성.
- `docs/<언어 코드>/config.ts`: 한 언어의 구성. 예를 들어 `docs/ko-KR/config.ts`입니다. 이 파일이 있는 폴더가 언어 폴더입니다.

언어 구성의 필드는 공통 구성의 같은 이름 필드를 대체하고, 객체는 필드 단위로 병합됩니다. 따라서 언어 구성에는 그 언어에서 달라지는 부분만 적습니다. `docs/.vitepress/config.mts`는 테마를 VitePress에 연결할 뿐이며, 수정할 일은 거의 없습니다.

```text
docs/
├─ config.ts                 공통 구성
├─ en-US/                    영어, 사이트 루트에 배치
│  ├─ config.ts              언어 구성
│  └─ …                      페이지, "페이지 작성" 참고
├─ zh-CN/                    중국어 간체, /zh-CN/ 아래에 배치
│  ├─ config.ts
│  └─ …
└─ .vitepress/config.mts
```

## 공통 구성

모든 언어에서 같은 것: 루트 언어, 로고, 버전과 소셜 링크, 카테고리의 아이콘과 순서, 설정, 검색.

```ts
// docs/config.ts
import { defineAkariConfig } from "./.vitepress/theme/define.ts";

export default defineAkariConfig({
  // 사이트 루트에서 제공할 언어 폴더
  rootLanguage: "en-US",
  logo: "/logo.svg",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
  appBar: {
    version: "v1.0.0",
    socialLinks: [
      { icon: "github", link: "https://github.com/OasisAkari/vitepress-theme-akari-docs", label: "GitHub" },
    ],
  },
  sidebar: {
    // 카테고리 폴더 이름과 아이콘. 키 순서가 레일에 표시되는 순서입니다
    categories: {
      "getting-started": { icon: "rocket_launch" },
      theme: { icon: "palette" },
    },
  },
  settings: { storageKey: "akari-docs-settings" },
  search: { maxResults: 8 },
  images: { webp: true },
  footer: { copyright: "Vitepress Theme Akari Docs" },
});
```

## 언어 구성

이 사이트에서 쓰는 그 언어의 제목과 텍스트입니다. `lang`의 기본값은 폴더 이름이며, 테마는 이 값으로 [언어 팩](/ko-KR/theme/i18n#language-packs)을 고릅니다. 언어 메뉴의 이름, 텍스트 방향, 인터페이스 문자열, 코드 블록 복사 버튼의 텍스트는 모두 언어 팩에서 가져오며, 필요하면 여기에서 재정의합니다.

```ts
// docs/ko-KR/config.ts
import { defineAkariConfig } from "../.vitepress/theme/define.ts";

export default defineAkariConfig({
  title: "Vitepress Theme Akari Docs",
  description: "VitePress와 M3E Web Components로 만든 문서 테마",
  appBar: { title: "Vitepress Theme Akari Docs" },
  sidebar: {
    categories: {
      "getting-started": { text: "시작하기" },
      theme: { text: "테마" },
    },
  },
  footer: { message: "VitePress와 M3E Web Components로 제작" },
});
```

## 자주 바꾸는 항목

| 목적 | 작성 위치 | 필드 |
| --- | --- | --- |
| 사이트 이름 변경 | 언어 구성 | `title`, `appBar.title` |
| 버전이나 소셜 링크 추가 | 공통 구성 | `appBar.version`, `appBar.socialLinks` |
| 카테고리 순서나 아이콘 변경 | 공통 구성 | `sidebar.categories` |
| 카테고리 이름 변경 | 언어 구성 | `sidebar.categories.<folder>.text` |
| 기본 색상과 화면 모드 변경 | 공통 구성 | `settings.defaults` |
| 검색 끄기 또는 검색 백엔드 연결 | 공통 구성 | `search` |
| 푸터 메시지와 저작권 표시 변경 | 언어 구성 / 공통 구성 | `footer.message`, `footer.copyright` |
| 인터페이스 텍스트 수정 | 언어 구성 | `messages` |
| 사이트가 쓰는 이미지를 WebP로 변환 | 공통 구성 | `images.webp` |
| 언어 추가 | 새 언어 폴더 | [국제화](/ko-KR/theme/i18n) 참고 |

모든 필드의 타입과 기본값은 [API](/ko-KR/getting-started/configuration/api)를 참고하세요. 구성이 겹쳐지는 방식과 언어, 내비게이션이 생성되는 방식은 [세부 사항](/ko-KR/getting-started/configuration/details)을 참고하세요.
