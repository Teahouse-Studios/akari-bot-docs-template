<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import { withBase } from "vitepress";

import { useContainerTransform } from "../../composables/useContainerTransform";
import { useAkariI18n } from "../../composables/useI18n";
import { useAkariConfig } from "../../composables/useAkariConfig";
import { useAkariSettings } from "../../composables/useSettings";
import { pluralCategory, splitMessage } from "../../i18n";
import type { AkariSearchResult } from "../../types";
import { splitHighlight } from "../highlight";
import { useAkariSearch } from "../useSearch";

const config = useAkariConfig();
const { t, lang } = useAkariI18n();
const { settings } = useAkariSettings();
const {
  isOpen,
  query,
  results,
  loading,
  error,
  activeIndex,
  closeSearch,
  finalizeClose,
  getTrigger,
  setQuery,
  retry,
  handleInputKeydown,
  selectResult,
} = useAkariSearch();

const dialog = ref<HTMLDialogElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const scrim = ref<HTMLElement | null>(null);
const ghostHost = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);
const bar = ref<HTMLElement | null>(null);
const closeButton = ref<HTMLElement | null>(null);
const body = ref<HTMLElement | null>(null);
const input = ref<HTMLInputElement | null>(null);
const resultElements = ref<Array<HTMLElement | null>>([]);

const hasQuery = computed(() => !!query.value.trim());

const resultCount = computed(() => {
  const count = results.value.length;
  const key =
    pluralCategory(lang.value, count) === "one"
      ? "searchResultCountOne"
      : "searchResultCount";
  return t(key, { count });
});

// The shortcut keys are markup in the middle of a translated sentence.
const introShortcut = computed(() =>
  splitMessage(t("searchIntroShortcut"), "keys"),
);

function focusInput(): void {
  input.value?.focus({ preventScroll: true });
}

const { open: openDialog, close: closeDialog } = useContainerTransform({
  dialog,
  panel,
  content,
  scrim,
  ghostHost,
  // The search bar stays as the morphing anchor; body and close button fade.
  anchor: bar,
  fadingParts: () =>
    [body.value, closeButton.value].filter(
      (element): element is HTMLElement => !!element,
    ),
  trigger: getTrigger,
  motion: () => settings.motion,
  focus: focusInput,
  onClosed: finalizeClose,
});

const html = typeof document === "undefined" ? null : document.documentElement;
let lockedOverflow: string | null = null;

function lockPageScroll(): void {
  if (!html || lockedOverflow !== null) return;
  lockedOverflow = html.style.overflow;
  html.style.overflow = "hidden";
}

function unlockPageScroll(): void {
  if (!html || lockedOverflow === null) return;
  html.style.overflow = lockedOverflow;
  lockedOverflow = null;
}

watch(isOpen, (open) => {
  if (open) lockPageScroll();
  else unlockPageScroll();
});

onUnmounted(unlockPageScroll);

watch(
  isOpen,
  (open) => {
    if (open) void openDialog();
    else void closeDialog();
  },
  { flush: "post" },
);

watch(activeIndex, async (index) => {
  await nextTick();
  resultElements.value[index]?.scrollIntoView({ block: "nearest" });
});

function onInput(event: Event): void {
  setQuery((event.target as HTMLInputElement).value);
}

/**
 * Result rows are `m3e-list-action` (`LinkButton`): a real click lands inside its
 * shadow tree, where the element's own handler calls `stopImmediatePropagation()`
 * on the host and then navigates through an `<a>` it appends to `document.body`.
 * A bubbling `@click` therefore never runs, so the template binds `.capture`
 * (the capture phase runs before the host's bubble listener); without it the
 * dialog stays open after the route changes.
 */
function onResultClick(event: MouseEvent, result: AkariSearchResult): void {
  event.preventDefault();
  selectResult(result);
}

function setResultRef(element: unknown, index: number): void {
  resultElements.value[index] =
    element instanceof HTMLElement ? element : null;
}

function hrefFor(result: AkariSearchResult): string {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(result.href)
    ? result.href
    : withBase(result.href);
}

function parts(text: string | undefined, result: AkariSearchResult) {
  return splitHighlight(text ?? "", query.value, result.terms);
}
</script>

