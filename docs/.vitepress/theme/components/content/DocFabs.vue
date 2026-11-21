<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { onContentUpdated, useData, useRoute } from "vitepress";

import { useAkariI18n } from "../../composables/useI18n";
import { useAkariConfig } from "../../composables/useAkariConfig";
import { AKARI_CONTENT_ID } from "../../constants";
import { prefersReducedMotion } from "../../search/animation";
import {
  findActiveHeading,
  onScrollSettled,
  readTocHeadings,
  resolveTocDepth,
  type TocHeading,
} from "../../toc";
import { cubicBezier } from "../../tween";

const TOC_ID = "akari-toc-sheet";
// The window size at which the table of contents leaves its column.
const COMPACT = "(max-width: 959.98px)";
// The scroll back to the top eases on the standard curve, longer for a
// longer way.
const ease = cubicBezier(0.2, 0, 0, 1);
const scrollDuration = (distance: number) =>
  Math.min(900, Math.max(400, 300 + distance * 0.12));
// The extended button: leading space, icon, gap and trailing space.
const EXTENDED_FRAME = 16 + 24 + 12 + 20;

const config = useAkariConfig();
const { t } = useAkariI18n();
const { frontmatter } = useData();
const route = useRoute();

const topButton = ref<HTMLElement | null>(null);
const topLabel = ref<HTMLElement | null>(null);
const sheet = ref<HTMLElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const bar = ref<HTMLElement | null>(null);
const list = ref<HTMLElement | null>(null);

/* ------------------------------------------------------------------ */
/* Back to the top                                                     */
/* ------------------------------------------------------------------ */

// Shown once the page has left its top.
const scrolled = ref(false);
// Extended, naming what it does, while it takes the page back up.
const returning = ref(false);
const extendedWidth = ref(0);
let tween = 0;
let scrollFrame = 0;

const interrupts = ["wheel", "touchstart", "keydown"] as const;

function stop(): void {
  if (tween) cancelAnimationFrame(tween);
  tween = 0;
  returning.value = false;
  for (const name of interrupts) window.removeEventListener(name, onInput);
}

// The reader taking over the scroll (but not by pressing this button again,
// which toTop handles) stops the way back where it is.
function onInput(event: Event): void {
  if (event.target instanceof Node && topButton.value?.contains(event.target)) {
    return;
  }
  stop();
}

function toTop(): void {
  if (returning.value) {
    stop();
    return;
  }
  const from = window.scrollY;
  if (from <= 0) return;
  if (prefersReducedMotion()) {
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }

  returning.value = true;
  const start = performance.now();
  const duration = scrollDuration(from);
  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    window.scrollTo({ top: from * (1 - ease(progress)), behavior: "instant" });
    if (progress < 1) tween = requestAnimationFrame(step);
    else stop();
  };
  tween = requestAnimationFrame(step);
  for (const name of interrupts) {
    window.addEventListener(name, onInput, { passive: true });
  }
}

function measureLabel(): void {
  const label = topLabel.value;
  if (label) extendedWidth.value = EXTENDED_FRAME + Math.ceil(label.scrollWidth);
}

/* ------------------------------------------------------------------ */
/* Table of contents on compact windows                                */
/* ------------------------------------------------------------------ */

const compact = ref(false);
const headings = ref<TocHeading[]>([]);
const activeIndex = ref(0);
const tocOpen = ref(false);
// Open and grown to its size: only then may its list scroll, or the list,
// already at full size, would overflow the growing sheet both ways.
const tocSettled = ref(false);
const listHeight = ref(0);
let settleTimer: ReturnType<typeof setTimeout> | undefined;
// The outlined indicator around the current entry, as in the desktop table
// of contents; it slides once it has been put in place.
const indicator = ref({ top: 0, height: 0 });
const indicatorAnimated = ref(false);
// While the page travels to a picked entry, the selection stays on it.
let holding = false;
let cancelHold: (() => void) | undefined;
let headingElements: HTMLElement[] = [];
let media: MediaQueryList | undefined;

