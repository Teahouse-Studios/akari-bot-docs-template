---
icon: language
order: 3
badge: New
tab: 개요
parallel:
  - api
---

# 내비게이션

내비게이션용 m3e 컴포넌트는 세 그룹으로 나뉩니다. `m3e-nav-menu`는 여러 단계의 페이지를 구성하고, `m3e-tabs`는 한 페이지 안에서 보기를 전환하며, 칩과 배지는 상태와 필터를 보여 줍니다.

## 사이드 내비게이션

`m3e-nav-menu`는 여러 단계의 내비게이션을 담습니다. `m3e-nav-menu-item`은 `label`, `icon`, `badge` 슬롯으로 내용을 배치합니다. 그룹을 펼치려면 `open`을, 현재 최하위 항목을 강조하려면 `selected`를 씁니다.

<div class="demo-surface" style="max-width: 320px; max-block-size: 320px;">
  <m3e-nav-menu aria-label="컴포넌트 내비게이션 데모">
    <m3e-nav-menu-item open>
      <m3e-icon slot="icon" name="widgets"></m3e-icon>
      <span slot="label">컴포넌트</span>
      <m3e-nav-menu-item>
        <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
        <a slot="label" href="/ko-KR/components/button.html">버튼</a>
      </m3e-nav-menu-item>
      <m3e-nav-menu-item selected>
        <m3e-icon slot="icon" name="language"></m3e-icon>
        <a slot="label" href="/ko-KR/components/navigation.html">내비게이션</a>
      </m3e-nav-menu-item>
    </m3e-nav-menu-item>
    <m3e-nav-menu-item>
      <m3e-icon slot="icon" name="dashboard"></m3e-icon>
      <a slot="label" href="/ko-KR/components/card.html">카드</a>
      <span slot="badge">New</span>
    </m3e-nav-menu-item>
  </m3e-nav-menu>
</div>

```html
<m3e-nav-menu aria-label="컴포넌트 내비게이션 데모">
  <m3e-nav-menu-item open>
    <m3e-icon slot="icon" name="widgets"></m3e-icon>
    <span slot="label">컴포넌트</span>
    <m3e-nav-menu-item selected>
      <m3e-icon slot="icon" name="language"></m3e-icon>
      <a slot="label" href="/ko-KR/components/navigation.html">내비게이션</a>
    </m3e-nav-menu-item>
  </m3e-nav-menu-item>
  <m3e-nav-menu-item>
    <m3e-icon slot="icon" name="dashboard"></m3e-icon>
    <a slot="label" href="/ko-KR/components/card.html">카드</a>
    <span slot="badge">New</span>
  </m3e-nav-menu-item>
</m3e-nav-menu>
```

`open`은 그룹이 펼쳐져 있는지를 제어합니다. 실행 중에는 컴포넌트가 하위 항목의 선택 상태에 따라 이를 직접 관리할 수도 있습니다. `disabled`는 그 항목과 모든 하위 항목을 비활성화합니다. 기본적으로 메뉴는 높이가 제한되면 자기 안에서 스크롤됩니다.

## 탭 {#tabs}

`m3e-tabs`의 직계 자식은 `m3e-tab`과 `m3e-tab-panel`만 될 수 있습니다. 각 `m3e-tab`의 `for`는 해당 패널의 `id`를 가리키며, `selected`는 탭 하나에만 줄 수 있습니다.

<m3e-tabs variant="primary">
  <m3e-tab selected for="nav-demo-panel-overview">
    <m3e-icon slot="icon" name="home"></m3e-icon>
    개요
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-button">
    <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
    버튼
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-card">
    <m3e-icon slot="icon" name="dashboard"></m3e-icon>
    카드
  </m3e-tab>
  <m3e-tab-panel id="nav-demo-panel-overview">
    개요 패널: 컴포넌트의 용도, 변형, 사용 팁.
  </m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-button">
    버튼 패널: <code>m3e-button</code>과 <code>m3e-icon-button</code>의 다섯 가지 변형.
  </m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-card">
    카드 패널: <code>m3e-card</code>의 슬롯, 변형, 동작 가능 모드.
  </m3e-tab-panel>
