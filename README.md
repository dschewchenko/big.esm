# big.esm

Library for working with large numbers and fractions using `BigInt`.
It provides advanced functionality for performing arithmetic operations with precision and decimal handling.
[Documentation](https://dschewchenko.github.io/big.esm/).

100% test coverage.

No dependencies.

No limitations on the size of the numbers, except for the limitations of `BigInt`, so limited by system memory =).

Fully written in TypeScript, so it provides type definitions out of the box.

Tree-shaking is supported. 

Full bundle size(ES) — 5.48 kB minified and 1.98 kB gzipped.
`sqrtBig` and `powBig` are half of this size.

Full bundle size(UMD) — 3.52 kB minified and 1.58 kB gzipped.

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

#### `createBig(value: string | number | bigint): Big`

Alias for `new Big(value)`.
But it does not support the scale parameter and if the value is instance of `Big` it will be returned without changes.

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

#### `divBig(a: Big, b: Big): Big`

Divides two `Big` instances.

#### `modBig(a: Big, b: Big): Big`

Calculates the remainder of dividing two `Big` instances.

#### `powBig(a: Big, b: Big): Big`

Raises `a` to the power of `b`.

#### `sqrtBig(a: Big): Big`

Calculates the square root of `a`.

#### `absBig(a: Big): Big`

Returns the absolute value of `a`.

#### `compareBig(a: Big, b: Big): -1 | 0 | 1`

Compares two `Big` instances. Returns `-1` if `a < b`, `0` if `a == b` and `1` if `a > b`.

## Benchmark

Compare `big.esm` with `big.js`. 100_000 iterations for each operation.

| Operation | big.esm | big.js | Difference |
| --- | --- | --- | --- |
| init - smallInt | 40.538ms | 23.042ms | -75.93% slower |
| add - smallInt | 25.755ms | 15.443ms | -66.77% slower |
| subtract - smallInt | 22.998ms | 15.419ms | -49.15% slower |
| multiply - smallInt | 22.684ms | 19.931ms | -13.81% slower |
| divide - smallInt | 67.082ms | 182.769ms | 63.30% faster |
| power of 4 - smallInt | 115.589ms | 40.343ms | -186.51% slower |
| init - smallNumber | 45.344ms | 37.790ms | -19.99% slower |
| add - smallNumber | 21.636ms | 22.357ms | 3.23% faster |
| subtract - smallNumber | 21.750ms | 24.691ms | 11.91% faster |
| multiply - smallNumber | 23.852ms | 35.742ms | 33.27% faster |
| divide - smallNumber | 61.577ms | 194.170ms | 68.29% faster |
| power of 4 - smallNumber | 137.407ms | 70.480ms | -94.96% slower |
| init - bigInt | 51.163ms | 37.148ms | -37.73% slower |
| add - bigInt | 27.229ms | 25.447ms | -7.00% slower |
| subtract - bigInt | 27.146ms | 24.872ms | -9.14% slower |
| multiply - bigInt | 33.915ms | 124.638ms | 72.79% faster |
| divide - bigInt | 81.944ms | 624.192ms | 86.87% faster |
| power of 4 - bigInt | 251.438ms | 512.083ms | 50.90% faster |
| init - bigNumber | 57.123ms | 77.780ms | 26.56% faster |
| add - bigNumber | 30.457ms | 49.525ms | 38.50% faster |
| subtract - bigNumber | 30.979ms | 49.906ms | 37.93% faster |
| multiply - bigNumber | 41.303ms | 271.533ms | 84.79% faster |
| divide - bigNumber | 81.252ms | 940.948ms | 91.36% faster |
| power of 4 - bigNumber | 375.813ms | 1281.233ms | 70.67% faster |

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