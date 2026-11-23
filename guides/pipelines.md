---
title: Composing pipelines
category: Guides
---

# Composing pipelines

Use the fluent pipeline from `big.esm` when a calculation reads naturally as one chain. Use configured operators from `big.esm/pipe` when you want to name, group or reuse steps.

## Build a reusable operator group

Each operator binds its input once. `pipe` copies its initial value, applies operators from left to right and returns a `Big`.

```ts
import { add, mul, pipe, sub } from "big.esm/pipe";

const pricing = [mul("0.9"), add("5")];
const finalize = [sub(2)];

pipe("100", ...pricing, ...finalize).toString(); // "93"
pipe("200", ...pricing, ...finalize).toString(); // "183"
```

Keep groups as ordinary arrays and spread them wherever needed.

```ts
import { toFixed } from "big.esm";
import { add, mul, pipe } from "big.esm/pipe";

const applyTaxAndFee = [mul("1.2"), add("2.50")];
const total = pipe("40.00", ...applyTaxAndFee);

toFixed(total, 2); // "50.50"
```

## Write grouped subexpressions

To express parentheses, calculate each subexpression and pass the returned `Big` as an operand.

```ts
import { toFixed } from "big.esm";
import { add, mul, pipe, sub } from "big.esm/pipe";
const subtotal = pipe("1.20", add("0.30")); // 1.5
const quantity = pipe("10", sub(2)); // 8
const total = pipe(subtotal, mul(quantity)); // (1.20 + 0.30) × (10 - 2)
const tax = pipe(subtotal, mul("0.2"));
const withTax = pipe(total, add(tax));

toFixed(total, 2); // "12.00"
toFixed(withTax, 2); // "12.30"
total.toString(); // "12"
subtotal.toString(); // "1.5"
tax.toString(); // "0.3"
withTax.toString(); // "12.3"
```

## Choose a pipeline style

`pipe` in the root entry creates a fluent chain with its own copy. Use `pipeInPlace` when you want the chain to update an existing `Big`.

```ts
import { createBig, pipe, pipeInPlace } from "big.esm";

pipe("1.03").roundToStep("0.05").toFixed(2); // "1.05"

const input = createBig("1.03");
pipeInPlace(input).roundToStep("0.05");
input.toString(); // "1.05"
```

`pipe` from `big.esm/pipe` runs configured operators in one call. Pass the result directly as an operand or use it to start another pipeline. Give the two imports aliases when you use both styles.

```ts
import { pipe as chain } from "big.esm";
import { add, pipe as apply } from "big.esm/pipe";

chain("1.03").roundToStep("0.05").toFixed(2); // "1.05"
apply("1.03", add("0.02")).toString(); // "1.05"
```

Both `pipe` functions accept decimal strings, numbers, bigints, `Big` values and `BigObject` values. They copy the initial value before applying any steps.

## Set division and rounding explicitly

Set the output scale and rounding rule when creating the division step.

```ts
import { toFixed } from "big.esm";
import { div, pipe } from "big.esm/pipe";

toFixed(pipe("10", div(3, 2, "half-even")), 2); // "3.33"
pipe("1", div(8)).toString(); // "0.125"
```

See [Precision and rounding](precision.md) for rounding modes, formatting and limits.

## Reuse operands safely

An operator group can be applied repeatedly. If an operator was created with a `Big` operand, it reads that operand when each pipeline runs. Keep the operand unchanged while applying the group if every result must use the same value.

```ts
import { createBig } from "big.esm";
import { mul, pipe } from "big.esm/pipe";

const multiplier = createBig("1.5");
const scaleByMultiplier = [mul(multiplier)];

pipe("2", ...scaleByMultiplier).toString(); // "3"
pipe("4", ...scaleByMultiplier).toString(); // "6"
```
