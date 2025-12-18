import type { Big } from "../big";
import { cloneBig } from "../utils/clone";
import { isZero } from "../utils/is-zero";
import { divBig } from "./div";
import { mulBig } from "./mul";
import { subBig } from "./sub";

/**
 * Performs the modulo operation (remainder of division) for two Big instances.
 *
 * @param dividend The Big instance representing the dividend.
 * @param divisor The Big instance representing the divisor.
 * @returns The mutated dividend instance representing the remainder of the division.
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
export function modBig(dividend: Big, divisor: Big): Big {
  if (isZero(divisor)) {
    throw new Error("Div0");
  }

  const quotient = cloneBig(dividend);
  divBig(quotient, divisor, 0, "down");
  mulBig(quotient, divisor);
  return subBig(dividend, quotient);
}
