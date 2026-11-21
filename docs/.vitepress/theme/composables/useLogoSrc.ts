import { computed } from "vue";
import { withBase } from "vitepress";

import { useAkariConfig } from "./useAkariConfig";
import { useAkariColorScheme } from "./useColorScheme";

/** The app-bar logo for the scheme the reader is currently seeing. */
export function useLogoSrc() {
  const config = useAkariConfig();
  const { resolved } = useAkariColorScheme();

  return computed(() => {
    const brand = config.value.brand;
    const value =
      resolved.value === "dark"
        ? (brand.logoDark ?? brand.logo)
        : brand.logo;
    return value ? withBase(value) : "";
  });
}
