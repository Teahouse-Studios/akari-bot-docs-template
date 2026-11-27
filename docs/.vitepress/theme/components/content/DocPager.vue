<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vitepress";

import { useAkariI18n } from "../../composables/useI18n";
import { useAkariConfig } from "../../composables/useAkariConfig";
import { usePageHref } from "../../composables/usePageHref";
import { useSidebar } from "../../composables/useSidebar";

const config = useAkariConfig();
const { t } = useAkariI18n();
const { prevNext } = useSidebar();
const pageHref = usePageHref();
const router = useRouter();

const prev = computed(() => prevNext.value.prev);
const next = computed(() => prevNext.value.next);

const prevHref = computed(() =>
  prev.value?.link ? pageHref(prev.value.link) : undefined,
);
const nextHref = computed(() =>
  next.value?.link ? pageHref(next.value.link) : undefined,
);

const showPrevNext = computed(
  () =>
    config.value.footer.showPrevNext &&
    !!(prevHref.value || nextHref.value),
);

/**
 * Mirrors the SPA semantics of VitePress' built-in link handling: plain
 * left-clicks are routed in place, while modified clicks keep native anchor
 * behavior (new tab / new window). m3e-card would otherwise follow its href
 * with a full page load.
 */
function navigate(href: string | undefined, event: Event): void {
  if (!href) return;

  if (event instanceof MouseEvent) {
    const modified =
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey;

    if (modified) return;
  }

  event.preventDefault();
  void router.go(href);
}
</script>

<template>
  <nav v-if="showPrevNext" class="akari-doc-pager" :aria-label="t('pagerLabel')">
    <m3e-card
      v-if="prev && prevHref"
      class="akari-doc-pager__card akari-doc-pager__card--prev"
      variant="filled"
      actionable
      :href="prevHref"
      @click="navigate(prevHref, $event)"
    >
      <span class="akari-doc-pager__body">
        <span class="akari-doc-pager__label">
          <m3e-icon name="arrow_back" aria-hidden="true"></m3e-icon>
          {{ t("previousPage") }}
        </span>
        <span class="akari-doc-pager__title">{{ prev.text }}</span>
      </span>
    </m3e-card>

    <m3e-card
      v-if="next && nextHref"
      class="akari-doc-pager__card akari-doc-pager__card--next"
      variant="filled"
      actionable
      :href="nextHref"
      @click="navigate(nextHref, $event)"
    >
      <span class="akari-doc-pager__body">
        <span class="akari-doc-pager__label">
          {{ t("nextPage") }}
          <m3e-icon name="arrow_forward" aria-hidden="true"></m3e-icon>
        </span>
        <span class="akari-doc-pager__title">{{ next.text }}</span>
      </span>
    </m3e-card>
  </nav>
</template>

<style scoped>
.akari-doc-pager {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-block-start: 64px;
}

.akari-doc-pager__card {
  min-width: 0;
  --m3e-filled-card-container-color: var(
    --md-sys-color-surface-container-low
  );
  --m3e-card-shape: var(--md-sys-shape-corner-large-increased, 20px);
}

.akari-doc-pager__card--next {
  grid-column: 2;
}

.akari-doc-pager__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 24px;
}

.akari-doc-pager__card--next .akari-doc-pager__body {
  align-items: flex-end;
  text-align: end;
}

.akari-doc-pager__label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-large-font-size, 0.875rem);
  font-weight: var(--md-sys-typescale-label-large-font-weight, 500);
  line-height: var(--md-sys-typescale-label-large-line-height, 1.25rem);
}

.akari-doc-pager__label m3e-icon {
  --m3e-icon-size: 18px;
}

/* The arrows point the way the pages run. */
.akari-doc[dir="rtl"] .akari-doc-pager__label m3e-icon {
  transform: scaleX(-1);
}

.akari-doc-pager__title {
  color: var(--md-sys-color-on-surface);
  font-size: var(--md-sys-typescale-title-large-font-size, 1.375rem);
  font-weight: var(--md-sys-typescale-title-large-font-weight, 400);
  line-height: var(--md-sys-typescale-title-large-line-height, 1.75rem);
  overflow-wrap: anywhere;
}

@media (max-width: 600px) {
  .akari-doc-pager {
    grid-template-columns: minmax(0, 1fr);
  }

  .akari-doc-pager__card--next {
    grid-column: auto;
  }
}
</style>
