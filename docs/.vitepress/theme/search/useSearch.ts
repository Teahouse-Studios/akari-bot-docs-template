import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from "vue";
import { useData, useRouter, withBase } from "vitepress";

import type {
  AkariSearchResult,
  ResolvedAkariThemeConfig,
} from "../types";
import { createSearchBackend, describeSearchError } from "./backends";
import type { AkariSearchBackend } from "./types";

export type AkariSearchTriggerRole = "home" | "dock";

export interface AkariSearchApi {
  isOpen: Ref<boolean>;
  query: Ref<string>;
  results: Ref<AkariSearchResult[]>;
  loading: Ref<boolean>;
  error: Readonly<Ref<string | null>>;
  activeIndex: Ref<number>;
  openSearch(): void;
  closeSearch(): void;
  finalizeClose(): void;
  setTrigger(element: HTMLElement | null, role?: AkariSearchTriggerRole): void;
  /** Chooses the trigger the dialog morphs from and returns to. */
  setActiveTrigger(role: AkariSearchTriggerRole): void;
  /**
   * The trigger in use (or the one for `role`), or the app bar's button
   * when a docked copy took over.
   */
  getTrigger(role?: AkariSearchTriggerRole): HTMLElement | null;
  getTriggerRect(): DOMRect | null;
  setQuery(value: string): void;
  retry(): void;
  handleInputKeydown(event: KeyboardEvent): void;
  selectResult(result: AkariSearchResult): void;
}

const searchKey: InjectionKey<AkariSearchApi> = Symbol("akari-search");

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function isExternalHref(href: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}

