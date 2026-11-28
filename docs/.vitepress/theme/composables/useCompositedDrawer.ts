import { onBeforeUnmount, watch, type Ref } from "vue";

/**
 * `@m3e/web` slides a drawer by animating `margin`, which is a layout property:
 * every frame of the animation restyles and re-lays out the drawer's whole
 * subtree. With a long menu that is the whole sidebar, so the close animation
 * (which the menu starts 300ms after a link is tapped, right as the next page
 * renders) drops frames in proportion to how many items the menu holds.
 *
 * Swapping the rule for a composited `transform` takes the slide off the main
 * thread: the drawer keeps moving while the page paints behind it.
 *
 * The rule lives in the container's shadow root with its own selector, so it
 * cannot be reached with a custom property from the page's stylesheet.
 */
const STYLES = `
.start {
  transition:
    transform var(--md-sys-motion-duration-medium4, 400ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
    visibility var(--md-sys-motion-duration-medium4, 400ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)) allow-discrete,
    background-color var(--md-sys-motion-duration-medium4, 400ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
    box-shadow var(--md-sys-motion-duration-medium4, 400ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)) !important;
}

:host([start]) .start {
  margin-right: 0 !important;
  margin-left: 0 !important;
  transform: translateX(0);
}

:host(:not([start])) .start {
  margin-right: 0 !important;
  margin-left: 0 !important;
  transform: translateX(-100%);
}

:host(:not([start]):state(--rtl)) .start {
  transform: translateX(100%);
}
`;

/**
 * Patches the mobile navigation's drawer container so its slide runs on the
 * compositor instead of through `margin`.
 */
export function useCompositedDrawer(drawer: Ref<HTMLElement | null>): void {
  let detach: (() => void) | null = null;

  watch(
    drawer,
    (element) => {
      detach?.();
      detach = null;
      if (!element) return;

      let cancelled = false;

      const patch = (attempt: number): void => {
        if (cancelled) return;
        const root = element.shadowRoot;
        if (!root) {
          // The element upgrades a moment after Vue mounts it.
          if (attempt < 10) window.setTimeout(() => patch(attempt + 1), 16);
          return;
        }

        // The component installs its styles as an adopted sheet, so a later
        // sheet is the only thing that reliably outranks it.
        if ("adoptedStyleSheets" in root) {
          const sheet = new CSSStyleSheet();
          sheet.replaceSync(STYLES);
          root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
          if (import.meta.env.DEV && !root.querySelector(".start")) {
            console.warn(
              "[akari] the drawer container has no .start element; the composited slide is a no-op. Re-check @m3e/web's markup.",
            );
          }
          detach = () => {
            cancelled = true;
            root.adoptedStyleSheets = root.adoptedStyleSheets.filter(
              (item) => item !== sheet,
            );
          };
          return;
        }

        // Engines without constructable stylesheets take a plain <style>; the
        // cast keeps the branch typed, since the narrowing above leaves the
        // shadow root as `never` in the else path.
        const fallback: ShadowRoot = root;
        const style = document.createElement("style");
        style.id = "akari-drawer-slide";
        style.textContent = STYLES;
        fallback.append(style);
        detach = () => {
          cancelled = true;
          style.remove();
        };
      };

      void customElements
        .whenDefined("m3e-drawer-container")
        .then(() => patch(0))
        .catch(() => undefined);
    },
    { immediate: true, flush: "post" },
  );

  onBeforeUnmount(() => {
    detach?.();
    detach = null;
  });
}
