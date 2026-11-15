<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { useAkariI18n } from "../../composables/useI18n";
import { prefersReducedMotion } from "../../search/animation";
import {
  IMAGE_PREVIEW_ZOOM_STEP,
  clampImageScale,
  isImageTransformed,
  previewChrome,
  rotateImage,
  rotationFitScale,
  scaleLabel,
  uprightRotation,
  unwindRotation,
  wheelImageScale,
  zoomImageScale,
} from "../../image-preview";

interface Props {
  /** The picture the preview opens. */
  src: string;
  /** Description of the picture; empty for decoration. */
  alt?: string;
  /** Name of the button that opens the preview. */
  label?: string;
  /** Controlled visibility; `null` keeps the built-in trigger. */
  open?: boolean | null;
  /** Element a controlled preview flies out of and back into. */
  origin?: HTMLElement | null;
}

const props = withDefaults(defineProps<Props>(), { alt: "", label: "", open: null });
const emit = defineEmits<{ "update:open": [value: boolean] }>();

const { t } = useAkariI18n();

const mounted = ref(false);
const visible = ref(false);
const scale = ref(1);
const rotation = ref(0);
const offset = ref({ x: 0, y: 0 });
const imageSize = ref({ width: 0, height: 0 });
// A picture that only declares a viewBox has an intrinsic ratio but no
// intrinsic width, so it lays out at zero inside a flex box. Once it reports
// that, its width comes from the ratio against both budgets: the viewport
// width, and the height left for the picture.
const fluidWidth = ref<string | null>(null);
const ready = ref(false);
const leaving = ref(false);

const SCRIM_IN: KeyframeAnimationOptions = { duration: 350, easing: "cubic-bezier(0.05, 0.7, 0.1, 1)", fill: "forwards" };
const SCRIM_OUT: KeyframeAnimationOptions = { duration: 300, easing: "linear", fill: "forwards" };
const SCRIM_QUICK: KeyframeAnimationOptions = { duration: 160, easing: "linear", fill: "forwards" };
const dialog = ref<HTMLElement | null>(null);
const frame = ref<HTMLElement | null>(null);
const picture = ref<HTMLImageElement | null>(null);

let morph: Animation | null = null;
let scrim: Animation | null = null;
let closing = false;
let lastTrigger: HTMLElement | null = null;
let previousRootOverflow = "";
let drag: {
  pointerId: number;
  x: number;
  y: number;
  ox: number;
  oy: number;
  moved: boolean;
} | null = null;
let suppressStageClick = false;

const triggerLabel = computed(() => props.label || t("imagePreviewOpen"));

const dialogLabel = computed(() =>
  props.alt ? t("imagePreview", { alt: props.alt }) : t("imagePreviewNoAlt"),
);

const rotationFit = computed(() => {
  if (typeof window === "undefined") {
    return 1;
  }
  // The laid-out box, not the intrinsic size: a picture that filled the
  // overlay by width is far larger than its natural pixels, and that box is
  // what has to fit once it is turned on its side.
  const element = picture.value;
  const size =
    element && element.offsetWidth > 0
      ? { width: element.offsetWidth, height: element.offsetHeight }
      : imageSize.value;
  return rotationFitScale(
    rotation.value,
    size,
    { width: window.innerWidth, height: window.innerHeight },
    previewChrome(window.innerWidth),
  );
});

// Panning, turning and zooming are one chain on the picture itself, so a turn
// always pivots on the picture's own centre and a drag never orbits it.
const imageTransform = computed(
  () =>
    `translate3d(${offset.value.x}px, ${offset.value.y}px, 0) rotate(${rotation.value}deg) scale(${scale.value * rotationFit.value})`,
);

const imageStyle = computed(() => ({
  transform: imageTransform.value,
  ...(fluidWidth.value ? { inlineSize: fluidWidth.value } : {}),
}));

function resetView(): void {
  scale.value = 1;
  rotation.value = uprightRotation(rotation.value);
  offset.value = { x: 0, y: 0 };
}

function setScale(value: number): void {
  scale.value = clampImageScale(value);
}

function zoom(delta: number): void {
  scale.value = zoomImageScale(scale.value, delta);
}

function rotate(delta: number): void {
  rotation.value = rotateImage(rotation.value, delta);
}

function onWheel(event: WheelEvent): void {
  scale.value = wheelImageScale(scale.value, event.deltaY);
}

