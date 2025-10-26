import type { Big } from "../big";
import type { BigObject } from "../types";
import { ZERO_BIGINT } from "./constants";
import { createBig } from "./create";

/**
 * Convert a number or string to normal string number. Supports scientific notation.
 *
 * @param {string | number} num - The number to convert
 * @param {boolean} [ignoreFraction=false] - Whether to ignore the fractional part of the number. Defaults to false.
 * @param {boolean} [returnInstance=false] - Whether to return a Big instance or BigObject. Defaults to true.
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
  // Convert number to string for processing
  const strNum = num.toString();

  // Check if input is a valid number
  if (!Number.isFinite(Number(strNum))) throw new Error("Invalid number");

  // If the number is 0, return a new Big instance representing 0
  if (Number(strNum) === 0) return returnInstance ? createBig(ZERO_BIGINT) : { value: ZERO_BIGINT, scale: 0 };

  // Split the number into its base and exponent
  let [base, exponent] = strNum.split("e");
  const exponentPart = exponent ?? "0";

  // Store the sign of the number
  const sign = base.startsWith("-") ? "-" : "";
  base = sign ? base.slice(1) : base; // remove sign from base

  // Split the base into integer and fractional parts
  let [integer, fraction = ""] = base.split(".");

  fraction = ignoreFraction ? "" : fraction;

  // Convert the exponent to an integer
  const exponentInt = Number.parseInt(exponentPart, 10);

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

  // return instance or object
  return returnInstance ? createBig(value, scale) : { value, scale };
}
