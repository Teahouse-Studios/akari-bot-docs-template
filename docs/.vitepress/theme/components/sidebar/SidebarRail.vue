<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { useAkariI18n } from "../../composables/useI18n";
import { useAkariLocales } from "../../composables/useLocales";
import { useAkariConfig } from "../../composables/useAkariConfig";
import { useLogoSrc } from "../../composables/useLogoSrc";
import { usePageHref } from "../../composables/usePageHref";
import { findFirstLink, isExternalLink } from "../../sidebar";
import type { AkariSidebarItem } from "../../types";
import LocaleSwitcher from "../shell/LocaleSwitcher.vue";
import SchemeToggle from "../shell/SchemeToggle.vue";

const props = defineProps<{
  items: AkariSidebarItem[];
  activeIndex: number;
  openIndex: number;
  drawerId: string;
}>();

const emit = defineEmits<{
  (event: "activate", index: number, source: MouseEvent): void;
  (event: "hover", index: number): void;
  (event: "hoverend", index: number): void;
}>();

const config = useAkariConfig();
const pageHref = usePageHref();
const { t } = useAkariI18n();
const { homeHref } = useAkariLocales();
const logo = useLogoSrc();

// The item selected at mount skips m3e's selection animation, so the rail
// renders settled; later navigation animates the newly selected item.
const settledIndex = ref(props.activeIndex);

watch(
  () => props.activeIndex,
  () => {
    settledIndex.value = -1;
  },
);

function hasChildren(item: AkariSidebarItem): boolean {
  return (item.items?.length ?? 0) > 0;
}

function isExternal(item: AkariSidebarItem): boolean {
  return !!item.link && isExternalLink(item.link);
}

// Categories point at their first page so the item stays a real link
// (status bar URL, modifier-click into a new tab). Plain clicks are routed by
// DesktopNavigation instead, because the pseudo link m3e-nav-item creates
// carries a `target` attribute that VitePress refuses to intercept.
function hrefFor(item: AkariSidebarItem): string | undefined {
  const link = findFirstLink(item);
  if (!link) return undefined;
  return pageHref(link);
}

function onPointerEnter(index: number, event: PointerEvent): void {
  if (event.pointerType === "mouse") emit("hover", index);
}

function onPointerLeave(index: number, event: PointerEvent): void {
  if (event.pointerType === "mouse") emit("hoverend", index);
}
</script>

<template>
  <nav class="akari-rail" :aria-label="t('railLabel')">
    <!-- Top of the strip, level with the app bar: the site mark. -->
    <div class="akari-rail__brand">
      <a
        v-if="logo"
        class="akari-rail__home"
        :href="homeHref"
        :aria-label="t('homeLink', { title: config.appBar.title })"
      >
        <img class="akari-rail__logo" :src="logo" alt="" decoding="async" />
      </a>
    </div>

    <!--
      Selection follows the route, not clicks: cancelling `beforeinput`
      stops m3e-nav-item from selecting itself when activated.
    -->
    <m3e-nav-rail class="akari-rail__bar" @beforeinput.prevent>
      <m3e-nav-item
        v-for="(item, index) in items"
        :key="item.link ?? `${item.text}-${index}`"
        class="akari-rail__item"
        :selected="index === activeIndex ? true : undefined"
        :data-akari-settled="index === settledIndex ? '' : undefined"
        :href="hrefFor(item)"
        :target="isExternal(item) ? '_blank' : undefined"
        :rel="isExternal(item) ? 'noreferrer' : undefined"
        :aria-haspopup="hasChildren(item) ? 'true' : undefined"
        :aria-expanded="
          hasChildren(item) ? String(index === openIndex) : undefined
        "
        :aria-controls="hasChildren(item) ? drawerId : undefined"
        :data-index="index"
        @pointerenter="onPointerEnter(index, $event)"
        @pointerleave="onPointerLeave(index, $event)"
        @click="emit('activate', index, $event)"
      >
        <span slot="icon" class="akari-rail__icon">
          <m3e-icon :name.attr="item.icon ?? 'category'"></m3e-icon>
          <m3e-badge v-if="item.badge" class="akari-rail__badge">
            {{ item.badge }}
          </m3e-badge>
        </span>
        {{ item.text }}
      </m3e-nav-item>
    </m3e-nav-rail>

    <!-- Bottom of the strip: appearance, then language. -->
    <div class="akari-rail__footer">
      <SchemeToggle id-prefix="akari-rail-scheme" />
      <LocaleSwitcher id-prefix="akari-rail-locale" />
    </div>
  </nav>
</template>

<style scoped>
.akari-rail {
  position: relative;
  z-index: 1;
  display: flex;
  flex: none;
  flex-direction: column;
  box-sizing: border-box;
  width: var(--akari-doc-rail-width);
  height: 100%;
  min-height: 0;
  /* Opaque so the overlay drawer can slide out from underneath it. */
  background-color: var(--akari-doc-page-background);
}

.akari-rail__brand {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  height: var(--akari-doc-app-bar-height);
}

.akari-rail__home {
  display: inline-flex;
  padding: 8px;
  border-radius: var(--md-sys-shape-corner-medium, 12px);
}

.akari-rail__home:focus-visible {
  outline: 3px solid var(--md-sys-color-secondary);
  outline-offset: -3px;
}

.akari-rail__logo {
  display: block;
  width: 72px;
  height: 44px;
  object-fit: contain;
}

.akari-rail__bar {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  scrollbar-width: none;
  --m3e-nav-rail-compact-width: var(--akari-doc-rail-width);
  /*
   * Items fill the rail without side padding. m3e cancels its default
   * padding with a negative margin on each item, which the document's
   * global `* { margin: 0 }` reset overrides and leaves items offset.
   */
  --m3e-nav-rail-inline-padding: 0px;
  --m3e-nav-rail-top-space: 4px;
  --m3e-nav-rail-bottom-space: 8px;
}

.akari-rail__item {
  margin-block-end: 4px;
}

.akari-rail__footer {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding-block: 12px 24px;
}

.akari-rail__footer:empty {
  display: none;
}

.akari-rail__icon {
  position: relative;
  display: inline-block;
  line-height: 0;
}

/* M3 large badge, anchored to the top end of the icon. */
.akari-rail__badge {
  position: absolute;
  inset-block-start: -6px;
  inset-inline-start: 12px;
  white-space: nowrap;
}
</style>
