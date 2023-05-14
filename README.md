# big.esm

[![npm version](https://img.shields.io/npm/v/big.esm.svg)](https://www.npmjs.com/package/big.esm)
[![npm downloads](https://img.shields.io/npm/dw/big.esm)](https://www.npmjs.com/package/big.esm)

Library for working with large numbers and fractions using `BigInt`.
It provides advanced functionality for performing arithmetic operations with precision and decimal handling.
[Documentation](https://dschewchenko.github.io/big.esm/).

100% test coverage.

No dependencies.

No limitations on the size of the numbers, except for the limitations of `BigInt`, so limited by system memory =).

Fully written in TypeScript, so it provides type definitions out of the box.

Tree-shaking is supported. 

Full bundle size(ESM) — 3.12 kB minified and 1.42 kB gzipped.
`powBig` operation is half of this size, 1.5kB/0.7kB(minified/gzip),
because it's big and reuses most of the operations from `big.esm`.

Full bundle size(UMD) — 3.43 kB minified and 1.57 kB gzipped.

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

| Operation                | big.esm   | big.js     | Difference      |
|--------------------------|-----------|------------|-----------------|
| init - smallInt          | 39.856ms  | 22.169ms   | -79.78% slower  |
| add - smallInt           | 24.227ms  | 15.125ms   | -60.17% slower  |
| subtract - smallInt      | 22.181ms  | 15.094ms   | -46.95% slower  |
| multiply - smallInt      | 22.276ms  | 18.538ms   | -20.16% slower  |
| divide - smallInt        | 66.923ms  | 179.699ms  | 62.76% faster   |
| power of 4 - smallInt    | 113.714ms | 39.359ms   | -188.92% slower |
| init - smallNumber       | 44.606ms  | 37.136ms   | -20.12% slower  |
| add - smallNumber        | 21.719ms  | 21.857ms   | 0.63% faster    |
| subtract - smallNumber   | 21.090ms  | 24.064ms   | 12.36% faster   |
| multiply - smallNumber   | 23.246ms  | 35.010ms   | 33.60% faster   |
| divide - smallNumber     | 60.102ms  | 189.603ms  | 68.30% faster   |
| power of 4 - smallNumber | 136.611ms | 68.859ms   | -98.39% slower  |
| init - bigInt            | 50.278ms  | 36.880ms   | -36.33% slower  |
| add - bigInt             | 27.485ms  | 25.402ms   | -8.20% slower   |
| subtract - bigInt        | 27.402ms  | 24.622ms   | -11.29% slower  |
| multiply - bigInt        | 33.650ms  | 121.126ms  | 72.22% faster   |
| divide - bigInt          | 79.523ms  | 602.879ms  | 86.81% faster   |
| power of 4 - bigInt      | 248.514ms | 499.246ms  | 50.22% faster   |
| init - bigNumber         | 55.661ms  | 77.789ms   | 28.45% faster   |
| add - bigNumber          | 29.755ms  | 47.843ms   | 37.81% faster   |
| subtract - bigNumber     | 29.107ms  | 47.313ms   | 38.48% faster   |
| multiply - bigNumber     | 39.976ms  | 266.814ms  | 85.02% faster   |
| divide - bigNumber       | 78.278ms  | 931.610ms  | 91.60% faster   |
| power of 4 - bigNumber   | 376.169ms | 1132.657ms | 66.79% faster   |

#### Test data:

```js
const smallIntA = 123;
const smallIntB = 456;
const smallNumberA = 123.456;
const smallNumberB = 789.012;
const bigIntA = "12345678901234567890";
const bigIntB = "67890123456789012345";
const bigNumberA = "12345678901234567890.1234567890";
const bigNumberB = "67890123456789012345.6789012345";
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