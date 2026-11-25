<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute } from "vitepress";

import { useNavGroupState } from "../../composables/useNavGroupState";
import { usePageHref } from "../../composables/usePageHref";
import { useSidebar } from "../../composables/useSidebar";
import { nextLayoutFrame, whenAkariReady } from "../../ready";
import { findFirstLink, isExternalLink } from "../../sidebar";
import type { AkariSidebarItem } from "../../types";

interface NavMenuItemElement extends HTMLElement {
  open: boolean;
  selected: boolean;
  updateComplete?: Promise<unknown>;
}

const props = defineProps<{
  item: AkariSidebarItem;
  // Only the first level of a menu carries icons, mirroring the rail.
  // Vue casts an absent boolean prop to `false`, so nested items stay
  // text-only without passing anything down.
  showIcon?: boolean;
  // The breadcrumb of enclosing groups, so sibling groups with the same
  // first page keep independent open state.
  parentKey?: string;
}>();

const { hasActive } = useSidebar();
const pageHref = usePageHref();
const route = useRoute();
const groupElement = ref<NavMenuItemElement | null>(null);
const leafElement = ref<NavMenuItemElement | null>(null);

const hasChildren = computed(() => (props.item.items?.length ?? 0) > 0);
const icon = computed(() =>
  props.showIcon ? (props.item.icon ?? "category") : undefined,
);
// A group's identity across the drawers' rebuilds: its name and first page.
const groupKey = computed(
  () => `${props.parentKey ?? ""}\n${props.item.text}\n${findFirstLink(props.item) ?? ""}`,
);
const groupState = useNavGroupState();
// Open when it holds the current page, then as the reader left it, then
// open when it is set to start open. Resolve to `undefined` instead of
// `false`: Vue's hydration path can write `open="false"` / `selected="false"`
// before the custom element upgrades, and Lit's Boolean converter treats any
// present attribute as true.
//
// Holding the current page is read from the route rather than written down:
// it opens the group on arrival and, once the reader moves on, lets the
// group fall back to its default instead of staying expanded for the rest
// of the session.
const open = computed(() => {
  if (hasActive(props.item)) return true;
  const left = groupState.get(groupKey.value);
  if (left !== undefined) return left ? true : undefined;
  return props.item.collapsed === false ? true : undefined;
});

// The theme opening or closing a group itself is not the reader's choice.
let applying = false;
// A group takes its first state — on page load, or when a drawer rebuilds
// its list on a category switch — at once; later changes, such as going to
// a page in it, animate.
let shown = false;
// A group taller than this changes state in a single step. Its height
// transition would drag thousands of pixels past the viewport in a quarter
// of a second — a smear of text — and it lays out every row on each frame,
// which is what reads as jank on a long list. The reader only ever sees the
// first screenful of such a group anyway.
const ANIMATE_MAX_HEIGHT = 600;

/** The laid-out height of a group's content, open or closed. */
function contentHeight(element: NavMenuItemElement): number {
  const collapsible = element.shadowRoot?.querySelector("m3e-collapsible");
  // A closed collapsible keeps `height: 0` but still reports its content's
  // scroll extent, so this is measurable before the change.
  return collapsible?.scrollHeight ?? 0;
}

/** The reader opened or closed the group. */
function remember(isOpen: boolean): void {
  if (!applying && hasChildren.value) groupState.set(groupKey.value, isOpen);
}

/**
 * Stop nested opening/closing events from reaching ancestor groups.
 *
 * These events bubble. A child sits in this group's shadow slot, so by the
 * time the event reaches the parent its target is retargeted to this host.
 * Stopping it here keeps the child's state change from closing its parent.
 */
function onGroupOpening(event: Event): void {
  event.stopPropagation();
  if (event.composedPath()[0] === groupElement.value) remember(true);
}

function onGroupClosing(event: Event): void {
  event.stopPropagation();
  if (event.composedPath()[0] === groupElement.value) remember(false);
}

async function setGroupOpen(
  element: NavMenuItemElement,
  value: boolean,
  instant = false,
): Promise<void> {
  applying = true;
  // Zero durations for the collapsible and the toggle arrow (base.css).
  if (instant) element.setAttribute("data-akari-instant", "");
  try {
    element.open = value;
    await element.updateComplete;
    if (instant) {
      const collapsible = element.shadowRoot?.querySelector<
        HTMLElement & { updateComplete?: Promise<unknown> }
      >("m3e-collapsible");
      await collapsible?.updateComplete;
      // The collapsible sizes itself to its content on the `transitionend`
      // that ends its opening, which a zero duration never fires. (Not m3e's
      // `noAnimate`: turning it back off replays the animation.)
      collapsible?.dispatchEvent(new Event("transitionend"));
    }
    await nextLayoutFrame();
  } finally {
    element.removeAttribute("data-akari-instant");
    applying = false;
  }
}
// A tab group is a single entry, selected on any of its pages.
const selected = computed(() =>
  !hasChildren.value && hasActive(props.item) ? true : undefined,
);
// An item that is already selected when it mounts (first render, a drawer
// list remounting on a category switch, a drawer leaving display: none)
// skips m3e's selection animation; it plays only when the selection moves
// to an item that is already on screen.
const settled = ref(!!selected.value);

