import { ZERO_BIGINT } from "./constants";
import type { Big } from "../big";

/**
 * Checks if a Big instance is zero.
 *
 * @param {Big} big - The Big instance to check.
 * @returns {boolean} - Whether the Big instance is zero.
 *
 * @category Utilities
 *
 * @example
 * isZero(new Big(0)); // true
 * isZero(new Big(1)); // false
 */
export function isZero(big: Big): boolean {
  return big.value === ZERO_BIGINT;
}
