import type { Big } from "../big";
import { compareAbsoluteScaled } from "../utils/decimal-magnitude";
import { isZero } from "../utils/is-zero";
import { pow10 } from "../utils/pow10";

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
 * modBig(new Big(10), new Big(3)).toString(); // "1"
 * modBig(new Big(3), new Big(10)).toString(); // "3"
 * modBig(new Big(10), new Big(10)).toString(); // "0"
 */
export function modBig(dividend: Big, divisor: Big): Big {
  if (isZero(divisor)) {
    throw new Error("Div0");
  }

  const scaleDifference = dividend.scale - divisor.scale;
  if (scaleDifference === 0) {
    dividend.value %= divisor.value;
    return dividend;
  }
  if (scaleDifference > 0) {
    if (scaleDifference > 21) {
      if (isZero(dividend)) return dividend;
      if (!Number.isSafeInteger(dividend.scale) || !Number.isSafeInteger(divisor.scale)) throw new Error("Scale");
      const shift = BigInt(dividend.scale) - BigInt(divisor.scale);
      if (compareAbsoluteScaled(divisor.value, shift, dividend.value, 0) > 0) return dividend;
    }
    dividend.value %= divisor.value * pow10(scaleDifference);
  } else if (scaleDifference >= -21) {
    dividend.value = (dividend.value * pow10(-scaleDifference)) % divisor.value;
    dividend.scale = divisor.scale;
  } else {
    if (!Number.isSafeInteger(dividend.scale) || !Number.isSafeInteger(divisor.scale)) throw new Error("Scale");
    const exponent = BigInt(divisor.scale) - BigInt(dividend.scale);
    const divisorMagnitude = divisor.value < 0n ? -divisor.value : divisor.value;
    const remainder = dividend.value % divisor.value;
    dividend.value =
      remainder === 0n ? remainder : (remainder * pow10Modulo(exponent, divisorMagnitude)) % divisor.value;
    dividend.scale = divisor.scale;
  }
  return dividend;
}

function pow10Modulo(exp: bigint, modulus: bigint): bigint {
  let power = 10n % modulus;
  let result = 1n;
  let exponent = exp;

  while (exponent > 0n) {
    if (exponent & 1n) result = (result * power) % modulus;
    exponent >>= 1n;
    if (exponent > 0n) power = (power * power) % modulus;
  }

  return result;
}
