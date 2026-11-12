<script setup lang="ts">
import { computed } from "vue";

import { dataSegments } from "./facts";
import ModuleFactLine from "./ModuleFactLine.vue";

// 布尔 prop 缺省会按 false 传下来，这里显式取 true，保持「默认列出表名」的行为。
const props = withDefaults(
  defineProps<{
    tables?: string | string[];
    model?: string;
    list?: boolean;
  }>(),
  { list: true },
);

const segments = computed(() => dataSegments(props));
</script>

<template>
  <ModuleFactLine kind="data" :segments="segments" />
</template>
