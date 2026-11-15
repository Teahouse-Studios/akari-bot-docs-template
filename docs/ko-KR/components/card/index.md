---
icon: dashboard
order: 2
tab: 개요
parallel:
  - api
---

# 카드

`m3e-card`는 머리글, 본문, 동작, 바닥글을 하나의 독립된 표면에 담습니다. 기능 진입점, 문서 요약, 설정, 미디어에 쓰세요.

## 변형

세 가지 변형은 각기 다른 계층에 대응합니다.

<div class="demo-grid">
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Filled</m3e-heading>
    <div slot="content">기본 변형입니다. 컨테이너 색상은 <code>surface-container-highest</code>에서 가져오며, 외곽선이나 그림자가 없습니다.</div>
  </m3e-card>
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Outlined</m3e-heading>
    <div slot="content">1px 외곽선이 있습니다. 경계가 분명해야 하는 조밀한 목록과 콘텐츠 블록에 어울립니다.</div>
  </m3e-card>
  <m3e-card variant="elevated">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">Elevated</m3e-heading>
    <div slot="content">그림자와 표면 색상이 있습니다. 배경 위에 떠 있는 핵심 콘텐츠에 어울립니다.</div>
  </m3e-card>
</div>

```html
<m3e-card variant="filled">
  <m3e-heading slot="header" variant="title" size="large">Filled</m3e-heading>
  <div slot="content">기본 변형입니다. 컨테이너 색상은 표면 계층에서 가져옵니다.</div>
</m3e-card>
<m3e-card variant="outlined">
  <m3e-heading slot="header" variant="title" size="large">Outlined</m3e-heading>
  <div slot="content">1px 외곽선이 있습니다.</div>
</m3e-card>
<m3e-card variant="elevated">
  <m3e-heading slot="header" variant="title" size="large">Elevated</m3e-heading>
  <div slot="content">그림자와 표면 색상이 있습니다.</div>
</m3e-card>
```

`variant`가 없으면 카드는 `filled`를 씁니다.

## 슬롯

카드에는 다섯 영역이 있습니다.

- `header`: 제목, 아이콘, 미디어. 추가 안쪽 여백이 없습니다.
- `content`: 본문 영역. 안쪽 여백이 있습니다.
- `actions`: 동작 버튼. 기본적으로 시작 쪽 가장자리에 정렬됩니다. 요소에 `end` 속성을 추가하면 끝 쪽 가장자리에 정렬됩니다.
- `footer`: 메타데이터, 저작권, 부가 설명.
- 기본 슬롯: 안쪽 여백이 없습니다. 꽉 찬 이미지나 사용자 정의 레이아웃에 어울립니다.

<div class="demo-grid">
  <m3e-card variant="outlined">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">문서 요약</m3e-heading>
    <div slot="content">
      본문 영역에는 문단, 목록, 칩, 배지를 넣을 수 있습니다. 안쪽 여백은 카드가 관리합니다.
    </div>
    <div slot="actions" end>
      <m3e-button variant="text">취소</m3e-button>
      <m3e-button variant="filled">계속</m3e-button>
    </div>
    <div slot="footer">2026-10-27 업데이트</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined">
  <m3e-heading slot="header" variant="title" size="large">문서 요약</m3e-heading>
  <div slot="content">
    본문 영역에는 문단, 목록, 칩, 배지를 넣을 수 있습니다. 안쪽 여백은 카드가 관리합니다.
  </div>
  <div slot="actions" end>
    <m3e-button variant="text">취소</m3e-button>
    <m3e-button variant="filled">계속</m3e-button>
  </div>
  <div slot="footer">2026-10-27 업데이트</div>
