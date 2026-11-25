import { Big } from "../big.js";
import type { BigValue } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { compareAbsoluteScaled } from "../utils/decimal-magnitude.js";
import { isZero } from "../utils/is-zero.js";
import { pow10 } from "../utils/pow10.js";
import { readBigOperand } from "../utils/read-big-operand.js";

const MAX_DIRECT_SCALE_DIFFERENCE = 128;

/** @inline */
type LegacyModOperation = (dividend: Big, divisor: Big) => Big;

/** Returns the remainder of two values in a new Big instance. */
export function mod(dividend: BigValue, divisor: BigValue): Big {
  return modInPlace(new Big(dividend), divisor);
}

/**
 * Performs modulo for a Big instance and any supported divisor, mutating the dividend.
 *
 * @param dividend - The dividend Big instance.
 * @param operand - The value representing the divisor.
 * @returns The mutated dividend instance.
 * @throws If the divisor is zero.
 *
 * @category Operations
 *
 * @example
 * modInPlace(new Big(10), new Big(3)).toString(); // "1"
 * modInPlace(new Big(3), new Big(10)).toString(); // "3"
 * modInPlace(new Big(10), 10).toString(); // "0"
 */
export function modInPlace(dividend: Big, operand: BigValue): Big {
  assertScale(dividend.scale);
  const divisor = readBigOperand(operand);
  assertScale(divisor.scale);
  if (divisor.value === 0n) {
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
  } else if (scaleDifference >= -MAX_DIRECT_SCALE_DIFFERENCE) {
    dividend.value = (dividend.value * pow10(-scaleDifference)) % divisor.value;
    dividend.scale = divisor.scale;
  } else {
    if (!Number.isSafeInteger(dividend.scale) || !Number.isSafeInteger(divisor.scale)) throw new Error("Scale");
    const remainder = dividend.value % divisor.value;
    dividend.value =
      remainder === 0n
        ? remainder
        : scaleRemainder(remainder, BigInt(divisor.scale) - BigInt(dividend.scale), divisor.value);
    dividend.scale = divisor.scale;
  }
  return dividend;
}

function scaleRemainder(remainder: bigint, exp: bigint, modulus: bigint): bigint {
  let power = 10n % modulus;
  let result = 1n;
  let exponent = exp;

  // Stop at the highest bit so the last square is never computed.
  while (exponent > 1n) {
    if (exponent & 1n) result = (result * power) % modulus;
    exponent >>= 1n;
    power = (power * power) % modulus;
  }

  return (((result * power) % modulus) * remainder) % modulus;
}

/** @deprecated Use `mod` for a new result or `modInPlace` to mutate the dividend. */
export const modBig: LegacyModOperation = modInPlace;
