import type { BigValue } from "../types.js";
import { readCompactOperand } from "./read-compact-operand.js";

const MAX_FINITE_DECIMAL_EXPONENT = 308n;
const MIN_NONZERO_DECIMAL_EXPONENT = -324n;

/**
 * Converts a decimal value to the nearest JavaScript `Number` (IEEE 754 binary64).
 *
 * The result is approximate for most decimal values and may overflow to `Infinity` or underflow to zero.
 * Conversion uses scientific notation internally, so large positive scales do not require padding the
 * coefficient with zeros. A negative value that underflows preserves JavaScript's negative zero.
 *
 * @param input - A number, string, bigint, Big instance, or BigObject to convert.
 * @returns The nearest JavaScript Number for the exact decimal value.
 * @throws If the input is not a valid decimal value or has an invalid scale.
 *
 * @category Utilities
 *
 * @example
 * toNumber("0.1"); // 0.1
 * toNumber("1e10000"); // Infinity
 * toNumber("-1e-10000"); // -0
 */
export function toNumber(input: BigValue): number {
  if (typeof input === "number") {
    if (!Number.isFinite(input)) throw new Error("Num");
    return input;
  }
  if (typeof input === "bigint") return Number(input);

  const big = readCompactOperand(input);
  if (big.scale === 0) return Number(big.value);
  if (big.value === 0n) return 0;

  const negative = big.value < 0n;
  const digits = (negative ? -big.value : big.value).toString();
  const exponent = BigInt(digits.length - 1) - BigInt(big.scale);

  if (exponent > MAX_FINITE_DECIMAL_EXPONENT) return negative ? -Infinity : Infinity;
  if (exponent < MIN_NONZERO_DECIMAL_EXPONENT) return negative ? -0 : 0;

  const mantissa = digits.length === 1 ? digits : `${digits[0]}.${digits.slice(1)}`;
  const sign = negative ? "-" : "";
  const exponentSign = exponent < 0n ? "" : "+";
  return Number(`${sign}${mantissa}e${exponentSign}${exponent}`);
}
