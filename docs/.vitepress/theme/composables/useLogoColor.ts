import { onMounted, readonly, ref, watch, type ComputedRef, type Ref } from "vue";
import { withBase } from "vitepress";

const STORAGE_KEY = "akari-logo-color";

function readCache(): Record<string, string> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return value && typeof value === "object"
      ? (value as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

function writeCache(url: string, color: string): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...readCache(), [url]: color }),
    );
  } catch {
    // Storage unavailable or full: sample again next time.
  }
}

/**
 * The theme seed sampled from the site logo, used when the reader has not
 * chosen a color. Sampling runs after mount so the server render and
 * hydration agree; the result is cached per logo URL.
 */
export function useLogoColor(logo: ComputedRef<string>): Readonly<Ref<string | null>> {
  const color = ref<string | null>(null);
  let request = 0;

  onMounted(() => {
    watch(
      logo,
      async (value) => {
        const url = value ? withBase(value) : "";
        if (!url) {
          color.value = null;
          return;
        }

        const known = readCache()[url];
        if (known) {
          color.value = known;
          return;
        }

        const id = ++request;
        const { sampleImageColor } = await import("../heroColor");
        const sampled = await sampleImageColor(url);
        if (sampled) writeCache(url, sampled);
        if (id === request) color.value = sampled;
      },
      { immediate: true },
    );
  });

  return readonly(color);
}
