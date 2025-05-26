import { performance } from "node:perf_hooks";

import { Big as BigJS } from "big.js";
import {
  addBig,
  Big as BigESM,
  cloneBig,
  divBig,
  mulBig,
  powBig,
  sqrtBig,
  subBig,
  sinBig, // Added
  cosBig, // Added
  tanBig, // Added
  logBig, // Added
  log10Big // Added
} from "./dist/big.esm.js";

const smallNumberA = 12345.67809;
const smallNumberB = 78901.23456;
const bigIntA = BigInt("12345678901234567890");
const bigIntB = BigInt("67890123456789012345");
const bigNumberA = "12345678901234567890.12345678901234567890";
const bigNumberB = "67890123456789012345.67890123456789012345";
const numberWithExponentA = "12345678901234567890e-10";
const numberWithExponentB = "67890123456789012345e-10";

// simple benchmark function
function benchmark(name, func, times = 100_000) {
  const start = performance.now();

  for (let i = 0; i < times; i++) {
    func();
  }
  const end = performance.now();

  const elapsed = end - start;
  console.log(`${name}: ${elapsed.toFixed(3)}`);
  return elapsed;
}

console.log("Benchmarking with 100,000 iterations");

const results = [];

// run benchmark for each test case and operation
function runBenchmark(testCases, operations) {
  testCases.forEach((testCase) => {
    operations.forEach((operation) => {
      const { operationName, funcESM, funcESMMutable, funcJS } = operation;

      const preparedESM = funcESM && funcESM(...testCase.args);
      let initialMemory = process.memoryUsage().heapUsed;
      const timeESM = benchmark(`big.esm — ${testCase.name} — ${operationName}`, preparedESM);
      let finalMemory = process.memoryUsage().heapUsed;
      const memoryUsedESM = finalMemory - initialMemory;
      // eslint-disable-next-line no-undef
      gc();

      const preparedESMMutable = funcESMMutable && funcESMMutable(...testCase.args);
      initialMemory = process.memoryUsage().heapUsed;
      const timeESMMutable = funcESMMutable &&
        benchmark(`big.esm(mutable) — ${testCase.name} — ${operationName}`, preparedESMMutable);
      finalMemory = process.memoryUsage().heapUsed;
      const memoryUsedESMMutable = finalMemory - initialMemory;
      // eslint-disable-next-line no-undef
      gc();

      const preparedJS = funcJS && funcJS(...testCase.args);
      initialMemory = process.memoryUsage().heapUsed;
      const timeJS = benchmark(`big.js — ${testCase.name} — ${operationName}`, preparedJS);
      finalMemory = process.memoryUsage().heapUsed;
      const memoryUsedJS = finalMemory - initialMemory;
      // eslint-disable-next-line no-undef
      gc();

      const diff = (timeJS - timeESM) / timeJS * 100;
      const diffMutable = timeESMMutable ? (timeJS - timeESMMutable) / timeJS * 100 : 0;
      const diffFormatted = diff.toFixed(2);
      const diffFormattedMutable = diffMutable.toFixed(2);

      const performanceResult = timeESM < timeJS ? "faster" : "slower";
      const performanceResultMutable = timeESMMutable < timeJS ? "faster" : "slower";

      results.push({
        Operation: `${operationName} - ${testCase.name}`,
        "big.esm": timeESM.toFixed(3) + `ms (${(memoryUsedESM / 1024).toFixed(1)} KB)`,
        "big.esm(mutable)": timeESMMutable ? timeESMMutable.toFixed(3) + `ms (${(memoryUsedESMMutable / 1024).toFixed(1)} KB)` : "—",
        "big.js": timeJS.toFixed(3) + `ms (${(memoryUsedJS / 1024).toFixed(1)} KB)`,
        Difference: `${diffFormatted}% ${performanceResult}`,
        "Difference with mutable": timeESMMutable ? `${diffFormattedMutable}% ${performanceResultMutable}` : "—"
      });
    });

  });
}