</m3e-tabs>

```html
<m3e-tabs variant="primary">
  <m3e-tab selected for="nav-demo-panel-overview">
    <m3e-icon slot="icon" name="home"></m3e-icon>
    개요
  </m3e-tab>
  <m3e-tab for="nav-demo-panel-button">
    <m3e-icon slot="icon" name="radio_button_checked"></m3e-icon>
    버튼
  </m3e-tab>
  <m3e-tab-panel id="nav-demo-panel-overview">개요 패널 내용.</m3e-tab-panel>
  <m3e-tab-panel id="nav-demo-panel-button">버튼 패널 내용.</m3e-tab-panel>
</m3e-tabs>
```

`variant="primary"`는 주 탭 스타일이고(기본값은 `secondary`), `stretch`는 탭의 너비를 같게 해 컨테이너를 채웁니다. 탭이 많으면 가로 스크롤이나 페이지 넘김을 허용하세요. 텍스트를 읽을 수 없을 만큼 좁히지 마세요.

## 칩과 필터

`m3e-chip`은 카테고리, 상태, 기술 스택을 보여 주는 상호작용 없는 칩입니다. 칩을 `.demo-row`로 감싸 간격을 조절합니다.

<div class="demo-row">
  <m3e-chip>
    <m3e-icon slot="icon" name="palette"></m3e-icon>
    테마
  </m3e-chip>
  <m3e-chip>
    <m3e-icon slot="icon" name="layers"></m3e-icon>
    컴포넌트
  </m3e-chip>
  <m3e-chip variant="elevated">
    <m3e-icon slot="icon" name="check"></m3e-icon>
    사용 중
  </m3e-chip>
</div>

```html
<div class="demo-row">
  <m3e-chip>
    <m3e-icon slot="icon" name="palette"></m3e-icon>
    테마
  </m3e-chip>
  <m3e-chip>
    <m3e-icon slot="icon" name="layers"></m3e-icon>
    컴포넌트
  </m3e-chip>
  <m3e-chip variant="elevated">
    <m3e-icon slot="icon" name="check"></m3e-icon>
    사용 중
  </m3e-chip>
</div>
```

사용자가 콘텐츠를 걸러야 할 때는 상호작용 가능한 필터 칩을 씁니다.

<m3e-filter-chip-set aria-label="문서 필터">
  <m3e-filter-chip selected value="all">전체</m3e-filter-chip>
  <m3e-filter-chip value="theme">테마</m3e-filter-chip>
  <m3e-filter-chip value="style">스타일</m3e-filter-chip>
  <m3e-filter-chip value="component">컴포넌트</m3e-filter-chip>
</m3e-filter-chip-set>

```html
<m3e-filter-chip-set aria-label="문서 필터">
  <m3e-filter-chip selected value="all">전체</m3e-filter-chip>
  <m3e-filter-chip value="theme">테마</m3e-filter-chip>
  <m3e-filter-chip value="style">스타일</m3e-filter-chip>
  <m3e-filter-chip value="component">컴포넌트</m3e-filter-chip>
</m3e-filter-chip-set>
```

필터 칩은 자체 선택 상태와 키보드 처리를 갖습니다. `selected`는 초깃값을 정하고, 클릭하면 변경 이벤트가 발생합니다. 상호작용 없는 `m3e-chip`과는 의미가 다르므로 둘을 섞어 쓰지 마세요.

## 배지

배지는 단독으로 개수를 보여 줄 수도 있고, `for`로 버튼이나 아이콘에 고정할 수도 있습니다.

<div class="demo-row">
  <m3e-badge size="small">3</m3e-badge>
  <m3e-badge size="medium">12</m3e-badge>
  <m3e-badge size="large">99+</m3e-badge>
  <m3e-button id="navigation-demo-update" variant="outlined">업데이트</m3e-button>
  <m3e-badge for="navigation-demo-update" position="above-after">4</m3e-badge>
