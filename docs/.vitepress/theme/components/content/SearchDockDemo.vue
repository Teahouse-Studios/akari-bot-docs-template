<script setup lang="ts">
/**
 * Interactive demo for the public `<SearchDock>` tag. The tag below is the
 * only thing the theme needs; the controls just rewrite its props so the
 * same field can be seen as a bar, pill, FAB, or hero.
 */
import { computed, ref } from "vue";

import type {
  AkariSearchDockAlign,
  AkariSearchDockVariant,
} from "../../types";
import { useAkariI18n } from "../../composables/useI18n";
import SearchDock from "../../search/components/SearchDock.vue";

const { t } = useAkariI18n();

const variants = computed<{ value: AkariSearchDockVariant; label: string }[]>(() => [
  { value: "bar", label: t("dockDemoBar") },
  { value: "pill", label: t("dockDemoPill") },
  { value: "icon", label: t("dockDemoIcon") },
  { value: "hero", label: t("dockDemoHero") },
]);

const aligns = computed<{ value: AkariSearchDockAlign; label: string }[]>(() => [
  { value: "start", label: t("dockDemoStart") },
  { value: "center", label: t("dockDemoCenter") },
  { value: "end", label: t("dockDemoEnd") },
]);

const variant = ref<AkariSearchDockVariant>("hero");
const align = ref<AkariSearchDockAlign>("center");
const placeholder = ref(t("searchPlaceholder"));
const tagVisible = ref(true);
const fill = ref(false);
const immersive = ref(false);
const showShortcut = ref(true);
const background = ref("");
const borderColor = ref("");
const shadow = ref(true);
const elevation = ref("auto");
const elevationLevel = computed(() =>
  elevation.value === "auto" ? undefined : Number(elevation.value),
);

const snippet = computed(
  () =>
    `<SearchDock variant="${variant.value}" align="${align.value}" placeholder="${placeholder.value}"${fill.value ? " fill" : ""}${immersive.value ? " immersive" : ""}${
      showShortcut.value ? "" : ' :show-shortcut="false"'
    }${
      background.value ? ` background="${background.value}"` : ""
    }${
      borderColor.value ? ` border-color="${borderColor.value}"` : ""
    }${shadow.value ? "" : ' :shadow="false"'}${
      elevation.value === "auto" ? "" : ` :elevation="${elevation.value}"`
    } />`,
);

function reload(): void {
  window.location.reload();
}
</script>

<template>
  <div class="dock-demo">
    <div class="dock-demo__controls">
      <label class="dock-demo__field">
        <span>{{ t("dockDemoVariant") }}</span>
        <select v-model="variant">
          <option v-for="item in variants" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </label>

      <label class="dock-demo__field">
        <span>{{ t("dockDemoAlign") }}</span>
        <select v-model="align">
          <option v-for="item in aligns" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </label>

      <label class="dock-demo__field dock-demo__field--grow">
        <span>{{ t("dockDemoPlaceholder") }}</span>
        <input v-model="placeholder" type="text" />
      </label>

      <button
        type="button"
        class="dock-demo__toggle"
        :aria-pressed="fill"
        @click="fill = !fill"
      >
        {{ fill ? t("dockDemoNatural") : t("dockDemoFill") }}
      </button>

      <button
        type="button"
        class="dock-demo__toggle"
        :aria-pressed="immersive"
        @click="immersive = !immersive"
      >
        {{ t("dockDemoImmersive") }}
      </button>

      <button
        type="button"
        class="dock-demo__toggle"
        :aria-pressed="showShortcut"
        @click="showShortcut = !showShortcut"
      >
        {{ t("dockDemoShortcut") }}
      </button>

      <label class="dock-demo__field">
        <span>{{ t("dockDemoBackground") }}</span>
        <input v-model="background" type="text" placeholder="#e8def8" />
      </label>

      <label class="dock-demo__field">
        <span>{{ t("dockDemoBorder") }}</span>
        <input v-model="borderColor" type="text" placeholder="#79747e" />
      </label>

      <button
        type="button"
        class="dock-demo__toggle"
        :aria-pressed="shadow"
        @click="shadow = !shadow"
      >
        {{ t("dockDemoShadow") }}
      </button>

      <label class="dock-demo__field">
        <span>{{ t("dockDemoElevation") }}</span>
        <select v-model="elevation">
          <option value="auto">{{ t("dockDemoAuto") }}</option>
          <option v-for="level in 6" :key="level" :value="String(level - 1)">
            {{ level - 1 }}
          </option>
        </select>
      </label>

      <button
        type="button"
        class="dock-demo__toggle"
        :aria-pressed="tagVisible"
        @click="tagVisible = !tagVisible"
      >
        {{ tagVisible ? t("dockDemoHideTag") : t("dockDemoShowTag") }}
      </button>

      <button type="button" class="dock-demo__reload" @click="reload">
        {{ t("dockDemoReload") }}
      </button>
    </div>

    <div class="dock-demo__stage">
      <span class="dock-demo__caption">{{ t("dockDemoCaption") }}</span>
      <div class="dock-demo__box" :data-fill="fill ? '' : undefined">
        <SearchDock
          v-if="tagVisible"
          :variant="variant"
          :align="align"
          :placeholder="placeholder"
          :fill="fill"
          :immersive="immersive"
          :show-shortcut="showShortcut"
          :background="background || undefined"
          :border-color="borderColor || undefined"
          :shadow="shadow"
          :elevation="elevationLevel"
        />
      </div>
    </div>

    <p class="dock-demo__hint">
      {{ t("dockDemoHint") }}
    </p>

    <pre class="dock-demo__snippet"><code>{{ snippet }}</code></pre>
  </div>
