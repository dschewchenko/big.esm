/**
 * Compare in-place multiplication with prepared operands and varying values.
 *
 * bun run benchmark:prepared -- --baseline /path/to/old/big.esm.js
 * node benchmarks/prepared-multiplication.mjs --baseline /path/to/old/big.esm.js --input small --scales mixed
 *
 * Resetting inputs and verifying every result from the final round happen outside timed intervals.
 * Peak RSS is for the whole worker, including preparation and warm-up.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { cpus, release } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaults = {
  current: "dist/big.esm.js",
  baseline: null,
  count: 32768,
  rounds: 8,
  warmups: 3,
  repeats: 7,
  input: "large",
  scales: "equal"
};

function parseOptions(args) {
  const options = { ...defaults };
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]?.slice(2);
    if (!args[index]?.startsWith("--") || !Object.hasOwn(options, key) || args[index + 1] === undefined) {
      throw new Error(`Invalid option: ${args[index]}`);
    }
    options[key] = ["count", "rounds", "warmups", "repeats"].includes(key) ? Number(args[index + 1]) : args[index + 1];
  }
  for (const key of ["count", "rounds", "warmups", "repeats"]) {
    if (!Number.isSafeInteger(options[key]) || options[key] < 1) throw new RangeError(`Invalid ${key}`);
  }
  if (options.count < 1024 || options.repeats < 3 || options.repeats % 2 === 0) {
    throw new RangeError("Count must be at least 1024 and repeats must be an odd number of at least 3");
  }
  if (!["small", "large"].includes(options.input) || !["equal", "mixed"].includes(options.scales)) {
    throw new Error("Input must be small or large; scales must be equal or mixed");
  }
  return options;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

async function worker(path, options) {
  const library = await import(pathToFileURL(resolve(path)).href);
  // Version 3.0 exposes the equivalent mutating function under its original name.
  const multiply = library.mulInPlace ?? library.mulBig;
  if (typeof multiply !== "function") throw new Error("No mutating multiplication export");
  const { count, rounds, warmups } = options;
  const leftBase = options.input === "small" ? 1234567891n : 1234567890123456789012345678901234567891n;
  const rightBase = options.input === "small" ? 6789012347n : 6789012345678901234567890123456789012347n;
  const left = new Array(count);
  const right = new Array(count);
  const originals = new Array(count);
  const mixed = options.scales === "mixed";
  for (let index = 0; index < count; index++) {
    const coefficient = (leftBase + BigInt(index % 257)) * (index & 1 ? -1n : 1n);
    originals[index] = coefficient;
    left[index] = library.createBig(coefficient, mixed ? index % 13 : 20);
    right[index] = library.createBig(rightBase + BigInt(index % 127), mixed ? (index + 5) % 13 : 20);
  }
  const reset = () => {
    for (let index = 0; index < count; index++) {
      left[index].value = originals[index];
      left[index].scale = mixed ? index % 13 : 20;
    }
  };
  const runBatch = () => {
    let result;
    for (let index = 0; index < count; index++) result = multiply(left[index], right[index]);
    return result;
  };
  for (let pass = 0; pass < warmups; pass++) {
    reset();
    runBatch();
  }
  let elapsedMs = 0;
  let lastResult;
  for (let pass = 0; pass < rounds; pass++) {
    reset();
    const start = performance.now();
    lastResult = runBatch();
    elapsedMs += performance.now() - start;
  }
  const peakRssKiB = process.resourceUsage().maxRSS;
  assert.equal(lastResult, left[count - 1], "Expected the first operand to be returned");
  for (let index = 0; index < count; index++) {
    const rightValue = rightBase + BigInt(index % 127);
    const rightScale = mixed ? (index + 5) % 13 : 20;
    assert.equal(left[index].value, originals[index] * rightValue);
    assert.equal(left[index].scale, (mixed ? index % 13 : 20) + rightScale);
    assert.equal(right[index].value, rightValue);
    assert.equal(right[index].scale, rightScale);
  }
  return { elapsedMs, nsPerOperation: elapsedMs * 1e6 / (rounds * count), peakRssKiB, correct: true };
}

function hash(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function artifact(path) {
  const entry = resolve(path);
  const core = resolve(dirname(entry), "core.js");
  return { entry, entrySha256: hash(entry), coreSha256: existsSync(core) ? hash(core) : null };
}

if (process.argv[2] === "--worker") {
  console.log(JSON.stringify(await worker(process.argv[3], JSON.parse(process.argv[4]))));
} else {
  const options = parseOptions(process.argv.slice(2));
  const variants = [
    ...(options.baseline ? [{ name: "baseline", path: options.baseline }] : []),
    { name: "current", path: options.current }
  ];
  const samples = Object.fromEntries(variants.map(({ name }) => [name, []]));
  for (let repeat = 0; repeat < options.repeats; repeat++) {
    const order = repeat % 2 ? [...variants].reverse() : variants;
    for (const { name, path } of order) {
      const child = spawnSync(process.execPath, [fileURLToPath(import.meta.url), "--worker", path, JSON.stringify(options)], {
        encoding: "utf8", timeout: 120000
      });
      if (child.status !== 0) throw new Error(`${name}: ${child.error || child.stderr}`);
      samples[name].push(JSON.parse(child.stdout));
    }
    console.error(`Repeat ${repeat + 1}/${options.repeats}`);
  }
  const results = Object.fromEntries(variants.map(({ name, path }) => {
    const timings = samples[name].map(({ nsPerOperation }) => nsPerOperation);
    const middle = median(timings);
    return [name, { artifact: artifact(path), nsPerOperation: middle,
      medianAbsoluteDeviationNs: median(timings.map((value) => Math.abs(value - middle))),
      peakRssKiB: median(samples[name].map(({ peakRssKiB }) => peakRssKiB)), samples: samples[name] }];
  }));
  console.log(JSON.stringify({ runtime: globalThis.Bun ? `Bun ${Bun.version} (JSC)` : `Node ${process.version} (V8 ${process.versions.v8})`,
    platform: `${process.platform} ${process.arch} ${release()}`, cpu: cpus()[0]?.model, options, results }, null, 2));
}
