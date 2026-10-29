<script setup lang="ts">
import { ref, watch } from "vue";

import { useContainerTransform } from "../../composables/useContainerTransform";
import type { AkariMorphDialogApi } from "../../composables/useMorphDialog";
import { useAkariSettings } from "../../composables/useSettings";

const props = withDefaults(
  defineProps<{
    state: AkariMorphDialogApi;
    titleId: string;
    title: string;
    /** Icon in front of the title, the part the trigger turns into. */
    icon: string;
    /** Draw the icon with an outline, for an outlined trigger button. */
    outlinedIcon?: boolean;
    closeLabel: string;
    /** Panel width before it is capped by the window. */
    width?: string;
    /** Moves focus into the dialog once it opens; defaults to the panel. */
    focus?: () => void;
  }>(),
  { outlinedIcon: false, width: "400px", focus: undefined },
);

const { settings } = useAkariSettings();

const dialog = ref<HTMLDialogElement | null>(null);
const panel = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);
const scrim = ref<HTMLElement | null>(null);
const ghostHost = ref<HTMLElement | null>(null);
const icon = ref<HTMLElement | null>(null);
const heading = ref<HTMLElement | null>(null);
const closeButton = ref<HTMLElement | null>(null);
const body = ref<HTMLElement | null>(null);

const { open, close } = useContainerTransform({
  dialog,
  panel,
  content,
  scrim,
  ghostHost,
  // The header icon echoes the trigger; the rest of the panel fades in.
  anchor: icon,
  fadingParts: () =>
    [heading.value, closeButton.value, body.value].filter(
      (element): element is HTMLElement => !!element,
    ),
  trigger: () => props.state.trigger.value,
  motion: () => settings.motion,
  focus: () =>
    props.focus ? props.focus() : panel.value?.focus({ preventScroll: true }),
  onClosed: () => props.state.finalizeClose(),
});

watch(
  () => props.state.isOpen.value,
  (isOpen) => {
    if (isOpen) void open();
    else void close();
  },
  { flush: "post" },
);
</script>

<template>
  <!--
    A modal dialog that grows out of the button that opened it with the
    same container transform as search, and returns into it on close. The
    default slot is the dialog's body.
  -->
  <dialog
    ref="dialog"
    class="akari-morph-dialog akari-dialog"
    tabindex="-1"
    :aria-labelledby="titleId"
    @cancel.prevent="state.close()"
  >
    <div
      ref="scrim"
      class="akari-morph-dialog__scrim"
      @click="state.close()"
    ></div>

    <section
      ref="panel"
      class="akari-morph-dialog__panel akari-dialog__panel"
      :style="{ '--_width': width }"
      tabindex="-1"
      @click.stop
    >
      <div ref="content" class="akari-dialog__content">
        <header class="akari-dialog__header">
          <span
            ref="icon"
            class="akari-dialog__icon"
            :data-outlined="outlinedIcon ? '' : undefined"
            aria-hidden="true"
          >
            <m3e-icon :name="props.icon"></m3e-icon>
          </span>
          <h2 :id="titleId" ref="heading" class="akari-dialog__title">
            {{ title }}
          </h2>
          <m3e-icon-button
            ref="closeButton"
            class="akari-dialog__close"
            :aria-label="closeLabel"
            @click="state.close()"
          >
            <m3e-icon name="close"></m3e-icon>
          </m3e-icon-button>
        </header>

        <div ref="body" class="akari-dialog__body">
          <slot />
        </div>
      </div>
    </section>

    <div
      ref="ghostHost"
      class="akari-morph-dialog__ghost"
      aria-hidden="true"
    ></div>
  </dialog>
</template>

<style scoped>
.akari-dialog__panel {
  width: min(var(--_width), calc(100vw - 32px));
  max-height: min(720px, calc(100dvh - 64px));
}

.akari-dialog__content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  padding: 24px 12px 12px;
}

.akari-dialog__header {
  display: flex;
  flex: none;
  align-items: center;
  gap: 16px;
  padding-inline: 12px 4px;
}

/* Echoes the button that opens the dialog, which morphs into it. */
.akari-dialog__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 40px;
  height: 40px;
  border-radius: var(--md-sys-shape-corner-full, 9999px);
  color: var(--md-sys-color-on-surface-variant);
}

.akari-dialog__icon[data-outlined] {
  border: 1px solid var(--md-sys-color-outline-variant);
}

.akari-dialog__title {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  color: var(--md-sys-color-on-surface);
  font-size: var(--md-sys-typescale-headline-small-font-size, 1.5rem);
  font-weight: var(--md-sys-typescale-headline-small-font-weight, 400);
  line-height: var(--md-sys-typescale-headline-small-line-height, 2rem);
  letter-spacing: var(--md-sys-typescale-headline-small-tracking, 0);
}

.akari-dialog__close {
  flex: none;
}

/*
 * Content taller than the panel (a short window, a phone) scrolls here,
 * under the header. The inline padding keeps focus rings at the edges
 * inside the scroller; the margin gives the room back.
 */
.akari-dialog__body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  margin-inline: -4px;
  padding-inline: 4px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--m3e-scrollbar-thumb-color, var(--md-sys-color-outline))
    transparent;
}
</style>
