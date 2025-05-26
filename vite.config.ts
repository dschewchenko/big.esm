/// <reference types="vitest/config" />

import { resolve } from "path";
import { defineConfig, PluginOption } from "vite";
import dtsPlugin from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "big.esm",
      fileName: "big.esm"
    }
  },
  plugins: [
    dtsPlugin(),
    visualizer({
      template: "list",
      gzipSize: true
    }) as PluginOption
  ],
  test: {
    globals: true, // Ensure Vitest globals are available
    coverage: {
      provider: "c8",
      reporter: ["text", "json-summary", "json"],
      lines: 60,
      branches: 60,
      functions: 60,
      statements: 60
    }
  }
});
