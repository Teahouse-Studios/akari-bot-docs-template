<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vitepress";

import { AKARI_CONTENT_ID } from "../../constants";
import { useReview, type ReviewAnnotation } from "../../composables/useReview";

const route = useRoute();
const review = useReview();

const editorOpen = ref(false);
const quote = ref("");
const comment = ref("");
const editorStyle = ref<Record<string, string>>({});
const textarea = ref<HTMLTextAreaElement | null>(null);

const quickPhrases = [
  "太长",
  "拆成两句",
  "改成列表",
  "删掉",
  "补一句",
  "不要缩写",
  "不必解释",
  "语气生硬",
  "读不通",
  "重复",
];

function closeEditor(): void {
  editorOpen.value = false;
  quote.value = "";
  comment.value = "";
  editorStyle.value = {};
}

function captureSelection(event: MouseEvent): void {
  if (!review.enabled.value || editorOpen.value) return;
  if (
    event.target instanceof Element &&
    event.target.closest(".akari-review__editor")
  ) {
    return;
  }

  const prose = document.querySelector<HTMLElement>(
    `#${AKARI_CONTENT_ID} .akari-prose`,
  );
  const selection = window.getSelection();
  if (
    !prose ||
    !selection ||
    selection.isCollapsed ||
    selection.rangeCount === 0
  ) {
    return;
  }

  const range = selection.getRangeAt(0);
  if (!prose.contains(range.commonAncestorContainer)) return;

  const text = selection.toString().replace(/\s+/g, " ").trim();
  if (text.length < 2) return;

  quote.value = text;
  comment.value = "";
  editorOpen.value = true;

  const rect = range.getBoundingClientRect();
  const width = Math.min(360, window.innerWidth - 32);
  const left = Math.min(
    Math.max(16, rect.left),
    Math.max(16, window.innerWidth - width - 16),
  );
  const estimatedHeight = 300;
  const below = rect.bottom + 12;
  const top =
    below + estimatedHeight <= window.innerHeight
      ? below
      : Math.max(16, rect.top - estimatedHeight - 12);
  editorStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
  };

  void nextTick(() => textarea.value?.focus());
}

function insertPhrase(phrase: string): void {
  const field = textarea.value;
  const start = field?.selectionStart ?? comment.value.length;
  const end = field?.selectionEnd ?? start;
  const before = comment.value.slice(0, start);
  const after = comment.value.slice(end);
  const separator = before && !/[。；;，,\s]$/.test(before) ? "，" : "";
  const inserted = `${separator}${phrase}。`;
  comment.value = `${before}${inserted}${after}`;
  const cursor = before.length + inserted.length;
  void nextTick(() => {
    field?.focus();
    field?.setSelectionRange(cursor, cursor);
  });
}

function save(): void {
  review.addAnnotation(quote.value, comment.value);
  closeEditor();
  void nextTick(paintHighlights);
}

function collectText(root: HTMLElement): {
  nodes: Text[];
  starts: number[];
  text: string;
} {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  const starts: number[] = [];
  let text = "";
  let node: Node | null = walker.nextNode();
  while (node) {
    if (node instanceof Text && node.data) {
      const parent = node.parentElement;
      if (parent && !parent.closest("script, style, .akari-review")) {
        starts.push(text.length);
        nodes.push(node);
        text += node.data;
      }
    }
    node = walker.nextNode();
  }
  return { nodes, starts, text };
}

function rangeFor(
  nodes: Text[],
  starts: number[],
  text: string,
  needle: string,
  from: number,
): Range | null {
  const index = text.indexOf(needle, from);
  if (index < 0) return null;

  const find = (offset: number): { node: Text; offset: number } | null => {
    for (let i = nodes.length - 1; i >= 0; i -= 1) {
      if (starts[i] <= offset) {
        return { node: nodes[i], offset: offset - starts[i] };
      }
    }
    return null;
  };

  const start = find(index);
  const end = find(index + needle.length);
  if (!start || !end) return null;

  try {
    const range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    return range;
  } catch {
    return null;
  }
}

