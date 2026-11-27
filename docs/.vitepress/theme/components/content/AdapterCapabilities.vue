<script setup lang="ts">
import { computed } from "vue";

import { useAkariConfig } from "../../composables/useAkariConfig";

const props = defineProps<{ adapter?: string }>();

const config = useAkariConfig();

/** Labels for the capabilities the theme knows; other keys print their name. */
const labels: Record<string, string> = {
  support_image: "图片",
  support_audio: "音频",
  support_video: "视频",
  support_mention: "提及",
  support_reaction: "表情回应",
  support_quote: "引用回复",
  support_typing: "输入状态",
  support_delete: "消息撤回",
  support_manage: "群组管理",
  support_permission_group: "权限组",
  support_private_msg: "私信",
  support_rss: "RSS 推送",
};

/** Labeled capabilities keep this order; unlabeled ones follow alphabetically. */
const labelOrder = Object.keys(labels);

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

const capabilities = computed<string[]>(() => {
  const seen = new Set<string>();
  for (const row of rows.value) {
    for (const key of Object.keys(row.features)) seen.add(key);
  }
  const known = labelOrder.filter((key) => seen.has(key));
  const rest = [...seen]
    .filter((key) => !labels[key])
    .sort((a, b) => a.localeCompare(b));
  return [...known, ...rest];
});

function capabilityName(key: string): string {
  const label = labels[key];
  if (label) return label;
  const prefix = "support_";
  return key.startsWith(prefix) ? key.slice(prefix.length) : key;
}

function statusOf(row: AdapterRow, key: string): string {
  return row.features[key] === true ? "支持" : "—";
}

const statuses = computed(() => {
  const row = rows.value[0];
  return capabilities.value.map((key) => ({
    key,
    name: capabilityName(key),
    status: row ? statusOf(row, key) : "—",
  }));
});
</script>

<template>
  <div class="adapter-capabilities">
    <p v-if="!rows.length" class="adapter-capabilities__empty">未找到适配器能力数据。</p>
    <table v-else-if="selectedKey">
      <thead>
        <tr>
          <th scope="col">能力</th>
          <th scope="col">状态</th>
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
          <th scope="col">包</th>
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
