import type { Big } from "../big";
import type { BigObject } from "../types";
import { ZERO_BIGINT } from "./constants";
import { createBig } from "./create";

const NUMERIC_PATTERN = /^(-)?(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/;

/**
 * Convert a number or string to normal string number. Supports scientific notation.
 *
 * @param {string | number} num - The number to convert
 * @param {boolean} [ignoreFraction=false] - Whether to ignore the fractional part of the number. Defaults to false.
 * @param {boolean} [returnInstance=true] - Whether to return a Big instance or BigObject. Defaults to true.
 *
 * @return {Big | BigObject} - A Big instance or BigObject representing the number
 * @throws {Error} - If the number is too big or too small
 * @throws {Error} - If the number is invalid
 *
 * @category Utilities
 *
 * @example
 * fromString("123.456"); // Big { value: 123456n, scale: 3 }
 * fromString("123.456", true); // Big { value: 123n, scale: 0 }
 * fromString("123.456", false, false); // { value: 123456n, scale: 3 }
 * fromString("1.5e3"); // Big { value: 1500n, scale: 0 }
 *
 */
export function fromString(num: string | number, ignoreFraction?: boolean, returnInstance?: true): Big;
export function fromString(num: string | number, ignoreFraction: boolean | undefined, returnInstance: false): BigObject;
export function fromString<Type extends boolean>(
  num: string | number,
  ignoreFraction?: boolean,
  returnInstance?: Type
): Type extends true ? Big : BigObject;
export function fromString(
  num: string | number,
  ignoreFraction: boolean | undefined,
  returnInstance: boolean
): Big | BigObject;
export function fromString(num: string | number, ignoreFraction = false, returnInstance = true): Big | BigObject {
  const strNum = typeof num === "number" ? String(num) : num;

  const match = NUMERIC_PATTERN.exec(strNum);
  if (!match) throw new Error("Num");

  const sign = match[1] ? "-" : "";
  const integer = match[2] || "";
  const fraction = match[3] || "";

  if (integer.length === 0 && fraction.length === 0) throw new Error("Num");

  const exponent = Number.parseInt(match[4] || "0", 10);
  if (!Number.isSafeInteger(exponent)) throw new Error("Exp");
  let scale = fraction.length - exponent;
  if (!Number.isSafeInteger(scale)) throw new Error("Exp");
  let digits = integer + fraction;

  if (scale < 0) {
    if (/[1-9]/.test(digits)) digits += "0".repeat(-scale);
    scale = 0;
  } else if (ignoreFraction && scale > 0) {
    digits = scale >= digits.length ? "0" : digits.slice(0, -scale);
    scale = 0;
  }

  const value = BigInt(sign + digits);
  if (value === ZERO_BIGINT) return returnInstance ? createBig(ZERO_BIGINT) : { value: ZERO_BIGINT, scale: 0 };
  return returnInstance ? createBig(value, scale) : { value, scale };
}
