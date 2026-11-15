import type { Router } from "vitepress";

/** A path VitePress serves as a page: an `.html` file or no extension. */
export function isPagePath(pathname: string): boolean {
  const name = pathname.slice(pathname.lastIndexOf("/") + 1);
  return !name.includes(".") || /\.html?$/i.test(name);
}

/**
 * Routes the links m3e components follow. A component with an `href`
 * (m3e-button, m3e-card, chips, list items and the like) follows it by
 * clicking a temporary anchor it adds to the page, and copies its own
 * `target` onto that anchor even when it has none, as an empty attribute.
 * VitePress leaves every anchor with a `target` to the browser, so the page
 * would load in full. An empty target opens in the same tab, so such an
 * anchor to a page of the site is routed as VitePress routes plain links.
 * An author's `target="_self"`, VitePress's way to ask for a full load, is
 * left alone.
 *
 * Registered after VitePress's own listener (from `enhanceApp`): a link it
 * has routed arrives here already handled.
 */
export function routeComponentLinks(router: Router): void {
  window.addEventListener(
    "click",
    (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.metaKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const link = event.target.closest("a");
      if (
        !link ||
        link.getAttribute("target") !== "" ||
        link.hasAttribute("download") ||
        link.closest(".vp-raw")
      ) {
        return;
      }

      const href = link.getAttribute("href");
      if (href === null) return;
      const url = new URL(href, link.baseURI);
      if (url.origin !== location.origin || !isPagePath(url.pathname)) return;

      event.preventDefault();
      void router.go(url.href);
    },
    { capture: true },
  );
}
