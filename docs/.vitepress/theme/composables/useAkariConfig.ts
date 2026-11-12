import {
  computed,
  inject,
  provide,
  type App,
  type Component,
  type ComputedRef,
  type InjectionKey,
} from "vue";
import { useData } from "vitepress";

import { resolveAkariConfig } from "../config";
import type { AkariComponentSlot, ResolvedAkariThemeConfig } from "../types";

type AkariComponents = Partial<Record<AkariComponentSlot, Component>>;

const akariConfigKey: InjectionKey<ComputedRef<ResolvedAkariThemeConfig>> =
  Symbol("akari-config");
const akariComponentsKey: InjectionKey<AkariComponents> = Symbol("akari-components");

/**
 * Replaces parts of the layout with the site's own components. Called from
 * the theme's `enhanceApp`: config files hold data only, so components are
 * handed over here, and win over any `components` in the theme config.
 */
export function provideAkariComponents(
  app: App,
  components: AkariComponents,
): void {
  app.provide(akariComponentsKey, components);
}

export function provideAkariConfig(): ComputedRef<ResolvedAkariThemeConfig> {
  const { theme, site, lang } = useData();
  const own = inject(akariComponentsKey, {});
  const config = computed(() => {
    const resolved = resolveAkariConfig(theme.value, {
      title: site.value.title,
      lang: lang.value,
    });
    return { ...resolved, components: { ...resolved.components, ...own } };
  });

  provide(akariConfigKey, config);
  return config;
}

/**
 * Same as `useAkariConfig`, for components that may render outside the layout,
 * such as a page rendered on its own in a test.
 */
export function useOptionalAkariConfig(): ComputedRef<ResolvedAkariThemeConfig> | null {
  return inject(akariConfigKey, null);
}

export function useAkariConfig(): ComputedRef<ResolvedAkariThemeConfig> {
  const config = inject(akariConfigKey);

  if (!config) {
    throw new Error(
      "[vitepress-akari-theme-docs] useAkariConfig() must be called inside AkariLayout.",
    );
  }

  return config;
}
