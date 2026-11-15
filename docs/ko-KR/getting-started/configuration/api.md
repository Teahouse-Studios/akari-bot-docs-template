---
tab: API
---

# 구성: API

## defineAkariConfig

```ts
import { defineAkariConfig } from "./.vitepress/theme/define.ts";

function defineAkariConfig(config: AkariSiteConfig): AkariDirectoryConfig;
```

두 단계의 구성 파일 모두 이 함수로 구성을 내보냅니다. VitePress 필드는 그대로 유지됩니다. 테마 필드는 VitePress가 읽는 `themeConfig.akari` 아래로 옮겨지고 타입 힌트를 받습니다. 타입은 `docs/.vitepress/theme/types.ts`에 정의되어 있습니다.

## 사이트와 언어

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `rootLanguage` | `string` | 알파벳순으로 첫 번째 언어 폴더 | 공통 구성에서만 적용됩니다. 사이트 루트에서 제공할 언어 폴더입니다. 다른 언어의 경로는 해당 폴더 이름으로 시작합니다 |
| `lang` | `string` | 언어 폴더 이름 | 언어 코드. `<html lang>`에 쓰이고, [언어 팩](/ko-KR/theme/i18n/api#akarilanguage)을 고르는 데 쓰입니다 |
| `label` | `string` | 그 언어로 표기한 언어 이름 | 언어 메뉴에 표시되는 이름 |
| `dir` | `"ltr" \| "rtl" \| "auto"` | 언어 팩의 값 | 텍스트 방향 |
| `title` | `string` | 없음 | 사이트 제목. 앱 바의 기본 제목이기도 합니다 |
| `titleTemplate` | `string \| boolean` | 없음 | 페이지 제목의 접미사 또는 템플릿. VitePress와 같습니다 |
| `description` | `string` | 없음 | 사이트 설명 |
| `head` | `HeadConfig[]` | `[]` | 추가 `<head>` 태그. 상위 단계와 병합됩니다 |
| `logo` | `string` | 없음 | 앱 바와 푸터의 브랜드 이미지 |
| `markdown` | `MarkdownLocaleOptions` | 언어 팩의 값 | Markdown에서 쓰이는 해당 언어의 텍스트. 코드 블록 복사 버튼의 툴팁 등이며, 언어 팩의 값 위에 겹쳐집니다 |

`lang`, `label`, `dir`, `markdown`은 언어를 설명하는 필드이므로 언어 구성에 둡니다. 나머지 필드는 모두 공통 구성에 기본값으로 둘 수 있으며, 언어 구성에서 재정의할 수 있습니다.

## 테마 필드

| 필드 | 내용 | 참고 |
| --- | --- | --- |
| `appBar` | 앱 바 제목, 버전, 로고, 버튼, 소셜 링크 | [레이아웃과 앱 바](/ko-KR/theme/layout/api#appbar) |
| `toc` | 오른쪽 목차 | [레이아웃과 앱 바](/ko-KR/theme/layout/api#toc) |
| `loadingBar` | 페이지를 불러오는 동안 창 맨 위에 표시되는 막대 | [레이아웃과 앱 바](/ko-KR/theme/layout/api#loadingbar) |
| `footer` | 페이지 이동 카드와 푸터 | [레이아웃과 앱 바](/ko-KR/theme/layout/api#footer) |
| `sidebar` | 카테고리, 직접 작성한 내비게이션, 드로어 너비 | [사이드 내비게이션](/ko-KR/theme/sidebar/api#sidebar) |
| `settings` | 설정 대화상자와 화면 모드 버튼 | [설정과 화면 모드](/ko-KR/theme/settings/api#settings) |
| `search` | 검색 진입점과 백엔드 | [검색](/ko-KR/theme/search/api#search) |
| `messages` | 인터페이스 텍스트 | [국제화](/ko-KR/theme/i18n/api#messages) |
| `fonts` | Google Fonts에서 글꼴을 불러올지 여부와 글꼴 스택 | [타이포그래피](/ko-KR/styles/typography/api#fonts) |
| `languages` | 기본 제공 언어 팩 외의 언어 팩, 또는 기본 제공 언어 팩의 변경 | [국제화](/ko-KR/theme/i18n/api#akarilanguage) |

인터페이스 컴포넌트 교체는 구성 파일에서 하지 않습니다. [테마 확장](/ko-KR/theme/extending/api#provideakaricomponents)을 참고하세요.

## .vitepress/config.mts

테마를 VitePress에 연결하는 부분입니다. 수정할 일은 거의 없습니다.

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";
import { akariContent } from "./content";
import { akariHead } from "./theme/head";
import { akariMarkdown } from "./theme/markdown";

const docsDir = fileURLToPath(new URL("../", import.meta.url));
const content = await akariContent(docsDir);

export default defineConfig({
  ...content.site,
  cleanUrls: false,
  appearance: false,
  head: akariHead(),
  markdown: { config: (md) => akariMarkdown(md) },
  vue: {
    template: {
      compilerOptions: { isCustomElement: (tag) => tag.startsWith("m3e-") },
    },
  },
  vite: {
    plugins: [content.plugin],
  },
});
```

| 옵션 | 용도 |
| --- | --- |
| `...content.site` | 폴더에서 생성한 `locales`, `rewrites`와 사이트 단위의 `lang`, `title`, `description`. 로컬 검색을 쓰면 VitePress의 로컬 검색 색인을 켜는 `themeConfig.search`도 포함됩니다 |
| `cleanUrls: false` | 페이지 경로가 `.html`로 끝나며 출력 파일과 일대일로 대응합니다. `true`이면 확장자가 없습니다. 호스팅 요구 사항은 [설치](/ko-KR/getting-started/installation#deployment)를 참고하세요 |
| `appearance: false` | VitePress에 내장된 라이트/다크 전환을 끕니다. 화면 모드는 테마가 관리합니다 |
| `head: akariHead()` | 첫 프레임 전에 라이트 모드나 다크 모드를 적용하는 스크립트 |
| `akariMarkdown` | 표의 M3 테두리와 원격 이미지의 크기 |
| `isCustomElement` | Vue가 `m3e-*`를 사용자 정의 요소로 취급하게 합니다 |
| `content.plugin` | 개발 중에 Markdown 파일이 추가되거나 삭제될 때, 그리고 프런트매터가 바뀔 때 내비게이션을 갱신합니다 |

## akariContent

```ts
function akariContent(
  srcDir: string,
  logger?: { warn(message: string): void },
): Promise<AkariContent>;
```

`srcDir`의 구성 파일과 폴더를 읽습니다. `logger`의 기본값은 `console`이며, 구조를 벗어난 페이지나 찾을 수 없는 병렬 페이지 같은 알림을 받습니다.

| 반환 필드 | 타입 | 설명 |
| --- | --- | --- |
| `site` | `{ lang, title, description, locales, rewrites }` | `defineConfig`에 펼쳐 넣습니다 |
| `plugin` | Vite `Plugin` | 개발 서버에서 내비게이션을 갱신합니다 |
| `route` | `(page: string) => string` | 소스 파일 경로 → 페이지 경로. 예: `zh-CN/theme/layout/index.md` → `/zh-CN/theme/layout` |
| `rewrite` | `(page: string) => string` | 소스 파일 경로 → VitePress 제공 경로. 예: `zh-CN/theme/layout/index.md` → `theme/layout.md` |
| `languages` | `{ folder, key, prefix }[]` | 언어 폴더 목록. 루트 언어가 먼저 옵니다. `key`는 VitePress 로캘 키(루트 언어는 `root`)이고, `prefix`는 경로 접두사입니다 |

## akariHead

```ts
function akariHead(options?: {
  storageKey?: string;
  defaultScheme?: "light" | "dark" | "auto" | "time";
}): HeadConfig[];
```

첫 프레임이 그려지기 전에 라이트 모드나 다크 모드를 적용하는 인라인 스크립트를 반환합니다. 글꼴의 `<head>` 태그는 언어마다 다르므로 `akariContent`가 각 언어의 로캘에 작성합니다. [타이포그래피](/ko-KR/styles/typography/api#fonts)를 참고하세요. `settings.storageKey`나 `settings.defaults.scheme`을 바꾸면 여기에도 같은 값을 전달해 스크립트가 같은 설정을 읽게 하세요.

## akariMarkdown

```ts
function akariMarkdown(
  md: MarkdownRenderer,
  options?: { remoteImageSize?: boolean | AkariImageSizeOptions },
): void;
```

`markdown.config`에서 호출합니다. 하는 일은 두 가지입니다.

- 모든 Markdown 표를 `<div class="akari-table">`로 감싸 M3 외곽선 테두리와 가로 스크롤을 줍니다.
- [markdown-it-image-size](https://github.com/boyum/markdown-it-image-size)로 원격 이미지의 너비와 높이를 기록합니다. 로컬 이미지는 VitePress가 직접 기록합니다. [페이지 작성](/ko-KR/getting-started/writing/api#images)을 참고하세요.

| 옵션 | 기본값 | 설명 |
| --- | --- | --- |
| `remoteImageSize` | `true` | `false`이면 원격 이미지를 측정하지 않습니다. 플러그인 옵션을 넣을 수도 있습니다. 예를 들어 캐시를 저장소에 두려면 `{ cacheDir: ".image-size" }`, 캐시를 쓰지 않으려면 `{ cache: false }`입니다 |
