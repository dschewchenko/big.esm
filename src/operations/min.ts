import { compareBig } from "./compare";
import { cloneBig } from "../utils/clone";
import type { Big } from "../big";

/**
 * Returns the minimum of two Big numbers.
 *
 * @param {Big} a - The first Big number.
 * @param {Big} b - The second Big number.
 * @param {boolean} [mutable=false] - Whether to return same Big instance. Defaults to false.
 *
 * @returns {Big} - The minimum of the two Big numbers. If the two Big numbers are equal, the first Big number is returned.
 *
 * @category Operations
 *
 * @example
 * minBig(new Big(1), new Big(2)); // new Big instance with value 1 (first Big number)
 * minBig(new Big(2), new Big(1)); // new Big instance with value 1 (second Big number)
 * minBig(new Big(1), new Big(1)); // new Big instance with value 1 (first Big number)
 * minBig(new Big(1), new Big(1), true); // first Big number with value 1 and same instance
 */
export const minBig = (a: Big, b: Big, mutable = false) => compareBig(a, b) > 0 ? mutable ? b : cloneBig(b) : mutable ? a : cloneBig(a);
