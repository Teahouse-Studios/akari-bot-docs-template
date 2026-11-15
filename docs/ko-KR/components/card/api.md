---
tab: API
---

# 카드: API

아래 내용은 `@m3e/web` 2.10.3의 컴포넌트 메타데이터에서 가져왔습니다.

## m3e-card

| 속성 | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `variant` | `elevated`, `filled`, `outlined` | `filled` | 모양 |
| `orientation` | `vertical`, `horizontal` | `vertical` | 콘텐츠를 배치하는 방향 |
| `inline` | 불리언 | `false` | 카드를 인라인 요소로 배치 |
| `actionable` | 불리언 | `false` | 카드 전체를 하나의 상호작용 영역으로 만듦 |
| `href`, `target`, `rel`, `download` | 버튼과 같음 | 버튼과 같음 | `actionable`일 때 카드를 링크로 만듦 |
| `disabled`, `disabled-interactive` | 불리언 | `false` | `actionable`일 때 카드를 비활성화 |
| `type`, `name`, `value` | 버튼과 같음 | `button` | `actionable`일 때 폼 안에서의 동작 |

| 슬롯 | 내용 |
| --- | --- |
| (기본) | 안쪽 여백 없음. 꽉 찬 이미지나 사용자 정의 레이아웃에 어울림 |
| `header` | 제목, 아이콘, 미디어. 추가 안쪽 여백 없음 |
| `content` | 본문. 안쪽 여백 있음 |
| `actions` | 동작 버튼. 기본적으로 시작 쪽 가장자리에 정렬되며, 요소에 `end` 속성을 추가하면 끝 쪽 가장자리에 정렬됨 |
| `footer` | 메타데이터, 저작권, 부가 설명 |

| 이벤트 | 시점 |
| --- | --- |
| `click` | `actionable` 카드를 클릭했을 때 |

## m3e-dialog

| 속성 | 값 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `open` | 불리언 | `false` | 대화상자가 열려 있는지 여부 |
| `dismissible` | 불리언 | `false` | 닫기 버튼을 표시 |
| `disable-close` | 불리언 | `false` | 스크림 클릭이나 `Esc`로 닫히지 않게 함 |
| `alert` | 불리언 | `false` | 경고 대화상자로 동작 |
| `close-label` | 문자열 | `"Close"` | 닫기 버튼의 접근 가능한 이름 |
| `no-focus-trap` | 불리언 | `false` | `Tab` 포커스를 대화상자 안에 가두지 않음 |

| 슬롯 | 내용 |
| --- | --- |
| (기본) | 본문 |
| `header` | 제목 |
| `actions` | 동작 버튼 |
| `close-icon` | 닫기 버튼의 아이콘 |

| 이벤트 | 시점 |
| --- | --- |
| `opening`, `opened` | 열기 시작, 열기 완료 |
| `closing`, `closed` | 닫기 시작, 닫기 완료 |
| `cancel` | 스크림이나 `Esc`로 취소됨 |

`m3e-dialog-trigger`(속성 `for`: 대화상자의 id)는 버튼 안에 넣으며, 버튼을 클릭하면 대화상자를 엽니다. `m3e-dialog-action`(속성 `return-value`)은 대화상자 안의 버튼에 넣으며, 클릭하면 대화상자를 닫고 그 값을 반환합니다.

## 모양 사용자 정의

`--m3e-card-*` 변수는 카드의 모서리 반경, 색상, 안쪽 여백을 제어합니다. 예를 들어 `--m3e-card-shape`는 모서리 반경입니다.

```html
<m3e-card variant="outlined" style="--m3e-card-shape: 28px;">…</m3e-card>
```

테마의 `m3e.ts`가 컴포넌트(`@m3e/web/card`, `@m3e/web/dialog`)를 등록합니다.
