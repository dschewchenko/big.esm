import type { Big } from "../big.js";
import type { BigValue } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { boundedRoot } from "../utils/bounded-root.js";
import { DEFAULT_PRECISION, MAX_MATERIALIZED_ZEROS, ONE_BIGINT, TEN_BIGINT, ZERO_BIGINT } from "../utils/constants.js";
import { isPositiveOne } from "../utils/decimal-magnitude.js";
import { pow10 } from "../utils/pow10.js";
import { copyBigWithExpansionLimit } from "../utils/read-big-operand.js";
import { fractionalEnd } from "../utils/trim-zeros.js";

/**
 * Calculates the real nth root of a value without mutating the input.
 *
 * @param value - The radicand.
 * @param root - A safe integer degree of at least 2. Degree 1 is also accepted for zero and one. Negative radicands require an odd degree.
 * @param precision - A non-negative safe integer specifying decimal places; defaults to 20.
 * @returns A new Big instance containing the root rounded to the nearest value with ties away from zero.
 * @throws If the precision, degree, or radicand is invalid.
 *
 * @category Operations
 *
 * @example
 * sqrt("0.01", 2, 3).toString(); // "0.1"
 * sqrt("-2", 3, 2).toString(); // "-1.26"
 */
export function sqrt(value: BigValue, root = 2, precision = DEFAULT_PRECISION): Big {
  return sqrtInPlace(copyBigWithExpansionLimit(value), root, precision);
}

/**
 * Calculates the real nth root of a Big instance and mutates it with the result.
 *
 * @param big - The radicand, replaced in place by the result.
 * @param root - A safe integer degree of at least 2. Degree 1 is also accepted for zero and one. Negative radicands require an odd degree.
 * @param precision - A non-negative safe integer specifying decimal places; defaults to 20.
 * @returns The mutated radicand, rounded to the nearest value with ties away from zero.
 * @throws If the precision, degree, or radicand is invalid.
 *
 * @category Operations
 *
 * @example
 * sqrtInPlace(new Big("0.01"), 2, 3).toString(); // "0.1"
 */
export function sqrtInPlace(big: Big, root = 2, precision = DEFAULT_PRECISION): Big {
  const scale = big.scale;
  assertScale(scale);
  if (!Number.isSafeInteger(precision) || precision < 0) throw new Error("Prec");
  const value = big.value;
  if (!Number.isSafeInteger(root) || root < 1 || (value < ZERO_BIGINT && root % 2 === 0)) throw new Error("Root");
  if (value === ZERO_BIGINT) {
    big.scale = precision;
    return big;
  }

  const absolute = value < ZERO_BIGINT ? -value : value;
  if (root === 1) {
    if (!isPositiveOne(value, scale)) throw new Error("Root");
    return storeUnitRoot(big, ONE_BIGINT, 0, precision);
  }
  if (absolute === ONE_BIGINT && scale % root === 0) return storeUnitRoot(big, value, scale / root, precision);

  const workScale = root * (precision + 1);
  const exponent = workScale - scale;
  if (
    exponent > MAX_MATERIALIZED_ZEROS ||
    root >= 4096 ||
    !Number.isSafeInteger(workScale) ||
    !Number.isSafeInteger(exponent)
  ) {
    return rootAtWideScale(big, absolute, root, precision, exponent);
  }
  return storeRoundedRoot(big, absolute, root, precision, exponent);
}

function storeUnitRoot(big: Big, coefficient: bigint, scale: number, precision: number): Big {
  const zeros = precision - scale;
  if (zeros > MAX_MATERIALIZED_ZEROS) {
    big.value = coefficient;
    big.scale = scale;
  } else if (zeros < 0) {
    big.value = ZERO_BIGINT;
    big.scale = precision;
  } else {
    const magnitude = pow10(zeros);
    big.value = coefficient < ZERO_BIGINT ? -magnitude : magnitude;
    big.scale = precision;
  }
  return big;
}

