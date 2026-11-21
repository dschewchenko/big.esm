import type { BigObject } from "../types.js";
import { isValidScale } from "./assert-scale.js";

/**
 * Determines if the value is a BigObject. A BigObject has a bigint value and a safe integer scale. It usually represents a Big instance.
 *
 * @param {Big | BigObject} value - The value to check. Can be a Big instance or a BigObject.
 * @return {boolean} - True if the value is a BigObject, false otherwise.
 *
 * @category Utilities
 *
 * @example
 * isBigObject({ value: 123456n, scale: 2 }); // true
 * isBigObject({ value: 123456n, scale: -2, foo: "bar" }); // true
 * isBigObject({ value: 123456n, scale: 2.5 }); // false
 * isBigObject({ value: 123456n }); // false
 * isBigObject({ scale: 2 }); // false
 * isBigObject({}); // false
 * isBigObject(123456n); // false
 * isBigObject({ value: "abc", scale: "2"}); // false
 */
export function isBigObject(value: unknown): value is BigObject {
  if (value === null || typeof value !== "object") return false;
  const maybeBigObject = value as BigObject;
  return typeof maybeBigObject.value === "bigint" && isValidScale(maybeBigObject.scale);
}
