---
icon: package_2
order: 1
---

# 설치

Vitepress Theme Akari Docs는 GitHub 템플릿 저장소입니다. 이 템플릿으로 자신의 저장소를 만들면 테마 소스, 구성, 샘플 문서를 받을 수 있습니다. 따로 설치할 테마 패키지는 없습니다.

## 템플릿으로 저장소 만들기

1. [OasisAkari/vitepress-theme-akari-docs](https://github.com/OasisAkari/vitepress-theme-akari-docs)를 열고 **Use this template** → **Create a new repository**를 클릭합니다.
2. 저장소 이름과 공개 범위를 입력하고 저장소를 만듭니다. 새 저장소에는 템플릿의 모든 파일이 들어 있고 커밋 기록은 처음부터 시작하며, 템플릿의 포크가 아닙니다.
3. 저장소를 클론하고 의존성을 설치한 다음 실행합니다.

   ```bash
   git clone https://github.com/<계정>/<저장소>.git
   cd <저장소>
   npm install
   npm run dev
   ```

GitHub CLI를 사용하면 한 번에 만들고 클론할 수 있습니다.

```bash
gh repo create my-docs --template OasisAkari/vitepress-theme-akari-docs --public --clone
```

## 요구 사항

- Node.js `>=22.12.0`(`package.json`의 `engines` 필드). 템플릿은 Node.js `24.21.0`과 npm `12.2.1`로 검증되었습니다.
- npm. 저장소에는 `package-lock.json` 하나만 있습니다. 지속적 통합(CI)에서는 `npm ci`로 이 파일에서 설치합니다.

## 명령

개발 서버는 기본적으로 `http://localhost:5173`에서 실행됩니다.

| 명령 | 용도 |
| --- | --- |
| `npm run dev` | 개발 서버. Markdown 변경은 즉시 반영되고, `config.ts`를 바꾸면 자동으로 다시 시작합니다 |
| `npm run build` | 정적 사이트를 `docs/.vitepress/dist`에 빌드합니다 |
| `npm run preview` | 빌드 결과를 로컬에서 미리 봅니다 |
| `npm run typecheck` | `vue-tsc --noEmit`으로 테마와 테스트를 검사합니다 |
| `npm test` | Vitest 단위 테스트를 실행합니다 |

## 내 사이트로 만들기

- 사이트 이름, 버전, 소셜 링크, 푸터는 `docs/config.ts`와 각 언어의 `config.ts`에 있습니다. [구성](/ko-KR/getting-started/configuration)을 참고하세요.
- 로고는 `docs/public/logo.svg`입니다.
- 언어 폴더에는 이 사이트의 문서가 들어 있습니다. 필요한 언어만 남기고 나머지 폴더는 삭제한 다음, 남긴 폴더에 자신의 페이지를 작성하세요. [페이지 작성](/ko-KR/getting-started/writing)을 참고하세요.

## 템플릿에서 업데이트 받기

템플릿으로 만든 저장소는 템플릿과 연결되어 있지 않으므로 템플릿의 이후 업데이트는 자동으로 들어오지 않습니다. 업데이트가 필요하면 템플릿을 리모트로 추가하고, 테마가 있는 `docs/.vitepress`를 가져오세요.

```bash
git remote add template https://github.com/OasisAkari/vitepress-theme-akari-docs.git
git fetch template
git checkout template/main -- docs/.vitepress
```

이 명령은 폴더를 템플릿의 버전으로 바꾸므로, 테마에 직접 가한 변경은 다시 병합해야 합니다. `package.json`의 의존성도 함께 비교하세요.

## 버전 기준

| 의존성 | 버전 | 비고 |
| --- | --- | --- |
| `vitepress` | `2.0.0-alpha.21` | 버전 고정. Vite 8 / Rolldown과 Vue 3.5 기반 |
| `@m3e/web` | `2.10.3` | Material 3 Expressive Web Components |
| `@m3e/icons` | `1.0.21` | Material Symbols 아이콘. 필요할 때 등록 |

VitePress는 아직 알파 단계입니다. 업그레이드할 때는 테마 코드, 구성 타입, 빌드 결과를 함께 확인하세요.

## 폴더 구조

```text
.
├── docs/
│   ├── config.ts                  모든 언어의 공통 구성
│   ├── en-US/                     영어, 사이트 루트에 배치
│   │   ├── config.ts              공통 구성을 재정의
│   │   ├── index.md               홈 페이지
│   │   └── getting-started/       레일 카테고리
│   │       └── installation/
│   │           └── index.md       글 /getting-started/installation.html
│   ├── zh-CN/                     중국어 간체, /zh-CN/ 아래에 배치
│   ├── public/                    정적 자산
│   └── .vitepress/
│       ├── config.mts             테마를 VitePress에 연결
│       ├── content/               폴더에서 언어, 경로, 내비게이션 생성
│       └── theme/                 테마 소스
├── tests/                         단위 테스트
└── package.json
```

페이지와 구성을 어디에 두는지는 [구성](/ko-KR/getting-started/configuration)과 [페이지 작성](/ko-KR/getting-started/writing)을 참고하세요. 테마 소스의 구조는 [테마 확장](/ko-KR/theme/extending/api#source-layout)을 참고하세요.

## 배포 {#deployment}

`npm run build`는 어떤 정적 호스팅에서도 제공할 수 있는 일반 정적 파일을 만듭니다.

- **페이지 경로**: 이 사이트는 `cleanUrls`를 꺼 두므로 페이지 경로가 `.html`로 끝나고(`/theme/layout.html`) 빌드 출력의 파일과 일대일로 대응합니다. 어떤 정적 호스팅에서도 그대로 제공할 수 있습니다. 확장자 없는 경로를 쓰려면 `.vitepress/config.mts`에서 `cleanUrls: true`로 설정하세요. 이 경우 파일을 찾지 못하면 호스트가 `.html`을 붙여 다시 시도해야 합니다. GitHub Pages, Netlify, Cloudflare Pages는 기본으로 이렇게 동작합니다. Vercel은 `vercel.json`에 `"cleanUrls": true`가 필요하고, Nginx에서는 `try_files $uri $uri.html $uri/ =404;`를 작성합니다.
- **하위 경로에 배포**: 예를 들어 `https://example.com/docs/`라면 `.vitepress/config.mts`에 `base: "/docs/"`를 설정합니다. 내비게이션, 히어로, 로고, 검색 색인의 내부 경로에는 자동으로 붙습니다.
- **검색 색인**: 각 언어의 색인은 빌드할 때 출력의 `assets/chunks/`에 묶입니다. 추가 작업은 필요 없습니다.

## 자주 묻는 질문

### 빈 페이지가 나오거나 컴포넌트에 스타일이 없음

테마는 브라우저에서 m3e 컴포넌트를 등록하고, 등록이 끝나면 `html`에 `data-akari-ready`를 추가합니다. 먼저 브라우저 콘솔에서 모듈 로딩 오류를 확인하세요. 스크립트가 꺼져 있거나 로드에 실패하면 3초 뒤에 콘텐츠가 일반 HTML로 표시됩니다. 브라우저는 Custom Elements, Shadow DOM, 네이티브 ES 모듈을 지원해야 합니다.

### 컴포넌트를 브라우저에서만 등록하는 이유

m3e 컴포넌트는 Lit 사용자 정의 요소입니다. 등록하려면 `customElements.define`이 필요한데, Node.js에는 이것이 없습니다. 테마 진입점은 브라우저에서만 `m3e.ts`를 가져오고, 서버 사이드 렌더링은 요소 태그와 슬롯 콘텐츠만 출력합니다. 서버에서 실행되는 코드에서는 `@m3e/web` 컴포넌트 모듈을 가져오지 마세요.

### 새 컴포넌트나 아이콘이 표시되지 않음

컴포넌트와 아이콘은 모두 필요할 때 등록됩니다. 컴포넌트는 `docs/.vitepress/theme/m3e.ts`에서 해당 하위 경로를 가져옵니다(모든 컴포넌트를 등록하는 `@m3e/web/all`은 가져오지 마세요). 아이콘은 `icons.ts`에서 가져옵니다. 등록하지 않은 아이콘은 빈칸으로 표시됩니다.

### 빌드에서 알 수 없는 Vue 컴포넌트를 보고함

`.vitepress/config.mts`는 `vue.template.compilerOptions.isCustomElement`로 `m3e-`로 시작하는 태그를 통과시킵니다. 다른 프로젝트에서 테마를 재사용할 때도 이 설정을 유지하세요.
