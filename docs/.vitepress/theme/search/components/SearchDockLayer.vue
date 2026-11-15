<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

import { useAkariSearchDock } from "../useSearchDock";
import SearchTrigger from "./SearchTrigger.vue";

const dock = useAkariSearchDock();
const root = ref<HTMLElement | null>(null);

onMounted(() => dock.setDockElement(root.value));
onUnmounted(() => dock.setDockElement(null));
</script>

<template>
  <div
    ref="root"
    class="akari-search-dock"
    :data-variant="dock.variant.value"
    :data-align="dock.align.value"
    :data-active="dock.active.value ? '' : undefined"
    :inert="!dock.active.value || dock.leaving.value"
    :aria-hidden="!dock.active.value || dock.leaving.value"
  >
    <SearchTrigger
      role="dock"
      :placeholder="dock.placeholder.value ?? undefined"
    />
  </div>
</template>

<style scoped>
/*
 * A fixed copy of the app bar's trigger. The controller owns left/top/
 * width/height, so its flight can start at the app bar, stop at any
 * element, and end back in the app bar. All timing comes from the MD3
 * spring tokens: the m3e theme rewrites them for Standard or Expressive.
 */
.akari-search-dock {
  position: fixed;
  z-index: 7;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: none;
  will-change: left, top, width, height;
}

.akari-search-dock[data-active] {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

/*
 * Geometry is written by the controller's requestAnimationFrame spring
 * loop, which reads the live anchor every frame. No CSS transition here:
 * it would lag the target and snap on the final frame during fast scroll.
 */

/*
 * The fade starts only after the copy has landed on the app bar button,
 * with the real button already visible underneath. A short cross-fade
 * avoids both a mid-flight disappearance and a last-frame pop.
 */
.akari-search-dock[data-fading] {
  opacity: 0;
  transition: opacity
    var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1));
}

.akari-search-dock :deep(.akari-search-trigger) {
  width: 100%;
  height: 100%;
  min-width: 0;
}

/*
 * Mid-flight return: the controller flips the variant to `bar` partway
 * on take-off and adds this attribute, so colors, type, padding,
 * the label and the shortcut all morph while the box is still moving.
 */
.akari-search-dock[data-morphing] :deep(.akari-search-trigger) {
  transition:
    background-color var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    border-color var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    color var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    box-shadow var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    font-size var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    padding-inline var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    gap var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1));
}

.akari-search-dock[data-morphing] :deep(.akari-search-trigger__label) {
  transition:
    opacity var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    max-width var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1));
}

.akari-search-dock[data-morphing] :deep(.akari-search-trigger__kbd) {
  transition:
    color 160ms cubic-bezier(0.2, 0, 0, 1),
    border-color var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    opacity var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    min-inline-size var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    max-inline-size var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    padding-inline var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    border-width var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1));
}

/* `align` centers or ends the icon + label + shortcut group. */
.akari-search-dock[data-align="center"] :deep(.akari-search-trigger) {
  justify-content: center;
}

.akari-search-dock[data-align="center"] :deep(.akari-search-trigger__label) {
  flex: 0 1 auto;
  text-align: center;
}

.akari-search-dock[data-align="end"] :deep(.akari-search-trigger) {
  justify-content: flex-end;
}

.akari-search-dock[data-align="end"] :deep(.akari-search-trigger__label) {
  flex: 0 1 auto;
  text-align: end;
}

/* A raised bar: the same field as the app bar, now floating. */
.akari-search-dock[data-variant="bar"] :deep(.akari-search-trigger) {
  box-shadow: var(--akari-doc-elevation-level1);
}

/* A tonal, elevated search pill without the shortcut hint. */
.akari-search-dock[data-variant="pill"] :deep(.akari-search-trigger) {
  border-color: transparent;
  background-color: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface);
  box-shadow: var(--akari-doc-elevation-level2);
}

.akari-search-dock[data-variant="pill"] :deep(.akari-search-trigger__kbd) {
  min-inline-size: 0;
  max-inline-size: 0;
  padding-inline: 0;
  border-width: 0;
  opacity: 0;
}

.akari-search-dock[data-variant="pill"] :deep(.akari-search-trigger:hover) {
  border-color: transparent;
}

