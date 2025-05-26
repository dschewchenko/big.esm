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

Full bundle size (ESM) — 4.2 kB minified and 1.8 kB gzipped.
`sqrtBig` operation is heavy (more than half of bundle), because it reuses most of the operations from `big.esm`.

## Installation

Install `big.esm` using npm:
    
```bash
npm install big.esm
```

or yarn:

```bash
yarn add big.esm
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

`big.esm` is compatible with all modern browsers and Node.js 10+. It uses `BigInt` internally, so it is not compatible with older browsers and Node.js versions. On info from [caniuse.com](https://caniuse.com/#feat=bigint) `BigInt` is supported by 96.47% of all browsers(as of 2023-06-25).

## Notes

- `big.esm` is not a drop-in replacement for `big.js`. It does not support the same API and does not have the same functionality. It is a completely different library.
- `sqrtBig()` is heavy and slow operation. It's implemented using the Newton's method with nth root calculation. In most cases, there will be no problems.

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

**Note:** In high-load applications, it is recommended to use the `mutable` option to reduce memory usage and improve performance.

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

#### `minBig(a: Big, b: Big, mutable = false): Big`

Returns the minimum of two `Big` instances. If the numbers are equal, returns the first number.

#### `maxBig(a: Big, b: Big, mutable = false): Big`

Returns the maximum of two `Big` instances. If the numbers are equal, returns the first number.

#### `sinBig(angle: Big, precision: number = 30): Big`

Calculates the sine of an angle. The `angle` must be provided in radians as a `Big` instance.
The `precision` argument specifies the number of decimal places in the result. It defaults to 30.

```js
import { createBig, sinBig, PI_BIG } from 'big.esm'; // Assuming PI_BIG is exported or use a string value

// Example: sin(PI/2)
// Note: For precise PI/2, you might need to calculate it or use a high-precision constant
const piHalf = divBig(PI_BIG, createBig(2), 35); // Calculate PI/2 with high precision
const result = sinBig(piHalf, 20); 
console.log(result.toString()); // Expected: close to "1.00000000000000000000"
```

#### `cosBig(angle: Big, precision: number = 30): Big`

Calculates the cosine of an angle. The `angle` must be provided in radians as a `Big` instance.
The `precision` argument specifies the number of decimal places in the result. It defaults to 30.

```js
import { createBig, cosBig, PI_BIG } from 'big.esm';

// Example: cos(PI)
const result = cosBig(PI_BIG, 20);
console.log(result.toString()); // Expected: close to "-1.00000000000000000000"
```

#### `tanBig(angle: Big, precision: number = 30): Big`

Calculates the tangent of an angle. The `angle` must be provided in radians as a `Big` instance.
The `precision` argument specifies the number of decimal places in the result. It defaults to 30.
Throws an error if the cosine of the angle is effectively zero (e.g., for angles like PI/2, 3PI/2).

```js
import { createBig, tanBig, PI_BIG } from 'big.esm';

// Example: tan(PI/4)
const piFourth = divBig(PI_BIG, createBig(4), 35); // Calculate PI/4 with high precision
const result = tanBig(piFourth, 20);
console.log(result.toString()); // Expected: close to "1.00000000000000000000"

// Example: tan(PI/2) - this will throw an error
try {
  const piHalf = divBig(PI_BIG, createBig(2), 35);
  tanBig(piHalf, 20);
} catch (e) {
  console.error(e.message); // "Division by zero in tanBig: cosine is effectively zero."
}
```

#### `logBig(x: Big, precision?: number): Big`

Calculates the natural logarithm (base e) of `x`. The input `x` must be a positive `Big` number.
The optional `precision` argument specifies the number of decimal places in the result (defaults to 30).
Throws an error if `x` is not positive.

```js
import { createBig, logBig, E_BIG } from 'big.esm'; // Assuming E_BIG is exported

const val = createBig("10");
const result = logBig(val, 30); 
// console.log(result.toString()); // Expected: "2.302585092994045684017991454684" (approx)

// Using E_BIG from constants (assuming it's available and has sufficient precision)
const log_e = logBig(E_BIG, 30);
// console.log(log_e.toString()); // Expected: "1.000000000000000000000000000000" (approx)
```

#### `log10Big(x: Big, precision?: number): Big`

Calculates the base-10 logarithm of `x`. The input `x` must be a positive `Big` number.
The optional `precision` argument specifies the number of decimal places in the result (defaults to 30).
Throws an error if `x` is not positive.

```js
import { createBig, log10Big } from 'big.esm';

