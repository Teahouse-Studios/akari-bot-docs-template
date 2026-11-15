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
import { onContentUpdated } from "vitepress";

import { randomHeroPattern, type ResolvedHero } from "../hero";
import type { AkariHeroPattern } from "../types";

const patternKey: InjectionKey<ComputedRef<AkariHeroPattern | null>> =
  Symbol("akari-pattern");

/**
 * The page's hidden pattern (see styles/pattern.css): the one its hero
 * names, none if the hero says `none`, and otherwise one drawn at random
 * each time content loads. It is drawn in the browser only, so the server's
 * page and the hydrated one agree; the pattern then fades in.
 */
export function providePagePattern(
  hero: ComputedRef<ResolvedHero | null>,
): ComputedRef<AkariHeroPattern | null> {
  const drawn = ref<AkariHeroPattern | null>(null);

  function draw(): void {
    drawn.value = randomHeroPattern();
  }

  onMounted(draw);
  onContentUpdated(draw);

  const pattern = computed(() => {
    const named = hero.value?.pattern;
    if (named === "none") return null;
    return named && named !== "auto" ? named : drawn.value;
  });

  provide(patternKey, pattern);
  return pattern;
}

export function usePagePattern(): ComputedRef<AkariHeroPattern | null> {
  return inject(
    patternKey,
    computed(() => null),
  );
}

/**
 * Set on html while the reader points with a mouse or pen; the light only
 * comes up then (styles/pattern.css, DocHero).
 */
const HOVER_ATTRIBUTE = "data-akari-hover";

/** Surfaces whose pattern lights up around the pointer. */
const LIT = [
  ".akari-doc-hero__text",
  ".akari-doc-hero__media",
  '.akari-prose :is(div[class*="language-"], .vp-code-group .tabs, .akari-table, .custom-block, blockquote, .demo-surface)',
].join(", ");

/**
 * Moves the light on patterned surfaces with the pointer: one listener on
 * the document surface writes the pointer's position, in each lit
 * surface's own coordinates, into its --akari-light-x and --akari-light-y
 * once a frame, for the surface under the pointer and any lit surface
 * around it. Mouse and pen only: touch has nothing to hover.
 *
 * Whether the reader is on a mouse or pen is read from the pointer events
 * themselves (HOVER_ATTRIBUTE), not the hover media query: that reports the
 * device's primary input as the browser guesses it, and where the guess is
 * touch (a convertible laptop, a browser that cannot see the mouse) the
 * light would never come up under a real mouse. A touch turns it off
 * again, so a tap leaves nothing lit.
 */
export function useContentLight(surface: Ref<HTMLElement | null>): void {
  let frame = 0;
  let pointer: { target: Element; x: number; y: number } | null = null;

  function apply(): void {
    frame = 0;
    if (!pointer) return;
    const { target, x, y } = pointer;
    // Every box is read before any position is written, so a surface nested
    // in another does not make the next read recompute styles.
    const lit: [HTMLElement, DOMRect][] = [];
    for (
      let element = target.closest<HTMLElement>(LIT);
      element;
      element = element.parentElement?.closest<HTMLElement>(LIT) ?? null
    ) {
      lit.push([element, element.getBoundingClientRect()]);
    }
    for (const [element, box] of lit) {
      element.style.setProperty("--akari-light-x", `${x - box.left}px`);
      element.style.setProperty("--akari-light-y", `${y - box.top}px`);
    }
  }

  function onPointer(event: PointerEvent): void {
    document.documentElement.toggleAttribute(
      HOVER_ATTRIBUTE,
      event.pointerType === "mouse" || event.pointerType === "pen",
    );
  }

  function onMove(event: PointerEvent): void {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    if (!(event.target instanceof Element)) return;
    pointer = { target: event.target, x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(apply);
  }

  watch(
    surface,
    (element, previous) => {
      previous?.removeEventListener("pointermove", onMove);
      element?.addEventListener("pointermove", onMove, { passive: true });
    },
    { immediate: true },
  );

  onMounted(() => {
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
  });

  onUnmounted(() => {
    if (frame) cancelAnimationFrame(frame);
    surface.value?.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("pointerdown", onPointer);
    document.documentElement.removeAttribute(HOVER_ATTRIBUTE);
  });
}
