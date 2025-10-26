import type { Big } from "../big";
import { TEN_BIGINT } from "./constants";
import { createBig } from "./create";

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
 * @param {boolean} [mutable=false] - Whether to mutate the both Big instances. Defaults to false.
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
export function alignScale(a: Big, b: Big, mutable = false): [Big, Big] {
  // Calculate the difference in scales
  const scaleDifference = a.scale - b.scale;

  // If the scales are already equal, return the original instances
  if (scaleDifference === 0) {
    return [a, b];
  }

  // Create new instances with aligned scales
  const multiplier = TEN_BIGINT ** BigInt(Math.abs(scaleDifference));

  if (mutable) {
    if (scaleDifference > 0) {
      b.value *= multiplier;
      b.scale = a.scale;
    } else {
      a.value *= multiplier;
      a.scale = b.scale;
    }

    return [a, b];
  }

  // Adjust the value and scale of the instances
  const adjustedA = scaleDifference > 0 ? a : createBig(a.value * multiplier, b.scale);
  const adjustedB = scaleDifference < 0 ? b : createBig(b.value * multiplier, a.scale);

  return [adjustedA, adjustedB];
}
