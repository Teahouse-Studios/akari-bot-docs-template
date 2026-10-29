<script setup lang="ts">
import { computed } from "vue";

import { useAkariI18n } from "../../composables/useI18n";
import { useAkariConfig } from "../../composables/useAkariConfig";
import { useAkariSettingsDialog } from "../../composables/useSettingsDialog";
import { AKARI_SETTINGS_ID } from "../../constants";
import MorphDialog from "../shell/MorphDialog.vue";
import SettingsPanel from "./SettingsPanel.vue";

const config = useAkariConfig();
const { t } = useAkariI18n();
const dialog = useAkariSettingsDialog();

// `akari.components.Settings` replaces the panel inside the dialog.
const panel = computed(() => config.value.components.Settings ?? SettingsPanel);
</script>

<template>
  <MorphDialog
    class="akari-settings-dialog"
    :state="dialog"
    title-id="akari-settings-dialog-title"
    :title="config.settings.title"
    icon="settings"
    :close-label="t('settingsClose')"
    width="560px"
  >
    <div :id="AKARI_SETTINGS_ID" class="akari-settings-dialog__body">
      <component :is="panel" />
    </div>
  </MorphDialog>
</template>

<style scoped>
/*
 * A column, so the panel shrinks to the dialog's height and scrolls itself
 * (in a row its 100% height would not resolve, and it would grow to its
 * content, past the dialog's edge).
 */
.akari-settings-dialog__body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
}
</style>
