<script setup lang="ts">
import { watch } from "vue";
import { useRoute } from "vitepress";

import { provideActiveNav } from "../../composables/useActiveNav";
import { useAkariI18n } from "../../composables/useI18n";
import { resetNavGroupState } from "../../composables/useNavGroupState";
import { useSidebar } from "../../composables/useSidebar";
import LocaleSwitcher from "../shell/LocaleSwitcher.vue";
import SchemeToggle from "../shell/SchemeToggle.vue";
import SidebarNavItem from "./SidebarNavItem.vue";

const { items } = useSidebar();
// One walk of the tree per page, shared by every item below.
provideActiveNav(items);
const { t } = useAkariI18n();
const route = useRoute();

// Each page starts from its own default — the group holding it open, the
// rest closed — instead of carrying the groups the reader expanded on the
// previous one. This list is the whole tree, so without it the drawer would
// end up with every category expanded. Before the items react, so they all
// read the same state.
watch(() => route.path, () => resetNavGroupState(), { flush: "pre" });
</script>

<template>
  <div class="akari-sidebar">
    <m3e-nav-menu
      class="akari-sidebar__menu akari-drawer-menu"
      :aria-label="t('navigationLabel')"
    >
      <SidebarNavItem
        v-for="(item, index) in items"
        :key="item.link ?? `${item.text}-${index}`"
        :item="item"
        show-icon
      />
    </m3e-nav-menu>
    <div class="akari-sidebar__footer">
      <SchemeToggle id-prefix="akari-sidebar-scheme" />
      <LocaleSwitcher id-prefix="akari-sidebar-locale" />
    </div>
  </div>
</template>

<style scoped>
.akari-sidebar {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 0;
  max-width: 100%;
}

.akari-sidebar__menu {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* As on the rail, appearance and language sit at the bottom. */
.akari-sidebar__footer {
  display: flex;
  flex: none;
  gap: 12px;
  padding: 12px 16px 24px;
}
</style>
