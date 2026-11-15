---
tab: 도킹
---
<script setup>
import SearchDockDemo from "../../../.vitepress/theme/components/content/SearchDockDemo.vue";
</script>


# 플로팅 검색 데모

이 페이지는 [`<SearchDock>`](/ko-KR/theme/search/api#searchdock)의 라이브 데모입니다. 태그는 아래 점선 착지 상자에 있고, 검색 필드는 앱 바를 떠나 그곳에 착지합니다.

<SearchDockDemo />

이렇게 해 보세요:

- 이 페이지를 새로 고침: 필드가 이미 상자 안에 있으며 날아 들어오는 애니메이션이 없습니다.
- 이 페이지를 떠났다가(예: **개요**) 돌아오기: 앱 바에서 상자로 날아 들어옵니다.
- **모양**이나 **정렬** 바꾸기: 필드가 제자리에서 모양과 정렬을 바꿉니다.
- **상자 채우기** 켜기: 태그가 바깥 상자 전체(`width: 100%; height: 100%`)를 차지해 주변 레이아웃 크기를 따라갑니다. 끄면 모양의 자연 크기로 돌아갑니다.

도킹 중에도 필드를 사용할 수 있습니다. 클릭하거나 `⌘K`(Windows / Linux에서는 `Ctrl K`)를 누르면 검색 패널이 그 자리에서 펼쳐집니다.
