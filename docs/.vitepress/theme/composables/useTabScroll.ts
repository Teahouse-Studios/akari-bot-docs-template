import { nextTick, onMounted, onUnmounted, watch, type Ref } from "vue";

/**
 * The tabs' own width: each tab's text and padding. The bar scrolls only
 * when they do not fit; anything else that sticks out for a moment (the
 * indicator's spring passing the last tab) must not make it scroll.
 */
function contentWidth(nav: HTMLElement): number {
  const range = document.createRange();
  let width = 0;
  const tabs = nav.querySelectorAll<HTMLElement>(".akari-page-tabs__tab");
  for (const tab of tabs) {
    range.selectNodeContents(tab);
    const style = getComputedStyle(tab);
    width +=
      range.getBoundingClientRect().width +
      Number.parseFloat(style.paddingLeft) +
      Number.parseFloat(style.paddingRight);
  }
  return width;
}

/**
 * Lets a tab bar too narrow for all its tabs scroll sideways
 * (`data-scrolls`), and keeps the current tab in view there. It scrolls the
 * bar as little as it takes to show the current tab whole: when the bar
 * first shows, when its tabs change (another group), when the current tab
 * changes, and when the bar's width does. Once the reader scrolls the bar
 * themselves (wheel, scrollbar, touch, keys), it leaves the bar alone until
 * the group or the current tab changes.
 *
 * `group` is the tab group of the page: moving to another article swaps the
 * tabs under the same bar, without the bar being mounted again or changing
 * width, so neither the mount nor the observer below would notice. The bar
 * would then keep the `data-scrolls` of the page it was on — no scrollbar
 * and no sideways scrolling on a page whose tabs run past its edge, until a
 * reload. A tab of the same group keeps it (and glides, see `current`).
 */
export function useTabScroll(
  bar: Ref<HTMLElement | null>,
  current: () => number,
  group: () => unknown,
): void {
  let touched = false;
  let observer: ResizeObserver | undefined;

  function fit(): void {
    const nav = bar.value;
    if (!nav) return;
    nav.toggleAttribute(
      "data-scrolls",
      contentWidth(nav) > nav.clientWidth + 0.5,
    );
  }

  function reveal(smooth: boolean): void {
    const nav = bar.value;
    if (!nav || touched || !nav.hasAttribute("data-scrolls")) return;
    const tab = nav.querySelectorAll<HTMLElement>(".akari-page-tabs__tab")[
      current()
    ];
    if (!tab) return;

    // In screen terms, so it holds for either writing direction.
    const box = nav.getBoundingClientRect();
    const rect = tab.getBoundingClientRect();
    const delta =
      rect.left < box.left
        ? rect.left - box.left
        : rect.right > box.right
          ? rect.right - box.right
          : 0;
    if (Math.abs(delta) < 0.5) return;
    nav.scrollBy({ left: delta, behavior: smooth ? "smooth" : "instant" });
  }

  function onTouched(): void {
    touched = true;
  }

  const scrollKeys = ["ArrowLeft", "ArrowRight", "Home", "End"];

  function onKey(event: KeyboardEvent): void {
    if (scrollKeys.includes(event.key)) touched = true;
  }

  const events = ["wheel", "pointerdown", "touchstart"] as const;

  watch(
    bar,
    (nav, previous) => {
      for (const name of events) previous?.removeEventListener(name, onTouched);
      previous?.removeEventListener("keydown", onKey);
      observer?.disconnect();
      if (!nav) return;
      for (const name of events) {
        nav.addEventListener(name, onTouched, { passive: true });
      }
      nav.addEventListener("keydown", onKey);
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => {
          fit();
          reveal(false);
        });
        observer.observe(nav);
      }
      void nextTick(() => {
        fit();
        reveal(false);
      });
    },
    { flush: "post" },
  );

  watch(
    current,
    () => {
      touched = false;
      reveal(true);
    },
    { flush: "post" },
  );

  watch(
    group,
    () => {
      // Another group: fit its tabs, and show its current one from the start.
      touched = false;
      void nextTick(() => {
        fit();
        reveal(false);
      });
    },
    { flush: "post" },
  );

  function onFontsLoaded(): void {
    fit();
    reveal(false);
  }

  onMounted(() => {
    fit();
    reveal(false);
    document.fonts?.addEventListener("loadingdone", onFontsLoaded);
  });

  onUnmounted(() => {
    observer?.disconnect();
    document.fonts?.removeEventListener("loadingdone", onFontsLoaded);
    const nav = bar.value;
    for (const name of events) nav?.removeEventListener(name, onTouched);
    nav?.removeEventListener("keydown", onKey);
  });
}
