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
}

/* Only the flight writes geometry, so only the flight gets the hint. */
.akari-search-dock[data-flying] {
  will-change: left, top, width, height;
}

.akari-search-dock[data-active] {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

/*
 * Two owners, one box. While the copy travels, the controller writes left/
 * top/width/height inline and the spring owns the frame. Once it lands, the
 * tag lends its `anchor-name` and the layout engine holds the box there —
 * a scroll then moves the copy at the engine's speed, not at the speed of
 * the main thread's next rAF callback.
 */
@supports (anchor-name: --akari-dock) and (left: anchor(--akari-dock left)) {
  .akari-search-dock[data-dock-anchored] {
    /*
     * `absolute`, not `fixed`. A fixed box is laid out against the viewport,
     * and Chrome does not re-resolve its `anchor()` when only the scroll
     * offset changes — the copy stays where the tag was last seen. An
     * absolute box lives in document space next to the tag, so the two can
     * only drift when the tag itself moves, and then the engine follows it.
     */
    position: absolute;
    left: anchor(--akari-dock left);
    top: anchor(--akari-dock top);
    width: anchor-size(--akari-dock width);
    height: anchor-size(--akari-dock height);
  }
}


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
    max-width var(--md-sys-motion-spring-slow-effects, 300ms cubic-bezier(0.34, 0.88, 0.34, 1)),
    flex-grow var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1));
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

/*
 * `align` places the icon + label + shortcut group. It is done with two
 * zero-basis spacers instead of `justify-content`, which cannot be
 * animated: switching it would slide the group across in a single frame,
 * at the very moment the copy takes off from the app bar. `flex-grow` is a
 * number, so the group travels to its place during the flight instead.
 *
 * The immersive field borrows the trigger's class but not this geometry:
 * it holds an input, which has to keep its whole box, so the spacers would
 * simply eat into the text area. There `align` only moves the placeholder,
 * through the mirror below.
 */
/* The row's gap, mirrored so the spacers below can cancel their own. */
.akari-search-dock :deep(.akari-search-trigger) {
  --_dock-gap: 8px;
}

.akari-search-dock[data-variant="icon"] :deep(.akari-search-trigger) {
  --_dock-gap: 0px;
}

.akari-search-dock :deep(.akari-search-trigger:not(.akari-search-field))::before,
.akari-search-dock :deep(.akari-search-trigger:not(.akari-search-field))::after {
  content: "";
  flex: 0 1 0;
  min-inline-size: 0;
  /*
   * Two flex items instead of none means two extra gaps in the row; the
   * negative margin takes them back, so the content group sits exactly
   * where it does in the app bar's own button. Handing the box back at the
   * end of the flight is then pixel-identical, not just close.
   */
  margin-inline: calc(-0.5 * var(--_dock-gap));
  transition: flex-grow
    var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1));
}

.akari-search-dock[data-align="center"]
  :deep(.akari-search-trigger:not(.akari-search-field))::before,
.akari-search-dock[data-align="center"]
  :deep(.akari-search-trigger:not(.akari-search-field))::after,
.akari-search-dock[data-variant="icon"]
  :deep(.akari-search-trigger:not(.akari-search-field))::before,
.akari-search-dock[data-variant="icon"]
  :deep(.akari-search-trigger:not(.akari-search-field))::after {
  flex-grow: 1;
}

.akari-search-dock[data-align="end"]
  :deep(.akari-search-trigger:not(.akari-search-field))::before {
  flex-grow: 1;
}

/*
 * The immersive field's placeholder follows the same `align`, but through
 * the field's mirror: `left` and `transform` interpolate, and `left: 50%`
 * re-resolves against the box every frame, so the text keeps drifting
 * towards the middle while the copy grows instead of snapping once parked.
 */
.akari-search-dock[data-align="center"] :deep(.akari-search-field__mirror) {
  left: 50%;
  transform: translateX(-50%);
}

.akari-search-dock[data-align="end"] :deep(.akari-search-field__mirror) {
  left: 100%;
  transform: translateX(-100%);
}

/*
 * No entrance animation: the field is born at the width of the button it
 * replaced and grows with the flight, so `left: 50%` starts at zero and
 * walks to the middle on its own — the entrance is the layout, not a
 * timeline. An extra animation would outlive the flight (500ms spring
 * against a 300ms flight) and keep sliding the text inside a box that had
 * already parked, which reads as the placeholder stuttering to a stop.
 */

/*
 * The label fills the row when it starts, and keeps its own width when the
 * group is centered. That difference is one number (`flex-grow`), so it can
 * be eased with the flight; swapping the `flex` shorthand would instead
 * snap the text's width, and the shortcut after it, in a single frame.
 */
.akari-search-dock :deep(.akari-search-trigger__label) {
  transition:
    flex-grow var(--md-sys-motion-spring-default-spatial, 500ms cubic-bezier(0.27, 1.06, 0.18, 1)),
    opacity var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1)),
    max-width var(--md-sys-motion-spring-default-effects, 200ms cubic-bezier(0.34, 0.8, 0.34, 1));
}

/*
 * Centered and ended groups keep the label at its own width; only the
 * spacers above move it. The label keeps the start alignment it has in the
 * app bar on purpose: `text-align` cannot be animated, so switching it here
 * would throw the text sideways for one frame while the label is still
 * wider than the words. At rest both alignments put the words in the same
 * place, since the label is exactly as wide as its text.
 */
.akari-search-dock[data-align="center"] :deep(.akari-search-trigger__label),
.akari-search-dock[data-align="end"] :deep(.akari-search-trigger__label) {
  flex-grow: 0;
}

/*
 * While the box itself is being written frame by frame, the row must not also
 * animate its own distribution: `flex-grow` resolves against a width that is
 * changing on the very same frame, so a growing label and a growing box
 * multiply, and the label balloons and then shrinks back. Freeze the
 * distribution at its target and let the growing box reveal it.
 */
.akari-search-dock[data-flying] :deep(.akari-search-trigger__label),
.akari-search-dock[data-flying] :deep(.akari-search-trigger__kbd),
.akari-search-dock[data-flying] :deep(.akari-search-trigger__label)::before,
.akari-search-dock[data-flying] :deep(.akari-search-trigger)::before,
.akari-search-dock[data-flying] :deep(.akari-search-trigger)::after,
.akari-search-dock[data-flying] :deep(.akari-search-field__mirror) {
  transition: none;
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

/*
 * The placeholder is drawn by the mirror, so the input's own alignment is
 * free: it decides where typed text and the caret live. Left start-aligned
 * it would drop the query to the leading edge the moment the first
 * character lands, which reads as a jump — the mirror's slide is useless if
 * the text it hands over to ends up on the other side of the pill.
 */
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
    /* The round bar button's own inset: the copy has to match it at both ends
       of the flight, or the icon is 3px off when the button takes over. */
    padding-inline: 9px;
  }

  /*
   * No parked inset of its own: the variant already names one (12 for the
   * field shapes, 16 for the hero, 0 for the icon), and the base 9px is only
   * the round button's. Re-declaring it here would start a second padding
   * transition on the landing frame, so the contents kept sliding after the
   * box had already parked.
   */

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
    /* The row has no gaps left to pay for, so the spacers' negative
       margins would pull the group 8px off the round button's icon. */
    --_dock-gap: 0px;
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
