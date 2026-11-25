<script setup lang="ts">
import { computed, nextTick } from "vue";

import { useAkariI18n } from "../../composables/useI18n";
import { useAkariConfig } from "../../composables/useAkariConfig";
import { useAkariSettings } from "../../composables/useSettings";
import {
  CONTRAST_OPTIONS,
  CONTRAST_VALUES,
  DIRECTION_OPTIONS,
  DIRECTION_VALUES,
  MOTION_OPTIONS,
  MOTION_VALUES,
  TEXT_SIZE_OPTIONS,
  TEXT_SIZE_VALUES,
  VARIANT_OPTIONS,
  VARIANT_VALUES,
} from "../../constants";
import type { SettingsSectionKey } from "../../types";
import SettingsSection from "./SettingsSection.vue";

defineOptions({ inheritAttrs: false });

const config = useAkariConfig();
const { t } = useAkariI18n();
const api = useAkariSettings();
const { settings } = api;

const sections = computed(() => config.value.settings.sections);
const labels = computed(() => config.value.settings.labels);

const HEADING_IDS: Record<SettingsSectionKey, string> = {
  color: "akari-settings-color",
  variant: "akari-settings-variant",
  contrast: "akari-settings-contrast",
  motion: "akari-settings-motion",
  direction: "akari-settings-direction",
  textSize: "akari-settings-text-size",
};

interface ValueControl extends EventTarget {
  value?: string | readonly string[] | null;
}

interface SelectableChip extends HTMLElement {
  selected: boolean;
  value: string;
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// Selection is bound with `.prop` throughout. Bound as attributes, Vue writes
// `checked="false"` on segments m3e has not upgraded yet, which Lit then
// reads as checked; the single-select group keeps the first of them, so the
// panel showed the first option instead of the stored setting.

function stringValue(event: Event): string | undefined {
  const control = event.currentTarget as ValueControl | null;
  const value = control?.value;
  return typeof value === "string" ? value : undefined;
}

function oneOf<T extends string>(
  values: readonly T[],
  value: string | undefined,
): value is T {
  return (
    typeof value === "string" && (values as readonly string[]).includes(value)
  );
}

function onColorChange(event: Event): void {
  const value = (event.currentTarget as HTMLInputElement | null)?.value;

  if (value && HEX_COLOR.test(value)) {
    api.setSetting("color", value.toLowerCase());
  }
}

function syncVariantChips(chipSet: HTMLElement | null): void {
  if (!chipSet) return;

  chipSet.querySelectorAll<SelectableChip>("m3e-filter-chip").forEach((chip) => {
    chip.selected = chip.value === settings.variant;
  });
}

function onVariantChange(event: Event): void {
  const chipSet = event.currentTarget as HTMLElement | null;
  const value = stringValue(event);

  if (oneOf(VARIANT_VALUES, value)) {
    api.setSetting("variant", value);
    return;
  }

  // A single-select filter chip set can be left empty when the active chip is
  // clicked again. Restore the chip matching the current setting.
  void nextTick(() => syncVariantChips(chipSet));
}

function onContrastChange(event: Event): void {
  const value = stringValue(event);

  if (oneOf(CONTRAST_VALUES, value)) {
    api.setSetting("contrast", value);
  }
}

function onMotionChange(event: Event): void {
  const value = stringValue(event);

  if (oneOf(MOTION_VALUES, value)) {
    api.setSetting("motion", value);
  }
}

function onDirectionChange(event: Event): void {
  const value = stringValue(event);

  if (oneOf(DIRECTION_VALUES, value)) {
    api.setSetting("direction", value);
  }
}

function onTextSizeChange(event: Event): void {
  const value = stringValue(event);

  if (oneOf(TEXT_SIZE_VALUES, value)) {
    api.setSetting("textSize", value);
  }
}
</script>

<template>
  <!-- The body of the settings dialog, which carries its title. -->
  <div v-bind="$attrs" class="akari-settings">
    <template v-for="section in sections" :key="section">
      <SettingsSection
        v-if="section === 'color'"
        :id="HEADING_IDS.color"
        :label="labels.color"
      >
        <input
          class="akari-settings__color"
          type="color"
          :value="settings.color"
          :aria-labelledby="HEADING_IDS.color"
          @change="onColorChange"
        />
      </SettingsSection>

      <SettingsSection
        v-else-if="section === 'variant'"
        :id="HEADING_IDS.variant"
        :label="labels.variant"
      >
        <m3e-filter-chip-set
          :aria-labelledby="HEADING_IDS.variant"
          @change="onVariantChange"
        >
          <m3e-filter-chip
            v-for="option in VARIANT_OPTIONS"
            :key="option.value"
            :selected.prop="settings.variant === option.value"
            :value="option.value"
          >{{ option.label }}</m3e-filter-chip>
        </m3e-filter-chip-set>
      </SettingsSection>

      <SettingsSection
        v-else-if="section === 'contrast'"
        :id="HEADING_IDS.contrast"
        :label="labels.contrast"
      >
        <m3e-segmented-button
          :aria-labelledby="HEADING_IDS.contrast"
          @change="onContrastChange"
        >
          <m3e-button-segment
            v-for="option in CONTRAST_OPTIONS"
            :key="option.value"
            :checked.prop="settings.contrast === option.value"
            :value="option.value"
          >{{ t(option.message) }}</m3e-button-segment>
        </m3e-segmented-button>
      </SettingsSection>

      <SettingsSection
        v-else-if="section === 'motion'"
        :id="HEADING_IDS.motion"
        :label="labels.motion"
      >
        <m3e-segmented-button
          :aria-labelledby="HEADING_IDS.motion"
          @change="onMotionChange"
        >
          <m3e-button-segment
            v-for="option in MOTION_OPTIONS"
            :key="option.value"
            :checked.prop="settings.motion === option.value"
            :value="option.value"
          >{{ t(option.message) }}</m3e-button-segment>
        </m3e-segmented-button>
      </SettingsSection>

      <SettingsSection
        v-else-if="section === 'direction'"
        :id="HEADING_IDS.direction"
        :label="labels.direction"
      >
        <m3e-segmented-button
          :aria-labelledby="HEADING_IDS.direction"
          @change="onDirectionChange"
        >
          <m3e-button-segment
            v-for="option in DIRECTION_OPTIONS"
            :key="option.value"
            :checked.prop="settings.direction === option.value"
            :value="option.value"
          ><m3e-icon slot="icon" :name.attr="option.icon"></m3e-icon>{{ t(option.message) }}</m3e-button-segment>
        </m3e-segmented-button>
      </SettingsSection>

      <SettingsSection
        v-else-if="section === 'textSize'"
        :id="HEADING_IDS.textSize"
        :label="labels.textSize"
      >
        <m3e-segmented-button
          :aria-labelledby="HEADING_IDS.textSize"
          @change="onTextSizeChange"
        >
          <m3e-button-segment
            v-for="option in TEXT_SIZE_OPTIONS"
            :key="option.value"
            :checked.prop="settings.textSize === option.value"
            :value="option.value"
          >{{ option.label }}</m3e-button-segment>
        </m3e-segmented-button>
      </SettingsSection>
    </template>
  </div>
</template>
