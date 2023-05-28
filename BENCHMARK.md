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
| add - smallNumber                | 18.705ms (252.1 KB)    | 10.887ms (304.3 KB)    | 30.386ms (757.9 KB)    | 38.44% faster/64.17% faster   |
| subtract - smallNumber           | 15.132ms (494.4 KB)    | 9.425ms (727.6 KB)     | 31.121ms (935.7 KB)    | 51.38% faster/69.71% faster   |
| multiply - smallNumber           | 15.068ms (907.2 KB)    | 9.462ms (1152.5 KB)    | 55.956ms (217.5 KB)    | 73.07% faster/83.09% faster   |
| divide - smallNumber             | 41.517ms (593.3 KB)    | 35.951ms (619.2 KB)    | 281.480ms (1232.3 KB)  | 85.25% faster/87.23% faster   |
| power of 4 - smallNumber         | 18.686ms (349.0 KB)    | 12.864ms (618.9 KB)    | 167.707ms (554.1 KB)   | 88.86% faster/92.33% faster   |
| square root - smallNumber        | 2471.304ms (584.8 KB)  | 2457.924ms (730.9 KB)  | 1568.081ms (1722.5 KB) | -57.60% slower/-56.75% slower |
| add - bigInt                     | 13.569ms (1894.6 KB)   | 8.414ms (2020.2 KB)    | 40.286ms (611.5 KB)    | 66.32% faster/79.12% faster   |
| subtract - bigInt                | 13.229ms (904.0 KB)    | 8.053ms (1023.9 KB)    | 41.731ms (1924.0 KB)   | 68.30% faster/80.70% faster   |
| multiply - bigInt                | 14.107ms (1687.1 KB)   | 8.774ms (1828.5 KB)    | 136.398ms (1272.0 KB)  | 89.66% faster/93.57% faster   |
| divide - bigInt                  | 56.606ms (792.5 KB)    | 50.725ms (926.4 KB)    | 899.218ms (160.6 KB)   | 93.71% faster/94.36% faster   |
| power of 4 - bigInt              | 16.740ms (1891.8 KB)   | 11.522ms (2013.3 KB)   | 510.821ms (768.6 KB)   | 96.72% faster/97.74% faster   |
| square root - bigInt             | 6488.926ms (3976.7 KB) | 6470.099ms (1706.4 KB) | 7376.961ms (601.5 KB)  | 12.04% faster/12.29% faster   |
| add - bigNumber                  | 13.391ms (2667.3 KB)   | 8.515ms (2794.3 KB)    | 64.375ms (2893.8 KB)   | 79.20% faster/86.77% faster   |
| subtract - bigNumber             | 13.065ms (3703.7 KB)   | 7.939ms (3940.7 KB)    | 68.176ms (2088.5 KB)   | 80.84% faster/88.36% faster   |
| multiply - bigNumber             | 15.043ms (2017.1 KB)   | 9.779ms (2128.6 KB)    | 457.728ms (3144.7 KB)  | 96.71% faster/97.86% faster   |
| divide - bigNumber               | 58.457ms (686.5 KB)    | 52.425ms (803.8 KB)    | 1775.033ms (432.0 KB)  | 96.71% faster/97.05% faster   |
| power of 4 - bigNumber           | 20.386ms (1657.9 KB)   | 15.013ms (1778.5 KB)   | 2029.915ms (555.8 KB)  | 99.00% faster/99.26% faster   |
| square root - bigNumber          | 6501.797ms (2090.1 KB) | 6528.872ms (1819.6 KB) | 7069.542ms (1649.2 KB) | 8.03% faster/7.65% faster     |
| add - numberWithExponent         | 13.372ms (1891.6 KB)   | 8.418ms (6044.7 KB)    | 36.854ms (2269.0 KB)   | 63.72% faster/77.16% faster   |
| subtract - numberWithExponent    | 13.078ms (2912.8 KB)   | 7.757ms (7061.5 KB)    | 41.655ms (1507.3 KB)   | 68.60% faster/81.38% faster   |
| multiply - numberWithExponent    | 14.005ms (3689.0 KB)   | 8.620ms (7841.7 KB)    | 134.635ms (2913.6 KB)  | 89.60% faster/93.60% faster   |
| divide - numberWithExponent      | 57.278ms (4830.3 KB)   | 51.106ms (919.4 KB)    | 900.856ms (5778.4 KB)  | 93.64% faster/94.33% faster   |
| power of 4 - numberWithExponent  | 17.257ms (1892.9 KB)   | 11.284ms (6037.5 KB)   | 512.859ms (746.6 KB)   | 96.64% faster/97.80% faster   |
| square root - numberWithExponent | 3777.078ms (98.3 KB)   | 3771.297ms (7849.8 KB) | 2899.836ms (3295.2 KB) | -30.25% slower/-30.05% slower |

