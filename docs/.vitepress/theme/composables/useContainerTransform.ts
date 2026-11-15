import { nextTick, onUnmounted, type Ref } from "vue";

import {
  computeRevealMorph,
  fullClipPath,
  getSearchMotionPreset,
  insetClipPath,
  prefersReducedMotion,
} from "../search/animation";
import type { AkariMotionScheme } from "../types";

// Room around the panel for its shadow, so the fully open clip shows it.
const SHADOW_ROOM = 32;
const FADE_EASING = "cubic-bezier(0.2, 0, 0, 1)";

/**
 * When each fade runs, as fractions of the motion's duration. The trigger
 * and the panel never cross-fade their contents: one fades out before the
 * other fades in (M3's fade through), so a trigger and an anchor of
 * different sizes are never on screen together. The panel's own surface
 * fades as well, which matters for a trigger without a container: the
 * motion then begins and ends on exactly the trigger's look.
 */
const OPEN_FADES = {
  panel: [0, 0.2],
  ghost: [0.05, 0.25],
  anchor: [0.25, 0.25],
} as const;
const CLOSE_FADES = {
  anchor: [0, 0.2],
  ghost: [0.15, 0.25],
  panel: [0.45, 0.3],
} as const;

export interface ContainerTransformOptions {
  dialog: Ref<HTMLDialogElement | null>;
  panel: Ref<HTMLElement | null>;
  /** The panel's interactive content, made inert while it closes. */
  content: Ref<HTMLElement | null>;
  scrim: Ref<HTMLElement | null>;
  /** Layer above the panel that holds the trigger's copy. */
  ghostHost: Ref<HTMLElement | null>;
  /** The part of the panel the trigger turns into. */
  anchor: Ref<HTMLElement | null>;
  /** Parts of the panel that fade in once it starts to open. */
  fadingParts: () => HTMLElement[];
  /** The element the panel grows out of and returns to. */
  trigger: () => HTMLElement | null;
  motion: () => AkariMotionScheme;
  /** Moves focus into the panel as it opens. */
  focus: () => void;
  /** Runs once the dialog has closed. */
  onClosed: () => void;
}

interface MorphGeometry {
  /** Panel offset and clip that show only the trigger-shaped window. */
  collapsedTransform: string;
  collapsedClip: string;
  /** The ghost's offset when it sits on the window at the panel's rest. */
  ghostRestTransform: string;
  openClip: string;
}

/** Where every animated part currently is, read mid-flight. */
interface MorphState {
  transform: string;
  clipPath: string;
  panelOpacity: number;
  anchorOpacity: number;
  contentOpacity: number;
  scrimOpacity: number;
  ghostTransform: string;
  ghostOpacity: number;
}

function opacityOf(
  element: Element | null | undefined,
  fallback: number,
): number {
  return element
    ? Number.parseFloat(getComputedStyle(element).opacity)
    : fallback;
}

/** An opacity fade over `[start, start + length]` of `duration`. */
function fade(
  element: HTMLElement,
  from: number,
  to: number,
  duration: number,
  [start, length]: readonly [number, number],
): Animation {
  return element.animate([{ opacity: from }, { opacity: to }], {
    duration: duration * length,
    delay: duration * start,
    easing: FADE_EASING,
    fill: "both",
  });
}

/**
 * M3 container transform between a trigger and a modal dialog. The dialog's
 * panel is animated from its first frame at its final layout: a window
 * shaped like the trigger sits over the panel's anchor and is offset onto the
 * trigger, then grows to the whole panel while the offset returns to zero. A
 * pixel copy of the trigger rides along and fades, so the trigger's look
 * carries into the panel and back. Either direction can be interrupted and
 * reverses from the frame it is at.
 */
