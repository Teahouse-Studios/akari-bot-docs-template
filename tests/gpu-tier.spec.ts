import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getGPUTier = vi.fn();

vi.mock("../docs/.vitepress/theme/detect-gpu.js", () => ({ getGPUTier }));

type DatasetTarget = { documentElement: { dataset: Record<string, string> } };

function setDocument(): DatasetTarget {
  const target: DatasetTarget = { documentElement: { dataset: {} } };
  vi.stubGlobal("document", target);
  return target;
}

describe("gpu tier", () => {
  beforeEach(() => {
    vi.resetModules();
    getGPUTier.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("stores the detected tier and disables expensive effects for BAD devices", async () => {
    const target = setDocument();
    getGPUTier.mockResolvedValue({ tier: "BAD", reason: "Software renderer" });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { getAkariGpuTier, hasAkariGpu } = await import("../docs/.vitepress/theme/gpu-tier");

    await expect(getAkariGpuTier()).resolves.toEqual({ tier: "BAD", reason: "Software renderer" });
    expect(target.documentElement.dataset.akariGpuTier).toBe("bad");
    await expect(hasAkariGpu()).resolves.toBe(false);
    expect(getGPUTier).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      "[akari] No usable GPU detected (Software renderer); expensive WebGL effects are disabled and the wall falls back to its CSS gradient.",
    );
  });

  it("keeps WebGL enabled when detection fails", async () => {
    setDocument();
    getGPUTier.mockRejectedValue(new Error("GPU detection unavailable"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { hasAkariGpu } = await import("../docs/.vitepress/theme/gpu-tier");

    await expect(hasAkariGpu()).resolves.toBe(true);
    expect(warn).toHaveBeenCalledWith("[akari] GPU detection failed, keeping WebGL enabled.", expect.any(Error));
  });
});
