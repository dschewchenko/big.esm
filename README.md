# big.esm

[![npm version](https://img.shields.io/npm/v/big.esm.svg)](https://www.npmjs.com/package/big.esm)
[![npm downloads](https://img.shields.io/npm/dw/big.esm)](https://www.npmjs.com/package/big.esm)

Library for working with large numbers and fractions using `BigInt`.
It provides advanced functionality for performing arithmetic operations with precision and decimal handling.
[Documentation](https://dschewchenko.github.io/big.esm/).

- 100% test coverage.

- No dependencies.

- No limitations on the size of the numbers, except for the limitations of `BigInt`, so limited by system memory =).

- Fully written in TypeScript, so it provides type definitions out of the box.

- Tree-shaking is supported. 

Full bundle size(ESM) — 3.12 kB minified and 1.42 kB gzipped.
`powBig` operation is half of this size, 1.5kB/0.7kB(minified/gzip),
because it's big and reuses most of the operations from `big.esm`.

## Installation

Install `big.esm` using npm:
    
```bash
npm install big.esm
```

## Usage

```js
import { createBig, addBig } from 'big.esm';

const a = createBig("12345678910.12345678910"); // or new Big("12345678910.12345678910")
const b = createBig("9876543210.9876543210");
const result = addBig(a, b);
console.log(result.toString()); // 22222222121.1111111101
```

## Compatibility

`big.esm` is compatible with all modern browsers and Node.js 10+. It uses `BigInt` internally, so it is not compatible with older browsers and Node.js versions. On info from [caniuse.com](https://caniuse.com/#feat=bigint) `BigInt` is supported by 95.25% of all browsers(as of 2023-05-12).

## Notes

- `big.esm` is not a drop-in replacement for `big.js`. It does not support the same API and does not have the same functionality. It is a completely different library.
- `powBig()` and `sqrtBig()` are heavy and slow operations. They are implemented using the Newton's method and exponentiation by squaring algorithms. Use them with caution, especially with large numbers. In most cases, there will be no problems.

## API

More information in the [documentation](https://dschewchenko.github.io/big.esm/).

### Core

#### `new Big(value: BigValue, scale?: number | string): Big`

Creates a new `Big` instance from a string, number or `BigInt`. Optionally, you can specify the scale of the number. The scale is the number of digits to the right of the decimal point. If the scale is not specified, it will be calculated automatically, otherwise the number will be rounded to integer.

### Utilities

#### `createBig(value: string | number | bigint, scale?: number | string): Big`

Alias for `new Big(value, scale)`. 

#### `cloneBig(a: Big): Big`

Creates a new `Big` instance from another `Big` instance.

#### `alignScale(a: Big, b: Big): [Big, Big]`

Aligns the scale of two `Big` instances. The scale of the result will be equal to the maximum scale of the two numbers.

#### `isNumericValue(value: any): boolean`

Checks if the value is a valid numeric value for creating a `Big` instance.

### Mathematical operations

#### `addBig(a: Big, b: Big): Big`

Adds two `Big` instances.

#### `subBig(a: Big, b: Big): Big`

Subtracts two `Big` instances.

#### `mulBig(a: Big, b: Big): Big`

Multiplies two `Big` instances.

#### `divBig(a: Big, b: Big, precision = 20, roundingMode = "half-up"): Big`

Divides two `Big` instances. The default precision is 20. The default rounding mode is "half-up".

#### `modBig(a: Big, b: Big): Big`

Calculates the remainder of dividing two `Big` instances.

#### `powBig(a: Big, exp: number): Big`

Raises `a` to the power of `b`.

#### `sqrtBig(a: Big, root = 2, precision = 20): Big`

Calculates the root of `a`. The default root is 2, which means the square root. The default precision is 20.

#### `absBig(a: Big): Big`

Returns the absolute value of `a`.

#### `compareBig(a: Big, b: Big): -1 | 0 | 1`

Compares two `Big` instances. Returns `-1` if `a < b`, `0` if `a == b` and `1` if `a > b`.

## Benchmark

Compare `big.esm` with `big.js`. 100_000 iterations for each operation.

| Operation                 | big.esm     | big.js     | Difference      |
|---------------------------|-------------|------------|-----------------|
| init - smallInt           | 40.267ms    | 24.225ms   | -66.22% slower  |
| add - smallInt            | 24.570ms    | 16.543ms   | -48.52% slower  |
| subtract - smallInt       | 22.152ms    | 16.455ms   | -34.63% slower  |
| multiply - smallInt       | 23.394ms    | 25.183ms   | 7.10% faster    |
| divide - smallInt         | 68.486ms    | 232.593ms  | 70.56% faster   |
| power of 4 - smallInt     | 124.721ms   | 63.314ms   | -96.99% slower  |
| square root - smallInt    | 5608.635ms  | 1489.536ms | -276.54% slower |
| init - smallNumber        | 43.917ms    | 38.125ms   | -15.19% slower  |
| add - smallNumber         | 22.342ms    | 26.888ms   | 16.91% faster   |
| subtract - smallNumber    | 21.692ms    | 27.138ms   | 20.07% faster   |
| multiply - smallNumber    | 27.452ms    | 56.488ms   | 51.40% faster   |
| divide - smallNumber      | 62.497ms    | 318.407ms  | 80.37% faster   |
| power of 4 - smallNumber  | 153.008ms   | 156.773ms  | 2.40% faster    |
| square root - smallNumber | 5557.749ms  | 1558.616ms | -256.58% slower |
| init - bigInt             | 50.074ms    | 36.019ms   | -39.02% slower  |
| add - bigInt              | 27.391ms    | 24.467ms   | -11.95% slower  |
| subtract - bigInt         | 27.009ms    | 24.022ms   | -12.43% slower  |
| multiply - bigInt         | 33.851ms    | 120.812ms  | 71.98% faster   |
| divide - bigInt           | 77.744ms    | 714.170ms  | 89.11% faster   |
| power of 4 - bigInt       | 248.630ms   | 498.119ms  | 50.09% faster   |
| square root - bigInt      | 16917.234ms | 5955.270ms | -184.07% slower |
| init - bigNumber          | 60.159ms    | 85.812ms   | 29.89% faster   |
| add - bigNumber           | 33.340ms    | 56.803ms   | 41.31% faster   |
| subtract - bigNumber      | 34.255ms    | 54.496ms   | 37.14% faster   |
| multiply - bigNumber      | 50.376ms    | 452.010ms  | 88.86% faster   |
| divide - bigNumber        | 80.627ms    | 1376.583ms | 94.14% faster   |
| power of 4 - bigNumber    | 553.183ms   | 2005.740ms | 72.42% faster   |
| square root - bigNumber   | 17023.515ms | 5104.271ms | -233.52% slower |

Note 1: Square root is slower because it uses Newton's method with variable root(quadratic, cubic, etc.ій) and high precision.
The more precise the result, the more iterations are required.

Node 2: On small numbers big.esm is slower because it uses bigint, which is slower on initialization.
  And each operation returns a new instance of Big, without mutating the original instance.

#### Test data:

```js
const smallIntA = 12345;
const smallIntB = 45678;
const smallNumberA = 12345.67809;
const smallNumberB = 78901.23456;
const bigIntA = "12345678901234567890";
const bigIntB = "67890123456789012345";
const bigNumberA = "12345678901234567890.12345678901234567890"
const bigNumberB = "67890123456789012345.67890123456789012345";
```

Benchmarked on MacBook Pro M1 2021.

Code for benchmarking is in the `benchmark.js` file. You can run it with `npm run benchmark`.

## Roadmap

- [x] Generate documentation from JSDoc
- [ ] Add formatting options and remove trailing zeros from toString method
- [ ] Add more mathematical functions

## License

MIT

## Copyright

© 2023 dschewchenko