// test cases (a, b)
const testCases = [
  {
    name: "smallNumber",
    args: [smallNumberA, smallNumberB]
  },
  {
    name: "bigInt",
    args: [bigIntA, bigIntB]
  },
  {
    name: "bigNumber",
    args: [bigNumberA, bigNumberB]
  },
  {
    name: "numberWithExponent",
    args: [numberWithExponentA, numberWithExponentB]
  }
];

// operations
const operations = process.argv.includes("--without-init") ? [
  // test cases without init in test function, so we can test operation time.
  // funcESMMutable is undefined, because it mutates the first argument and on some operations will be out of memory.
  {
    operationName: "add",
    funcESM: (a, b) => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
      return () => addBig(bigA, bigB);
    },
    funcESMMutable: undefined,
    funcJS: (a, b) => {
      const bigA = new BigJS(a);
      return () => bigA.plus(b);
    }
  },
  {
    operationName: "subtract",
    funcESM: (a, b) => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
      return () => subBig(bigA, bigB);
    },
    funcESMMutable: undefined,
    funcJS: (a, b) => {
      const bigA = new BigJS(a);
      return () => bigA.minus(b);
    }
  },
  {
    operationName: "multiply",
    funcESM: (a, b) => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
      return () => mulBig(bigA, bigB);
    },
    funcESMMutable: undefined,
    funcJS: (a, b) => {
      const bigA = new BigJS(a);
      return () => bigA.times(b);
    }
  },
  {
    operationName: "divide",
    funcESM: (a, b) => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
      return () => divBig(bigA, bigB);
    },
    funcESMMutable: undefined,
    funcJS: (a, b) => {
      const bigA = new BigJS(a);
      return () => bigA.div(b);
    }
  },
  {
    operationName: "pow",
    funcESM: (a, b) => {
      const bigA = new BigESM(a);
      return () => powBig(bigA, 4);
    },
    funcESMMutable: undefined,
    funcJS: (a, b) => {
      const bigA = new BigJS(a);
      return () => bigA.pow(4);
    }
  },
  {
    operationName: "sqrt",
    funcESM: (a) => {
      const bigA = new BigESM(a);
      return () => sqrtBig(bigA);
    },
    funcESMMutable: undefined,
    funcJS: (a) => {
      const bigA = new BigJS(a);
      return () => bigA.sqrt();
    }
  }] : [
  // test cases with init in test function, so we can test init + operation time and mutable version
  {
    operationName: "add",
    funcESM: (a, b) => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
      return () => addBig(cloneBig(bigA), bigB);
    },
    funcESMMutable: (a, b) => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
      return () => addBig(cloneBig(bigA), bigB, true);
    },
    funcJS: (a, b) => {
      const bigA = new BigJS(a);
      return () => new BigJS(bigA).plus(b);
    }
  },
  {
    operationName: "subtract",
    funcESM: (a, b) => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
      return () => subBig(cloneBig(bigA), bigB);
    },
    funcESMMutable: (a, b) => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
      return () => subBig(cloneBig(bigA), bigB, true);
    },
    funcJS: (a, b) => {
      const bigA = new BigJS(a);
      return () => new BigJS(bigA).minus(b);
    }
  },
  {
    operationName: "multiply",
    funcESM: (a, b) => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
      return () => mulBig(cloneBig(bigA), bigB);
    },
    funcESMMutable: (a, b) => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
      return () => mulBig(cloneBig(bigA), bigB, true);
    },
    funcJS: (a, b) => {
      const bigA = new BigJS(a);
      return () => new BigJS(bigA).times(b);
    }
  },
  {
    operationName: "divide",
    funcESM: (a, b) => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
      return () => divBig(cloneBig(bigA), bigB);
    },
    funcESMMutable: (a, b) => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
      return () => divBig(cloneBig(bigA), bigB, 20, "half-up", true);
    },
    funcJS: (a, b) => {
      const bigA = new BigJS(a);
      return () => new BigJS(bigA).div(b);
    }
  },
  {
    operationName: "power of 4",
    funcESM: (a, b) => {
      const bigA = new BigESM(a);
      return () => powBig(cloneBig(bigA), 4);
    },
    funcESMMutable: (a, b) => {
      const bigA = new BigESM(a);
      return () => powBig(cloneBig(bigA), 4, true);
    },
    funcJS: (a, b) => {
      const bigA = new BigJS(a);
      return () => new BigJS(bigA).pow(4);
    }
  },
  {
    operationName: "square root",
    funcESM: (a, b) => {
      const bigA = new BigESM(a);
      return () => sqrtBig(cloneBig(bigA), 2, 20);
    },
    funcESMMutable: (a, b) => {
      const bigA = new BigESM(a);
      return () => sqrtBig(cloneBig(bigA), 2, 20);
    },
    funcJS: (a, b) => {
      const bigA = new BigJS(a);
      return () => new BigJS(bigA).sqrt(2);
    }
  },
  // ESM-only benchmarks for new functions
  {
    operationName: "sin",
    funcESM: (a) => {
      const bigA = new BigESM(a);
      return () => sinBig(bigA, 20); // Fixed precision for benchmark
    },
    funcESMMutable: undefined,
    funcJS: undefined // No sin in big.js
  },
  {
    operationName: "cos",
    funcESM: (a) => {
      const bigA = new BigESM(a);
      return () => cosBig(bigA, 20);
    },
    funcESMMutable: undefined,
    funcJS: undefined // No cos in big.js
  },
  {
    operationName: "tan",
    funcESM: (a) => {
      const bigA = new BigESM(a);
      return () => tanBig(bigA, 20);
    },
    funcESMMutable: undefined,
    funcJS: undefined // No tan in big.js
  },
  {
    operationName: "ln (logBig)",
    // For log, ensure 'a' is positive. Test cases like smallNumberA and bigNumberA are suitable.
    funcESM: (a) => {
      if (a <= 0) return () => {}; // Skip for non-positive test case args if any
      const bigA = new BigESM(a);
      return () => logBig(bigA, 20);
    },
    funcESMMutable: undefined,
    funcJS: undefined // No ln in big.js
  },
  {
    operationName: "log10 (log10Big)",
    funcESM: (a) => {
      if (a <= 0) return () => {}; // Skip for non-positive
      const bigA = new BigESM(a);
      return () => log10Big(bigA, 20);
    },
    funcESMMutable: undefined,
    funcJS: undefined // No log10 in big.js
  }
];

