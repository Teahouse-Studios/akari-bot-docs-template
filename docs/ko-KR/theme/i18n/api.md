---
tab: API
---

# 국제화: API

## 언어 구성

| 필드 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `rootLanguage` | `string` | 알파벳순으로 첫 번째 언어 폴더 | 공통 구성에서만 유효합니다. 사이트 루트에서 제공할 언어 |
| `lang` | `string` | 언어 폴더 이름 | 언어 코드. `<html lang>`과 언어 팩 선택에 씁니다 |
| `label` | `string` | 그 언어로 표기한 언어 이름 | 언어 메뉴에 표시할 이름. 예를 들어 `ja-JP`의 기본값은 “日本語”입니다 |
| `dir` | `"ltr" \| "rtl" \| "auto"` | 언어 팩의 값 | 텍스트 방향. 텍스트 방향 설정이 “언어에 따름”일 때 쓰입니다 |
| `markdown` | `MarkdownLocaleOptions` | 언어 팩의 값 | Markdown에서 쓰는 이 언어의 문자열. 언어 팩의 문자열 위에 겹쳐집니다. 예: `codeCopyButton: { tooltipText, copiedText }` |
| `messages` | `Partial<AkariMessages>` | 없음 | 인터페이스 문자열을 재정의하거나 채웁니다 |
| `languages` | `AkariLanguage[]` | 없음 | 기본 제공 언어 팩 외의 언어 팩, 또는 기본 제공 언어 팩의 변경. 보통 공통 구성에 씁니다 |

그 밖의 필드(`title`, `description`, `appBar`, `footer`, `search` 등)도 언어 구성에 쓸 수 있습니다. [구성](/ko-KR/getting-started/configuration/api)을 참고하세요.

## AkariLanguage

