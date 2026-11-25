import type { BigObject } from "../types.js";
import { ZERO_BIGINT } from "./constants.js";

/** Reads a short plain decimal with an exact integer coefficient. */
function parseShortDecimal(text: string): BigObject | undefined {
  const length = text.length;
  // At most 15 digits fit in a safe integer, including every prefix of the coefficient.
  if (length > 15) return undefined;
  const negative = text.charCodeAt(0) === 45;
  const start = negative ? 1 : 0;
  let value = 0;
  let point = -1;
  for (let index = start; index < length; index++) {
    const digit = text.charCodeAt(index) - 48;
    if (digit >= 0 && digit <= 9) {
      value = value * 10 + digit;
    } else if (digit === -2 && point < 0) {
      point = index;
    } else {
      return undefined;
    }
  }
  if (length === start || (point >= 0 && length === start + 1)) return undefined;

  return {
    value: BigInt(negative ? -value : value),
    scale: point < 0 || value === 0 ? 0 : length - point - 1
  };
}

export const NUMERIC_PATTERN = /^(-)?(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/;

export function decimalScale(fractionLength: number, exponentText: string | undefined): number {
  if (exponentText === undefined) return fractionLength;
  const exponent = Number(exponentText);
  return Number.isSafeInteger(exponent) ? fractionLength - exponent : NaN;
}

export function parseDecimal(num: string | number, ignoreFraction = false, maxExpandedZeros = Infinity): BigObject {
  if (typeof num === "number" && Number.isSafeInteger(num)) {
    return { value: BigInt(num), scale: 0 };
  }
  const strNum = typeof num === "number" ? String(num) : num;

  if (!ignoreFraction && typeof strNum === "string") {
    const short = parseShortDecimal(strNum);
    if (short !== undefined) return short;
  }

  const match = NUMERIC_PATTERN.exec(strNum);
  if (!match) throw new Error("Num");

  const sign = match[1] ? "-" : "";
  const integer = match[2] || "";
  const fraction = match[3] || "";

  if (integer.length === 0 && fraction.length === 0) throw new Error("Num");

  let scale = decimalScale(fraction.length, match[4]);
  if (!Number.isSafeInteger(scale)) throw new Error("Exp");
  let digits = integer + fraction;

  if (scale < 0 && -scale <= maxExpandedZeros) {
    if (/[1-9]/.test(digits)) digits += "0".repeat(-scale);
    scale = 0;
  } else if (ignoreFraction && scale > 0) {
    digits = scale >= digits.length ? "0" : digits.slice(0, -scale);
    scale = 0;
  }

  const value = BigInt(sign + digits);
  return { value, scale: value === ZERO_BIGINT ? 0 : scale };
}
