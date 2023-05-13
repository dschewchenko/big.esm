# big.es

Library for working with large numbers and fractions using `BigInt`.
It provides advanced functionality for performing arithmetic operations with precision and decimal handling.

No dependencies.
No limitations on the size of the numbers, except for the limitations of `BigInt`, so limited by system memory =).

Fully written in TypeScript, so it provides type definitions out of the box.

Tree-shaking is supported. 
Full bundle size — 5.43 kB minified and 1.98 kB gzipped.
(Per-import size at the bottom of README) 

## Installation

Install `big.es` using npm:
    
```bash
npm install big.es
```

## Usage

```js
import { createBig, addBig } from 'big.es';

const a = createBig("12345678910.12345678910"); // or new Big("12345678910.12345678910")
const b = createBig("9876543210.9876543210");
const result = addBig(a, b);
console.log(result.toString()); // 22222222121.1111111101
```

## Compatibility

`big.es` is compatible with all modern browsers and Node.js 10+. It uses `BigInt` internally, so it is not compatible with older browsers and Node.js versions. On info from [caniuse.com](https://caniuse.com/#feat=bigint) `BigInt` is supported by 95.25% of all browsers(as of 2023-05-12).

## Notes

- `big.es` is not a drop-in replacement for `big.js`. It does not support the same API and does not have the same functionality. It is a completely different library.
- `powBig()` and `sqrtBig()` are heavy and slow operations. They are implemented using the Newton's method and exponentiation by squaring algorithms. Use them with caution, especially with large numbers. In most cases, there will be no problems.

## API

More information in the [documentation](https://dschewchenko.github.io/big.es/).

### Core

#### `new Big(value: BigValue, scale?: number | string): Big`

Creates a new `Big` instance from a string, number or `BigInt`. Optionally, you can specify the scale of the number. The scale is the number of digits to the right of the decimal point. If the scale is not specified, it will be calculated automatically, otherwise the number will be rounded to integer.

### Utilities

#### `createBig(value: string | number | bigint): Big`

Alias for `new Big(value)`.
But it does not support the scale parameter and if the value is instance of `Big` it will be returned without changes.

```js
const a = createBig("12345678910.12345678910"); // value = 1234567891012345678910 ,scale = 11
const b = createBig(12345678910.12345678910); // value = 1234567891012345678910 ,scale = 11
const c = createBig(1234567891012345678910n); // value = 1234567891012345678910 ,scale = 0
```

### `cloneBig(a: Big): Big`

Creates a new `Big` instance from another `Big` instance.

```js
const a = createBig("12345678910.12345678910");
const b = cloneBig(a);
```

### `alignScale(a: Big, b: Big): [Big, Big]`

Aligns the scale of two `Big` instances. The scale of the result will be equal to the maximum scale of the two numbers.

### `isNumericValue(value: any): boolean`

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

```js
const a = createBig("12345678910.12345678910");
const b = createBig("9876543210.9876543210");
const result = modBig(a, b);
console.log(result.toString()); // 2469135679.1358024688
```

#### `powBig(a: Big, b: Big): Big`

Raises `a` to the power of `b`.

```js
const a = createBig("12345678910.12345678910");
const b = createBig("9876543210.9876543210");
const result = powBig(a, b);
console.log(result.toString()); // 1.2193263111263527e+21
```

#### `sqrtBig(a: Big): Big`

Calculates the square root of `a`.

```js
const a = createBig("12345678910.12345678910");
const result = sqrtBig(a);
console.log(result.toString()); // 111111.1111111111
```

#### `absBig(a: Big): Big`

Returns the absolute value of `a`.

```js
const a = createBig("-12345678910.12345678910");
const result = absBig(a);
console.log(result.toString()); // 12345678910.1234567891
```

## Roadmap

- [ ] Generate documentation from JSDoc
- [ ] Add formatting options and remove trailing zeros from toString method
- [ ] Add more mathematical functions

## License

MIT