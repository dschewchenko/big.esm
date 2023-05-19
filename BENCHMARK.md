# Benchmark

Compare `big.esm` with `big.js`. 100_000 iterations for each operation.

It measures the time and memory usage for each library and operation on 100_000 iterations.

## Usage

```bash
npm run benchmark [--without-init]
```

`--without-init` flag will run only test cases without initialization on each iteration.

Code for benchmarking is in the `benchmark.js` file

## Full benchmark

This version of the benchmark creates instance for each iteration. So time and memory are measured init+operation.

Tested variants:
- big.esm - immutable (creates new instance on each operation)
- big.esm - mutable (mutates the instance of first argument on each operation)
- big.js

**Note:** powBig and sqrtBig are not optimized in memory usage, because they are reusing other operation functions.

**Note 2:** sqrtBig uses Newton's method with variable root(quadratic, cubic, etc.) and high precision.

| Operation                        | big.esm                | big.esm(mutable)       | big.js                 | Difference(immutable/mutable) |
|----------------------------------|------------------------|------------------------|------------------------|-------------------------------| 
| add - smallNumber                | 18.285ms (386.4 KB)    | 11.718ms (287.7 KB)    | 30.083ms (832.0 KB)    | 39.22% faster/61.05% faster   |
| subtract - smallNumber           | 15.164ms (492.4 KB)    | 9.429ms (758.6 KB)     | 30.811ms (998.7 KB)    | 50.78% faster/69.40% faster   |
| multiply - smallNumber           | 15.224ms (939.2 KB)    | 9.672ms (1093.2 KB)    | 55.847ms (354.9 KB)    | 72.74% faster/82.68% faster   |
| divide - smallNumber             | 41.999ms (536.2 KB)    | 36.107ms (642.5 KB)    | 279.579ms (1225.8 KB)  | 84.98% faster/87.09% faster   |
| power of 4 - smallNumber         | 72.588ms (648.0 KB)    | 48.761ms (148.3 KB)    | 166.206ms (1361.8 KB)  | 56.33% faster/70.66% faster   |
| square root - smallNumber        | 2976.900ms (1585.9 KB) | 2975.982ms (464.5 KB)  | 1564.972ms (1588.4 KB) | -90.22% slower/-90.16% slower |
| add - bigInt                     | 13.726ms (1894.6 KB)   | 8.545ms (2017.6 KB)    | 37.581ms (229.4 KB)    | 63.47% faster/77.26% faster   |
| subtract - bigInt                | 13.361ms (905.7 KB)    | 8.089ms (1019.5 KB)    | 40.929ms (1943.3 KB)   | 67.35% faster/80.24% faster   |
| multiply - bigInt                | 14.342ms (1687.5 KB)   | 8.825ms (1832.9 KB)    | 136.970ms (1294.8 KB)  | 89.53% faster/93.56% faster   |
| divide - bigInt                  | 56.201ms (805.8 KB)    | 50.980ms (920.8 KB)    | 892.726ms (202.6 KB)   | 93.70% faster/94.29% faster   |
| power of 4 - bigInt              | 70.639ms (895.0 KB)    | 48.040ms (1375.5 KB)   | 508.902ms (522.1 KB)   | 86.12% faster/90.56% faster   |
| square root - bigInt             | 7981.249ms (1171.5 KB) | 7961.642ms (986.9 KB)  | 7695.290ms (485.1 KB)  | -3.72% slower/-3.46% slower   |
| add - bigNumber                  | 13.691ms (2871.7 KB)   | 8.489ms (2794.7 KB)    | 63.963ms (2880.0 KB)   | 78.60% faster/86.73% faster   |
| subtract - bigNumber             | 13.146ms (3705.6 KB)   | 8.072ms (3811.6 KB)    | 67.646ms (1880.3 KB)   | 80.57% faster/88.07% faster   |
| multiply - bigNumber             | 15.311ms (2012.8 KB)   | 9.620ms (2150.2 KB)    | 455.046ms (2850.4 KB)  | 96.64% faster/97.89% faster   |
| divide - bigNumber               | 58.334ms (688.2 KB)    | 52.446ms (801.5 KB)    | 1764.264ms (404.4 KB)  | 96.69% faster/97.03% faster   |
| power of 4 - bigNumber           | 79.068ms (2316.8 KB)   | 62.526ms (2786.0 KB)   | 2018.369ms (342.9 KB)  | 96.08% faster/96.90% faster   |
| square root - bigNumber          | 8063.925ms (1060.8 KB) | 8165.573ms (4931.7 KB) | 6832.465ms (1425.7 KB) | -18.02% slower/-19.51% slower |
| add - numberWithExponent         | 13.214ms (1893.0 KB)   | 8.336ms (6036.2 KB)    | 36.596ms (2246.8 KB)   | 63.89% faster/77.22% faster   |
| subtract - numberWithExponent    | 13.005ms (3108.1 KB)   | 7.946ms (7254.0 KB)    | 39.035ms (1696.2 KB)   | 66.68% faster/79.65% faster   |
| multiply - numberWithExponent    | 14.262ms (3855.8 KB)   | 8.601ms (7995.5 KB)    | 132.613ms (3043.4 KB)  | 89.25% faster/93.51% faster   |
| divide - numberWithExponent      | 56.196ms (4830.9 KB)   | 51.036ms (925.2 KB)    | 896.569ms (5786.7 KB)  | 93.73% faster/94.31% faster   |
| power of 4 - numberWithExponent  | 71.219ms (7967.4 KB)   | 47.471ms (7555.0 KB)   | 511.679ms (870.4 KB)   | 86.08% faster/90.72% faster   |
| square root - numberWithExponent | 4623.128ms (4303.1 KB) | 4622.557ms (4304.2 KB) | 2968.454ms (3331.4 KB) | -55.74% slower/-55.72% slower |

