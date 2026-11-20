import type { Big } from "../big";
import { boundedRoot } from "../utils/bounded-root";
import { DEFAULT_PRECISION, ONE_BIGINT, TEN_BIGINT, ZERO_BIGINT } from "../utils/constants";
import { pow10 } from "../utils/pow10";

/**
 * Calculates the real nth root of a Big instance and mutates it with the result.
 *
 * @param big - The radicand, replaced in place by the result.
 * @param root - An integer degree of at least 2. Negative radicands require an odd degree.
 * @param precision - A non-negative safe integer specifying decimal places; defaults to 20.
 * @returns The mutated radicand, rounded to the nearest value with ties away from zero.
 * @throws If the precision, degree, or radicand is invalid.
 *
 * @category Operations
 *
 * @example
 * sqrtBig(createBig("0.01"), 2, 3).toString(); // "0.1"
 * sqrtBig(createBig("-2"), 3, 2).toString(); // "-1.26"
 */
export function sqrtBig(big: Big, root = 2, precision = DEFAULT_PRECISION): Big {
  if (precision < 0) throw new Error("Prec");
  const resultScale = Math.max(0, precision);
  if (big.value === ZERO_BIGINT) {
    big.scale = resultScale;
    return big;
  }
  if (!Number.isSafeInteger(resultScale)) throw new Error("Prec");
  if (big.scale === 0 && big.value === ONE_BIGINT) {
    big.value = pow10(resultScale);
    big.scale = resultScale;
    return big;
  }
  if (!Number.isInteger(root) || root < 2 || (big.value < ZERO_BIGINT && root % 2 === 0)) {
    throw new Error("Root");
  }
  if (big.scale === 0 && big.value === -ONE_BIGINT) {
    big.value = -pow10(resultScale);
    big.scale = resultScale;
    return big;
  }

  const negative = big.value < ZERO_BIGINT;
  const absolute = negative ? -big.value : big.value;
  const workScale = root * (resultScale + 1);
  let exponent = workScale - big.scale;
  if (root >= 4096 || !Number.isSafeInteger(workScale) || !Number.isSafeInteger(exponent)) {
    const rounded = boundedRoot(absolute, big.scale, root, resultScale);
    if (rounded !== undefined) {
      big.value = negative ? -rounded : rounded;
      big.scale = resultScale;
      return big;
    }
    if (!Number.isSafeInteger(big.scale)) throw new Error("Prec");
    exponent = Number(BigInt(root) * (BigInt(resultScale) + 1n) - BigInt(big.scale));
  }
  if (!Number.isSafeInteger(exponent)) throw new Error("Prec");

  const scaled = scaleRadicand(absolute, exponent);
  const roundedRoot = root === 2 ? bigIntSqrt(scaled) : bigIntRoot(scaled, root);
  let result = roundedRoot / TEN_BIGINT;
  if (roundedRoot % TEN_BIGINT >= 5n) result += ONE_BIGINT;

  big.value = negative ? -result : result;
  big.scale = resultScale;
  return big;
}

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

  // Number is only a starting estimate. Verify it using BigInt so rounding
  // in the conversion cannot affect the exact integer square root.
  const approximation = Math.sqrt(Number(value));
  let x0: bigint;
  if (Number.isFinite(approximation)) {
    x0 = BigInt(Math.ceil(approximation));
    if (x0 * x0 < value) x0 = value / x0 + ONE_BIGINT;
  } else {
    const bits = bigIntBitLength(value);
    x0 = ONE_BIGINT << BigInt(Math.ceil(bits / 2));
  }
  let x1 = (x0 + value / x0) >> ONE_BIGINT;

  while (x1 < x0) {
    x0 = x1;
    x1 = (x0 + value / x0) >> ONE_BIGINT;
  }

  return x0;
}
