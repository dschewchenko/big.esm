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
import { add, addInPlace, createBig, pipe } from "big.esm";

const total = add("0.1", "0.2");
console.log(total.toString()); // "0.3"

const balance = createBig("1.00");
const next = add(balance, "0.25");
console.log(next.toString(), balance.toString()); // "1.25" "1"

addInPlace(balance, "0.25");
console.log(balance.toString()); // "1.25"

console.log(pipe("1.03").roundToStep("0.05").toFixed(2)); // "1.05"
```

Pass decimal literals as strings to preserve all their digits. A JavaScript expression like `0.1 + 0.2` has already rounded before `createBig` receives it.

`pipe(existingBig)` starts with a copy. `pipeInPlace(existingBig)` updates the supplied instance as the chain runs. Pipeline methods accept decimal values directly.

Use `big.esm` for the public API. Deep ESM imports for public operation and utility modules work with or without `.js`, for example `big.esm/dist/operations/add`.

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


## Choosing whether to mutate

In v1, `addBig(a, b, mutable = false)` returned a new result by default. The [v2.0.0 breaking change](https://github.com/dschewchenko/big.esm/releases/tag/v2.0.0) removed the flag. Since v2, `addBig(a, b)` updates `a` and returns it. JavaScript calls with a third argument still update `a`, even when that argument is `false`.

In v3.2, use `add(a, b)` for a new result or `addInPlace(a, b)` to update `a` explicitly. The legacy mutating names are deprecated and retain their behavior.

`pipeBig(big)` and `new BigPipe(big)` reuse `big`. Use `pipe(big)` or `pipeInPlace(big)` to choose ownership at the start of the chain. `createBig(existingBig)` reuses its input, and `cloneBig(existingBig)` makes a copy.

## API

More information in the [documentation](https://dschewchenko.github.io/big.esm/).

### Core

#### `createBig(value: BigValue, scale?: number | string): Big`

Creates a `Big` instance from a `string`, `number`, `bigint`, `Big`, or `BigObject`. Preferred constructor helper. 

The number is stored as an integer coefficient times `10 ** -scale`. The scale must be a safe integer and can be negative. An omitted scale is inferred from the input. If you pass a scale with a primitive input, the input is truncated toward zero to obtain the integer coefficient before applying the scale. For example, `createBig("1.5e3", 2)` represents `15`, and `createBig(1n, -2)` represents `100`. Structural inputs use the exported `BigObject` type with a `bigint` coefficient and a numeric scale.

Keep `scale` a safe integer when writing it directly. Operations and formatters reject invalid scales before using them.

`valueOf()` exposes the integer coefficient. For `createBig("1.23")`, `valueOf()` returns `123n` and `Number(...)` returns `123`. Use `toString()` for the full decimal value. `new Big(existingBig)` creates a copy.

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

#### `toPrecision(value: BigValue, significantDigits: number, roundingMode = "half-up"): string`

Formats the input to 1–1,000,000 significant digits, including trailing zeros. For example, `toPrecision("45.6", 5)` returns `"45.600"`. It uses scientific notation when the rounded exponent is at most −7, at least 21, or at least `significantDigits`.

#### `toNumber(value: BigValue): number`

Converts the full decimal value to a JavaScript number. `toNumber("1.23")` returns `1.23`. JavaScript rounding applies, with `Infinity` or `-Infinity` for overflow and signed zero for underflow.

#### `serializeBig(value: BigValue): SerializedBig` · `deserializeBig(data: unknown): Big`

Round-trip a value as a JSON-safe coefficient string and scale. This preserves the stored scale, including trailing zeros and large compact exponents.

```js
import { deserializeBig, serializeBig, toExponential } from "big.esm";

