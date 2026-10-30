<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
  watchEffect,
} from "vue";
import { useRoute, useRouter } from "vitepress";

import { useAkariConfig } from "../../composables/useAkariConfig";
import { usePageHref } from "../../composables/usePageHref";
import { useSidebar } from "../../composables/useSidebar";
import {
  AKARI_NAV_DRAWER_PINNED_QUERY,
  AKARI_NAV_RAIL_QUERY,
} from "../../constants";
import { findFirstLink, isExternalLink } from "../../sidebar";
import type { AkariSidebarItem } from "../../types";
import SidebarRail from "./SidebarRail.vue";
import SidebarSecondary from "./SidebarSecondary.vue";

const RAIL_WIDTH = 96;
const DRAWER_ID = "akari-nav-drawer";
// Hover intent: a category must hold the pointer briefly before the drawer
// follows it, so a cursor crossing other rail items on its way into the
// drawer does not switch the drawer underneath it.
const HOVER_INTENT_DELAY = 100;
const HOVER_CLOSE_DELAY = 200;

const config = useAkariConfig();
const { items, hasActive } = useSidebar();
const route = useRoute();
const router = useRouter();
const pageHref = usePageHref();

const host = ref<HTMLElement | null>(null);
// Mirrors of the breakpoint media queries for interaction logic. Whether the
// drawer is pinned is decided by CSS, so the first render already has the
// final layout before any script runs.
const railVisible = ref(false);
const pinnable = ref(false);
// Category shown on demand (hover, keyboard or touch); -1 when idle.
const previewIndex = ref(-1);
// Category being navigated into from the pinned drawer or the rail. It holds
// the drawer on that category until the route catches up; otherwise the
// drawer would fall back to the old category for the length of the page load
// and then switch again.
const pendingIndex = ref(-1);
// Opened by keyboard or touch: survives the pointer leaving and is closed by
// Escape, an outside press, focus leaving the navigation, or navigation.
const sticky = ref(false);

let railMedia: MediaQueryList | undefined;
let pinnedMedia: MediaQueryList | undefined;
let openTimer: ReturnType<typeof setTimeout> | undefined;
let closeTimer: ReturnType<typeof setTimeout> | undefined;
let lastPointerType = "mouse";
let outsideAttached = false;

function hasChildren(item: AkariSidebarItem | undefined): boolean {
  return (item?.items?.length ?? 0) > 0;
}

const activeIndex = computed(() =>
  items.value.findIndex((item) => hasActive(item)),
);

const activeCategoryIndex = computed(() =>
  hasChildren(items.value[activeIndex.value]) ? activeIndex.value : -1,
);

// Standard drawer: pinned beside the rail on extra-large windows whenever the
// current page belongs to a category, taking its width from the content.
const pinnedOpen = computed(
  () => pinnable.value && activeCategoryIndex.value >= 0,
);

// Modal drawer: slides over the content from behind the rail.
const overlayOpen = computed(
  () => railVisible.value && !pinnedOpen.value && previewIndex.value >= 0,
);

const pinnedIndex = computed(() => {
  if (!pinnedOpen.value) return activeCategoryIndex.value;
  if (pendingIndex.value >= 0) return pendingIndex.value;
  return previewIndex.value >= 0
    ? previewIndex.value
    : activeCategoryIndex.value;
});

// Remember what each drawer last showed so it keeps its content while it
// animates closed. The pinned drawer starts on the current category, which
// the server already knows, so it renders filled in.
const pinnedShown = ref(activeCategoryIndex.value);
const overlayShown = ref(-1);

watchEffect(() => {
  if (pinnedIndex.value >= 0) pinnedShown.value = pinnedIndex.value;
});

watchEffect(() => {
  if (overlayOpen.value) overlayShown.value = previewIndex.value;
});

function categoryAt(index: number): AkariSidebarItem | null {
  const item = items.value[index];
  return item && hasChildren(item) ? item : null;
}

