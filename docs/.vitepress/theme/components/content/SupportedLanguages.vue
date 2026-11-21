<script setup lang="ts">
import { computed } from "vue";

import { useAkariConfig } from "../../composables/useAkariConfig";

const config = useAkariConfig();
const languages = computed(() => Object.values(config.value.languages));

function separator(index: number): string {
  return index === languages.value.length - 2 ? " 与 " : "、";
}
</script>

<template>
  <span class="supported-languages" aria-label="支持的语言">
    <template v-for="(label, index) in languages" :key="label">
      <code>{{ label }}</code>
      <template v-if="index < languages.length - 1">{{ separator(index) }}</template>
    </template>
    <span v-if="!languages.length">以已安装包为准</span>
  </span>
</template>
