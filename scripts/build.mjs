import { execFileSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const outdir = join(root, "dist");
await rm(outdir, { force: true, recursive: true });

execFileSync(process.execPath, [
  join(root, "node_modules/typescript/bin/tsc"),
  "--noEmit", "false",
  "--declaration",
  "--emitDeclarationOnly",
  "--rootDir", "src",
  "--outDir", "dist"
], { cwd: root, stdio: "inherit" });

const result = await Bun.build({
  entrypoints: [join(root, "src/index.ts")],
  format: "esm",
  target: "browser",
  minify: true,
  naming: "core.js",
  outdir
});
if (!result.success) throw new AggregateError(result.logs, "ESM build failed");

await Bun.write(join(outdir, "big.esm.js"), [
  'import * as api from "./core.js";',
  'export * from "./core.js";',
  "export default api;",
  ""
].join("\n"));
