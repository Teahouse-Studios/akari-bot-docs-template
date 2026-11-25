import {
  inject,
  onMounted,
  provide,
  reactive,
  watch,
  type ComputedRef,
  type InjectionKey,
} from "vue";
import { useData } from "vitepress";

import { readStoredSettings, writeStoredSettings } from "../settings";
import type {
  AkariSettingsApi,
  AkariThemeSettings,
  ResolvedAkariThemeConfig,
  StorageLike,
} from "../types";

const settingsKey: InjectionKey<AkariSettingsApi> = Symbol("akari-settings");

function getStorage(): StorageLike | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    return window.localStorage ?? undefined;
  } catch {
    // Accessing localStorage can throw (sandboxed iframes, blocked storage).
    return undefined;
  }
}

export function provideAkariSettings(
  config: ComputedRef<ResolvedAkariThemeConfig>,
): AkariSettingsApi {
  // Stored values and their defaults are shared by every locale; only the
  // section list and headings follow the locale being read.
  const { defaults, persist, storageKey } = config.value.settings;
  const state = reactive<AkariThemeSettings>({ ...defaults });
  const { dir, lang } = useData();

  let hydrated = false;
  let storage: StorageLike | undefined;
  let pendingPersist = false;

  function applyDocumentSettings(): void {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    root.dir = state.direction === "auto" ? dir.value : state.direction;
    // Text laid out against its language's direction; see base.css.
    root.toggleAttribute("data-akari-dir-override", root.dir !== dir.value);
    root.style.fontSize = state.textSize;
  }

  function persistState(): void {
    pendingPersist = false;

    if (!hydrated || !persist) return;

    // writeStoredSettings swallows quota and availability errors on purpose.
    writeStoredSettings(storage, storageKey, { ...state });
  }

  function schedulePersist(): void {
    if (!hydrated || !persist || pendingPersist) return;

    pendingPersist = true;
    queueMicrotask(persistState);
  }

  function setSetting<K extends keyof AkariThemeSettings>(
    key: K,
    value: AkariThemeSettings[K],
  ): void {
    state[key] = value;
  }

  function reset(): void {
    Object.assign(state, defaults);
  }

  function isDefault(): boolean {
    return (Object.keys(state) as Array<keyof AkariThemeSettings>).every(
      (key) => state[key] === defaults[key],
    );
  }

  const api: AkariSettingsApi = {
    settings: state,
    get sections() {
      return config.value.settings.sections;
    },
    get labels() {
      return config.value.settings.labels;
    },
    defaults: { ...defaults },
    setSetting,
    reset,
    isDefault,
  };

  watch(state, schedulePersist, { deep: true, flush: "sync" });

  watch(
    () => [state.direction, state.textSize] as const,
    () => {
      if (hydrated) applyDocumentSettings();
    },
  );

  // VitePress rewrites <html dir> whenever the page's language changes,
  // even between two languages of the same direction, so this follows `lang`
  // as well; a direction the reader chose wins, `auto` keeps the language's.
  watch(
    [dir, lang],
    () => {
      if (hydrated) applyDocumentSettings();
    },
    { flush: "post" },
  );

  onMounted(() => {
    if (persist) {
      storage = getStorage();
      // Hydration only reads; the sync watcher above ignores this assignment
      // because `hydrated` is not set until the stored state has been applied.
      Object.assign(
        state,
        readStoredSettings(storage, storageKey, defaults),
      );
    }

    applyDocumentSettings();
    hydrated = true;
  });

  provide(settingsKey, api);
  return api;
}

export function useAkariSettings(): AkariSettingsApi {
  const api = inject(settingsKey);

  if (!api) {
    throw new Error(
      "[vitepress-akari-theme-docs] useAkariSettings() must be called inside AkariLayout.",
    );
  }

  return api;
}
