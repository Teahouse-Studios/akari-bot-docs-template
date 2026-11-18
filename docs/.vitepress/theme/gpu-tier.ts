import { getGPUTier } from "./detect-gpu.js";

export type AkariGpuTier = "GOOD" | "BAD" | string;

let pending: Promise<{ tier: AkariGpuTier; reason?: string }> | null = null;

/** Detects once per page, so every fluid wall shares the same answer. */
export function getAkariGpuTier(): Promise<{ tier: AkariGpuTier; reason?: string }> {
  if (pending) return pending;
  pending = (async () => {
    try {
      const result = await getGPUTier("BAD");
      if (typeof document !== "undefined") {
        document.documentElement.dataset.akariGpuTier = String(result.tier).toLowerCase();
      }
      if (result.tier === "BAD") {
        console.warn(
          `[akari] No usable GPU detected (${result.reason ?? "unknown"}); expensive WebGL effects are disabled and the wall falls back to its CSS gradient.`,
        );
      }
      return result;
    } catch (error) {
      console.warn("[akari] GPU detection failed, keeping WebGL enabled.", error);
      return { tier: "GOOD", reason: "GPU detection unavailable" };
    }
  })();
  return pending;
}

/** A BAD tier means software rendering or no WebGL2; expensive effects stay off. */
export async function hasAkariGpu(): Promise<boolean> {
  const { tier } = await getAkariGpuTier();
  return tier !== "BAD";
}
