# big.esm

[![npm version](https://img.shields.io/npm/v/big.esm.svg)](https://www.npmjs.com/package/big.esm)

Decimal arithmetic for JavaScript and TypeScript, built on native `BigInt`. Pass decimal strings directly, set rounding per call and choose when to update a value in place.

Ships as ESM with TypeScript declarations and zero runtime dependencies. [Read the docs](https://dschewchenko.github.io/big.esm/) or browse the [API reference](https://dschewchenko.github.io/big.esm/modules.html).

## Installation

```sh
bun add big.esm
```

With npm, use `npm install big.esm`.

## Quick start

```js
import { add, createBig, div, toFixed } from "big.esm";

console.log(add("0.1", "0.2").toString()); // "0.3"
console.log(div(2, 3, 4, "half-even").toString()); // "0.6667"
console.log(toFixed(createBig("1.005"), 2, "half-even")); // "1.00"
```

Arithmetic accepts decimal strings, finite numbers, bigints, `Big` instances and `BigObject` values. Use strings for digits that must stay exact. A calculation such as `0.1 + 0.2` has already rounded by the time the library receives the number.

## Choosing whether to mutate

Use `add(a, b)` when you need a new result and `addInPlace(a, b)` when you intend to update an existing `Big`. Other arithmetic functions follow the same naming.

```js
import { add, addInPlace, createBig } from "big.esm";

const balance = createBig("12.50");
const total = add(balance, "0.25");
console.log(total.toString(), balance.toString()); // "12.75" "12.5"

addInPlace(balance, "0.25");
console.log(balance.toString()); // "12.75"
```

Legacy helpers such as `addBig` still mutate their first argument. See [Upgrading to 3.2](guides/migration.md) for equivalent calls and copy behavior.

## Pipelines

For a short chain, use `pipe(value)` from `big.esm`. The chain owns a working value. Call `.value()` to get its `Big` or finish with a formatter.

```js
import { pipe } from "big.esm";

console.log(pipe("1.03").roundToStep("0.05").toFixed(2)); // "1.05"
```

Import named operators from `big.esm/pipe` to reuse groups of steps. Bundlers can drop operators and arithmetic code the application never imports.

```js
import { add, mul, pipe, sub } from "big.esm/pipe";

const pricing = [mul("0.9"), add("5")];
const finalize = [sub(2)];
console.log(pipe("100", ...pricing, ...finalize).toString()); // "93"
console.log(pipe("200", ...pricing, ...finalize).toString()); // "183"
```

Steps run from left to right. For `(1.2 + 0.3) × (10 − 2)`, calculate each side with its own pipe and pass the resulting `Big` values into the multiplication. See [Composing pipelines](guides/pipelines.md) for the full example, reuse and the in-place form.

## API at a glance

| Task | Use |
| --- | --- |
| Add, subtract, multiply or find a remainder | `add(a, b)`, `sub(a, b)`, `mul(a, b)`, `mod(a, b)` |
| Divide to a chosen number of places | `div(a, b, places, mode)` |
| Keep an exact terminating quotient compact | `divCompact(a, b, maxPlaces, mode)` |
| Round a value or format it for display | `round(value, places, mode)`, `roundToStep(value, step, mode)`, `toFixed(big, places, mode)` |
| Take an absolute value, power or root | `abs(value)`, `pow(value, exponent)`, `sqrt(value, degree, places)` |
| Compare or sum exact decimals | `compare(a, b)`, `sumBig(values)` |
| Parse, validate or copy | `createBig(value)`, `isDecimalInput(value)`, `cloneBig(value)` |
| Format or convert | `toExponential(big)`, `toPrecision(value, digits, mode)`, `toNumber(value)` |
| Preserve the stored scale through JSON | `serializeBig(value)`, `deserializeBig(data)` |

[Precision and rounding](guides/precision.md) covers precision limits, rounding modes, scientific notation and JSON. Use `toNumber(value)` when an API needs an approximate JavaScript number. `Number(big)` reads only the stored integer coefficient.

## Compatibility

Use named ESM imports with Node.js 16+, Bun 1.0+ or a modern browser with native `BigInt` and ES modules. The package has been checked with Node.js 16 and 26. The [upgrade guide](guides/migration.md) covers the ESM transition and existing deep import paths.

## Benchmarks

For the three-step pricing example above, the operator form bundles to 1,843 B gzip with Bun. The same calculation with the fluent API bundles to 4,728 B. See the [bundle comparison](https://github.com/dschewchenko/big.esm/blob/main/BENCHMARK.md#current-pipe-bundle-size) to reproduce the measurement and see the Vite results.

## License

[MIT](LICENSE) © 2023 dschewchenko