watch(selected, (value) => {
  if (!value) settled.value = false;
});

// VitePress 2.x renders internal links as plain anchors and intercepts
// clicks globally (capture phase) to keep SPA navigation.
const internalHref = computed(() => {
  const link = findFirstLink(props.item);
  return link && !isExternalLink(link) ? pageHref(link) : undefined;
});

const externalLink = computed(() => {
  const link = findFirstLink(props.item);
  return link && isExternalLink(link) ? link : undefined;
});

async function applyGroupState(): Promise<void> {
  if (typeof window === "undefined" || !hasChildren.value) return;

  const element = groupElement.value;
  if (!element) return;

  await customElements.whenDefined("m3e-nav-menu-item");
  await customElements.whenDefined("m3e-collapsible");
  await whenAkariReady();
  await nextTick();
  await element.updateComplete;

  const animate = shown;
  shown = true;
  // A change waits for the list's layout, so it animates from the real size;
  // the first state is in place before the list is painted.
  if (animate) await nextLayoutFrame();

  const shouldOpen = !!open.value;
  // A long group changes state at once, animated or not.
  const instant = !animate || contentHeight(element) > ANIMATE_MAX_HEIGHT;

  if (shouldOpen) {
    if (!element.open) {
      await setGroupOpen(element, true, instant);
    } else {
      const collapsible =
        element.shadowRoot?.querySelector("m3e-collapsible");

      // The collapsible can stay at height 0 when `open` was set before its
      // slot children upgraded. Replaying the public property re-measures it.
      if (collapsible && collapsible.getBoundingClientRect().height === 0) {
        await setGroupOpen(element, false, instant);
        await setGroupOpen(element, true, instant);
      }
    }
  } else if (element.open) {
    await setGroupOpen(element, false, instant);
  }
}

async function applySelectedState(): Promise<void> {
  if (typeof window === "undefined" || hasChildren.value) return;

  const element = leafElement.value;
  if (!element) return;

  await customElements.whenDefined("m3e-nav-menu-item");
  await whenAkariReady();
  await nextTick();
  await nextLayoutFrame();

  // A nested item that upgrades already selected notifies its ancestor
  // groups before they know they have children; the menu then treats a
  // group as the selected leaf and clears the real one. Re-select it once
  // the tree has settled.
  if (selected.value && !element.selected) {
    element.selected = true;
  }
}

onMounted(() => {
  void applyGroupState();
  void applySelectedState();
});

watch(open, () => void applyGroupState(), { flush: "post" });
watch(
  () => route.path,
  () => {
    void applyGroupState();
    void applySelectedState();
  },
  { flush: "post" },
);
</script>

<template>
  <m3e-nav-menu-item
    v-if="hasChildren"
    ref="groupElement"
    @opening="onGroupOpening"
    @closing="onGroupClosing"
  >
    <m3e-icon v-if="icon" slot="icon" :name="icon"></m3e-icon>
    <span slot="label" class="akari-nav-label">{{ item.text }}</span>
    <m3e-badge v-if="item.badge" slot="badge">{{ item.badge }}</m3e-badge>
    <SidebarNavItem
      v-for="(child, index) in item.items"
      :key="child.link ?? `${child.text}-${index}`"
      :item="child"
      :parent-key="groupKey"
    />
  </m3e-nav-menu-item>

  <m3e-nav-menu-item
    v-else
    ref="leafElement"
    :selected="selected"
    :data-akari-settled="settled ? '' : undefined"
  >
    <m3e-icon v-if="icon" slot="icon" :name="icon"></m3e-icon>
    <a
      v-if="internalHref"
      slot="label"
      class="akari-nav-label"
      :href="internalHref"
      :aria-current="selected ? 'page' : undefined"
    >{{ item.text }}</a>
    <a
      v-else-if="externalLink"
      slot="label"
      class="akari-nav-label"
      :href="externalLink"
      target="_blank"
      rel="noreferrer"
    >{{ item.text }}</a>
    <span v-else slot="label" class="akari-nav-label">{{ item.text }}</span>
    <m3e-badge v-if="item.badge" slot="badge">{{ item.badge }}</m3e-badge>
  </m3e-nav-menu-item>
</template>

<style scoped>
/*
 * Long labels — a module's dotted path, say — take a second line at a
 * slightly smaller size instead of ending in an ellipsis after a dozen
 * characters. Two lines at this leading still fit the drawer's rows.
 */
.akari-nav-label {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  overflow-wrap: break-word;
  font-size: 0.8125rem;
  line-height: 1.3;
}
</style>
