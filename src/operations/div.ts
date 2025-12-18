import type { Big } from "../big";
import type { RoundingMode } from "../types";
import { DEFAULT_PRECISION, ONE_BIGINT, ZERO_BIGINT } from "../utils/constants";
import { isZero } from "../utils/is-zero";
import { pow10 } from "../utils/pow10";

/**
 * Divides two Big instances and mutates the dividend with the result.
 *
 * @param {Big} dividend - The dividend Big instance.
 * @param {Big} divisor - The divisor Big instance.
 * @param {number} [precision] - The number of decimal places to keep in the result (optional). Defaults to the maximum scale of both Big instances. If the precision is lower than the scale of the result, the result will be rounded. If input numbers are without scale, the precision will be 0, so the result will be rounded to an integer.
 * @param {string} [roundingMode="half-up"] - The rounding mode to apply ("half-up", "down" or "up"). Defaults to "half-up".
 * @returns {Big} - The mutated dividend instance.
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
export function divBig(
  dividend: Big,
  divisor: Big,
  precision = DEFAULT_PRECISION,
  roundingMode: RoundingMode = "half-up"
): Big {
  if (isZero(divisor)) {
    throw new Error("Div0");
  }

  const commonScale = Math.max(dividend.scale, divisor.scale);
  const resultScale = Math.max(0, precision);
  const adjustedDividend = dividend.value * pow10(commonScale + resultScale - dividend.scale);
  const adjustedDivisor = divisor.value * pow10(commonScale - divisor.scale);

  const quotient = adjustedDividend / adjustedDivisor;
  const remainder = adjustedDividend % adjustedDivisor;

  let finalQuotient = quotient;

  switch (roundingMode) {
    case "down":
      break;
    case "up":
      finalQuotient = remainder !== ZERO_BIGINT ? quotient + ONE_BIGINT : quotient;
      break;
    default:
      finalQuotient = remainder * 2n >= adjustedDivisor ? quotient + ONE_BIGINT : quotient;
      break;
  }

  dividend.value = finalQuotient;
  dividend.scale = resultScale;
  return dividend;
}