export function provideAkariSearch(
  config: ComputedRef<ResolvedAkariThemeConfig>,
): AkariSearchApi {
  const { site, lang, localeIndex } = useData();
  const router = useRouter();

  // Locales may configure their own backend. Each distinct configuration is
  // created once; the local one loads each locale's index once.
  const backends = new Map<string, AkariSearchBackend>();

  function currentBackend(): AkariSearchBackend {
    const backendConfig = config.value.search.backend;
    const key = JSON.stringify(backendConfig);
    let backend = backends.get(key);

    if (!backend) {
      backend = createSearchBackend(backendConfig, {
        base: site.value.base ?? "/",
      });
      backends.set(key, backend);
    }

    return backend;
  }

  const isOpen = ref(false);
  const query = ref("");
  const results = ref<AkariSearchResult[]>([]);
  const loading = ref(false);
  // Kept raw so the message follows the reader into another locale.
  const failure = ref<unknown>(null);
  const error = computed(() =>
    failure.value === null
      ? null
      : describeSearchError(failure.value, config.value.messages),
  );
  const activeIndex = ref(-1);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;
  let requestId = 0;
  let previousFocus: HTMLElement | null = null;
  // The app bar keeps its trigger as a layout placeholder; a page can dock
  // a second one. The dialog morphs from whichever is in use.
  const triggers: Record<AkariSearchTriggerRole, HTMLElement | null> = {
    home: null,
    dock: null,
  };
  let activeTrigger: AkariSearchTriggerRole = "home";

  function clearTimer(): void {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  }

  function abortRequest(): void {
    controller?.abort();
    controller = undefined;
    requestId += 1;
  }

  function resetResults(): void {
    results.value = [];
    activeIndex.value = -1;
    loading.value = false;
    failure.value = null;
  }

  async function search(value: string): Promise<void> {
    const trimmed = value.trim();
    if (!trimmed) {
      resetResults();
      return;
    }

    abortRequest();
    const currentRequest = ++requestId;
    const currentController = new AbortController();
    controller = currentController;

    loading.value = true;
    failure.value = null;

    try {
      const nextResults = await currentBackend().search(trimmed, {
        limit: config.value.search.maxResults,
        signal: currentController.signal,
        lang: lang.value,
        locale: localeIndex.value,
      });

      if (
        currentRequest !== requestId ||
        currentController.signal.aborted
      ) {
        return;
      }

      results.value = nextResults;
      activeIndex.value = nextResults.length ? 0 : -1;
    } catch (cause) {
      if (
        currentRequest !== requestId ||
        currentController.signal.aborted ||
        isAbortError(cause)
      ) {
        return;
      }

      results.value = [];
      activeIndex.value = -1;
      failure.value = cause;
    } finally {
      if (currentRequest === requestId) {
        loading.value = false;
      }
    }
  }

  function openSearch(): void {
    if (!config.value.search.enabled || isOpen.value) return;

    const active = document.activeElement;
    previousFocus =
      active instanceof HTMLElement &&
      active !== document.body &&
      !active.closest(".akari-search-dialog")
        ? active
        : null;
    query.value = "";
    resetResults();
    isOpen.value = true;
  }

  function closeSearch(): void {
    clearTimer();
    abortRequest();
    isOpen.value = false;
  }

  function finalizeClose(): void {
    clearTimer();
    abortRequest();
    isOpen.value = false;
    query.value = "";
    resetResults();
    const focusTarget = previousFocus?.isConnected
      ? previousFocus
      : getTrigger();
    focusTarget?.focus({ preventScroll: true });
    previousFocus = null;
  }

  function setTrigger(
    element: HTMLElement | null,
    role: AkariSearchTriggerRole = "home",
  ): void {
    triggers[role] = element;
  }

  function setActiveTrigger(role: AkariSearchTriggerRole): void {
    activeTrigger = role;
  }

  function getTrigger(role?: AkariSearchTriggerRole): HTMLElement | null {
    if (role) {
      const element = triggers[role];
      return element?.isConnected ? element : null;
    }

    const primary = triggers[activeTrigger];
    if (primary?.isConnected) return primary;

    const fallback = triggers[activeTrigger === "home" ? "dock" : "home"];
    if (fallback?.isConnected) return fallback;

    return document.querySelector<HTMLElement>(".akari-search-trigger");
  }

  function getTriggerRect(): DOMRect | null {
    return getTrigger()?.getBoundingClientRect() ?? null;
  }

  function setQuery(value: string): void {
    query.value = value;
  }

  function retry(): void {
    const value = query.value.trim();
    if (!value) return;

    clearTimer();
    void search(value);
  }

  function moveActive(delta: number): void {
    if (!results.value.length) return;

    const next = activeIndex.value + delta;
    activeIndex.value = Math.min(
      results.value.length - 1,
      Math.max(0, next < 0 ? results.value.length - 1 : next),
    );
  }

  function navigate(result: AkariSearchResult): void {
    if (isExternalHref(result.href)) {
      window.open(result.href, "_blank", "noopener,noreferrer");
      return;
    }

    void router.go(withBase(result.href));
  }

  function selectResult(result: AkariSearchResult): void {
    closeSearch();
    navigate(result);
  }

  function handleInputKeydown(event: KeyboardEvent): void {
    if (event.isComposing) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        if (results.value.length) {
          event.preventDefault();
          activeIndex.value = 0;
        }
        break;
      case "End":
        if (results.value.length) {
          event.preventDefault();
          activeIndex.value = results.value.length - 1;
        }
        break;
      case "Enter": {
        const result = results.value[activeIndex.value] ?? results.value[0];
        if (result) {
          event.preventDefault();
          selectResult(result);
        }
        break;
      }
      case "Escape":
        event.preventDefault();
        closeSearch();
        break;
    }
  }

  function handleGlobalShortcut(event: KeyboardEvent): void {
    const shortcut = config.value.search.shortcut;
    if (
      !config.value.search.enabled ||
      !shortcut ||
      event.defaultPrevented ||
      event.altKey ||
      event.shiftKey ||
      !(event.metaKey || event.ctrlKey) ||
      event.key.toLowerCase() !== shortcut
    ) {
      return;
    }

    event.preventDefault();
    if (!isOpen.value) openSearch();
  }

  watch(query, (value) => {
    clearTimer();

    if (!isOpen.value) return;

    if (!value.trim()) {
      abortRequest();
      resetResults();
      return;
    }

    const { debounce } = config.value.search;
    if (debounce <= 0) {
      void search(value);
      return;
    }

    timer = setTimeout(() => {
      timer = undefined;
      if (isOpen.value) void search(value);
    }, debounce);
  });

  onMounted(() => window.addEventListener("keydown", handleGlobalShortcut));
  onUnmounted(() => {
    window.removeEventListener("keydown", handleGlobalShortcut);
    clearTimer();
    abortRequest();
  });

  const api: AkariSearchApi = {
    isOpen,
    query,
    results,
    loading,
    error,
    activeIndex,
    openSearch,
    closeSearch,
    finalizeClose,
    setTrigger,
    setActiveTrigger,
    getTrigger,
    getTriggerRect,
    setQuery,
    retry,
    handleInputKeydown,
    selectResult,
  };

  provide(searchKey, api);
  return api;
}

export function useAkariSearch(): AkariSearchApi {
  const api = inject(searchKey);

  if (!api) {
    throw new Error(
      "[vitepress-akari-theme-docs] useAkariSearch() must be called inside AkariLayout.",
    );
  }

  return api;
}
