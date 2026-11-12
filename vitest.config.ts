import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // SFC 用例需要 Vue 插件；站点构建由 VitePress 自带同一份插件。
  plugins: [vue()],
  test: {
    server: {
      deps: {
        // Its ESM build has extensionless relative imports, which Node cannot
        // load on its own; Vite resolves them, as it does in the site build.
        inline: ["@material/material-color-utilities"],
      },
    },
  },
});
