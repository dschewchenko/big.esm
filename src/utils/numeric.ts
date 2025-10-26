/**
 * Checks if a value is a numeric value (bigint, number, or string representation of a number).
 * @param {any} value - The value to check.
 * @returns {boolean} Returns true if the value is a numeric value, false otherwise.
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
