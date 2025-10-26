import { performance } from "node:perf_hooks";

import { Big as BigJS } from "big.js";
import { addBig, Big as BigESM, cloneBig, divBig, mulBig, powBig, sqrtBig, subBig } from "./dist/big.esm.js";

const smallNumberA = 12345.67809;
const smallNumberB = 78901.23456;
const bigIntA = BigInt("12345678901234567890");
const bigIntB = BigInt("67890123456789012345");
const bigNumberA = "12345678901234567890.12345678901234567890";
const bigNumberB = "67890123456789012345.67890123456789012345";
const numberWithExponentA = "12345678901234567890e-10";
const numberWithExponentB = "67890123456789012345e-10";

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
      runGC();

      const preparedESMMutable = funcESMMutable && funcESMMutable(...testCase.args);
      initialMemory = process.memoryUsage().heapUsed;
      const timeESMMutable = funcESMMutable &&
        benchmark(`big.esm(mutable) — ${testCase.name} — ${operationName}`, preparedESMMutable);
      finalMemory = process.memoryUsage().heapUsed;
      const memoryUsedESMMutable = finalMemory - initialMemory;
      runGC();

      const preparedJS = funcJS && funcJS(...testCase.args);
      initialMemory = process.memoryUsage().heapUsed;
      const timeJS = benchmark(`big.js — ${testCase.name} — ${operationName}`, preparedJS);
      finalMemory = process.memoryUsage().heapUsed;
      const memoryUsedJS = finalMemory - initialMemory;
      runGC();

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
  }
];

runBenchmark(testCases, operations);

// Markdown table generation
let markdownTable = "| Operation | big.esm | big.esm(mutable) | big.js | Difference(immutable/mutable) |\n";
markdownTable += "| --- | --- | --- | --- | --- | \n";
for (const result of results) {
  markdownTable += `| ${result.Operation} | ${result["big.esm"]} | ${result["big.esm(mutable)"]} | ${result["big.js"]} | ${result.Difference}/${result["Difference with mutable"]} |\n`;
}

console.log(markdownTable);
