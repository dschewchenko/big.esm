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

## Installation

Install `big.esm` using Bun:

```bash
bun add big.esm
```

or npm:

```bash
npm install big.esm
```

or yarn:

```bash
yarn add big.esm
```

## Usage

```js
import { addBig, cloneBig, createBig } from "big.esm";

const a = createBig("12345678910.12345678910");
const b = createBig("9876543210.9876543210");

addBig(a, b);
console.log(a.toString()); // 22222222121.1111111101

// If you need immutability, clone first:
const c = cloneBig(a);
addBig(c, b);
```

Pipeline (chainable, mutates its internal `Big`):

```js
import { pipeBig } from "big.esm";

console.log(
  pipeBig("1.5e3").add(500).div(2, 0, "down").toString()
); // 1000
```

## Benchmarks

More info - [BENCHMARK.md](https://github.com/dschewchenko/big.esm/blob/main/BENCHMARK.md)

- **Speed (ops)**: `big.esm v2` vs `big.js` — `26.26x faster` (median; min `2.17x`, max `154.43x`) → `2.26x faster` than `big.esm v1` (mutable mode; median `11.63x` vs `big.js`).
- **Speed (pipeBig)**: `pipeBig` vs `big.js` — `29.8x faster` (median; min `2.84x`, max `148.27x`).
- **Size (full)**: `big.esm v2` — `5.25 KB` minified / `1.87 KB` brotli (≈`1.30x` / `1.46x` smaller than `big.js`).
- **Size (pipe-only)**: `bigPipe (v2)` — `4.40 KB` minified / `1.62 KB` brotli (≈`1.55x` / `1.68x` smaller than `big.js`).

## Compatibility

`big.esm` is compatible with all modern browsers, Bun 1.0+, and Node.js 16+. It uses `BigInt` internally, so it is not compatible with older runtimes. On info from [caniuse.com](https://caniuse.com/#feat=bigint) `BigInt` is supported by 98.84% of all browsers(as of 2025-12-18).

## Notes

- `big.esm` is not a drop-in replacement for `big.js`. It does not support the same API and does not have the same functionality. It is a completely different library.


## Breaking changes (v2)

Starting from v2, the library is **mutable-first** to stay **small and fast** (fewer allocations, less GC, no runtime "clone vs mutate" checks in hot paths):

- Arithmetic helpers (`addBig`, `subBig`, `mulBig`, `divBig`, `modBig`, `powBig`, `sqrtBig`, `absBig`) **mutate the first argument** and return it.
- `alignScale(a, b)` **mutates** the operand with the smaller scale.
- `minBig`/`maxBig` return **one of the inputs** (no cloning).
- `pipeBig(big)` / `new BigPipe(big)` **new** api, **mutates** the passed `Big`.

If these changes are breaking for your codebase, clone before calling operations (`cloneBig(a)`) or adjust your code to work with mutation.

## API

More information in the [documentation](https://dschewchenko.github.io/big.esm/).

### Core

#### `createBig(value: BigValue, scale?: number | string): Big`

Creates a `Big` instance from a `string`, `number`, `bigint`, `Big`, or `BigObject`. Preferred constructor helper. 

The scale is the number of digits to the right of the decimal point. If the scale is not specified, it will be calculated automatically, otherwise the number will be rounded to integer.

### Utilities

#### `cloneBig(a: Big): Big`

Creates a new `Big` instance from another `Big` instance.

#### `alignScale(a: Big, b: Big): [Big, Big]`

Aligns the scale of two `Big` instances by mutating the one with the smaller scale. The scale of the result will be equal to the maximum scale of the two numbers

#### `isNumericValue(value: any): boolean`

Checks if the value is a valid numeric value for creating a `Big` instance.

### Mathematical operations

Math operations mutate the first argument and return it.

#### `addBig(a: Big, b: Big): Big`

Adds `b` to `a` (mutates `a`).

#### `subBig(a: Big, b: Big): Big`

Subtracts `b` from `a` (mutates `a`).

#### `mulBig(a: Big, b: Big): Big`

Multiplies `a` by `b` (mutates `a`).

#### `divBig(a: Big, b: Big, precision = 20, roundingMode = "half-up"): Big`

Divides `a` by `b` (mutates `a`).

#### `modBig(a: Big, b: Big): Big`

Calculates `a % b` (mutates `a`).

#### `powBig(a: Big, exp: number): Big`

Raises `a` to `exp` (mutates `a`).

#### `sqrtBig(a: Big, root = 2, precision = 20): Big`

Calculates the root of `a` (mutates `a`).

#### `absBig(a: Big): Big`

Replaces `a` with `|a|` (mutates `a`).

#### `compareBig(a: Big, b: Big): -1 | 0 | 1`

Compares two `Big` instances. Returns `-1` if `a < b`, `0` if `a == b` and `1` if `a > b`.

#### `minBig(a: Big, b: Big): Big`

Returns the minimum of `a` and `b` by reference (no cloning).

#### `maxBig(a: Big, b: Big): Big`

Returns the maximum of `a` and `b` by reference (no cloning).

### Pipeline

#### `pipeBig(initial: BigValue): BigPipeline`

Creates a chainable pipeline that mutates its internal `Big` in-place.

#### `new BigPipe(initial: BigValue): BigPipe`

Class form of the pipeline.

## Roadmap

- [x] Generate documentation from JSDoc
- [x] Remove trailing zeros from toString method
- [ ] Add formatting options
- [ ] Add more mathematical functions

## License

MIT

## Copyright

© 2023 dschewchenko