</template>

<style scoped>
.dock-demo {
  display: grid;
  gap: 16px;
  min-width: 0;
  margin-block: 20px 28px;
  padding: 20px;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-large, 20px);
  background-color: var(--md-sys-color-surface-container-low);
}

.dock-demo > * {
  min-width: 0;
}

.dock-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 12px;
}

.dock-demo__field {
  display: grid;
  gap: 4px;
  min-inline-size: 120px;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.75rem;
}

.dock-demo__field--grow {
  flex: 1 1 180px;
}

.dock-demo__field select,
.dock-demo__field input {
  box-sizing: border-box;
  min-block-size: 40px;
  padding-inline: 12px;
  border: 1px solid var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-full, 999px);
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
  font: inherit;
  font-size: 0.875rem;
}

.dock-demo__field select:focus-visible,
.dock-demo__field input:focus-visible,
.dock-demo__reload:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.dock-demo__toggle,
.dock-demo__reload {
  min-block-size: 40px;
  padding-inline: 18px;
  border: 0;
  border-radius: var(--md-sys-shape-corner-full, 999px);
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
}

.dock-demo__toggle {
  border: 1px solid var(--md-sys-color-outline);
  background-color: transparent;
  color: var(--md-sys-color-on-surface);
}

.dock-demo__toggle:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

.dock-demo__stage {
  display: grid;
  /* The implicit column would size to the dock's max-content width, which pushes
     the demo box outside the grid once the column gets narrow (the hero variant
     is the widest). Pin it to the container so the box can shrink instead. */
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  min-block-size: 220px;
  padding: 32px 16px;
  border-radius: var(--md-sys-shape-corner-medium, 12px);
  background-color: var(--md-sys-color-surface-container);
  background-image:
    linear-gradient(
      var(--md-sys-color-outline-variant) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      var(--md-sys-color-outline-variant) 1px,
      transparent 1px
    );
  background-size: 24px 24px;
  background-position: -1px -1px;
}

.dock-demo__caption {
  align-self: start;
  justify-self: start;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dock-demo__box {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  width: min(100%, 460px);
  max-width: 100%;
  min-inline-size: 0;
  padding: 10px;
  border: 1px dashed var(--md-sys-color-outline);
  border-radius: var(--md-sys-shape-corner-medium, 12px);
}

.dock-demo__box :deep(.akari-search-dock-anchor) {
  min-width: 0;
  margin-inline: auto;
}

.dock-demo__box[data-fill] {
  height: 132px;
  align-items: stretch;
}

.dock-demo__box[data-fill] :deep(.akari-search-dock-anchor) {
  width: 100%;
  height: 100%;
  margin: 0;
}

.dock-demo__hint {
  margin: 0;
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.875rem;
  line-height: 1.6;
}

.dock-demo__snippet {
  max-width: 100%;
  margin: 0;
  padding: 12px 16px;
  overflow-x: auto;
  direction: ltr;
  text-align: left;
  unicode-bidi: isolate;
  border-radius: var(--md-sys-shape-corner-small, 8px);
  background-color: var(--md-sys-color-surface-container-high);
  font-size: 0.8125rem;
}
</style>
