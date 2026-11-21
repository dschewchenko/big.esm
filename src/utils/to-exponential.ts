import type { Big } from "../big.js";
import { assertScale } from "./assert-scale.js";
import { trimZeros } from "./trim-zeros.js";

/**
 * Formats a Big in exact scientific notation, without mutating it or padding the coefficient with zeros.
 *
 * @param big - The number to format.
 * @returns A normalized coefficient and its base-ten exponent.
 *
 * @category Utilities
 *
 * @example
 * toExponential(createBig("1e-10000000000")); // "1e-10000000000"
 */
export function toExponential(big: Big): string {
  assertScale(big.scale);
  if (big.value === 0n) return "0e+0";
  const sign = big.value < 0n ? "-" : "";
  const digits = (big.value < 0n ? -big.value : big.value).toString();
  const highestPlace = digits.length - 1;
  const exponent = highestPlace - big.scale;
  const exactExponent = Number.isSafeInteger(exponent) ? exponent : BigInt(highestPlace) - BigInt(big.scale);
  const fraction = trimZeros(digits.slice(1));
  const mantissa = fraction ? `${digits[0]}.${fraction}` : digits[0];
  return `${sign}${mantissa}e${exactExponent < 0 ? "" : "+"}${exactExponent}`;
}
