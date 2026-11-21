import { Big } from "../big.js";
import type { BigValue } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { ZERO_BIGINT } from "../utils/constants.js";

/**
 * Returns the absolute value without mutating the input.
 *
 * @param value - The number to convert to its absolute value.
 * @returns A new Big instance containing the absolute value.
 *
 * @category Operations
 *
 * @example
 * abs("-12.5").toString(); // "12.5"
 */
export function abs(value: BigValue): Big {
  return absInPlace(new Big(value));
}

/**
 * Returns the absolute value and mutates the given Big instance.
 *
 * @category Operations
 */
export function absInPlace(big: Big): Big {
  assertScale(big.scale);
  big.value = big.value < ZERO_BIGINT ? -big.value : big.value;
  return big;
}

/** @deprecated Use {@link abs} for a non-mutating operation or {@link absInPlace} to mutate explicitly. */
export const absBig = absInPlace;
