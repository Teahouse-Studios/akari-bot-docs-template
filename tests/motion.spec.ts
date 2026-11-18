import { afterEach, describe, expect, it, vi } from "vitest";

import { prefersReducedMotion } from "../docs/.vitepress/theme/search/animation";

function stubBrowser(options: { gpuTier?: string; reduced?: boolean }): void {
  vi.stubGlobal("document", {
    documentElement: {
      dataset: options.gpuTier ? { akariGpuTier: options.gpuTier } : {},
    },
  });
  vi.stubGlobal("window", {
    matchMedia: vi.fn(() => ({ matches: options.reduced ?? false })),
  });
}

describe("prefersReducedMotion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("turns motion off for a BAD GPU even when the OS allows it", () => {
    stubBrowser({ gpuTier: "bad", reduced: false });
    expect(prefersReducedMotion()).toBe(true);
  });

  it("keeps motion for a usable GPU when the OS allows it", () => {
    stubBrowser({ gpuTier: "good", reduced: false });
    expect(prefersReducedMotion()).toBe(false);
  });

  it("still honours the OS reduced-motion preference", () => {
    stubBrowser({ gpuTier: "good", reduced: true });
    expect(prefersReducedMotion()).toBe(true);
  });
});
