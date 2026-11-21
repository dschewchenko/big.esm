import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

function buildPackage() {
  const result = spawnSync("bun", ["run", "build"], { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error("Package build failed");
  }
}

const stamp = timestamp();
const artifactsDir = resolve(process.cwd(), "benchmarks", "artifacts", "bundle-size-compare", stamp);
mkdirSync(artifactsDir, { recursive: true });

buildPackage();

const bigJsEntry = resolve(process.cwd(), "node_modules", "big.js", "big.mjs");
const bigJsOut = resolve(artifactsDir, "bigjs.min.js");

const bigPipeEntry = resolve(process.cwd(), "benchmarks", "size", "entry-big-pipe.ts");
const bigPipeOut = resolve(artifactsDir, "bigpipe.min.js");

const bigEsmV3Entry = resolve(process.cwd(), "dist", "big.esm.js");
const bigEsmV3Out = resolve(artifactsDir, "bigesm-v3.min.js");

bunBuild({ entry: bigJsEntry, outfile: bigJsOut });
bunBuild({ entry: bigPipeEntry, outfile: bigPipeOut });
// Measure the package's default export through its built ESM entry point.
bunBuild({ entry: bigEsmV3Entry, outfile: bigEsmV3Out });

const bigJsMin = readFileSync(bigJsOut);
const bigPipeMin = readFileSync(bigPipeOut);
const bigEsmV3Min = readFileSync(bigEsmV3Out);

const rows = [
  {
    name: "big.js",
    minBytes: bigJsMin.byteLength,
    brotliBytes: brotliSize(bigJsMin),
    file: `benchmarks/artifacts/bundle-size-compare/${stamp}/bigjs.min.js`,
  },
  {
    name: "big.esm (v3, pipeline)",
    minBytes: bigPipeMin.byteLength,
    brotliBytes: brotliSize(bigPipeMin),
    file: `benchmarks/artifacts/bundle-size-compare/${stamp}/bigpipe.min.js`,
  },
  {
    name: "big.esm (v3, full)",
    minBytes: bigEsmV3Min.byteLength,
    brotliBytes: brotliSize(bigEsmV3Min),
    file: `benchmarks/artifacts/bundle-size-compare/${stamp}/bigesm-v3.min.js`,
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
const outPath = resolve(resultsDir, `${stamp}_weight.md`);
writeFileSync(outPath, md);
console.log(`Wrote benchmarks/results/${stamp}_weight.md`);
