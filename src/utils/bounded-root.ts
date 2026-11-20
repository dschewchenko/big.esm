import { compareAbsoluteScaled } from "./decimal-magnitude";
import { pow10 } from "./pow10";

type DecimalBounds = [lower: bigint, upper: bigint, shift: bigint];

/**
 * Rounds a root using bounded integer comparisons of its rounding midpoints.
 * Undefined leaves ambiguous comparisons to the full integer algorithm.
 */
export function boundedRoot(value: bigint, scale: number, degree: number, precision: number): bigint | undefined {
  if (!Number.isSafeInteger(scale)) return undefined;
  const digits = value.toString();
  const exponent = BigInt(degree);
  const order = BigInt(digits.length - 1) - BigInt(scale);
  const rootOrder = order < 0n ? (order - exponent + 1n) / exponent : order / exponent;
  const coefficientOrder = rootOrder + BigInt(precision);
  if (coefficientOrder < -1n) return 0n;
  if (coefficientOrder >= BigInt(Number.MAX_SAFE_INTEGER)) return undefined;

  let lower = coefficientOrder < 0n ? 0n : pow10(Number(coefficientOrder));
  let upper = pow10(Number(coefficientOrder + 1n));
  let width = Math.max(48, Number(coefficientOrder + 1n) + exponent.toString().length + 16);
  const targetShift = BigInt(precision) * exponent;
  const midpointShift = BigInt(scale);

  for (let attempt = 0; attempt < 4; attempt++, width *= 2) {
    const coefficient = boundDigits(digits, width);
    const target = multiplyBounds(coefficient, powerBounds(2n, exponent, width), width);
    // Test (2q + 1)^degree * 10^scale against value * 2^degree * 10^(precision * degree).
    // For a tie, choose the larger magnitude.
    const midpointAbove = (candidate: bigint): boolean | undefined => {
      const midpoint = powerBounds(2n * candidate + 1n, exponent, width);
      const leftShift = midpoint[2] + midpointShift;
      const rightShift = target[2] + targetShift;
      if (compareAbsoluteScaled(midpoint[0], leftShift, target[1], rightShift) > 0) return true;
      if (compareAbsoluteScaled(midpoint[1], leftShift, target[0], rightShift) <= 0) return false;
      return undefined;
    };
    if (midpointAbove(lower) === true) return lower;
    if (midpointAbove(upper - 1n) === false) return upper;
    while (lower < upper) {
      const middle = (lower + upper) >> 1n;
      const above = midpointAbove(middle);
      // The intervals overlap. Keep the proven search bounds and try more digits.
      if (above === undefined) break;
      if (above) upper = middle;
      else lower = middle + 1n;
    }
    if (lower === upper) return lower;
  }
  return undefined;
}

function boundDigits(digits: string, width: number): DecimalBounds {
  if (digits.length <= width) {
    const exact = BigInt(digits);
    return [exact, exact, 0n];
  }
  const lower = BigInt(digits.slice(0, width));
  return [lower, lower + 1n, BigInt(digits.length - width)];
}

function powerBounds(base: bigint, exponent: bigint, width: number): DecimalBounds {
  let result: DecimalBounds = [1n, 1n, 0n];
  let factor: DecimalBounds = [base, base, 0n];
  let remaining = exponent;
  while (remaining > 0n) {
    if (remaining & 1n) result = multiplyBounds(result, factor, width);
    remaining >>= 1n;
    if (remaining > 0n) factor = multiplyBounds(factor, factor, width);
  }
  return result;
}

function multiplyBounds(a: DecimalBounds, b: DecimalBounds, width: number): DecimalBounds {
  const lower = a[0] * b[0];
  const upper = a[1] * b[1];
  const shift = a[2] + b[2];
  const excess = upper.toString().length - width;
  if (excess <= 0) return [lower, upper, shift];

  const unit = pow10(excess);
  // Round the two ends outwards so later comparisons stay exact.
  return [lower / unit, (upper - 1n) / unit + 1n, shift + BigInt(excess)];
}
