import {
  computed,
  inject,
  provide,
  watch,
  type ComputedRef,
  type InjectionKey,
} from "vue";
import { useData, useRoute } from "vitepress";

import { collectActiveItems, hasActiveItem } from "../sidebar";
import type { AkariSidebarItem } from "../types";

/**
 * Whether an item holds the current page — itself, or through its children,
 * which is how the groups above the page being read know to open.
 */
export interface ActiveNav {
  has(item: AkariSidebarItem): boolean;
}

const activeNavKey: InjectionKey<ActiveNav> = Symbol("akari-active-nav");

/**
 * Answer `ActiveNav.has` for a whole list from one walk of its tree.
 *
 * Without it each item walks its own subtree, and on every route change:
 * a list of a thousand rows pays a thousand walks. The set is rebuilt when
 * the page changes, which is also when an answer can change.
 */
export function provideActiveNav(
  items: ComputedRef<AkariSidebarItem[]>,
): void {
  const route = useRoute();
  const { site } = useData();
  const base = computed(() => site.value.base ?? "/");
  const active = computed(() =>
    collectActiveItems(items.value, route.path, base.value),
  );

  provide(activeNavKey, {
    has: (item) => active.value.has(item),
  });

  if (import.meta.env.DEV) {
    // The set and the list must be the same objects; if a list is ever
    // handed a copy, groups would silently stop opening over the page being
    // read. Look at a few misses rather than walking every subtree.
    watch(
      active,
      () => {
        let checked = 0;

        const mismatched = (list: AkariSidebarItem[]): boolean => {
          for (const item of list) {
            if (active.value.has(item)) continue;
            if (
              item.items?.length &&
              hasActiveItem(item, route.path, base.value)
            ) {
              return true;
            }
            if (checked++ < 5 && item.items && mismatched(item.items)) {
              return true;
            }
          }
          return false;
        };

        if (mismatched(items.value)) {
          console.warn(
            "[akari] a sidebar item holding the current page is missing " +
              "from the active set: the list was rendered from another " +
              "tree than the one it was built for",
          );
        }
      },
      { immediate: true },
    );
  }
}

export function useActiveNav(): ActiveNav {
  const provided = inject(activeNavKey, null);

  if (provided) return provided;

  // A site that renders the items from its own sidebar component never calls
  // `provideActiveNav`, so fall back to the per-item walk. Same answer, the
  // cost the list paid before the shared set existed.
  const route = useRoute();
  const { site } = useData();
  const base = computed(() => site.value.base ?? "/");

  return {
    has: (item) => hasActiveItem(item, route.path, base.value),
  };
}
