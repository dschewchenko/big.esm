import type { Big } from "../big.js";
import { ZERO_BIGINT } from "./constants.js";
import { pow10 } from "./pow10.js";

/**
 * Aligns the scale(decimal places) of two Big instances before performing arithmetic operations.
 * It takes two Big instances as input and mutates the one with the smaller scale to match the other.
 *
 * When the scales of the two input instances are different, the function adjusts the value and scale of one of the instances so that their scales are equal, allowing the arithmetic operations to be performed correctly.
 *
 * @param {Big} a - The first Big instance.
 * @param {Big} b - The second Big instance.
 * @returns {[Big, Big]} A tuple of two Big instances with the same scale.
 *
 * @category Utilities
 *
 * @example
 * const a = new Big(123.456);
 * const b = new Big(123.456789);
 * const [x, y] = alignScale(a, b);
 * console.log(x.toString(false)); // "123.456000"
 * console.log(y.toString()); // "123.456789"
 */
export function alignScale(a: Big, b: Big): [Big, Big] {
  const scaleDifference = a.scale - b.scale;
  if (scaleDifference === 0) return [a, b];

  if (scaleDifference > 0) {
    if (b.value !== ZERO_BIGINT) b.value *= pow10(scaleDifference);
    b.scale = a.scale;
  } else {
    if (a.value !== ZERO_BIGINT) a.value *= pow10(-scaleDifference);
    a.scale = b.scale;
  }
  return [a, b];
}