## Only mathematical operations

This version of the benchmark reuses the same instance for each iteration. So time and memory are measured only for the operation. And it doesn't include mutable versions of `big.esm` operations, because while mutation it will be out of memory on some operations. 100_000 iterations with same instance results in very big string numbers

| Operation                     | big.esm                | big.js                 | Difference     |
|-------------------------------|------------------------|------------------------|----------------| 
| add - smallNumber             | 11.342ms (748.6 KB)    | 27.925ms (822.2 KB)    | 59.38% faster  |
| subtract - smallNumber        | 9.161ms (980.7 KB)     | 28.469ms (1186.1 KB)   | 67.82% faster  |
| multiply - smallNumber        | 8.992ms (1133.3 KB)    | 53.144ms (424.9 KB)    | 83.08% faster  |
| divide - smallNumber          | 36.107ms (703.7 KB)    | 275.475ms (1216.3 KB)  | 86.89% faster  |
| pow - smallNumber             | 68.214ms (1003.8 KB)   | 166.453ms (498.1 KB)   | 59.02% faster  |
| sqrt - smallNumber            | 3060.840ms (1087.8 KB) | 1574.789ms (2176.2 KB) | -94.37% slower |
| add - bigInt                  | 7.797ms (2103.2 KB)    | 36.432ms (1817.1 KB)   | 78.60% faster  |
| subtract - bigInt             | 7.597ms (1103.0 KB)    | 38.888ms (1069.7 KB)   | 80.46% faster  |
| multiply - bigInt             | 8.306ms (1801.4 KB)    | 132.652ms (268.1 KB)   | 93.74% faster  |
| divide - bigInt               | 54.881ms (911.7 KB)    | 902.711ms (1470.0 KB)  | 93.92% faster  |
| pow - bigInt                  | 66.194ms (1006.5 KB)   | 507.148ms (2056.1 KB)  | 86.95% faster  |
| sqrt - bigInt                 | 8195.377ms (1346.2 KB) | 7657.839ms (3376.7 KB) | -7.02% slower  |
| add - bigNumber               | 7.670ms (2780.6 KB)    | 62.027ms (2340.7 KB)   | 87.63% faster  |
| subtract - bigNumber          | 7.356ms (3808.5 KB)    | 64.568ms (1686.7 KB)   | 88.61% faster  |
| multiply - bigNumber          | 8.912ms (2353.7 KB)    | 452.726ms (2815.4 KB)  | 98.03% faster  |
| divide - bigNumber            | 51.578ms (791.5 KB)    | 1753.222ms (4170.6 KB) | 97.06% faster  |
| pow - bigNumber               | 73.048ms (2431.4 KB)   | 2016.991ms (3829.5 KB) | 96.38% faster  |
| sqrt - bigNumber              | 8177.927ms (1138.4 KB) | 7007.363ms (1226.6 KB) | -16.70% slower |
| add - numberWithExponent      | 7.420ms (1996.1 KB)    | 34.888ms (1500.6 KB)   | 78.73% faster  |
| subtract - numberWithExponent | 7.288ms (3019.2 KB)    | 36.203ms (617.2 KB)    | 79.87% faster  |
| multiply - numberWithExponent | 7.998ms (3807.1 KB)    | 130.876ms (2072.5 KB)  | 93.89% faster  |
| divide - numberWithExponent   | 50.523ms (906.6 KB)    | 887.457ms (1031.0 KB)  | 94.31% faster  |
| pow - numberWithExponent      | 65.748ms (101.4 KB)    | 502.882ms (4107.6 KB)  | 86.93% faster  |
| sqrt - numberWithExponent     | 4689.913ms (551.7 KB)  | 2890.782ms (2386.6 KB) | -62.24% slower |

## Test data:

```js
const smallNumberA = 12345.67809;
const smallNumberB = 78901.23456;
const bigIntA = BigInt("12345678901234567890");
const bigIntB = BigInt("67890123456789012345");
const bigNumberA = "12345678901234567890.12345678901234567890";
const bigNumberB = "67890123456789012345.67890123456789012345";
const numberWithExponentA = "12345678901234567890e-10";
const numberWithExponentB = "67890123456789012345e-10";
```

### The Benchmark was run on:
MacBook Pro M1 2020 16GB RAM, Node.js v18.16.0