/* A compact search FAB: the icon centers in a circle. */
.akari-search-dock[data-variant="icon"] :deep(.akari-search-trigger) {
  justify-content: center;
  gap: 0;
  padding-inline: 0;
  border-color: transparent;
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  box-shadow: var(--akari-doc-elevation-level3);
}

.akari-search-dock[data-variant="icon"] :deep(.akari-search-trigger:hover) {
  border-color: transparent;
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-primary) 88%,
    var(--md-sys-color-on-primary)
  );
  color: var(--md-sys-color-on-primary);
}

.akari-search-dock[data-variant="icon"] :deep(.akari-search-trigger__label) {
  flex: 0 0 0;
  max-width: 0;
  opacity: 0;
}

.akari-search-dock[data-variant="icon"] :deep(.akari-search-trigger__kbd) {
  min-inline-size: 0;
  max-inline-size: 0;
  padding-inline: 0;
  border-width: 0;
  opacity: 0;
}

/* When leaving, drop the floating elevation so the hand-off to the flat
   app-bar button has no shadow pop on the last frame. */
.akari-search-dock[data-leaving] :deep(.akari-search-trigger) {
  box-shadow: none;
}

/* A hero call to action: tall, tonal, roomy, with its shortcut hint. */
.akari-search-dock[data-variant="hero"] :deep(.akari-search-trigger) {
  gap: var(--md-sys-measurement-space150, 12px);
  padding-inline: var(--md-sys-measurement-space200, 16px);
  border-color: transparent;
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  box-shadow: var(--akari-doc-elevation-level3);
  font-size: 1rem;
}

.akari-search-dock[data-variant="hero"] :deep(.akari-search-trigger:hover) {
  border-color: transparent;
  background-color: color-mix(
    in srgb,
    var(--md-sys-color-secondary-container) 88%,
    var(--md-sys-color-on-secondary-container)
  );
  color: var(--md-sys-color-on-secondary-container);
}

.akari-search-dock[data-variant="hero"] :deep(.akari-search-trigger__kbd) {
  border-color: color-mix(
    in srgb,
    var(--md-sys-color-on-secondary-container) 38%,
    transparent
  );
  color: var(--md-sys-color-on-secondary-container);
}

.akari-search-dock[data-variant="hero"] :deep(.akari-search-trigger:focus-visible) {
  outline-color: var(--md-sys-color-on-secondary-container);
}

@media (max-width: 767px) {
  /*
   * The app bar collapses to its round icon below this width; a docked
   * copy stays a field, so it keeps its label and drops the key hint.
   */
  .akari-search-dock :deep(.akari-search-trigger) {
    width: 100%;
    height: 100%;
    gap: 8px;
    padding-inline: var(--md-sys-measurement-space150, 12px);
  }

  .akari-search-dock :deep(.akari-search-trigger__label) {
    opacity: 1;
  }

  .akari-search-dock :deep(.akari-search-trigger__kbd) {
    display: none;
  }

  .akari-search-dock[data-variant="icon"] :deep(.akari-search-trigger) {
    gap: 0;
    padding-inline: 0;
  }

  .akari-search-dock[data-variant="icon"] :deep(.akari-search-trigger__label) {
    max-width: 0;
    opacity: 0;
  }

  /*
   * On the way home the copy has to become the round bar button before it
   * lands: same 9px padding, no gap and no label. Otherwise the icon sits
   * 3px to the right in the last frames and jumps when the real button takes
   * over.
   */
  .akari-search-dock[data-leaving] :deep(.akari-search-trigger) {
    gap: 0;
    padding-inline: 9px;
  }

  .akari-search-dock[data-leaving] :deep(.akari-search-trigger__label) {
    flex: 0 0 0;
    max-width: 0;
    opacity: 0;
  }

  .akari-search-dock[data-leaving] :deep(.akari-search-trigger__kbd) {
    min-inline-size: 0;
    max-inline-size: 0;
    padding-inline: 0;
    border-width: 0;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .akari-search-dock,
  .akari-search-dock[data-flying],
  .akari-search-dock[data-leaving],
  .akari-search-dock[data-fading] {
    transition: none;
  }
}
</style>
