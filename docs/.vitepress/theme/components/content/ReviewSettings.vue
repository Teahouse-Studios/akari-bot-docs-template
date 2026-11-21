<script setup lang="ts">
import { useReview } from "../../composables/useReview";

const review = useReview();
</script>

<template>
  <section class="akari-review-settings" aria-label="页面标注">
    <h2 class="akari-review-settings__title">页面标注</h2>

    <button
      class="akari-review-settings__switch"
      type="button"
      role="switch"
      :aria-checked="review.enabled.value"
      @click="review.toggleEnabled"
    >
      <span>启用划句标注</span>
      <span class="akari-review-settings__track" aria-hidden="true"><i></i></span>
    </button>

    <p class="akari-review-settings__hint">
      开启后关闭设置，在正文中划选句子，注释框会出现在选区旁边。
    </p>

    <div v-if="review.current.value.length" class="akari-review-settings__list">
      <article
        v-for="item in review.current.value"
        :key="item.id"
        class="akari-review-settings__item"
      >
        <blockquote>{{ item.quote }}</blockquote>
        <p v-if="item.comment">{{ item.comment }}</p>
        <button type="button" @click="review.removeAnnotation(item.id)">删除</button>
      </article>
    </div>
    <p v-else class="akari-review-settings__hint">本页还没有标注。</p>

    <p v-if="review.status.value" class="akari-review-settings__status">
      {{ review.status.value }}
    </p>

    <div class="akari-review-settings__actions">
      <button
        type="button"
        :disabled="!review.total.value"
        @click="review.copyExport"
      >复制全部</button>
      <button
        type="button"
        :disabled="!review.total.value"
        @click="review.downloadExport"
      >下载 Markdown</button>
      <button
        v-if="review.current.value.length"
        type="button"
        @click="review.clearPage"
      >清空本页</button>
      <button
        type="button"
        :disabled="!review.total.value"
        @click="review.clearAll"
      >清空全部标注</button>
    </div>
  </section>
</template>

<style scoped>
.akari-review-settings {
  display: grid;
  gap: 8px;
  padding-block-start: 16px;
  border-block-start: 1px solid var(--md-sys-color-outline-variant);
}

.akari-review-settings__title {
  margin: 0;
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-size: 0.875rem;
  font-weight: 500;
}

.akari-review-settings__switch {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.875rem;
  text-align: start;
  cursor: pointer;
}

.akari-review-settings__track {
  display: flex;
  width: 34px;
  height: 20px;
  align-items: center;
  padding: 2px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 999px;
  transition: background-color 160ms linear;
}

.akari-review-settings__track i {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--md-sys-color-on-surface-variant);
  transition: transform 160ms cubic-bezier(0.2, 0, 0, 1);
}

.akari-review-settings__switch[aria-checked="true"] .akari-review-settings__track {
  border-color: var(--md-sys-color-primary);
  background: var(--md-sys-color-primary);
}

.akari-review-settings__switch[aria-checked="true"] .akari-review-settings__track i {
  transform: translateX(14px);
  background: var(--md-sys-color-on-primary);
}

.akari-review-settings__hint,
.akari-review-settings__status {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.akari-review-settings__status {
  color: var(--md-sys-color-primary);
}

.akari-review-settings__list {
  display: grid;
  gap: 8px;
  max-height: 220px;
  overflow: auto;
}

.akari-review-settings__item {
  padding: 8px 10px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
}

.akari-review-settings__item blockquote {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.akari-review-settings__item p {
  margin: 4px 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.akari-review-settings__item button {
  margin-block-start: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--md-sys-color-primary);
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
}

.akari-review-settings__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.akari-review-settings__actions button {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 999px;
  background: transparent;
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
}

.akari-review-settings__actions button:disabled {
  opacity: 0.45;
  cursor: default;
}
</style>
