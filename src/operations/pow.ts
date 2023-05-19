import { createBig } from "../utils/create.ts";
import { mulBig } from "./mul";
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

  // Initialize the result and power to 1 and the base to the provided Big instance
  let result = createBig(1);
  let power = createBig(big);

  // Convert the exponent to its absolute value
  exp = Math.abs(exp);

  // Perform the exponentiation using the binary exponentiation algorithm
  while (exp > 0) {
    if (exp % 2 === 1) {
      // If the current bit of the exponent is 1, multiply the result by the current power
      result = mulBig(result, power, mutable);
    }
    // Square the power for the next bit of the exponent
    power = mulBig(power, power, mutable);
    // Divide the exponent by 2 (equivalent to shifting the bits to the right)
    exp = Math.floor(exp / 2);
  }

  if (mutable) {
    big.value = result.value;
    big.scale = result.scale;
    return big;
  }

  // Return the result of the exponentiation
  return result;
}
