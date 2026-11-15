---
tab: API
---

# 버튼: API

아래 내용은 `@m3e/web` 2.10.3의 컴포넌트 메타데이터에서 가져왔습니다.

## m3e-button

| 속성 | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `variant` | `elevated`, `filled`, `tonal`, `outlined`, `text` | `text` | 모양 |
| `size` | `extra-small`, `small`, `medium`, `large`, `extra-large` | `small` | 크기 |
| `shape` | `rounded`, `square` | `rounded` | 형태 |
| `disabled` | 불리언 | `false` | 비활성이며 포커스를 받을 수 없음 |
| `disabled-interactive` | 불리언 | `false` | 비활성이지만 포커스를 받을 수 있어 독자가 동작을 발견할 수 있음 |
| `toggle` | 불리언 | `false` | 두 가지 상태의 토글로 동작 |
| `selected` | 불리언 | `false` | 토글의 선택 상태 |
| `href` | 문자열 | `""` | 설정하면 버튼이 링크가 됨 |
| `target` | `_self`, `_blank`, `_parent`, `_top` 또는 창 이름 | `""` | 링크가 열리는 위치 |
| `rel` | 문자열 | `""` | 링크와 현재 페이지의 관계 |
| `download` | 문자열 | 없음 | 다운로드 링크로 만듦. 값은 파일 이름 |
| `type` | `button`, `submit`, `reset` | `button` | 폼 안에서의 동작 |
| `name`, `value` | 문자열 | 없음 | 폼을 제출할 때 보내는 이름과 값 |

| 슬롯 | 내용 |
| --- | --- |
| (기본) | 버튼 텍스트 |
| `icon` | 텍스트 앞의 아이콘 |
| `trailing-icon` | 텍스트 뒤의 아이콘 |
| `selected` | 선택되었을 때의 텍스트 |
| `selected-icon` | 선택되었을 때의 아이콘 |

| 이벤트 | 시점 |
| --- | --- |
| `click` | 클릭할 때 |
| `beforeinput` | 토글이 전환되려 할 때. 취소할 수 있음 |
| `input`, `change` | 토글이 전환되었을 때 |

## m3e-icon-button

`m3e-button`과 같은 속성에 다음이 더해집니다.

| 속성 | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `variant` | `standard`, `filled`, `tonal`, `outlined`, `elevated` | `standard` | 모양 |
| `width` | `default`, `narrow`, `wide` | `default` | 너비 |

| 슬롯 | 내용 |
| --- | --- |
| (기본) | 아이콘 |
| `selected` | 선택되었을 때의 아이콘 |

이벤트는 `m3e-button`과 같습니다.

## m3e-tooltip

| 속성 | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `for` | 요소 id | 없음 | 툴팁이 속한 컨트롤 |
| `position` | `above`, `below`, `before`, `after` | `below` | 컨트롤 기준 위치 |
| `show-delay` | 밀리초 | `0` | 표시 전 지연 시간 |
| `hide-delay` | 밀리초 | `200` | 숨기기 전 지연 시간 |
| `touch-gestures` | `auto`, `on`, `off` | `auto` | 터치 제스처 처리 방식 |
| `disabled` | 불리언 | `false` | 툴팁을 비활성화 |

## 문서에서 버튼 사용

- `href`가 있는 사이트 내 `m3e-button`은 테마가 이어받아 페이지 안에서 전환하며, `target="_self"`이면 페이지 전체를 불러옵니다. 스크립트에서 이동해야 한다면 `useRouter().go()`를 호출하세요. [내비게이션](/ko-KR/components/navigation#spa-navigation)을 참고하세요.
- 보이는 크기와 관계없이 버튼은 최소 48×48dp의 터치 영역을 유지합니다.
- 테마의 `m3e.ts`가 컴포넌트(`@m3e/web/button`, `@m3e/web/icon-button`, `@m3e/web/tooltip`)를 등록합니다.
