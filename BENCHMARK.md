# Benchmark

Benchmarks compare `big.esm` (current build) vs `big.js`.

Speed benchmarks use `50_000` iterations per operation (median of 3 runs).
Size benchmarks use `bun build --minify` + Brotli quality `11` (minified + brotli sizes).

## Run

```bash
bun run build

# speed (writes benchmarks/results/<timestamp>_speed.md)
bun run benchmark

# size (writes benchmarks/results/<timestamp>_weight.md)
bun run benchmark:weight
```

## Latest results

### Speed (big.esm v2 vs big.js)

_Last updated: 2025-12-18_002203_

- Iterations: 50000
- Repeats: 3 (median)
- Precision: 20
- Current: `dist/big.esm.js`
- Node: v24.3.0
- Bun: 1.3.1

#### Summary (median, min/max)

Ops (28 rows):

- big.esm vs big.js: median 26.26x faster (min 2.17x faster, max 154.43x faster)

Pipeline (28 rows):

- pipeBig vs big.js: median 29.8x faster (min 2.84x faster, max 148.27x faster)

#### Ops

| Operation                                    | big.esm  | big.js     | big.esm vs big.js |
|----------------------------------------------|----------|------------|-------------------|
| add - smallNumber                            | 1.151ms  | 2.672ms    | 2.32x faster      |
| subtract - smallNumber                       | 1.098ms  | 2.381ms    | 2.17x faster      |
| multiply - smallNumber                       | 0.974ms  | 9.711ms    | 9.97x faster      |
| divide - smallNumber                         | 5.734ms  | 106.404ms  | 18.56x faster     |
| power of 4 - smallNumber                     | 1.955ms  | 47.258ms   | 24.17x faster     |
| square root - smallNumber                    | 32.497ms | 537.619ms  | 16.54x faster     |
| chain (add → mul → div) - smallNumber        | 6.215ms  | 169.575ms  | 27.29x faster     |
| add - bigInt                                 | 1.041ms  | 2.884ms    | 2.77x faster      |
| subtract - bigInt                            | 0.630ms  | 3.032ms    | 4.81x faster      |
| multiply - bigInt                            | 0.798ms  | 31.656ms   | 39.67x faster     |
| divide - bigInt                              | 9.300ms  | 234.584ms  | 25.22x faster     |
| power of 4 - bigInt                          | 2.230ms  | 157.833ms  | 70.78x faster     |
| square root - bigInt                         | 47.013ms | 1477.602ms | 31.43x faster     |
| chain (add → mul → div) - bigInt             | 14.467ms | 436.965ms  | 30.2x faster      |
| add - bigNumber                              | 1.225ms  | 5.053ms    | 4.13x faster      |
| subtract - bigNumber                         | 0.933ms  | 5.144ms    | 5.51x faster      |
| multiply - bigNumber                         | 1.800ms  | 131.272ms  | 72.94x faster     |
| divide - bigNumber                           | 11.304ms | 442.684ms  | 39.16x faster     |
| power of 4 - bigNumber                       | 5.391ms  | 832.600ms  | 154.43x faster    |
| square root - bigNumber                      | 47.089ms | 1676.041ms | 35.59x faster     |
| chain (add → mul → div) - bigNumber          | 16.532ms | 1124.157ms | 68x faster        |
| add - numberWithExponent                     | 0.983ms  | 4.085ms    | 4.16x faster      |
| subtract - numberWithExponent                | 0.662ms  | 3.359ms    | 5.07x faster      |
| multiply - numberWithExponent                | 0.911ms  | 46.266ms   | 50.81x faster     |
| divide - numberWithExponent                  | 10.288ms | 291.317ms  | 28.32x faster     |
| power of 4 - numberWithExponent              | 2.222ms  | 226.501ms  | 101.95x faster    |
| square root - numberWithExponent             | 33.424ms | 822.328ms  | 24.6x faster      |
| chain (add → mul → div) - numberWithExponent | 13.061ms | 373.695ms  | 28.61x faster     |

#### Pipeline

| Operation                                    | pipeBig  | big.js     | pipeBig vs big.js |
|----------------------------------------------|----------|------------|-------------------|
| add - smallNumber                            | 0.976ms  | 3.093ms    | 3.17x faster      |
| subtract - smallNumber                       | 0.836ms  | 2.372ms    | 2.84x faster      |
| multiply - smallNumber                       | 1.151ms  | 17.307ms   | 15.03x faster     |
| divide - smallNumber                         | 6.193ms  | 136.319ms  | 22.01x faster     |
| power of 4 - smallNumber                     | 1.957ms  | 78.674ms   | 40.2x faster      |
| square root - smallNumber                    | 34.787ms | 666.440ms  | 19.16x faster     |
| chain (add → mul → div) - smallNumber        | 6.804ms  | 215.126ms  | 31.62x faster     |
| add - bigInt                                 | 1.202ms  | 3.997ms    | 3.33x faster      |
| subtract - bigInt                            | 0.866ms  | 3.226ms    | 3.72x faster      |
| multiply - bigInt                            | 1.110ms  | 44.906ms   | 40.45x faster     |
| divide - bigInt                              | 9.963ms  | 290.322ms  | 29.14x faster     |
| power of 4 - bigInt                          | 2.193ms  | 235.625ms  | 107.45x faster    |
| square root - bigInt                         | 47.561ms | 1765.133ms | 37.11x faster     |
| chain (add → mul → div) - bigInt             | 14.021ms | 513.226ms  | 36.6x faster      |
| add - bigNumber                              | 1.341ms  | 6.397ms    | 4.77x faster      |
| subtract - bigNumber                         | 1.114ms  | 5.087ms    | 4.57x faster      |
| multiply - bigNumber                         | 1.825ms  | 162.410ms  | 88.99x faster     |
| divide - bigNumber                           | 11.790ms | 534.323ms  | 45.32x faster     |
| power of 4 - bigNumber                       | 5.646ms  | 837.090ms  | 148.27x faster    |
| square root - bigNumber                      | 47.781ms | 1707.122ms | 35.73x faster     |
| chain (add → mul → div) - bigNumber          | 17.591ms | 1091.909ms | 62.07x faster     |
| add - numberWithExponent                     | 1.178ms  | 4.140ms    | 3.51x faster      |
| subtract - numberWithExponent                | 0.819ms  | 3.307ms    | 4.04x faster      |
| multiply - numberWithExponent                | 0.948ms  | 47.066ms   | 49.66x faster     |
| divide - numberWithExponent                  | 11.464ms | 290.411ms  | 25.33x faster     |
| power of 4 - numberWithExponent              | 2.107ms  | 236.849ms  | 112.39x faster    |
| square root - numberWithExponent             | 34.682ms | 814.382ms  | 23.48x faster     |
| chain (add → mul → div) - numberWithExponent | 12.202ms | 371.643ms  | 30.46x faster     |

### Weight (bundle size)

_Last updated: 2025-12-18_002541_

- Node: v24.3.0
- Bun: 1.3.1
- Brotli quality: 11

| Artifact           | Minified | Brotli  |
|--------------------|----------|---------|
| big.js             | 6.83 KB  | 2.72 KB |
| bigPipe (v2)       | 4.40 KB  | 1.62 KB |
| big.esm (v2, full) | 5.25 KB  | 1.87 KB |

## Notes

`MacBook Pro (M4 Pro, 24GB)` used for benchmarks.
