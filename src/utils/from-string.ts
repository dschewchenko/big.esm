import type { Big } from "../big";
import type { BigObject } from "../types";
import { ZERO_BIGINT } from "./constants";
import { createBig } from "./create";

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
export function fromString<Type extends boolean>(
  num: string | number,
  ignoreFraction?: boolean,
  returnInstance?: Type
): Type extends true ? Big : BigObject;
export function fromString(num: string | number, ignoreFraction = false, returnInstance = true): Big | BigObject {
  const strNum = typeof num === "number" ? String(num) : num;

  const match = /^(-)?(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(strNum);
  if (!match) throw new Error("Num");

  const sign = match[1] ? "-" : "";
  let integer = match[2] || "";
  let fraction = match[3] || "";

  if (integer.length === 0 && fraction.length === 0) {
    throw new Error("Num");
  }

  if (ignoreFraction) fraction = "";

  const exponentInt = Number.parseInt(match[4] || "0", 10);
  if (!Number.isFinite(exponentInt)) throw new Error("Exp");

  if (exponentInt > 0) {
    const move = Math.min(exponentInt, fraction.length);
    integer += fraction.slice(0, move);
    fraction = fraction.slice(move);
    if (move < exponentInt) integer += "0".repeat(exponentInt - move);
  } else if (exponentInt < 0) {
    const move = Math.min(-exponentInt, integer.length);
    fraction = integer.slice(-move) + fraction;
    integer = integer.slice(0, integer.length - move);
    if (move < -exponentInt) fraction = "0".repeat(-exponentInt - move) + fraction;
  }

  const value = BigInt(sign + integer + fraction);
  const scale = fraction.length;
  if (value === ZERO_BIGINT) return returnInstance ? createBig(ZERO_BIGINT) : { value: ZERO_BIGINT, scale: 0 };

  // return instance or object
  return returnInstance ? createBig(value, scale) : { value, scale };
}