/** A drag is direct manipulation: easing it would make the picture lag the pointer. */
function holdTransition(hold: boolean): void {
  if (picture.value) {
    picture.value.style.transition = hold ? "none" : "";
  }
}

function onPointerDown(event: PointerEvent): void {
  if (event.button !== 0) {
    return;
  }
  const target = event.currentTarget as HTMLElement;
  target.setPointerCapture(event.pointerId);
  holdTransition(true);
  drag = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    ox: offset.value.x,
    oy: offset.value.y,
    moved: false,
  };
}

function onPointerMove(event: PointerEvent): void {
  if (!drag || event.pointerId !== drag.pointerId) {
    return;
  }
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) > 3) {
    drag.moved = true;
  }
  // The offset sits outside the turn in the transform chain, so a screen delta
  // is already the right amount to move: a grabbed point stays under the
  // pointer however the picture is turned.
  offset.value = { x: drag.ox + dx, y: drag.oy + dy };
}

function onPointerUp(event: PointerEvent): void {
  if (!drag || event.pointerId !== drag.pointerId) {
    return;
  }
  suppressStageClick = drag.moved;
  const target = event.currentTarget as HTMLElement;
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
  holdTransition(false);
  drag = null;
}

function onStageClick(): void {
  if (suppressStageClick) {
    suppressStageClick = false;
    return;
  }
  void close();
}

const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

function onKeydown(event: KeyboardEvent): void {
  if (!visible.value) {
    return;
  }
  if (SCROLL_KEYS.has(event.key)) {
    event.preventDefault();
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    void close();
  } else if (event.key === "+" || event.key === "=") {
    event.preventDefault();
    zoom(IMAGE_PREVIEW_ZOOM_STEP);
  } else if (event.key === "-" || event.key === "_") {
    event.preventDefault();
    zoom(-IMAGE_PREVIEW_ZOOM_STEP);
  } else if (event.key === "0") {
    event.preventDefault();
    resetView();
  } else if (event.key.toLowerCase() === "r") {
    event.preventDefault();
    rotate(event.shiftKey ? -90 : 90);
  }
}

/**
 * The picture grows out of the thumbnail it was opened from, so the overlay
 * reads as that picture enlarging rather than an unrelated sheet covering the
 * page. It is skipped once the view was panned, zoomed or rotated: there is no
 * longer a single thumbnail-sized box to fly back into.
 */
/** Waits for the picture to have a box, so the overlay is measured once. */
async function settleLayout(): Promise<void> {
  const image = picture.value;
  if (image && !image.complete) {
    await new Promise<void>((resolve) => {
      const done = (): void => {
        image.removeEventListener("load", done);
        image.removeEventListener("error", done);
        window.clearTimeout(timer);
        resolve();
      };
      const timer = window.setTimeout(done, 1200);
      image.addEventListener("load", done);
      image.addEventListener("error", done);
    });
  }
  await nextTick();
  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

/** Frames until the picture has a box; a fresh <img> is 0×0 for a frame or two. */
async function waitForBox(element: HTMLElement | null): Promise<boolean> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (element && element.getBoundingClientRect().width > 0) {
      return true;
    }
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
  }
  return false;
}

/** The scrim is part of the morph: it deepens and clears on the same beat. */
function fadeScrim(from: number, to: number, options: KeyframeAnimationOptions): Animation | null {
  const element = dialog.value;
  if (!element) {
    return null;
  }
  scrim?.cancel();
  scrim = element.animate([{ opacity: from }, { opacity: to }], options);
  return scrim;
}

async function animateOpen(trigger: HTMLElement | null): Promise<void> {
  const element = frame.value;
  const reduced = prefersReducedMotion();
  fadeScrim(0, 1, reduced ? SCRIM_QUICK : SCRIM_IN);
  if (!element || !trigger || reduced) {
    ready.value = true;
    return;
  }
  const target = trigger.getBoundingClientRect();
  const current = element.getBoundingClientRect();
  ready.value = true;
  if (!target.width || !target.height || !current.width || !current.height) {
    return;
  }
  const translateX = target.left + target.width / 2 - (current.left + current.width / 2);
  const translateY = target.top + target.height / 2 - (current.top + current.height / 2);
  morph = element.animate(
    [
      {
        transform: `translate(${translateX}px, ${translateY}px) scale(${target.width / current.width}, ${target.height / current.height})`,
        opacity: 0.35,
      },
      { transform: "translate(0, 0) scale(1, 1)", opacity: 1 },
    ],
    {
      duration: 350,
      easing: "cubic-bezier(0.05, 0.7, 0.1, 1)",
    },
  );
  await morph.finished.catch(() => undefined);
}