function rootAtWideScale(big: Big, absolute: bigint, degree: number, precision: number, exponent: number): Big {
  const scale = big.scale;
  if (
    exponent > MAX_MATERIALIZED_ZEROS &&
    (degree < 4096 || precision - scale / degree >= MAX_MATERIALIZED_ZEROS) &&
    storeExactCompactRoot(big, absolute, degree, precision)
  ) {
    return big;
  }
  if (degree >= 4096 || !Number.isSafeInteger(degree * (precision + 1)) || !Number.isSafeInteger(exponent)) {
    const rounded = boundedRoot(absolute, scale, degree, precision);
    if (rounded !== undefined) {
      big.value = big.value < ZERO_BIGINT ? -rounded : rounded;
      big.scale = precision;
      return big;
    }
    exponent = Number(BigInt(degree) * (BigInt(precision) + 1n) - BigInt(scale));
  }
  if (!Number.isSafeInteger(exponent)) throw new Error("Prec");
  return storeRoundedRoot(big, absolute, degree, precision, exponent);
}

function storeRoundedRoot(big: Big, absolute: bigint, degree: number, precision: number, exponent: number): Big {
  const scaled = scaleRadicand(absolute, exponent);
  const rootWithGuard = degree === 2 ? bigIntSqrt(scaled) : bigIntRoot(scaled, degree);
  let result = rootWithGuard / TEN_BIGINT;
  if (rootWithGuard % TEN_BIGINT >= 5n) result += ONE_BIGINT;
  big.value = big.value < ZERO_BIGINT ? -result : result;
  big.scale = precision;
  return big;
}

function storeExactCompactRoot(big: Big, coefficient: bigint, degree: number, precision: number): boolean {
  const remainder = big.scale % degree;
  let scale = big.scale / degree;
  if (remainder !== 0) {
    // Remove only the trailing zeros needed to make the scale divisible by the degree.
    const zeros = remainder < 0 ? remainder + degree : remainder;
    const digits = coefficient.toString();
    const end = digits.length - zeros;
    if (end < 1 || fractionalEnd(digits, 1) > end) return false;
    coefficient = BigInt(digits.slice(0, end));
    scale = Number((BigInt(big.scale) - BigInt(zeros)) / BigInt(degree));
  }
  if (scale > precision) return false;
  const result = degree === 2 ? bigIntSqrt(coefficient) : bigIntRoot(coefficient, degree);
  if (result ** BigInt(degree) !== coefficient) return false;
  big.value = big.value < 0n ? -result : result;
  big.scale = scale;
  return true;
}

/** @deprecated Use {@link sqrt} for a non-mutating operation or {@link sqrtInPlace} to mutate explicitly. */
export const sqrtBig = sqrtInPlace;

function bigIntRoot(value: bigint, degree: number): bigint {
  if (value < 2n) return value;
  const bits = bigIntBitLength(value);
  if (degree >= bits) return ONE_BIGINT;
  const n = BigInt(degree);
  let current = ONE_BIGINT << BigInt(Math.ceil(bits / degree));
  if (degree >= 256) {
    let lower = ONE_BIGINT << BigInt(Math.floor((bits - 1) / degree));
    while (current - lower > ONE_BIGINT) {
      const middle = (lower + current) >> ONE_BIGINT;
      if (middle ** n > value) current = middle;
      else lower = middle;
    }
    return lower;
  }
  while (true) {
    const next = ((n - ONE_BIGINT) * current + value / current ** (n - ONE_BIGINT)) / n;
    if (next >= current) return current;
    current = next;
  }
}

function scaleRadicand(value: bigint, exponent: number): bigint {
  if (exponent >= 0) return value * pow10(exponent);
  if (-exponent >= value.toString().length) return ZERO_BIGINT;
  return value / pow10(-exponent);
}

function bigIntBitLength(value: bigint): number {
  const hex = value.toString(16);
  const code = hex.charCodeAt(0);
  const firstDigit = code < 58 ? code - 48 : code - 87;
  return (hex.length - 1) * 4 + (32 - Math.clz32(firstDigit));
}

function bigIntSqrt(value: bigint): bigint {
  if (value < ZERO_BIGINT) {
    throw new Error("Sqrt");
  }

  if (value < 2n) return value;

  // The first integer Newton step is at least the floor of the exact root,
  // even if Number produced an underestimate.
  const approximation = Math.sqrt(Number(value));
  let x0 = Number.isFinite(approximation)
    ? BigInt(Math.ceil(approximation))
    : ONE_BIGINT << BigInt(Math.ceil(bigIntBitLength(value) / 2));
  let x1 = (x0 + value / x0) >> ONE_BIGINT;
  if (x1 > x0) {
    x0 = x1;
    x1 = (x0 + value / x0) >> ONE_BIGINT;
  }
  while (x1 < x0) {
    x0 = x1;
    x1 = (x0 + value / x0) >> ONE_BIGINT;
  }

  return x0;
}
