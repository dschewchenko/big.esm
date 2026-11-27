import { Big } from "../big.js";
import type { BigValue } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { MAX_MATERIALIZED_ZEROS } from "../utils/constants.js";
import { isPositiveOne } from "../utils/decimal-magnitude.js";

/**
 * Raises a value to an integer power without mutating the input.
 *
 * @param value - The base number.
 * @param exp - A non-negative safe integer exponent. Defaults to 2.
 * @returns A new Big instance containing the power.
 * @throws If the exponent or resulting scale is invalid.
 *
 * @category Operations
 *
 * @example
 * pow("1.25", 2).toString(); // "1.5625"
 */
export function pow(value: BigValue, exp = 2): Big {
  return powInPlace(new Big(value), exp);
}

/**
 * Raises a Big number to the power and mutates the base instance.
 *
 * @category Operations
 */
export function powInPlace(big: Big, exp = 2): Big {
  if (!Number.isSafeInteger(exp) || exp < 0) {
    throw new Error("Exp");
  }

  const baseScale = big.scale;
  assertScale(baseScale);
  const scale = baseScale * exp;
  if (!Number.isSafeInteger(scale) || scale > MAX_MATERIALIZED_ZEROS) return powerAtWideScale(big, exp, scale);
  big.value = big.value ** BigInt(exp);
  big.scale = scale;
  return big;
}

function powerAtWideScale(big: Big, exp: number, scale: number): Big {
  const value = big.value;
  const negative = value < 0n;
  if (isPositiveOne(negative ? -value : value, big.scale)) {
    big.value = negative && exp % 2 !== 0 ? -1n : 1n;
    big.scale = 0;
    return big;
  }
  if (!Number.isSafeInteger(scale)) {
    if (value !== 0n) throw new Error("Scale");
    scale = 0;
  }
  big.value = value ** BigInt(exp);
  big.scale = scale;
  return big;
}

/** @deprecated Use {@link pow} for a non-mutating operation or {@link powInPlace} to mutate explicitly. */
export const powBig = powInPlace;
