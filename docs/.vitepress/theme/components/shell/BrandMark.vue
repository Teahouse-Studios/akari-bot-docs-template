<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";

import { useAkariConfig } from "../../composables/useAkariConfig";

const config = useAkariConfig();

const logo = computed(() => {
  const value = config.value.appBar.logo;
  return value ? withBase(value) : "";
});
</script>

<template>
  <span class="akari-title">
    <img
      v-if="logo"
      class="akari-title__logo"
      :src="logo"
      alt=""
      aria-hidden="true"
      decoding="async"
    />
    <span class="akari-title__text">{{ config.appBar.title }}</span>
    <m3e-chip v-if="config.appBar.version" class="akari-title__version">
      {{ config.appBar.version }}
    </m3e-chip>
  </span>
</template>

<style scoped>
.akari-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.akari-title__logo {
  flex: none;
  width: 44px;
  height: 36px;
  object-fit: contain;
  transition:
    width var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    margin-inline-end var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    opacity var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1));
}

.akari-title__text {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.akari-title__version {
  flex: none;
}

@media (max-width: 600px) {
  .akari-title {
    gap: 6px;
  }

  .akari-title__logo {
    width: 32px;
    height: 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .akari-title__logo {
    transition: none;
  }
}
</style>
