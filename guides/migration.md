---
title: Upgrading to 3.2
category: Guides
---

# Upgrading to 3.2

Version 3 keeps the ESM-only package format introduced in v3.0. Version 3.2 adds pure operations, explicit mutating variants and an operator pipeline entry. It keeps the existing root imports and older mutating names.

## Use ESM imports

`big.esm` is ESM-only. An ES module can use a named import.

```js
import { add, createBig } from "big.esm";

const total = add(createBig("1.20"), "0.30");
console.log(total.toString()); // "1.5"
```

Public operation and utility files under `dist` support deep ESM imports with or without the `.js` extension.

```ts
import { addInPlace } from "big.esm/dist/operations/add";
import { addInPlace as addWithExtension } from "big.esm/dist/operations/add.js";
import { createBig } from "big.esm";

addInPlace(createBig(1), 2);
addWithExtension(createBig(1), 2);
```

Prefer named imports from `big.esm` for the general API. Use a deep path when a bundler entry or an existing import already depends on that module.

From a CommonJS module, load the package with dynamic `import()`.

```js
async function calculate() {
  const { add } = await import("big.esm");
  return add("1.2", "0.3").toString();
}
```

The package needs a runtime with native `BigInt`. It has no runtime dependencies.

## Make mutation explicit

Legacy helpers such as `addBig` and `subBig` mutate their first argument. Version 3.2 deprecates these names. Use a pure function for a new result or its `InPlace` variant to update a `Big`.

```ts
import { add, addBig, addInPlace, createBig } from "big.esm";

const balance = createBig("1.00");
const next = add(balance, "0.25");
next.toString(); // "1.25"
balance.toString(false); // "1.00"

addInPlace(balance, "0.25");
balance.toString(false); // "1.25"

addBig(balance, createBig("0.25")); // deprecated alias for addInPlace
balance.toString(); // "1.5"
```

An `InPlace` function requires a `Big` as its first argument and returns that same instance after updating it. Its right-hand input accepts a decimal string, number, bigint, `Big` or `BigObject`.

The optional mutation flag from v1 was removed in v2. JavaScript ignores extra function arguments, so an old call such as `addBig(a, b, false)` still mutates `a`. Replace it with `add(a, b)`.

## Choose ownership for pipelines

`pipe(big)` copies an existing `Big`. `pipeInPlace(big)` updates it. The deprecated `pipeBig(big)` also updates the supplied instance.

```ts
import { createBig, pipe, pipeInPlace } from "big.esm";

const balance = createBig("10.00");
const copy = pipe(balance).add("2").value();
copy.toString(); // "12"
balance.toString(); // "10"

pipeInPlace(balance).add("2");
balance.toString(); // "12"
```

`createBig(existingBig)` also reuses its argument. Use `cloneBig(existingBig)` when you need an independent value before mutating operations.

## Compose reusable steps

Import configured operator functions from `big.esm/pipe`. This `pipe` takes an initial value and its configured operations together, then returns a `Big`.

```ts
import { add as addStep, mul, pipe as apply, sub } from "big.esm/pipe";

const discount = [mul("0.9"), addStep("5")];
const adjustments = [sub(2)];

apply("100", ...discount, ...adjustments).toString(); // "93"
```

See [compose decimal calculations](pipelines.md) for groups and parenthesized expressions. See [decimal precision](precision.md) for rounding and output formatting.

## Replace custom formatting

Use `toFixed` for display, `toNumber` for JavaScript APIs that expect a number and `serializeBig` for JSON that preserves scale.

```ts
import { createBig, serializeBig, toFixed, toNumber } from "big.esm";

const value = createBig("12.50");
toFixed(value, 2); // "12.50"
toNumber(value); // 12.5
JSON.stringify(serializeBig(value)); // '{"value":"1250","scale":2}'
```
