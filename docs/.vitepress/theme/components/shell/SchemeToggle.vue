<script setup lang="ts">
import { computed, nextTick } from "vue";

import { useAkariColorScheme } from "../../composables/useColorScheme";
import { useAkariI18n } from "../../composables/useI18n";
import { useAkariConfig } from "../../composables/useAkariConfig";
import { SCHEME_OPTIONS } from "../../constants";

// How long the snackbar naming the new mode stays.
const SNACKBAR_DURATION = 2500;

withDefaults(
  defineProps<{
    idPrefix?: string;
    tooltipPosition?: "above" | "below" | "before" | "after";
  }>(),
  { idPrefix: "akari-scheme", tooltipPosition: "after" },
);

const config = useAkariConfig();
const { t } = useAkariI18n();
const { mode, resolved, cycle } = useAkariColorScheme();

const visible = computed(() => config.value.settings.showSchemeToggle);
const option = computed(() => SCHEME_OPTIONS[mode.value]);
const label = computed(() =>
  t("schemeToggle", { mode: t(option.value.message) }),
);

/**
 * Steps to the next mode and says so in a snackbar, naming the mode and,
 * for the two that follow something (the system, the time of day), what
 * that comes to now. A press while one shows replaces it. The snackbar
 * module loads in the browser only; m3e registers it there already.
 */
async function step(): Promise<void> {
  cycle();
  await nextTick();

  const name = t(SCHEME_OPTIONS[mode.value].message);
  const follows = mode.value === "auto" || mode.value === "time";
  const message =
    follows && resolved.value
      ? t("schemeChangedFollowing", {
          mode: name,
          scheme: t(resolved.value === "dark" ? "schemeDark" : "schemeLight"),
        })
      : t("schemeChanged", { mode: name });

  const { M3eSnackbar } = await import("@m3e/web/snackbar");
  M3eSnackbar.open(message, { duration: SNACKBAR_DURATION });
}
</script>

<template>
  <!--
    A round outlined icon button, like the language button below it. Each
    press steps to the next appearance: system, light, dark, time of day. The
    icon shows the chosen mode, the label names it.
  -->
  <div v-if="visible" class="akari-scheme-toggle">
    <m3e-icon-button
      :id="`${idPrefix}-button`"
      class="akari-scheme-toggle__button"
      variant="outlined"
      :aria-label="label"
      @click="step"
    >
      <m3e-icon :name.attr="option.icon"></m3e-icon>
    </m3e-icon-button>
    <m3e-tooltip :for="`${idPrefix}-button`" :position="tooltipPosition">
      {{ label }}
    </m3e-tooltip>
  </div>
</template>

<style scoped>
.akari-scheme-toggle {
  display: flex;
  flex: none;
}
</style>
