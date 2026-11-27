import { computed, type ComputedRef } from "vue";

import { useAkariConfig } from "../../composables/useAkariConfig";

/**
 * Prefix of the label keys the docs engine copies from its `[labels]`
 * section, so a site can reword the generated blocks without touching the
 * components.
 */
export const GENERATED_LABEL_PREFIX = "gen_";

/** Fills `{name}` placeholders; a name the caller did not pass stays as written. */
export function formatGeneratedLabel(
  template: string,
  params: Readonly<Record<string, string | number>> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export interface GeneratedLabels {
  labels: ComputedRef<Record<string, string>>;
  /** Label text for `key`, with placeholders filled in; empty when absent. */
  label: (
    key: string,
    params?: Readonly<Record<string, string | number>>,
  ) => string;
}

/**
 * Reads the labels the build wrote next to the facts. A site built without
 * them renders the tables with empty captions, which points at the build
 * output instead of hiding a mismatch behind fallback wording.
 */
export function useGeneratedLabels(): GeneratedLabels {
  const config = useAkariConfig();
  const labels = computed<Record<string, string>>(
    () => config.value.generated.labels ?? {},
  );

  function label(
    key: string,
    params?: Readonly<Record<string, string | number>>,
  ): string {
    return formatGeneratedLabel(labels.value[key] ?? "", params);
  }

  return { labels, label };
}

/** Label key that names one capability, e.g. `support_image` → `gen_feature_image`. */
export function featureLabelKey(feature: string): string {
  const name = feature.startsWith("support_")
    ? feature.slice("support_".length)
    : feature;
  return `${GENERATED_LABEL_PREFIX}feature_${name}`;
}

/** Readable name for a capability the labels do not cover. */
export function featureName(feature: string): string {
  return feature.startsWith("support_")
    ? feature.slice("support_".length)
    : feature;
}
