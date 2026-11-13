<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    url?: string;
    image?: string;
    domain?: string;
  }>(),
  { description: "", url: "", image: "", domain: "" },
);

const host = computed(() => {
  if (props.domain) {
    return props.domain;
  }
  if (!props.url) {
    return "";
  }
  try {
    return new URL(props.url).host;
  } catch {
    return props.url;
  }
});
</script>

<template>
  <component
    :is="props.url ? 'a' : 'div'"
    class="wiki-card"
    :href="props.url || undefined"
    :target="props.url ? '_blank' : undefined"
    :rel="props.url ? 'noreferrer' : undefined"
  >
    <span class="wiki-card__main">
      <span class="wiki-card__copy">
        <span class="wiki-card__title">{{ props.title }}</span>
        <span v-if="props.description" class="wiki-card__description">{{ props.description }}</span>
      </span>
      <img v-if="props.image" class="wiki-card__image" :src="props.image" alt="" loading="lazy" />
    </span>
    <span v-if="host" class="wiki-card__footer">
      <m3e-icon name="link" aria-hidden="true"></m3e-icon>
      <span>{{ host }}</span>
    </span>
  </component>
</template>
