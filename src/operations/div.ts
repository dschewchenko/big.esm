import { createBig } from "../utils/create.ts";
import { isZero } from "../utils/is-zero";
import { DEFAULT_PRECISION, ZERO_BIGINT } from "../utils/constants";
import type { RoundingMode } from "../types";
import type { Big } from "../big";

/**
 * Divides two Big instances and returns the result as a new Big instance.
 *
 * @param {Big} dividend - The dividend Big instance.
 * @param {Big} divisor - The divisor Big instance.
 * @param {number} [precision] - The number of decimal places to keep in the result (optional). Defaults to the maximum scale of both Big instances. If the precision is lower than the scale of the result, the result will be rounded. If input numbers are without scale, the precision will be 0, so the result will be rounded to an integer.
 * @param {string} [roundingMode="half-up"] - The rounding mode to apply ("half-up", "down" or "up"). Defaults to "half-up".
 * @returns {Big} - A new Big instance representing the result of the division.
 * @throws {Error} Division by zero is not allowed.
 *
 * @category Operations
 *
 * @example
 * const big1 = new Big(10);
 * const big2 = new Big(3);
 * console.log(divBig(big1, big2).toString()); // "3.33333333333333333333"
 * console.log(divBig(big1, big2, 0).toString()); // "3"
 * console.log(divBig(big1, big2, 2).toString()); // "3.33"
 * console.log(divBig(big1, big2, 2, "down").toString()); // "3.33"
 * console.log(divBig(big1, big2, 2, "up").toString()); // "3.34"
 */
export function divBig(dividend: Big, divisor: Big, precision = DEFAULT_PRECISION, roundingMode: RoundingMode = "half-up"): Big {
  // Check if the divisor is zero, throw an error as division by zero is not allowed
  if (isZero(divisor)) {
    throw new Error("Division by zero is not allowed.");
  }

  // Determine the common scale for the dividend and divisor
  const commonScale = Math.max(dividend.scale, divisor.scale);

  // Determine the scale for the result based on the precision
  const resultScale = Math.max(0, precision);

  // Adjust the dividend and divisor to have the same scale
  const adjustedDividend = dividend.value * BigInt(10) ** BigInt(commonScale + resultScale - dividend.scale);
  const adjustedDivisor = divisor.value * BigInt(10) ** BigInt(commonScale - divisor.scale);

  // Perform bigint division and calculate the remainder
  const quotient = adjustedDividend / adjustedDivisor;
  const remainder = adjustedDividend % adjustedDivisor;

  let finalQuotient;

  // Apply the specified rounding mode to determine the final quotient
  switch (roundingMode) {
    case "down":
      finalQuotient = quotient;
      break;
    case "up":
      finalQuotient = remainder !== ZERO_BIGINT ? quotient + BigInt(1) : quotient + ZERO_BIGINT;
      break;
    case "half-up":
    default:
      // Round the quotient using the "half-up" rounding mode
      finalQuotient = remainder * BigInt(2) >= adjustedDivisor ? quotient + BigInt(1) : quotient;
      break;
  }

  // Create a new Big instance with the final quotient and the desired result scale
  return createBig(finalQuotient.toString(), resultScale);
}
