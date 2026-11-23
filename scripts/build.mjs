import { execFileSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
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

const publicFacades = {
  "index.js": "*",
  "package-entry.js": "default",
  "big.js": "Big",
  "pipeline.js": "BigPipe, pipeBig",
  "operations/abs.js": "absBig",
  "operations/add.js": "addBig",
  "operations/compare.js": "compareBig",
  "operations/div.js": "divBig",
  "operations/div-compact.js": "divCompactBig",
  "operations/max.js": "maxBig",
  "operations/min.js": "minBig",
  "operations/mod.js": "modBig",
  "operations/mul.js": "mulBig",
  "operations/pow.js": "powBig",
  "operations/round.js": "roundBig",
  "operations/round-to-increment.js": "roundToIncrement",
  "operations/sqrt.js": "sqrtBig",
  "operations/sub.js": "subBig",
  "utils/align-scale.js": "alignScale",
  "utils/clone.js": "cloneBig",
  "utils/create.js": "createBig",
  "utils/from-string.js": "createCompactBig, fromString, isDecimalInput",
  "utils/is-big-object.js": "isBigObject",
  "utils/numeric.js": "isNumericValue",
  "utils/pow10.js": "pow10",
  "utils/to-exponential.js": "toExponential",
  "utils/to-fixed.js": "toFixed"
};

for (const [file, exports] of Object.entries(publicFacades)) {
  const output = join(outdir, file);
  const relativeCore = relative(dirname(output), join(outdir, "core.js")).split(sep).join("/");
  const coreSpecifier = relativeCore.startsWith(".") ? relativeCore : `./${relativeCore}`;
  const contents = file === "index.js"
    ? `export * from "${coreSpecifier}";\n`
    : file === "package-entry.js"
      ? `import * as api from "${coreSpecifier}";\nexport * from "${coreSpecifier}";\nexport default api;\n`
      : `export { ${exports} } from "${coreSpecifier}";\n`;
  await Bun.write(output, contents);
}
