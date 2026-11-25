<script setup lang="ts">
import { ref } from "vue";

import { useAkariI18n } from "../../composables/useI18n";
import { usePageHref } from "../../composables/usePageHref";
import { useAkariSettings } from "../../composables/useSettings";
import { useTabIndicator } from "../../composables/useTabIndicator";
import { useTabScroll } from "../../composables/useTabScroll";
import { useAkariTabs } from "../../composables/useTabs";
import { useTabsDock } from "../../composables/useTabsDock";

const tabs = useAkariTabs();
const pageHref = usePageHref();
const { t } = useAkariI18n();
const { settings } = useAkariSettings();
const bar = ref<HTMLElement | null>(null);

useTabsDock(bar, tabs, () => settings.motion);
useTabIndicator(bar, () => tabs.current.value);
useTabScroll(
  bar,
  () => tabs.current.value,
  () => tabs.group.value,
);
</script>

<template>
  <!--
    Tabs for the parallel pages of the current sidebar entry. They are
    links: each tab is a page of its own, and the current one is marked
    aria-current. Docked in the app bar, this copy keeps its place hidden.
    The shelf around it holds it under the app bar when the app bar has no
    room for it; the bar is lifted on a shadow while held there.
  -->
  <div
    v-if="tabs.group.value && tabs.tabs.value.length"
    class="akari-tabs-shelf"
    :data-stuck="
      tabs.stuck.value && !tabs.docked.value && !tabs.flying.value
        ? ''
        : undefined
    "
  >
    <nav
      ref="bar"
      class="akari-page-tabs akari-doc-tabs"
      :aria-label="t('categoryPages', { category: tabs.group.value.text })"
      :data-hidden="tabs.docked.value || tabs.flying.value ? '' : undefined"
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
  </div>
</template>

<style scoped>
/*
 * The shelf spans the surface; its padding sets the bar in by the hero's
 * inset, at the top of the surface on every page of the group, with a hero
 * one inset below. The first margin offsets the surface cap, as the hero's
 * does. Scrolled up to the app bar the shelf sticks there: the bar then
 * either docks in the app bar or, without room for it there, stays held
 * under the app bar, lifted on a slight shadow over the content scrolling
 * by, which shows around it. The shelf itself is transparent and lets
 * pointers through to that content. It sits under the surface cap, which
 * keeps the surface's top corners.
 */
.akari-tabs-shelf {
  --_inset: var(--akari-doc-hero-inset, 8px);
  position: sticky;
  top: var(--akari-doc-app-bar-height);
  z-index: 2;
  flex: none;
  box-sizing: border-box;
  padding: var(--_inset);
  margin-block: calc(var(--akari-doc-padding) - var(--akari-doc-radius))
    calc(48px - var(--_inset));
  margin-inline: calc(0px - var(--akari-doc-padding));
  pointer-events: none;
}

/*
 * On narrow windows the tabs keep their width and the bar scrolls
 * sideways (`data-scrolls`, set by useTabScroll when the tabs do not fit),
 * with a slim scrollbar along its bottom kept to the straight part of the
 * pill; useTabScroll keeps the current tab in view. Switching
 * tabs leaves the bar in place while the content slides. Should the next
 * page start with the bar elsewhere on screen (the page was scrolled a
 * little), it glides back on this transition.
 */
.akari-doc-tabs[data-scrolls] {
  overflow-x: auto;
}

.akari-doc-tabs {
  /*
   * The root sets scrollbar-color, which inherits; Chromium ignores the
   * ::-webkit-scrollbar rules below while it is set.
   */
  scrollbar-color: auto;
  pointer-events: auto;
  box-shadow: none;
  transition:
    transform var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    box-shadow var(--md-sys-motion-duration-medium-2, 300ms)
      var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
}

/* Held under the app bar: lifted to level 2. */
.akari-tabs-shelf[data-stuck] .akari-doc-tabs {
  box-shadow: var(--akari-doc-elevation-level2);
}

.akari-doc-tabs::-webkit-scrollbar {
  height: 4px;
}

.akari-doc-tabs::-webkit-scrollbar-track {
  margin: 0 28px;
  background: transparent;
}

.akari-doc-tabs::-webkit-scrollbar-thumb {
  border-radius: 2px;
  background-color: var(--md-sys-color-outline);
}

/* Without those pseudo-elements (Firefox): the standard thin scrollbar. */
@supports not selector(::-webkit-scrollbar) {
  .akari-doc-tabs {
    scrollbar-width: thin;
    scrollbar-color: var(--md-sys-color-outline) transparent;
  }
}

.akari-doc-tabs[data-hidden] {
  visibility: hidden;
}

@media (max-width: 839.98px) {
  .akari-tabs-shelf {
    margin-block-end: calc(32px - var(--_inset));
  }
}

@media (prefers-reduced-motion: reduce) {
  .akari-doc-tabs {
    transition: none;
  }
}
</style>
