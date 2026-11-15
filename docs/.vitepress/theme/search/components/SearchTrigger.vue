<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

import { useAkariI18n } from "../../composables/useI18n";
import { useAkariConfig } from "../../composables/useAkariConfig";
import {
  useAkariSearch,
  type AkariSearchTriggerRole,
} from "../useSearch";

const props = withDefaults(
  defineProps<{ role?: AkariSearchTriggerRole; placeholder?: string }>(),
  { role: "home" },
);

const config = useAkariConfig();
const { t } = useAkariI18n();
const { isOpen, openSearch, setTrigger } = useAkariSearch();
const trigger = ref<HTMLButtonElement | null>(null);

const shortcutLabel = ref("⌘K");

const label = computed(
  () => props.placeholder?.trim() || config.value.search.placeholder,
);

const shortcutKeys = computed(() =>
  config.value.search.shortcut
    ? `Meta+${config.value.search.shortcut.toUpperCase()} Control+${config.value.search.shortcut.toUpperCase()}`
    : undefined,
);

const ariaLabel = computed(() =>
  config.value.search.shortcut
    ? t("searchShortcutLabel", {
        label: label.value,
        shortcut: shortcutLabel.value,
      })
    : label.value,
);

onMounted(() => {
  setTrigger(trigger.value, props.role);

  if (!/(Mac|iPhone|iPad)/.test(navigator.userAgent)) {
    shortcutLabel.value = "Ctrl K";
  }
});

onUnmounted(() => setTrigger(null, props.role));
</script>

<template>
  <button
    ref="trigger"
    type="button"
    class="akari-search-trigger"
    :data-role="props.role"
    :aria-label="ariaLabel"
    :aria-keyshortcuts="shortcutKeys"
    :aria-expanded="isOpen"
    aria-haspopup="dialog"
    @click="openSearch"
  >
    <m3e-icon name="search"></m3e-icon>
    <span class="akari-search-trigger__label">
      {{ label }}
    </span>
    <kbd v-if="config.search.shortcut" class="akari-search-trigger__kbd">
      {{ shortcutLabel }}
    </kbd>
  </button>
</template>

<style scoped>
.akari-search-trigger {
  display: inline-flex;
  /*
   * Its width is its own, never taken by the title: the app bar measures
   * the title's room against the actions, and a search field giving way
   * to the title would hand that room back and forth with it.
   */
  flex: none;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  width: clamp(180px, 22vw, 300px);
  height: 40px;
  padding-inline: var(--md-sys-measurement-space150, 12px);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface-variant);
  font: inherit;
  font-size: 0.875rem;
  text-align: start;
  overflow: hidden;
  cursor: pointer;
  /*
   * Every size below is a length, so moving between breakpoints, down to
   * the round icon button, eases instead of jumping.
   */
  transition:
    background-color 160ms cubic-bezier(0.2, 0, 0, 1),
    border-color 160ms cubic-bezier(0.2, 0, 0, 1),
    color 160ms cubic-bezier(0.2, 0, 0, 1),
    box-shadow 160ms cubic-bezier(0.2, 0, 0, 1),
    font-size var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1)),
    width var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    padding var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    padding-inline var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    border-width var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    margin-inline var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    opacity var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1)),
    gap var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1));
}

/*
 * The docked copy lives on the page, so the app bar can hand this field's
 * width back to the title and tabs. Its box stays in the actions row while
 * it collapses (the negative margin absorbs the row's gap); the box eases
 * open again while the copy flies home.
 */
.akari-search-trigger[data-dock-slot-away] {
  width: 0 !important;
  min-width: 0;
  padding-inline: 0;
  border-width: 0;
  margin-inline-end: calc(-1 * var(--_gap, 8px));
  opacity: 0;
}

.akari-search-trigger[data-dock-slot-instant] {
  transition: none;
}

/*
 * While the copy is away this button keeps only its measured slot; visibility
 * keeps it out of the tab order until the copy lands and the slot is restored.
 */
.akari-search-trigger[data-dock-hidden] {
  visibility: hidden;
}

.akari-search-trigger:hover {
  border-color: var(--md-sys-color-outline);
  background-color: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface);
}

.akari-search-trigger:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.akari-search-trigger m3e-icon {
  flex: none;
  --m3e-icon-size: 20px;
}

.akari-search-trigger__label {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition:
    opacity var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1)),
    max-width var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1));
}

.akari-search-trigger__kbd {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-inline-size: var(--md-sys-measurement-space350, 28px);
  max-inline-size: 6em;
  min-block-size: var(--md-sys-measurement-space250, 20px);
  padding-inline: var(--md-sys-measurement-space100, 8px);
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-full);
  background-color: transparent;
  color: var(--md-sys-color-on-surface-variant);
  font-family: inherit;
  font-size: var(--md-sys-typescale-label-small-font-size);
  font-weight: var(--md-sys-typescale-label-small-font-weight);
  line-height: var(--md-sys-typescale-label-small-line-height);
  letter-spacing: 0.5px;
  direction: ltr;
  unicode-bidi: isolate;
  white-space: nowrap;
  transition:
    color 160ms cubic-bezier(0.2, 0, 0, 1),
    opacity var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1)),
    min-inline-size var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    max-inline-size var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    padding var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    border-width var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1));
}

.akari-search-trigger:hover .akari-search-trigger__kbd {
  color: var(--md-sys-color-on-surface);
}

@media (max-width: 1199px) {
  .akari-search-trigger {
    width: clamp(200px, 20vw, 260px);
  }
}

@media (max-width: 960px) {
  .akari-search-trigger {
    width: clamp(150px, 20vw, 200px);
  }

  .akari-search-trigger__kbd {
    min-inline-size: var(--md-sys-measurement-space300, 24px);
    padding-inline: var(--md-sys-measurement-space75, 6px);
  }
}

/*
 * A round icon button: the field narrows around its icon, the placeholder
 * fades and the shortcut folds away. The padding centres the 20px icon in
 * the 40px circle (inside its 1px border).
 */
@media (max-width: 767px) {
  .akari-search-trigger {
    width: 40px;
    gap: 0;
    padding-inline: 9px;
  }

  .akari-search-trigger__label {
    opacity: 0;
  }

  .akari-search-trigger__kbd {
    min-inline-size: 0;
    max-inline-size: 0;
    padding-inline: 0;
    border-width: 0;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .akari-search-trigger,
  .akari-search-trigger__label,
  .akari-search-trigger__kbd {
    transition: none;
  }
}
</style>
