import {
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  readonly,
  ref,
  watch,
  type InjectionKey,
  type Ref,
} from "vue";
import { onContentUpdated, useRoute, useRouter } from "vitepress";

import type {
  AkariSearchDockAlign,
  AkariSearchDockAnchorOptions,
  AkariSearchDockVariant,
  ResolvedAkariSearchDockAnchorOptions,
} from "../types";
import { parseEasing } from "../tween";
import { prefersReducedMotion } from "./animation";
import {
  normalizeSearchDockAnchor,
  searchDockHasRoom,
  SEARCH_DOCK_ANCHOR_ATTR,
  SEARCH_DOCK_ANCHORED_ATTR,
  supportsSearchDockAnchor,
} from "./dock";
import type { AkariSearchApi } from "./useSearch";

export interface AkariSearchDockApi {
  /** Whether the trigger currently lives outside the app bar. */
  active: Readonly<Ref<boolean>>;
  /** The look the current `<SearchDock>` tag asked for. */
  variant: Readonly<Ref<AkariSearchDockVariant>>;
  /** How the current tag aligns the field's contents. */
  align: Readonly<Ref<AkariSearchDockAlign>>;
  /** The current tag's placeholder, or null to use the theme's. */
  placeholder: Readonly<Ref<string | null>>;
  /** Search inside the dock instead of opening the dialog. */
  immersive: Readonly<Ref<boolean>>;
  /** Whether the docked field shows the keyboard shortcut hint. */
  showShortcut: Readonly<Ref<boolean>>;
  /** Explicit field surface color, or null for the variant default. */
  background: Readonly<Ref<string | null>>;
  /** Explicit field border color, or null for the variant default. */
  borderColor: Readonly<Ref<string | null>>;
  /** Whether the floating field keeps its elevation shadow. */
  shadow: Readonly<Ref<boolean>>;
  /** Explicit MD3 elevation level, or null for the variant default. */
  elevation: Readonly<Ref<number | null>>;
  /** True while the trigger flies home and fades. */
  leaving: Readonly<Ref<boolean>>;
  setDockElement(element: HTMLElement | null): void;
  registerAnchor(
    element: HTMLElement,
    options?: AkariSearchDockAnchorOptions,
  ): () => void;
  updateAnchor(
    element: HTMLElement,
    options?: AkariSearchDockAnchorOptions,
  ): void;
}

const dockKey: InjectionKey<AkariSearchDockApi> = Symbol("akari-search-dock");

interface SearchDockRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface AnchorRecord {
  options: ResolvedAkariSearchDockAnchorOptions;
  order: number;
}

interface ResolvedAnchor {
  element: HTMLElement;
  options: ResolvedAkariSearchDockAnchorOptions;
  rect: SearchDockRect;
}

