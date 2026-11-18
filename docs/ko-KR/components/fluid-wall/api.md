---
tab: API
---

# 유체 배경 벽: API

`AkariFluidWall`은 `@m3e/web` 요소가 아니라 테마 자체의 컴포넌트입니다. `--md-sys-color-*`와 `--md-sys-motion-*`를 읽으므로 배색과 움직임 설정을 따라갑니다. 색은 WebGL2 프래그먼트 셰이더에서 계산해 uniform으로 넘기므로, 배색을 바꿔도 같은 장을 다시 칠할 뿐 프로그램을 새로 만들지 않습니다.

## AkariFluidWall

| 속성 | 형 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `height` | `string` | `clamp(220px, 34vh, 380px)` | 임의의 CSS 길이 |
| `variant` | `string` | `"silk"` | `silk`, `aurora`, `mesh`, `nebula`, `blossom`. 모르는 값은 `silk` |
| `light` | `"start" \| "center" \| "end"` | `"end"` | 가상 광원의 위치. 주변 어둡기의 방향도 정한다 |
| `placement` | `"start" \| "center" \| "end"` | `"start"` | 슬롯 내용의 가로 위치. 베일도 같은 방향으로 돈다 |
| `texture` | `string` | `variant`에 따름 | `none`, `sakura`, `petals`, `stars`, `lace`, `vine`, `dots` |
| `texture-size` | `number \| string` | `texture`에 따름 | 겹침 무늬의 타일 변, px. 80–640으로 자름 |
| `texture-density` | `number \| string` | `texture`에 따름 | 밀도 배율. 0–3으로 자름 |
| `vine-density` | `number \| string` | `0.7` | 덩굴 밀도 배율. 0.2–2로 제한됩니다. 값이 작을수록 덩굴이 적습니다. |
| `texture-opacity` | `number \| string` | `variant`에 따름 | 0–1. 실제 투명도는 무늬별 가중치도 곱한다 |
| `texture-tone` | `"auto" \| "ink" \| "light"` | `"auto"` | 선화인지 채움인지. `auto`는 밝기에 따른다 |
| `texture-color` | `string` | — | 임의의 CSS 색상. `texture-tone`을 덮어쓰며 오버레이와 덩굴 모두에 적용됩니다. alpha는 오버레이에만 적용됩니다. |
| `vine-colors` | `Partial<Record<"base" \| "leaf" \| "leafStem" \| "flower" \| "flowerStem" \| "bud" \| "fill" \| "tint" \| "halo" \| "edge" \| "fine", string>>` | — | 덩굴 부위별 색상. 값에 alpha를 포함할 수 있습니다. `base`는 개별 지정이 없는 부위의 기본 색이며, 나머지 미지정 부위는 `texture-color`를 따릅니다. |
| `vine-blend` | `"normal" \| "multiply" \| "screen" \| "overlay" \| "soft-light" \| "difference"` | `"normal"` | 덩굴과 유체 배경의 혼합 모드(CSS `mix-blend-mode`). |
| `vine-popout-blend` | `"normal" \| "multiply" \| "screen" \| "overlay" \| "soft-light" \| "difference"` | `vine-blend` | 돌출 덩굴 전용 혼합 모드. `vine-blend`와 다르게 설정했을 때만 별도 캔버스를 사용합니다. |
| `vine-popout-colors` | `Partial<Record<"base" \| "leaf" \| "leafStem" \| "flower" \| "flowerStem" \| "bud" \| "fill" \| "tint" \| "halo" \| "edge" \| "fine", string>>` | — | 출구점을 지난 돌출 부분의 부위 색상. |
| `speed` | `number \| string` | `variant`에 따름 | 흐름 속도 배율. 1이 변형 자체의 속도 |
| `scale` | `number \| string` | `variant`에 따름 | 노이즈 축척. 클수록 주름이 잘다 |
| `curl` | `number \| string` | `variant`에 따름 | 말림 강도. 0은 방향 없는 흐름 |
| `warp` | `number \| string` | `variant`에 따름 | 2차 왜곡의 끌림 거리. 작을수록 조용하다 |
| `tone` | `number \| string` | `variant`에 따름 | 0이 설계 대비, 1이면 페이지 바탕색까지 옅어진다 |
| `grid` | `number \| string` | `variant`에 따름 | 격자 간격, px. 0이면 그리지 않는다 |
| `glow` | `number \| string` | `variant`에 따름 | 포인터를 따르는 부드러운 빛의 세기. 0이면 끈다 |
| `petal` | `number \| string` | `variant`에 따름 | 주름이 꽃잎 팔로 말리는 정도. 0은 순수한 흐름 |
| `popout` | `boolean \| "auto"` | `"auto"` | 덩굴이 틀을 넘는지. `auto`는 페이지 설정을 따른다 |
| `inward` | `boolean \| "auto"` | `"auto"` | 덩굴이 판 안을 아치로 오르는지. `auto`는 `popout`과 같다 |
| `safe-zone` | `boolean \| string \| string[]` | `"auto"` | 덩굴이 피하는 영역. `auto`는 벽 위 글을 피한다 |
| `outside-safe-zone` | `boolean \| string \| string[]` | `"none"` | 벽 외부 안전 영역. 벽 밖으로 나가는 덩굴이 피할 사각형. `safe-zone`과 같은 지정 방식을 쓰며 음수 값은 벽 바깥까지 확장됩니다. |
| `ripple` | `number` | `1` | 돌출 지점 파문의 강도. 0이면 끔. |
| `ripple-speed` | `number` | `1` | 파문 속도 배율. |
| `ripple-size` | `number` | `1` | 파문 반경 배율. |
| `ripple-rings` | `number \| string` | `2.2` | 파문 반경 안의 고리 수, 0.5–6 |
| `ripple-sway` | `number \| string` | `1` | 파문이 덩굴을 밀어내는 진폭 배율, 0–3 |
| `vine-glow` | `number \| string` | `1` | 덩굴에 닿는 포인터 빛의 세기, 0–2; 0이면 끔 |
| `shadow` | `number` | `1` | 돌출 그림자의 진하기 배율. 0이면 끔. |
| `shadow-size` | `number` | `1` | 그림자 크기 배율. |
| `shadow-color` | `string` | 덩굴 채움색을 어둡게 한 값 | 그림자 색. |
| `shadow-angle` | `number` | `303.5` | 그림자 방향(도). 0은 +x, 90은 +y. |
| `shadow-blur` | `number` | `6` | 그림자 흐림 반경(CSS 픽셀). 0이면 딱딱한 가장자리. |
| `wall-shadow` | `number` | `1` | 벽 안쪽 그림자의 진하기 배율. |
| `wall-shadow-size` | `number` | `1` | 벽 안쪽 그림자의 크기 배율. |
| `wall-shadow-color` | `string` | `덩굴 채우기 색에서 파생` | 벽 안쪽 그림자의 색. |
| `wall-shadow-angle` | `number` | `180` | 벽 안쪽 그림자의 그림자 대비 방향 오프셋(도). |
| `wall-shadow-blur` | `number` | `6` | 벽 안쪽 그림자의 흐림 반경(CSS 픽셀). 0이면 딱딱한 가장자리. |
| `underlay-color` | `string` | `#ffffff` | 덩굴 바탕 아래에 겹치는 광의 색. |
| `underlay-opacity` | `number` | `0.18` | 광의 불투명도(0–1). |
| `underlay-blend` | `string` | `additive` | 바탕 광의 혼합 모드: `additive`, `screen`, `normal`, `multiply`, `subtractive`. |
| `mote` | `number` | `1` | 입자 수 배율(0–3). 0이면 입자를 끕니다. |
| `mote-color` | `string` | 꽃 색상 | 입자 색상. 임의의 CSS 색상. |
| `mote-blend` | `string` | `auto` | 입자 혼합 모드: `auto`, `normal`, `additive`, `multiply`, `subtractive`. |

