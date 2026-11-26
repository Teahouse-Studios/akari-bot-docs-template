import { computed, type ComputedRef, type Ref } from "vue";
import { useData } from "vitepress";
import heroColors from "virtual:akari-hero-colors";

import type { ResolvedHero } from "../hero";
import { resolveHeroColor } from "../heroColorCache";
import type { AkariResolvedScheme } from "../scheme";

/**
 * The theme seed a hero page asks for, read from the colors sampled while
 * the site was built: the color of the image the current scheme shows (the
 * dark image in the dark scheme), the page's fixed `hero.color`, or null to
 * keep the reader's color. No image is loaded or read for this.
 */
export function useHeroColor(
  hero: ComputedRef<ResolvedHero | null>,
  scheme: Readonly<Ref<AkariResolvedScheme | null>>,
): Readonly<Ref<string | null>> {
  const { page } = useData();

  return computed(() =>
    resolveHeroColor(
      hero.value,
      scheme.value,
      heroColors,
      page.value.filePath,
    ),
  );
}
