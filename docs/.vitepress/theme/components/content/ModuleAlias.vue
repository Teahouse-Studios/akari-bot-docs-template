<script setup lang="ts">
import { computed } from "vue";

import { aliasNames } from "./facts";

const props = defineProps<{ names?: string | string[] }>();

const items = computed(() => aliasNames(props.names));
</script>

<template>
  <p v-if="items.length" class="module-alias">
    <span class="module-alias__label">
      <m3e-icon class="module-alias__icon" name="sell"></m3e-icon>别名
    </span>
    <code v-for="name in items" :key="name">{{ name }}</code>
  </p>
</template>
