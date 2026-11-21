/**
 * Checks for a bigint, a JavaScript number (including NaN and Infinity), or a string
 * that JavaScript's Number conversion accepts. Use `isDecimalInput` to check the decimal grammar.
 * @param {any} value - The value to check.
 * @returns {boolean} Whether the value meets the JavaScript coercion check.
 *
 * @category Utilities
 *
 * @example
 * isNumericValue("12345678910.12345678910"); // true
 * isNumericValue(12345678910.12345678910); // true
 * isNumericValue(1234567891012345678910n); // true
 * isNumericValue("123abc"); // false
 */
export const isNumericValue = (value: unknown): boolean =>
  typeof value === "bigint" || typeof value === "number" || (typeof value === "string" && !Number.isNaN(Number(value)));
