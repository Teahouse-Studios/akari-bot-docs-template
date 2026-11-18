declare module "./detect-gpu.js" {
  export type GpuTier = "GOOD" | "BAD" | string;
  export function getGPUTier(
    undecided?: string,
    printDebugInfo?: boolean,
  ): Promise<{ tier: GpuTier; reason?: string }>;
}

export {};
