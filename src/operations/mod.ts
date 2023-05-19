import { divBig } from "./div";
import { subBig } from "./sub";
import { mulBig } from "./mul";
import type { Big } from "../big";
import { isZero } from "../utils/is-zero";

/**
 * Performs the modulo operation (remainder of division) for two Big instances.
 *
 * @param dividend The Big instance representing the dividend.
 * @param divisor The Big instance representing the divisor.
 * @param {boolean} [mutable=false] - Whether to mutate the first Big instance. Defaults to false.
 * @returns A new Big instance representing the remainder of the division.
 * @throws {Error} Division by zero is not allowed.
 *
 * @category Operations
 *
 * @example
 * const big1 = new Big(10);
 * const big2 = new Big(3);
 * console.log(modBig(big1, big2).toString()); // "1"
 * console.log(modBig(big2, big1).toString()); // "3"
 * console.log(modBig(big1, big1).toString()); // "0"
 */
export function modBig(dividend: Big, divisor: Big, mutable = false): Big {
  // Check if the divisor is zero, throw an error
  if (isZero(divisor)) {
    throw new Error("Division by zero is not allowed.");
  }

  // Calculate the quotient using the divBig function with precision 0 and rounding mode "down"
  const quotient = divBig(dividend, divisor, 0, "down");

  if (mutable) {
    mulBig(quotient, divisor, true);
    return subBig(dividend, quotient, true)
  }

  // Calculate the product of the quotient and divisor
  const product = mulBig(quotient, divisor);

  // Subtract the product from the dividend to get the remainder
  return subBig(dividend, product);
}
