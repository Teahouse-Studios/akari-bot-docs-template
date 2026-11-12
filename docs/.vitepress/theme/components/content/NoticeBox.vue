<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    type?: string
    title?: string
  }>(),
  { type: "info", title: "" },
)

const titles: Record<string, string> = {
  info: "提示",
  tip: "提示",
  warning: "警告",
  danger: "危险",
  example: "示例",
  help: "帮助",
  deprecated: "已弃用",
}

const icons: Record<string, string[]> = {
  info: [
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18",
    "M12 11v5.4",
    "M12 7.6v.6",
  ],
  help: [
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18",
    "M9.4 9.7a2.6 2.6 0 1 1 3.9 2.3c-.8.5-1.2 1.1-1.2 2v.3",
    "M12 17.1v.6",
  ],
  tip: [
    "M12 3.5a5.8 5.8 0 0 0-3.3 10.6c.5.3.8.9.8 1.5v.3h5v-.3c0-.6.3-1.2.8-1.5A5.8 5.8 0 0 0 12 3.5z",
    "M9.9 19h4.2",
    "M10.6 21h2.8",
  ],
  example: [
    "M12 3.5a5.8 5.8 0 0 0-3.3 10.6c.5.3.8.9.8 1.5v.3h5v-.3c0-.6.3-1.2.8-1.5A5.8 5.8 0 0 0 12 3.5z",
    "M9.9 19h4.2",
    "M10.6 21h2.8",
  ],
  warning: [
    "M12 4.2 3.4 19.4c-.3.5.1 1.1.7 1.1h15.8c.6 0 1-.6.7-1.1L12 4.2z",
    "M12 9.6v4.2",
    "M12 16.9v.5",
  ],
  danger: [
    "M12 3.4 3.4 12l8.6 8.6L20.6 12 12 3.4z",
    "M12 8.2v4.6",
    "M12 15.6v.5",
  ],
  deprecated: [
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18",
    "M6.4 6.4 17.6 17.6",
  ],
}

const heading = computed(() => props.title || titles[props.type] || "提示")
const iconPaths = computed(() => icons[props.type] || icons.info)
</script>

<template>
  <aside class="notice-box" :class="`notice-box--${props.type}`">
    <p class="notice-box__title">
      <svg class="notice-box__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path v-for="d in iconPaths" :key="d" :d="d" />
      </svg>
      {{ heading }}
    </p>
    <div class="notice-box__body">
      <slot />
    </div>
  </aside>
</template>
