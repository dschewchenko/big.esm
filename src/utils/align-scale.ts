import type { Big } from "../big";
import { pow10 } from "./pow10";

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
 * console.log(x.toString()); // "123.456000"
 * console.log(y.toString()); // "123.456789"
 */
export function alignScale(a: Big, b: Big): [Big, Big] {
  // Calculate the difference in scales
  const scaleDifference = a.scale - b.scale;

  // If the scales are already equal, return the original instances
  if (scaleDifference === 0) {
    return [a, b];
  }

  // Scale the smaller one in-place
  const multiplier = pow10(Math.abs(scaleDifference));

  if (scaleDifference > 0) {
    b.value *= multiplier;
    b.scale = a.scale;
    return [a, b];
  }

  a.value *= multiplier;
  a.scale = b.scale;
  return [a, b];
}