async function openFrom(trigger: HTMLElement | null): Promise<void> {
  if (!mounted.value || visible.value || !props.src) {
    return;
  }
  lastTrigger = trigger;
  resetView();
  ready.value = false;
  visible.value = true;
  await nextTick();
  await settleLayout();
  await waitForBox(frame.value);
  await animateOpen(lastTrigger);
}

function onTriggerClick(event: MouseEvent): void {
  void openFrom(event.currentTarget instanceof HTMLElement ? event.currentTarget : null);
}

// A controlled preview lets a caller open the same viewer from content it does
// not render itself, such as markdown output or a list of attachments.
watch(
  () => props.open,
  (value) => {
    if (value === null) {
      return;
    }
    if (value) {
      void openFrom(props.origin ?? null);
    } else {
      void close();
    }
  },
);

watch(visible, (value) => {
  if (props.open !== null) {
    emit("update:open", value);
  }
});

async function close(): Promise<void> {
  if (!visible.value || closing) {
    return;
  }
  const element = frame.value;
  const trigger = lastTrigger;
  const transformed = isImageTransformed({
    scale: scale.value,
    rotation: rotation.value,
    x: offset.value.x,
    y: offset.value.y,
  });
  if (!element || !trigger || prefersReducedMotion()) {
    await fadeScrim(1, 0, SCRIM_QUICK)?.finished.catch(() => undefined);
    visible.value = false;
    return;
  }

  closing = true;
  leaving.value = true;
  if (morph && morph.playState !== "idle") {
    morph.finish();
  }

  const current = element.getBoundingClientRect();
  const target = trigger.getBoundingClientRect();
  if (!current.width || !current.height || !target.width || !target.height) {
    closing = false;
    leaving.value = false;
    await fadeScrim(1, 0, SCRIM_QUICK)?.finished.catch(() => undefined);
    visible.value = false;
    return;
  }

  const scrimFade = fadeScrim(1, 0, SCRIM_OUT);
  // Whatever the visitor did to the picture is unwound inside the same 300ms:
  // a turned picture rotates upright on the way home instead of vanishing.
  const inner: Promise<unknown>[] = [];
  if (transformed) {
    const motion: KeyframeAnimationOptions = { duration: 300, easing: "cubic-bezier(0.3, 0, 0.8, 0.15)", fill: "forwards" };
    if (picture.value) {
      inner.push(picture.value.animate(
        [
          {
            transform:
              picture.value && typeof window !== "undefined"
                ? getComputedStyle(picture.value).transform
                : imageTransform.value,
          },
          {
            transform: `translate3d(0, 0, 0) rotate(${unwindRotation(rotation.value)}deg) scale(1)`,
          },
        ],
        motion,
      ).finished.catch(() => undefined));
    }
  }

  const animation = element.animate(
    [
      { transform: "translate(0, 0) scale(1, 1)", opacity: 1 },
      {
        transform: `translate(${target.left + target.width / 2 - (current.left + current.width / 2)}px, ${target.top + target.height / 2 - (current.top + current.height / 2)}px) scale(${target.width / current.width}, ${target.height / current.height})`,
        opacity: 0.35,
      },
    ],
    {
      duration: 300,
      easing: "cubic-bezier(0.3, 0, 0.8, 0.15)",
      fill: "forwards",
    },
  );
  await Promise.all([
    animation.finished.catch(() => undefined),
    scrimFade?.finished.catch(() => undefined) ?? Promise.resolve(),
    ...inner,
  ]);
  closing = false;
  ready.value = false;
  leaving.value = false;
  visible.value = false;
}

function onImageLoad(event: Event): void {
  const image = event.currentTarget as HTMLImageElement;
  const { naturalWidth, naturalHeight } = image;
  imageSize.value = { width: naturalWidth, height: naturalHeight };
  if (image.getBoundingClientRect().width > 0) {
    return;
  }
  const ratio = naturalWidth && naturalHeight ? naturalWidth / naturalHeight : 1.4;
  fluidWidth.value = `min(94vw, 1600px, calc((100dvh - var(--_preview-room, 124px)) * ${ratio.toFixed(4)}))`;
}

