import type { BigObject } from "../types";

/**
 * Determines if the value is a BigObject. A BigObject is an object with a value property of type bigint and a scale property of type number. It usually represents a Big instance.
 *
 * @param {Big | BigObject} value - The value to check. Can be a Big instance or a BigObject.
 * @return {boolean} - True if the value is a BigObject, false otherwise.
 *
 * @category Utilities
 *
 * @example
 * isBigObject({ value: 123456n, scale: 2 }); // true
 * isBigObject({ value: 123456n, scale: 2, foo: "bar" }); // true
 * isBigObject({ value: 123456n }); // false
 * isBigObject({ scale: 2 }); // false
 * isBigObject({}); // false
 * isBigObject(123456n); // false
 * isBigObject({ value: "abc", scale: "2"}); // false
 */
export function isBigObject(value: unknown): value is BigObject {
  if (value === null || typeof value !== "object") return false;
  const maybeBigObject = value as BigObject;
  return typeof maybeBigObject.value === "bigint" && typeof maybeBigObject.scale === "number";
}
