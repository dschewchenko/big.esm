import type { Big } from "../big.js";
import type { RoundingMode } from "../types.js";
import { DEFAULT_PRECISION, ONE_BIGINT, ZERO_BIGINT } from "../utils/constants.js";
import { compareAbsoluteScaled } from "../utils/decimal-magnitude.js";
import { isZero } from "../utils/is-zero.js";
import { pow10 } from "../utils/pow10.js";

/**
 * Divides two Big instances and mutates the dividend with the result.
 *
 * @param {Big} dividend - The dividend Big instance.
 * @param {Big} divisor - The divisor Big instance.
 * @param {number} [precision] - The number of decimal places to keep in the result (optional). Defaults to 20.
 * @param {string} [roundingMode="half-up"] - The rounding mode to apply: "half-up" rounds ties away from zero, "down" toward zero, and "up" away from zero.
 * @returns {Big} - The mutated dividend instance.
 * @throws {Error} Division by zero is not allowed.
 *
 * @category Operations
 *
 * @example
 * divBig(new Big(10), new Big(3)).toString(); // "3.33333333333333333333"
 * divBig(new Big(10), new Big(3), 0).toString(); // "3"
 * divBig(new Big(10), new Big(3), 2).toString(); // "3.33"
 * divBig(new Big(10), new Big(3), 2, "down").toString(); // "3.33"
 * divBig(new Big(10), new Big(3), 2, "up").toString(); // "3.34"
 * divBig(new Big(-10), new Big(3), 2, "up").toString(); // "-3.34"
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

  const resultScale = Math.max(0, precision);
  if (!Number.isSafeInteger(resultScale)) throw new Error("Prec");
  if (dividend.value === ZERO_BIGINT) {
    dividend.scale = resultScale;
    return dividend;
  }

  const scaleDifference = divisor.scale - dividend.scale;
  let exponent = scaleDifference + resultScale;
  let safeExponent = Number.isSafeInteger(scaleDifference) && Number.isSafeInteger(exponent);
  let exponentBig: bigint | undefined;
  if (!safeExponent) {
    if (!Number.isSafeInteger(dividend.scale) || !Number.isSafeInteger(divisor.scale)) throw new Error("Prec");
    exponentBig = BigInt(divisor.scale) - BigInt(dividend.scale) + BigInt(resultScale);
    safeExponent = exponentBig >= BigInt(Number.MIN_SAFE_INTEGER) && exponentBig <= BigInt(Number.MAX_SAFE_INTEGER);
    if (safeExponent) exponent = Number(exponentBig);
  }

  if (!safeExponent || exponent < -255) {
    if (exponentBig === undefined) exponentBig = BigInt(exponent);
    const dividendMagnitude = dividend.value < ZERO_BIGINT ? -dividend.value : dividend.value;
    const divisorMagnitude = divisor.value < ZERO_BIGINT ? -divisor.value : divisor.value;
    if (compareAbsoluteScaled(dividendMagnitude, exponentBig, divisorMagnitude, 0n) < 0) {
      const shouldRoundUp =
        roundingMode === "up" ||
        (roundingMode !== "down" &&
          compareAbsoluteScaled(dividendMagnitude * 2n, exponentBig, divisorMagnitude, 0n) >= 0);
      dividend.value = shouldRoundUp
        ? dividend.value < ZERO_BIGINT !== divisor.value < ZERO_BIGINT
          ? -ONE_BIGINT
          : ONE_BIGINT
        : ZERO_BIGINT;
      dividend.scale = resultScale;
      return dividend;
    }
  }

  if (!safeExponent) throw new Error("Prec");
  const adjustedDividend = exponent > 0 ? dividend.value * pow10(exponent) : dividend.value;
  const adjustedDivisor = exponent < 0 ? divisor.value * pow10(-exponent) : divisor.value;

  const quotient = adjustedDividend / adjustedDivisor;
  if (roundingMode === "down") {
    dividend.value = quotient;
    dividend.scale = resultScale;
    return dividend;
  }

  const remainder = adjustedDividend % adjustedDivisor;

  let finalQuotient = quotient;
  if (remainder !== ZERO_BIGINT) {
    let roundAway = roundingMode === "up";
    if (!roundAway) {
      const absRemainder = remainder < ZERO_BIGINT ? -remainder : remainder;
      const absDivisor = adjustedDivisor < ZERO_BIGINT ? -adjustedDivisor : adjustedDivisor;
      roundAway = absRemainder >= absDivisor - absRemainder;
    }
    if (roundAway) {
      finalQuotient += adjustedDividend < ZERO_BIGINT !== adjustedDivisor < ZERO_BIGINT ? -ONE_BIGINT : ONE_BIGINT;
    }
  }

  dividend.value = finalQuotient;
  dividend.scale = resultScale;
  return dividend;
}
