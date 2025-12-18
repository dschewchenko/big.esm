import type { Big } from "../big";
import { compareBig } from "./compare";

/**
 * Returns the maximum of two Big numbers.
 *
 * @param {Big} a - The first Big number.
 * @param {Big} b - The second Big number.
 *
 * @returns {Big} - Returns either `a` or `b`. If the two numbers are equal, `a` is returned.
 *
 * @category Operations
 *
 * @example
 * maxBig(new Big(1), new Big(2)); // returns the second Big number
 * maxBig(new Big(2), new Big(1)); // returns the first Big number
 * maxBig(new Big(1), new Big(1)); // returns the first Big number
 */
export function maxBig(a: Big, b: Big): Big {
  return compareBig(a, b) >= 0 ? a : b;
}
