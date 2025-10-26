import type { Big } from "../big";
import { ZERO_BIGINT } from "../utils/constants";
import { createBig } from "../utils/create";

/**
 * Returns the absolute value of a Big instance.
 *
 * @param {Big} big - The Big instance.
 * @param {boolean} [mutable=false] - Whether to mutate the Big instance. Defaults to false.
 * @returns {Big} The absolute value of the Big instance.
 *
 * @category Operations
 *
 * @example
 * absBig(new Big(-1)); // new Big instance with value 1
 * absBig(new Big(-1.1)); // new Big instance with value 1.1
 * absBig(new Big(1)); // new Big instance with value 1
 */
export function absBig(big: Big, mutable = false): Big {
  // Determine the absolute value by checking if the value is negative
  // If it is, negate it to make it positive, otherwise, keep it as is
  const value = big.value < ZERO_BIGINT ? -big.value : big.value;

  // Check if the Big instance should be mutated
  if (mutable) {
    big.value = value;
    return big;
  }

  // Create a new Big instance with the absolute value and the same scale
  return createBig(value, big.scale);
}
