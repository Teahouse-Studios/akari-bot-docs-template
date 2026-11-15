---
icon: radio_button_checked
order: 1
tab: 개요
parallel:
  - api
---

# 버튼

`m3e-button`은 동작을 실행합니다. `m3e-icon-button`은 아이콘만 있는 작은 버튼입니다. 둘 다 변형, 크기, 모양, 비활성 상태, 링크, 선택을 지원합니다.

## 변형

다섯 가지 변형은 서로 다른 강조 정도를 나타냅니다.

<div class="demo-row">
  <m3e-button variant="elevated">Elevated</m3e-button>
  <m3e-button variant="filled">Filled</m3e-button>
  <m3e-button variant="tonal">Tonal</m3e-button>
  <m3e-button variant="outlined">Outlined</m3e-button>
  <m3e-button variant="text">Text</m3e-button>
</div>

```html
<m3e-button variant="elevated">Elevated</m3e-button>
<m3e-button variant="filled">Filled</m3e-button>
<m3e-button variant="tonal">Tonal</m3e-button>
<m3e-button variant="outlined">Outlined</m3e-button>
<m3e-button variant="text">Text</m3e-button>
```

- `filled`: 페이지에서 가장 중요한 동작. 보통 한 영역에 하나만 둡니다.
- `tonal`: 보조 동작. `filled`보다 부드럽습니다.
- `outlined`: 경계는 분명해야 하지만 강조가 높을 필요는 없는 동작.
- `text`: 도구 모음이나 카드 하단의 낮은 강조 동작.
- `elevated`: 떠 있어 보여야 하는 주요 동작. 카드나 표면과 잘 어울립니다.

## 크기와 모양

크기는 `extra-small`부터 `extra-large`까지 있으며, 기본값은 `small`입니다.

<div class="demo-row">
  <m3e-button variant="tonal" size="extra-small">Extra Small</m3e-button>
  <m3e-button variant="tonal" size="small">Small</m3e-button>
  <m3e-button variant="tonal" size="medium">Medium</m3e-button>
  <m3e-button variant="tonal" size="large">Large</m3e-button>
  <m3e-button variant="tonal" size="extra-large">Extra Large</m3e-button>
</div>

```html
<m3e-button variant="tonal" size="extra-small">Extra Small</m3e-button>
<m3e-button variant="tonal" size="small">Small</m3e-button>
<m3e-button variant="tonal" size="medium">Medium</m3e-button>
<m3e-button variant="tonal" size="large">Large</m3e-button>
<m3e-button variant="tonal" size="extra-large">Extra Large</m3e-button>
```

기본 모양은 `rounded`입니다. `shape="square"`를 설정하면 사각형이 됩니다.

<div class="demo-row">
  <m3e-button variant="filled" shape="square">Square Filled</m3e-button>
  <m3e-button variant="outlined" shape="square">Square Outlined</m3e-button>
  <m3e-button variant="text" shape="square">Square Text</m3e-button>
</div>

```html
<m3e-button variant="filled" shape="square">Square Filled</m3e-button>
<m3e-button variant="outlined" shape="square">Square Outlined</m3e-button>
<m3e-button variant="text" shape="square">Square Text</m3e-button>
```

보이는 크기와 관계없이 버튼은 최소 48×48dp의 터치 영역을 유지합니다.

## 아이콘

`icon` 슬롯은 텍스트 앞에, `trailing-icon` 슬롯은 텍스트 뒤에 놓입니다.

<div class="demo-row">
  <m3e-button variant="filled">
    <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
    만들기 시작
  </m3e-button>
  <m3e-button variant="tonal">
    구성 복사
    <m3e-icon slot="trailing-icon" name="content_copy"></m3e-icon>
  </m3e-button>
  <m3e-button variant="outlined">
    다음
    <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
  </m3e-button>
</div>

```html
<m3e-button variant="filled">
  <m3e-icon slot="icon" name="rocket_launch"></m3e-icon>
  만들기 시작
</m3e-button>
<m3e-button variant="tonal">
  구성 복사
  <m3e-icon slot="trailing-icon" name="content_copy"></m3e-icon>
</m3e-button>
<m3e-button variant="outlined">
  다음
  <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
</m3e-button>
```

아이콘은 기본적으로 보조 기술에서 숨겨지며, 버튼의 접근 가능한 이름은 보이는 텍스트에서 가져옵니다. 아이콘만 있는 버튼에는 반드시 `aria-label`이 있어야 합니다.

## 아이콘 버튼

아이콘 버튼에는 `standard`, `filled`, `tonal`, `outlined`, `elevated` 다섯 가지 변형이 있습니다. 텍스트가 없으므로 툴팁으로 기능을 알려 주세요.

<div class="demo-row">
  <m3e-icon-button id="button-demo-back" aria-label="뒤로">
    <m3e-icon name="arrow_back"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-back">뒤로</m3e-tooltip>

  <m3e-icon-button id="button-demo-settings" aria-label="설정" variant="tonal">
    <m3e-icon name="settings"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-settings">설정</m3e-tooltip>

  <m3e-icon-button id="button-demo-close" aria-label="닫기" variant="outlined">
    <m3e-icon name="close"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-close">닫기</m3e-tooltip>

  <m3e-icon-button id="button-demo-confirm" aria-label="확인" variant="filled">
    <m3e-icon name="check"></m3e-icon>
  </m3e-icon-button>
  <m3e-tooltip for="button-demo-confirm">확인</m3e-tooltip>
