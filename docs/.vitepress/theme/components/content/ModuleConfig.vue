<script setup lang="ts">
import { computed } from "vue";

import { configSegments } from "./facts";
import ModuleFactLine from "./ModuleFactLine.vue";

const props = defineProps<{ table?: string; file?: string }>();

const segments = computed(() => configSegments(props));
</script>

<template>
  <ModuleFactLine kind="config" :segments="segments" />
</template>
