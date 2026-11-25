import { Big } from "../big.js";
import type { BigValue, RoundingMode } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { roundCoefficient, validateDecimalPlaces, validateRoundingMode } from "../utils/rounding.js";

/**
 * Rounds a value to at most the requested number of decimal places without mutating the input.
 *
 * @param value - The number to round.
 * @param decimalPlaces - The maximum number of decimal places. Defaults to zero.
 * @param roundingMode - The rounding rule. Defaults to half-up.
 * @returns A new Big instance containing the rounded value.
 * @throws If decimalPlaces is not a non-negative safe integer or roundingMode is invalid.
 *
 * @category Operations
 *
 * @example
 * round("1.125", 2, "half-even").toString(); // "1.12"
 */
export function round(value: BigValue, decimalPlaces = 0, roundingMode: RoundingMode = "half-up"): Big {
  return roundInPlace(new Big(value), decimalPlaces, roundingMode);
}

/**
 * Rounds a Big in place to at most the requested number of decimal places.
 *
 * @param big - The number to round and return.
 * @param decimalPlaces - The maximum number of decimal places. Defaults to zero.
 * @param roundingMode - The rounding rule. Defaults to half-up.
 * @throws If decimalPlaces is not a non-negative safe integer or roundingMode is invalid.
 *
 * @category Operations
 *
 * @example
 * roundInPlace(new Big("1.125"), 2, "half-even").toString(); // "1.12"
 */
export function roundInPlace(big: Big, decimalPlaces = 0, roundingMode: RoundingMode = "half-up"): Big {
  assertScale(big.scale);
  validateDecimalPlaces(decimalPlaces);
  if (roundingMode !== "half-up") validateRoundingMode(roundingMode);
  if (big.scale > decimalPlaces) {
    big.value = roundCoefficient(big.value, big.scale - decimalPlaces, roundingMode);
    big.scale = decimalPlaces;
  }
  return big;
}

/** @deprecated Use {@link round} for a non-mutating operation or {@link roundInPlace} to mutate explicitly. */
export const roundBig = roundInPlace;
