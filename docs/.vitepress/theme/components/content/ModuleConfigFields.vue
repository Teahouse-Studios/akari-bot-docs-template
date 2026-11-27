<script setup lang="ts">
import { computed } from "vue";

import { useAkariConfig } from "../../composables/useAkariConfig";
import type { GeneratedConfigField, GeneratedConfigTable } from "../../types";

const props = defineProps<{ table: string }>();

const config = useAkariConfig();

/**
 * The engine writes one entry per table under each package, so the first
 * table whose name matches is the one the page asks for.
 */
const found = computed<GeneratedConfigTable | undefined>(() => {
  const packages = config.value.generated.packages ?? {};
  for (const entry of Object.values(packages)) {
    const tables = entry?.facts?.config;
    if (!Array.isArray(tables)) continue;
    for (const table of tables) {
      if (table?.table === props.table) return table;
    }
  }
  return undefined;
});

const fields = computed<GeneratedConfigField[]>(() => {
  const list = found.value?.fields;
  return Array.isArray(list) ? list : [];
});

/** Defaults arrive as Python literals already serialized to JSON values. */
function defaultValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  const text = JSON.stringify(value);
  return text === undefined ? String(value) : text;
}

const rows = computed(() =>
  fields.value.map((field) => ({
    name: field.name,
    type: field.type,
    comment: field.comment,
    required: field.required === true,
    secret: field.secret === true,
    defaultText: defaultValue(field.default),
  })),
);
</script>

<template>
  <div class="module-config-fields">
    <p v-if="!found" class="module-config-fields__empty">未找到配置表 <code>{{ props.table }}</code> 的生成数据。</p>
    <p v-else-if="!rows.length" class="module-config-fields__empty">该表没有配置字段。</p>
    <table v-else>
      <thead>
        <tr>
          <th scope="col">字段</th>
          <th scope="col">类型</th>
          <th scope="col">默认值</th>
          <th scope="col">说明</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.name">
          <td>
            <span class="module-config-fields__name">
              <code>{{ row.name }}</code>
              <span v-if="row.required" class="module-config-fields__tag">必填</span>
              <span v-if="row.secret" class="module-config-fields__tag">（敏感）</span>
            </span>
          </td>
          <td>{{ row.type || "—" }}</td>
          <td>
            <code v-if="row.defaultText">{{ row.defaultText }}</code>
            <span v-else>—</span>
          </td>
          <td>{{ row.comment }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.module-config-fields__empty {
  color: var(--md-sys-color-on-surface-variant);
}

.module-config-fields__name {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
}

.module-config-fields__tag {
  color: var(--md-sys-color-on-surface-variant);
  font-size: var(--md-sys-typescale-body-small-font-size, 0.75rem);
}
</style>