const pinnedCategory = computed(() => categoryAt(pinnedShown.value));
const overlayCategory = computed(() => categoryAt(overlayShown.value));

const openIndex = computed(() => {
  if (overlayOpen.value) return previewIndex.value;
  return pinnedOpen.value ? pinnedIndex.value : -1;
});

const navStyle = computed(() => {
  const width = Math.max(240, config.value.sidebar.width - RAIL_WIDTH);
  return { "--akari-doc-drawer-width": `${width}px` };
});

function cancelOpen(): void {
  if (openTimer === undefined) return;
  clearTimeout(openTimer);
  openTimer = undefined;
}

function cancelClose(): void {
  if (closeTimer === undefined) return;
  clearTimeout(closeTimer);
  closeTimer = undefined;
}

function closeDrawer(): void {
  cancelOpen();
  cancelClose();
  previewIndex.value = -1;
  sticky.value = false;
  detachOutside();
}

function scheduleClose(delay: number): void {
  cancelOpen();
  cancelClose();
  closeTimer = setTimeout(() => {
    closeTimer = undefined;
    closeDrawer();
  }, delay);
}

function showPreview(index: number, delay: number): void {
  cancelOpen();
  cancelClose();
  openTimer = setTimeout(() => {
    openTimer = undefined;
    previewIndex.value = index;
  }, delay);
}

function onRailHover(index: number): void {
  if (!railVisible.value) return;

  pendingIndex.value = -1;
  sticky.value = false;
  detachOutside();

  if (!hasChildren(items.value[index])) {
    scheduleClose(HOVER_INTENT_DELAY);
    return;
  }

  if (index === previewIndex.value) {
    cancelOpen();
    cancelClose();
    return;
  }

  showPreview(index, HOVER_INTENT_DELAY);
}

function onRailHoverEnd(): void {
  cancelOpen();
}

function onPointerDown(event: PointerEvent): void {
  lastPointerType = event.pointerType;
}

function onPointerEnter(event: PointerEvent): void {
  if (event.pointerType === "mouse") cancelClose();
}

function onPointerLeave(event: PointerEvent): void {
  if (event.pointerType !== "mouse") return;

  cancelOpen();
  if (!sticky.value && previewIndex.value >= 0) {
    scheduleClose(HOVER_CLOSE_DELAY);
  }
}

function focusDrawerMenu(variant: "pinned" | "modal"): void {
  void nextTick(() => {
    requestAnimationFrame(() => {
      host.value
        ?.querySelector<HTMLElement>(
          `.akari-nav-drawer--${variant} m3e-nav-menu`,
        )
        ?.focus();
    });
  });
}

function onRailActivate(index: number, event: MouseEvent): void {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }

  const item = items.value[index];
  if (!item) return;

  // Keyboard and assistive-technology activation arrives with detail 0.
  const keyboard = event.detail === 0;
  const touch = !keyboard && lastPointerType !== "mouse";

  if (hasChildren(item) && railVisible.value) {
    // Without hover, a category press opens its drawer instead of leaving
    // the page, so touch and keyboard users can browse the category.
    if ((keyboard || touch) && !pinnedOpen.value) {
      event.preventDefault();

      if (sticky.value && previewIndex.value === index) {
        closeDrawer();
        return;
      }

      cancelOpen();
      cancelClose();
      previewIndex.value = index;
      sticky.value = true;
      attachOutside();
      if (keyboard) focusDrawerMenu("modal");
      return;
    }

    if (keyboard && pinnedOpen.value && index === activeCategoryIndex.value) {
      event.preventDefault();
      focusDrawerMenu("pinned");
      return;
    }
  }

  const link = findFirstLink(item);
  // External links are left to m3e-nav-item, which opens them in a new tab.
  if (!link || isExternalLink(link)) return;

  event.preventDefault();
  if (pinnedOpen.value && hasChildren(item)) pendingIndex.value = index;
  closeDrawer();
  void router.go(pageHref(link));
}

