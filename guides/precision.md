---
title: Precision and rounding
category: Guides
---

# Precision and rounding

## Keep decimal inputs exact

Pass decimal text as a string when the written digits matter.

```ts
import { add } from "big.esm";

add("0.1", "0.2").toString(); // "0.3"
```

A JavaScript `number` is already a binary floating-point value. The library reads the number's decimal string, so precision lost before the call cannot be recovered. Use strings for decimal literals and calculations that must preserve all entered digits.

## How a value is stored

A `Big` stores an integer coefficient and a safe-integer `scale`. Its value is `coefficient × 10 ** -scale`. For example, `"1.2300"` is stored as `12300n` with scale `4`. Trailing zeros are preserved internally. `toString()` trims them by default.

```ts
import { createBig } from "big.esm";

const price = createBig("1.2300");
price.value; // 12300n
price.scale; // 4
price.toString(); // "1.23"
price.toString(false); // "1.2300"
```

Scale may be negative to represent large powers of ten compactly. Prefer `createCompactBig` when a positive exponent would otherwise expand into many zeros.

The optional scale in `createBig(value, scale)` sets the stored scale after the input's fractional digits have been discarded. For example, `createBig("123.456", 2)` stores `123n` at scale `2`, so it represents `1.23`. Scale must be a safe integer.

## Choose division precision per call

Addition, subtraction and multiplication operate on exact decimal coefficients. Division rounds repeating quotients to a finite number of places. `div` defaults to 20 decimal places with `half-up` rounding. Set the places and rule on each call.

```ts
import { div } from "big.esm";

div("1", "8").toString(false); // "0.12500000000000000000"
div("1", "3", 4).toString(); // "0.3333"
div("1", "3", 4, "down").toString(false); // "0.3333"
div("-10", "3", 2, "up").toString(); // "-3.34"
```

`divCompact` keeps a terminating quotient's exact decimal scale when it fits within its `maxDecimalPlaces` argument. Otherwise it rounds to that maximum. Its default maximum is also 20 places.

```ts
import { divCompact } from "big.esm";

divCompact("1", "8").toString(); // "0.125"
divCompact("1", "3", 4).toString(); // "0.3333"
```

Use `createCompactBig` and `toExponential` to keep large exponents compact from input to output.

```ts
import { createCompactBig, divCompact, serializeBig, toExponential } from "big.esm";

const huge = createCompactBig("3e10000000000");
toExponential(huge); // "3e+10000000000"
toExponential(divCompact(huge, 2)); // "1.5e+10000000000"

JSON.stringify(serializeBig(huge)); // {"value":"3","scale":-10000000000}
```

## Select a rounding rule

The same six rules are accepted by division, rounding and fixed-place formatting.

| Rule | Tie handling and direction |
| --- | --- |
| `half-up` | Nearest value, ties away from zero |
| `half-even` | Nearest value, ties to an even last retained digit |
| `down` | Toward zero |
| `up` | Away from zero |
| `floor` | Toward negative infinity |
| `ceil` | Toward positive infinity |

```ts
import { round } from "big.esm";

round("1.245", 2, "half-up").toString(); // "1.25"
round("1.245", 2, "half-even").toString(); // "1.24"
round("-1.241", 2, "floor").toString(); // "-1.25"
round("-1.241", 2, "ceil").toString(); // "-1.24"
```

`round(value, places)` rounds to at most that many fractional places. It defaults to zero places and `half-up`. `roundToStep(value, step)` rounds to a multiple of a positive step, such as `roundToStep("1.03", "0.05")`, which returns `1.05`.

## Format for the destination

`toString()` trims fractional trailing zeros. Use `toFixed` when a protocol, report or user interface needs a fixed number of places. Both return text and leave the value intact.

```ts
import { createBig, toFixed, toPrecision } from "big.esm";

toFixed(createBig("1.2"), 2); // "1.20"
toFixed(createBig("1.005"), 2, "half-even"); // "1.00"
toPrecision("123.456", 4); // "123.5"
toPrecision("0.00000123", 4); // "0.000001230"
```

Use `toNumber` only when the consumer expects JavaScript floating-point arithmetic. It converts the decimal value to the nearest representable `number`, so it cannot preserve arbitrary precision.

## Limits

The scale itself must be a safe integer. `div`, `divCompact` and `toFixed` accept up to 1,000,000 decimal places. `toPrecision` accepts up to 1,000,000 significant digits. Division and step rounding can reject scale alignment beyond 2,000,000 decimal places. Fixed-point output also rejects a request that would add over 2,000,000 zeros.

`sumBig` combines terms at nearby scales before aligning distant groups. This allows terms to cancel without expanding an intermediate coefficient. If the exact result still requires expansion, the runtime's BigInt limits apply.

`sqrt(value, degree, precision)` accepts a non-negative safe-integer precision. The library can compute some roots with large scale gaps without expanding the coefficient. Other root calculations stay subject to the runtime's BigInt limits.

`pow` accepts a non-negative safe-integer exponent and rejects an unsafe resulting scale. Other large operations remain subject to the JavaScript runtime's BigInt and memory limits. String formatting needs memory proportional to the number of characters returned. Use `createCompactBig` and `toExponential` when fixed notation would require many zeros.

`isDecimalInput` checks decimal syntax and safe decimal scale/exponent without expanding the input. Number inputs must be finite. `isNumericValue` follows JavaScript's `Number` conversion and can accept hexadecimal strings or non-finite numbers. Use `isDecimalInput` to pre-check values intended for `Big`.
