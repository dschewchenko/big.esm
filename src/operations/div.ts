import type { Big } from "../big.js";
import type { RoundingMode } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { DEFAULT_PRECISION, MAX_DECIMAL_EXPANSION, MAX_DECIMAL_PLACES, ZERO_BIGINT } from "../utils/constants.js";
import { compareAbsoluteScaled } from "../utils/decimal-magnitude.js";
import { isZero } from "../utils/is-zero.js";
import { pow10 } from "../utils/pow10.js";
import { divideRounded, roundTinyAway } from "../utils/rounding.js";

/**
 * Divides two Big instances and mutates the dividend with the result.
 *
 * @param {Big} dividend - The dividend Big instance.
 * @param {Big} divisor - The divisor Big instance.
 * @param {number} [precision] - Decimal places to keep, from 0 to 1,000,000. Defaults to 20.
 * @param {RoundingMode} [roundingMode="half-up"] - The rule used to round the quotient.
 * @returns {Big} - The mutated dividend instance.
 * @throws If the divisor is zero, the precision is invalid, or scale alignment would expand by more than 2,000,000 places.
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
  if (!Number.isSafeInteger(resultScale) || resultScale > MAX_DECIMAL_PLACES) throw new RangeError("Prec");
  assertScale(dividend.scale);
  assertScale(divisor.scale);
  if (dividend.value === ZERO_BIGINT) {
    dividend.scale = resultScale;
    return dividend;
  }

  const scaleDifference = divisor.scale - dividend.scale;
  let exponent = scaleDifference + resultScale;
  let safeExponent = Number.isSafeInteger(scaleDifference) && Number.isSafeInteger(exponent);
  let exponentBig: bigint | undefined;
  if (!safeExponent) {
    exponentBig = BigInt(divisor.scale) - BigInt(dividend.scale) + BigInt(resultScale);
    safeExponent = exponentBig >= BigInt(Number.MIN_SAFE_INTEGER) && exponentBig <= BigInt(Number.MAX_SAFE_INTEGER);
    if (safeExponent) exponent = Number(exponentBig);
  }

  if (!safeExponent || exponent < -255 || exponent > MAX_DECIMAL_EXPANSION) {
    if (exponentBig === undefined) exponentBig = BigInt(exponent);
    const dividendMagnitude = dividend.value < ZERO_BIGINT ? -dividend.value : dividend.value;
    const divisorMagnitude = divisor.value < ZERO_BIGINT ? -divisor.value : divisor.value;
    if (compareAbsoluteScaled(dividendMagnitude, exponentBig, divisorMagnitude, 0n) < 0) {
      const sign = dividend.value < ZERO_BIGINT !== divisor.value < ZERO_BIGINT ? -1 : 1;
      const shouldRoundUp = roundTinyAway(dividendMagnitude, exponentBig, divisorMagnitude, roundingMode, sign);
      dividend.value = shouldRoundUp ? BigInt(sign) : ZERO_BIGINT;
      dividend.scale = resultScale;
      return dividend;
    }
  }

  if (!safeExponent || Math.abs(exponent) > MAX_DECIMAL_EXPANSION) {
    throw new RangeError("Division exceeds the decimal expansion limit");
  }
  const adjustedDividend = exponent > 0 ? dividend.value * pow10(exponent) : dividend.value;
  const adjustedDivisor = exponent < 0 ? divisor.value * pow10(-exponent) : divisor.value;

  dividend.value = divideRounded(adjustedDividend, adjustedDivisor, roundingMode);
  dividend.scale = resultScale;
  return dividend;
}