function onEscape(event: KeyboardEvent): void {
  const index = openIndex.value;
  if (previewIndex.value < 0 || index < 0) return;

  event.preventDefault();
  event.stopPropagation();
  closeDrawer();

  host.value
    ?.querySelector<HTMLElement>(`.akari-rail__item[data-index="${index}"]`)
    ?.focus();
}

function onFocusOut(event: FocusEvent): void {
  const next = event.relatedTarget as Node | null;
  if (next && host.value?.contains(next)) return;
  if (sticky.value) closeDrawer();
}

function onDocumentPointerDown(event: PointerEvent): void {
  const target = event.target as Node | null;
  if (target && host.value?.contains(target)) return;
  closeDrawer();
}

function attachOutside(): void {
  if (outsideAttached) return;
  document.addEventListener("pointerdown", onDocumentPointerDown, true);
  outsideAttached = true;
}

function detachOutside(): void {
  if (!outsideAttached) return;
  document.removeEventListener("pointerdown", onDocumentPointerDown, true);
  outsideAttached = false;
}

function updateMode(): void {
  railVisible.value = railMedia?.matches ?? false;
  pinnable.value = pinnedMedia?.matches ?? false;
  closeDrawer();
}

function onDrawerNavigate(): void {
  if (pinnedOpen.value) pendingIndex.value = pinnedShown.value;
  closeDrawer();
}

watch(
  () => route.path,
  () => {
    pendingIndex.value = -1;
    closeDrawer();
  },
);

onMounted(() => {
  railMedia = window.matchMedia(AKARI_NAV_RAIL_QUERY);
  pinnedMedia = window.matchMedia(AKARI_NAV_DRAWER_PINNED_QUERY);
  updateMode();
  railMedia.addEventListener("change", updateMode);
  pinnedMedia.addEventListener("change", updateMode);
});

onUnmounted(() => {
  railMedia?.removeEventListener("change", updateMode);
  pinnedMedia?.removeEventListener("change", updateMode);
  cancelOpen();
  cancelClose();
  detachOutside();
});
</script>

<template>
  <div
    v-if="items.length"
    ref="host"
    class="akari-desktop-nav"
    :style="navStyle"
    @pointerdown.capture="onPointerDown"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @focusout="onFocusOut"
    @keydown.esc="onEscape"
  >
    <!--
      The rail owns the full-height strip at the start of the page; the
      drawers sit below the app bar. The root is display: contents, so the
      rail column and the pinned drawer take their own cells in the page grid.
    -->
    <div
      class="akari-desktop-nav__rail"
      :data-category="activeCategoryIndex >= 0 ? '' : undefined"
      :data-overlay="overlayOpen ? '' : undefined"
    >
      <SidebarRail
        :items="items"
        :active-index="activeIndex"
        :open-index="openIndex"
        :drawer-id="DRAWER_ID"
        @activate="onRailActivate"
        @hover="onRailHover"
        @hoverend="onRailHoverEnd"
      />

      <div
        :id="pinnedOpen ? undefined : DRAWER_ID"
        class="akari-nav-drawer akari-nav-drawer--modal"
        :data-open="overlayOpen ? '' : undefined"
        :inert="!overlayOpen"
      >
        <div class="akari-nav-drawer__panel">
          <div class="akari-nav-drawer__surface">
            <Transition name="akari-nav-swap" mode="out-in">
              <SidebarSecondary
                v-if="overlayCategory"
                :key="overlayShown"
                :category="overlayCategory"
                @navigate="onDrawerNavigate"
              />
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <div
      :id="pinnedOpen ? DRAWER_ID : undefined"
      class="akari-nav-drawer akari-nav-drawer--pinned"
      :data-category="activeCategoryIndex >= 0 ? '' : undefined"
    >
      <div class="akari-nav-drawer__surface">
        <Transition name="akari-nav-swap" mode="out-in">
          <SidebarSecondary
            v-if="pinnedCategory"
            :key="pinnedShown"
            :category="pinnedCategory"
            @navigate="onDrawerNavigate"
          />
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.akari-desktop-nav {
  display: contents;
}

