import type { Big } from "../big.js";
import type { BigValue, RoundingMode } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { DEFAULT_PRECISION, MAX_DECIMAL_EXPANSION, MAX_DECIMAL_PLACES } from "../utils/constants.js";
import { pow10 } from "../utils/pow10.js";
import { readBigOperand } from "../utils/read-big-operand.js";
import { divBig } from "./div.js";

/**
 * Divides in place, retaining a compact scale when the exact quotient fits within the requested decimal places.
 * Repeating quotients and exact quotients beyond the precision limit are rounded once.
 *
 * @param dividend - The operand to mutate and return.
 * @param operand - The nonzero divisor value.
 * @param maxDecimalPlaces - The maximum fractional places, from 0 to 1,000,000. Defaults to 20.
 * @param roundingMode - The rule used if rounding is needed. Defaults to half-up.
 * @throws If the divisor is zero, the precision is invalid, or the result needs too much decimal expansion.
 *
 * @category Operations
 * @example
 * divCompactBig(createBig(1), 8).toString(); // "0.125"
 * divCompactBig(createBig(1), 3, 4).toString(); // "0.3333"
 */
export function divCompactBig(
  dividend: Big,
  operand: BigValue,
  maxDecimalPlaces = DEFAULT_PRECISION,
  roundingMode: RoundingMode = "half-up"
): Big {
  if (!Number.isSafeInteger(maxDecimalPlaces) || maxDecimalPlaces < 0 || maxDecimalPlaces > MAX_DECIMAL_PLACES) {
    throw new RangeError("Prec");
  }

  assertScale(dividend.scale);
  const divisor = readBigOperand(operand);
  assertScale(divisor.scale);
  if (divisor.value === 0n) throw new Error("Div0");
  if (dividend.value === 0n) {
    dividend.scale = 0;
    return dividend;
  }

  let numerator = divisor.value < 0n ? -dividend.value : dividend.value;
  let denominator = divisor.value < 0n ? -divisor.value : divisor.value;
  if (denominator !== 1n) {
    const common = gcd(numerator < 0n ? -numerator : numerator, denominator);
    if (common > 1n) {
      numerator /= common;
      denominator /= common;
    }
  }

  // A reduced ratio terminates exactly when the denominator is a product of twos and fives.
  const twos = factorOfTwoCount(denominator);
  const fives = powerOfFiveExponent(denominator >> BigInt(twos));
  if (fives === undefined) return divBig(dividend, divisor, maxDecimalPlaces, roundingMode);

  const shift = BigInt(dividend.scale) - BigInt(divisor.scale);
  const exactScale = shift + BigInt(Math.max(twos, fives));
  if (exactScale > BigInt(maxDecimalPlaces)) return divBig(dividend, divisor, maxDecimalPlaces, roundingMode);

  const minimumScale = BigInt(Number.MIN_SAFE_INTEGER);
  let scale = Number(exactScale);
  let padding = 0;
  if (exactScale < minimumScale) {
    scale = Number.MIN_SAFE_INTEGER;
    padding = Number(minimumScale - exactScale);
  }
  if (padding + Math.abs(twos - fives) > MAX_DECIMAL_EXPANSION) {
    throw new RangeError("Division exceeds the decimal expansion limit");
  }

  if (twos < fives) numerator <<= BigInt(fives - twos);
  if (twos > fives) numerator *= 5n ** BigInt(twos - fives);
  if (padding > 0) numerator *= pow10(padding);
  dividend.value = numerator;
  dividend.scale = scale;
  return dividend;
}

function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

function factorOfTwoCount(value: bigint): number {
  if (value & 1n) return 0;
  const lowestBit = (value & -value).toString(16);
  return (lowestBit.length - 1) * 4 + Math.log2(Number.parseInt(lowestBit[0], 16));
}

function powerOfFiveExponent(value: bigint): number | undefined {
  if (value === 1n) return 0;
  if (value % 5n !== 0n) return undefined;

  // Remove powers with increasing exponents, then count the remaining factors in descending order.
  const powers = [5n];
  let count = 0;
  let bit = 0;
  while (value % powers[bit] === 0n) {
    value /= powers[bit];
    count += 2 ** bit;
    if (value === 1n) return count;
    powers.push(powers[bit] * powers[bit]);
    bit++;
  }
  while (--bit >= 0) {
    if (value % powers[bit] === 0n) {
      value /= powers[bit];
      count += 2 ** bit;
    }
  }
  return value === 1n ? count : undefined;
}
