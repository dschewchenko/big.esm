import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const maxNamedGzipBytes = 1700;
const maxPipeGzipBytes = 2000;

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
  for (const file of ["dist/index.d.ts", "dist/big.d.ts", "dist/types.d.ts", "dist/pipe.d.ts", "dist/operations/add.d.ts"]) {
    readFileSync(join(packageRoot, file));
  }
  const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
  if ("main" in manifest || manifest.module !== "dist/big.esm.js") {
    throw new Error("Expected an ESM-only package entry");
  }
  if (!manifest.exports?.["."]?.import || hasRequireCondition(manifest.exports)) {
    throw new Error("Expected import-only package exports");
  }
  if (manifest.exports?.["./pipe"]?.import?.types !== "./dist/pipe.d.ts" ||
      manifest.exports?.["./pipe"]?.import?.default !== "./dist/pipe.js") {
    throw new Error("Expected the operator pipe ESM subpath and declarations");
  }
  const packageFiles = listFiles(packageRoot);
  const commonjsArtifacts = packageFiles.filter((file) => /\.(?:cjs|cts)(?:\.|$)|\.umd\./.test(file));
  if (commonjsArtifacts.length) throw new Error(`Unexpected CommonJS artifacts: ${commonjsArtifacts}`);
  writeFileSync(join(directory, "browser-entry.js"),
    'import { addBig, createBig } from "big.esm"; globalThis.result = addBig(createBig(1), createBig(2));');
  writeFileSync(join(directory, "browser-pure-entry.js"),
    'import { add } from "big.esm"; globalThis.result = add("1", "2").toString();');
  writeFileSync(join(directory, "browser-pipe-entry.js"),
    'import { pipe, add, mul } from "big.esm/pipe"; globalThis.result = pipe("1", add(2), mul(3)).toString(); if (globalThis.result !== "9") throw Error("Pipe bundle result");');
  writeFileSync(join(directory, "browser-full.js"),
    'import * as api from "big.esm"; globalThis.library = api;');
  for (const target of ["browser", "bun"]) {
    for (const name of ["entry", "pure-entry", "pipe-entry", "full"]) {
      execFileSync(bun, ["build", `browser-${name}.js`, `--target=${target}`, "--minify",
        `--outfile=${target}-${name}.bundle.js`, `--metafile=${target}-${name}.meta.json`],
        { cwd: directory, stdio: "ignore" });
      const metafile = JSON.parse(readFileSync(join(directory, `${target}-${name}.meta.json`), "utf8"));
      const inputs = Object.keys(metafile.inputs);
      const entryInput = name === "pipe-entry"
        ? inputs.some((path) => path.endsWith("/dist/pipe.js")) &&
          inputs.some((path) => path.endsWith("/dist/index.js"))
        : inputs.some((path) => path.endsWith("/dist/big.esm.js"));
      if (!entryInput || !inputs.some((path) => path.endsWith("/dist/core.js"))) {
        throw new Error(`Unexpected ${target} entry: ${inputs}`);
      }
    }
    const namedBundle = readFileSync(join(directory, `${target}-entry.bundle.js`));
    const pureNamedBundle = readFileSync(join(directory, `${target}-pure-entry.bundle.js`));
    const pipeNamedBundle = readFileSync(join(directory, `${target}-pipe-entry.bundle.js`));
    const fullBundle = readFileSync(join(directory, `${target}-full.bundle.js`));
    const namedGzipBytes = gzipSync(namedBundle, { level: 9 }).byteLength;
    const pureNamedGzipBytes = gzipSync(pureNamedBundle, { level: 9 }).byteLength;
    const pipeNamedGzipBytes = gzipSync(pipeNamedBundle, { level: 9 }).byteLength;
    const fullGzipBytes = gzipSync(fullBundle, { level: 9 }).byteLength;
    if (pipeNamedBundle.includes("Root") || pipeNamedBundle.includes("Div0")) {
      throw new Error(`${target} operator pipe bundle includes unused sqrt or division kernels`);
    }
    if (namedGzipBytes >= maxNamedGzipBytes) {
      throw new Error(`${target} named consumer is ${namedGzipBytes} gzip bytes, expected below ${maxNamedGzipBytes}`);
    }
    if (pureNamedGzipBytes >= maxNamedGzipBytes) {
      throw new Error(`${target} pure named consumer is ${pureNamedGzipBytes} gzip bytes, expected below ${maxNamedGzipBytes}`);
    }
    if (pipeNamedGzipBytes >= maxPipeGzipBytes) {
      throw new Error(`${target} operator pipe consumer is ${pipeNamedGzipBytes} gzip bytes, expected below ${maxPipeGzipBytes}`);
    }
    if (namedGzipBytes >= fullGzipBytes * 0.5) {
      throw new Error(`${target} tree shaking is weak: named=${namedGzipBytes}, full=${fullGzipBytes} gzip bytes`);
    }
    if (pureNamedGzipBytes >= fullGzipBytes * 0.5) {
      throw new Error(`${target} pure tree shaking is weak: named=${pureNamedGzipBytes}, full=${fullGzipBytes} gzip bytes`);
    }
    if (pipeNamedGzipBytes >= fullGzipBytes * 0.5) {
      throw new Error(`${target} operator pipe tree shaking is weak: named=${pipeNamedGzipBytes}, full=${fullGzipBytes} gzip bytes`);
    }
    execFileSync(bun, [join(directory, `${target}-pipe-entry.bundle.js`)], { cwd: directory, stdio: "inherit" });
    console.log(`${target} consumer gzip bytes: legacy=${namedGzipBytes}, pure=${pureNamedGzipBytes}, pipe=${pipeNamedGzipBytes}, full=${fullGzipBytes}`);
  }
  for (const field of ["dependencies", "optionalDependencies", "peerDependencies"]) {
    if (Object.keys(manifest[field] || {}).length) throw new Error(`Unexpected ${field}`);
  }

  const esm = `import api, { Big, BigPipe, abs, absBig, absInPlace, add, addBig, addInPlace, alignScale, cloneBig,
      compare, compareBig, createBig, createCompactBig, deserializeBig, div, divBig, divCompact, divCompactBig,
      divCompactInPlace, divInPlace, fromString, isBigObject, isDecimalInput, isNumericValue, maxBig, minBig, mod,
      modBig, modInPlace, mul, mulBig, mulInPlace, pipe, pipeBig, pipeInPlace, pow, pow10, powBig, powInPlace,
      round, roundBig, roundInPlace, roundToIncrement, roundToStep, roundToStepInPlace, serializeBig, sqrt,
      sqrtBig, sqrtInPlace, sub, subBig, subInPlace, sumBig, toExponential, toFixed, toNumber, toPrecision } from "big.esm";
    import { pipe as operatorPipe, add as addStep, mul as multiplyStep, div as divideStep } from "big.esm/pipe";
    import { addBig as extensionlessDeepAdd } from "big.esm/dist/big.esm";
    import { addBig as explicitDeepAdd } from "big.esm/dist/big.esm.js";
    import { add as deepPureAdd, addInPlace as deepAddInPlace, addBig as deepLegacyAdd } from "big.esm/dist/operations/add";
    import { addBig as operationAdd } from "big.esm/dist/operations/add";
    import { addBig as operationAddJs } from "big.esm/dist/operations/add.js";
    import { compare as deepCompare } from "big.esm/dist/operations/compare.js";
    import { roundToStep as deepRoundToStep, roundToStepInPlace as deepRoundToStepInPlace } from "big.esm/dist/operations/round-to-increment";
    import { Big as deepBig } from "big.esm/dist/big";
    import { pipeBig as deepPipe } from "big.esm/dist/pipeline.js";
    import { pipe as deepPipeCopy, pipeInPlace as deepPipeInPlace } from "big.esm/dist/pipeline";
    import { toFixed as deepFixed } from "big.esm/dist/utils/to-fixed";
    import { toPrecision as deepPrecision } from "big.esm/dist/utils/to-precision.js";
    import { divCompactBig as coreDivide } from "big.esm/dist/core.js";
    const namedApi = { Big, BigPipe, abs, absBig, absInPlace, add, addBig, addInPlace, alignScale, cloneBig,
      compare, compareBig, createBig, createCompactBig, deserializeBig, div, divBig, divCompact, divCompactBig,
      divCompactInPlace, divInPlace, fromString, isBigObject, isDecimalInput, isNumericValue, maxBig, minBig, mod,
      modBig, modInPlace, mul, mulBig, mulInPlace, pipe, pipeBig, pipeInPlace, pow, pow10, powBig, powInPlace,
      round, roundBig, roundInPlace, roundToIncrement, roundToStep, roundToStepInPlace, serializeBig, sqrt,
      sqrtBig, sqrtInPlace, sub, subBig, subInPlace, sumBig, toExponential, toFixed, toNumber, toPrecision };
    if (api.addBig !== addBig || api.createBig !== createBig ||
        [extensionlessDeepAdd, explicitDeepAdd, operationAdd, operationAddJs].some((item) => item !== addBig) ||
        deepPureAdd !== add || deepAddInPlace !== addInPlace || deepLegacyAdd !== addBig ||
        deepCompare !== compare || deepRoundToStep !== roundToStep || deepRoundToStepInPlace !== roundToStepInPlace ||
        deepBig !== Big || deepPipe !== pipeBig || deepFixed !== toFixed || deepPrecision !== toPrecision || coreDivide !== divCompactBig ||
        Object.entries(namedApi).some(([name, item]) => typeof item !== "function" || api[name] !== item) ||
        addBig(createBig(1), createBig(2)).toString() !== "3" || add("1", "2").toString() !== "3" ||
        addBig !== addInPlace || absBig !== absInPlace || divBig !== divInPlace || divCompactBig !== divCompactInPlace ||
        modBig !== modInPlace || mulBig !== mulInPlace || powBig !== powInPlace || roundBig !== roundInPlace ||
        roundToIncrement !== roundToStepInPlace || sqrtBig !== sqrtInPlace || subBig !== subInPlace) throw Error("ESM exports");
    function checkInPlace(operation, receiver, expected, ...args) {
      if (operation(receiver, ...args) !== receiver || receiver.toString() !== expected) throw Error("InPlace identity");
    }
    const pureInput = createBig("1.2");
    const pureResult = add(pureInput, "2.3");
    if (pureResult === pureInput || pureInput.toString() !== "1.2" || pureResult.toString() !== "3.5") {
      throw Error("Pure operation mutated its input");
    }
    checkInPlace(absInPlace, createBig("-2"), "2");
    checkInPlace(addInPlace, createBig("1.2"), "3.5", "2.3");
    checkInPlace(subInPlace, createBig("3.5"), "1.2", "2.3");
    checkInPlace(mulInPlace, createBig("1.2"), "3.6", 3);
    checkInPlace(divInPlace, createBig(1), "0.125", 8);
    checkInPlace(divCompactInPlace, createBig(1), "0.125", 8);
    checkInPlace(modInPlace, createBig(5), "2", 3);
    checkInPlace(powInPlace, createBig(2), "1024", 10);
    checkInPlace(sqrtInPlace, createBig(9), "3");
    checkInPlace(roundInPlace, createBig("1.256"), "1.26", 2);
    checkInPlace(roundToStepInPlace, createBig("1.03"), "1.05", "0.05");
    const rounded = createBig("1.125");
    if (roundBig(rounded, 2, "half-even") !== rounded || rounded.toString() !== "1.12" ||
        toFixed(createBig("1.005"), 2, "half-even") !== "1.00" ||
        toExponential(createBig("1e-10000000000")) !== "1e-10000000000" ||
        createCompactBig("1e10000000000").scale !== -10000000000 ||
        divCompactBig(createBig(1), createBig(8)).toString() !== "0.125" ||
        toExponential(divCompactBig(createCompactBig("3e10000000000"), createBig(2))) !== "1.5e+10000000000" ||
        roundToStep("-1.025", "0.05", "half-even").toString() !== "-1" ||
        compare("1.2", "1.19") !== 1 || div("1", 8, 3).toString() !== "0.125" ||
        mod("5", "3").toString() !== "2" || abs("-2.5").toString() !== "2.5" ||
        mul("1.2", 3).toString() !== "3.6" || pow("2", 10).toString() !== "1024" ||
        sqrt("9").toString() !== "3" || round("1.256", 2).toString() !== "1.26" ||
        !isDecimalInput("1.25") || isDecimalInput("")) throw Error("Decimal exports");
    const serialized = JSON.stringify(serializeBig("3e10000000000"));
    if (toExponential(deserializeBig(JSON.parse(serialized))) !== "3e+10000000000" ||
        toNumber("1.23") !== 1.23 || toPrecision("45.6", 5) !== "45.600" ||
        sumBig(["0.1", "0.2", 1n]).toString() !== "1.3" ||
        pipe("1.03").roundToStep("0.05").toFixed(2) !== "1.05") throw Error("Decimal conveniences");
    const operatorInput = createBig("4");
    const operatorGroup = [addStep(2), multiplyStep(3)];
    const operatorIntermediate = operatorPipe(operatorInput, ...operatorGroup);
    const operatorResult = operatorPipe(operatorIntermediate, divideStep(2, 3, "half-up"));
    if (!(operatorResult instanceof Big) || operatorInput.toString() !== "4" ||
        operatorIntermediate.toString() !== "18" || operatorResult.toString() !== "9") {
      throw Error("Operator pipe groups or Big identity");
    }
    const copiedInput = createBig("1.03");
    const copiedPipeline = pipe(copiedInput).roundToStep("0.05");
    const sharedInput = createBig("1.03");
    const sharedPipeline = pipeInPlace(sharedInput).roundToStep("0.05");
    let rejectedNonBig = false;
    try { pipeInPlace("1.03"); } catch (error) { rejectedNonBig = error instanceof TypeError; }
    if (copiedPipeline.current === copiedInput || copiedInput.toString() !== "1.03" || copiedPipeline.toString() !== "1.05" ||
        sharedPipeline.current !== sharedInput || sharedInput.toString() !== "1.05" || !rejectedNonBig) {
      throw Error("Explicit pipeline mutation semantics");
    }
    const value = createBig("1.2");
    const pipeline = pipeBig(value).add(createBig("1"));
    if (pipeline.value() !== value || value.toString() !== "2.2") throw Error("ESM mutation");`;
  const require = `const { createRequire } = require("node:module");
    const load = createRequire(__filename);
    for (const specifier of ["big.esm", "big.esm/dist/big.esm", "big.esm/dist/big.esm.js", "big.esm/dist/operations/add", "big.esm/dist/operations/add.js"]) {
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
  writeFileSync(join(directory, "consumer.mts"), `import api, { abs, absBig, absInPlace, add, addBig, addInPlace, Big, compare,
      createBig, deserializeBig, div, divBig, divCompact, divCompactBig, divCompactInPlace, divInPlace, fromString,
      mod, modBig, modInPlace, mul, mulBig, mulInPlace, pipe, pipeBig, pipeInPlace, pow, powBig, powInPlace,
      round, roundBig, roundInPlace, roundToIncrement, roundToStep, roundToStepInPlace, serializeBig, sqrt, sqrtBig, sqrtInPlace,
      sub, subBig, subInPlace,
      type BigObject, type BigValue, type SerializedBig } from "big.esm";
    import { pipe as operatorPipe, add as addStep, mul as multiplyStep, div as divideStep,
      type PipeOperator } from "big.esm/pipe";
    import type { BigObject as DeepBigObject } from "big.esm/dist/types";
    import type { BigObject as ExplicitBigObject } from "big.esm/dist/types.js";
    import { add as deepAdd, addInPlace as deepAddInPlace, addBig as deepLegacyAdd } from "big.esm/dist/operations/add";
    import { add as deepAddJs } from "big.esm/dist/operations/add.js";
    import { compare as deepCompare } from "big.esm/dist/operations/compare.js";
    import { roundToStep as deepRoundToStep } from "big.esm/dist/operations/round-to-increment";
    import { Big as deepBig } from "big.esm/dist/big.js";
    import { pipe as deepPipeCopy, pipeBig as deepPipe, pipeInPlace as deepPipeInPlace } from "big.esm/dist/pipeline";
    import { toFixed as deepFixed } from "big.esm/dist/utils/to-fixed.js";
    import { divCompactBig as coreDivide } from "big.esm/dist/core.js";
    // @ts-expect-error Internal helpers have no public runtime entry point.
    import { assertScale } from "big.esm/dist/utils/assert-scale";
    function construct(value: BigValue, scale?: number): Big[] {
      return [new Big(value), new Big("1.23", scale)];
    }
    api.addBig(api.createBig(1), api.createBig(2));
    const value: BigValue = "1"; const parsed: Big = fromString(value); addBig(parsed, createBig(2));
    const generic: Big = fromString<true>(value, false, true);
    const rootObject: BigObject = { value: 1n, scale: 0 };
    const object: DeepBigObject = rootObject;
    const explicitObject: ExplicitBigObject = rootObject;
    const pure: Big = add(object, "2");
    const directResults: Big[] = [abs("-2"), add("1", 2n), sub("3", 1n), mul("2", 3), div("1", 8, 3),
      divCompact("1", 8), mod("5", 3), pow("2", 3), sqrt("9"), round("1.25", 1), roundToStep("1.03", "0.05")];
    const purePipe = pipe("1.03").roundToStep("0.05");
    const operatorGroup: PipeOperator[] = [addStep(2), multiplyStep(3)];
    const operatorResult: Big = operatorPipe("4", ...operatorGroup, divideStep(2, 3, "half-up"));
    // @ts-expect-error Operator arguments must be configured before calling pipe.
    operatorPipe(1, undefined);
    // @ts-expect-error Operation factories are not operators until invoked.
    operatorPipe(1, addStep);
    const copyFromBig = pipe(new Big("1")).add(2n);
    const inPlace = addInPlace(new Big(1), "2");
    const inPlaceResults: Big[] = [absInPlace(new Big("-2")), addInPlace(new Big(1), 2n),
      subInPlace(new Big(3), 1n), mulInPlace(new Big(2), 3), divInPlace(new Big(1), 8, 3),
      divCompactInPlace(new Big(1), 8), modInPlace(new Big(5), 3), powInPlace(new Big(2), 3),
      sqrtInPlace(new Big(9)), roundInPlace(new Big("1.25"), 1), roundToStepInPlace(new Big("1.03"), "0.05")];
    const legacyResults: Big[] = [absBig(new Big("-2")), addBig(new Big(1), new Big(2)),
      subBig(new Big(3), new Big(1)), mulBig(new Big(2), new Big(3)), divBig(new Big(1), new Big(8)),
      divCompactBig(new Big(1), new Big(8)), modBig(new Big(5), new Big(3)), powBig(new Big(2), 3),
      sqrtBig(new Big(9)), roundBig(new Big("1.25"), 1), roundToIncrement(new Big("1.03"), new Big("0.05"))];
    const inPlacePipe = pipeInPlace(new Big("1")).roundToStep("0.05");
    const legacyPipe = pipeBig(new Big("1")).add(new Big("2"));
    const deepLegacyPipe = deepPipe(new Big("1")).add(new Big("2"));
    deepAdd(new deepBig(explicitObject), "2");
    deepAddJs("1", 2n);
    deepAddInPlace(new Big(1), "2");
    deepLegacyAdd(new Big(1), new Big(2));
    deepCompare("1.2", 1n);
    deepRoundToStep("1.03", "0.05");
    deepPipeCopy("1").add(2n);
    deepPipeInPlace(new Big("1")).roundToStep("0.05");
    roundToStep("1.03", "0.05");
    compare("1.2", 1n);
    add("1.1", "2.2");
    // @ts-expect-error InPlace operations require a mutable Big as the first argument.
    addInPlace("1", "2");
    // @ts-expect-error Legacy Big-suffixed operations retain their Big/Big signature.
    addBig(new Big(1), "2");
    // @ts-expect-error The mutation flag was removed in v2.
    addBig(new Big(1), new Big(2), false);
    // @ts-expect-error Mutating pipelines require a Big instance.
    pipeInPlace("1");
    roundToIncrement(new Big("1.03"), new Big("0.05"));
    deepFixed(coreDivide(new Big(1), new Big(2)), 2);
    const serialized: SerializedBig = serializeBig("1.2300");
    const formatted: string = deepPipeCopy(deserializeBig(serialized)).roundToStep("0.05").toPrecision(3);
    api.add(new Big(formatted), "2");
    void pure; void directResults; void purePipe; void operatorResult; void copyFromBig; void inPlace; void inPlaceResults; void legacyResults;
    void inPlacePipe; void legacyPipe; void deepLegacyPipe;
    construct(object, undefined);
    api.addBig(createBig(object), createBig(value));
    generic.toString(); object.value;
    // @ts-expect-error A boolean is not a BigValue.
    createBig(true);`);
  writeFileSync(join(directory, "consumer.cts"), `// @ts-expect-error The package has no CommonJS declaration entry.
    import big = require("big.esm");
    void big;`);
  // Resolve the root TypeScript compiler directly so the packed check uses the project version.
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