watch(visible, async (value, previous) => {
  if (value) {
    // Only the root: `overflow: hidden` on <body> turns the body into the scroll
    // container, which strands every sticky bar a full scroll offset off-screen.
    previousRootOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    await nextTick();
    dialog.value?.focus({ preventScroll: true });
  } else if (previous) {
    document.documentElement.style.overflow = previousRootOverflow;
    await nextTick();
    lastTrigger?.focus({ preventScroll: true });
  }
});

onMounted(() => {
  mounted.value = true;
  document.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
  if (visible.value) {
    document.documentElement.style.overflow = previousRootOverflow;
  }
});
</script>

<template>
  <span class="akari-image-preview">
    <button
      v-if="props.open === null"
      type="button"
      class="akari-image-preview__trigger"
      :aria-label="triggerLabel"
      :title="triggerLabel"
      @click="onTriggerClick"
    >
      <slot>
        <img
          class="akari-image-preview__thumb"
          :src="props.src"
          :alt="props.alt"
          loading="lazy"
          decoding="async"
        />
      </slot>
      <span class="akari-image-preview__hint" aria-hidden="true">
        <m3e-icon name="zoom_in"></m3e-icon>
      </span>
    </button>

    <!-- The overlay is teleported to the frame once mounted: the target is
         created in the same render, and teleporting during server rendering
         would leave the client with a different tree. -->
    <Teleport v-if="mounted" to=".akari-frame">
      <div
        v-if="visible"
        ref="dialog"
        class="akari-image-preview__overlay"
        style="opacity: 0"
        :data-leaving="leaving || undefined"
        role="dialog"
        aria-modal="true"
        :aria-label="dialogLabel"
        tabindex="-1"
        @wheel.prevent
        @touchmove.prevent
      >
        <div class="akari-image-preview__stage" @click="onStageClick" @wheel.prevent="onWheel">
          <div
            ref="frame"
            class="akari-image-preview__frame"
            :class="{ 'akari-image-preview__frame--waiting': !ready }"
          >
            <img
                ref="picture"
                class="akari-image-preview__image"
                :src="props.src"
                :alt="props.alt"
                :style="imageStyle"
                draggable="false"
                @load="onImageLoad"
                @click.stop
                @dblclick="resetView"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="onPointerUp"
                @pointercancel="onPointerUp"
              />
          </div>
        </div>

        <div class="akari-image-preview__bar" @click.stop>
          <m3e-icon-button
            :aria-label="t('imagePreviewZoomOut')"
            :title="t('imagePreviewZoomOut')"
            @click="zoom(-IMAGE_PREVIEW_ZOOM_STEP)"
          >
            <m3e-icon name="zoom_out"></m3e-icon>
          </m3e-icon-button>
          <button
            type="button"
            class="akari-image-preview__scale"
            :aria-label="t('imagePreviewZoomStatus', { percentage: scaleLabel(scale) })"
            :title="t('imagePreviewResetView')"
            @click="resetView"
          >
            {{ scaleLabel(scale) }}
          </button>
          <m3e-icon-button
            :aria-label="t('imagePreviewZoomIn')"
            :title="t('imagePreviewZoomIn')"
            @click="zoom(IMAGE_PREVIEW_ZOOM_STEP)"
          >
            <m3e-icon name="zoom_in"></m3e-icon>
          </m3e-icon-button>
          <span class="akari-image-preview__divider" aria-hidden="true"></span>
          <m3e-icon-button
            :aria-label="t('imagePreviewRotateLeft')"
            :title="t('imagePreviewRotateLeft')"
            @click="rotate(-90)"
          >
            <m3e-icon name="rotate_left"></m3e-icon>
          </m3e-icon-button>
          <m3e-icon-button
            :aria-label="t('imagePreviewRotateRight')"
            :title="t('imagePreviewRotateRight')"
            @click="rotate(90)"
          >
            <m3e-icon name="rotate_right"></m3e-icon>
          </m3e-icon-button>
          <m3e-icon-button
            :aria-label="t('imagePreviewResetView')"
            :title="t('imagePreviewResetView')"
            @click="resetView"
          >
            <m3e-icon name="restart_alt"></m3e-icon>
          </m3e-icon-button>
        </div>

        <m3e-icon-button
          class="akari-image-preview__close"
          :aria-label="t('imagePreviewClose')"
          :title="t('imagePreviewClose')"
          @click="close"
        >
          <m3e-icon name="close"></m3e-icon>
        </m3e-icon-button>
      </div>
    </Teleport>
  </span>
</template>

<style scoped>
.akari-image-preview {
  display: inline-flex;
}

