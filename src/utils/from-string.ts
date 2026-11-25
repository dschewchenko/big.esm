import { Big } from "../big.js";
import type { BigObject, PossibleNumber } from "../types.js";
import { decimalScale, NUMERIC_PATTERN, parseDecimal } from "./parse-decimal.js";

/**
 * Checks decimal input syntax and whether its exponent and scale can be represented safely.
 * Validates without building a BigInt or expanding scientific notation.
 *
 * @param value - The value to check.
 * @returns Whether the input is a bigint, finite number, or decimal string within safe exponent and scale bounds.
 *
 * @category Utilities
 * @example
 * isDecimalInput("1.25e-3"); // true
 * isDecimalInput("0x10"); // false
 */
export function isDecimalInput(value: unknown): value is PossibleNumber {
  if (typeof value === "bigint") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "string") return false;

  const match = NUMERIC_PATTERN.exec(value);
  return !!match && !!(match[2] || match[3]) && Number.isSafeInteger(decimalScale(match[3]?.length ?? 0, match[4]));
}

/**
 * Convert a number or string to normal string number. Supports scientific notation.
 *
 * @param {string | number} num - The number to convert
 * @param {boolean} [ignoreFraction=false] - Whether to ignore the fractional part of the number. Defaults to false.
 * @param {boolean} [returnInstance=true] - Whether to return a Big instance or BigObject. Defaults to true.
 *
 * @return {Big | BigObject} - A Big instance or BigObject representing the number
 * @throws {Error} - If the number is too big or too small
 * @throws {Error} - If the number is invalid
 *
 * @category Utilities
 *
 * @example
 * fromString("123.456"); // Big { value: 123456n, scale: 3 }
 * fromString("123.456", true); // Big { value: 123n, scale: 0 }
 * fromString("123.456", false, false); // { value: 123456n, scale: 3 }
 * fromString("1.5e3"); // Big { value: 1500n, scale: 0 }
 *
 */
export function fromString(num: string | number, ignoreFraction?: boolean, returnInstance?: true): Big;
export function fromString(num: string | number, ignoreFraction: boolean | undefined, returnInstance: false): BigObject;
export function fromString<Type extends boolean>(
  num: string | number,
  ignoreFraction?: boolean,
  returnInstance?: Type
): Type extends true ? Big : BigObject;
export function fromString(
  num: string | number,
  ignoreFraction: boolean | undefined,
  returnInstance: boolean
): Big | BigObject;
export function fromString(num: string | number, ignoreFraction = false, returnInstance = true): Big | BigObject {
  const parsed = parseDecimal(num, ignoreFraction);
  return returnInstance ? new Big(parsed.value, parsed.scale) : parsed;
}

/**
 * Creates a Big using a negative scale for positive scientific exponents, avoiding zero-padding the coefficient.
 *
 * @param value - A finite number, bigint, or decimal string.
 * @returns A Big whose coefficient and scale compactly represent the input.
 * @throws If the input is invalid or its exponent produces an unsafe scale.
 *
 * @category Utilities
 *
 * @example
 * createCompactBig("1e10000000000"); // Big { value: 1n, scale: -10000000000 }
 */
export function createCompactBig(value: PossibleNumber): Big {
  if (typeof value === "bigint") return new Big(value);
  const parsed = parseDecimal(value, false, 0);
  return new Big(parsed.value, parsed.scale);
}
