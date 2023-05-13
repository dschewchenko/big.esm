import { Big } from "../big.ts";

/**
 * Clone a Big instance
 * @param {Big} big - The Big instance to clone.
 * @returns {Big} - The cloned Big instance.
 *
 * @category Utilities
 *
 * @example
 * cloneBig(new Big(123.456)); // new Big instance with the same value and scale as the original
 */
export const cloneBig = (big: Big): Big => {
  // Create a new Big instance with the same value and scale
  return new Big(big.value, big.scale);
};