const json = JSON.stringify(serializeBig("3e10000000000"));
const restored = deserializeBig(JSON.parse(json));
toExponential(restored); // "3e+10000000000"
```

### Mathematical operations

Pure operations return a new `Big`. Each `InPlace` variant takes a `Big` as its first argument, updates it, and returns that instance. Other decimal arguments accept a string, number, bigint, `Big`, or `BigObject`.

| Pure | Updates the first `Big` |
| --- | --- |
| `add(a, b)` | `addInPlace(a, b)` |
| `sub(a, b)` | `subInPlace(a, b)` |
| `mul(a, b)` | `mulInPlace(a, b)` |
| `div(a, b, precision?, roundingMode?)` | `divInPlace(a, b, precision?, roundingMode?)` |
| `divCompact(a, b, maxDecimalPlaces?, roundingMode?)` | `divCompactInPlace(a, b, maxDecimalPlaces?, roundingMode?)` |
| `mod(a, b)` | `modInPlace(a, b)` |
| `abs(a)` | `absInPlace(a)` |
| `pow(a, exp?)` | `powInPlace(a, exp?)` |
| `sqrt(a, root?, precision?)` | `sqrtInPlace(a, root?, precision?)` |
| `round(a, decimalPlaces?, roundingMode?)` | `roundInPlace(a, decimalPlaces?, roundingMode?)` |
| `roundToStep(a, step, roundingMode?)` | `roundToStepInPlace(a, step, roundingMode?)` |

#### `sumBig(values: Iterable<BigValue>): Big`

Sums any iterable of decimal inputs without mutating its items. An empty iterable returns zero. `sumBig(["0.1", "0.2", 1n])` produces `1.3`.

#### Division

`div` divides at the requested decimal scale. `divCompact` uses a compact scale for terminating results that fit within the requested precision. Repeating quotients and longer fractions are rounded once. `divCompact(1, 8)` yields `0.125` with scale 3. `divCompact(1, 3, 4)` yields `0.3333`. Precision ranges from 0 to 1,000,000 places and defaults to 20.

Both division functions limit scale expansion to 2,000,000 places and throw `RangeError` before a calculation exceeds that limit. `toFixed` uses the same bound for added zeros. Within those bounds, existing coefficients and output strings remain subject to the runtime's limits.

```js
import { createCompactBig, divCompact, toExponential } from "big.esm";

const value = createCompactBig("3e10000000000");
console.log(toExponential(divCompact(value, 2))); // "1.5e+10000000000"
```

#### Rounding

`round` keeps at most the requested number of decimal places, which must be a non-negative safe integer and defaults to zero. `roundToStep` rounds to a multiple of a positive step at the step's scale. `roundToStep("1.03", "0.05")` gives `1.05`. In `half-even` mode, an exact tie selects an even multiple of the step. Scale alignment uses the same expansion limit as division.

Division, rounding and fixed-point formatting default to `half-up` (ties away from zero). They also accept `half-even` (ties to even), `down` (toward zero), `up` (away from zero), `floor` (toward negative infinity) and `ceil` (toward positive infinity).

#### Absolute value, remainder, powers and roots

`abs` computes the absolute value. `mod` calculates the remainder using the sign of the dividend. `pow` raises a value to a non-negative safe integer exponent and defaults to 2. `sqrt` computes the real root of safe integer degree at least 2 and defaults to the square root. Degree 1 is also accepted for zero and for `1` stored with scale `0`. Odd roots accept negative inputs. The result is rounded to the requested decimal places with ties away from zero. Precision defaults to 20.

#### `compare(a: BigValue, b: BigValue): -1 | 0 | 1`

Compares exact decimal values. Returns `-1` if `a < b`, `0` if `a == b` and `1` if `a > b`.

#### `minBig(a: Big, b: Big): Big`

Returns the minimum of `a` and `b` by reference (no cloning).

#### `maxBig(a: Big, b: Big): Big`

Returns the maximum of `a` and `b` by reference (no cloning).

### Pipeline

#### `pipe(initial: BigValue): BigPipe`

Creates a chain with its own working value. Use `.roundToStep(step, roundingMode)` for step rounding. Finish with `.toFixed(places)`, `.toPrecision(digits)`, or `.toNumber()`.

#### `pipeInPlace(initial: Big): BigPipe`

Creates a chain that updates the supplied `Big` instance.

## Roadmap

- [x] Generate documentation from JSDoc
- [x] Remove trailing zeros from toString method
- [x] Add fixed-point and scientific formatting
- [ ] Add more mathematical functions

## License

MIT

## Copyright

© 2023 dschewchenko
