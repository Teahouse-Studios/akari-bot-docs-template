import { computed } from "vue";

import { useAkariConfig } from "./useAkariConfig";
import type { AkariBrandConfig } from "../types";

/** Brand slots a page or a custom component can render. */
export type AkariBrandSlot = keyof AkariBrandConfig;

/**
 * Read a brand slot from `themeConfig.akari.brand`.
 *
 * The URL is returned as written: callers pass site paths through
 * `withBase()` when they render them. `fallback` is used when the slot is
 * empty, so a component still has a usable image without a brand extension.
 */
export function useBrandAsset(slot: AkariBrandSlot, fallback = "") {
  const config = useAkariConfig();
  return computed(() => config.value.brand?.[slot] || fallback);
}
