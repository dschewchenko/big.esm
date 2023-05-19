# big.esm

[![npm version](https://img.shields.io/npm/v/big.esm.svg)](https://www.npmjs.com/package/big.esm)
[![npm downloads](https://img.shields.io/npm/dw/big.esm)](https://www.npmjs.com/package/big.esm)

Library for working with large numbers and fractions using `BigInt`.
It provides advanced functionality for performing arithmetic operations with precision and decimal handling.
[Documentation](https://dschewchenko.github.io/big.esm/).

- 100% test coverage.
- No dependencies.
- No limitations on the size of the numbers, except for the limitations of `BigInt`, so limited by system memory =)
- Fully written in TypeScript, so it provides type definitions out of the box.
- Tree-shaking is supported.

Full bundle size(ESM) — 4.16 kB minified and 1.75 kB gzipped.
`sqrtBig` operation is heavy(more than half of bundle), because it reuses most of the operations from `big.esm`.

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

In math operations `mutable` option is used to specify whether to mutate the first argument or create a new instance. By default, a new instance is created.

#### `addBig(a: Big, b: Big, mutable = false): Big`

Adds two `Big` instances.

#### `subBig(a: Big, b: Big, mutable = false): Big`

Subtracts two `Big` instances.

#### `mulBig(a: Big, b: Big, mutable = false): Big`

Multiplies two `Big` instances.

#### `divBig(a: Big, b: Big, precision = 20, roundingMode = "half-up", mutable = false): Big`

Divides two `Big` instances. The default precision is 20. The default rounding mode is "half-up".

#### `modBig(a: Big, b: Big, mutable = false): Big`

Calculates the remainder of dividing two `Big` instances.

#### `powBig(a: Big, exp: number, mutable = false): Big`

Raises `a` to the power of `b`.

#### `sqrtBig(a: Big, root = 2, precision = 20, mutable = false): Big`

Calculates the root of `a`. The default root is 2, which means the square root. The default precision is 20.

#### `absBig(a: Big, mutable = false): Big`

Returns the absolute value of `a`.

#### `compareBig(a: Big, b: Big): -1 | 0 | 1`

Compares two `Big` instances. Returns `-1` if `a < b`, `0` if `a == b` and `1` if `a > b`.

## Benchmark

Benchmark results are available [here](https://dschewchenko.github.io/big.esm/benchmark.html).

## Roadmap

- [x] Generate documentation from JSDoc
- [x] Remove trailing zeros from toString method
- [ ] Add formatting options
- [ ] Add more mathematical functions

## License

MIT

## Copyright

© 2023 dschewchenko
