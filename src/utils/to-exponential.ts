import type { Big } from "../big.js";
import { assertScale } from "./assert-scale.js";
import { fractionalEnd } from "./trim-zeros.js";

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
  const digits = big.value.toString();
  const start = digits.charCodeAt(0) === 45 ? 2 : 1;
  const highestPlace = digits.length - start;
  const exponent = highestPlace - big.scale;
  const exactExponent = Number.isSafeInteger(exponent) ? exponent : BigInt(highestPlace) - BigInt(big.scale);
  const end = fractionalEnd(digits, start);
  const integer = digits.slice(0, start);
  const mantissa = end === start ? integer : `${integer}.${digits.slice(start, end)}`;
  return `${mantissa}e${exactExponent < 0 ? "" : "+"}${exactExponent}`;
}