const tocAvailable = computed(
  () =>
    compact.value &&
    config.value.toc.enabled &&
    frontmatter.value.toc !== false &&
    headings.value.length > 0,
);

const minLevel = computed(() =>
  Math.min(...headings.value.map((heading) => heading.level)),
);

function readHeadings(): void {
  const read = readTocHeadings(
    document.getElementById(AKARI_CONTENT_ID),
    resolveTocDepth(frontmatter.value, config.value.toc.maxDepth),
  );
  headingElements = read.elements;
  headings.value = read.headings;
}

// A heading is current once it is within reach of where anchor jumps put
// headings (below the app bar, and a tab bar held under it), with room to
// spare: a heading landing there must count, fractions of a pixel aside.
function readingLine(): number {
  const padding = Number.parseFloat(
    getComputedStyle(document.documentElement).scrollPaddingTop,
  );
  return (Number.isFinite(padding) ? padding : 64) + 48;
}

function updateActive(): void {
  if (headingElements.length) {
    activeIndex.value = findActiveHeading(headingElements, readingLine());
  }
}

function measureIndicator(): void {
  const item = list.value?.querySelectorAll<HTMLElement>(
    ".akari-toc-sheet__item",
  )[activeIndex.value];
  indicator.value = item
    ? { top: item.offsetTop, height: item.offsetHeight }
    : { top: 0, height: 0 };
}

/**
 * The list's height in the open sheet: all of it, up to what fits between
 * the app bar and the sheet's bar, and at most 60% of the window.
 */
function measureList(): void {
  const content = list.value;
  const box = sheet.value?.getBoundingClientRect();
  if (!content || !box) return;
  const appBar =
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--akari-doc-app-bar-height",
      ),
    ) || 64;
  const room = box.bottom - 56 - appBar - 16;
  listHeight.value = Math.max(
    0,
    Math.min(content.scrollHeight, room, window.innerHeight * 0.6),
  );
}

function settle(): void {
  clearTimeout(settleTimer);
  if (tocOpen.value) tocSettled.value = true;
}

function onSheetTransitionEnd(event: TransitionEvent): void {
  if (event.target === sheet.value && event.propertyName === "height") {
    settle();
  }
}

function openToc(): void {
  readHeadings();
  updateActive();
  measureList();
  tocOpen.value = true;
  tocSettled.value = false;
  indicatorAnimated.value = false;
  // Without a transition (reduced motion) there is no transitionend.
  clearTimeout(settleTimer);
  settleTimer = setTimeout(settle, prefersReducedMotion() ? 0 : 800);
  void nextTick(() => {
    const items = list.value?.querySelectorAll<HTMLElement>("a");
    const item = items?.[activeIndex.value];
    // The open sheet's list starts with its current entry in the middle of
    // the height it is growing to.
    const scroller = panel.value;
    if (item && scroller && list.value) {
      const top =
        item.getBoundingClientRect().top - list.value.getBoundingClientRect().top;
      scroller.scrollTop = top - (listHeight.value - item.offsetHeight) / 2;
    }
    item?.focus({ preventScroll: true });
    measureIndicator();
    requestAnimationFrame(() => {
      indicatorAnimated.value = true;
    });
  });
}

function closeToc(returnFocus = true): void {
  if (!tocOpen.value) return;
  tocOpen.value = false;
  resumeFollowing();
  tocSettled.value = false;
  clearTimeout(settleTimer);
  if (returnFocus && sheet.value?.contains(document.activeElement)) {
    bar.value?.focus();
  }
}

function toggleToc(): void {
  if (tocOpen.value) closeToc();
  else openToc();
}

function resumeFollowing(): void {
  cancelHold?.();
  cancelHold = undefined;
  holding = false;
  if (tocOpen.value) updateActive();
}

/**
 * Takes the page to a picked entry's heading and leaves the sheet open on
 * it, the selection held on that entry while the page travels; the sheet
 * closes only from outside it (or its bar, or Escape).
 */
