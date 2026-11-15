---
tab: API
---

# 내비게이션: API

아래 내용은 `@m3e/web` 2.10.3의 컴포넌트 메타데이터에서 가져왔습니다.

## m3e-nav-menu와 m3e-nav-menu-item

`m3e-nav-menu`에는 속성이 없습니다. 기본 슬롯에 `m3e-nav-menu-item` 요소를 넣습니다.

| 속성 | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `open` | 불리언 | `false` | 하위 항목을 펼침 |
| `selected` | 불리언 | `false` | 현재 항목. 컴포넌트가 `aria-current`에 대응시킴 |
| `disabled` | 불리언 | `false` | 이 항목과 모든 하위 항목을 비활성화 |

| 슬롯 | 내용 |
| --- | --- |
| (기본) | 중첩된 하위 항목 |
| `label` | 텍스트. 보통 링크 |
| `icon` | 아이콘 |
| `selected-icon` | 선택되었을 때의 아이콘 |
| `badge` | 배지 |
| `toggle-icon` | 펼치기와 접기 아이콘 |

| 이벤트 | 시점 |
| --- | --- |
| `opening`, `opened`, `closing`, `closed` | 펼치기와 접기의 시작과 완료 |
| `click` | 클릭할 때 |

## m3e-tabs, m3e-tab, m3e-tab-panel

| `m3e-tabs` 속성 | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `variant` | `primary`, `secondary` | `secondary` | 모양 |
| `stretch` | 불리언 | `false` | 탭의 너비를 같게 해 컨테이너를 채움 |
| `header-position` | `before`, `after` | `before` | 탭 바를 패널 앞에 둘지 뒤에 둘지 |
| `disable-pagination` | 불리언 | `false` | 탭이 넘칠 때 페이지 넘김 버튼을 숨김 |
| `disable-swipe` | 불리언 | `false` | 패널을 스와이프해 탭을 전환하는 기능을 끔 |
| `previous-page-label`, `next-page-label` | 문자열 | `"Previous page"`, `"Next page"` | 페이지 넘김 버튼의 접근 가능한 이름 |

| `m3e-tab` 속성 | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `for` | 패널 id | 없음 | 대응하는 `m3e-tab-panel` |
| `selected` | 불리언 | `false` | 현재 탭. 하나만 허용 |
| `disabled` | 불리언 | `false` | 비활성 |

[개요](/ko-KR/components/navigation#tabs)의 예제처럼 `m3e-tab`과 `m3e-tab-panel`은 `m3e-tabs` 안에 직접 작성합니다. `prev-icon`과 `next-icon` 슬롯은 페이지 넘김 아이콘을 바꿉니다. 탭을 전환하면 `beforeinput`(취소 가능), `input`, `change`가 발생합니다. `m3e-tab`에는 `icon` 슬롯도 있습니다.

## m3e-chip과 m3e-filter-chip

| 속성 | 사용 대상 | 값 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `variant` | 둘 다 | `outlined`, `elevated` | `outlined` | 모양 |
| `value` | 둘 다 | 문자열 | 없음 | 값 |
| `selected` | 필터 칩 | 불리언 | `false` | 선택됨 |
| `disabled`, `disabled-interactive` | 필터 칩 | 불리언 | `false` | 비활성 |

둘 다 기본 슬롯(텍스트)과 `icon`, `trailing-icon` 슬롯이 있습니다. `m3e-chip`은 상호작용하지 않습니다. `m3e-filter-chip`은 토글될 때 `beforeinput`, `input`, `change`를 발생시킵니다.

`m3e-filter-chip-set`은 필터 칩 그룹을 감쌉니다. `multi`는 여러 개 선택을 허용하고, `vertical`은 세로로 쌓으며, `hide-selection-indicator`는 선택 표시를 숨기고, `disabled`는 그룹 전체를 비활성화하며, `name`은 폼에 쓰입니다. 선택이 바뀌면 `change`를 발생시킵니다.

## m3e-badge

| 속성 | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `size` | `small`, `medium`, `large` | `medium` | 크기 |
| `for` | 요소 id | 없음 | 배지를 이 요소에 고정 |
| `position` | `above-after`, `above-before`, `below-before`, `below-after`, `before`, `after`, `above`, `below` | `above-after` | 고정되었을 때 요소 기준 위치 |

배지에는 기본 ARIA 역할이 없습니다. 상호작용 요소에 배지를 붙일 때는 `aria-describedby`나 그에 맞는 보이는 텍스트로 개수를 설명하세요.

테마의 `m3e.ts`가 컴포넌트(`@m3e/web/nav-menu`, `@m3e/web/tabs`, `@m3e/web/chips`, `@m3e/web/badge`)를 등록합니다.