</div>

```html
<m3e-badge size="small">3</m3e-badge>
<m3e-badge size="medium">12</m3e-badge>
<m3e-badge size="large">99+</m3e-badge>
<m3e-button id="navigation-demo-update" variant="outlined">업데이트</m3e-button>
<m3e-badge for="navigation-demo-update" position="above-after">4</m3e-badge>
```

고정된 배지는 대상 요소의 레이아웃 변화를 따라가며, `position`으로 위치를 정합니다. 배지에는 기본 ARIA 역할이 없습니다. 상호작용 요소에 배지를 붙일 때는 `aria-describedby`나 그에 맞는 보이는 텍스트로 개수를 설명하세요.

## SPA 내비게이션 {#spa-navigation}

사이드바와 푸터의 내부 링크는 실제 `<a>` 요소로 렌더링해야 합니다. VitePress 2는 캡처 단계에서 내부 클릭을 가로채 SPA 내비게이션을 수행합니다. VitePress 2에서는 vue-router와 `RouterLink`가 제거되었으므로, 이를 가져오거나 이전 예제를 따르지 마세요.

```vue
<a
  v-if="item.link && !isExternalLink(item.link)"
  slot="label"
  :href="withBase(item.link)"
  :aria-current="isActive(item.link) ? 'page' : undefined"
>
  {{ item.text }}
</a>
<a
  v-else-if="item.link"
  slot="label"
  :href="item.link"
  target="_blank"
  rel="noreferrer"
>
  {{ item.text }}
</a>
```

`withBase`는 `vitepress`에서 가져오며, 내부 경로에 배포 기준 경로(base)를 붙입니다. VitePress 코어는 일반 왼쪽 클릭만 가로채므로, 가운데 클릭으로 새 탭 열기, 링크 복사, 접근성 의미는 모두 그대로 동작합니다. 외부 링크는 기본 동작을 유지하며 `target="_blank"`와 `rel="noreferrer"`를 받습니다.

스크립트에서 이동해야 한다면 `useRouter().go()`를 쓰세요.

```ts
import { useRouter, withBase } from "vitepress";

const router = useRouter();

function navigate(event: MouseEvent, link: string): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
    return;
  }

  event.preventDefault();
  void router.go(withBase(link));
}
```

m3e 버튼이나 아이콘 버튼 내부에서 생성된 앵커는 테마가 이어받으므로, 사이트 내 링크는 페이지 안에서 전환됩니다. `target="_self"`이면 페이지 전체를 불러오고, `target="_blank"`이면 새 탭에서 엽니다. 링크가 아닌 요소로 직접 클릭을 흉내 낼 때만 호스트 요소에서 클릭을 감지해 `router.go()`를 호출하면 됩니다.

이 페이지의 정적 데모는 일반 `<a>` 요소를 쓰므로 내부 클릭은 VitePress가 처리하고, 외부 링크는 여전히 페이지 전체를 불러옵니다. 어떤 방식을 쓰든 `div`와 클릭 핸들러로 링크를 흉내 내지 말고, 내부 내비게이션에서 실제 `href`를 빼지 마세요.

## 접근성

- 메뉴 루트에 `aria-label`을 설정해 문서 내비게이션 랜드마크임을 분명히 하세요.
- 현재 메뉴 항목은 `selected`로 표시합니다. 컴포넌트가 `aria-current`를 출력합니다.
- 탭은 `for`로 패널 `id`에 연결되며, `selected`는 탭 하나에만 줄 수 있습니다.
- 필터 칩에는 보이는 텍스트를 유지하세요. 선택 상태를 색상만으로 나타내지 마세요.
- 아이콘만 있는 버튼에는 반드시 `aria-label`과 툴팁이 있어야 합니다.

모든 속성, 슬롯, 이벤트는 [API](/ko-KR/components/navigation/api)를 참고하세요.