function onItemClick(event: MouseEvent, index: number): void {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  const target = headingElements[index];
  if (!target) return;
  event.preventDefault();
  holding = true;
  activeIndex.value = index;
  cancelHold?.();
  cancelHold = onScrollSettled(resumeFollowing);
  target.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
  history.replaceState(history.state, "", `#${target.id}`);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && tocOpen.value) {
    event.preventDefault();
    closeToc();
  }
}

function onMedia(): void {
  compact.value = media?.matches ?? false;
  if (!compact.value) closeToc(false);
}

/* ------------------------------------------------------------------ */

function onScroll(): void {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    scrolled.value = window.scrollY > 0;
    if (tocOpen.value && !holding) updateActive();
  });
}

function onFontsLoaded(): void {
  measureLabel();
}

watch(() => route.path, () => {
  closeToc(false);
});

watch(activeIndex, () => {
  void nextTick(measureIndicator);
});

watch(() => t("backToTop"), () => {
  void nextTick(measureLabel);
});

onContentUpdated(() => {
  readHeadings();
});

onMounted(() => {
  media = window.matchMedia(COMPACT);
  media.addEventListener("change", onMedia);
  onMedia();
  scrolled.value = window.scrollY > 0;
  readHeadings();
  measureLabel();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("keydown", onKeydown);
  document.fonts?.addEventListener("loadingdone", onFontsLoaded);
});

onUnmounted(() => {
  stop();
  clearTimeout(settleTimer);
  cancelHold?.();
  if (scrollFrame) cancelAnimationFrame(scrollFrame);
  media?.removeEventListener("change", onMedia);
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("keydown", onKeydown);
  document.fonts?.removeEventListener("loadingdone", onFontsLoaded);
});
</script>

<template>
  <!--
    Floating buttons at the window's bottom end: on compact windows the
    table of contents, which grows into a sheet of the page's sections, and
    under it the way back to the top, which shows once the page has left
    its top.
  -->
  <div class="akari-fabs" :data-toc-open="tocOpen ? '' : undefined">
    <div class="akari-fabs__scrim" aria-hidden="true" @click="closeToc()"></div>

    <section
      v-if="tocAvailable"
      ref="sheet"
      class="akari-toc-sheet"
      :data-open="tocOpen ? '' : undefined"
      :data-settled="tocSettled ? '' : undefined"
      :style="{ '--_list': `${listHeight}px` }"
      @transitionend="onSheetTransitionEnd"
    >
      <nav
        :id="TOC_ID"
        ref="panel"
        class="akari-toc-sheet__panel"
        :aria-label="config.toc.overline"
        :inert="tocOpen ? undefined : true"
      >
        <ul ref="list" class="akari-toc-sheet__list">
          <li v-for="(heading, index) in headings" :key="heading.id">
            <!-- target="_self" keeps VitePress' router off, as on desktop. -->
            <a
              class="akari-toc-sheet__item"
              :href="`#${heading.id}`"
              target="_self"
              :aria-current="index === activeIndex ? 'location' : undefined"
              :style="{ '--_level': heading.level - minLevel }"
              @click="onItemClick($event, index)"
            >{{ heading.text }}</a>
          </li>
        </ul>
        <div
          v-if="headings.length"
          class="akari-toc-sheet__indicator"
          :class="{ 'is-animated': indicatorAnimated }"
          :style="{
            top: `${indicator.top}px`,
            height: `${indicator.height}px`,
          }"
          aria-hidden="true"
        ></div>
      </nav>
      <button
        ref="bar"
        type="button"
        class="akari-toc-sheet__bar"
        :aria-label="t('tocButton')"
        :aria-expanded="tocOpen"
        :aria-controls="TOC_ID"
        @click="toggleToc"
      >
        <m3e-icon name="format_list_bulleted"></m3e-icon>
        <span class="akari-toc-sheet__label" aria-hidden="true">
          {{ t("tocButton") }}
        </span>
      </button>
    </section>

    <div class="akari-fabs__slot" :data-shown="scrolled ? '' : undefined">
      <button
        ref="topButton"
        type="button"
        class="akari-fab"
        :data-extended="returning ? '' : undefined"
        :style="{ '--_extended': `${extendedWidth}px` }"
        :aria-label="t('backToTop')"
        :tabindex="scrolled ? undefined : -1"
        :aria-hidden="scrolled ? undefined : 'true'"
        @click="toTop"
      >
        <m3e-icon name="keyboard_arrow_up"></m3e-icon>
        <span ref="topLabel" class="akari-fab__label" aria-hidden="true">
          {{ t("backToTop") }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/*
 * M3 floating buttons, lowered: 56px, the large corner, on
 * secondary-container at level 1 (level 2 under the pointer), with a state
 * layer. They stack at the
 * bottom end, the table of contents above the way back up, and let the page
 * take pointers everywhere else.
 */
.akari-fabs {
  --_space: 16px;
  position: fixed;
  inset-block-end: var(--_space);
  inset-inline-end: var(--_space);
  /*
   * With the surface and footer caps (3), and after them in the page, so
   * above them; the navigation drawers' layer (3) comes after it.
   */
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}

/* Open, the sheet and its scrim come above the app bar. */
.akari-fabs[data-toc-open] {
  z-index: 5;
}

.akari-fabs__scrim {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-scrim, #000) 32%,
    transparent
  );
  opacity: 0;
  visibility: hidden;
  transition:
    opacity var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1)),
    visibility var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1));
}

