<script setup lang="ts">
/**
 * The immersive body of a docked search field. It is rendered instead of
 * the trigger when a `<SearchDock immersive>` tag is active: clicking puts
 * the caret in the field and the result list opens underneath, with no
 * modal and no page scroll lock.
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { withBase } from "vitepress";

import { useAkariConfig } from "../../composables/useAkariConfig";
import { useAkariI18n } from "../../composables/useI18n";
import { pluralCategory } from "../../i18n";
import type { AkariSearchResult } from "../../types";
import { splitHighlight } from "../highlight";
import { useAkariSearch } from "../useSearch";
import { useAkariSearchDock } from "../useSearchDock";

const config = useAkariConfig();
const { t, lang } = useAkariI18n();
const search = useAkariSearch();
const dock = useAkariSearchDock();

const root = ref<HTMLElement | null>(null);
const input = ref<HTMLInputElement | null>(null);
const shortcutLabel = ref("⌘K");
const focused = ref(false);
const panelAbove = ref(false);
const panelEnd = ref(false);
const resultElements = ref<Array<HTMLElement | null>>([]);

const {
  query,
  results,
  loading,
  error,
  activeIndex,
  openInline,
  closeInline,
  searchNow,
  setQuery,
  retry,
  handleInputKeydown,
  selectResult,
} = search;

const placeholder = computed(
  () => dock.placeholder.value ?? config.value.search.placeholder,
);

const hasQuery = computed(() => !!query.value.trim());
const showPanel = computed(() => focused.value && hasQuery.value);

const resultCount = computed(() => {
  const count = results.value.length;
  const key =
    pluralCategory(lang.value, count) === "one"
      ? "searchResultCountOne"
      : "searchResultCount";
  return t(key, { count });
});

function hrefFor(result: AkariSearchResult): string {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(result.href)
    ? result.href
    : withBase(result.href);
}

function parts(text: string | undefined, result: AkariSearchResult) {
  return splitHighlight(text ?? "", query.value, result.terms);
}

function setResultRef(element: unknown, index: number): void {
  resultElements.value[index] =
    element instanceof HTMLElement ? element : null;
}

/**
 * Keep the dropdown on screen: flip it above the field near the bottom,
 * and anchor it to the field's end edge near the right edge.
 */
function updatePanelPosition(): void {
  const element = root.value;
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  panelEnd.value = rect.left + 360 > viewportWidth - 8;
  panelAbove.value = rect.top > 280 && rect.bottom + 280 > viewportHeight;
}

function onFocus(): void {
  focused.value = true;
  openInline();
  updatePanelPosition();
  if (query.value.trim()) searchNow();
}

function onBlur(event: FocusEvent): void {
  const next = event.relatedTarget;
  if (next instanceof Node && root.value?.contains(next)) return;
  focused.value = false;
  closeInline();
}

function onInput(event: Event): void {
  setQuery((event.target as HTMLInputElement).value);
  updatePanelPosition();
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && !showPanel.value) {
    focused.value = false;
    input.value?.blur();
    return;
  }

  handleInputKeydown(event);

  if (event.key === "Escape") {
    focused.value = false;
    input.value?.blur();
  }
}

function clear(): void {
  setQuery("");
  searchNow();
  input.value?.focus({ preventScroll: true });
}

function onResultClick(
  event: MouseEvent,
  result: AkariSearchResult,
): void {
  event.preventDefault();
  selectResult(result);
}

watch(showPanel, (open) => {
  if (open) {
    void nextTick(updatePanelPosition);
  }
});

watch(activeIndex, async (index) => {
  await nextTick();
  resultElements.value[index]?.scrollIntoView({ block: "nearest" });
});

watch(
  () => search.isOpen.value,
  (open) => {
    if (open) {
      focused.value = false;
      closeInline();
    }
  },
);

watch(
  () => dock.active.value,
  (active) => {
    if (!active) {
      focused.value = false;
      closeInline();
    }
  },
);

onMounted(() => {
  if (root.value) search.setTrigger(root.value, "dock");
  if (!/(Mac|iPhone|iPad)/.test(navigator.userAgent)) {
    shortcutLabel.value = "Ctrl K";
  }
  window.addEventListener("resize", updatePanelPosition);
  window.addEventListener("scroll", updatePanelPosition, {
    capture: true,
    passive: true,
  });
});

onUnmounted(() => {
  closeInline();
  if (search.getTrigger("dock") === root.value) {
    search.setTrigger(null, "dock");
  }
  window.removeEventListener("resize", updatePanelPosition);
  window.removeEventListener("scroll", updatePanelPosition, {
    capture: true,
  });
});
</script>

