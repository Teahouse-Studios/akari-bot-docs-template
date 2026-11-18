import type { AkariMotionScheme } from "../types";

export interface MorphRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface ClipInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Container transform from the search trigger to the search panel. The panel
 * keeps its final layout throughout and is shown through a window shaped like
 * the trigger: the window sits over the panel's own search bar, and the panel
 * is offset so that window lands on the trigger. Animating the offset to zero
 * and the window out to the full panel reveals the real content, never an
 * empty stand-in surface.
 */
export interface RevealMorph {
  /** Panel offset that places the window on the trigger. */
  translateX: number;
  translateY: number;
  /** The window, as clip insets of the panel box. */
  clip: ClipInsets;
  /** Corner radius of the window: the trigger's pill shape. */
  radius: number;
}

export interface SearchMotionPreset {
  duration: number;
  easing: string;
  exitDuration: number;
  exitEasing: string;
  contentDuration: number;
  scrimDuration: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export function computeRevealMorph(
  trigger: MorphRect,
  panel: MorphRect,
  anchor: MorphRect,
  rtl = false,
): RevealMorph {
  const width = Math.min(trigger.width, panel.width);
  const height = Math.min(trigger.height, panel.height);

  // Align with the anchor's inline-start edge so the trigger's leading icon
  // and the search bar's leading icon line up, centred on the anchor.
  const left = clamp(
    rtl ? anchor.left + anchor.width - width : anchor.left,
    panel.left,
    panel.left + panel.width - width,
  );
  const top = clamp(
    anchor.top + (anchor.height - height) / 2,
    panel.top,
    panel.top + panel.height - height,
  );

  return {
    translateX: trigger.left - left,
    translateY: trigger.top - top,
    clip: {
      top: top - panel.top,
      right: panel.left + panel.width - (left + width),
      bottom: panel.top + panel.height - (top + height),
      left: left - panel.left,
    },
    radius: height / 2,
  };
}

export function insetClipPath(clip: ClipInsets, radius: number): string {
  return `inset(${clip.top}px ${clip.right}px ${clip.bottom}px ${clip.left}px round ${radius}px)`;
}

/** A clip that shows the whole panel, its rounded corners and its shadow. */
export function fullClipPath(radius: number, shadowRoom: number): string {
  return `inset(${-shadowRoom}px round ${radius + shadowRoom}px)`;
}

export function getSearchMotionPreset(
  motion: AkariMotionScheme,
): SearchMotionPreset {
  // Both directions follow m3e's default spatial spring for the scheme. The
  // expressive spring overshoots slightly, so the panel bounces out of the
  // trigger and back into it; its peak (about 1.4%) stays small enough that
  // the shrinking window never folds over. Exiting is a little shorter.
  if (motion === "expressive") {
    return {
      duration: 500,
      easing: "cubic-bezier(0.38, 1.21, 0.22, 1)",
      exitDuration: 400,
      exitEasing: "cubic-bezier(0.38, 1.21, 0.22, 1)",
      contentDuration: 200,
      scrimDuration: 320,
    };
  }

  return {
    duration: 300,
    easing: "cubic-bezier(0.2, 0, 0, 1)",
    exitDuration: 250,
    exitEasing: "cubic-bezier(0.2, 0, 0, 1)",
    contentDuration: 150,
    scrimDuration: 240,
  };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  const root = typeof document !== "undefined" ? document.documentElement : null;
  if (root?.dataset.akariGpuTier === "bad") return true;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