<template>
  <dialog
    ref="dialog"
    class="akari-morph-dialog akari-search-dialog"
    tabindex="-1"
    :aria-label="t('searchLabel')"
    @cancel.prevent="closeSearch"
  >
    <div
      ref="scrim"
      class="akari-morph-dialog__scrim"
      @click="closeSearch"
    ></div>

    <section
      ref="panel"
      class="akari-morph-dialog__panel akari-search-dialog__panel"
      tabindex="-1"
      @click.stop
    >
      <div ref="content" class="akari-search-dialog__content">
        <header class="akari-search-dialog__header">
          <m3e-search-bar ref="bar" class="akari-search-dialog__bar">
            <m3e-icon slot="leading" name="search"></m3e-icon>
            <input
              id="akari-search-input"
              ref="input"
              slot="input"
              class="akari-search-dialog__input"
              type="search"
              name="q"
              role="searchbox"
              :value="query"
              :placeholder="config.search.placeholder"
              :aria-label="t('searchLabel')"
              autocomplete="off"
              spellcheck="false"
              @input="onInput"
              @keydown="handleInputKeydown"
            />
          </m3e-search-bar>

          <m3e-icon-button
            ref="closeButton"
            class="akari-search-dialog__close"
            :aria-label="t('searchClose')"
            @click="closeSearch"
          >
            <m3e-icon name="close"></m3e-icon>
          </m3e-icon-button>
        </header>

        <div ref="body" class="akari-search-dialog__body">
          <div v-if="!hasQuery" class="akari-search-state">
            <m3e-icon class="akari-search-state__icon" name="search"></m3e-icon>
            <h2>{{ t("searchIntroTitle") }}</h2>
            <p>{{ t("searchIntroText") }}</p>
            <p v-if="config.search.shortcut" class="akari-search-state__hint">
              {{ introShortcut[0] }}<kbd>⌘</kbd>/<kbd>Ctrl</kbd> +
              <kbd>{{ config.search.shortcut.toUpperCase() }}</kbd
              >{{ introShortcut[1] }}
            </p>
          </div>

          <div
            v-else-if="loading"
            class="akari-search-state"
            aria-live="polite"
          >
            <m3e-loading-indicator></m3e-loading-indicator>
            <p>{{ t("searchLoading") }}</p>
          </div>

          <div
            v-else-if="error"
            class="akari-search-state akari-search-state--error"
            role="alert"
          >
            <m3e-icon class="akari-search-state__icon" name="error"></m3e-icon>
            <h2>{{ t("searchErrorTitle") }}</h2>
            <p>{{ error }}</p>
            <m3e-button variant="tonal" @click="retry">
              {{ t("searchRetry") }}
            </m3e-button>
          </div>

          <div v-else-if="!results.length" class="akari-search-state">
            <m3e-icon
              class="akari-search-state__icon"
              name="search_off"
            ></m3e-icon>
            <h2>{{ t("searchEmptyTitle") }}</h2>
            <p>{{ t("searchEmptyText") }}</p>
          </div>

          <template v-else>
            <div class="akari-search-dialog__summary" aria-live="polite">
              {{ resultCount }}
            </div>

            <m3e-list
              id="akari-search-results"
              class="akari-search-dialog__results"
              :aria-label="t('searchResultsLabel')"
            >
              <m3e-list-action
                v-for="(result, index) in results"
                :key="result.id"
                :ref="(element: unknown) => setResultRef(element, index)"
                :href="hrefFor(result)"
                class="akari-search-result"
                :class="{ 'is-active': index === activeIndex }"
                @click.capture="onResultClick($event, result)"
                @mouseenter="activeIndex = index"
              >
                <m3e-icon slot="leading" name="article"></m3e-icon>
                <span slot="overline" class="akari-search-result__overline">
                  {{ result.heading ? result.pageTitle : t("searchResultPage") }}
                </span>
                <span class="akari-search-result__title">
                  <template
                    v-for="(part, partIndex) in parts(result.title, result)"
                    :key="partIndex"
                  >
                    <mark v-if="part.match">{{ part.text }}</mark>
                    <template v-else>{{ part.text }}</template>
                  </template>
                </span>
                <span
                  v-if="result.excerpt"
                  slot="supporting-text"
                  class="akari-search-result__excerpt"
                >
                  <template
                    v-for="(part, partIndex) in parts(result.excerpt, result)"
                    :key="partIndex"
                  >
                    <mark v-if="part.match">{{ part.text }}</mark>
                    <template v-else>{{ part.text }}</template>
                  </template>
                </span>
              </m3e-list-action>
            </m3e-list>

            <div class="akari-search-dialog__footer">
              <span>{{ resultCount }}</span>
              <span class="akari-search-dialog__hints">
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                <span>{{ t("searchHintSelect") }}</span>
                <kbd>Enter</kbd>
                <span>{{ t("searchHintOpen") }}</span>
                <kbd>Esc</kbd>
                <span>{{ t("searchHintClose") }}</span>
              </span>
            </div>
          </template>
        </div>
      </div>
    </section>

    <div
      ref="ghostHost"
      class="akari-morph-dialog__ghost"
      aria-hidden="true"
    ></div>
  </dialog>
</template>
