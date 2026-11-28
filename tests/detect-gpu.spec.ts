import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type GpuStub = {
  renderer: string;
  vendor?: string;
  userAgent?: string;
  webgpu?: boolean;
};

/**
 * Stubs just enough of the browser surface for detect-gpu.js:
 * two WebGL contexts (1.0/2.0), WEBGL_debug_renderer_info and navigator.
 */
function stubBrowser({
  renderer,
  vendor = "Google Inc. (Intel)",
  userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36",
  webgpu = false,
}: GpuStub) {
  const debugInfo = { UNMASKED_VENDOR_WEBGL: 0x9245, UNMASKED_RENDERER_WEBGL: 0x9246 };
  const gl = {
    VENDOR: 0x1f00,
    RENDERER: 0x1f01,
    getExtension: (name: string) => (name === "WEBGL_debug_renderer_info" ? debugInfo : null),
    getParameter: (param: number) => {
      if (param === 0x1f00 || param === 0x9245) return vendor;
      return renderer;
    },
  };
  const canvas = { getContext: () => gl };

  vi.stubGlobal("document", { createElement: () => canvas });
  vi.stubGlobal("window", {
    WebGLRenderingContext: {},
    WebGL2RenderingContext: {},
    navigator: { userAgent },
  });
  vi.stubGlobal("navigator", {
    userAgent,
    vendor: "Google Inc.",
    gpu: webgpu ? { requestAdapter: async () => ({}) } : undefined,
  });
}

async function tierOf(stub: GpuStub) {
  stubBrowser(stub);
  const { getGPUTier } = await import("../docs/.vitepress/theme/detect-gpu.js");
  return getGPUTier("BAD");
}

describe("getGPUTier classification", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("rates Panther Lake Arc B390 (ANGLE + PCI id) as GOOD", async () => {
    await expect(
      tierOf({
        renderer:
          "ANGLE (Intel, Intel(R) Arc(TM) B390 GPU (0x0000B080) Direct3D11 vs_5_0 ps_5_0, D3D11)",
      }),
    ).resolves.toEqual({ tier: "GOOD", reason: "Good Intel Xe3 GPU (Panther Lake)" });
  });

  it("rates a de-branded Panther Lake iGPU (plain Intel Graphics + PCI id) as GOOD", async () => {
    await expect(
      tierOf({
        renderer:
          "ANGLE (Intel, Intel(R) Graphics (0x0000B0A0) Direct3D11 vs_5_0 ps_5_0, D3D11)",
      }),
    ).resolves.toEqual({ tier: "GOOD", reason: "Good Intel Xe3 GPU (Panther Lake)" });
  });

  it("rates Mesa's Panther Lake renderer string as GOOD", async () => {
    await expect(tierOf({ renderer: "Mesa Intel(R) Graphics (PTL)" })).resolves.toEqual({
      tier: "GOOD",
      reason: "Good Intel Xe3 GPU (Panther Lake)",
    });
  });

  it("rates Lunar Lake Xe2 as GOOD", async () => {
    await expect(
      tierOf({
        renderer: "ANGLE (Intel, Intel(R) Arc(TM) 140V Graphics (LNL), D3D11)",
      }),
    ).resolves.toEqual({ tier: "GOOD", reason: "Good Intel Xe2 GPU (Lunar/Meteor Lake)" });
  });

  it("keeps old Intel UHD graphics on BAD", async () => {
    await expect(
      tierOf({
        renderer:
          "ANGLE (Intel, Intel(R) UHD Graphics 620 (0x00005917) Direct3D11 vs_5_0 ps_5_0, D3D11)",
      }),
    ).resolves.toEqual({ tier: "BAD", reason: "Old or low-performance Intel GPU" });
  });

  it("rates Mali-G925 Immortalis as GOOD", async () => {
    await expect(
      tierOf({ renderer: "ANGLE (ARM, Mali-G925-Immortalis MC12, OpenGL ES 3.2)", vendor: "ARM" }),
    ).resolves.toEqual({ tier: "GOOD", reason: "Good Mali/Immortalis GPU" });
  });

  it("rates Mali-G78 as GOOD", async () => {
    await expect(
      tierOf({ renderer: "ANGLE (ARM, Mali-G78 MP20, OpenGL ES 3.2)", vendor: "ARM" }),
    ).resolves.toEqual({ tier: "GOOD", reason: "Decent Mali GPU" });
  });

  it("rejects software renderers", async () => {
    await expect(
      tierOf({
        renderer: "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device), SwiftShader driver)",
      }),
    ).resolves.toEqual({ tier: "BAD", reason: "Software renderer" });
  });

  it("falls back to WebGPU support for unknown GPUs", async () => {
    await expect(tierOf({ renderer: "Some Unknown GPU", webgpu: true })).resolves.toEqual({
      tier: "GOOD",
      reason: "Supporting WebGPU",
    });
  });

  it("returns the undecided fallback when nothing matches", async () => {
    await expect(tierOf({ renderer: "Some Unknown GPU" })).resolves.toEqual({
      tier: "BAD",
      reason: "Unknown device, forcing to be BAD",
    });
  });
});
