<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

import { useAkariSearchDock } from "../useSearchDock";
import SearchDockField from "./SearchDockField.vue";
import SearchTrigger from "./SearchTrigger.vue";

const dock = useAkariSearchDock();
const root = ref<HTMLElement | null>(null);

const surface = computed(() => {
  const style: Record<string, string> = {};
  if (dock.background.value) {
    style["--akari-search-dock-background"] = dock.background.value;
  }
  if (dock.borderColor.value) {
    style["--akari-search-dock-border"] = dock.borderColor.value;
  }
  return style;
});

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
    :data-immersive="dock.immersive.value ? '' : undefined"
    :data-custom-background="dock.background.value ? '' : undefined"
    :data-custom-border="dock.borderColor.value ? '' : undefined"
    :data-shadow="dock.shadow.value ? undefined : 'off'"
    :data-elevation="
      dock.elevation.value === null ? undefined : String(dock.elevation.value)
    "
    :style="surface"
    :inert="!dock.active.value || dock.leaving.value"
    :aria-hidden="!dock.active.value || dock.leaving.value"
  >
    <SearchDockField v-if="dock.active.value && dock.immersive.value" />
    <SearchTrigger
      v-else
      role="dock"
      :placeholder="dock.placeholder.value ?? undefined"
      :show-shortcut="dock.showShortcut.value"
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
  /* Above the top bar (12) and the fade cap (10) while it flies. */
  z-index: 13;
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

/*
 * Immersive icon docks are fields, not FABs: the anchor widens so the input
 * has room, and the surface falls back to the quiet app-bar field.
 */
.akari-search-dock[data-immersive][data-variant="icon"] :deep(.akari-search-field) {
  justify-content: flex-start;
  gap: 8px;
  padding-inline: var(--md-sys-measurement-space150, 12px);
  border-color: var(--md-sys-color-outline-variant);
  background-color: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface-variant);
  box-shadow: var(--akari-doc-elevation-level2);
}

.akari-search-dock[data-immersive][data-variant="icon"] :deep(.akari-search-field:hover) {
  border-color: var(--md-sys-color-outline);
  background-color: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface);
}

.akari-search-dock[data-immersive][data-variant="icon"] :deep(.akari-search-field:focus-within) {
  border-color: var(--md-sys-color-primary);
  background-color: var(--md-sys-color-surface-container-highest);
  color: var(--md-sys-color-on-surface);
}

/* Match the compact variants: only bar and hero keep the shortcut hint. */
.akari-search-dock[data-variant="pill"] :deep(.akari-search-field__kbd),
.akari-search-dock[data-variant="icon"] :deep(.akari-search-field__kbd) {
  display: none;
}

.akari-search-dock[data-align="center"] :deep(.akari-search-field__input) {
  text-align: center;
}

.akari-search-dock[data-align="end"] :deep(.akari-search-field__input) {
  text-align: end;
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

/* Per-tag surface overrides. The attributes are only present when the
   page set the matching prop, so the variant defaults above still apply. */
.akari-search-dock[data-custom-background]:not([data-leaving])
  :deep(.akari-search-trigger),
.akari-search-dock[data-custom-background]:not([data-leaving])
  :deep(.akari-search-trigger:hover),
.akari-search-dock[data-custom-background]:not([data-leaving])
  :deep(.akari-search-trigger:focus-within) {
  background-color: var(--akari-search-dock-background);
}

.akari-search-dock[data-custom-border]:not([data-leaving])
  :deep(.akari-search-trigger),
.akari-search-dock[data-custom-border]:not([data-leaving])
  :deep(.akari-search-trigger:hover),
.akari-search-dock[data-custom-border]:not([data-leaving])
  :deep(.akari-search-trigger:focus-within) {
  border-color: var(--akari-search-dock-border);
}

.akari-search-dock[data-elevation="0"]:not([data-leaving])
  :deep(.akari-search-trigger) {
  box-shadow: none;
}

.akari-search-dock[data-elevation="1"]:not([data-leaving])
  :deep(.akari-search-trigger) {
  box-shadow: var(--akari-doc-elevation-level1);
}

.akari-search-dock[data-elevation="2"]:not([data-leaving])
  :deep(.akari-search-trigger) {
  box-shadow: var(--akari-doc-elevation-level2);
}

.akari-search-dock[data-elevation="3"]:not([data-leaving])
  :deep(.akari-search-trigger) {
  box-shadow: var(--akari-doc-elevation-level3);
}

.akari-search-dock[data-elevation="4"]:not([data-leaving])
  :deep(.akari-search-trigger) {
  box-shadow: var(--akari-doc-elevation-level4);
}

.akari-search-dock[data-elevation="5"]:not([data-leaving])
  :deep(.akari-search-trigger) {
  box-shadow: var(--akari-doc-elevation-level5);
}

.akari-search-dock[data-shadow="off"]:not([data-leaving])
  :deep(.akari-search-trigger) {
  box-shadow: none;
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