/*
 * Full-height strip at the start of the page, in view while it scrolls. On
 * compact windows it gives its column back and the rail slides off the
 * window's edge with it, so resizing across the breakpoint animates both
 * ways instead of the rail vanishing.
 */
.akari-desktop-nav__rail {
  position: sticky;
  top: 0;
  z-index: 5;
  grid-column: 1;
  grid-row: 1 / -1;
  align-self: start;
  display: flex;
  box-sizing: border-box;
  width: var(--akari-doc-rail-width);
  height: 100dvh;
  transition:
    width var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    visibility var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1));
}

.akari-desktop-nav__rail > .akari-rail {
  transition: transform var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1));
}

/*
 * Divider between the rail and a drawer beside it: shown with the hover
 * drawer, and with the pinned drawer (same conditions as its open state).
 * It starts 64px below the top of the strip and runs to its bottom.
 */
.akari-desktop-nav__rail::after {
  content: "";
  position: absolute;
  inset-block: 64px 0;
  inset-inline-end: 0;
  z-index: 2;
  width: 1px;
  background-color: var(--akari-doc-divider-color);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--md-sys-motion-spring-fast-effects, 150ms cubic-bezier(0.31, 0.94, 0.34, 1));
}

.akari-desktop-nav__rail[data-overlay]::after {
  opacity: 1;
  transition-duration: 0ms;
}

@media (min-width: 1600px) {
  .akari-desktop-nav__rail[data-category]::after {
    opacity: 1;
  }
}

.akari-nav-drawer__surface {
  display: flex;
  flex: none;
  flex-direction: column;
  box-sizing: border-box;
  width: var(--akari-doc-drawer-width);
  height: 100%;
  min-height: 0;
}

/*
 * Standard drawer. Its footprint grows from zero, so the content yields
 * space smoothly while the drawer is revealed from under the rail (the
 * surface stays end-aligned), and shrinks back the same way.
 *
 * Open state comes from the route (data-category) and a media query kept in
 * sync with AKARI_NAV_DRAWER_PINNED_QUERY, so the server render paints the final
 * layout and only later changes (resizing, navigation) animate.
 *
 * Both ways the width eases on a spring without overshoot. It pushes the
 * content, so a spatial spring's overshoot moved the whole page past its
 * place and drifted it back; closing, it carried the width past zero, where
 * it is clamped, so the drawer slammed shut and flicked a sliver back open.
 */
.akari-nav-drawer--pinned {
  position: sticky;
  top: var(--akari-doc-app-bar-height);
  grid-column: 2;
  grid-row: 2;
  align-self: start;
  display: flex;
  flex: none;
  justify-content: flex-end;
  width: 0;
  height: calc(100dvh - var(--akari-doc-app-bar-height));
  min-height: 0;
  margin-inline-end: 0;
  overflow: hidden;
  visibility: hidden;
  transition:
    width var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    margin-inline-end var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    visibility var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1));
}

/* Visibility is left out of the opening transition so it applies at once. */
@media (min-width: 1600px) {
  .akari-nav-drawer--pinned[data-category] {
    width: var(--akari-doc-drawer-width);
    margin-inline-end: var(--akari-doc-nav-gap);
    visibility: inherit;
    transition:
      width var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
      margin-inline-end var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1));
  }
}

/*
 * Modal drawer. The panel slides out from behind the opaque rail and floats
 * over the full page height, app bar included. It shares the app bar's
 * surface color, so its elevation (level 3, level 5 while hovered) is what
 * sets it apart up there. A strip of it stays tucked under the rail so the
 * expressive spring's overshoot never opens a gap at the rail edge; the
 * static outer box clips at that edge so neither the strip nor its shadow
 * shows below the rail.
 */
