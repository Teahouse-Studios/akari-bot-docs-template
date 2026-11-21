/** An entry of a table of contents. */
export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * The headings a table of contents lists: h2 to h`maxDepth` with an id,
 * unless marked `m3e-toc-ignore`. The page title is the article's h1, so
 * entries start at h2.
 */
export function readTocHeadings(
  root: Element | null,
  maxDepth: number,
): { elements: HTMLElement[]; headings: TocHeading[] } {
  const selector = Array.from(
    { length: Math.max(0, maxDepth - 1) },
    (_, index) => `h${index + 2}[id]:not([m3e-toc-ignore])`,
  ).join(",");
  const elements =
    selector && root
      ? Array.from(root.querySelectorAll<HTMLElement>(selector))
      : [];
  return {
    elements,
    headings: elements.map((element) => ({
      id: element.id,
      text: (element.textContent ?? "").replace(/​/g, "").trim(),
      level: Number(element.tagName.slice(1)),
    })),
  };
}

/**
 * The section being read: the last heading past `line` (from the top of
 * the viewport). At the end of a scrolled page the last sections can no
 * longer reach the line; the lowest heading still on screen is then the
 * one being read.
 */
export function findActiveHeading(
  elements: readonly HTMLElement[],
  line: number,
): number {
  let index = 0;
  elements.forEach((element, position) => {
    if (element.getBoundingClientRect().top <= line) index = position;
  });

  const scrolling = document.scrollingElement ?? document.documentElement;
  const atBottom =
    window.scrollY > 0 &&
    Math.ceil(window.scrollY + window.innerHeight) >= scrolling.scrollHeight;
  if (atBottom) {
    elements.forEach((element, position) => {
      if (element.getBoundingClientRect().top < window.innerHeight) {
        index = Math.max(index, position);
      }
    });
  }
  return index;
}

/** Moves focus to a heading, making it focusable until it loses focus. */
export function focusHeading(heading: HTMLElement): void {
  if (!heading.hasAttribute("tabindex")) {
    heading.setAttribute("tabindex", "-1");
    heading.addEventListener(
      "blur",
      () => heading.removeAttribute("tabindex"),
      { once: true },
    );
  }
  heading.focus({ preventScroll: true });
}

// A scroll counts as over once no scroll event has come for this long.
const SCROLL_IDLE = 200;

/** The deepest heading a page asks for, from its frontmatter `outline`. */
export function resolveTocDepth(
  frontmatter: Record<string, unknown>,
  fallback: number,
): number {
  const outline = frontmatter.outline;
  if (outline === "deep") return 6;
  if (Array.isArray(outline)) {
    const depth = Number(outline[1]);
    if (Number.isInteger(depth)) return Math.min(6, Math.max(1, depth));
  }
  return fallback;
}

/**
 * Calls `settled` once the window's scroll comes to rest: on `scrollend`,
 * or, where that never comes, once scroll events stop for SCROLL_IDLE (from
 * the start, if the scroll never begins). A smooth scroll's length grows
 * with its distance, so no fixed delay will do. Returns a cancel function.
 */
export function onScrollSettled(settled: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  function done(): void {
    cancel();
    settled();
  }

  function onScroll(): void {
    clearTimeout(timer);
    timer = setTimeout(done, SCROLL_IDLE);
  }

  function cancel(): void {
    clearTimeout(timer);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("scrollend", done);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("scrollend", done, { once: true });
  timer = setTimeout(done, SCROLL_IDLE);
  return cancel;
}