runBenchmark(testCases, operations);

// Markdown table generation
let markdownTable = "| Operation | big.esm | big.esm(mutable) | big.js | Difference(immutable vs js / mutable vs js) |\n"; // Updated header
markdownTable += "| --- | --- | --- | --- | --- | \n";
for (const result of results) {
  const diffStr = result["big.js"].startsWith("0.000ms") || result["big.js"] === "—" // Check if big.js time is effectively zero or N/A
    ? "N/A" 
    : `${result.Difference} / ${result["Difference with mutable"] === "0.00% slower" || result["Difference with mutable"] === "0.00% faster" ? "N/A" : result["Difference with mutable"] }`;
  
  markdownTable += `| ${result.Operation} | ${result["big.esm"]} | ${result["big.esm(mutable)"]} | ${result["big.js"]} | ${diffStr} |\n`;
}

console.log(markdownTable);

// Additional check for log functions to only run with positive numbers from testCases
// The current runBenchmark structure iterates all operations for all test cases.
// The log functions already have an internal check (a > 0), which will result in them returning an empty function,
// effectively skipping the benchmark for invalid inputs. This is acceptable.
// For specific test cases for log/trig, one could define separate testCase arrays if needed.
// The existing testCases use positive numbers for 'a' (args[0]), so log should work for them.