<template>
  <div
    ref="root"
    class="akari-search-trigger akari-search-field"
    :data-panel-above="panelAbove ? '' : undefined"
    :data-panel-end="panelEnd ? '' : undefined"
    role="search"
    @focusin="onFocus"
    @focusout="onBlur"
  >
    <m3e-icon name="search" class="akari-search-field__icon"></m3e-icon>

    <input
      ref="input"
      class="akari-search-field__input"
      type="search"
      name="q"
      role="searchbox"
      autocomplete="off"
      spellcheck="false"
      :value="query"
      :placeholder="placeholder"
      :aria-label="t('searchLabel')"
      :aria-expanded="showPanel"
      aria-controls="akari-search-inline-results"
      :aria-activedescendant="
        showPanel && activeIndex >= 0
          ? `akari-search-inline-result-${activeIndex}`
          : undefined
      "
      @input="onInput"
      @keydown="onKeydown"
    />

    <span
      v-if="loading"
      class="akari-search-field__spinner"
      aria-hidden="true"
    ></span>

    <button
      v-else-if="hasQuery"
      type="button"
      class="akari-search-field__clear"
      :aria-label="t('searchClose')"
      @mousedown.prevent
      @click="clear"
    >
      <m3e-icon name="close"></m3e-icon>
    </button>

    <kbd
      v-else-if="dock.showShortcut.value && config.search.shortcut"
      class="akari-search-field__kbd"
      aria-hidden="true"
    >
      {{ shortcutLabel }}
    </kbd>

    <div
      v-if="showPanel"
      id="akari-search-inline-results"
      class="akari-search-field__panel"
      role="region"
      :aria-label="t('searchResultsLabel')"
      @mousedown.prevent
    >
      <div v-if="loading" class="akari-search-field__state">
        <span class="akari-search-field__spinner" aria-hidden="true"></span>
        <span>{{ t("searchLoading") }}</span>
      </div>

      <div
        v-else-if="error"
        class="akari-search-field__state akari-search-field__state--error"
        role="alert"
      >
        <span>{{ error }}</span>
        <button type="button" class="akari-search-field__retry" @click="retry">
          {{ t("searchRetry") }}
        </button>
      </div>

      <div v-else-if="!results.length" class="akari-search-field__state">
        <m3e-icon name="search_off"></m3e-icon>
        <span>{{ t("searchEmptyTitle") }}</span>
      </div>

      <template v-else>
        <div class="akari-search-field__summary" aria-live="polite">
          {{ resultCount }}
        </div>
        <div class="akari-search-field__results" role="list">
          <a
            v-for="(result, index) in results"
            :id="`akari-search-inline-result-${index}`"
            :key="result.id"
            :ref="(element: unknown) => setResultRef(element, index)"
            :href="hrefFor(result)"
            class="akari-search-field__result"
            :class="{ 'is-active': index === activeIndex }"
            role="listitem"
            @mousedown.prevent
            @click="onResultClick($event, result)"
            @mouseenter="activeIndex = index"
          >
            <span class="akari-search-field__overline">
              {{ result.heading ? result.pageTitle : t("searchResultPage") }}
            </span>
            <span class="akari-search-field__title">
              <template
                v-for="(part, partIndex) in parts(result.title, result)"
                :key="partIndex"
              >
                <mark v-if="part.match">{{ part.text }}</mark>
                <template v-else>{{ part.text }}</template>
              </template>
            </span>
            <span v-if="result.excerpt" class="akari-search-field__excerpt">
              <template
                v-for="(part, partIndex) in parts(result.excerpt, result)"
                :key="partIndex"
              >
                <mark v-if="part.match">{{ part.text }}</mark>
                <template v-else>{{ part.text }}</template>
              </template>
            </span>
          </a>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/*
 * The field borrows the dock's variant surface through the shared
 * `.akari-search-trigger` class, but behaves like an input: no button
 * cursor, no fixed width, and the dropdown may overflow the box.
 */
.akari-search-field {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding-inline: var(--md-sys-measurement-space150, 12px);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface-variant);
  font: inherit;
  font-size: 0.875rem;
  cursor: text;
  overflow: visible;
  transition:
    background-color 160ms cubic-bezier(0.2, 0, 0, 1),
    border-color 160ms cubic-bezier(0.2, 0, 0, 1),
    color 160ms cubic-bezier(0.2, 0, 0, 1),
    box-shadow 160ms cubic-bezier(0.2, 0, 0, 1);
}

.akari-search-field:hover {
  border-color: var(--md-sys-color-outline);
  background-color: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface);
}

.akari-search-field:focus-within {
  border-color: var(--md-sys-color-primary);
  background-color: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--akari-doc-elevation-level2);
}

.akari-search-field__icon {
  flex: none;
  --m3e-icon-size: 20px;
  opacity: 0.8;
}

.akari-search-field__input {
  flex: 1 1 auto;
  min-width: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: inherit;
  line-height: inherit;
  appearance: none;
}

