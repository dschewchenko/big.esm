import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { Big as BigJS } from "big.js";

import * as v2 from "../dist/big.esm.js";

const ITERATIONS = 50_000;
const REPEATS = 3;
const PRECISION = 20;

const smallNumberA = 12345.67809;
const smallNumberB = 78901.23456;
const bigIntA = BigInt("12345678901234567890");
const bigIntB = BigInt("67890123456789012345");
const bigNumberA = "12345678901234567890.12345678901234567890";
const bigNumberB = "67890123456789012345.67890123456789012345";
const numberWithExponentA = "12345678901234567890e-10";
const numberWithExponentB = "67890123456789012345e-10";

let sink = 0;

function runGC() {
  if (typeof globalThis.gc === "function") {
    globalThis.gc();
    return;
  }

  const bun = globalThis.Bun;
  if (bun && typeof bun.gc === "function") {
    bun.gc(true);
  }
}

function formatX(value, digits = 2) {
  return value.toFixed(digits).replace(/\.?0+$/, "");
}

function formatRatioWithDirection(ratio) {
  if (ratio === 1) return "1x";
  if (ratio > 1) return `${formatX(ratio)}x faster`;
  return `${formatX(1 / ratio)}x slower`;
}

function benchmark(name, func, iterations = ITERATIONS, repeats = REPEATS) {
  const durations = [];

  for (let r = 0; r < repeats; r++) {
    func(); // warmup
    const start = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) func();
    const end = process.hrtime.bigint();
    durations.push(Number(end - start) / 1e6);
  }

  durations.sort((a, b) => a - b);
  const median = durations[Math.floor(durations.length / 2)];
  console.log(`${name}: ${median.toFixed(3)}`);
  return median;
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stats(values) {
  return {
    min: Math.min(...values),
    median: median(values),
    max: Math.max(...values),
  };
}

function cleanupResults(keepSuffix) {
  const resultsDir = resolve(process.cwd(), "benchmarks", "results");
  try {
    const files = readdirSync(resultsDir);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      if (keepSuffix && file.endsWith(`_${keepSuffix}.md`)) continue;
      rmSync(resolve(resultsDir, file));
    }
  } catch {
    // ignore if missing
  }
}

