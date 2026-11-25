import type { Big } from "../big.js";
import type { RoundingMode } from "../types.js";
import { assertScale } from "./assert-scale.js";
import { MAX_DECIMAL_EXPANSION, MAX_DECIMAL_PLACES } from "./constants.js";
import { roundCoefficient, validateDecimalPlaces, validateRoundingMode } from "./rounding.js";

/**
 * Formats a Big with exactly the requested number of decimal places, without mutating it.
 *
 * @param big - The number to format.
 * @param decimalPlaces - Places to display, from 0 to 1,000,000, including trailing zeros. Defaults to zero.
 * @param roundingMode - The rounding rule. Defaults to half-up.
 * @throws If decimalPlaces or roundingMode is invalid, or fixed notation would require more than 2,000,000 added zeros.
 *
 * @category Utilities
 *
 * @example
 * toFixed(createBig("1.005"), 2, "half-even"); // "1.00"
 */
export function toFixed(big: Big, decimalPlaces = 0, roundingMode: RoundingMode = "half-up"): string {
  validateDecimalPlaces(decimalPlaces);
  if (decimalPlaces > MAX_DECIMAL_PLACES) throw new RangeError("Prec");
  if (roundingMode !== "half-up") validateRoundingMode(roundingMode);
  assertScale(big.scale);
  const scale = Math.min(big.scale, decimalPlaces);
  const coefficient = big.scale > scale ? roundCoefficient(big.value, big.scale - scale, roundingMode) : big.value;
  const sign = big.value < 0n ? "-" : "";
  const digits = (coefficient < 0n ? -coefficient : coefficient).toString();

  if (scale <= 0) {
    if (coefficient !== 0n && decimalPlaces - scale > MAX_DECIMAL_EXPANSION) {
      throw new RangeError("Fixed notation exceeds the decimal expansion limit. Use toExponential.");
    }
    const integer = scale < 0 && coefficient !== 0n ? digits + "0".repeat(-scale) : digits;
    return decimalPlaces === 0 ? sign + integer : `${sign}${integer}.${"0".repeat(decimalPlaces)}`;
  }

  const point = Math.max(0, digits.length - scale);
  const integer = digits.slice(0, point) || "0";
  const fraction = digits.slice(point).padStart(scale, "0").padEnd(decimalPlaces, "0");
  return `${sign}${integer}.${fraction}`;
}
