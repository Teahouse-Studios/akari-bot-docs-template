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
const editor = ref<HTMLElement | null>(null);
const textarea = ref<HTMLTextAreaElement | null>(null);
const viewerOpen = ref(false);
const activeAnnotation = ref<ReviewAnnotation | null>(null);
const viewerStyle = ref<Record<string, string>>({});
const viewer = ref<HTMLElement | null>(null);
let anchorRange: Range | null = null;
let activeRange: Range | null = null;
let annotationRanges: { item: ReviewAnnotation; range: Range }[] = [];
let viewportFrame = 0;

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
  anchorRange = null;
  quote.value = "";
  comment.value = "";
  editorStyle.value = {};
}

function closeViewer(): void {
  viewerOpen.value = false;
  activeAnnotation.value = null;
  activeRange = null;
  viewerStyle.value = {};
}

function rectOf(range: Range | null): DOMRect | null {
  if (!range) return null;
  const rect = range.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  if (rect.bottom < 0 || rect.top > window.innerHeight) return null;
  return rect;
}

function floatingStyle(
  rect: DOMRect,
  width: number,
  idealHeight: number,
): Record<string, string> {
  const margin = 12;
  const gap = 10;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const safeWidth = Math.min(width, viewportWidth - margin * 2);
  const left = Math.round(
    Math.min(
      Math.max(margin, rect.left + rect.width / 2 - safeWidth / 2),
      viewportWidth - safeWidth - margin,
    ),
  );
  const below = rect.bottom + gap;
  const above = rect.top - gap;
  const spaceBelow = Math.max(0, viewportHeight - below - margin);
  const spaceAbove = Math.max(0, above - margin);
  const safeHeight = Math.min(idealHeight, viewportHeight - margin * 2);
  const openBelow =
    spaceBelow >= Math.min(safeHeight, 220) || spaceBelow >= spaceAbove;
  let top = openBelow ? below : above - safeHeight;
  if (top < margin) top = margin;
  if (top + safeHeight > viewportHeight - margin) {
    top = Math.max(margin, viewportHeight - margin - safeHeight);
  }
  return {
    left: `${left}px`,
    top: `${Math.round(top)}px`,
    width: `${safeWidth}px`,
  };
}

function positionEditor(): void {
  if (!editorOpen.value) return;
  const rect = rectOf(anchorRange);
  if (!rect) {
    closeEditor();
    return;
  }
  const measured = editor.value?.offsetHeight || 320;
  editorStyle.value = floatingStyle(
    rect,
    Math.min(360, window.innerWidth - 24),
    Math.min(Math.max(measured, 240), 440),
  );
}

function positionViewer(): void {
  if (!viewerOpen.value) return;
  const rect = rectOf(activeRange);
  if (!rect) {
    closeViewer();
    return;
  }
  const measured = viewer.value?.offsetHeight || 220;
  viewerStyle.value = floatingStyle(
    rect,
    Math.min(340, window.innerWidth - 24),
    measured,
  );
}

function onViewportChange(): void {
  if (viewportFrame) return;
  viewportFrame = window.requestAnimationFrame(() => {
    viewportFrame = 0;
    positionEditor();
    positionViewer();
  });
}

function removeActiveAnnotation(): void {
  if (activeAnnotation.value) review.removeAnnotation(activeAnnotation.value.id);
  closeViewer();
  void nextTick(paintHighlights);
}

function captureSelection(event: MouseEvent): void {
  if (!review.enabled.value) return;
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

  closeViewer();
  quote.value = text;
  comment.value = "";
  editorOpen.value = true;
  anchorRange = range.cloneRange();
  void nextTick(() => {
    positionEditor();
    textarea.value?.focus();
  });
}

type CaretDocument = Document & {
  caretRangeFromPoint?: (x: number, y: number) => Range | null;
  caretPositionFromPoint?: (x: number, y: number) => {
    offsetNode: Node;
    offset: number;
  } | null;
};

function annotationAt(
  x: number,
  y: number,
): { item: ReviewAnnotation; range: Range } | null {
  for (const match of annotationRanges) {
    for (const rect of Array.from(match.range.getClientRects())) {
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return match;
      }
    }
  }

  const doc = document as CaretDocument;
  let caret: Range | null = null;
  if (doc.caretRangeFromPoint) {
    caret = doc.caretRangeFromPoint(x, y);
  } else if (doc.caretPositionFromPoint) {
    const point = doc.caretPositionFromPoint(x, y);
    if (point) {
      caret = document.createRange();
      caret.setStart(point.offsetNode, point.offset);
      caret.collapse(true);
    }
  }
  if (!caret) return null;
  return (
    annotationRanges.find(({ range }) =>
      range.isPointInRange(caret.startContainer, caret.startOffset),
    ) ?? null
  );
}