.akari-fabs[data-toc-open] .akari-fabs__scrim {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.akari-fab,
.akari-toc-sheet__bar {
  position: relative;
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
  height: 56px;
  padding-inline: 16px;
  border: 0;
  border-radius: var(--md-sys-shape-corner-large, 16px);
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  font: inherit;
  font-size: var(--md-sys-typescale-label-large-font-size, 0.875rem);
  font-weight: var(--md-sys-typescale-label-large-font-weight, 500);
  line-height: var(--md-sys-typescale-label-large-line-height, 1.25rem);
  letter-spacing: var(--md-sys-typescale-label-large-tracking, 0.00714em);
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
}

.akari-fab m3e-icon,
.akari-toc-sheet__bar m3e-icon {
  flex: none;
  font-size: 24px;
}

/* State layer. */
.akari-fab::before,
.akari-toc-sheet__bar::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: currentColor;
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short-3, 150ms) linear;
}

.akari-fab:hover::before,
.akari-toc-sheet__bar:hover::before {
  opacity: 0.08;
}

.akari-fab:focus-visible::before,
.akari-fab:active::before,
.akari-toc-sheet__bar:focus-visible::before,
.akari-toc-sheet__bar:active::before {
  opacity: 0.1;
}

.akari-fab:focus-visible,
.akari-toc-sheet__bar:focus-visible {
  outline: 3px solid var(--md-sys-color-secondary);
  outline-offset: 2px;
}

/*
 * The way back up. Its slot holds its place in the stack and folds away
 * with it, so the table of contents above settles down in its place; the
 * button itself scales and fades in and out. While it takes the page back
 * up it extends to name what it does, and folds back once there.
 */
.akari-fabs__slot {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  height: 0;
  margin-block-start: 0;
  transition:
    height var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    margin var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1));
}

.akari-fabs__slot[data-shown] {
  height: 56px;
  margin-block-start: var(--_space);
}

.akari-fab {
  width: 56px;
  box-shadow: var(--akari-doc-elevation-level1);
  opacity: 0;
  transform: scale(0.6);
  visibility: hidden;
  transition:
    width var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    transform var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    opacity var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1)),
    visibility var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1)),
    box-shadow var(--md-sys-motion-duration-short-4, 200ms) linear;
}

.akari-fabs__slot[data-shown] .akari-fab {
  opacity: 1;
  transform: none;
  visibility: visible;
}

.akari-fab:hover {
  box-shadow: var(--akari-doc-elevation-level2);
}

.akari-fab[data-extended] {
  width: var(--_extended);
}

.akari-fab__label,
.akari-toc-sheet__label {
  opacity: 0;
  transition: opacity var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1));
}

.akari-fab[data-extended] .akari-fab__label {
  opacity: 1;
}

