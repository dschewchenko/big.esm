# big.esm

[![npm version](https://img.shields.io/npm/v/big.esm.svg)](https://www.npmjs.com/package/big.esm)
[![npm downloads](https://img.shields.io/npm/dw/big.esm)](https://www.npmjs.com/package/big.esm)

Library for working with large numbers and fractions using `BigInt`.
It provides advanced functionality for performing arithmetic operations with precision and decimal handling.
[Documentation](https://dschewchenko.github.io/big.esm/).

**ESM only.** Starting with v3, this package ships ESM exclusively. Future releases will use ESM.
If you are upgrading from v2, replace `require("big.esm")` with a static or dynamic `import`.

- Tests cover arithmetic, parsing, and package exports.
- No dependencies.
- Arbitrary precision within the runtime's limits for integer arithmetic and string output.
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

To compare two separately built ESM artifacts using isolated processes and alternating execution order:

```bash
bun run benchmark:compare --baseline /path/to/baseline/big.esm.js --current /path/to/current/big.esm.js --repeats 5
node --expose-gc benchmarks/benchmark.js --baseline /path/to/baseline/big.esm.js --current /path/to/current/big.esm.js --repeats 5
```

The default benchmark prepares fresh operands before timing. Use `--mode end-to-end` to include operand construction and measure retained heap after garbage collection. Both modes validate against `big.js` and report peak process RSS, which includes the runtime. The benchmark prints JSON without rewriting documentation or deleting past results.

`BENCHMARK.md` also includes historical results for v1 and v2 and explains the measurement methods.

## Compatibility

`big.esm` requires a browser with [BigInt support](https://caniuse.com/#feat=bigint), Bun 1.0+, or Node.js 16+.

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

The number is stored as an integer coefficient times `10 ** -scale`. The scale must be a safe integer and can be negative. An omitted scale is inferred from the input. If you pass a scale with a primitive input, the input is truncated toward zero to obtain the integer coefficient before applying the scale. For example, `createBig("1.5e3", 2)` represents `15`, and `createBig(1n, -2)` represents `100`. Structural inputs use the exported `BigObject` type with a `bigint` coefficient and a numeric scale.

Keep `scale` a safe integer when writing it directly. Operations and formatters reject invalid scales before using them.

#### `createCompactBig(value: PossibleNumber): Big`

Parses a number without expanding a positive exponent into trailing zeros. `createCompactBig("3e10000000000")` stores `3n` with scale `-10000000000`. Use `toExponential` to display large exponents compactly.

### Utilities

#### `cloneBig(a: Big): Big`

Creates a new `Big` instance from another `Big` instance.

#### `alignScale(a: Big, b: Big): [Big, Big]`

Aligns the scale of two `Big` instances by mutating the one with the smaller scale. The scale of the result will be equal to the maximum scale of the two numbers

#### `isNumericValue(value: any): boolean`

Accepts a `bigint`, a JavaScript `number`, or a string that `Number` can convert without returning `NaN`.

#### `isDecimalInput(value: unknown): value is PossibleNumber`

Checks for a `bigint`, a finite number, or a decimal string with a safe exponent and scale. It checks syntax and bounds without expanding the number. Construction and fixed-point display are still subject to the runtime's BigInt and string limits.

#### `toFixed(a: Big, decimalPlaces = 0, roundingMode = "half-up"): string`

Formats the number with exactly the requested number of decimal places, including trailing zeros. It leaves `a` unchanged. The range is 0 to 1,000,000 places. For example, `toFixed(createBig("1.005"), 2, "half-even")` returns `"1.00"`.

#### `toExponential(a: Big): string`

Formats the exact value in scientific notation without mutating `a`. For example, `toExponential(createBig("1e-10000000000"))` returns `"1e-10000000000"` without expanding the exponent.

### Mathematical operations

Math operations mutate the first argument and return it.

#### `addBig(a: Big, b: Big): Big`

Adds `b` to `a` (mutates `a`).

#### `subBig(a: Big, b: Big): Big`

Subtracts `b` from `a` (mutates `a`).

#### `mulBig(a: Big, b: Big): Big`

Multiplies `a` by `b` (mutates `a`).

#### `divBig(a: Big, b: Big, precision = 20, roundingMode = "half-up"): Big`

Divides `a` by `b` in place at the requested decimal scale. Precision ranges from 0 to 1,000,000 places.

#### `divCompactBig(a: Big, b: Big, maxDecimalPlaces = 20, roundingMode = "half-up"): Big`

Divides `a` by `b` in place and uses a compact scale for terminating results that fit within the requested precision. Repeating quotients and longer fractions are rounded once. `1 / 8` yields `0.125`. `1 / 3` with four places yields `0.3333`.

Both division functions limit scale expansion to 2,000,000 places and throw `RangeError` before a calculation exceeds that limit. `toFixed` uses the same bound for added zeros. Within those bounds, existing coefficients and output strings remain subject to the runtime's limits.

```js
import { createBig, createCompactBig, divCompactBig, toExponential } from "big.esm";

const value = createCompactBig("3e10000000000");
divCompactBig(value, createBig(2));
console.log(toExponential(value)); // "1.5e+10000000000"
```

#### `roundBig(a: Big, decimalPlaces = 0, roundingMode = "half-up"): Big`

Rounds `a` in place to at most the requested number of decimal places. The number of places must be a non-negative safe integer.

#### `roundToIncrement(a: Big, step: Big, roundingMode = "half-up"): Big`

Rounds `a` in place to a multiple of a positive `step` at the step's scale. For example, rounding `1.03` to a step of `0.05` gives `1.05`. In `half-even` mode, an exact tie selects an even multiple of the step. Scale alignment uses the same expansion limit as division.

Division, rounding and fixed-point formatting accept `half-up` (ties away from zero), `half-even` (ties to even), `down` (toward zero), `up` (away from zero), `floor` (toward negative infinity) and `ceil` (toward positive infinity).

#### `modBig(a: Big, b: Big): Big`

Calculates `a % b` (mutates `a`).

#### `powBig(a: Big, exp: number): Big`

Raises `a` to a non-negative safe integer exponent (mutates `a`).

#### `sqrtBig(a: Big, root = 2, precision = 20): Big`

Calculates the real integer-degree root of `a` (mutates `a`). The degree must be a safe integer of at least 2. Degree 1 is also accepted for zero and for `1` stored with scale `0`. Odd roots accept negative inputs. Results are rounded to the requested number of decimal places, with ties away from zero.

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

Creates a chainable pipeline that mutates its internal `Big` in place. Use `.round(decimalPlaces, roundingMode)` to round the current value.

#### `new BigPipe(initial: BigValue): BigPipe`

Class form of the pipeline.

## Roadmap

- [x] Generate documentation from JSDoc
- [x] Remove trailing zeros from toString method
- [x] Add fixed-point and scientific formatting
- [ ] Add more mathematical functions

## License

MIT

## Copyright

© 2023 dschewchenko
