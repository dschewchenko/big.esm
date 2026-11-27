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

// Keep the shared ESM import so both entry points use the same Big class.
const pipeSource = await Bun.file(join(root, "src/pipe.ts")).text();
const pipeJavaScript = await new Bun.Transpiler({
  loader: "ts",
  minifySyntax: true,
  minifyWhitespace: true
}).transform(pipeSource);
await Bun.write(join(outdir, "pipe.js"), pipeJavaScript);

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
  "pipeline.js": "BigPipe, pipe, pipeBig, pipeInPlace",
  "operations/abs.js": "abs, absInPlace, absBig",
  "operations/add.js": "add, addInPlace, addBig",
  "operations/compare.js": "compare, compareBig",
  "operations/div.js": "div, divInPlace, divBig",
  "operations/div-compact.js": "divCompact, divCompactInPlace, divCompactBig",
  "operations/max.js": "maxBig",
  "operations/min.js": "minBig",
  "operations/mod.js": "mod, modInPlace, modBig",
  "operations/mul.js": "mul, mulInPlace, mulBig",
  "operations/pow.js": "pow, powInPlace, powBig",
  "operations/round.js": "round, roundInPlace, roundBig",
  "operations/round-to-increment.js": "roundToStep, roundToStepInPlace, roundToIncrement",
  "operations/sqrt.js": "sqrt, sqrtInPlace, sqrtBig",
  "operations/sub.js": "sub, subInPlace, subBig",
  "operations/sum.js": "sumBig",
  "utils/align-scale.js": "alignScale",
  "utils/clone.js": "cloneBig",
  "utils/create.js": "createBig",
  "utils/from-string.js": "fromString, isDecimalInput",
  "utils/is-big-object.js": "isBigObject",
  "utils/numeric.js": "isNumericValue",
  "utils/pow10.js": "pow10",
  "utils/serialization.js": "deserializeBig, serializeBig",
  "utils/to-exponential.js": "toExponential",
  "utils/to-fixed.js": "toFixed",
  "utils/to-number.js": "toNumber",
  "utils/to-precision.js": "toPrecision"
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