/*
 * The table of contents: closed, a floating button; open, a sheet that
 * grows from it towards the window's start and up, the button becoming the
 * sheet's bar with its label. The sections fade in once there is room for
 * them and out first on the way back.
 */
.akari-toc-sheet {
  --_width: min(calc(100vw - 2 * var(--_space)), 360px);
  display: flex;
  flex: none;
  flex-direction: column;
  box-sizing: border-box;
  width: 56px;
  height: 56px;
  border-radius: var(--md-sys-shape-corner-large, 16px);
  background-color: var(--md-sys-color-surface-container-high);
  box-shadow: var(--akari-doc-elevation-level1);
  overflow: hidden;
  pointer-events: auto;
  transition:
    width var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    height var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    border-radius var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    box-shadow var(--md-sys-motion-duration-short-4, 200ms) linear;
}

.akari-toc-sheet:not([data-open]):hover {
  box-shadow: var(--akari-doc-elevation-level2);
}

.akari-toc-sheet[data-open] {
  width: var(--_width);
  height: calc(var(--_list) + 56px);
  border-radius: var(--md-sys-shape-corner-extra-large, 28px);
  box-shadow: var(--akari-doc-elevation-level2);
}

.akari-toc-sheet__panel {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  /* Scrolls only open and grown; never sideways. */
  overflow: hidden;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short-2, 100ms) linear;
}

.akari-toc-sheet[data-open][data-settled] .akari-toc-sheet__panel {
  overflow-y: auto;
}

.akari-toc-sheet[data-open] .akari-toc-sheet__panel {
  opacity: 1;
  transition: opacity var(--md-sys-motion-duration-medium-1, 250ms) linear
    var(--md-sys-motion-duration-short-2, 100ms);
}

.akari-toc-sheet__list {
  width: var(--_width);
  margin: 0;
  padding: 12px 0;
  list-style: none;
}

/* Entries and indicator as in the desktop table of contents. */
.akari-toc-sheet__item {
  position: relative;
  display: block;
  margin-inline: 12px;
  padding-block: 8px;
  padding-inline: calc(16px + 12px * var(--_level)) 16px;
  overflow: hidden;
  border-radius: var(--md-sys-shape-corner-large-increased, 20px);
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-font-size, 1rem);
  line-height: var(--md-sys-typescale-body-large-line-height, 1.5rem);
  letter-spacing: var(--md-sys-typescale-body-large-tracking, 0.03125rem);
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  outline: none;
}

.akari-toc-sheet__item::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: var(--md-sys-color-on-surface);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short-3, 150ms) linear;
}

.akari-toc-sheet__item:hover::before {
  opacity: 0.08;
}

.akari-toc-sheet__item:active::before {
  opacity: 0.1;
}

.akari-toc-sheet__item:focus-visible {
  outline: 3px solid var(--md-sys-color-secondary);
  outline-offset: -3px;
}

.akari-toc-sheet__item[aria-current] {
  color: var(--md-sys-color-on-surface);
  font-weight: var(--md-sys-typescale-emphasized-body-large-font-weight, 500);
}

.akari-toc-sheet__indicator {
  position: absolute;
  inset-inline: 12px;
  box-sizing: border-box;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-large-increased, 20px);
  pointer-events: none;
}

.akari-toc-sheet__indicator.is-animated {
  transition:
    top var(--md-sys-motion-duration-long-1, 450ms)
      var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
    height var(--md-sys-motion-duration-long-1, 450ms)
      var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
}

.akari-toc-sheet__bar {
  width: 100%;
  border-radius: inherit;
}

.akari-toc-sheet[data-open] .akari-toc-sheet__label {
  opacity: 1;
}

@media (min-width: 840px) {
  .akari-fabs {
    --_space: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .akari-fabs__scrim,
  .akari-fabs__slot,
  .akari-fab,
  .akari-fab__label,
  .akari-toc-sheet,
  .akari-toc-sheet__panel,
  .akari-toc-sheet__label,
  .akari-toc-sheet__indicator.is-animated {
    transition: none;
  }
}

@media print {
  .akari-fabs {
    display: none;
  }
}
</style>
