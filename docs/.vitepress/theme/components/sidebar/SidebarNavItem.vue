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
  () => `${props.item.text}\n${findFirstLink(props.item) ?? ""}`,
);
const groupState = useNavGroupState();
// As the reader left it; else open when it holds the current page or is
// set to start open. Resolve to `undefined` instead of `false`: Vue's
// hydration path can write `open="false"` / `selected="false"` before the
// custom element upgrades, and Lit's Boolean converter treats any present
// attribute as true.
const open = computed(() => {
  const left = groupState.get(groupKey.value);
  if (left !== undefined) return left ? true : undefined;
  return hasActive(props.item) || props.item.collapsed === false
    ? true
    : undefined;
});
// Going to a page in a group opens it, however it was left.
watch(
  () => hasChildren.value && hasActive(props.item),
  (active) => {
    if (active) groupState.set(groupKey.value, true);
  },
  { immediate: true },
);

// The theme opening or closing a group itself is not the reader's choice.
let applying = false;

/** The reader opened or closed the group. */
function remember(isOpen: boolean): void {
  if (!applying && hasChildren.value) groupState.set(groupKey.value, isOpen);
}

async function setGroupOpen(
  element: NavMenuItemElement,
  value: boolean,
): Promise<void> {
  applying = true;
  try {
    element.open = value;
    await element.updateComplete;
    await nextLayoutFrame();
  } finally {
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
  await nextLayoutFrame();

  const shouldOpen = !!open.value;

  if (shouldOpen) {
    if (!element.open) {
      await setGroupOpen(element, true);
    } else {
      const collapsible =
        element.shadowRoot?.querySelector("m3e-collapsible");

      // The collapsible can stay at height 0 when `open` was set before its
      // slot children upgraded. Replaying the public property re-measures it.
      if (collapsible && collapsible.getBoundingClientRect().height === 0) {
        await setGroupOpen(element, false);
        await setGroupOpen(element, true);
      }
    }
  } else if (element.open) {
    await setGroupOpen(element, false);
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
    @opening.self="remember(true)"
    @closing.self="remember(false)"
  >
    <m3e-icon v-if="icon" slot="icon" :name="icon"></m3e-icon>
    <span slot="label" class="akari-nav-label">{{ item.text }}</span>
    <m3e-badge v-if="item.badge" slot="badge">{{ item.badge }}</m3e-badge>
    <SidebarNavItem
      v-for="(child, index) in item.items"
      :key="child.link ?? `${child.text}-${index}`"
      :item="child"
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
.akari-nav-label {
  display: block;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