## Only mathematical operations

This version of the benchmark reuses the same instance for each iteration. So time and memory are measured only for the operation. And it doesn't include mutable versions of `big.esm` operations, because while mutation it will be out of memory on some operations. 100_000 iterations with same instance results in very big string numbers

| Operation                     | big.esm                | big.js                 | Difference(immutable) |
|-------------------------------|------------------------|------------------------|-----------------------| 
| add - smallNumber             | 11.418ms (797.3 KB)    | 27.906ms (786.1 KB)    | 59.08% faster         |
| subtract - smallNumber        | 9.106ms (1098.4 KB)    | 28.313ms (1162.5 KB)   | 67.84% faster         |
| multiply - smallNumber        | 9.176ms (1030.7 KB)    | 54.597ms (432.9 KB)    | 83.19% faster         |
| divide - smallNumber          | 35.442ms (717.9 KB)    | 277.723ms (1217.8 KB)  | 87.24% faster         |
| pow - smallNumber             | 12.107ms (535.8 KB)    | 167.838ms (479.5 KB)   | 92.79% faster         |
| sqrt - smallNumber            | 2440.993ms (1690.0 KB) | 1561.403ms (2252.8 KB) | -56.33% slower        |
| add - bigInt                  | 8.031ms (2018.2 KB)    | 36.842ms (1917.1 KB)   | 78.20% faster         |
| subtract - bigInt             | 7.393ms (1017.8 KB)    | 38.745ms (1086.6 KB)   | 80.92% faster         |
| multiply - bigInt             | 8.133ms (1805.2 KB)    | 133.024ms (271.0 KB)   | 93.89% faster         |
| divide - bigInt               | 51.127ms (911.8 KB)    | 893.839ms (1384.1 KB)  | 94.28% faster         |
| pow - bigInt                  | 11.273ms (2013.7 KB)   | 570.422ms (1929.6 KB)  | 98.02% faster         |
| sqrt - bigInt                 | 6437.105ms (2148.3 KB) | 7680.562ms (3347.8 KB) | 16.19% faster         |
| add - bigNumber               | 7.947ms (2783.6 KB)    | 60.693ms (2324.2 KB)   | 86.91% faster         |
| subtract - bigNumber          | 7.361ms (3803.9 KB)    | 65.050ms (1472.6 KB)   | 88.68% faster         |
| multiply - bigNumber          | 9.394ms (2206.0 KB)    | 452.086ms (2577.3 KB)  | 97.92% faster         |
| divide - bigNumber            | 52.634ms (789.1 KB)    | 1827.867ms (3971.4 KB) | 97.12% faster         |
| pow - bigNumber               | 14.402ms (1791.4 KB)   | 2013.134ms (3469.9 KB) | 99.28% faster         |
| sqrt - bigNumber              | 6437.444ms (2173.1 KB) | 6984.006ms (1129.2 KB) | 7.83% faster          |
| add - numberWithExponent      | 7.769ms (1997.0 KB)    | 35.789ms (1398.0 KB)   | 78.29% faster         |
| subtract - numberWithExponent | 7.384ms (3023.9 KB)    | 36.200ms (584.8 KB)    | 79.60% faster         |
| multiply - numberWithExponent | 8.192ms (3809.4 KB)    | 131.449ms (2007.3 KB)  | 93.77% faster         |
| divide - numberWithExponent   | 51.162ms (912.4 KB)    | 896.619ms (1043.1 KB)  | 94.29% faster         |
| pow - numberWithExponent      | 10.984ms (2010.4 KB)   | 510.323ms (3936.5 KB)  | 97.85% faster         |
| sqrt - numberWithExponent     | 3739.588ms (407.3 KB)  | 2993.745ms (2346.1 KB) | -24.91% slower        |


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
