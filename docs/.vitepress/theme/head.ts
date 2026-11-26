import type { HeadConfig } from "vitepress";

import { SETTINGS_STORAGE_KEY } from "./constants";
import { schemeScript } from "./scheme";
import type { AkariColorScheme } from "./types";

export interface AkariHeadOptions {
  /** Same as `akari.settings.storageKey`. */
  storageKey?: string;
  /** Same as `akari.settings.defaults.scheme`. */
  defaultScheme?: AkariColorScheme;
}

/**
 * Head tags the theme needs, for the site config's `head`: a small script
 * that applies the reader's appearance before the first paint, and — without
 * scripts — rules hiding the loading bar and the boot skeleton no script
 * would ever finish. The boot's watchdog is not here: it is a deferred file
 * of its own, so the skeleton can paint before it is even fetched (see
 * `theme/boot.ts`). Pair this with `appearance: false`, which leaves light
 * and dark to the theme. The fonts' tags belong to each language
 * (`akariContent`), as the fonts do.
 */
export function akariHead(options: AkariHeadOptions = {}): HeadConfig[] {
  return [
    [
      "noscript",
      {},
      "<style>.akari-loading-bar,#akari-boot .akari-boot__bar,#akari-boot .akari-boot__frame{display:none}</style>",
    ],
    [
      "script",
      {},
      schemeScript(
        options.storageKey ?? SETTINGS_STORAGE_KEY,
        options.defaultScheme ?? "auto",
      ),
    ],
  ];
}
