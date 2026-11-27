<script setup lang="ts">
import { computed } from "vue";

import { useAkariConfig } from "../../composables/useAkariConfig";
import type { CliArgument, CliCommand, CliOption } from "../../types";
import { useGeneratedLabels } from "./generated";

const props = defineProps<{ command: string }>();

const config = useAkariConfig();
const { label } = useGeneratedLabels();

const found = computed<CliCommand | undefined>(() => {
  const commands = config.value.generated.cli ?? {};
  return Object.hasOwn(commands, props.command)
    ? commands[props.command]
    : undefined;
});

const args = computed<CliArgument[]>(() => {
  const list = found.value?.arguments;
  return Array.isArray(list) ? list : [];
});

const options = computed<CliOption[]>(() => {
  const list = found.value?.options;
  return Array.isArray(list) ? list : [];
});

function optionNames(option: CliOption): string {
  const names = Array.isArray(option.names) ? option.names : [];
  return names.filter(Boolean).join(", ");
}

function optionValue(option: CliOption): string {
  const metavar = option.metavar?.trim();
  return metavar || label("gen_placeholder");
}

/** Each argument carries its own state and the separator that follows it. */
const argumentTexts = computed(() =>
  args.value.map((argument, index) => ({
    name: argument.name,
    state: label(
      argument.required ? "gen_argument_required" : "gen_argument_optional",
    ),
    separator:
      index < args.value.length - 1 ? label("gen_argument_separator") : "",
  })),
);
</script>

<template>
  <div class="cli-command-options">
    <p v-if="!found" class="cli-command-options__empty">
      {{ label("gen_missing_command", { command: props.command }) }}
    </p>
    <template v-else>
      <pre v-if="found.usage" class="cli-command-options__usage"
        ><code>{{ found.usage }}</code></pre
      >
      <p v-if="argumentTexts.length" class="cli-command-options__arguments">
        <span class="cli-command-options__label">{{ label("gen_arguments") }}</span>
        <span v-for="argument in argumentTexts" :key="argument.name"
          ><code>{{ argument.name }}</code> {{ argument.state
          }}{{ argument.separator }}</span
        >
      </p>
      <table v-if="options.length">
        <thead>
          <tr>
            <th scope="col">{{ label("gen_option") }}</th>
            <th scope="col">{{ label("gen_value") }}</th>
            <th scope="col">{{ label("gen_comment") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(option, index) in options" :key="optionNames(option) || index">
            <td>
              <code>{{ optionNames(option) }}</code>
            </td>
            <td>
              <span v-if="option.isFlag">{{ label("gen_flag") }}</span>
              <code v-else>{{ optionValue(option) }}</code>
            </td>
            <td>{{ option.help }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<style scoped>
.cli-command-options__empty {
  color: var(--md-sys-color-on-surface-variant);
}

.cli-command-options__label {
  color: var(--md-sys-color-on-surface-variant);
}

.cli-command-options__usage {
  margin-block: 16px 12px;
  padding: 12px 16px;
  overflow-x: auto;
  white-space: pre;
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-small, 8px);
  background-color: var(--md-sys-color-surface-container);
}

.cli-command-options__usage code {
  padding: 0;
  background: none;
  color: inherit;
  font-size: var(--md-sys-typescale-body-medium-font-size, 0.875rem);
}
</style>