숫자 속성은 `"1.2"` 같은 CSS 문자열도 받고 내부에서 `fluidNumber`로 자릅니다. 해석할 수 없는 값은 변형의 값으로 돌아갑니다.

| 슬롯 | 내용 |
| --- | --- |
| 기본 | 가운데 열. 가로 위치는 `placement`를 따른다 |
| `top` | 오른쪽 위에 고정하는 배지 |
| `bottom` | 왼쪽 아래에 고정하는 각주 |

| CSS 클래스 | 위치 |
| --- | --- |
| `.akari-fluid-wall` | 루트. `data-placement`가 정렬을 나타낸다 |
| `.akari-fluid-wall__canvas` | WebGL2 캔버스. 첫 프레임 뒤에 옅게 나타난다 |
| `.akari-fluid-wall__grid`, `__grid-lit` | 격자와 포인터로 밝아지는 복제 |
| `.akari-fluid-wall__texture`, `__texture-pattern`, `__texture-lit` | 겹침 무늬와 그 밝은 층 |
| `.akari-fluid-wall__ribbons`, `__ribbon-lace`, `__ribbon-scallop` | 레이스 띠 층, 무늬, 부채 가장자리 |
| `.akari-fluid-wall__vine-canvas` | 덩굴 캔버스 |
| `.akari-fluid-wall__veil` | 슬롯 글 아래에 까는 그라디언트 |
| `.akari-fluid-wall__body`, `__block` | 슬롯 용기와 한 덩어리 |