</div>

```html
<m3e-icon-button id="button-demo-settings" aria-label="설정" variant="tonal">
  <m3e-icon name="settings"></m3e-icon>
</m3e-icon-button>
<m3e-tooltip for="button-demo-settings">설정</m3e-tooltip>
```

각 툴팁의 `for`는 고유한 `id`를 가리킵니다. 한 페이지에 `id`가 중복되면 툴팁이 엉뚱한 곳에 나타나거나 첫 번째 요소에서만 동작합니다.

## 비활성 버튼과 링크 버튼

기본적으로 비활성 버튼은 키보드 포커스를 받을 수 없습니다. `disabled-interactive`를 쓰면 포커스를 받을 수 있어 사용자가 그 동작을 여전히 발견할 수 있습니다.

<div class="demo-row">
  <m3e-button variant="filled" disabled>비활성</m3e-button>
  <m3e-button variant="filled" disabled-interactive>비활성이지만 포커스 가능</m3e-button>
  <m3e-button variant="tonal" href="https://m3.material.io/" target="_blank" rel="noreferrer">
    Material 3 열기
    <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
  </m3e-button>
  <m3e-button variant="outlined" href="/ko-KR/components/card.html">
    카드 보기
    <m3e-icon slot="trailing-icon" name="chevron_right"></m3e-icon>
  </m3e-button>
</div>

```html
<m3e-button variant="filled" disabled>비활성</m3e-button>
<m3e-button variant="filled" disabled-interactive>비활성이지만 포커스 가능</m3e-button>
<m3e-button
  variant="tonal"
  href="https://m3.material.io/"
  target="_blank"
  rel="noreferrer"
>
  Material 3 열기
  <m3e-icon slot="trailing-icon" name="arrow_forward"></m3e-icon>
</m3e-button>
<m3e-button variant="outlined" href="/ko-KR/components/card.html">
  카드 보기
  <m3e-icon slot="trailing-icon" name="chevron_right"></m3e-icon>
</m3e-button>
```

`href`를 설정하면 버튼은 링크 의미로 렌더링되며 `target`, `rel`, `download`를 지원합니다. 테마가 사이트 내 링크를 이어받아 페이지 안에서 전환하며, `target="_self"`이면 페이지 전체를 불러오고, `target="_blank"`이면 새 탭에서 엽니다. 스크립트에서 이동해야 한다면 `useRouter().go()`를 호출하세요. 자세한 내용은 [내비게이션](/ko-KR/components/navigation)을 참고하세요.

## 선택 상태

`toggle`은 버튼을 두 가지 상태의 토글로 만들고, `selected`는 초기 상태를 정합니다.

<div class="demo-row">
  <m3e-button variant="filled" toggle selected>
    <m3e-icon slot="icon" name="check"></m3e-icon>
    선택됨
  </m3e-button>
  <m3e-button variant="tonal" toggle>토글</m3e-button>
  <m3e-button variant="outlined" toggle>
    <m3e-icon slot="icon" name="close"></m3e-icon>
    <m3e-icon slot="selected-icon" name="check"></m3e-icon>
    팔로우
    <span slot="selected">팔로우 중</span>
  </m3e-button>
</div>

```html
<m3e-button variant="filled" toggle selected>
  <m3e-icon slot="icon" name="check"></m3e-icon>
  선택됨
</m3e-button>
<m3e-button variant="tonal" toggle>토글</m3e-button>
<m3e-button variant="outlined" toggle>
  <m3e-icon slot="icon" name="close"></m3e-icon>
  <m3e-icon slot="selected-icon" name="check"></m3e-icon>
  팔로우
  <span slot="selected">팔로우 중</span>
</m3e-button>
```

버튼이 선택되면 `m3e-icon`은 자동으로 채워진 글리프로 바뀝니다. `selected-icon`과 `selected` 슬롯으로 아이콘과 텍스트를 바꿀 수도 있습니다. 토글하면 `beforeinput`, `input`, `change` 이벤트가 발생하며, `beforeinput`에서 취소할 수 있습니다.

## 접근성 팁

- 아이콘만 있는 버튼에는 반드시 `aria-label`을 설정하고 `m3e-tooltip`을 함께 둡니다.
- 툴팁 대상 `id`는 페이지에서 고유하게 유지하세요.
- 사용자가 비활성 동작을 알아야 한다면 `disabled-interactive`를 쓰고, 사용할 수 없는 이유를 설명하세요.
- 링크 버튼에는 `href`를 쓰세요. 일반 버튼에 라우팅 로직을 연결하면 링크 의미가 사라집니다.
- 주요 동작에는 `filled`를 쓰고, 같은 시각 영역에 강조가 높은 버튼을 여러 개 두지 마세요.

모든 속성, 슬롯, 이벤트는 [API](/ko-KR/components/button/api)를 참고하세요.
