<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

import {
  BOARD_SEED_EVENT,
  normalizeVineSeed,
  readBoardSeed,
  readVinePopout,
  VINE_DEFAULT_SEED,
  VINE_POPOUT_EVENT,
  writeBoardSeed,
  writeVinePopout,
} from "../../vine3d";

const boardSeed = ref(VINE_DEFAULT_SEED);
// Read once mounted, so the server-rendered box and the hydrated one agree.
const popout = ref(false);
const draft = ref(String(boardSeed.value));

function apply(value: unknown = draft.value): void {
  boardSeed.value = writeBoardSeed(value);
  draft.value = String(boardSeed.value);
}

function shift(amount: number): void {
  apply(boardSeed.value + amount);
}

function randomize(): void {
  apply(Math.floor(Math.random() * 0x7fffffff) || 1);
}

function onSeedChange(event: Event): void {
  boardSeed.value = normalizeVineSeed((event as CustomEvent<unknown>).detail);
  draft.value = String(boardSeed.value);
}

function togglePopout(event: Event): void {
  popout.value = writeVinePopout((event.target as HTMLInputElement).checked);
}

function onPopoutChange(event: Event): void {
  popout.value = Boolean((event as CustomEvent<unknown>).detail);
}

onMounted(() => {
  boardSeed.value = readBoardSeed();
  draft.value = String(boardSeed.value);
  popout.value = readVinePopout();
  window.addEventListener(BOARD_SEED_EVENT, onSeedChange);
  window.addEventListener(VINE_POPOUT_EVENT, onPopoutChange);
});
onBeforeUnmount(() => {
  window.removeEventListener(BOARD_SEED_EVENT, onSeedChange);
  window.removeEventListener(VINE_POPOUT_EVENT, onPopoutChange);
});
</script>

<template>
  <div class="akari-vine-seed-control">
    <label>
      <span>背景板种子</span>
      <input
        v-model="draft"
        type="number"
        min="1"
        max="2147483647"
        inputmode="numeric"
        @change="apply()"
        @keyup.enter="apply()"
      />
    </label>
    <button type="button" @click="apply()">应用</button>
    <button type="button" @click="shift(-1)">−1</button>
    <button type="button" @click="shift(1)">+1</button>
    <button type="button" @click="randomize()">随机</button>
    <label class="akari-vine-seed-control__toggle">
      <input type="checkbox" :checked="popout" @change="togglePopout" />
      <span>出屏</span>
    </label>
  </div>
</template>

<style scoped>
.akari-vine-seed-control {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0 20px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  /* 出屏 shoots paint at z-index 1; keep the controls above them. */
  position: relative;
  z-index: 2;
}

.akari-vine-seed-control label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.akari-vine-seed-control input:not([type="checkbox"]),
.akari-vine-seed-control button {
  min-block-size: 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font: inherit;
}

.akari-vine-seed-control input:not([type="checkbox"]) {
  inline-size: 132px;
  padding: 0 8px;
}

.akari-vine-seed-control__toggle {
  min-block-size: 30px;
  padding-inline: 4px;
  cursor: pointer;
  user-select: none;
}

.akari-vine-seed-control__toggle input {
  inline-size: 15px;
  block-size: 15px;
  margin: 0;
  accent-color: var(--vp-c-brand-1);
  cursor: pointer;
}

.akari-vine-seed-control button {
  padding: 0 10px;
  cursor: pointer;
}

.akari-vine-seed-control button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
</style>
