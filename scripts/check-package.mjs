import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function hasRequireCondition(value) {
  if (value === null || typeof value !== "object") return false;
  return Object.entries(value).some(([key, child]) => key === "require" || hasRequireCondition(child));
}

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
  const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
  if ("main" in manifest || manifest.module !== "dist/big.esm.js") {
    throw new Error("Expected an ESM-only package entry");
  }
  if (!manifest.exports?.["."]?.import || hasRequireCondition(manifest.exports)) {
    throw new Error("Expected import-only package exports");
  }
  const packageFiles = listFiles(packageRoot);
  const commonjsArtifacts = packageFiles.filter((file) => /\.(?:cjs|cts)(?:\.|$)|\.umd\./.test(file));
  if (commonjsArtifacts.length) throw new Error(`Unexpected CommonJS artifacts: ${commonjsArtifacts}`);
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
      if (!inputs.some((path) => path.endsWith("/dist/big.esm.js"))) {
        throw new Error(`Unexpected ${target} entry: ${inputs}`);
      }
    }
    if (readFileSync(join(directory, `${target}-entry.bundle.js`)).length >=
        readFileSync(join(directory, `${target}-full.bundle.js`)).length) throw new Error(`${target} tree shaking failed`);
  }
  for (const field of ["dependencies", "optionalDependencies", "peerDependencies"]) {
    if (Object.keys(manifest[field] || {}).length) throw new Error(`Unexpected ${field}`);
  }

  const esm = `import api, { Big, BigPipe, absBig, addBig, alignScale, cloneBig, compareBig, createBig, divBig,
      fromString, isBigObject, isNumericValue, maxBig, minBig, modBig, mulBig, pipeBig, pow10, powBig,
      sqrtBig, subBig } from "big.esm";
    import { addBig as extensionlessDeepAdd } from "big.esm/dist/big.esm";
    import { addBig as explicitDeepAdd } from "big.esm/dist/big.esm.js";
    const namedApi = { Big, BigPipe, absBig, addBig, alignScale, cloneBig, compareBig, createBig, divBig,
      fromString, isBigObject, isNumericValue, maxBig, minBig, modBig, mulBig, pipeBig, pow10, powBig, sqrtBig, subBig };
    if (api.addBig !== addBig || api.createBig !== createBig ||
        [extensionlessDeepAdd, explicitDeepAdd].some((item) => item !== addBig) ||
        Object.entries(namedApi).some(([name, item]) => typeof item !== "function" || api[name] !== item) ||
        addBig(createBig(1), createBig(2)).toString() !== "3") throw Error("ESM exports");
    const value = createBig("1.2");
    const pipeline = pipeBig(value).add("1");
    if (pipeline.value() !== value || value.toString() !== "2.2") throw Error("ESM mutation");`;
  const require = `const { createRequire } = require("node:module");
    const load = createRequire(__filename);
    for (const specifier of ["big.esm", "big.esm/dist/big.esm", "big.esm/dist/big.esm.js"]) {
      let failure;
      try { load(specifier); } catch (error) { failure = error; }
      if (!failure || !["ERR_PACKAGE_PATH_NOT_EXPORTED", "MODULE_NOT_FOUND"].includes(failure.code)) {
        throw failure || Error("CommonJS unexpectedly loaded " + specifier);
      }
    }`;
  writeFileSync(join(directory, "consumer.mjs"), esm);
  writeFileSync(join(directory, "consumer-require.cjs"), require);
  execFileSync(node, ["consumer.mjs"], { cwd: directory, stdio: "inherit" });
  execFileSync(node, ["consumer-require.cjs"], { cwd: directory, stdio: "inherit" });
  execFileSync(bun, ["consumer.mjs"], { cwd: directory, stdio: "inherit" });
  execFileSync(bun, ["consumer-require.cjs"], { cwd: directory, stdio: "inherit" });
  writeFileSync(join(directory, "consumer.mts"), `import api, { addBig, createBig, fromString, type Big, type BigValue } from "big.esm";
    import type { BigObject } from "big.esm/dist/types";
    api.addBig(api.createBig(1), api.createBig(2));
    const value: BigValue = "1"; const parsed: Big = fromString(value); addBig(parsed, createBig(2));
    const generic: Big = fromString<true>(value, false, true);
    const object: BigObject = fromString<false>(value, false, false);
    api.addBig(createBig(object), createBig(value));
    generic.toString(); object.value;
    // @ts-expect-error A boolean is not a BigValue.
    createBig(true);`);
  writeFileSync(join(directory, "consumer.cts"), `// @ts-expect-error The package has no CommonJS declaration entry.
    import big = require("big.esm");
    void big;`);
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
