import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";

const directory = mkdtempSync(join(tmpdir(), "big-esm-package-"));
const bun = process.execPath;
// Bun's `run.bun` setting places a `node` symlink to Bun at the front of PATH.
const node = process.env.NODE_BINARY || process.env.PATH.split(delimiter)
  .map((directory) => join(directory, process.platform === "win32" ? "node.exe" : "node"))
  .find((candidate) => existsSync(candidate) && realpathSync(candidate) !== realpathSync(bun));
if (!node) throw new Error("Node.js executable not found; set NODE_BINARY");

try {
  execFileSync(bun, ["pm", "pack", "--ignore-scripts", "--filename", join(directory, "package.tgz")], {
    stdio: "inherit"
  });
  writeFileSync(join(directory, "package.json"), JSON.stringify({
    private: true,
    type: "module",
    dependencies: { "big.esm": "file:./package.tgz" }
  }));
  execFileSync(bun, ["install", "--production", "--ignore-scripts"], { cwd: directory, stdio: "inherit" });

  const installed = readdirSync(join(directory, "node_modules")).filter((name) => !name.startsWith("."));
  if (installed.length !== 1 || installed[0] !== "big.esm") throw new Error(`Unexpected dependencies: ${installed}`);
  const packageRoot = join(directory, "node_modules/big.esm");
  for (const file of ["dist/index.d.ts", "dist/big.d.ts", "dist/types.d.ts", "dist/operations/add.d.ts"]) {
    readFileSync(join(packageRoot, file));
  }
  writeFileSync(join(directory, "browser-entry.js"),
    'import { addBig, createBig } from "big.esm"; globalThis.result = addBig(createBig(1), createBig(2));');
  writeFileSync(join(directory, "browser-full.js"),
    'import * as api from "big.esm"; globalThis.library = api;');
  for (const target of ["browser", "bun"]) {
    for (const name of ["entry", "full"]) {
      execFileSync(bun, ["build", `browser-${name}.js`, `--target=${target}`, "--minify",
        `--outfile=${target}-${name}.bundle.js`, `--metafile=${target}-${name}.meta.json`],
        { cwd: directory, stdio: "ignore" });
      const metafile = JSON.parse(readFileSync(join(directory, `${target}-${name}.meta.json`), "utf8"));
      const inputs = Object.keys(metafile.inputs);
      if (!inputs.some((path) => path.endsWith("/dist/big.esm.js")) ||
          inputs.some((path) => path.endsWith("/node.mjs") || path.endsWith("/dist/big.esm.umd.cjs"))) {
        throw new Error(`Unexpected ${target} entry: ${inputs}`);
      }
    }
    if (readFileSync(join(directory, `${target}-entry.bundle.js`)).length >=
        readFileSync(join(directory, `${target}-full.bundle.js`)).length) throw new Error(`${target} tree shaking failed`);
  }
  const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
  for (const field of ["dependencies", "optionalDependencies", "peerDependencies"]) {
    if (Object.keys(manifest[field] || {}).length) throw new Error(`Unexpected ${field}`);
  }

  const esm = `import { createRequire } from "node:module";
    import api, { Big, BigPipe, absBig, addBig, alignScale, cloneBig, compareBig, createBig, divBig,
      fromString, isBigObject, isNumericValue, maxBig, minBig, modBig, mulBig, pipeBig, pow10, powBig,
      sqrtBig, subBig } from "big.esm";
    import { addBig as deepAdd } from "big.esm/dist/big.esm.js";
    const require = createRequire(import.meta.url);
    const commonjs = require("big.esm");
    if (api !== commonjs || Big !== commonjs.Big || createBig !== commonjs.createBig) throw Error("Dual package identity");
    const cjsValue = commonjs.createBig("1.2");
    const pipeline = pipeBig(cjsValue).add("1");
    if (pipeline.value() !== cjsValue || cjsValue.toString() !== "2.2") throw Error("Cross-module mutation");
    if (!(createBig("1") instanceof commonjs.Big)) throw Error("Cross-module instanceof");
    const all = [Big, BigPipe, absBig, addBig, alignScale, cloneBig, compareBig, createBig, divBig,
      fromString, isBigObject, isNumericValue, maxBig, minBig, modBig, mulBig, pipeBig, pow10, powBig, sqrtBig, subBig];
    if (typeof deepAdd !== "function" || all.some((item) => typeof item !== "function") || addBig(createBig(1), createBig(2)).toString() !== "3") throw Error("ESM exports");`;
  const cjs = `const { addBig, createBig } = require("big.esm");
    if (require("big.esm/package").name !== "big.esm") throw Error("Extensionless package.json export");
    if (!require.resolve("big.esm/dist/big.esm").endsWith("big.esm.js")) throw Error("Extensionless ESM path");
    if (Number(process.versions.node.split(".")[0]) >= 22 &&
        typeof require("big.esm/dist/big.esm").addBig !== "function") throw Error("Extensionless ESM require");
    if (require("big.esm/package.json").name !== "big.esm") throw Error("package.json export");
    if (typeof require("big.esm/dist/big.esm.umd.cjs").addBig !== "function") throw Error("CJS subpath");
    if (addBig(createBig(1), createBig(2)).toString() !== "3") throw Error("CJS exports");`;
  writeFileSync(join(directory, "consumer.mjs"), esm);
  writeFileSync(join(directory, "consumer.cjs"), cjs);
  execFileSync(node, ["consumer.mjs"], { cwd: directory, stdio: "inherit" });
  execFileSync(node, ["consumer.cjs"], { cwd: directory, stdio: "inherit" });
  execFileSync(bun, ["consumer.mjs"], { cwd: directory, stdio: "inherit" });
  execFileSync(bun, ["consumer.cjs"], { cwd: directory, stdio: "inherit" });
  writeFileSync(join(directory, "consumer.mts"), `import api, { addBig, createBig, fromString, type Big, type BigValue } from "big.esm";
    import commonjs = require("big.esm");
    import type { BigObject } from "big.esm/dist/types";
    api.addBig(api.createBig(1), api.createBig(2));
    const value: BigValue = "1"; const parsed: Big = fromString(value); addBig(parsed, createBig(2));
    const generic: Big = fromString<true>(value, false, true);
    const object: BigObject = fromString<false>(value, false, false);
    const shared: commonjs.Big = createBig(object);
    api.addBig(shared, commonjs.createBig(value));
    generic.toString(); object.value;
    // @ts-expect-error A boolean is not a BigValue.
    createBig(true);`);
  writeFileSync(join(directory, "consumer.cts"), `import big = require("big.esm");
    import { Big, addBig, createBig, type BigValue } from "big.esm";
    const value: BigValue = "1"; const input: big.Big = createBig(value);
    const result: Big = addBig(input, big.createBig(2)); result.toString();
    // @ts-expect-error A boolean is not a BigValue.
    big.createBig(true);`);
  // TypeScript 6 is also installed for tooling, so resolve the root compiler directly.
  const tsc = resolve("node_modules/typescript/bin/tsc");
  for (const module of ["node16", "nodenext"]) {
    execFileSync(bun, [tsc, "--noEmit", "--strict", "--target", "es2020",
      "--module", module, "consumer.mts", "consumer.cts"], { cwd: directory, stdio: "inherit" });
  }
  writeFileSync(join(directory, "consumer-deep.ts"), `import type { BigObject } from "big.esm/dist/types";
    const value: BigObject = { value: 1n, scale: 0 }; void value;`);
  execFileSync(bun, [tsc, "--noEmit", "--strict", "--target", "es2020",
    "--module", "esnext", "--moduleResolution", "bundler", "consumer-deep.ts"],
    { cwd: directory, stdio: "inherit" });
  console.log(`Package checks passed with ${execFileSync(node, ["--version"], { encoding: "utf8" }).trim()}`);
} finally {
  rmSync(resolve(directory), { recursive: true, force: true });
}
