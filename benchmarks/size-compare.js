import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { brotliCompressSync, constants as zlibConstants } from "node:zlib";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function bunBuild({ entry, outfile }) {
  const result = spawnSync(
    "bun",
    ["build", entry, "--outfile", outfile, "--minify", "--format", "esm", "--target", "browser"],
    { stdio: "inherit" }
  );
  if (result.status !== 0) {
    throw new Error(`bun build failed for ${entry}`);
  }
}

function brotliSize(buffer) {
  const compressed = brotliCompressSync(buffer, {
    params: {
      [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
    },
  });
  return compressed.byteLength;
}

function getBunVersion() {
  const result = spawnSync("bun", ["--version"], { encoding: "utf8" });
  if (result.status !== 0) return "unknown";
  return (result.stdout ?? "").trim() || "unknown";
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

const stamp = timestamp();
const artifactsDir = resolve(process.cwd(), "benchmarks", "artifacts", "bundle-size-compare", stamp);
mkdirSync(artifactsDir, { recursive: true });

const bigJsEntry = resolve(process.cwd(), "node_modules", "big.js", "big.mjs");
const bigJsOut = resolve(artifactsDir, "bigjs.min.js");

const bigPipeEntry = resolve(process.cwd(), "benchmarks", "size", "entry-big-pipe.ts");
const bigPipeOut = resolve(artifactsDir, "bigpipe.min.js");

const bigEsmV2Entry = resolve(process.cwd(), "src", "index.ts");
const bigEsmV2Out = resolve(artifactsDir, "bigesm-v2.min.js");

bunBuild({ entry: bigJsEntry, outfile: bigJsOut });
bunBuild({ entry: bigPipeEntry, outfile: bigPipeOut });
bunBuild({ entry: bigEsmV2Entry, outfile: bigEsmV2Out });

const bigJsMin = readFileSync(bigJsOut);
const bigPipeMin = readFileSync(bigPipeOut);
const bigEsmV2Min = readFileSync(bigEsmV2Out);

const rows = [
  {
    name: "big.js",
    minBytes: bigJsMin.byteLength,
    brotliBytes: brotliSize(bigJsMin),
    file: `benchmarks/artifacts/bundle-size-compare/${stamp}/bigjs.min.js`,
  },
  {
    name: "bigPipe (v2)",
    minBytes: bigPipeMin.byteLength,
    brotliBytes: brotliSize(bigPipeMin),
    file: `benchmarks/artifacts/bundle-size-compare/${stamp}/bigpipe.min.js`,
  },
  {
    name: "big.esm (v2, full)",
    minBytes: bigEsmV2Min.byteLength,
    brotliBytes: brotliSize(bigEsmV2Min),
    file: `benchmarks/artifacts/bundle-size-compare/${stamp}/bigesm-v2.min.js`,
  },
];

let md = "";
md += "# Benchmark (weight)\n\n";
md += `- Node: ${process.version}\n`;
md += `- Bun: ${getBunVersion()}\n`;
md += `- Brotli quality: 11\n\n`;
md += "| Artifact | Minified | Brotli | File |\n";
md += "| --- | --- | --- | --- |\n";
for (const row of rows) {
  md += `| ${row.name} | ${formatBytes(row.minBytes)} | ${formatBytes(row.brotliBytes)} | \`${row.file}\` |\n`;
}

const resultsDir = resolve(process.cwd(), "benchmarks", "results");
mkdirSync(resultsDir, { recursive: true });
cleanupResults("speed");
const outPath = resolve(resultsDir, `${stamp}_weight.md`);
writeFileSync(outPath, md);
console.log(`Wrote benchmarks/results/${stamp}_weight.md`);

let docSection = "";
docSection += `_Last updated: ${stamp}_\n\n`;
docSection += `- Node: ${process.version}\n`;
docSection += `- Bun: ${getBunVersion()}\n`;
docSection += `- Brotli quality: 11\n\n`;
docSection += "| Artifact | Minified | Brotli |\n";
docSection += "| --- | --- | --- |\n";
for (const row of rows) {
  docSection += `| ${row.name} | ${formatBytes(row.minBytes)} | ${formatBytes(row.brotliBytes)} |\n`;
}

updateBenchmarkDoc("WEIGHT", docSection);
