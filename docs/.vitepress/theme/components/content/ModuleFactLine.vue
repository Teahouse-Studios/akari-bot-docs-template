<script setup lang="ts">
import type { FactSegment } from "./facts";

defineProps<{ segments: FactSegment[]; kind: string }>();
</script>

<template>
  <div class="module-fact" :class="`module-fact--${kind}`">
    <p class="module-fact__text">
      <component
        :is="'code' in segment ? 'code' : 'span'"
        v-for="(segment, index) in segments"
        :key="index"
        >{{ "code" in segment ? segment.code : segment.text }}</component
      >
    </p>
  </div>
</template>