function onProseClick(event: MouseEvent): void {
  const target = event.target instanceof Element ? event.target : null;
  if (target?.closest(".akari-review__editor, .akari-review__viewer")) return;

  const prose = document.querySelector<HTMLElement>(
    `#${AKARI_CONTENT_ID} .akari-prose`,
  );
  if (!prose) return;
  if (!target || !prose.contains(target)) {
    closeViewer();
    return;
  }
  if (editorOpen.value) return;

  const selection = window.getSelection();
  if (selection && !selection.isCollapsed) return;
  if (target.closest("a, button, summary, input, textarea, select, label")) {
    return;
  }

  const found = annotationAt(event.clientX, event.clientY);
  if (!found) {
    closeViewer();
    return;
  }

  closeEditor();
  activeAnnotation.value = found.item;
  activeRange = found.range.cloneRange();
  viewerOpen.value = true;
  void nextTick(positionViewer);
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

interface TextPoint {
  node: Text;
  start: number;
  end: number;
}

const BLOCK_SELECTOR =
  "p, li, h1, h2, h3, h4, h5, h6, pre, blockquote, td, th, dt, dd, figcaption";

function collectText(root: HTMLElement): { points: TextPoint[]; text: string } {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const points: TextPoint[] = [];
  let text = "";
  let lastBlock: Element | null = null;
  let node: Node | null = walker.nextNode();

  while (node) {
    if (node instanceof Text && node.data) {
      const parent = node.parentElement;
      if (parent && !parent.closest("script, style, .akari-review")) {
        const block = parent.closest(BLOCK_SELECTOR) ?? parent;
        const afterBreak =
          node.previousSibling instanceof HTMLElement &&
          node.previousSibling.tagName === "BR";
        if (block !== lastBlock || afterBreak) {
          if (text && !text.endsWith(" ")) {
            text += " ";
            points.push({ node, start: 0, end: 0 });
          }
          lastBlock = block;
        }
        for (let i = 0; i < node.data.length; i += 1) {
          const char = node.data[i];
          if (/\s/.test(char)) {
            if (!text.endsWith(" ")) {
              text += " ";
              points.push({ node, start: i, end: i + 1 });
            }
          } else {
            text += char;
            points.push({ node, start: i, end: i + 1 });
          }
        }
      }
    }
    node = walker.nextNode();
  }
  return { points, text };
}

function rangeFor(
  points: TextPoint[],
  text: string,
  needle: string,
  from: number,
): Range | null {
  const index = text.indexOf(needle, from);
  if (index < 0 || !needle.length) return null;

  const start = points[index];
  const end = points[index + needle.length - 1];
  if (!start || !end) return null;

  try {
    const range = document.createRange();
    range.setStart(start.node, start.start);
    range.setEnd(end.node, end.end);
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
  const prose = document.querySelector<HTMLElement>(
    `#${AKARI_CONTENT_ID} .akari-prose`,
  );
  if (!prose) return;

  const { points, text } = collectText(prose);
  const ranges: Range[] = [];
  const matches: { item: ReviewAnnotation; range: Range }[] = [];
  const seen = new Map<string, number>();

  for (const item of review.current.value as ReviewAnnotation[]) {
    const start = seen.get(item.quote) ?? 0;
    const range = rangeFor(points, text, item.quote, start);
    if (range) {
      ranges.push(range);
      matches.push({ item, range });
      seen.set(item.quote, start + item.quote.length);
    }
  }
  annotationRanges = matches;

  if (!api?.highlights || !HighlightCtor) return;
  if (ranges.length) {
    api.highlights.set("akari-review", new HighlightCtor(...ranges));
  } else {
    api.highlights.delete("akari-review");
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== "Escape") return;
  if (editorOpen.value) closeEditor();
  else if (viewerOpen.value) closeViewer();
}

watch(
  () => route.path,
  () => {
    closeEditor();
    closeViewer();
    void nextTick(paintHighlights);
  },
);

watch(
  () => review.current.value.map((item) => item.id).join(","),
  () => {
    if (
      activeAnnotation.value &&
      !review.current.value.some(
        (item) => item.id === activeAnnotation.value?.id,
      )
    ) {
      closeViewer();
    }
    void nextTick(paintHighlights);
  },
);

onMounted(() => {
  window.addEventListener("mouseup", captureSelection);
  window.addEventListener("click", onProseClick);
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("scroll", onViewportChange, true);
  window.addEventListener("resize", onViewportChange);
  void nextTick(paintHighlights);
});

onUnmounted(() => {
  if (viewportFrame) window.cancelAnimationFrame(viewportFrame);
  window.removeEventListener("mouseup", captureSelection);
  window.removeEventListener("click", onProseClick);
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("scroll", onViewportChange, true);
  window.removeEventListener("resize", onViewportChange);
});

</script>

<template>
  <form
    v-if="editorOpen"
    ref="editor"
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

  <div
    v-if="viewerOpen && activeAnnotation"
    ref="viewer"
    class="akari-review__viewer"
    :style="viewerStyle"
    role="dialog"
    aria-label="查看页面标注"
    @click.stop
  >
    <p class="akari-review__quote">{{ activeAnnotation.quote }}</p>
    <p v-if="activeAnnotation.comment" class="akari-review__comment">
      {{ activeAnnotation.comment }}
    </p>
    <div class="akari-review__editor-actions">
      <button type="button" @click="removeActiveAnnotation">移除此标注</button>
      <button type="button" @click="closeViewer">关闭</button>
    </div>
  </div>
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
  overflow: visible;
}

.akari-review__viewer {
  position: fixed;
  z-index: 91;
  box-sizing: border-box;
  padding: 12px;
  overflow: visible;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 16px;
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
}

.akari-review__comment {
  margin: 0;
  color: var(--md-sys-color-on-surface);
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.akari-review__quote {
  margin: 0 0 8px;
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
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  -webkit-text-decoration-skip-ink: none;
  text-decoration-skip-ink: none;
}
</style>