.akari-image-preview__trigger {
  position: relative;
  display: inline-flex;
  padding: 0;
  border: 0;
  border-radius: var(--md-sys-shape-corner-medium, 12px);
  background: transparent;
  color: inherit;
  cursor: zoom-in;
}

.akari-image-preview__trigger:focus-visible {
  outline: 3px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.akari-image-preview__thumb {
  display: block;
  max-inline-size: 100%;
  border-radius: inherit;
}

.akari-image-preview__hint {
  position: absolute;
  inset-block-end: 8px;
  inset-inline-end: 8px;
  display: grid;
  place-items: center;
  inline-size: 32px;
  block-size: 32px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--md-sys-color-scrim) 62%, transparent);
  color: var(--md-sys-color-inverse-on-surface);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short-4, 200ms)
    var(--md-sys-motion-easing-standard, ease);
}

.akari-image-preview__trigger:hover .akari-image-preview__hint,
.akari-image-preview__trigger:focus-visible .akari-image-preview__hint {
  opacity: 1;
}

.akari-image-preview__overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: color-mix(in srgb, var(--md-sys-color-scrim) 76%, transparent);
  color: var(--md-sys-color-inverse-on-surface);
  backdrop-filter: blur(8px);
}

.akari-image-preview__overlay:focus {
  outline: none;
}

/* The room the bar and the stage's padding take. Measured against the
   viewport rather than the stage: percentage heights inside a centred grid
   item resolve against an indefinite box and collapse the picture to nothing. */
.akari-image-preview__stage {
  --_preview-room: 124px;

  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px 24px 100px;
  overflow: hidden;
  cursor: zoom-out;
  touch-action: none;
}

.akari-image-preview__frame--waiting {
  opacity: 0;
}

.akari-image-preview__frame {
  display: flex;
  max-inline-size: min(94vw, 1600px);
  max-block-size: calc(100dvh - var(--_preview-room));
  transform-origin: center;
  will-change: transform;
}

.akari-image-preview__image {
  display: block;
  transition: transform var(--md-sys-motion-duration-short-4, 200ms)
    var(--md-sys-motion-easing-standard, ease);
  max-inline-size: min(94vw, 1600px);
  max-block-size: calc(100dvh - var(--_preview-room));
  border-radius: var(--md-sys-shape-corner-medium, 12px);
  object-fit: contain;
  box-shadow: 0 12px 32px
    color-mix(in srgb, var(--md-sys-color-shadow) 45%, transparent);
  user-select: none;
  cursor: grab;
  touch-action: none;
  will-change: transform;
}

.akari-image-preview__image:active {
  cursor: grabbing;
}

.akari-image-preview__bar {
  position: absolute;
  inset-block-end: 24px;
  inset-inline-start: 50%;
  z-index: 2;
  display: flex;
  gap: 2px;
  align-items: center;
  padding: 6px;
  border-radius: 999px;
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
  box-shadow:
    0 4px 10px 2px color-mix(in srgb, var(--md-sys-color-shadow) 24%, transparent),
    0 1px 3px 0 color-mix(in srgb, var(--md-sys-color-shadow) 30%, transparent);
  transform: translateX(-50%);
}

.akari-image-preview__bar m3e-icon-button {
  color: inherit;
}

.akari-image-preview__scale {
  min-inline-size: 52px;
  padding: 0 6px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  line-height: 40px;
  cursor: pointer;
  font-variant-numeric: tabular-nums;
}

.akari-image-preview__scale:hover {
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.akari-image-preview__divider {
  inline-size: 1px;
  block-size: 24px;
  margin: 0 4px;
  background: var(--md-sys-color-outline-variant);
}

.akari-image-preview__close {
  position: absolute;
  inset-block-start: 16px;
  inset-inline-end: 16px;
  z-index: 3;
  border-radius: 50%;
  background: var(--md-sys-color-surface-container-high);
  color: var(--md-sys-color-on-surface);
}

/* The chrome leaves with the picture, so the shrinking frame is not
   covered by controls that no longer apply to it. */
.akari-image-preview__overlay[data-leaving] .akari-image-preview__bar,
.akari-image-preview__overlay[data-leaving] .akari-image-preview__close {
  opacity: 0;
  transition: opacity 160ms linear;
}

@media (max-width: 640px) {
  .akari-image-preview__bar {
    inset-block-end: 12px;
  }

  .akari-image-preview__stage {
    --_preview-room: 104px;

    padding: 16px 16px 88px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .akari-image-preview__hint {
    transition: none;
  }
}
</style>
