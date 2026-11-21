import type { BigObject } from "../types.js";
import { ZERO_BIGINT } from "./constants.js";
import { readShortDecimal } from "./short-decimal.js";

export const NUMERIC_PATTERN = /^(-)?(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/;

export function decimalScale(fractionLength: number, exponentText: string | undefined): number {
  if (exponentText === undefined) return fractionLength;
  const exponent = Number(exponentText);
  return Number.isSafeInteger(exponent) ? fractionLength - exponent : NaN;
}

export function parseDecimal(num: string | number, ignoreFraction = false, compactPositiveExponent = false): BigObject {
  const strNum = typeof num === "number" ? String(num) : num;

  if (!ignoreFraction && typeof strNum === "string") {
    const short = readShortDecimal(strNum);
    if (short !== undefined) return { value: BigInt(short.value), scale: short.scale };
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

  if (scale < 0 && !compactPositiveExponent) {
    if (/[1-9]/.test(digits)) digits += "0".repeat(-scale);
    scale = 0;
  } else if (ignoreFraction && scale > 0) {
    digits = scale >= digits.length ? "0" : digits.slice(0, -scale);
    scale = 0;
  }

  const value = BigInt(sign + digits);
  return { value, scale: value === ZERO_BIGINT ? 0 : scale };
}