export function useContainerTransform(options: ContainerTransformOptions) {
  let animationToken = 0;
  let animations: Animation[] = [];
  let hiddenTrigger: HTMLElement | null = null;
  let hiddenTriggerVisibility = "";

  function cancelAnimations(): void {
    animationToken += 1;
    for (const animation of animations) animation.cancel();
    animations = [];
  }

  function removeGhost(): void {
    options.ghostHost.value?.replaceChildren();
  }

  function hideTrigger(source: HTMLElement): void {
    if (hiddenTrigger) return;

    hiddenTrigger = source;
    hiddenTriggerVisibility = source.style.visibility;
    source.style.visibility = "hidden";
  }

  function restoreTrigger(): void {
    if (!hiddenTrigger) return;

    hiddenTrigger.style.visibility = hiddenTriggerVisibility;
    hiddenTrigger = null;
  }

  /**
   * The ghost lives outside the dock's scoped-style subtree, so class-based
   * variant styling (font, padding, gap, kbd border) would be lost. Copy the
   * resolved style of every node onto its clone so the ghost is a visual
   * match no matter which variant the trigger currently uses.
   */
  const GHOST_STYLE_PROPERTIES = [
    "font",
    "line-height",
    "letter-spacing",
    "color",
    "background-color",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    "gap",
    "display",
    "align-items",
    "justify-content",
    "text-align",
    "white-space",
    "overflow",
    "text-overflow",
    "box-sizing",
    "flex",
    "min-width",
    "max-width",
    "opacity",
    "border-top-width",
    "border-right-width",
    "border-bottom-width",
    "border-left-width",
    "border-top-style",
    "border-right-style",
    "border-bottom-style",
    "border-left-style",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-right-radius",
    "border-bottom-left-radius",
    "box-shadow",
  ] as const;

  function copyGhostStyles(source: HTMLElement, clone: HTMLElement): void {
    const sources: Element[] = [source, ...source.querySelectorAll("*")];
    const clones: Element[] = [clone, ...clone.querySelectorAll("*")];

    for (let index = 0; index < sources.length; index += 1) {
      const from = sources[index];
      const to = clones[index] as HTMLElement | SVGElement | undefined;
      if (!to) continue;

      const computed = getComputedStyle(from);
      for (const property of GHOST_STYLE_PROPERTIES) {
        const value = computed.getPropertyValue(property);
        if (value) to.style.setProperty(property, value);
      }

      const iconSize = computed.getPropertyValue("--m3e-icon-size");
      if (iconSize) to.style.setProperty("--m3e-icon-size", iconSize);
    }
  }

  function createGhost(source: HTMLElement, rect: DOMRect): HTMLElement | null {
    removeGhost();

    const host = options.ghostHost.value;
    if (!host) return null;

    const clone = source.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    clone.removeAttribute("id");
    clone.setAttribute("aria-hidden", "true");
    clone.tabIndex = -1;
    copyGhostStyles(source, clone);
    Object.assign(clone.style, {
      position: "fixed",
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: "0",
      pointerEvents: "none",
      visibility: "visible",
      boxSizing: "border-box",
      overflow: "hidden",
      transition: "none",
    });

    host.replaceChildren(clone);
    return clone;
  }

  function measureMorph(triggerRect: DOMRect): MorphGeometry | null {
    const panel = options.panel.value;
    const anchor = options.anchor.value;
    if (!panel || !anchor) return null;

    const panelStyle = getComputedStyle(panel);
    const morph = computeRevealMorph(
      triggerRect,
      panel.getBoundingClientRect(),
      anchor.getBoundingClientRect(),
      panelStyle.direction === "rtl",
    );
    const radius = Number.parseFloat(panelStyle.borderTopLeftRadius) || 28;

    return {
      collapsedTransform: `translate(${morph.translateX}px, ${morph.translateY}px)`,
      collapsedClip: insetClipPath(morph.clip, morph.radius),
      ghostRestTransform: `translate(${-morph.translateX}px, ${-morph.translateY}px)`,
      openClip: fullClipPath(radius, SHADOW_ROOM),
    };
  }

  function captureMorphState(): MorphState | null {
    const panel = options.panel.value;
    const scrim = options.scrim.value;
    if (!animations.length || !panel || !scrim) return null;

    const panelStyle = getComputedStyle(panel);
    const ghost = options.ghostHost.value?.firstElementChild;

    return {
      transform: panelStyle.transform,
      clipPath: panelStyle.clipPath,
      panelOpacity: Number.parseFloat(panelStyle.opacity),
      anchorOpacity: opacityOf(options.anchor.value, 1),
      contentOpacity: opacityOf(options.fadingParts()[0], 1),
      scrimOpacity: opacityOf(scrim, 1),
      ghostTransform: ghost ? getComputedStyle(ghost).transform : "none",
      ghostOpacity: opacityOf(ghost, 0),
    };
  }

  function resetDialogStyles(): void {
    if (options.content.value) options.content.value.inert = false;
    if (options.scrim.value) options.scrim.value.style.opacity = "";
    removeGhost();
    restoreTrigger();
  }

  async function open(): Promise<void> {
    const dialog = options.dialog.value;
    const panel = options.panel.value;
    const scrim = options.scrim.value;
    const content = options.content.value;
    if (!dialog || !panel || !scrim || !content) return;

    // Reopening during the close animation continues from where it is.
    const resumed = captureMorphState();
    cancelAnimations();
    const token = animationToken;

    content.inert = false;
    if (!dialog.open) dialog.showModal();

    await nextTick();
    if (token !== animationToken) return;

    const source = options.trigger();
    const triggerRect = source?.getBoundingClientRect();
    const geometry =
      triggerRect?.width && triggerRect.height
        ? measureMorph(triggerRect)
        : null;
    const ghost =
      source && triggerRect && geometry ? createGhost(source, triggerRect) : null;

    if (prefersReducedMotion() || !source || !geometry || !ghost) {
      removeGhost();
      scrim.style.opacity = "1";
      options.focus();
      return;
    }

    hideTrigger(source);
    options.focus();

    const preset = getSearchMotionPreset(options.motion());
    const from: MorphState = resumed ?? {
      transform: geometry.collapsedTransform,
      clipPath: geometry.collapsedClip,
      panelOpacity: 0,
      anchorOpacity: 0,
      contentOpacity: 0,
      scrimOpacity: 0,
      ghostTransform: "none",
      ghostOpacity: 1,
    };
    const spatial = {
      duration: preset.duration,
      easing: preset.easing,
      fill: "both",
    } as const;

    const morph = panel.animate(
      [
        { transform: from.transform, clipPath: from.clipPath },
        { transform: "none", clipPath: geometry.openClip },
      ],
      spatial,
    );

    const anchor = options.anchor.value;
    animations = [
      morph,
      fade(panel, from.panelOpacity, 1, preset.duration, OPEN_FADES.panel),
      ...(anchor
        ? [
            fade(
              anchor,
              from.anchorOpacity,
              1,
              preset.duration,
              OPEN_FADES.anchor,
            ),
          ]
        : []),
      ...options.fadingParts().map((element) =>
        element.animate([{ opacity: from.contentOpacity }, { opacity: 1 }], {
          duration: preset.contentDuration,
          delay: preset.duration * 0.25,
          easing: FADE_EASING,
          fill: "both",
        }),
      ),
      scrim.animate([{ opacity: from.scrimOpacity }, { opacity: 1 }], {
        duration: preset.scrimDuration,
        easing: FADE_EASING,
        fill: "both",
      }),
      ghost.animate(
        [
          { transform: from.ghostTransform },
          { transform: geometry.ghostRestTransform },
        ],
        spatial,
      ),
      fade(ghost, from.ghostOpacity, 0, preset.duration, OPEN_FADES.ghost),
    ];

    await morph.finished.catch(() => {});
    if (token !== animationToken) return;

    // The final keyframes match the panel's resting styles, so dropping the
    // animations changes nothing on screen.
    scrim.style.opacity = "1";
    for (const animation of animations) animation.cancel();
    animations = [];
    removeGhost();
  }

  async function close(): Promise<void> {
    const dialog = options.dialog.value;
    const panel = options.panel.value;
    const scrim = options.scrim.value;

    if (!dialog?.open || !panel || !scrim) {
      dialog?.close();
      resetDialogStyles();
      options.onClosed();
      return;
    }

    // Closing during the open animation reverses from where it is.
    const resumed = captureMorphState();
    cancelAnimations();
    const token = animationToken;

    const source = options.trigger();
    const triggerRect = source?.getBoundingClientRect();
    const geometry =
      triggerRect?.width && triggerRect.height
        ? measureMorph(triggerRect)
        : null;

    function finish(): void {
      for (const animation of animations) animation.cancel();
      animations = [];
      dialog?.close();
      resetDialogStyles();
      options.onClosed();
    }

    if (prefersReducedMotion() || !source || !triggerRect || !geometry) {
      finish();
      return;
    }

    // Keep the ghost where it was when interrupted; otherwise start it on the
    // window at the panel's resting position.
    const ghost = resumed
      ? (options.ghostHost.value?.firstElementChild as HTMLElement | null) ??
        createGhost(source, triggerRect)
      : createGhost(source, triggerRect);

    if (!ghost) {
      finish();
      return;
    }

    hideTrigger(source);
    if (options.content.value) options.content.value.inert = true;
    dialog.focus({ preventScroll: true });

    const preset = getSearchMotionPreset(options.motion());
    const from: MorphState = resumed ?? {
      transform: "none",
      clipPath: geometry.openClip,
      panelOpacity: 1,
      anchorOpacity: 1,
      contentOpacity: 1,
      scrimOpacity: 1,
      ghostTransform: geometry.ghostRestTransform,
      ghostOpacity: 0,
    };
    const spatial = {
      duration: preset.exitDuration,
      easing: preset.exitEasing,
      fill: "both",
    } as const;

    const morph = panel.animate(
      [
        { transform: from.transform, clipPath: from.clipPath },
        {
          transform: geometry.collapsedTransform,
          clipPath: geometry.collapsedClip,
        },
      ],
      spatial,
    );

    const anchor = options.anchor.value;
    animations = [
      morph,
      ...options.fadingParts().map((element) =>
        element.animate([{ opacity: from.contentOpacity }, { opacity: 0 }], {
          duration: preset.exitDuration * 0.3,
          easing: FADE_EASING,
          fill: "both",
        }),
      ),
      ...(anchor
        ? [
            fade(
              anchor,
              from.anchorOpacity,
              0,
              preset.exitDuration,
              CLOSE_FADES.anchor,
            ),
          ]
        : []),
      scrim.animate([{ opacity: from.scrimOpacity }, { opacity: 0 }], {
        duration: preset.exitDuration,
        easing: FADE_EASING,
        fill: "both",
      }),
      ghost.animate(
        [{ transform: from.ghostTransform }, { transform: "none" }],
        spatial,
      ),
      // The trigger's look takes over while the window is still travelling,
      // and the panel's surface then fades away beneath it, so the landing
      // and its bounce are the trigger itself.
      fade(ghost, from.ghostOpacity, 1, preset.exitDuration, CLOSE_FADES.ghost),
      fade(panel, from.panelOpacity, 0, preset.exitDuration, CLOSE_FADES.panel),
    ];

    await morph.finished.catch(() => {});
    if (token !== animationToken) return;

    finish();
  }

  onUnmounted(() => {
    cancelAnimations();
    removeGhost();
    restoreTrigger();
    if (options.dialog.value?.open) options.dialog.value.close();
  });

  return { open, close };
}
