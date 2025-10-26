import type { Big } from "../big";
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
export function isBigObject(value: Big | BigObject | unknown): value is BigObject {
  // check if value is an object and not null
  if (typeof value !== "object" || value === null) return false;

  // check if value has value and scale properties
  if ("value" in value && "scale" in value) {
    // check if value.value is bigint and value.scale is number
    if (typeof value.value === "bigint" && typeof value.scale === "number") return true;
  }

  // value is not a BigObject
  return false;
}
