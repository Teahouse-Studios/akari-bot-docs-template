<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { onContentUpdated, useData, useRoute } from "vitepress";

import { useAkariConfig } from "../../composables/useAkariConfig";
import { AKARI_CONTENT_ID } from "../../constants";
import { prefersReducedMotion } from "../../search/animation";
import {
  findActiveHeading,
  focusHeading,
  onScrollSettled,
  readTocHeadings,
  type TocHeading,
} from "../../toc";


// Beyond this many entries the list scrolls inside the table of contents.
const MAX_VISIBLE_ITEMS = 15;
// A heading becomes current once its top passes this far below the app bar.
const READING_LINE_OFFSET = 96;

const { page, frontmatter } = useData();
const TITLE_ID = "akari-toc-title";
const route = useRoute();
const config = useAkariConfig();

const scroller = ref<HTMLElement | null>(null);
// Plain array indexed like `headings`: a ref array filled from v-for does
// not guarantee source order.
let itemElements: HTMLAnchorElement[] = [];
const headings = ref<TocHeading[]>([]);
const activeIndex = ref(0);
const indicator = ref({ top: 0, height: 0 });
const indicatorAnimated = ref(false);
const cap = ref<number | null>(null);

let headingElements: HTMLElement[] = [];
let frame = 0;
let followScroll = true;
let cancelSettle: (() => void) | undefined;
let resizeObserver: ResizeObserver | undefined;
let contentObserver: ResizeObserver | undefined;

const visible = computed(
  () =>
    config.value.toc.enabled &&
    frontmatter.value.toc !== false &&
    page.value.headers.length > 0,
);

// The page title is the article's h1, so entries start at h2.
const minLevel = computed(() =>
  Math.min(...headings.value.map((heading) => heading.level)),
);

function readHeadings(): void {
  const read = readTocHeadings(
    document.getElementById(AKARI_CONTENT_ID),
    config.value.toc.maxDepth,
  );
  headingElements = read.elements;
  headings.value = read.headings;
}

function readingLine(): number {
  const appBar = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--akari-doc-app-bar-height",
    ),
  );
  return (Number.isFinite(appBar) ? appBar : 64) + READING_LINE_OFFSET;
}

function findActive(): number {
  return findActiveHeading(headingElements, readingLine());
}

function update(): void {
  frame = 0;
  if (followScroll && headingElements.length) {
    activeIndex.value = findActive();
  }
}

function scheduleUpdate(): void {
  if (!frame) frame = requestAnimationFrame(update);
}

function setItemElement(element: unknown, index: number): void {
  if (element instanceof HTMLAnchorElement) itemElements[index] = element;
}

function measure(): void {
  const items = itemElements;
  cap.value =
    items.length > MAX_VISIBLE_ITEMS
      ? items[MAX_VISIBLE_ITEMS]!.offsetTop
      : null;

  const item = items[activeIndex.value];
  indicator.value = item
    ? { top: item.offsetTop, height: item.offsetHeight }
    : { top: 0, height: 0 };
}

/** Keeps the current entry in the middle of a scrolling list. */
function centerActive(smooth: boolean): void {
  const container = scroller.value;
  const item = itemElements[activeIndex.value];
  if (!container || !item) return;
  if (container.scrollHeight <= container.clientHeight) return;

  container.scrollTo({
    top: item.offsetTop - (container.clientHeight - item.offsetHeight) / 2,
    behavior: smooth ? "smooth" : "auto",
  });
}

function resumeFollowing(): void {
  cancelSettle?.();
  cancelSettle = undefined;
  followScroll = true;
  scheduleUpdate();
}

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

  // Hold the selection on the clicked entry while the page travels to it.
  followScroll = false;
  activeIndex.value = index;
  cancelSettle?.();
  cancelSettle = onScrollSettled(resumeFollowing);

  const reduced = prefersReducedMotion();
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  focusHeading(target);
  history.replaceState(history.state, "", `#${target.id}`);
}

async function rebuild(): Promise<void> {
  indicatorAnimated.value = false;
  readHeadings();
  itemElements = [];
  activeIndex.value = headingElements.length ? findActive() : 0;
  await nextTick();
  measure();
  centerActive(false);
  observeItems();
  // Let the first placement land without sliding there.
  requestAnimationFrame(() => {
    indicatorAnimated.value = true;
  });
}

function observeItems(): void {
  resizeObserver?.disconnect();
  if (scroller.value) {
    resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(scroller.value);
  }

  // Headings move when the article reflows (fonts, images, components
  // upgrading) without the window scrolling.
  contentObserver?.disconnect();
  const content = document.getElementById(AKARI_CONTENT_ID);
  if (content) {
    contentObserver = new ResizeObserver(() => scheduleUpdate());
    contentObserver.observe(content);
  }
}

watch(activeIndex, async () => {
  await nextTick();
  measure();
  centerActive(true);
});

watch(() => route.path, () => {
  scroller.value?.scrollTo({ top: 0 });
});

watch(visible, (value) => {
  if (value) void rebuild();
});

onContentUpdated(() => {
  if (visible.value) void rebuild();
});

onMounted(() => {
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  if (visible.value) void rebuild();
});