function paintHighlights(): void {
  const api = (window as unknown as {
    CSS?: { highlights?: Map<string, unknown> };
  }).CSS;
  const HighlightCtor = (window as unknown as {
    Highlight?: new (...ranges: Range[]) => unknown;
  }).Highlight;
  if (!api?.highlights || !HighlightCtor) return;

  const prose = document.querySelector<HTMLElement>(
    `#${AKARI_CONTENT_ID} .akari-prose`,
  );
  if (!prose) return;

  const { nodes, starts, text } = collectText(prose);
  const ranges: Range[] = [];
  const seen = new Map<string, number>();

  for (const item of review.current.value as ReviewAnnotation[]) {
    const start = seen.get(item.quote) ?? 0;
    const range = rangeFor(nodes, starts, text, item.quote, start);
    if (range) {
      ranges.push(range);
      seen.set(item.quote, start + item.quote.length);
    }
  }

  if (ranges.length) {
    api.highlights.set("akari-review", new HighlightCtor(...ranges));
  } else {
    api.highlights.delete("akari-review");
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && editorOpen.value) closeEditor();
}

watch(
  () => route.path,
  () => {
    closeEditor();
    void nextTick(paintHighlights);
  },
);

watch(
  () => review.current.value.map((item) => item.id).join(","),
  () => void nextTick(paintHighlights),
);

onMounted(() => {
  window.addEventListener("mouseup", captureSelection);
  window.addEventListener("keydown", onKeydown);
  void nextTick(paintHighlights);
});

onUnmounted(() => {
  window.removeEventListener("mouseup", captureSelection);
  window.removeEventListener("keydown", onKeydown);
});

</script>

<template>
  <form
    v-if="editorOpen"
    class="akari-review__editor"
    :style="editorStyle"
    aria-label="添加页面标注"
    @submit.prevent="save"
    @click.stop
  >
    <p class="akari-review__quote">{{ quote }}</p>
    <div class="akari-review__phrases" aria-label="常用语">
      <span class="akari-review__phrases-label">常用语</span>
      <button
        v-for="phrase in quickPhrases"
        :key="phrase"
        type="button"
        @click="insertPhrase(phrase)"
      >
        {{ phrase }}
      </button>
    </div>
    <textarea
      ref="textarea"
      v-model="comment"
      rows="4"
      placeholder="写注释，或点上面的常用语。"
    ></textarea>
    <div class="akari-review__editor-actions">
      <button type="button" @click="closeEditor">取消</button>
      <button type="submit" class="akari-review__primary">保存</button>
    </div>
  </form>
</template>

<style scoped>
.akari-review__editor {
  position: fixed;
  z-index: 90;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 16px;
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
}

.akari-review__quote {
  max-height: 72px;
  margin: 0 0 8px;
  overflow: auto;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.akari-review__phrases {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-block-end: 8px;
}

.akari-review__phrases-label {
  margin-inline-end: 2px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.75rem;
}

.akari-review__phrases button {
  min-height: 28px;
  padding: 0 9px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 999px;
  background: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-on-surface-variant);
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 160ms ease, border-color 160ms ease;
}

.akari-review__phrases button:hover,
.akari-review__phrases button:focus-visible {
  border-color: var(--md-sys-color-primary);
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.akari-review__editor textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 80px;
  padding: 8px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 10px;
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
}

.akari-review__editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-block-start: 8px;
}

.akari-review__editor-actions button {
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

.akari-review__primary {
  background: var(--md-sys-color-primary) !important;
  border-color: var(--md-sys-color-primary) !important;
  color: var(--md-sys-color-on-primary) !important;
}
</style>

<style>
::highlight(akari-review) {
  background: color-mix(in srgb, var(--md-sys-color-primary) 26%, transparent);
  text-decoration: underline;
  text-decoration-color: var(--md-sys-color-primary);
}
</style>
