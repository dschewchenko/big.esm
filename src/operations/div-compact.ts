import { Big } from "../big.js";
import type { BigValue, RoundingMode } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { DEFAULT_PRECISION, MAX_DECIMAL_EXPANSION, MAX_DECIMAL_PLACES } from "../utils/constants.js";
import { pow10 } from "../utils/pow10.js";
import { readBigOperand } from "../utils/read-big-operand.js";
import { validateRoundingMode } from "../utils/rounding.js";
import { divInPlace } from "./div.js";

/** @inline */
type LegacyDivCompactOperation = (
  dividend: Big,
  divisor: Big,
  maxDecimalPlaces?: number,
  roundingMode?: RoundingMode
) => Big;

/** Divides two values and returns a new Big with a compact exact scale when possible. */
export function divCompact(
  dividend: BigValue,
  divisor: BigValue,
  maxDecimalPlaces = DEFAULT_PRECISION,
  roundingMode: RoundingMode = "half-up"
): Big {
  return divCompactInPlace(new Big(dividend), divisor, maxDecimalPlaces, roundingMode);
}

/**
 * Divides in place, retaining a compact scale when the exact quotient fits within the requested decimal places.
 * Repeating quotients and exact quotients beyond the precision limit are rounded once.
 *
 * @param dividend - The operand to mutate and return.
 * @param operand - The nonzero divisor value.
 * @param maxDecimalPlaces - The maximum fractional places, from 0 to 1,000,000. Defaults to 20.
 * @param roundingMode - The rule used if rounding is needed. Defaults to half-up.
 * @throws If the divisor is zero, precision or roundingMode is invalid, or the result needs too much decimal expansion.
 *
 * @category Operations
 * @example
 * divCompactInPlace(new Big(1), 8).toString(); // "0.125"
 * divCompactInPlace(new Big(1), 3, 4).toString(); // "0.3333"
 */
export function divCompactInPlace(
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
    if (roundingMode !== "half-up") validateRoundingMode(roundingMode);
    dividend.scale = 0;
    return dividend;
  }

  const negative = divisor.value < 0n;
  let numerator = negative ? -dividend.value : dividend.value;
  let denominator = negative ? -divisor.value : divisor.value;
  if (denominator !== 1n) {
    const common = gcd(numerator, denominator);
    if (common > 1n) {
      numerator /= common;
      denominator /= common;
    }
  }

  // A reduced ratio terminates exactly when the denominator is a product of twos and fives.
  const twos = factorOfTwoCount(denominator);
  const fives = powerOfFiveExponent(denominator >> BigInt(twos));
  if (fives === undefined) return divInPlace(dividend, divisor, maxDecimalPlaces, roundingMode);

  const places = Math.max(twos, fives);
  const difference = dividend.scale - divisor.scale;
  let scale = difference + places;
  let padding = 0;
  if (!Number.isSafeInteger(difference)) {
    const exactScale = BigInt(dividend.scale) - BigInt(divisor.scale) + BigInt(places);
    const minimumScale = BigInt(Number.MIN_SAFE_INTEGER);
    if (exactScale < minimumScale) {
      scale = Number.MIN_SAFE_INTEGER;
      padding = Number(minimumScale - exactScale);
    } else {
      scale = Number(exactScale);
    }
  }
  if (scale > maxDecimalPlaces) return divInPlace(dividend, divisor, maxDecimalPlaces, roundingMode);
  if (roundingMode !== "half-up") validateRoundingMode(roundingMode);
  const factorGap = twos - fives;
  if (padding + Math.abs(factorGap) > MAX_DECIMAL_EXPANSION) {
    throw new RangeError("Division exceeds the decimal expansion limit");
  }

  if (factorGap < 0) numerator <<= BigInt(-factorGap);
  else if (factorGap > 0) numerator *= 5n ** BigInt(factorGap);
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
  return a < 0n ? -a : a;
}

function factorOfTwoCount(value: bigint): number {
  if (value & 1n) return 0;
  const lowestBit = value & -value;
  if (lowestBit <= 0x80000000n) return 31 - Math.clz32(Number(lowestBit));
  const hex = lowestBit.toString(16);
  // A power of two starts with 1, 2, 4, or 8 in hexadecimal.
  return (hex.length - 1) * 4 + Math.log2(Number(hex[0]));
}

function powerOfFiveExponent(value: bigint): number | undefined {
  if (value === 1n) return 0;
  if (value % 5n !== 0n) return undefined;
  value /= 5n;
  if (value === 1n) return 1;

  // Remove powers with increasing exponents, then count the remaining factors in descending order.
  const powers = [5n, 25n];
  let count = 1;
  let direction = 1;
  for (let bit = 1; bit >= 0; bit += direction) {
    const power = powers[bit];
    if (value % power !== 0n) {
      direction = -1;
      continue;
    }
    value /= power;
    count += 2 ** bit;
    if (value === 1n) return count;
    if (direction > 0) powers.push(power * power);
  }
  return undefined;
}

/** @deprecated Use `divCompact` for a new result or `divCompactInPlace` to mutate the dividend. */
export const divCompactBig: LegacyDivCompactOperation = divCompactInPlace;
