import { createBig } from "../utils/create.ts";
import type { Big } from "../big";

/**
 * Returns the absolute value of a Big instance.
 *
 * @param {Big} big - The Big instance.
 * @returns {Big} The absolute value of the Big instance.
 *
 * @category Operations
 *
 * @example
 * absBig(new Big(-1)); // new Big instance with value 1
 * absBig(new Big(-1.1)); // new Big instance with value 1.1
 * absBig(new Big(1)); // new Big instance with value 1
 */
export function absBig(big: Big): Big {
  // Determine the absolute value by checking if the value is negative
  // If it is, negate it to make it positive, otherwise, keep it as is
  const value = big.value < BigInt(0) ? -big.value : big.value;

  // Create a new Big instance with the absolute value and the same scale
  return createBig(value, big.scale);
}