function updateBenchmarkDoc(kind, content) {
  const docPath = resolve(process.cwd(), "BENCHMARK.md");
  const start = `<!-- BENCHMARK_${kind}_START -->`;
  const end = `<!-- BENCHMARK_${kind}_END -->`;

  const doc = readFileSync(docPath, "utf8");
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`, "m");
  if (!pattern.test(doc)) return;

  const block = `${start}\n\n${content.trim()}\n\n${end}`;
  writeFileSync(docPath, doc.replace(pattern, block));
}

const testCases = [
  {
    name: "smallNumber",
    args: [smallNumberA, smallNumberB],
  },
  {
    name: "bigInt",
    args: [bigIntA, bigIntB],
  },
  {
    name: "bigNumber",
    args: [bigNumberA, bigNumberB],
  },
  {
    name: "numberWithExponent",
    args: [numberWithExponentA, numberWithExponentB],
  },
];

const ops = [
  {
    name: "add",
    prepareV2: (a, b) => {
      const bigA = new v2.Big(a);
      const initValue = bigA.value;
      const initScale = bigA.scale;
      const bigB = new v2.Big(b);
      return () => {
        bigA.value = initValue;
        bigA.scale = initScale;
        sink = v2.addBig(bigA, bigB).scale;
      };
    },
    prepareBigJs: (a, b) => {
      const bigA = new BigJS(a);
      const bigB = new BigJS(b);
      return () => {
        sink = bigA.plus(bigB).e;
      };
    },
  },
  {
    name: "subtract",
    prepareV2: (a, b) => {
      const bigA = new v2.Big(a);
      const initValue = bigA.value;
      const initScale = bigA.scale;
      const bigB = new v2.Big(b);
      return () => {
        bigA.value = initValue;
        bigA.scale = initScale;
        sink = v2.subBig(bigA, bigB).scale;
      };
    },
    prepareBigJs: (a, b) => {
      const bigA = new BigJS(a);
      const bigB = new BigJS(b);
      return () => {
        sink = bigA.minus(bigB).e;
      };
    },
  },
  {
    name: "multiply",
    prepareV2: (a, b) => {
      const bigA = new v2.Big(a);
      const initValue = bigA.value;
      const initScale = bigA.scale;
      const bigB = new v2.Big(b);
      return () => {
        bigA.value = initValue;
        bigA.scale = initScale;
        sink = v2.mulBig(bigA, bigB).scale;
      };
    },
    prepareBigJs: (a, b) => {
      const bigA = new BigJS(a);
      const bigB = new BigJS(b);
      return () => {
        sink = bigA.times(bigB).e;
      };
    },
  },
  {
    name: "divide",
    prepareV2: (a, b) => {
      const bigA = new v2.Big(a);
      const initValue = bigA.value;
      const initScale = bigA.scale;
      const bigB = new v2.Big(b);
      return () => {
        bigA.value = initValue;
        bigA.scale = initScale;
        sink = v2.divBig(bigA, bigB, PRECISION, "half-up").scale;
      };
    },
    prepareBigJs: (a, b) => {
      const bigA = new BigJS(a);
      const bigB = new BigJS(b);
      return () => {
        sink = bigA.div(bigB).e;
      };
    },
  },
  {
    name: "power of 4",
    prepareV2: (a) => {
      const bigA = new v2.Big(a);
      const initValue = bigA.value;
      const initScale = bigA.scale;
      return () => {
        bigA.value = initValue;
        bigA.scale = initScale;
        sink = v2.powBig(bigA, 4).scale;
      };
    },
    prepareBigJs: (a) => {
      const bigA = new BigJS(a);
      return () => {
        sink = bigA.pow(4).e;
      };
    },
  },
  {
    name: "square root",
    prepareV2: (a) => {
      const bigA = new v2.Big(a);
      const initValue = bigA.value;
      const initScale = bigA.scale;
      return () => {
        bigA.value = initValue;
        bigA.scale = initScale;
        sink = v2.sqrtBig(bigA, 2, PRECISION).scale;
      };
    },
    prepareBigJs: (a) => {
      const bigA = new BigJS(a);
      return () => {
        sink = bigA.sqrt().e;
      };
    },
  },
  {
    name: "chain (add → mul → div)",
    prepareV2: (a, b) => {
      const bigA = new v2.Big(a);
      const initValue = bigA.value;
      const initScale = bigA.scale;
      const bigAConst = new v2.Big(a);
      const bigB = new v2.Big(b);
      return () => {
        bigA.value = initValue;
        bigA.scale = initScale;
        v2.addBig(bigA, bigB);
        v2.mulBig(bigA, bigAConst);
        sink = v2.divBig(bigA, bigB, PRECISION, "half-up").scale;
      };
    },
    prepareBigJs: (a, b) => {
      const bigA = new BigJS(a);
      const bigB = new BigJS(b);
      return () => {
        sink = bigA.plus(bigB).times(bigA).div(bigB).e;
      };
    },
  },
];

const pipeOps = [
  {
    name: "add",
    preparePipeBig: (a, b) => {
      const bigA = new v2.Big(a);
      const initValue = bigA.value;
      const initScale = bigA.scale;
      const bigB = new v2.Big(b);
      return () => {
        bigA.value = initValue;
        bigA.scale = initScale;
        sink = v2.pipeBig(bigA).add(bigB).value().scale;
      };
    },
    prepareBigJs: (a, b) => {
      const bigA = new BigJS(a);
      const bigB = new BigJS(b);
      return () => {
        sink = bigA.plus(bigB).e;
      };
    },
  },
  {
    name: "subtract",
    preparePipeBig: (a, b) => {
      const bigA = new v2.Big(a);
      const initValue = bigA.value;
      const initScale = bigA.scale;
      const bigB = new v2.Big(b);
      return () => {
        bigA.value = initValue;
        bigA.scale = initScale;
        sink = v2.pipeBig(bigA).sub(bigB).value().scale;
      };
    },
    prepareBigJs: (a, b) => {
      const bigA = new BigJS(a);
      const bigB = new BigJS(b);
      return () => {
        sink = bigA.minus(bigB).e;
      };
    },
  },
  {
    name: "multiply",
    preparePipeBig: (a, b) => {
      const bigA = new v2.Big(a);
      const initValue = bigA.value;
      const initScale = bigA.scale;
      const bigB = new v2.Big(b);
      return () => {
        bigA.value = initValue;
        bigA.scale = initScale;
        sink = v2.pipeBig(bigA).mul(bigB).value().scale;
      };
    },
    prepareBigJs: (a, b) => {
      const bigA = new BigJS(a);
      const bigB = new BigJS(b);
      return () => {
        sink = bigA.times(bigB).e;
      };
    },
  },
  {
    name: "divide",
    preparePipeBig: (a, b) => {
      const bigA = new v2.Big(a);
      const initValue = bigA.value;
      const initScale = bigA.scale;
      const bigB = new v2.Big(b);
      return () => {
        bigA.value = initValue;
        bigA.scale = initScale;
        sink = v2.pipeBig(bigA).div(bigB, PRECISION, "half-up").value().scale;
      };
    },
    prepareBigJs: (a, b) => {
      const bigA = new BigJS(a);
      const bigB = new BigJS(b);
      return () => {
        sink = bigA.div(bigB).e;
      };
    },
  },
  {
    name: "power of 4",
    preparePipeBig: (a) => {
      const bigA = new v2.Big(a);
      const initValue = bigA.value;
      const initScale = bigA.scale;
      return () => {
        bigA.value = initValue;
        bigA.scale = initScale;
        sink = v2.pipeBig(bigA).pow(4).value().scale;
      };
    },
    prepareBigJs: (a) => {
      const bigA = new BigJS(a);
      return () => {
        sink = bigA.pow(4).e;
      };
    },
  },
  {
    name: "square root",
    preparePipeBig: (a) => {
      const bigA = new v2.Big(a);
      const initValue = bigA.value;
      const initScale = bigA.scale;
      return () => {
        bigA.value = initValue;
        bigA.scale = initScale;
        sink = v2.pipeBig(bigA).sqrt(2, PRECISION).value().scale;
      };
    },
    prepareBigJs: (a) => {
      const bigA = new BigJS(a);
      return () => {
        sink = bigA.sqrt().e;
      };
    },
  },
  {
    name: "chain (add → mul → div)",
    preparePipeBig: (a, b) => {
      const bigA = new v2.Big(a);
      const initValue = bigA.value;
      const initScale = bigA.scale;
      const bigAConst = new v2.Big(a);
      const bigB = new v2.Big(b);
      return () => {
        bigA.value = initValue;
        bigA.scale = initScale;
        sink = v2.pipeBig(bigA).add(bigB).mul(bigAConst).div(bigB, PRECISION, "half-up").value().scale;
      };
    },
    prepareBigJs: (a, b) => {
      const bigA = new BigJS(a);
      const bigB = new BigJS(b);
      return () => {
        sink = bigA.plus(bigB).times(bigA).div(bigB).e;
      };
    },
  },
];

console.log(`Speed benchmark (big.esm v2 vs big.js)`);
console.log(`Iterations: ${ITERATIONS} (median of ${REPEATS} runs)`);
console.log(`Precision: ${PRECISION}`);
console.log(`Current: dist/big.esm.js`);
console.log(`node: ${process.version}`);
if (globalThis.Bun) console.log(`bun: ${globalThis.Bun.version}`);

const opsResults = [];

for (const testCase of testCases) {
  for (const operation of ops) {
    const args = testCase.args;
    const v2Fn = operation.prepareV2(...args);
    const jsFn = operation.prepareBigJs(...args);

    runGC();
    const v2Ms = benchmark(`big.esm — ${testCase.name} — ${operation.name}`, v2Fn);
    runGC();
    const bigJsMs = benchmark(`big.js — ${testCase.name} — ${operation.name}`, jsFn);

    opsResults.push({
      Operation: `${operation.name} - ${testCase.name}`,
      v2Ms,
      bigJsMs,
    });
  }
}

const pipeResults = [];

for (const testCase of testCases) {
  for (const operation of pipeOps) {
    const args = testCase.args;
    const pipeFn = operation.preparePipeBig(...args);
    const jsFn = operation.prepareBigJs(...args);

    runGC();
    const pipeMs = benchmark(`pipeBig — ${testCase.name} — ${operation.name}`, pipeFn);
    runGC();
    const bigJsMs = benchmark(`big.js — ${testCase.name} — ${operation.name}`, jsFn);

    pipeResults.push({
      Operation: `${operation.name} - ${testCase.name}`,
      pipeMs,
      bigJsMs,
    });
  }
}

const opsV2VsBigJs = opsResults.map((r) => r.bigJsMs / r.v2Ms);

const pipeVsBigJs = pipeResults.map((r) => r.bigJsMs / r.pipeMs);

const opsV2Stats = stats(opsV2VsBigJs);

const pipeStats = stats(pipeVsBigJs);

let md = "";
md += "# Benchmark (speed)\n\n";
md += `- Iterations: ${ITERATIONS}\n`;
md += `- Repeats: ${REPEATS} (median)\n`;
md += `- Precision: ${PRECISION}\n`;
md += `- Current: \`dist/big.esm.js\`\n`;
md += `- Node: ${process.version}\n`;
if (globalThis.Bun) md += `- Bun: ${globalThis.Bun.version}\n`;
md += "\n";

md += "## Summary (median, min/max)\n\n";
md += `Ops (28 rows):\n\n`;
md += `- big.esm vs big.js: median ${formatRatioWithDirection(opsV2Stats.median)} (min ${formatRatioWithDirection(opsV2Stats.min)}, max ${formatRatioWithDirection(opsV2Stats.max)})\n\n`;

md += `Pipeline (28 rows):\n\n`;
md += `- pipeBig vs big.js: median ${formatRatioWithDirection(pipeStats.median)} (min ${formatRatioWithDirection(pipeStats.min)}, max ${formatRatioWithDirection(pipeStats.max)})\n`;
md += "\n";

md += "## Ops\n\n";
md += "| Operation | big.esm | big.js | big.esm vs big.js |\n";
md += "| --- | --- | --- | --- |\n";
for (const row of opsResults) {
  md += `| ${row.Operation} | ${row.v2Ms.toFixed(3)}ms | ${row.bigJsMs.toFixed(3)}ms | ${formatRatioWithDirection(
    row.bigJsMs / row.v2Ms
  )} |\n`;
}

md += "\n## Pipeline\n\n";
md += "| Operation | pipeBig | big.js | pipeBig vs big.js |\n";
md += "| --- | --- | --- | --- |\n";
for (const row of pipeResults) {
  md += `| ${row.Operation} | ${row.pipeMs.toFixed(3)}ms | ${row.bigJsMs.toFixed(3)}ms | ${formatRatioWithDirection(
    row.bigJsMs / row.pipeMs
  )} |\n`;
}

const stamp = timestamp();
const outDir = resolve(process.cwd(), "benchmarks", "results");
mkdirSync(outDir, { recursive: true });
cleanupResults("weight");
const outPath = resolve(outDir, `${stamp}_speed.md`);
writeFileSync(outPath, md);
console.log(`Wrote benchmarks/results/${stamp}_speed.md`);

let docSection = "";
docSection += `_Last updated: ${stamp}_\n\n`;
docSection += `- Iterations: ${ITERATIONS}\n`;
docSection += `- Repeats: ${REPEATS} (median)\n`;
docSection += `- Precision: ${PRECISION}\n`;
docSection += `- Current: \`dist/big.esm.js\`\n`;
docSection += `- Node: ${process.version}\n`;
if (globalThis.Bun) docSection += `- Bun: ${globalThis.Bun.version}\n`;
docSection += "\n";

docSection += "#### Summary (median, min/max)\n\n";
docSection += "Ops (28 rows):\n\n";
docSection += `- big.esm vs big.js: median ${formatRatioWithDirection(opsV2Stats.median)} (min ${formatRatioWithDirection(opsV2Stats.min)}, max ${formatRatioWithDirection(opsV2Stats.max)})\n\n`;

docSection += "Pipeline (28 rows):\n\n";
docSection += `- pipeBig vs big.js: median ${formatRatioWithDirection(pipeStats.median)} (min ${formatRatioWithDirection(pipeStats.min)}, max ${formatRatioWithDirection(pipeStats.max)})\n`;
docSection += "\n";

docSection += "#### Ops\n\n";
docSection += "| Operation | big.esm | big.js | big.esm vs big.js |\n";
docSection += "| --- | --- | --- | --- |\n";
for (const row of opsResults) {
  docSection += `| ${row.Operation} | ${row.v2Ms.toFixed(3)}ms | ${row.bigJsMs.toFixed(3)}ms | ${formatRatioWithDirection(
    row.bigJsMs / row.v2Ms
  )} |\n`;
}

docSection += "\n#### Pipeline\n\n";
docSection += "| Operation | pipeBig | big.js | pipeBig vs big.js |\n";
docSection += "| --- | --- | --- | --- |\n";
for (const row of pipeResults) {
  docSection += `| ${row.Operation} | ${row.pipeMs.toFixed(3)}ms | ${row.bigJsMs.toFixed(3)}ms | ${formatRatioWithDirection(
    row.bigJsMs / row.pipeMs
  )} |\n`;
}

updateBenchmarkDoc("SPEED", docSection);

// avoid dead-code elimination
if (sink === Number.MIN_SAFE_INTEGER) console.log(sink);
