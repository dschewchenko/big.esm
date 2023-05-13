import { createBig } from "./create.ts";
import type { Big } from "../big";

/**
 * Aligns the scale(decimal places) of two Big instances before performing arithmetic operations.
 * It takes two Big instances as input and returns a tuple (array) of two new Big instances with the same scale.
 *
 * When the scales of the two input instances are different, the function adjusts the value and scale of one of the instances so that their scales are equal, allowing the arithmetic operations to be performed correctly.
 *
 * Note: This function does not modify the input instances. It creates new instances with the aligned scales.
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

  // If scaleDifference is positive, adjust the value and scale of the second Big instance
  if (scaleDifference > 0) {
    const otherValue = b.value * BigInt(10 ** scaleDifference);
    return [a, createBig(otherValue, a.scale)];
  }

  // If scaleDifference is negative, adjust the value and scale of the first Big instance
  if (scaleDifference < 0) {
    const value = a.value * BigInt(10 ** -scaleDifference);
    return [createBig(value, b.scale), b];
  }

  // If the scales are already equal, return the original instances
  return [a, b];
}
