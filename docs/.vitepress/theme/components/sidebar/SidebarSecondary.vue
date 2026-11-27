<script setup lang="ts">
import { computed } from "vue";

import { provideActiveNav } from "../../composables/useActiveNav";
import { useAkariI18n } from "../../composables/useI18n";
import type { AkariSidebarItem } from "../../types";
import SidebarNavItem from "./SidebarNavItem.vue";

const props = defineProps<{
  category: AkariSidebarItem;
}>();

// One walk of the tree per page, shared by every item below.
provideActiveNav(computed(() => props.category.items ?? []));

const emit = defineEmits<{
  (event: "navigate"): void;
}>();

const { t } = useAkariI18n();

function onNavigate(event: MouseEvent): void {
  const target = event.target as Element | null;
  if (target?.closest("a")) emit("navigate");
}
</script>

<template>
  <!-- The rail item already names the category, so the list starts with pages. -->
  <nav
    class="akari-secondary"
    :aria-label="t('categoryNavigation', { category: category.text })"
    @click="onNavigate"
  >
    <m3e-nav-menu
      class="akari-secondary__menu akari-drawer-menu"
      :aria-label="t('categoryPages', { category: category.text })"
    >
      <SidebarNavItem
        v-for="(child, index) in category.items"
        :key="child.link ?? `${child.text}-${index}`"
        :item="child"
      />
    </m3e-nav-menu>
  </nav>
</template>

<style scoped>
.akari-secondary {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.akari-secondary__menu {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}
</style>
