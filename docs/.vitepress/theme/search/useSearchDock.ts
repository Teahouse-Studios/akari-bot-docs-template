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
import { normalizeSearchDockAnchor, searchDockHasRoom } from "./dock";
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
  const leaving = ref(false);

  const anchors = new Map<HTMLElement, AnchorRecord>();
  const anchorObserver =
    typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(() => schedule(false));

  let dockElement: HTMLElement | null = null;
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
    done?.();
  }

  function stepFlight(now: number): void {
    stopFlightClock();
    const element = dockElement;
    if (!element || !flightFrom || !flightEase) return;

    const target = flightTarget();
    if (!target) {
      // The tag lost its room while the field was still on its way there.
      // Keep the current visual box and fly home from here.
      const wasLeaving = leaving.value;
      cancelFlight();
      if (!wasLeaving) deactivate(true);
      return;
    }

    const elapsed = now - flightStarted;
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

    const from = rectOf(element) ?? { ...rect };
    if (sameRect(from, rect)) {
      writeRect(element, rect);
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
    writeRect(element, rect);
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
      if (token === activationToken) activationPending = false;
    }
  }

  function moveTo(rect: SearchDockRect, animate: boolean): void {
    applyRect(rect, animate && !prefersReducedMotion());
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
    active.value = false;
    leaving.value = false;
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
    // The bar's free space opens while the copy is still travelling, so the
    // title and tabs move over gradually instead of jumping at hand-off.
    // The spring lands exactly on the live home button; only then reveal
    // the real button and cross-fade. No fixed duration to guess.
    applyRect(target, true, beginLeaveFade);
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

    const changed =
      currentElement !== anchor.element ||
      variant.value !== anchor.options.variant ||
      align.value !== anchor.options.align ||
      placeholder.value !== (anchor.options.placeholder ?? null);

    currentElement = anchor.element;
    if (changed && animate && !prefersReducedMotion()) {
      dockElement?.setAttribute("data-morphing", "");
    }
    if (changed && !animate) {
      dockElement?.removeAttribute("data-morphing");
    }
    applyOptions(anchor.options);

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
    leaving: readonly(leaving),
    setDockElement(element: HTMLElement | null): void {
      dockElement = element;
      if (element && active.value && currentRect) {
        applyRect(currentRect, false);
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
