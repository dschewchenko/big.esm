import { Big as BigJS } from "big.js";
import { addBig, Big as BigESM, divBig, mulBig, powBig, subBig } from "./dist/big.esm.js";

import { performance } from "node:perf_hooks";

const smallIntA = 123;
const smallIntB = 456;
const smallNumberA = 123.456;
const smallNumberB = 789.012;
const bigIntA = "12345678901234567890";
const bigIntB = "67890123456789012345";
const bigNumberA = "12345678901234567890.1234567890";
const bigNumberB = "67890123456789012345.6789012345";

// simple benchmark function
function benchmark(name, func, times = 100_000) {
  const start = performance.now();

  for (let i = 0; i < times; i++) {
    func();
  }
  const end = performance.now();

  const elapsed = end - start;
  console.log(`${name}: ${elapsed.toFixed(3)}ms`);
  return elapsed;
}

console.log("Benchmarking with 100,000 iterations");

let results = [];

// run benchmark for each test case and operation
function runBenchmark(testCases, operations) {
  testCases.forEach((testCase) => {
    operations.forEach((operation) => {
      const { operationName, funcESM, funcJS } = operation;
      const timeESM = benchmark(`big.esm — ${testCase.name} — ${operationName}`, funcESM(...testCase.args));
      const timeJS = benchmark(`big.js — ${testCase.name} — ${operationName}`, funcJS(...testCase.args));

      const diff = (timeESM - timeJS) / -timeJS * 100;
      const diffFormatted = diff.toFixed(2);

      const performanceResult = timeESM < timeJS ? "faster" : "slower";

      results.push({
        Operation: `${operationName} - ${testCase.name}`,
        "big.esm": timeESM.toFixed(3),
        "big.js": timeJS.toFixed(3),
        Difference: `${diffFormatted}% ${performanceResult}`
      });
    });

  });
}

// test cases (a, b)
const testCases = [
  {
    name: "smallInt",
    args: [smallIntA, smallIntB]
  },
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
  }
];

// operations
const operations = [
  {
    operationName: "init",
    funcESM: (a, b) => () => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
    },
    funcJS: (a, b) => () => {
      const bigA = new BigJS(a);
      const bigB = new BigJS(b);
    }
  },
  {
    operationName: "add",
    funcESM: (a, b) => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
      return () => addBig(bigA, bigB);
    },
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
    funcJS: (a, b) => {
      const bigA = new BigJS(a);
      return () => bigA.div(b);
    }
  },
  {
    operationName: "power of 4",
    funcESM: (a, b) => {
      const bigA = new BigESM(a);
      const bigB = new BigESM(b);
      return () => powBig(bigA, 4);
    },
    funcJS: (a, b) => {
      const bigA = new BigJS(a);
      return () => bigA.pow(4);
    }
  }
];

runBenchmark(testCases, operations);

// Markdown table generation
let markdownTable = "| Operation | big.esm | big.js | Difference |\n";
markdownTable += "| --- | --- | --- | --- |\n";
for (const result of results) {
  markdownTable += `| ${result.Operation} | ${result["big.esm"]}ms | ${result["big.js"]}ms | ${result.Difference} |\n`;
}

console.log(markdownTable);
