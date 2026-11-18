<script setup lang="ts">
import { computed, ref } from "vue";

import { useAppBarRoom } from "../../composables/useAppBarRoom";
import { useCoveredTitle } from "../../composables/useCoveredTitle";
import { useAkariI18n } from "../../composables/useI18n";
import { useAkariConfig } from "../../composables/useAkariConfig";
import { usePageHref } from "../../composables/usePageHref";
import { useAkariSettingsDialog } from "../../composables/useSettingsDialog";
import { useTabIndicator } from "../../composables/useTabIndicator";
import { useAkariTabs } from "../../composables/useTabs";
import { AKARI_SETTINGS_ID, AKARI_SIDEBAR_ID } from "../../constants";
import SearchTrigger from "../../search/components/SearchTrigger.vue";
import BrandMark from "./BrandMark.vue";
import SocialActions from "./SocialActions.vue";

const config = useAkariConfig();
const { t } = useAkariI18n();

const showSettings = computed(
  () => config.value.settings.enabled && config.value.appBar.showSettingsToggle,
);

const settingsLabel = computed(() => config.value.settings.title);

// The settings dialog grows out of this button and returns into it.
const settingsDialog = useAkariSettingsDialog();
const settingsButton = ref<HTMLElement | null>(null);
const settingsOpen = computed(
  () =>
    settingsDialog.isOpen.value &&
    settingsDialog.trigger.value === settingsButton.value,
);

function openSettings(): void {
  if (settingsButton.value) settingsDialog.open(settingsButton.value);
}

// Short of room, every action but search folds into an overflow menu
// (AppBarMenu, at the top of the layout).
const hasExtras = computed(
  () => showSettings.value || config.value.appBar.socialLinks.length > 0,
);
const actionsElement = ref<HTMLElement | null>(null);
const extraElement = ref<HTMLElement | null>(null);
const moreElement = ref<HTMLElement | null>(null);
const folded = ref(false);
const measured = ref(false);

// Parallel pages: their tab bar docks in the free space after the title.
const tabs = useAkariTabs();
const pageHref = usePageHref();

// Once the article's title scrolls under the bar, the bar takes it over. A
// switch between tabs with the bar docked opens the next page with its
// title already covered, so the bar keeps showing a page title meanwhile.
const { covered: titleCovered, title: pageTitle } = useCoveredTitle({
  keep: () => tabs.carry.value,
});
const showsPageTitle = computed(() => titleCovered.value && !!pageTitle.value);

// The title and the docked bar share the free space; see useAppBarRoom.
const titleElement = ref<HTMLElement | null>(null);
useAppBarRoom(
  titleElement,
  {
    pageTitle: () => pageTitle.value,
    showsPageTitle: () => showsPageTitle.value,
  },
  tabs,
  {
    bar: actionsElement,
    extra: extraElement,
    more: moreElement,
    folded,
    measured,
  },
);
useTabIndicator(tabs.dockedBar, () => tabs.current.value);

function setDockArea(element: unknown): void {
  tabs.dockArea.value = element instanceof HTMLElement ? element : null;
}

function setDockedBar(element: unknown): void {
  tabs.dockedBar.value = element instanceof HTMLElement ? element : null;
}
</script>

