<script setup lang="ts">
/**
 * The page-level dock tag. Put it where the search field should land:
 *
 *     <SearchDock variant="hero" align="center" placeholder="Search" />
 *
 * The element itself is only a reserved box. The fixed copy of the app
 * bar's trigger is moved over it by `useSearchDock`.
 */
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import type {
  AkariSearchDockAlign,
  AkariSearchDockVariant,
} from "../../types";
import { searchDockSize } from "../dock";
import { useAkariSearchDock } from "../useSearchDock";

const props = withDefaults(
  defineProps<{
    /** Overrides `search.placeholder` while the field is docked here. */
    placeholder?: string;
    /** The look of the field: app-bar bar, tonal pill, FAB, or hero field. */
    variant?: AkariSearchDockVariant;
    /** Where the icon, label and shortcut hint sit inside the field. */
    align?: AkariSearchDockAlign;
    /** A CSS length or pixel number; defaults to the variant's width. */
    width?: string | number;
    /** A CSS length or pixel number; defaults to the variant's height. */
    height?: string | number;
    /**
     * Fill the parent box instead of reserving the variant's natural size.
     * `width` / `height` still override either axis.
     */
    fill?: boolean;
    /** Search inline in the dock instead of opening the search dialog. */
    immersive?: boolean;
    /** Show the keyboard shortcut hint. Defaults to true. */
    showShortcut?: boolean;
    /** CSS color of the field surface; defaults to the variant's tone. */
    background?: string;
    /** CSS color of the field border; defaults to the variant's rule. */
    borderColor?: string;
    /** Keep the elevation shadow (default) or remove it. */
    shadow?: boolean;
    /** MD3 elevation level, 0 to 5; 0 removes the shadow. */
    elevation?: number;
    /** Wins over other tags on the same page. */
    priority?: number;
  }>(),
  {
    variant: "bar",
    align: "start",
    priority: 0,
    fill: false,
    immersive: false,
    showShortcut: true,
    shadow: true,
  },
);

const dock = useAkariSearchDock();
const root = ref<HTMLElement | null>(null);
let unregister: (() => void) | null = null;

const style = computed(() => {
  // A 56px FAB cannot host an inline input; when immersive is on, open it
  // into a compact field unless the page set its own width.
  if (
    props.immersive &&
    props.variant === "icon" &&
    props.width === undefined &&
    !props.fill
  ) {
    return { width: "min(20rem, 100%)", height: "48px" };
  }

  return searchDockSize(props.variant, props.width, props.height, props.fill);
});

function options() {
  return {
    placeholder: props.placeholder,
    variant: props.variant,
    align: props.align,
    immersive: props.immersive,
    showShortcut: props.showShortcut,
    background: props.background,
    borderColor: props.borderColor,
    shadow: props.shadow,
    elevation: props.elevation,
    priority: props.priority,
  };
}

onMounted(() => {
  if (!root.value) return;
  unregister = dock.registerAnchor(root.value, options());
});

watch(
  () => [
    props.placeholder,
    props.variant,
    props.align,
    props.immersive,
    props.showShortcut,
    props.background,
    props.borderColor,
    props.shadow,
    props.elevation,
    props.priority,
    props.width,
    props.height,
  ],
  () => {
    if (root.value) dock.updateAnchor(root.value, options());
  },
  { flush: "post" },
);

onUnmounted(() => {
  unregister?.();
  unregister = null;
});
</script>

<template>
  <div
    ref="root"
    class="akari-search-dock-anchor"
    :data-variant="props.variant"
    :data-align="props.align"
    :style="style"
    aria-hidden="true"
  >
    <slot />
  </div>
</template>

<style scoped>
/*
 * The landing box lends its name to the floating copy while the trigger is
 * parked on it. The attribute is set by `useSearchDock`, never by the tag
 * itself, and only one tag holds it at a time — `anchor()` needs a single
 * target. Without anchor positioning the rule simply never resolves.
 */
@supports (anchor-name: --akari-dock) {
  .akari-search-dock-anchor[data-dock-anchor] {
    anchor-name: --akari-dock;
  }
}

.akari-search-dock-anchor {
  position: relative;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.875rem;
  line-height: 1.25;
  text-align: center;
  pointer-events: none;
  user-select: none;
}

.akari-search-dock-anchor[data-align="start"] {
  justify-items: start;
  text-align: start;
}

.akari-search-dock-anchor[data-align="end"] {
  justify-items: end;
  text-align: end;
}

.akari-search-dock-anchor[data-variant="icon"] {
  justify-items: center;
  text-align: center;
}
</style>