.akari-nav-drawer--modal {
  --_tuck: 24px;
  --_shadow-room: 32px;
  position: absolute;
  inset-block: 0;
  inset-inline-start: 100%;
  width: calc(var(--akari-doc-drawer-width) + var(--_shadow-room));
  clip-path: inset(
    calc(0px - var(--_shadow-room)) calc(0px - var(--_shadow-room))
      calc(0px - var(--_shadow-room)) 0
  );
  pointer-events: none;
}

.akari-nav-drawer--modal:dir(rtl) {
  clip-path: inset(
    calc(0px - var(--_shadow-room)) 0 calc(0px - var(--_shadow-room))
      calc(0px - var(--_shadow-room))
  );
}

.akari-nav-drawer__panel {
  --_hidden-offset: -100%;
  position: absolute;
  inset-block: 0;
  inset-inline-start: calc(0px - var(--_tuck));
  box-sizing: border-box;
  width: calc(var(--akari-doc-drawer-width) + var(--_tuck));
  padding-inline-start: var(--_tuck);
  border-start-end-radius: var(--md-sys-shape-corner-large, 16px);
  border-end-end-radius: var(--md-sys-shape-corner-large, 16px);
  background-color: var(--akari-doc-nav-drawer-modal-color);
  box-shadow: none;
  pointer-events: auto;
  visibility: hidden;
  transform: translateX(var(--_hidden-offset));
  transition:
    transform var(--md-sys-motion-spring-fast-spatial, 350ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    box-shadow var(--md-sys-motion-spring-fast-effects, 150ms cubic-bezier(0.31, 0.94, 0.34, 1)),
    visibility var(--md-sys-motion-spring-fast-spatial, 350ms cubic-bezier(0.27, 1.06, 0.18, 1));
}

.akari-nav-drawer__panel:dir(rtl) {
  --_hidden-offset: 100%;
}

/* Visibility is left out of the opening transition so it applies at once. */
.akari-nav-drawer--modal[data-open] .akari-nav-drawer__panel {
  visibility: inherit;
  transform: none;
  box-shadow: var(--akari-doc-elevation-level3);
  transition:
    transform var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    box-shadow var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1));
}

.akari-nav-drawer--modal[data-open] .akari-nav-drawer__panel:hover {
  box-shadow: var(--akari-doc-elevation-level5);
}

/*
 * Switching categories fades the old list out, holds the drawer empty for a
 * beat, then fades the new list in, so the two never read as a cross-fade.
 */
.akari-nav-swap-leave-active {
  transition: opacity var(--md-sys-motion-duration-short-2, 100ms) var(--md-sys-motion-easing-standard-accelerate, cubic-bezier(0.3, 0, 1, 1));
}

.akari-nav-swap-enter-active {
  transition: opacity var(--md-sys-motion-duration-short-3, 150ms) linear var(--md-sys-motion-duration-short-1, 50ms);
}

.akari-nav-swap-enter-from,
.akari-nav-swap-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .akari-desktop-nav__rail,
  .akari-desktop-nav__rail > .akari-rail,
  .akari-nav-drawer--pinned,
  .akari-nav-drawer--pinned[data-category],
  .akari-nav-drawer__panel,
  .akari-nav-drawer--modal[data-open] .akari-nav-drawer__panel,
  .akari-nav-swap-enter-active,
  .akari-nav-swap-leave-active {
    transition: none;
  }
}

@media (max-width: 959.98px) {
  .akari-desktop-nav__rail {
    width: 0;
    visibility: hidden;
  }

  .akari-desktop-nav__rail > .akari-rail {
    transform: translateX(-100%);
  }

  .akari-desktop-nav__rail:dir(rtl) > .akari-rail {
    transform: translateX(100%);
  }
}
</style>