</m3e-card>
```

`actions`의 버튼은 플랫폼 관례에 따라 배치합니다. 취소는 시작 쪽, 확인은 끝 쪽에 둡니다. 바닥글 텍스트는 본문과 시선을 다투지 않도록 보조 색상을 씁니다.

## 콘텐츠 조합

카드에는 제목, 칩, 배지, 목록을 섞어 넣을 수 있습니다.

<m3e-card variant="elevated">
  <m3e-heading m3e-toc-ignore slot="header" variant="headline" size="small">테마 기능</m3e-heading>
  <div slot="content">
    <div class="demo-row">
      <m3e-chip>
        <m3e-icon slot="icon" name="palette"></m3e-icon>
        동적 색상
      </m3e-chip>
      <m3e-chip>
        <m3e-icon slot="icon" name="layers"></m3e-icon>
        컴포넌트 재정의
      </m3e-chip>
      <m3e-badge size="small">Beta</m3e-badge>
    </div>
    <ul>
      <li>구성으로 만드는 내비게이션과 목차</li>
      <li>현재 브라우저에 저장되는 설정</li>
      <li>클라이언트에서 등록되며 SSR 빌드와 호환</li>
    </ul>
  </div>
  <div slot="actions">
    <m3e-button variant="tonal" href="/ko-KR/theme/extending.html">
      확장 방법 보기
      <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
    </m3e-button>
  </div>
</m3e-card>

```html
<m3e-card variant="elevated">
  <m3e-heading slot="header" variant="headline" size="small">테마 기능</m3e-heading>
  <div slot="content">
    <div class="demo-row">
      <m3e-chip>
        <m3e-icon slot="icon" name="palette"></m3e-icon>
        동적 색상
      </m3e-chip>
      <m3e-chip>
        <m3e-icon slot="icon" name="layers"></m3e-icon>
        컴포넌트 재정의
      </m3e-chip>
      <m3e-badge size="small">Beta</m3e-badge>
    </div>
    <ul>
      <li>구성으로 만드는 내비게이션과 목차</li>
      <li>현재 브라우저에 저장되는 설정</li>
      <li>클라이언트에서 등록되며 SSR 빌드와 호환</li>
    </ul>
  </div>
  <div slot="actions">
    <m3e-button variant="tonal" href="/ko-KR/theme/extending.html">
      확장 방법 보기
      <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
    </m3e-button>
  </div>
</m3e-card>
```

콘텐츠가 많아지면 카드는 그에 맞게 커집니다. 같은 그리드 안의 카드라도 높이가 자동으로 맞춰지지 않으므로 텍스트 길이를 비슷하게 유지하세요.

## 동작 가능한 카드

카드에 `actionable`을 추가하면 표면 전체가 하나의 상호작용 영역이 됩니다. `href`가 있으면 그대로 링크로 동작합니다.

<div class="demo-grid">
  <m3e-card variant="outlined" actionable href="/ko-KR/getting-started/installation.html">
    <m3e-icon slot="header" name="package_2"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">설치</m3e-heading>
    <div slot="content">Node와 의존성을 준비하고 첫 빌드를 만듭니다.</div>
  </m3e-card>
  <m3e-card variant="outlined" actionable href="/ko-KR/getting-started/configuration.html">
    <m3e-icon slot="header" name="tune"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">구성</m3e-heading>
    <div slot="content">앱 바, 내비게이션, 설정 항목, 목차 깊이를 조정합니다.</div>
  </m3e-card>
  <m3e-card variant="outlined" actionable href="/ko-KR/theme/extending.html">
    <m3e-icon slot="header" name="integration_instructions"></m3e-icon>
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">확장</m3e-heading>
    <div slot="content">컴포넌트 재정의와 CSS 토큰으로 인터페이스를 사용자 정의합니다.</div>
  </m3e-card>
</div>

```html
<m3e-card variant="outlined" actionable href="/ko-KR/getting-started/installation.html">
  <m3e-icon slot="header" name="package_2"></m3e-icon>
  <m3e-heading slot="header" variant="title" size="large">설치</m3e-heading>
  <div slot="content">Node와 의존성을 준비하고 첫 빌드를 만듭니다.</div>