<template>
  <m3e-app-bar class="akari-app-bar">
    <m3e-icon-button
      v-if="config.appBar.showSidebarToggle"
      class="akari-app-bar__nav-toggle"
      slot="leading"
      :aria-label="t('navigationToggle')"
      toggle
    >
      <m3e-icon name="menu"></m3e-icon>
      <m3e-icon slot="selected" name="menu_open"></m3e-icon>
      <m3e-drawer-toggle :for="AKARI_SIDEBAR_ID"></m3e-drawer-toggle>
    </m3e-icon-button>

    <span slot="title" class="akari-app-bar__center">
      <span
        ref="titleElement"
        class="akari-app-bar__title"
        :class="{ 'is-page-title': showsPageTitle }"
      >
        <span class="akari-app-bar__title-layer akari-app-bar__brand">
          <BrandMark />
        </span>
        <!-- A visual echo of the article's h1, hidden from assistive tech. -->
        <span
          class="akari-app-bar__title-layer akari-app-bar__page-title"
          aria-hidden="true"
        >{{ pageTitle }}</span>
      </span>

      <!--
        The page's tab bar, docked here while its in-page copy is scrolled
        under the bar. It stays laid out when hidden, so there is always a
        place to measure and to fly to.
      -->
      <span
        v-if="tabs.tabs.value.length"
        :ref="setDockArea"
        class="akari-app-bar__tabs"
      >
        <nav
          :ref="setDockedBar"
          class="akari-page-tabs akari-page-tabs--docked"
          :aria-label="
            t('categoryPages', { category: tabs.group.value?.text ?? '' })
          "
          :data-shown="
            tabs.docked.value && !tabs.flying.value ? '' : undefined
          "
          :style="{ '--akari-page-tabs-count': tabs.tabs.value.length }"
        >
          <span
            v-if="tabs.current.value >= 0"
            class="akari-page-tabs__indicator"
            :style="{ gridColumn: `${tabs.current.value + 1} / span 1` }"
            aria-hidden="true"
          ></span>
          <a
            v-for="tab in tabs.tabs.value"
            :key="tab.link"
            class="akari-page-tabs__tab"
            :href="pageHref(tab.link!)"
            :aria-current="tabs.isCurrent(tab) ? 'page' : undefined"
            :target="tabs.isCurrent(tab) ? '_self' : undefined"
            @click="tabs.onTabClick($event, tab)"
          >{{ tab.text }}</a>
        </nav>
      </span>
    </span>

    <span
      slot="trailing"
      ref="actionsElement"
      class="akari-actions"
      :data-folded="folded ? '' : undefined"
      :data-measured="measured ? '' : undefined"
    >
      <SearchTrigger v-if="config.search.enabled" />
      <!-- The actions that fold into the overflow menu. -->
      <span
        v-if="hasExtras"
        ref="extraElement"
        class="akari-actions__extra"
        :inert="folded || undefined"
      >
        <SocialActions :links="config.appBar.socialLinks" />
        <m3e-icon-button
          v-if="showSettings"
          id="akari-settings-button"
          ref="settingsButton"
          :aria-label="settingsLabel"
          aria-haspopup="dialog"
          :aria-controls="AKARI_SETTINGS_ID"
          :aria-expanded="String(settingsOpen)"
          @click="openSettings"
        >
          <m3e-icon name="settings"></m3e-icon>
        </m3e-icon-button>
        <m3e-tooltip v-if="showSettings" for="akari-settings-button">
          {{ settingsLabel }}
        </m3e-tooltip>
      </span>
      <span
        v-if="hasExtras"
        ref="moreElement"
        class="akari-actions__more"
        :inert="folded ? undefined : true"
      >
        <m3e-icon-button
          id="akari-more-button"
          :aria-label="t('moreActions')"
        >
          <m3e-icon name="more_vert"></m3e-icon>
          <m3e-menu-trigger for="akari-more-menu"></m3e-menu-trigger>
        </m3e-icon-button>
        <m3e-tooltip for="akari-more-button">{{ t("moreActions") }}</m3e-tooltip>
      </span>
    </span>
  </m3e-app-bar>
</template>

<style scoped>
/* Keep the bar and everything in it above the document content. */
.akari-app-bar {
  position: relative;
  z-index: 11;
}

/*
 * Site name and article title share one cell. Swapping them is a vertical
 * shared-axis move clipped by the cell: the outgoing title rises and fades,
 * the incoming one rises from below into place.
 */
.akari-app-bar__center {
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
}

/*
 * On pages with tabs the title's width is capped by useAppBarRoom, which
 * leaves the docked bar its room; whatever does not fit ends in an
 * ellipsis (the site name's text and the page title both truncate). The
 * cap eases when the docked bar swaps the site name for a page title; on
 * other changes [data-snap] applies it at once.
 */
.akari-app-bar__title {
  display: grid;
  flex: 0 1 auto;
  align-items: center;
  min-width: 0;
  max-width: var(--akari-app-bar-title-max, 100%);
  overflow: hidden;
  transition:
    margin-inline-start var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    max-width var(--md-sys-motion-duration-medium-2, 300ms)
      var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
}

/* While its width eases, the title is cut off plainly, without an ellipsis. */
.akari-app-bar__title[data-easing] .akari-app-bar__page-title,
.akari-app-bar__title[data-easing] :deep(.akari-title__text) {
  text-overflow: clip;
}

.akari-app-bar__title[data-snap] {
  transition: margin-inline-start var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1));
}