언어 팩의 형태입니다. `defineAkariLanguage`(`docs/.vitepress/theme/define.ts`에서 가져옵니다)로 작성합니다.

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `code` | `string` | 필수. 언어 코드. 페이지는 먼저 전체 코드(`pt-BR`)가 같은 언어 팩을 찾고, 없으면 주 언어(`pt`)가 같은 언어 팩을 찾습니다 |
| `dir` | `"ltr" \| "rtl"` | 텍스트 방향. 기본값은 `"ltr"`입니다 |
| `fonts` | `{ google: string[]; family: string[] }` | 글꼴. 두 필드 모두 [`fonts`](/ko-KR/styles/typography/api#fonts)와 같은 형식으로 씁니다. 기본값은 테마의 글꼴(Roboto와 Noto Sans SC)입니다 |
| `messages` | `Partial<AkariMessages>` | 인터페이스 문자열. 빠진 항목은 영어로 표시됩니다 |
| `markdown` | `MarkdownLocaleOptions` | Markdown에서 쓰는 문자열. `codeCopyButton`은 코드 블록 복사 버튼의 툴팁이고, `container`에는 컨테이너의 기본 제목(`tipLabel`, `warningLabel`, `dangerLabel`, `infoLabel`, `detailsLabel` 등)이 들어갑니다 |

기본 제공 언어 팩은 `docs/.vitepress/theme/i18n/languages/`에 언어마다 파일 하나씩 있으며, 같은 폴더의 `index.ts`가 이들을 나열합니다. 테마 자체에 기본 제공 언어를 추가하려면 그 폴더에 파일을 추가하고 `AKARI_LANGUAGES`에 나열합니다.

## messages

기본 제공 언어 팩은 중국어 간체(`zh`), 영어(`en`), 일본어(`ja`), 한국어(`ko`), 프랑스어(`fr`), 아랍어(`ar`)의 6개이며, 모두 인터페이스 문자열을 빠짐없이 갖추고 있습니다. 언어 구성의 `messages`에 쓴 항목은 언어 팩의 문자열을 대체하고, 쓰지 않은 항목은 언어 팩의 값을 유지합니다. `{name}`이 들어 있는 항목은 런타임에 해당 값으로 채워집니다.

### 내비게이션과 앱 바

| 키 | 한국어 기본값 |
| --- | --- |
| `navigationToggle` | 탐색 전환 |
| `navigationLabel` | 문서 |
| `railLabel` | 문서 분류 |
| `categoryNavigation` | {category} 탐색 |
| `categoryPages` | {category} 페이지 |
| `homeLink` | {title} 홈 |
| `moreActions` | 더보기 |
| `backToTop` | 맨 위로 |
| `tocButton` | 목차 |
| `languageLabel` | 언어 변경 |
| `languageDialogTitle` | 언어 선택 |
| `languageDialogClose` | 닫기 |
| `loadingLabel` | 페이지 로드 중 |

### 목차, 페이지 이동 카드, 푸터

| 키 | 한국어 기본값 |
| --- | --- |
| `tocOverline` | 이 페이지의 내용 |
| `pagerLabel` | 페이지 이동 |
| `previousPage` | 이전 |
| `nextPage` | 다음 |
| `footerMessage` | VitePress와 M3E로 제작 |
| `footerLinks` | 푸터 링크 |
| `notFoundTitle` | 페이지를 찾을 수 없습니다 |
| `notFoundText` | 찾으시는 페이지가 이동되었거나 삭제되었을 수 있습니다. |
| `notFoundLink` | 홈으로 돌아가기 |

### 설정

| 키 | 한국어 기본값 |
| --- | --- |
| `settingsTitle` | 설정 |
| `settingsClose` | 설정 닫기 |
| `settingsColor` | 색상 |
| `settingsVariant` | 변형 |
| `settingsContrast` | 대비 |
| `settingsMotion` | 모션 |
| `settingsDirection` | 텍스트 방향 |
| `settingsTextSize` | 글자 크기 |
| `contrastStandard` | 기본 |
| `contrastMedium` | 중간 |
| `contrastHigh` | 높음 |
| `motionStandard` | 표준 |
| `motionExpressive` | 표현형 |
| `directionAuto` | 언어에 따름 |
| `directionLtr` | 왼쪽에서 오른쪽 |
| `directionRtl` | 오른쪽에서 왼쪽 |

### 화면 모드

| 키 | 한국어 기본값 |
| --- | --- |
| `schemeToggle` | 화면 모드: {mode} |
| `schemeLight` | 라이트 |
| `schemeAuto` | 시스템 |
| `schemeDark` | 다크 |
| `schemeTime` | 시간에 따라 |
| `schemeChanged` | 테마가 전환되었습니다: {mode} |
| `schemeChangedFollowing` | 테마가 전환되었습니다: {mode} ({scheme}) |

### 검색

| 키 | 한국어 기본값 |
| --- | --- |
| `searchPlaceholder` | 문서 검색 |
| `searchLabel` | 문서 검색 |
| `searchShortcutLabel` | {label}, 단축키 {shortcut} |
| `searchClose` | 검색 닫기 |
| `searchIntroTitle` | 문서 검색 |
| `searchIntroText` | 페이지 제목, 컴포넌트 이름 또는 본문의 단어를 입력하세요. |
| `searchIntroShortcut` | {keys}로 언제든지 열 수 있습니다 |
| `searchLoading` | 검색 중… |
| `searchErrorTitle` | 검색을 사용할 수 없습니다 |
| `searchRetry` | 다시 시도 |
| `searchEmptyTitle` | 결과 없음 |
| `searchEmptyText` | 더 짧은 키워드를 사용하거나 검색 백엔드 설정을 확인하세요. |
| `searchResultCountOne` | 결과 {count}개 |
| `searchResultCount` | 결과 {count}개 |
| `searchResultsLabel` | 검색 결과 |
| `searchResultPage` | 페이지 |
| `searchHintSelect` | 선택 |
| `searchHintOpen` | 열기 |
| `searchHintClose` | 닫기 |
| `searchFailed` | 검색에 실패했습니다. 잠시 후 다시 시도하세요. |
| `searchIndexUnavailable` | 로컬 검색 색인을 불러오지 못했습니다. |
| `searchIndexInvalid` | 로컬 검색 색인 형식이 올바르지 않습니다. |
| `searchRequestFailed` | 검색 요청에 실패했습니다(HTTP {status}). |
| `searchBackendMissing` | "{id}"(으)로 등록된 검색 백엔드가 없습니다. |

`searchResultCountOne`은 복수 범주가 `one`인 개수에 쓰이고(영어의 “1 result”), 그 밖의 개수에는 `searchResultCount`가 쓰입니다. 범주는 `Intl.PluralRules`가 언어에 따라 정합니다. `{keys}`는 표시될 때 키캡으로 렌더링됩니다.

## useAkariI18n

```ts
import { useAkariI18n } from "@theme";

const { lang, messages, t } = useAkariI18n();
t("homeLink", { title: "Vitepress Theme Akari Docs" }); // "Vitepress Theme Akari Docs 홈"
```

| 반환값 | 설명 |
| --- | --- |
| `lang` | 현재 언어 코드 |
| `messages` | 현재 언어의 모든 인터페이스 문자열. `messages` 구성이 병합되어 있습니다 |
| `t(key, params?)` | 문자열 하나를 가져와 자리표시자를 채웁니다 |

## useAkariLocales

```ts
import { useAkariLocales } from "@theme";

const { locales, homeHref } = useAkariLocales();
```

| 반환값 | 설명 |
| --- | --- |
| `locales` | 언어 목록. 각 항목은 `{ key, label, lang, href, current }`이며, `href`는 그 언어로 전환할 때 열 URL입니다. 사이트에 언어가 하나뿐이면 빈 배열입니다 |
| `homeHref` | 현재 언어 홈 페이지의 URL. `base`가 붙어 있습니다 |

두 함수 모두 레이아웃 안의 컴포넌트에서만 호출하세요.

## 언어 팩 함수

모두 테마 엔트리에서 내보내며(`import { … } from "@theme"`), 어디서든 호출할 수 있습니다.

| 내보내기 | 설명 |
| --- | --- |
| `AKARI_LANGUAGES` | 기본 제공 언어 팩 |
| `resolveLanguage(lang, languages?)` | 한 언어가 최종적으로 쓰는 언어 팩. 위의 규칙으로 빈 곳을 채운 `{ code, dir, fonts, messages, markdown }`을 반환합니다. `languages`는 사이트 자체의 언어 팩입니다 |
| `defineAkariLanguage(language)` | 언어 팩을 작성할 때 쓰는 타입 도우미 |

## 검색의 언어

등록된 검색 백엔드는 두 번째 인자로 `lang`(예: `zh-CN`)과 `locale`(VitePress 로케일 키. 루트 언어는 `root`)을 받습니다. [검색](/ko-KR/theme/search/api#registered-backends)을 참고하세요.
