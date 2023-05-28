import { createBig } from "../utils/create";
import type { Big } from "../big";

/**
 * Raises a Big number to the power of another Big number.
 *
 * @param {Big} big - The base Big number.
 * @param {number} exp - The exponent (non-negative integer). Defaults to 2.
 * @param {boolean} [mutable=false] - Whether to mutate the first Big instance. Defaults to false.
 * @returns {Big} - The result of a raised to the power of b.
 * @throws {Error} - If the exponent is not a non-negative integer.
 *
 * @category Operations
 *
 * @example
 * powBig(new Big(2), 0); // new Big instance with value 1
 * powBig(new Big(2), 1); // new Big instance with value 2
 * powBig(new Big(2), 3); // new Big instance with value 8
 * powBig(new Big(2), 3.3); // throws Error
 * powBig(new Big(2), -3); // throws Error
 */
export function powBig(big: Big, exp = 2, mutable = false): Big {
  // Check if the exponent is a non-negative integer
  if (!Number.isInteger(exp) || exp < 0) {
    throw new Error("The exponent must be a non-negative integer.");
  }

  // Perform the exponentiation
  const resultValue = big.value ** BigInt(exp);
  // Calculate the scale of the result by multiplying the scale of the base Big instance by the exponent
  const resultScale = big.scale * exp;

  // Check if the first Big instance should be mutated
  if (mutable) {
    big.value = resultValue;
    big.scale = resultScale;
    return big;
  }

  // Return the result of the exponentiation
  return createBig(resultValue, resultScale);
}