/*
 * The free space after the title, where the tab bar docks. The same safe
 * gap separates the bar from the title and from the first action (the app
 * bar already pads its title slot by 4px before the actions). The gaps are
 * the bar's margins, so the free space can close to nothing, leaving all
 * of it to the title, while nothing is docked.
 */
.akari-app-bar__tabs {
  --_gap: var(--akari-app-bar-tabs-gap, 24px);
  display: flex;
  flex: 1 1 0;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
}

.akari-app-bar__tabs .akari-page-tabs {
  margin-inline: var(--_gap) calc(var(--_gap) - 4px);
}

.akari-app-bar__tabs .akari-page-tabs:not([data-shown]) {
  visibility: hidden;
  pointer-events: none;
}

/*
 * The navigation button folds away on wide windows instead of being
 * removed, so it grows back in, and the title slides aside, when the
 * window narrows past the breakpoint.
 */
.akari-app-bar__nav-toggle {
  width: 48px;
  overflow: clip;
  transition:
    width var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    opacity var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1)),
    visibility var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1));
}

/* Each layer is as wide as its content, so it can be measured. */
.akari-app-bar__title-layer {
  grid-area: 1 / 1;
  justify-self: start;
  min-width: 0;
  max-width: 100%;
  transition:
    opacity var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1)),
    transform var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    visibility var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1));
}

.akari-app-bar__brand {
  display: flex;
  align-items: center;
}

.akari-app-bar__page-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transform: translateY(16px);
}

.akari-app-bar__title.is-page-title .akari-app-bar__brand {
  opacity: 0;
  visibility: hidden;
  transform: translateY(-16px);
}

.akari-app-bar__title.is-page-title .akari-app-bar__page-title {
  opacity: 1;
  visibility: visible;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .akari-app-bar__title-layer {
    transition: none;
  }
}

/*
 * Search, then the actions that fold into the overflow menu, then the
 * menu's button: one of the last two is shown. Each folds to nothing, gap
 * included, on the spatial spring, and fades on the effects one; the app
 * bar measures the actions' own width into --_extra-width. Until it has
 * measured, narrow windows start folded and nothing animates.
 */
.akari-actions {
  --_gap: 8px;
  display: inline-flex;
  align-items: center;
}

.akari-actions__extra,
.akari-actions__more {
  display: inline-flex;
  flex: none;
  align-items: center;
  margin-inline-start: var(--_gap);
  overflow: clip;
  overflow-clip-margin: 8px;
  transition:
    width var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    margin-inline-start var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    opacity var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1)),
    visibility var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1));
}

.akari-actions__extra {
  gap: 4px;
  width: var(--_extra-width, auto);
}

.akari-actions__more {
  width: 48px;
}

.akari-actions__more,
.akari-actions[data-folded] .akari-actions__extra {
  width: 0;
  margin-inline-start: 0;
  /* Folded to nothing, it paints nothing outside either. */
  overflow-clip-margin: 0px;
  opacity: 0;
  visibility: hidden;
}

.akari-actions[data-folded] .akari-actions__more {
  width: 48px;
  margin-inline-start: var(--_gap);
  overflow-clip-margin: 8px;
  opacity: 1;
  visibility: visible;
}

.akari-actions:not([data-measured]) .akari-actions__extra,
.akari-actions:not([data-measured]) .akari-actions__more {
  transition: none;
}

@media (max-width: 599.98px) {
  .akari-actions:not([data-measured]) .akari-actions__extra {
    width: 0;
    margin-inline-start: 0;
    overflow-clip-margin: 0px;
    opacity: 0;
    visibility: hidden;
  }

  .akari-actions:not([data-measured]) .akari-actions__more {
    width: 48px;
    margin-inline-start: var(--_gap);
    overflow-clip-margin: 8px;
    opacity: 1;
    visibility: visible;
  }
}

@media (prefers-reduced-motion: reduce) {
  .akari-actions__extra,
  .akari-actions__more {
    transition: none;
  }
}

@media (min-width: 960px) {
  .akari-app-bar__nav-toggle {
    width: 0;
    opacity: 0;
    visibility: hidden;
  }

  /* No navigation icon here: the title keeps M3's 16px start inset. */
  .akari-app-bar__title {
    margin-inline-start: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .akari-app-bar__title,
  .akari-app-bar__nav-toggle {
    transition: none;
  }
}

@media (max-width: 767px) {
  .akari-actions {
    --_gap: 2px;
  }
}

@media (max-width: 600px) {
  .akari-actions {
    --_gap: 0px;
  }
}
</style>
