import type { Big } from "../big.js";
import type { RoundingMode } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { roundCoefficient, validateDecimalPlaces } from "../utils/rounding.js";

/**
 * Rounds a Big in place to at most the requested number of decimal places.
 *
 * @param big - The number to round and return.
 * @param decimalPlaces - The maximum number of decimal places. Defaults to zero.
 * @param roundingMode - The rounding rule. Defaults to half-up.
 * @throws If decimalPlaces is not a non-negative safe integer.
 *
 * @category Operations
 *
 * @example
 * roundBig(createBig("1.125"), 2, "half-even").toString(); // "1.12"
 */
export function roundBig(big: Big, decimalPlaces = 0, roundingMode: RoundingMode = "half-up"): Big {
  assertScale(big.scale);
  validateDecimalPlaces(decimalPlaces);
  if (big.scale > decimalPlaces) {
    big.value = roundCoefficient(big.value, big.scale - decimalPlaces, roundingMode);
    big.scale = decimalPlaces;
  }
  return big;
}
