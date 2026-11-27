import type {
  AkariSearchDockAlign,
  AkariSearchDockAnchorOptions,
  AkariSearchDockVariant,
  ResolvedAkariSearchDockAnchorOptions,
} from "../types";

/** The natural box of each dock look, in CSS pixels. */
export const SEARCH_DOCK_BOX: Record<
  AkariSearchDockVariant,
  { width: number; height: number }
> = {
  bar: { width: 280, height: 40 },
  pill: { width: 240, height: 40 },
  icon: { width: 56, height: 56 },
  hero: { width: 420, height: 56 },
};

export const SEARCH_DOCK_VARIANTS: readonly AkariSearchDockVariant[] = [
  "bar",
  "pill",
  "icon",
  "hero",
];

export const SEARCH_DOCK_ALIGNS: readonly AkariSearchDockAlign[] = [
  "start",
  "center",
  "end",
];

function isVariant(value: unknown): value is AkariSearchDockVariant {
  return SEARCH_DOCK_VARIANTS.includes(value as AkariSearchDockVariant);
}

function isAlign(value: unknown): value is AkariSearchDockAlign {
  return SEARCH_DOCK_ALIGNS.includes(value as AkariSearchDockAlign);
}

function cssColor(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function elevationLevel(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const level = Math.round(value);
  return level >= 0 && level <= 5 ? level : undefined;
}

function cssLength(value: string | number | undefined): string | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? `${value}px` : undefined;
  }

  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

/** Fills in the defaults a `<SearchDock>` tag did not write. */
export function normalizeSearchDockAnchor(
  options: AkariSearchDockAnchorOptions | undefined,
): ResolvedAkariSearchDockAnchorOptions {
  const placeholder = options?.placeholder?.trim();
  return {
    placeholder: placeholder || undefined,
    variant: isVariant(options?.variant) ? options.variant : "bar",
    align: isAlign(options?.align) ? options.align : "start",
    immersive: options?.immersive === true,
    showShortcut: options?.showShortcut !== false,
    background: cssColor(options?.background),
    borderColor: cssColor(options?.borderColor),
    shadow: options?.shadow !== false,
    elevation: elevationLevel(options?.elevation),
    priority:
      typeof options?.priority === "number" && Number.isFinite(options.priority)
        ? options.priority
        : 0,
  };
}

/**
 * The CSS box a tag reserves. Width/height accept CSS lengths or pixel
 * numbers; without one, the variant's natural size is used.
 */
export function searchDockSize(
  variant: AkariSearchDockVariant,
  width?: string | number,
  height?: string | number,
  fill = false,
): { width: string; height: string } {
  const box = SEARCH_DOCK_BOX[variant];
  return {
    width: cssLength(width) ?? (fill ? "100%" : `${box.width}px`),
    height: cssLength(height) ?? (fill ? "100%" : `${box.height}px`),
  };
}

/** The `anchor-name` a landing box lends to the floating copy. */
export const SEARCH_DOCK_ANCHOR_NAME = "--akari-dock";

/**
 * Set on the landing box while the copy is parked on it. Only one tag holds
 * it at a time, so `anchor()` always has a single target to resolve.
 */
export const SEARCH_DOCK_ANCHOR_ATTR = "data-dock-anchor";

/**
 * Set on the floating copy while the layout engine owns its box. The flight
 * writes plain geometry inline, which would win over `anchor()`; the
 * attribute is only set once those are gone.
 */
export const SEARCH_DOCK_ANCHORED_ATTR = "data-dock-anchored";

let anchorSupport: boolean | null = null;

/**
 * Whether the engine can hold the copy on its landing box by itself. Anchor
 * positioning shipped in Chrome 125, Safari 26 and Firefox 147; where any of
 * the three pieces is missing the controller keeps writing the box every
 * frame, which is the old behaviour rather than a broken one.
 */
export function supportsSearchDockAnchor(): boolean {
  if (anchorSupport !== null) return anchorSupport;
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
    anchorSupport = false;
    return anchorSupport;
  }
  // All three shipped together, but a capability gate has to ask about the
  // exact functions the stylesheet uses — `anchor-name` alone proves nothing.
  anchorSupport =
    CSS.supports("anchor-name", SEARCH_DOCK_ANCHOR_NAME) &&
    CSS.supports("left", `anchor(${SEARCH_DOCK_ANCHOR_NAME} left)`) &&
    CSS.supports("width", `anchor-size(${SEARCH_DOCK_ANCHOR_NAME} width)`);
  return anchorSupport;
}

/** Forgets the cached answer; tests use it to exercise both branches. */
export function resetSearchDockAnchorSupport(): void {
  anchorSupport = null;
}

export interface SearchDockBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface SearchDockArea {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function intersects(a: SearchDockBounds, b: SearchDockArea): boolean {
  return (
    a.left < b.right &&
    a.left + a.width > b.left &&
    a.top < b.bottom &&
    a.top + a.height > b.top
  );
}

/**
 * A tag may only pull the trigger out of the app bar when its whole box is
 * inside the page and the viewport, and it does not sit under a sticky bar
 * or the page's tab shelf. Otherwise the trigger flies home and waits until
 * the tag has room again.
 */
export function searchDockHasRoom(
  rect: SearchDockBounds,
  viewport: { width: number; height: number },
  page: SearchDockArea | null,
  obstacles: readonly SearchDockArea[] = [],
  margin = 8,
): boolean {
  if (rect.width <= 0 || rect.height <= 0) return false;
  if (
    rect.left < margin ||
    rect.top < margin ||
    rect.left + rect.width > viewport.width - margin ||
    rect.top + rect.height > viewport.height - margin
  ) {
    return false;
  }

  if (
    page &&
    (rect.left < page.left ||
      rect.top < page.top ||
      rect.left + rect.width > page.right ||
      rect.top + rect.height > page.bottom)
  ) {
    return false;
  }

  return !obstacles.some((obstacle) => intersects(rect, obstacle));
}
