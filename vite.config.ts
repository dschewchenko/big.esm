/// <reference types="vitest/config" />

import { extname, resolve } from "node:path";
import { defineConfig, PluginOption } from "vite";
import dtsPlugin from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";

// Node's TypeScript resolvers need explicit extensions in emitted ESM declarations.
const relativeImport = /^(\s*(?:import|export)\b[^\r\n]*?\bfrom\s*)(["'])(\.{1,2}\/[^"']+)\2/gm;

export default defineConfig({
  build: {
    target: ["chrome107", "edge107", "firefox104", "safari16.0"],
    rolldownOptions: {
      output: {
        minify: { compress: true, mangle: true, codegen: true }
      }
    },
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "big.esm",
      fileName: "big.esm"
    }
  },
  plugins: [
    dtsPlugin({
      beforeWriteFile: (_path, content) => ({
        content: content.replace(relativeImport, (_, prefix, quote, specifier) => {
          const target = extname(specifier) ? specifier : `${specifier}.js`;
          return `${prefix}${quote}${target}${quote}`;
        })
      })
    }),
    visualizer({
      template: "list",
      gzipSize: true
    }) as PluginOption
  ],
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json"],
      lines: 60,
      branches: 60,
      functions: 60,
      statements: 60
    }
  }
});