const val = createBig("100");
const result = log10Big(val, 10);
// console.log(result.toString()); // Expected: "2.0000000000"

const anotherVal = createBig("1000");
const result2 = log10Big(anotherVal); // Uses default precision 30
// console.log(result2.toString()); // Expected: "3.000000000000000000000000000000"
```

### Formatting Output

The `Big` class provides a `toFormat()` method for flexible formatting of its string representation. This method is available on instances of `Big`.

#### `bigInstance.toFormat(options?: FormattingOptions): string`

Returns a string representation of the `Big` number formatted according to the provided options.

**Options (`FormattingOptions` interface):**

This interface defines the options available for formatting:

*   `decimalPlaces?: number`: Specifies the number of digits to display after the decimal point. 
    If undefined, the full scale of the number is used (similar to `toString()`).
    *Example*: `2` for two decimal places.

*   `roundingMode?: 'half-up' | 'truncate' | 'ceil' | 'floor'`: Determines how rounding is performed if `decimalPlaces` requires the number to be truncated or rounded. Defaults to `'half-up'`.
    *   `'half-up'`: Rounds to the nearest neighbor. If equidistant, rounds up (away from zero for positive numbers, towards zero for negative numbers if the implementation rounds magnitude up). More precisely, it rounds to the value with the smallest absolute difference, and if both are equally near, rounds away from zero.
    *   `'truncate'`: Discards digits beyond `decimalPlaces` (truncates towards zero).
    *   `'ceil'`: Rounds towards positive infinity. For positive numbers, this means rounding up if there's a fractional part to remove. For negative numbers, this means rounding towards zero if there's a fractional part.
    *   `'floor'`: Rounds towards negative infinity. For positive numbers, this means truncating. For negative numbers, this means rounding away from zero if there's a fractional part.

*   `thousandsSeparator?: string`: The character used to separate groups of thousands in the integer part of the number. 
    Defaults to an empty string (no separator).
    *Example*: `','` for comma separation.

*   `decimalSeparator?: string`: The character used for the decimal point. Defaults to `'.'`.
    *Example*: `','` for a comma as the decimal separator.

**Examples:**

```javascript
import { createBig } from 'big.esm'; // Or new Big()

const num = createBig("-1234567.8916");

// Example 1: Rounding with 'half-up'
console.log(num.toFormat({ decimalPlaces: 2, roundingMode: 'half-up' })); 
// Output: "-1234567.89" (since .8916, the '1' after '89' is less than 5)

const num2 = createBig("-1234567.8956");
console.log(num2.toFormat({ decimalPlaces: 2, roundingMode: 'half-up' })); 
// Output: "-1234567.90" (since .8956, the '5' after '89' rounds up the magnitude)

// Example 2: Truncating
console.log(num.toFormat({ decimalPlaces: 2, roundingMode: 'truncate' })); 
// Output: "-1234567.89"

// Example 3: Ceiling and Floor
console.log(createBig("12345.67").toFormat({ decimalPlaces: 0, roundingMode: 'ceil' })); 
// Output: "12346"
console.log(createBig("-123.456").toFormat({ decimalPlaces: 1, roundingMode: 'ceil' })); 
// Output: "-123.4" (towards positive infinity)
console.log(createBig("-123.456").toFormat({ decimalPlaces: 1, roundingMode: 'floor' })); 
// Output: "-123.5" (towards negative infinity)


// Example 4: Thousands separator
console.log(num.toFormat({ 
  decimalPlaces: 3, 
  thousandsSeparator: ',', 
  roundingMode: 'truncate' // .8916 truncates to .891
})); 
// Output: "-1,234,567.891"

// Example 5: Custom decimal separator
console.log(createBig("54321").toFormat({ thousandsSeparator: ' ' })); 
// Output: "54 321" (no decimal part, no decimal separator shown)

console.log(createBig("1234.567").toFormat({ 
  decimalPlaces: 2, 
  decimalSeparator: ',', 
  roundingMode: 'half-up' 
})); 
// Output: "1234,57"

// Example 6: Integer formatting with decimal places
console.log(createBig("789").toFormat({ decimalPlaces: 2, thousandsSeparator: ',' }));
// Output: "789.00"
```

## Benchmark

Benchmark results are available [here](https://github.com/dschewchenko/big.esm/blob/master/BENCHMARK.md).

## Roadmap

- [x] Generate documentation from JSDoc
- [x] Remove trailing zeros from toString method
- [ ] Add formatting options
- [ ] Add more mathematical functions

## License

MIT

## Copyright

© 2023 dschewchenko
