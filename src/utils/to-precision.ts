import type { BigValue, RoundingMode } from "../types.js";
import { MAX_DECIMAL_PLACES } from "./constants.js";
import { pow10 } from "./pow10.js";
import { readCompactOperand } from "./read-compact-operand.js";
import { divideRounded } from "./rounding.js";

/**
 * Formats a value with a fixed number of significant decimal digits, without mutating it.
 *
 * Exponential notation follows Big.js: it is used when the requested precision is no greater
 * than the rounded value's decimal exponent, or when that exponent is at most -7 or at least 21.
 * Otherwise, the result uses fixed notation. The result includes trailing zeros needed to keep
 * exactly `significantDigits` significant digits.
 *
 * @param value - The number to format.
 * @param significantDigits - Significant digits to display, from 1 to 1,000,000.
 * @param roundingMode - The rounding rule. Defaults to half-up.
 * @returns A decimal string with exactly the requested significant digits.
 * @throws If significantDigits is not a safe integer from 1 to 1,000,000, or the rounding mode is invalid.
 *
 * @category Utilities
 *
 * @example
 * toPrecision("123.456", 4); // "123.5"
 * toPrecision("0.00000123", 4); // "0.000001230"
 */
export function toPrecision(
  value: BigValue,
  significantDigits: number,
  roundingMode: RoundingMode = "half-up"
): string {
  if (!Number.isSafeInteger(significantDigits) || significantDigits < 1 || significantDigits > MAX_DECIMAL_PLACES) {
    throw new RangeError("Prec");
  }
  if (
    roundingMode !== "half-up" &&
    roundingMode !== "half-even" &&
    roundingMode !== "down" &&
    roundingMode !== "up" &&
    roundingMode !== "floor" &&
    roundingMode !== "ceil"
  ) {
    throw new RangeError("Rounding");
  }

  const big = readCompactOperand(value);

  if (big.value === 0n) return significantDigits === 1 ? "0" : `0.${"0".repeat(significantDigits - 1)}`;

  const negative = big.value < 0n;
  const coefficient = negative ? -big.value : big.value;
  const digits = coefficient.toString();
  let roundedExponent = BigInt(digits.length - 1) - BigInt(big.scale);
  const discardedDigits = digits.length - significantDigits;
  let roundedDigits = digits;
  if (discardedDigits > 0) {
    const rounded = divideRounded(big.value, pow10(discardedDigits), roundingMode);
    roundedDigits = (negative ? -rounded : rounded).toString();
    if (roundedDigits.length > significantDigits) roundedExponent += 1n;
  }
  const significand = roundedDigits.slice(0, significantDigits).padEnd(significantDigits, "0");
  const sign = negative ? "-" : "";

  if (BigInt(significantDigits) <= roundedExponent || roundedExponent <= -7n || roundedExponent >= 21n) {
    const fraction = significantDigits === 1 ? "" : `.${significand.slice(1)}`;
    return `${sign}${significand[0]}${fraction}e${roundedExponent < 0n ? "" : "+"}${roundedExponent}`;
  }

  const decimalPoint = Number(roundedExponent + 1n);
  if (decimalPoint <= 0) return `${sign}0.${"0".repeat(-decimalPoint)}${significand}`;
  if (decimalPoint === significantDigits) return `${sign}${significand}`;
  return `${sign}${significand.slice(0, decimalPoint)}.${significand.slice(decimalPoint)}`;
}