onUnmounted(() => {
  window.removeEventListener("scroll", scheduleUpdate);
  window.removeEventListener("resize", scheduleUpdate);
  cancelSettle?.();
  if (frame) cancelAnimationFrame(frame);
  resizeObserver?.disconnect();
  contentObserver?.disconnect();
});
</script>

<template>
  <nav v-if="visible" class="akari-toc" :aria-labelledby="TITLE_ID">
    <p :id="TITLE_ID" class="akari-toc__overline">{{ config.toc.overline }}</p>

    <div
      ref="scroller"
      class="akari-toc__scroller"
      :style="cap === null ? undefined : { '--_cap': `${cap}px` }"
    >
      <ul class="akari-toc__list">
        <li v-for="(heading, index) in headings" :key="heading.id">
          <!--
            target="_self" keeps VitePress' router off these links: it would
            jump to the heading instantly after the click, cutting off the
            smooth scroll started here.
          -->
          <a
            :ref="(element) => setItemElement(element, index)"
            class="akari-toc__item"
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
        class="akari-toc__indicator"
        :class="{ 'is-animated': indicatorAnimated }"
        :style="{
          top: `${indicator.top}px`,
          height: `${indicator.height}px`,
        }"
        aria-hidden="true"
      ></div>
    </div>
  </nav>
</template>

<style scoped>
/*
 * Mirrors m3e-toc: an overline, body-large entries and an outlined indicator
 * that slides to the current section.
 */
/*
 * On compact windows the table of contents gives its column back instead of
 * disappearing: the column narrows to nothing while the contents, which keep
 * their width, slide out past the surface's end edge and fade. Widening the
 * window brings them back the same way.
 */
.akari-toc {
  position: sticky;
  top: calc(var(--akari-doc-app-bar-height) + var(--akari-doc-toc-offset));
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: var(--akari-toc-width, 208px);
  max-height: calc(
    100dvh - var(--akari-doc-app-bar-height) - var(--akari-doc-toc-offset) -
      var(--akari-doc-gap)
  );
  overflow: clip;
  transition:
    width var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    opacity var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    visibility var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1));
}

.akari-toc__overline,
.akari-toc__scroller {
  box-sizing: border-box;
  width: var(--akari-toc-width, 208px);
}

.akari-toc__overline {
  flex: none;
  margin: 0;
  padding-inline: 16px;
  padding-block-end: 8px;
  overflow: hidden;
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-label-small-font-size, 0.6875rem);
  font-weight: var(--md-sys-typescale-label-small-font-weight, 500);
  line-height: var(--md-sys-typescale-label-small-line-height, 1rem);
  letter-spacing: var(--md-sys-typescale-label-small-tracking, 0.03125rem);
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Shows at most fifteen entries; longer lists scroll here. */
.akari-toc__scroller {
  position: relative;
  flex: 0 1 auto;
  min-height: 0;
  max-height: var(--_cap, none);
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--md-sys-color-outline-variant) transparent;
}

.akari-toc__scroller:hover {
  scrollbar-color: var(--md-sys-color-outline) transparent;
}

.akari-toc__list {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.akari-toc__item {
  position: relative;
  display: block;
  padding-block: 8px;
  padding-inline: calc(16px + 12px * var(--_level, 0)) 16px;
  border-radius: var(--md-sys-shape-corner-large-increased, 20px);
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-large-font-size, 1rem);
  font-weight: var(--md-sys-typescale-body-large-font-weight, 400);
  line-height: var(--md-sys-typescale-body-large-line-height, 1.5rem);
  letter-spacing: var(--md-sys-typescale-body-large-tracking, 0.03125rem);
  text-decoration: none;
  outline: none;
  transition: color var(--md-sys-motion-duration-long-1, 450ms)
    var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
}

/* State layer. */
.akari-toc__item::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: var(--md-sys-color-on-surface);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short-3, 150ms) linear;
}

.akari-toc__item:hover::before {
  opacity: 0.08;
}

.akari-toc__item:active::before {
  opacity: 0.1;
}

.akari-toc__item:focus-visible {
  outline: 3px solid var(--md-sys-color-secondary);
  outline-offset: -3px;
}

.akari-toc__item[aria-current] {
  color: var(--md-sys-color-on-surface);
  font-weight: var(--md-sys-typescale-emphasized-body-large-font-weight, 500);
}

.akari-toc__indicator {
  position: absolute;
  inset-inline: 0;
  box-sizing: border-box;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-large-increased, 20px);
  pointer-events: none;
}

.akari-toc__indicator.is-animated {
  transition:
    top var(--md-sys-motion-duration-long-1, 450ms)
      var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
    height var(--md-sys-motion-duration-long-1, 450ms)
      var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
}

/* Compact windows give the whole width to the article. */
@media (max-width: 959.98px) {
  .akari-toc {
    width: 0;
    opacity: 0;
    visibility: hidden;
  }
}

@media (prefers-reduced-motion: reduce) {
  .akari-toc,
  .akari-toc__item,
  .akari-toc__item::before,
  .akari-toc__indicator.is-animated {
    transition: none;
  }
}

@media (forced-colors: active) {
  .akari-toc__indicator {
    border-color: CanvasText;
  }
}
</style>