function rectOf(element: HTMLElement | null): SearchDockRect | null {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function sameRect(a: SearchDockRect, b: SearchDockRect): boolean {
  return (
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  );
}

/** The MD3 spatial spring token, read live from the theme host. */
function readFlightMotion(fast = false): {
  duration: number;
  ease: (t: number) => number;
} {
  const host =
    document.querySelector<HTMLElement>("m3e-theme") ??
    document.documentElement;
  const style = getComputedStyle(host);

  // A fly-in should arrive, not bounce. MD3's emphasized-decelerate curve
  // keeps the field's large size change calm; the spatial spring is kept for
  // the return trip, where its overshoot reads as settling into the bar.
  if (fast) {
    const rawDuration = style
      .getPropertyValue("--md-sys-motion-duration-medium-2")
      .trim();
    const durationMatch = /^([\d.]+)(ms|s)$/.exec(rawDuration);
    const parsed = durationMatch ? Number.parseFloat(durationMatch[1]!) : 300;
    const duration = Math.max(
      120,
      durationMatch?.[2] === "s" ? parsed * 1000 : parsed,
    );
    const easing =
      style.getPropertyValue("--md-sys-motion-easing-emphasized-decelerate").trim() ||
      "cubic-bezier(0.05, 0.7, 0.1, 1)";
    return { duration, ease: parseEasing(easing) };
  }

  const raw = style
    .getPropertyValue("--md-sys-motion-spring-default-spatial")
    .trim();
  const match = /^([\d.]+)(ms|s)\s+(.+)$/.exec(raw);
  const value = match ? Number.parseFloat(match[1]!) : 500;
  const duration = Math.max(120, match?.[2] === "s" ? value * 1000 : value);
  const easing = match?.[3] ?? "cubic-bezier(0.38, 1.21, 0.22, 1)";
  return { duration, ease: parseEasing(easing) };
}

/**
 * Parks the search trigger over the page wherever a `<SearchDock>` tag is
 * rendered.
 *
 * The app bar keeps its own trigger as an invisible placeholder so the bar
 * does not reflow. The fixed copy snaps on the first render (no fly-in on a
 * cold page), flies between tags on navigation, and flies home while it
 * fades when a page has no tag. Its CSS transitions read the MD3 motion
 * tokens directly, so it follows the Standard/Expressive setting.
 */
export function provideAkariSearchDock(
  search: AkariSearchApi,
): AkariSearchDockApi {
  const route = useRoute();
  const router = useRouter();
  const active = ref(false);
  const variant = ref<AkariSearchDockVariant>("bar");
  const align = ref<AkariSearchDockAlign>("start");
  const placeholder = ref<string | null>(null);
  const immersive = ref(false);
  const showShortcut = ref(true);
  const background = ref<string | null>(null);
  const borderColor = ref<string | null>(null);
  const shadow = ref(true);
  const elevation = ref<number | null>(null);
  const leaving = ref(false);

  const anchors = new Map<HTMLElement, AnchorRecord>();
  const anchorObserver =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => schedule(false));

  // Watches the parked tag only, so a scroll that keeps it usable costs no
  // measuring at all.
  let roomObserver: IntersectionObserver | null = null;

  let dockElement: HTMLElement | null = null;
  // Where the engine can hold the copy on its own. False means the whole
  // hand-off below is skipped and the per-frame path keeps running, which is
  // the pre-anchor behaviour rather than a degraded one.
  const canAnchor = supportsSearchDockAnchor();
  let mounted = false;
  let navigated = false;
  let navigationPending = false;
  let lastPath = route.path;
  let currentElement: HTMLElement | null = null;
  let currentRect: SearchDockRect | null = null;
  let anchorOrder = 0;
  let frame = 0;
  let scheduleTimer = 0;
  let pendingAnimate = false;
  let flightFrame = 0;
  let flightTimer = 0;
  let flightFrom: SearchDockRect | null = null;
  let flightStarted = 0;
  let flightTargetRect: SearchDockRect | null = null;
  let flightEase: ((t: number) => number) | null = null;
  let flightDuration = 500;
  let flightDone: (() => void) | null = null;
  let activationPending = false;
  let activationToken = 0;
  let initialPlacement = true;
  let leaveTimer = 0;
  let navigationTimer = 0;
  let settleFrame = 0;
  let surfaceToken = 0;
  let roomLost = false;
  let fadeTimer = 0;
  // The home trigger collapses to zero width while the copy is docked, so its
  // live rect cannot be used as the fly-home target. Remember its last
  // expanded box; the bar's left edge is then offset by that width.
  let homeBox = { width: 0, height: 0 };

  function homeElement(): HTMLElement | null {
    return search.getTrigger("home");
  }

  function measureHomeBox(): void {
    const element = homeElement();
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      homeBox = { width: rect.width, height: rect.height };
    }
  }

  /**
   * The home button's target box even while its slot is collapsed. The app
   * bar is right-aligned, so the closed slot's left edge minus the remembered
   * width is the box the real button will occupy when the slot opens.
   */
  function homeTargetRect(): SearchDockRect | null {
    const element = homeElement();
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    const width = homeBox.width || rect.width;
    const height = homeBox.height || rect.height;
    if (width <= 0 || height <= 0) return null;
    const actions = element.closest<HTMLElement>(".akari-actions");
    // While the slot animates open, the bar's left edge is still offset by
    // the part of the width that has not appeared yet. Subtracting only that
    // remainder keeps the target pinned to the home button's final left edge.
    const left = actions
      ? actions.getBoundingClientRect().left - (width - rect.width)
      : rect.left;
    return { left, top: rect.top, width, height };
  }

  function hideHome(hidden: boolean): void {
    homeElement()?.toggleAttribute("data-dock-hidden", hidden);
  }

  /**
   * Gives the app bar back the search field's width while the copy is out on
   * a tag, and eases it back open before the copy lands. The real button can
   * stay `visibility: hidden` meanwhile; only its box is animating.
   */
  function setHomeSlot(open: boolean, instant = false): void {
    const element = homeElement();
    if (!element) return;
    if (!open) measureHomeBox();
    if (instant) element.setAttribute("data-dock-slot-instant", "");
    element.toggleAttribute("data-dock-slot-away", !open);
    if (instant) {
      requestAnimationFrame(() => element.removeAttribute("data-dock-slot-instant"));
    }
  }

  function applyOptions(options: ResolvedAkariSearchDockAnchorOptions): void {
    variant.value = options.variant;
    align.value = options.align;
    placeholder.value = options.placeholder ?? null;
    immersive.value = options.immersive;
    showShortcut.value = options.showShortcut;
    background.value = options.background ?? null;
    borderColor.value = options.borderColor ?? null;
    shadow.value = options.shadow;
    elevation.value = options.elevation ?? null;
  }

  function anchorHasRoom(rect: SearchDockRect): boolean {
    const viewportWidth =
      window.visualViewport?.width ?? document.documentElement.clientWidth;
    const viewportHeight =
      window.visualViewport?.height ?? window.innerHeight;
    const page = document.querySelector<HTMLElement>(".akari-doc");
    const pageRect = page?.getBoundingClientRect() ?? null;
    // The shelf is a transparent sticky wrapper. While its in-page tab bar
    // is docked in the app bar the wrapper still has a box at the old
    // hanging position, so measuring it would reject tags under the bar even
    // though the tab strip has moved away. Measure the actual tab bars only;
    // a floating bar is filtered out when `data-hidden` hides it.
    const obstacles = [
      ".akari-frame__bar",
      ".akari-page-tabs",
    ]
      .flatMap((selector) =>
        Array.from(document.querySelectorAll<HTMLElement>(selector)),
      )
      .filter((element) => {
        const style = getComputedStyle(element);
        return (
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          element.getClientRects().length > 0
        );
      })
      .map((element) => {
        const box = element.getBoundingClientRect();
        return {
          left: box.left,
          top: box.top,
          right: box.right,
          bottom: box.bottom,
        };
      });

    return searchDockHasRoom(
      rect,
      { width: viewportWidth, height: viewportHeight },
      pageRect
        ? {
            left: pageRect.left,
            top: pageRect.top,
            right: pageRect.right,
            bottom: pageRect.bottom,
          }
        : null,
      obstacles,
    );
  }

  /**
   * The tag that wins is the one with the highest priority; ties go to the
   * first one rendered. Hidden, zero-sized or out-of-the-page tags are
   * skipped so the trigger can stay home until a tag has room.
   */
  function currentAnchor(): ResolvedAnchor | null {
    let best: ResolvedAnchor | null = null;

    for (const [element, record] of anchors) {
      if (!element.isConnected) continue;
      const rect = rectOf(element);
      if (!rect || !anchorHasRoom(rect)) continue;

      if (
        !best ||
        record.options.priority > best.options.priority ||
        (record.options.priority === best.options.priority &&
          record.order < anchors.get(best.element)!.order)
      ) {
        best = { element, options: record.options, rect };
      }
    }

    return best;
  }

  function writeRect(element: HTMLElement, rect: SearchDockRect): void {
    const viewportWidth =
      window.visualViewport?.width ?? document.documentElement.clientWidth;
    const viewportHeight =
      window.visualViewport?.height ?? window.innerHeight;
    const width = Math.min(rect.width, Math.max(40, viewportWidth - 16));
    const height = Math.min(rect.height, Math.max(40, viewportHeight - 16));

    element.style.left = `${rect.left}px`;
    element.style.top = `${rect.top}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    currentRect = { left: rect.left, top: rect.top, width, height };
  }

  /** True while the engine, not this controller, owns the copy's box. */
  function isAnchored(): boolean {
    return dockElement?.hasAttribute(SEARCH_DOCK_ANCHORED_ATTR) === true;
  }

  /** Clears the `anchor-name` hook from every tag; only one may hold it. */
  function dropAnchorNames(): void {
    for (const element of anchors.keys()) {
      element.removeAttribute(SEARCH_DOCK_ANCHOR_ATTR);
    }
  }

  /**
   * `anchor()` pins the copy to the tag's box in the document. A tag that is
   * itself sticky or fixed moves across the screen without its document box
   * moving, and a pinned copy would be left behind — so a tag under one keeps
   * the frame-by-frame path instead.
   */
  function canPinTo(element: HTMLElement): boolean {
    for (let node: HTMLElement | null = element; node; node = node.parentElement) {
      const position = getComputedStyle(node).position;
      if (position === "sticky" || position === "fixed") return false;
      if (node === document.body) break;
    }
    return true;
  }

  /**
   * Hands the box over to the engine. The tag lends its `anchor-name` and the
   * stylesheet pins the copy to it; the inline box the flight left behind has
   * to go, because an inline declaration beats `anchor()` outright.
   */
  function attachAnchor(element: HTMLElement | null): boolean {
    const dock = dockElement;
    if (!canAnchor || !dock || !element || !element.isConnected) return false;

    const rect = rectOf(element);
    if (!rect || !canPinTo(element)) return false;

    dropAnchorNames();
    element.setAttribute(SEARCH_DOCK_ANCHOR_ATTR, "");
    for (const property of ["left", "top", "width", "height"]) {
      dock.style.removeProperty(property);
    }
    dock.setAttribute(SEARCH_DOCK_ANCHORED_ATTR, "");
    currentRect = rect;
    watchAnchorRoom(element);
    return true;
  }

  /**
   * The copy is parked, so the engine moves it and scrolling costs nothing —
   * as long as nobody measures anything. The one thing scroll still has to
   * decide is whether the tag left the area the copy may occupy, and an
   * observer answers that without a per-frame layout.
   */
  function watchAnchorRoom(element: HTMLElement): void {
    if (roomObserver) roomObserver.disconnect();
    if (typeof IntersectionObserver !== "function") return;

    roomObserver = new IntersectionObserver(onAnchorRoomChange, {
      rootMargin: anchorRoomInset(),
      threshold: 0,
    });
    roomObserver.observe(element);
  }

  function unwatchAnchorRoom(): void {
    roomObserver?.disconnect();
    roomObserver = null;
  }

  /** How much of the viewport is covered by the bar and the tab strip. */
  function anchorRoomInset(): string {
    let covered = 0;
    for (const selector of [".akari-frame__bar", ".akari-page-tabs"]) {
      for (const node of document.querySelectorAll<HTMLElement>(selector)) {
        const style = getComputedStyle(node);
        if (style.position !== "sticky" && style.position !== "fixed") continue;
        if (style.visibility === "hidden" || style.display === "none") continue;
        const rect = node.getBoundingClientRect();
        if (rect.height <= 0) continue;
        covered = Math.max(covered, rect.bottom);
      }
    }
    return `-${Math.round(covered)}px 0px 0px 0px`;
  }

  function onAnchorRoomChange(entries: IntersectionObserverEntry[]): void {
    if (!isAnchored()) return;
    const entry = entries[entries.length - 1];
    if (!entry || entry.target !== currentElement) return;
    // The tag left (or came back into) the band the copy may park in. The
    // full check lives in `sync`; this only says "look again".
    schedule(!entry.isIntersecting);
  }

  /**
   * Takes the box back before a flight. The engine's resolved box is read
   * first and written inline, so a spring starts from exactly where the copy
   * sits instead of jumping to its static position.
   */
  function detachAnchor(): void {
    const dock = dockElement;
    if (!canAnchor) return;
    unwatchAnchorRoom();

    if (dock?.hasAttribute(SEARCH_DOCK_ANCHORED_ATTR)) {
      const rect = rectOf(dock);
      dock.removeAttribute(SEARCH_DOCK_ANCHORED_ATTR);
      if (rect) writeRect(dock, rect);
    }

    currentElement?.removeAttribute(SEARCH_DOCK_ANCHOR_ATTR);
  }

  function flightTarget(): SearchDockRect | null {
    if (leaving.value) return homeTargetRect() ?? flightTargetRect;

    if (!currentElement) return flightTargetRect;

    const rect = rectOf(currentElement);
    if (!rect || !anchorHasRoom(rect)) return null;
    return rect;
  }

  function stopFlightClock(): void {
    if (flightFrame) {
      cancelAnimationFrame(flightFrame);
      flightFrame = 0;
    }
    if (flightTimer) {
      window.clearTimeout(flightTimer);
      flightTimer = 0;
    }
  }

  /**
   * `requestAnimationFrame` is paused while VitePress swaps pages, which
   * used to park the copy over the incoming page for the whole transition.
   * A short timeout mirrors the clock so the flight keeps moving even then.
   */
  function scheduleFlightStep(): void {
    flightFrame = requestAnimationFrame(stepFlight);
    flightTimer = window.setTimeout(() => stepFlight(performance.now()), 24);
  }

  function cancelFlight(): void {
    stopFlightClock();
    dockElement?.removeAttribute("data-flying");
    flightFrom = null;
    flightTargetRect = null;
    flightEase = null;
    flightDone = null;
  }

  function finishFlight(): void {
    stopFlightClock();
    dockElement?.removeAttribute("data-flying");
    // The surface has finished morphing; stop carrying the transition
    // override so normal hover/resize behaviour resumes.
    dockElement?.removeAttribute("data-morphing");
    const done = flightDone;
    flightDone = null;
    flightFrom = null;
    flightTargetRect = null;
    flightEase = null;
    // Landed on a tag: the engine takes the box from here, so the follow
    // loop the caller is about to start has nothing left to do.
    if (active.value && !leaving.value) attachAnchor(currentElement);
    done?.();
  }

  function stepFlight(now: number): void {
    stopFlightClock();
    const element = dockElement;
    if (!element || !flightFrom || !flightEase) return;

    const target = flightTarget();
    if (!target) {
      // A leave never gets to abandon its flight: the copy has to reach the
      // bar for the cross-fade to take over, or it would freeze halfway with
      // the real button still hidden behind it.
      const wasLeaving = leaving.value;
      if (wasLeaving) {
        const home = homeTargetRect() ?? flightTargetRect;
        if (home) writeRect(element, home);
        finishFlight();
        return;
      }
      // Otherwise the tag lost its room while the field was still on its way
      // there. Keep the current visual box and fly home from here.
      cancelFlight();
      deactivate(true);
      return;
    }

    // The first frame's timestamp can predate `flightStarted` because the
    // flight is scheduled from inside that same frame; clamp it so the
    // opening frame never runs the spring backwards.
    const elapsed = Math.max(0, now - flightStarted);
    if (elapsed >= flightDuration) {
      writeRect(element, target);
      finishFlight();
      return;
    }

    const progress = flightEase(elapsed / flightDuration);
    writeRect(element, {
      left: flightFrom.left + (target.left - flightFrom.left) * progress,
      top: flightFrom.top + (target.top - flightFrom.top) * progress,
      width: flightFrom.width + (target.width - flightFrom.width) * progress,
      height: flightFrom.height + (target.height - flightFrom.height) * progress,
    });
    scheduleFlightStep();
  }

  function startFlight(
    rect: SearchDockRect,
    done?: () => void,
    fast = false,
  ): void {
    const element = dockElement;
    if (!element) return;

    // Cancel any previous flight, but keep the copy's current visual box:
    // an interrupted flight continues from exactly where it is.
    cancelFlight();

    // A parked copy is positioned by the stylesheet; take that box back into
    // inline geometry before the spring starts writing its own.
    detachAnchor();

    const from = rectOf(element) ?? { ...rect };
    if (sameRect(from, rect)) {
      writeRect(element, rect);
      element.removeAttribute("data-morphing");
      done?.();
      return;
    }

    flightFrom = { ...from };
    flightStarted = performance.now();
    flightTargetRect = { ...rect };
    const motion = readFlightMotion(fast);
    flightEase = motion.ease;
    flightDuration = motion.duration;
    flightDone = done ?? null;
    element.setAttribute("data-flying", "");
    scheduleFlightStep();
  }

  function applyRect(
    rect: SearchDockRect,
    animate: boolean,
    done?: () => void,
    fast = false,
  ): void {
    const element = dockElement;
    if (!element) return;

    if (animate) {
      startFlight(rect, done, fast);
      return;
    }

    cancelFlight();
    // A snap writes the box inline; drop the engine's claim first, so the
    // stylesheet and the inline box never argue about who owns it.
    element.removeAttribute(SEARCH_DOCK_ANCHORED_ATTR);
    writeRect(element, rect);
    element.removeAttribute("data-morphing");
    // Commit a snap before the next style read, so no transition starts.
    void element.offsetWidth;
    done?.();
  }

  /**
   * A tag can settle a frame or two after it mounts (web fonts, a tab bar,
   * an image above it). Follow it for a moment so the copy does not stay
   * at the first measurement.
   */
  function settleAnchor(element: HTMLElement): void {
    // The engine holds the box on the tag, so there is nothing to follow and
    // no 1200ms of layout reads after every landing.
    if (isAnchored()) return;
    if (settleFrame) cancelAnimationFrame(settleFrame);
    const started = performance.now();

    const tick = () => {
      settleFrame = 0;
      if (!active.value || leaving.value || currentElement !== element) return;

      // Let an in-flight curve finish before following a target that is
      // itself moving with the page's enter transition.
      if (!flightFrame) {
        const rect = rectOf(element);
        if (rect && (!currentRect || !sameRect(rect, currentRect))) {
          applyRect(rect, false);
        }
      }

      if (performance.now() - started < 1200) {
        settleFrame = requestAnimationFrame(tick);
      }
    };

    settleFrame = requestAnimationFrame(tick);
  }

  async function activate(
    anchor: ResolvedAnchor,
    animate: boolean,
  ): Promise<void> {
    const element = dockElement;
    if (!element) return;

    const token = ++activationToken;
    activationPending = true;

    try {
      const wasActive = active.value;
      active.value = true;
      leaving.value = false;
      roomLost = false;
      const fly = animate && !prefersReducedMotion();
      if (fly) element.setAttribute("data-morphing", "");
      else element.removeAttribute("data-morphing");
      applyOptions(anchor.options);
      currentElement = anchor.element;
      search.setActiveTrigger("dock");

      if (!fly) {
        applyRect(anchor.rect, false);
        await nextTick();
        if (!active.value || currentElement !== anchor.element) return;
        hideHome(true);
        setHomeSlot(false, true);
        attachAnchor(anchor.element);
        settleAnchor(anchor.element);
        return;
      }

      if (wasActive) {
        // Already on screen (usually interrupting a fly-home): continue from
        // the copy's current visual box and retarget the live spring. This is
        // a retarget, not a restart from the tag's original position.
        hideHome(true);
        setHomeSlot(false);
        const target = rectOf(anchor.element) ?? anchor.rect;
        if (!anchorHasRoom(target)) {
          deactivate(true);
          return;
        }
        applyRect(target, true, undefined, true);
        settleAnchor(anchor.element);
        return;
      }

      // First activation: put the copy on the app bar placeholder, then fly
      // from there to the tag. The tag may still be moving with the page's
      // enter transition, so measure it only after one painted frame.
      const from = rectOf(homeElement()) ?? anchor.rect;
      applyRect(from, false);
      await nextTick();
      if (!active.value || currentElement !== anchor.element) return;
      hideHome(true);
      setHomeSlot(false);
      if (!active.value || currentElement !== anchor.element) return;

      const target = rectOf(anchor.element) ?? anchor.rect;
      if (!anchorHasRoom(target)) {
        deactivate(true);
        return;
      }

      applyRect(target, true, undefined, true);
      settleAnchor(anchor.element);
    } finally {
      if (token === activationToken) {
        activationPending = false;
        // A scroll that landed mid-activation was dropped by the guard above.
        // Replay it once, otherwise a tag that left the band in that window is
        // never asked again and the copy stays parked off screen.
        schedule(false);
      }
    }
  }

  function moveTo(rect: SearchDockRect, animate: boolean): void {
    if (animate && !prefersReducedMotion()) {
      applyRect(rect, true);
      return;
    }

    // A snap does not need a flight at all: hand the box straight to the
    // engine, which lands it on the tag in the same frame.
    if (
      canAnchor &&
      active.value &&
      !leaving.value &&
      currentElement &&
      attachAnchor(currentElement)
    ) {
      currentRect = rect;
      return;
    }

    applyRect(rect, false);
  }

  function cancelLeave(): void {
    if (leaveTimer) {
      window.clearTimeout(leaveTimer);
      leaveTimer = 0;
    }
    if (fadeTimer) {
      window.clearTimeout(fadeTimer);
      fadeTimer = 0;
    }
    // Stop a fly-home where it is; the caller retargets the same copy.
    cancelFlight();
    leaving.value = false;
    dockElement?.removeAttribute("data-leaving");
    dockElement?.removeAttribute("data-fading");
    dockElement?.removeAttribute("data-morphing");
  }

  function beginLeaveFade(): void {
    const element = dockElement;
    if (!element || !leaving.value) return;

    // The surface already morphed during the flight; reveal the real button
    // underneath and cross-fade the copy.
    variant.value = "bar";
    element.setAttribute("data-fading", "");
    setHomeSlot(true);
    hideHome(false);
    fadeTimer = window.setTimeout(finishLeave, 260);
  }

  function finishLeave(): void {
    if (settleFrame) {
      cancelAnimationFrame(settleFrame);
      settleFrame = 0;
    }
    if (leaveTimer) {
      window.clearTimeout(leaveTimer);
      leaveTimer = 0;
    }
    if (fadeTimer) {
      window.clearTimeout(fadeTimer);
      fadeTimer = 0;
    }
    cancelFlight();
    unwatchAnchorRoom();
    active.value = false;
    leaving.value = false;
    currentElement?.removeAttribute(SEARCH_DOCK_ANCHOR_ATTR);
    dockElement?.removeAttribute(SEARCH_DOCK_ANCHORED_ATTR);
    currentElement = null;
    currentRect = null;
    dockElement?.removeAttribute("data-leaving");
    dockElement?.removeAttribute("data-fading");
    dockElement?.removeAttribute("data-morphing");
    setHomeSlot(true);
    hideHome(false);
    search.setActiveTrigger("home");
  }

  function deactivate(animate: boolean): void {
    const element = dockElement;
    // A leave already on its way home owns the copy. Only a stale one needs
    // ringing out: if the spring and the cross-fade are both gone but
    // `leaving` is still set, the hand-off was dropped and the copy is
    // stranded over the bar, hiding the real button for good.
    if (leaving.value) {
      if (flightFrame || flightTimer || fadeTimer) return;
      finishLeave();
      return;
    }
    // Stop following the tag on the very first frame of the return trip; the
    // box the engine resolved becomes the spring's starting point.
    detachAnchor();
    // Open the slot first: its width animates back while the copy flies, and
    // the target is computed from the remembered expanded width.
    setHomeSlot(true);
    const target = homeTargetRect();
    const fly =
      animate && !leaving.value && !!target && !prefersReducedMotion();

    if (!element || !fly || !target) {
      finishLeave();
      return;
    }

    leaving.value = true;
    element.setAttribute("data-leaving", "");
    // Establish the effect transitions before the variant flips, so the
    // surface starts morphing on the first frame after take-off.
    element.setAttribute("data-morphing", "");
    element.setAttribute("inert", "");
    // Start the surface morph on take-off. The CSS effect transitions
    // carry the colour, type, padding and shortcut while the box travels;
    // align/placeholder switch now so the hand-off to the real bar button
    // does not snap after the flight.
    variant.value = "bar";
    align.value = "start";
    placeholder.value = null;
    immersive.value = false;
    showShortcut.value = true;
    background.value = null;
    borderColor.value = null;
    shadow.value = true;
    elevation.value = null;
    // The bar's free space opens while the copy is still travelling, so the
    // title and tabs move over gradually instead of jumping at hand-off.
    // The spring lands exactly on the live home button; only then reveal
    // the real button and cross-fade. No fixed duration to guess.
    applyRect(target, true, beginLeaveFade);

    // The spring is the only thing that hands the copy over to the fade, and
    // nothing else can recover if it never lands: a paused animation clock
    // (page swap, background tab) or a target that vanished mid-flight would
    // strand the copy over the bar with `leaving` stuck on and the real
    // button still hidden behind it. A late landing beats no landing.
    if (leaveTimer) window.clearTimeout(leaveTimer);
    leaveTimer = window.setTimeout(
      () => {
        leaveTimer = 0;
        if (!leaving.value) return;
        if (dockElement?.hasAttribute("data-fading")) return;
        const home = homeTargetRect();
        if (home && dockElement) writeRect(dockElement, home);
        beginLeaveFade();
      },
      Math.max(flightDuration, 480) + 420,
    );
  }

  function sync(animate: boolean): void {
    if (!mounted || activationPending || search.isOpen.value) return;

    // The tag can appear before the page's content hook fires. Start as
    // soon as it exists: the flight loop re-measures it every frame, so a
    // tag that is still settling drags the target instead of delaying us.
    const anchor = currentAnchor();

    if (!anchor) {
      if (anchors.size > 0) roomLost = true;
      if (active.value && !leaving.value) deactivate(true);
      else if (!active.value) {
        setHomeSlot(true);
        hideHome(false);
      }
      return;
    }

    if (!active.value) {
      void activate(anchor, animate || roomLost);
      return;
    }

    if (leaving.value) {
      // The tag became usable while the copy was flying home: stop that
      // flight where it is and retarget the same spring immediately.
      cancelLeave();
      currentElement = anchor.element;
      search.setActiveTrigger("dock");
      hideHome(true);
      setHomeSlot(false);
      void activate(anchor, true);
      return;
    }

    const sameElement = currentElement === anchor.element;
    const changed =
      !sameElement ||
      variant.value !== anchor.options.variant ||
      align.value !== anchor.options.align ||
      placeholder.value !== (anchor.options.placeholder ?? null) ||
      immersive.value !== anchor.options.immersive ||
      showShortcut.value !== anchor.options.showShortcut ||
      background.value !== (anchor.options.background ?? null) ||
      borderColor.value !== (anchor.options.borderColor ?? null) ||
      shadow.value !== anchor.options.shadow ||
      elevation.value !== (anchor.options.elevation ?? null);

    currentElement = anchor.element;
    if (changed && animate && !prefersReducedMotion()) {
      dockElement?.setAttribute("data-morphing", "");
    }
    if (changed && !animate) {
      dockElement?.removeAttribute("data-morphing");
    }
    applyOptions(anchor.options);

    // Parked on the same tag: the engine already holds the box, and only the
    // tag's own box can move it. Re-issuing a rect here would knock the copy
    // off `anchor()` and back onto a frame-by-frame write.
    if (isAnchored() && sameElement) {
      currentRect = anchor.rect;
      return;
    }

    if (changed) {
      moveTo(anchor.rect, animate);
      return;
    }

    // The rAF loop reads the anchor every frame; restarting here would
    // replay the spring from its beginning after a scroll.
    if (flightFrame) return;
    if (!currentRect || !sameRect(currentRect, anchor.rect)) {
      moveTo(anchor.rect, animate);
    }
  }

  /**
   * Waits for the page's enter transition to finish. Measuring a tag while
   * the page surface is still moving produces a stale target, which then
   * snaps when the spring lands. A bounded wait keeps a missing animation
   * from parking the trigger forever.
   */
  function flushSchedule(): void {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    if (scheduleTimer) {
      window.clearTimeout(scheduleTimer);
      scheduleTimer = 0;
    }
    const next = pendingAnimate;
    pendingAnimate = false;
    sync(next);
  }

  function schedule(animate: boolean): void {
    if (!mounted) return;
    pendingAnimate = pendingAnimate || animate;
    if (frame || scheduleTimer) return;

    // The same navigation-blocked rAF problem applies to activation: a
    // timeout keeps the first frame from being delayed until the page swap.
    frame = requestAnimationFrame(flushSchedule);
    scheduleTimer = window.setTimeout(flushSchedule, 24);
  }

  function onScroll(): void {
    // The dialog is modal: keep the copy parked while it is open, even if
    // the page is scrolled programmatically.
    if (search.isOpen.value) return;

    // While home, keep watching for a tag that scrolls into a usable area.
    if (!active.value && !leaving.value && anchors.size === 0) return;

    if (leaving.value) {
      // A usable landing area during the fly-home interrupts it immediately.
      if (currentAnchor()) schedule(true);
      return;
    }

    // The rAF loop measures currentElement every frame, so it already
    // follows a fast scroll. Let it finish instead of snapping the target.
    if (flightFrame) return;

    // The copy is parked on its tag: the engine moves the box with the page,
    // so a scroll frame owes no measuring. Whether the tag left the band is
    // the room observer's business.
    if (isAnchored()) return;

    // A settled copy follows the landing box synchronously, so it does not
    // trail the page by a frame or snap at the end of a scroll.
    if (active.value) {
      sync(false);
      return;
    }
    schedule(false);
  }

  function onResize(): void {
    if (!active.value && !leaving.value) measureHomeBox();
    if (!active.value && anchors.size === 0) return;
    schedule(false);
  }

  function registerAnchor(
    element: HTMLElement,
    options?: AkariSearchDockAnchorOptions,
  ): () => void {
    anchorOrder += 1;
    anchors.set(element, {
      options: normalizeSearchDockAnchor(options),
      order: anchorOrder,
    });
    anchorObserver?.observe(element);
    // A new tag mounted while the copy is flying home must retarget on the
    // spot, before the next frame lets the old spring travel further.
    if (leaving.value) sync(navigated || !initialPlacement);
    else schedule(navigated || !initialPlacement);

    return () => {
      // If the copy is parked on this tag, take the box back before the name
      // goes away: an `anchor()` with no target drops the copy to its static
      // position for a frame, which reads as a jump to the corner.
      if (currentElement === element) detachAnchor();
      element.removeAttribute(SEARCH_DOCK_ANCHOR_ATTR);
      anchors.delete(element);
      anchorObserver?.unobserve(element);
      if (currentElement === element) currentElement = null;
      schedule(navigated || !initialPlacement);
    };
  }

  function updateAnchor(
    element: HTMLElement,
    options?: AkariSearchDockAnchorOptions,
  ): void {
    const record = anchors.get(element);
    if (!record) return;

    record.options = normalizeSearchDockAnchor(options);
    schedule(active.value);
  }

  const api: AkariSearchDockApi = {
    active: readonly(active),
    variant: readonly(variant),
    align: readonly(align),
    placeholder: readonly(placeholder),
    immersive: readonly(immersive),
    showShortcut: readonly(showShortcut),
    background: readonly(background),
    borderColor: readonly(borderColor),
    shadow: readonly(shadow),
    elevation: readonly(elevation),
    leaving: readonly(leaving),
    setDockElement(element: HTMLElement | null): void {
      dockElement = element;
      if (element && active.value) {
        // A fresh copy starts from scratch: hand it back to the engine when
        // the trigger is parked, or restore the box it had while travelling.
        const pinned =
          canAnchor && currentElement && !leaving.value
            ? attachAnchor(currentElement)
            : false;
        if (!pinned && currentRect) applyRect(currentRect, false);
      }
      if (element) schedule(false);
    },
    registerAnchor,
    updateAnchor,
  };

  onMounted(() => {
    mounted = true;

    measureHomeBox();
    // The first placement is a snap: a page that already contains a tag
    // must not fly the trigger in from the app bar.
    sync(false);
    initialPlacement = false;
    void document.fonts?.ready.then(() => {
      if (!navigated) schedule(false);
    });

    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", onResize, { passive: true });
    window.visualViewport?.addEventListener("scroll", onScroll);
    window.visualViewport?.addEventListener("resize", onResize);
  });

  watch(
    () => route.path,
    (path) => {
      if (!mounted) return;
      navigated = true;
      surfaceToken += 1;
      if (path !== lastPath) {
        lastPath = path;
        // Leave the old landing box immediately, before the new page is
        // painted, so the copy does not sit over the incoming page.
        if (active.value && !leaving.value && !search.isOpen.value) {
          deactivate(true);
        }
        navigationPending = true;
        if (navigationTimer) window.clearTimeout(navigationTimer);
        // If a navigation never reaches the content hook, fall back to the
        // current DOM rather than leaving the copy parked forever.
        navigationTimer = window.setTimeout(() => {
          navigationTimer = 0;
          navigationPending = false;
          schedule(true);
        }, 1200);
      }
      schedule(true);
    },
    { flush: "sync" },
  );

  watch(
    () => search.isOpen.value,
    (open) => {
      if (!open) schedule(true);
    },
  );

  // Start the flight home as soon as the router accepts a navigation,
  // before the new page paints, so the copy never covers the incoming page.
  const previousBeforeLoad = router.onBeforePageLoad;
  const beforeLoad = async (href: string): Promise<void | boolean> => {
    const result = await previousBeforeLoad?.(href);
    if (result === false) return false;
    if (active.value && !leaving.value && !search.isOpen.value) {
      deactivate(true);
    }
    return result;
  };
  router.onBeforePageLoad = beforeLoad;

  onContentUpdated(() => {
    if (!mounted) return;
    if (!navigated) {
      navigationPending = false;
      schedule(false);
      return;
    }

    // The new page's markup exists now. Start immediately: the flight loop
    // re-measures the live anchor every frame, so it can follow a tag that is
    // still settling instead of waiting for the page transition to finish.
    navigationPending = true;
    const token = ++surfaceToken;
    void nextTick().then(() => {
      if (!mounted || token !== surfaceToken) return;
      navigationPending = false;
      if (navigationTimer) {
        window.clearTimeout(navigationTimer);
        navigationTimer = 0;
      }
      sync(true);
    });
  });

  onUnmounted(() => {
    mounted = false;
    anchors.clear();
    anchorObserver?.disconnect();
    unwatchAnchorRoom();
    if (frame) cancelAnimationFrame(frame);
    if (scheduleTimer) window.clearTimeout(scheduleTimer);
    if (settleFrame) cancelAnimationFrame(settleFrame);
    stopFlightClock();
    cancelFlight();
    if (leaveTimer) window.clearTimeout(leaveTimer);
    if (fadeTimer) window.clearTimeout(fadeTimer);
    if (navigationTimer) window.clearTimeout(navigationTimer);
    if (router.onBeforePageLoad === beforeLoad) {
      router.onBeforePageLoad = previousBeforeLoad;
    }
    document.removeEventListener("scroll", onScroll, { capture: true });
    window.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("scroll", onScroll);
    window.visualViewport?.removeEventListener("resize", onResize);
    setHomeSlot(true);
    hideHome(false);
    search.setActiveTrigger("home");
  });

  provide(dockKey, api);
  return api;
}

export function useAkariSearchDock(): AkariSearchDockApi {
  const api = inject(dockKey);

  if (!api) {
    throw new Error(
      "[vitepress-akari-theme-docs] useAkariSearchDock() must be called inside AkariLayout.",
    );
  }

  return api;
}