</m3e-card>
```

동작 가능한 카드는 호버, 포커스, 누르기에 상태 레이어를 표시합니다. 전체를 클릭할 수 있는 카드 안에서는 다른 상호작용 요소를 없애, 중첩된 버튼 때문에 두 동작이 한꺼번에 일어나지 않게 하세요. 동작이 여러 개 필요하면 대신 `actions` 슬롯이 있는 일반 카드를 쓰세요.

## 대화상자 동작

카드의 동작으로 대화상자를 열 수 있습니다. 버튼 안에 `m3e-dialog-trigger`를 넣습니다. `m3e-dialog-action`은 대화상자를 닫고 결과를 반환합니다.

<m3e-card variant="outlined">
  <m3e-heading m3e-toc-ignore slot="header" variant="title" size="large">버전 정보</m3e-heading>
  <div slot="content">이 문서는 VitePress 2.0.0-alpha.21과 @m3e/web 2.10.3에 맞춰 작성되었습니다.</div>
  <div slot="actions" end>
    <m3e-button variant="filled">
      <m3e-dialog-trigger for="card-demo-dialog">자세히 보기</m3e-dialog-trigger>
    </m3e-button>
  </div>
</m3e-card>

<m3e-dialog id="card-demo-dialog" dismissible>
  <span slot="header">Vitepress Theme Akari Docs</span>
  <p>테마는 정적 생성과 라우팅에 VitePress를, UI 컴포넌트와 동적 색상에 m3e를 사용합니다.</p>
  <p>설정은 브라우저에 로컬로 저장되며 사이트 구성에는 기록되지 않습니다.</p>
  <div slot="actions" end>
    <m3e-button>
      <m3e-dialog-action return-value="close">닫기</m3e-dialog-action>
    </m3e-button>
  </div>
</m3e-dialog>

```html
<m3e-button variant="filled">
  <m3e-dialog-trigger for="card-demo-dialog">자세히 보기</m3e-dialog-trigger>
</m3e-button>
<m3e-dialog id="card-demo-dialog" dismissible>
  <span slot="header">Vitepress Theme Akari Docs</span>
  <p>테마는 정적 생성과 라우팅에 VitePress를, UI 컴포넌트와 동적 색상에 m3e를 사용합니다.</p>
  <div slot="actions" end>
    <m3e-button>
      <m3e-dialog-action return-value="close">닫기</m3e-dialog-action>
    </m3e-button>
  </div>
</m3e-dialog>
```

`dismissible`은 대화상자에 닫기 버튼을 줍니다. 스크림을 클릭하거나 `Escape`를 눌러도 닫힙니다. 진행을 막아야 하는 흐름에서는 `disable-close`와 명시적인 확인 동작을 추가하세요.

## 그리드 레이아웃

카드 그리드는 `.demo-grid`를 쓰며, 좁은 화면에서는 한 열이 됩니다. 카드 하나에는 주제 하나와 주요 동작 하나만 두고, 한 페이지 분량의 콘텐츠를 카드 하나에 몰아넣지 마세요.

<div class="demo-grid">
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">시작하기</m3e-heading>
    <div slot="content">설치부터 첫 빌드까지 약 10분이면 됩니다.</div>
  </m3e-card>
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">테마</m3e-heading>
    <div slot="content">앱 셸, 사이드바, 설정 대화상자를 이해합니다.</div>
  </m3e-card>
  <m3e-card variant="filled">
    <m3e-heading m3e-toc-ignore slot="header" variant="title" size="medium">스타일</m3e-heading>
    <div slot="content">색상 토큰과 글자 위계를 익힙니다.</div>
  </m3e-card>
</div>

## 사용 팁

- 카드 제목은 짧게, 본문은 최대 세 줄로 유지하세요. 긴 콘텐츠는 별도 페이지로 옮기세요.
- 그리드 안에서는 변형을 하나만 써서 시각적 혼잡을 피하세요.
- 전체를 클릭할 수 있는 카드에는 버튼을 중첩하지 마세요. 동작이 여러 개 필요하면 `actions`를 쓰세요.
- 이미지는 기본 슬롯이나 `header` 슬롯에 넣고 대체 텍스트를 지정하세요.
- 카드의 모서리 반경, 색상, 안쪽 여백은 `--m3e-card-*` 변수로 조정합니다. [테마 확장](/ko-KR/theme/extending)을 참고하세요.

모든 속성, 슬롯, 이벤트는 [API](/ko-KR/components/card/api)를 참고하세요.