.akari-search-field__input::placeholder {
  color: var(--md-sys-color-on-surface-variant);
  opacity: 1;
}

.akari-search-field__input::-webkit-search-cancel-button,
.akari-search-field__input::-webkit-search-decoration {
  display: none;
}

.akari-search-field__clear {
  display: grid;
  flex: none;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: var(--md-sys-shape-corner-full);
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background-color 160ms cubic-bezier(0.2, 0, 0, 1);
}

.akari-search-field__clear:hover {
  background-color: color-mix(in srgb, currentColor 12%, transparent);
}

.akari-search-field__clear m3e-icon {
  --m3e-icon-size: 18px;
}

.akari-search-field__kbd {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-inline-size: 24px;
  block-size: 20px;
  padding-inline: 6px;
  border: 1px solid color-mix(in srgb, currentColor 34%, transparent);
  border-radius: var(--md-sys-shape-corner-full);
  color: inherit;
  font-family: inherit;
  font-size: var(--md-sys-typescale-label-small-font-size);
  font-weight: var(--md-sys-typescale-label-small-font-weight);
  line-height: var(--md-sys-typescale-label-small-line-height);
  letter-spacing: 0.5px;
  direction: ltr;
  unicode-bidi: isolate;
  opacity: 0.72;
}

.akari-search-field__spinner {
  flex: none;
  width: 16px;
  height: 16px;
  box-sizing: border-box;
  border: 2px solid currentColor;
  border-inline-end-color: transparent;
  border-radius: 50%;
  animation: akari-search-field-spin 720ms linear infinite;
}

@keyframes akari-search-field-spin {
  to {
    transform: rotate(1turn);
  }
}

/*
 * A compact results surface. It is not a dialog: it hugs the docked field,
 * flips above it near the viewport bottom, and anchors to the end edge near
 * the right edge so it never runs off screen.
 */
.akari-search-field__panel {
  position: absolute;
  z-index: 2;
  inset-block-start: calc(100% + 8px);
  inset-inline-start: -1px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: calc(100% + 2px);
  max-width: none;
  max-height: min(24rem, calc(100dvh - 32px));
  overflow: hidden;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 20px;
  background-color: var(--md-sys-color-surface-container);
  box-shadow: var(--akari-doc-elevation-level2);
  color: var(--md-sys-color-on-surface);
  cursor: default;
}

.akari-search-field[data-panel-end] .akari-search-field__panel {
  inset-inline-start: auto;
  inset-inline-end: -1px;
}

.akari-search-field[data-panel-above] .akari-search-field__panel {
  inset-block-start: auto;
  inset-block-end: calc(100% + 8px);
}

.akari-search-field__summary {
  flex: none;
  padding: 10px 14px 4px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.75rem;
  line-height: 1.4;
}

.akari-search-field__results {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 4px 6px 6px;
  scrollbar-width: thin;
  scrollbar-color: var(--md-sys-color-outline) transparent;
}

.akari-search-field__result {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 9px 10px;
  border-radius: 12px;
  color: inherit;
  text-decoration: none;
  transition:
    background-color 140ms cubic-bezier(0.2, 0, 0, 1),
    color 140ms cubic-bezier(0.2, 0, 0, 1);
}

.akari-search-field__result:hover,
.akari-search-field__result.is-active {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.akari-search-field__overline {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.6875rem;
  line-height: 1.4;
  letter-spacing: 0.02em;
}

.akari-search-field__result:hover .akari-search-field__overline,
.akari-search-field__result.is-active .akari-search-field__overline {
  color: inherit;
  opacity: 0.78;
}

.akari-search-field__title {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.akari-search-field__excerpt {
  display: -webkit-box;
  overflow: hidden;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.75rem;
  line-height: 1.45;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.akari-search-field__result:hover .akari-search-field__excerpt,
.akari-search-field__result.is-active .akari-search-field__excerpt {
  color: inherit;
  opacity: 0.85;
}

.akari-search-field__result mark {
  border-radius: 3px;
  padding: 0 1px;
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}

.akari-search-field__state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 88px;
  padding: 18px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.875rem;
  text-align: center;
}

.akari-search-field__state m3e-icon {
  --m3e-icon-size: 22px;
}

.akari-search-field__state--error {
  flex-direction: column;
  color: var(--md-sys-color-error);
}

.akari-search-field__retry {
  padding: 6px 12px;
  border: 1px solid currentColor;
  border-radius: var(--md-sys-shape-corner-full);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}

@media (max-width: 767px) {
  .akari-search-field {
    gap: 8px;
    padding-inline: var(--md-sys-measurement-space150, 12px);
  }

}

@media (prefers-reduced-motion: reduce) {
  .akari-search-field,
  .akari-search-field__result,
  .akari-search-field__clear {
    transition: none;
  }

  .akari-search-field__spinner {
    animation: none;
  }
}
</style>
