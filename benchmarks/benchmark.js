/**
 * Compare built artifacts with big.js using the same isolated-process benchmark.
 *
 * bun run benchmark
 * bun run benchmark -- --baseline /path/to/before.js --current /path/to/after.js
 * node --expose-gc benchmarks/benchmark.js --baseline before.js --current after.js
 *
 * stdout is JSON; progress goes to stderr. No files are modified by the benchmark.
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import BigJS from "big.js";

const PRECISION = 20;
BigJS.DP = PRECISION;
BigJS.RM = 1;

const inputs = {
  smallNumber: [12345.67809, 78901.23456],
  bigInt: [12345678901234567890n, 67890123456789012345n],
  bigNumber: ["12345678901234567890.12345678901234567890", "67890123456789012345.67890123456789012345"],
  numberWithExponent: ["12345678901234567890e-10", "67890123456789012345e-10"],
  mixedScale: ["12345.6", "78901.23456789"],
  negativeDivisor: ["12345.67809", "-78901.23456"]
};
const operations = ["add", "subtract", "multiply", "divide", "remainder", "power", "square_root", "chain"];

function gc() {
  if (globalThis.Bun) globalThis.Bun.gc(true);
  else if (typeof globalThis.gc === "function") globalThis.gc();
  else throw new Error("Run Node with --expose-gc");
}

function runReference(operation, a, b) {
  switch (operation) {
    case "add": return a.plus(b);
    case "subtract": return a.minus(b);
    case "multiply": return a.times(b);
    case "divide": return a.div(b);
    case "remainder": return a.mod(b);
    case "power": return a.pow(4);
    case "square_root": return a.sqrt();
    case "chain": return a.plus(b).times(a).div(b);
    default: throw new Error(`Unknown operation: ${operation}`);
  }
}

function createOperation(library, api, operation, args) {
  const [a, b] = args;
  if (api === "big.js") {
    const left = new BigJS(a);
    const right = new BigJS(b);
    return () => runReference(operation, left, right);
  }
  const left = library.createBig(a);
  const right = library.createBig(b);
  const initialValue = left.value;
  const initialScale = left.scale;
  const leftCopy = library.createBig(a);
  return () => {
    left.value = initialValue;
    left.scale = initialScale;
    if (api === "pipeline") {
      const pipe = library.pipeBig(left);
      switch (operation) {
        case "add": return pipe.add(right).value();
        case "subtract": return pipe.sub(right).value();
        case "multiply": return pipe.mul(right).value();
        case "divide": return pipe.div(right, PRECISION, "half-up").value();
        case "remainder": return pipe.mod(right).value();
        case "power": return pipe.pow(4).value();
        case "square_root": return pipe.sqrt(2, PRECISION).value();
        case "chain": return pipe.add(right).mul(leftCopy).div(right, PRECISION, "half-up").value();
        default: throw new Error(`Unknown operation: ${operation}`);
      }
    }
    switch (operation) {
      case "add": return library.addBig(left, right);
      case "subtract": return library.subBig(left, right);
      case "multiply": return library.mulBig(left, right);
      case "divide": return library.divBig(left, right, PRECISION, "half-up");
      case "remainder": return library.modBig(left, right);
      case "power": return library.powBig(left, 4);
      case "square_root": return library.sqrtBig(left, 2, PRECISION);
      case "chain":
        library.addBig(left, right);
        library.mulBig(left, leftCopy);
        return library.divBig(left, right, PRECISION, "half-up");
      default: throw new Error(`Unknown operation: ${operation}`);
    }
  };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function summary(samples, iterations) {
  const values = (key) => samples.map((item) => item[key]);
  const elapsed = values("elapsedMs");
  return {
    nsPerOperation: median(elapsed) * 1e6 / iterations,
    elapsedRangeMs: [Math.min(...elapsed), Math.max(...elapsed)],
    peakRssKiB: median(values("peakRssKiB")),
    retainedHeapDeltaBytes: median(values("retainedHeapDeltaBytes")),
    correct: samples.every((item) => item.correct),
    samples
  };
}

async function worker(artifact, api, operation, inputName, iterations) {
  const library = api === "big.js" ? null : await import(pathToFileURL(resolve(artifact)).href);
  const args = inputs[inputName];
  const fn = createOperation(library, api, operation, args);
  const reference = runReference(operation, new BigJS(args[0]), new BigJS(args[1]));
  const initial = fn().toString();
  const correct = new BigJS(initial).eq(reference);
  for (let i = 0; i < Math.min(2000, iterations); i++) fn();
  gc();
  const heapBefore = process.memoryUsage().heapUsed;
  let sink;
  const start = performance.now();
  for (let i = 0; i < iterations; i++) sink = fn();
  const elapsedMs = performance.now() - start;
  if (!new BigJS(sink.toString()).eq(new BigJS(initial))) throw new Error("Output changed during measurement");
  gc();
  return {
    elapsedMs,
    correct,
    retainedHeapDeltaBytes: process.memoryUsage().heapUsed - heapBefore,
    peakRssKiB: process.resourceUsage().maxRSS
  };
}

async function specialWorker(artifact, name, iterations) {
  const library = await import(pathToFileURL(resolve(artifact)).href);
  let a = library.createBig(12345n, 2);
  const b = library.createBig(6789n, 3);
  let index = 0;
  let operation;
  switch (name) {
    case "pow10_varying":
      operation = () => library.pow10((index++ % 256) + 1);
      break;
    case "add_varying_scale":
      operation = () => {
        a.value = 12345n;
        a.scale = 2;
        b.scale = 3 + (index++ % 64);
        return library.addBig(a, b);
      };
      break;
    case "add_varying_left_scale":
      b.scale = 2;
      operation = () => {
        a.value = 12345n;
        a.scale = 3 + (index++ % 64);
        return library.addBig(a, b);
      };
      break;
    case "power_varying_exponent":
      operation = () => {
        a.value = -12345n;
        a.scale = 2;
        return library.powBig(a, index++ % 9);
      };
      break;
    case "parse_small_exponent":
      operation = () => library.createBig("123.45e-10000");
      break;
    case "square_root_large_finite":
    case "square_root_beyond_number": {
      a = library.createBig(name === "square_root_large_finite" ? "1.23456789e260" : "1.23456789e310");
      const value = a.value;
      const scale = a.scale;
      operation = () => {
        a.value = value;
        a.scale = scale;
        return library.sqrtBig(a, 2, PRECISION);
      };
      break;
    }
    case "cube_root":
      operation = () => {
        a.value = 12345n;
        a.scale = 2;
        return library.sqrtBig(a, 3, PRECISION);
      };
      break;
    case "retained_pow10":
      operation = () => library.pow10(256);
      break;
    default:
      throw new Error(`Unknown special case: ${name}`);
  }
  if (name !== "retained_pow10") {
    for (let i = 0; i < Math.min(2000, iterations); i++) operation();
  }
  gc();
  const heapBefore = process.memoryUsage().heapUsed;
  let result;
  const start = performance.now();
  for (let i = 0; i < iterations; i++) result = operation();
  const elapsedMs = performance.now() - start;
  let correct;
  if (name === "pow10_varying") correct = result === 10n ** BigInt(((index - 1) % 256) + 1);
  else if (name === "retained_pow10") correct = result === 10n ** 256n;
  else if (name === "add_varying_scale") {
    correct = result.scale === b.scale && result.value === 12345n * 10n ** BigInt(b.scale - 2) + 6789n;
  } else if (name === "add_varying_left_scale") {
    const scale = 3 + ((index - 1) % 64);
    correct = result.scale === scale && result.value === 12345n + 6789n * 10n ** BigInt(scale - 2);
  } else if (name === "power_varying_exponent") {
    const exponent = (index - 1) % 9;
    correct = result.scale === exponent * 2 && result.value === (-12345n) ** BigInt(exponent);
  } else if (name === "parse_small_exponent") correct = result.value === 12345n && result.scale === 10002;
  else if (name === "square_root_large_finite" || name === "square_root_beyond_number") {
    const input = name === "square_root_large_finite" ? "1.23456789e260" : "1.23456789e310";
    correct = new BigJS(result.toString()).eq(new BigJS(input).sqrt());
  } else {
    const value = result.value;
    const scaled = 12345n * 10n ** 60n * 8n;
    correct = (2n * value - 1n) ** 3n * 100n <= scaled && (2n * value + 1n) ** 3n * 100n > scaled;
  }
  result = null;
  gc();
  return { elapsedMs, correct, retainedHeapDeltaBytes: process.memoryUsage().heapUsed - heapBefore,
    peakRssKiB: process.resourceUsage().maxRSS };
}

function parseOptions(args) {
  const options = { current: "dist/big.esm.js", baseline: null, iterations: 10000, repeats: 5 };
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];
    if (!value) throw new Error(`Missing value for ${flag}`);
    if (flag === "--current") options.current = value;
    else if (flag === "--baseline") options.baseline = value;
    else if (flag === "--iterations") options.iterations = Number(value);
    else if (flag === "--repeats") options.repeats = Number(value);
    else throw new Error(`Unknown option ${flag}`);
  }
  if (!Number.isSafeInteger(options.iterations) || options.iterations < 1 ||
      !Number.isSafeInteger(options.repeats) || options.repeats < 3 || options.repeats % 2 === 0) {
    throw new Error("Iterations must be positive and repeats must be an odd number >= 3");
  }
  return options;
}

if (process.argv[2] === "--worker-special") {
  const [, , , artifact, name, count] = process.argv;
  console.log(JSON.stringify(await specialWorker(artifact, name, Number(count))));
} else if (process.argv[2] === "--worker") {
  const [, , , artifact, api, operation, inputName, count] = process.argv;
  console.log(JSON.stringify(await worker(artifact, api, operation, inputName, Number(count))));
} else {
  const options = parseOptions(process.argv.slice(2));
  const bun = Boolean(globalThis.Bun);
  const cases = [];
  for (const inputName of Object.keys(inputs)) {
    for (const operation of operations) {
      const iterations = operation === "square_root" ? Math.max(1, Math.floor(options.iterations / 4)) : options.iterations;
      const variants = [
        ...(options.baseline ? [{ name: "baseline", artifact: options.baseline, api: "ops" },
          { name: "baseline_pipeline", artifact: options.baseline, api: "pipeline" }] : []),
        { name: "current", artifact: options.current, api: "ops" },
        { name: "current_pipeline", artifact: options.current, api: "pipeline" },
        { name: "big.js", artifact: options.current, api: "big.js" }
      ];
      const samples = Object.fromEntries(variants.map(({ name }) => [name, []]));
      for (let repeat = 0; repeat < options.repeats; repeat++) {
        const order = repeat % 2 ? [...variants].reverse() : variants;
        for (const variant of order) {
          const args = [...(bun ? [] : ["--expose-gc"]), fileURLToPath(import.meta.url), "--worker", variant.artifact,
            variant.api, operation, inputName, String(iterations)];
          const child = spawnSync(process.execPath, args, { encoding: "utf8", timeout: 120000 });
          if (child.status !== 0) throw new Error(`${inputName} ${operation} ${variant.name}: ${child.error || child.stderr}`);
          samples[variant.name].push(JSON.parse(child.stdout.trim()));
        }
      }
      const results = Object.fromEntries(variants.map(({ name }) => [name, summary(samples[name], iterations)]));
      cases.push({ input: inputName, operation, iterations, results });
      console.error(`${inputName} ${operation} complete`);
    }
  }
  const specialCases = { add_varying_scale: options.iterations, add_varying_left_scale: options.iterations,
    power_varying_exponent: options.iterations, pow10_varying: options.iterations,
    parse_small_exponent: Math.max(1, Math.floor(options.iterations / 4)),
    cube_root: Math.max(1, Math.floor(options.iterations / 4)),
    square_root_large_finite: Math.max(1, Math.floor(options.iterations / 10)),
    square_root_beyond_number: Math.max(1, Math.floor(options.iterations / 10)), retained_pow10: 1 };
  for (const [operation, iterations] of Object.entries(specialCases)) {
    const variants = [
      ...(options.baseline ? [{ name: "baseline", artifact: options.baseline }] : []),
      { name: "current", artifact: options.current }
    ];
    const samples = Object.fromEntries(variants.map(({ name }) => [name, []]));
    for (let repeat = 0; repeat < options.repeats; repeat++) {
      const order = repeat % 2 ? [...variants].reverse() : variants;
      for (const variant of order) {
        const args = [...(bun ? [] : ["--expose-gc"]), fileURLToPath(import.meta.url), "--worker-special",
          variant.artifact, operation, String(iterations)];
        const child = spawnSync(process.execPath, args, { encoding: "utf8", timeout: 120000 });
        if (child.status !== 0) throw new Error(`${operation} ${variant.name}: ${child.error || child.stderr}`);
        samples[variant.name].push(JSON.parse(child.stdout.trim()));
      }
    }
    const results = Object.fromEntries(variants.map(({ name }) => [name, summary(samples[name], iterations)]));
    cases.push({ input: "supplemental", operation, iterations, results });
    console.error(`supplemental ${operation} complete`);
  }
  console.log(JSON.stringify({ runtime: bun ? `Bun ${Bun.version} (JSC)` : `Node ${process.version} (V8 ${process.versions.v8})`,
    platform: `${process.platform} ${process.arch}`, precision: PRECISION, options, cases }, null, 2));
}
