<script setup lang="ts">
import { computed } from "vue";

import { useAkariConfig } from "../../composables/useAkariConfig";
import {
  GENERATED_LABEL_PREFIX,
  featureLabelKey,
  featureName,
  useGeneratedLabels,
} from "./generated";

const props = defineProps<{ adapter?: string }>();

const config = useAkariConfig();
const { labels, label } = useGeneratedLabels();

interface AdapterRow {
  key: string;
  features: Record<string, boolean>;
}

const adapters = computed<AdapterRow[]>(() => {
  const packages = config.value.generated.packages ?? {};
  const rows: AdapterRow[] = [];
  for (const [key, entry] of Object.entries(packages)) {
    const features = entry?.facts?.features;
    if (!features || typeof features !== "object") continue;
    if (!Object.keys(features).length) continue;
    rows.push({ key, features });
  }
  return rows.sort((a, b) => a.key.localeCompare(b.key));
});

const selectedKey = computed(() => props.adapter?.trim() ?? "");

/** One row for a single adapter page, every row for the matrix. */
const rows = computed<AdapterRow[]>(() => {
  if (!selectedKey.value) return adapters.value;
  const row = adapters.value.find((item) => item.key === selectedKey.value);
  return row ? [row] : [];
});

const single = computed<AdapterRow | undefined>(() =>
  selectedKey.value ? rows.value[0] : undefined,
);

/** Position the labels give a capability, so columns keep the site's order. */
const labelRank = computed<Record<string, number>>(() => {
  const rank: Record<string, number> = {};
  let index = 0;
  for (const key of Object.keys(labels.value)) {
    if (!key.startsWith(`${GENERATED_LABEL_PREFIX}feature_`)) continue;
    rank[key] = index;
    index += 1;
  }
  return rank;
});

const capabilities = computed<string[]>(() => {
  const seen = new Set<string>();
  for (const row of rows.value) {
    for (const key of Object.keys(row.features)) seen.add(key);
  }
  return [...seen].sort((a, b) => {
    const left = labelRank.value[featureLabelKey(a)] ?? Number.MAX_SAFE_INTEGER;
    const right = labelRank.value[featureLabelKey(b)] ?? Number.MAX_SAFE_INTEGER;
    return left === right ? a.localeCompare(b) : left - right;
  });
});

function capabilityName(key: string): string {
  return label(featureLabelKey(key)) || featureName(key);
}

function statusOf(row: AdapterRow, key: string): string {
  return row.features[key] === true
    ? label("gen_supported")
    : label("gen_placeholder");
}

/** Columns of the single-adapter table, with the label already resolved. */
const statuses = computed(() =>
  capabilities.value.map((key) => ({
    key,
    name: capabilityName(key),
    status: single.value ? statusOf(single.value, key) : "",
  })),
);
</script>

<template>
  <div class="adapter-capabilities">
    <p v-if="!rows.length" class="adapter-capabilities__empty">
      {{ label("gen_missing_features") }}
    </p>
    <table v-else-if="single">
      <thead>
        <tr>
          <th scope="col">{{ label("gen_capability") }}</th>
          <th scope="col">{{ label("gen_status") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="status in statuses" :key="status.key">
          <td>{{ status.name }}</td>
          <td>{{ status.status }}</td>
        </tr>
      </tbody>
    </table>
    <table v-else>
      <thead>
        <tr>
          <th scope="col">{{ label("gen_package") }}</th>
          <th v-for="key in capabilities" :key="key" scope="col">
            {{ capabilityName(key) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.key">
          <td>
            <code>{{ row.key }}</code>
          </td>
          <td v-for="key in capabilities" :key="key">
            {{ statusOf(row, key) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.adapter-capabilities__empty {
  color: var(--md-sys-color-on-surface-variant);
}
</style>