## 내보내기

기하와 조색 논리는 `fluid.ts`에 있고 컴포넌트와 함께 테마 입구에서 나갑니다.

```ts
import {
  AkariFluidWall,
  FLUID_VARIANTS,
  FLUID_VARIANT_SPECS,
  FLUID_TEXTURES,
  FLUID_TEXTURE_SIZES,
  FLUID_TEXTURE_WEIGHTS,
  resolveFluid,
  fluidVariant,
  fluidTexture,
  fluidTextureTone,
  fluidNumber,
  fluidPalette,
  mixFluid,
  FLUID_LOOPS,
  fluidLoopOffset,
  fluidLoopOffsets,
  fluidRenderSize,
  FLUID_MAX_DPR,
  buildFluidRibbons,
  ribbonLacePitch,
  ribbonLacePath,
  ribbonScallopPath,
  ribbonScallopAmplitude,
  ribbonEdgePath,
  ribbonBandPath,
} from "vitepress-akari-theme-docs";
```

| 이름 | 설명 |
| --- | --- |
| `FLUID_VARIANTS`, `FLUID_VARIANT_SPECS` | 다섯 변형 이름과 각각의 전체 값 묶음 |
| `FLUID_TEXTURES`, `FLUID_TEXTURE_SIZES`, `FLUID_TEXTURE_WEIGHTS` | 일곱 겹침 무늬, 타일 크기, 가중치 |
| `resolveFluid(variant, overrides)` | 표를 바탕으로 명시 값을 덮고 잘라 `FluidVariantSpec`을 낸다 |
| `fluidVariant(v)`, `fluidTexture(v)` | 임의 입력을 합법 열거로 좁히고 모르면 `silk` / `none` |
| `fluidTextureTone(tone, scheme)` | `auto`를 `ink`나 `light`로 푼다 |
| `fluidNumber(value, min, max, fallback)` | 자르기와 기본값. 모든 숫자 속성이 여기를 지난다 |
| `fluidPalette(tokens, scheme, tone, accent)` | 아홉 색 토큰과 두 조절값으로 `FluidPalette`를 만든다 |
| `mixFluid(from, to, amount)` | GLSL `mix`와 같은 의미의 선형 보간 |
| `FLUID_LOOPS`, `fluidLoopOffset`, `fluidLoopOffsets` | 네 갈래 닫힌 표류의 주기와 위상 |
| `fluidRenderSize`, `FLUID_MAX_DPR` | 캔버스 해상도와 1.1M 화소 예산 |
| `buildFluidRibbons(w, h, seed, count)` | 레이스 띠 기하. 끝점, 곡선, 폭, 법선 축. 같은 seed로 재현 |
| `ribbonLacePitch(width)` | 레이스 절주, `max(26, width × 1.45)` |
| `ribbonLacePath(ribbon)` | 꽃, 고리, 점 쌍, 홈의 구슬을 원호 하위 경로로 그린다 |
| `ribbonScallopPath(ribbon, side)` | 한쪽 부채 가장자리 |
| `ribbonScallopAmplitude(ribbon)` | 그 띠의 부채 진폭 |
| `ribbonEdgePath`, `ribbonBandPath` | 한쪽 꺾은선과 닫힌 띠 윤곽 |
| `FluidPalette`, `FluidTokens`, `FluidRibbon`, `FluidVariantSpec` | 각 층의 형 |

## 접근성

- 배경 층은 `aria-hidden`이고 캔버스는 접근성 트리에 들어가지 않습니다. 읽기는 슬롯 내용만 합니다.
- 키보드와 포인터를 잡지 않습니다. `pointer-events: none`은 캔버스와 무늬 층에만 있어 슬롯 안의 단추는 그대로 동작합니다.
- `prefers-reduced-motion`이 켜져 있으면 첫 프레임만 그리고 멈춥니다. 깜빡임도 표류도 없습니다.
- 밝은 쪽과 어두운 쪽은 각각 배색과 대체 그라디언트를 가지며 주변 어둡기, 발광, 입자 강도를 나눕니다. 밝은 쪽으로 바꿔도 가산광으로 하얗게 타지 않습니다.

## 기타

- 겹침 무늬는 정적이라 흐름을 따라 움직이지 않습니다. 움직이려면 셰이더를 바꿔야 합니다.
- `lace`는 마운트할 때마다 seed를 다시 뽑으므로 새로 고치면 띠 위치가 바뀝니다. 고정 seed는 속성으로 노출하지 않습니다.
- 외부 이미지에 기대지 않습니다. 무늬와 레이스 모두 실행 중에 만드는 인라인 SVG와 경로라 추가 통신이 없습니다.
