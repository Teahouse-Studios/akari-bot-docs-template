<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vitepress";

import { useAkariI18n } from "../../composables/useI18n";
import { useAkariLocaleDialog } from "../../composables/useLocaleDialog";
import {
  useAkariLocales,
  type AkariLocaleOption,
} from "../../composables/useLocales";
import MorphDialog from "./MorphDialog.vue";

const TITLE_ID = "akari-locale-dialog-title";

const { t, lang } = useAkariI18n();
const { locales } = useAkariLocales();
const dialog = useAkariLocaleDialog();
const router = useRouter();

const list = ref<HTMLElement | null>(null);

// Each language is listed under its own name and, below it, its name in the
// reader's language.
const displayNames = computed(() => {
  try {
    return new Intl.DisplayNames([lang.value], {
      type: "language",
      languageDisplay: "standard",
    });
  } catch {
    return null;
  }
});

function localName(locale: AkariLocaleOption): string | undefined {
  if (!locale.lang) return undefined;

  let name: string | undefined;
  try {
    name = displayNames.value?.of(locale.lang);
  } catch {
    // Not a valid language tag.
    name = undefined;
  }
  return name && name !== locale.label ? name : undefined;
}

function focusCurrent(): void {
  const current =
    list.value?.querySelector<HTMLElement>("[aria-current]") ??
    list.value?.querySelector<HTMLElement>(".akari-locale-dialog__option");
  current?.focus({ preventScroll: true });
}

/**
 * Plain clicks switch in place and close the dialog on the way; modified
 * clicks keep the link's native behavior (new tab, new window).
 *
 * Captured on the list: m3e-list-action follows its href with a full page
 * load unless the click is already cancelled when its own listener runs,
 * and on server-rendered items that listener comes before Vue's.
 */
function onOptionClick(event: MouseEvent): void {
  const option = (event.target as Element | null)?.closest<HTMLElement>(
    "[data-locale]",
  );
  const locale = locales.value.find(
    (item) => item.key === option?.dataset.locale,
  );

  if (
    !locale ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  event.preventDefault();
  dialog.close();
  if (!locale.current) void router.go(locale.href);
}
</script>

<template>
  <MorphDialog
    class="akari-locale-dialog"
    :state="dialog"
    :title-id="TITLE_ID"
    :title="t('languageDialogTitle')"
    icon="translate"
    outlined-icon
    :close-label="t('languageDialogClose')"
    width="400px"
    :focus="focusCurrent"
  >
    <m3e-list
      ref="list"
      class="akari-locale-dialog__list"
      :aria-labelledby="TITLE_ID"
      @click.capture="onOptionClick"
    >
      <m3e-list-action
        v-for="locale in locales"
        :key="locale.key"
        class="akari-locale-dialog__option"
        :class="{ 'is-current': locale.current }"
        :data-locale="locale.key"
        :href="locale.href"
        :aria-current="locale.current ? 'true' : undefined"
      >
        <span class="akari-locale-dialog__label" :lang="locale.lang">
          {{ locale.label }}
        </span>
        <span v-if="localName(locale)" slot="supporting-text">
          {{ localName(locale) }}
        </span>
        <m3e-icon
          v-if="locale.current"
          slot="trailing"
          name="check"
        ></m3e-icon>
      </m3e-list-action>
    </m3e-list>
  </MorphDialog>
</template>

<style scoped>
.akari-locale-dialog__list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

/*
 * Two-line items (name, then its name in the reader's language). m3e only
 * settles on the two-line height a frame after the dialog is shown, which
 * would move the centered panel under its opening animation, so the height
 * is set up front.
 */
.akari-locale-dialog__option {
  min-height: 72px;
  /*
   * One block: only the list's outer corners are rounded, in every state.
   * m3e reads these for the top and bottom corners of its items, as it
   * does for its segmented lists.
   */
  --_list-item-top-container-shape: 0px;
  --_list-item-bottom-container-shape: 0px;
}

.akari-locale-dialog__option:first-child {
  --_list-item-top-container-shape: 16px;
}

.akari-locale-dialog__option:last-child {
  --_list-item-bottom-container-shape: 16px;
}

/* The language being read, like the active search result. */
.akari-locale-dialog__option.is-current {
  --m3e-list-item-container-color: var(--md-sys-color-secondary-container);
  --m3e-list-item-label-text-color: var(
    --md-sys-color-on-secondary-container
  );
  --m3e-list-item-supporting-text-color: var(
    --md-sys-color-on-secondary-container
  );
  --m3e-list-item-trailing-color: var(--md-sys-color-on-secondary-container);
}
</style>
