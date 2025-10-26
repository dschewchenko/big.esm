import type { Big } from "../big";
import { alignScale } from "../utils/align-scale";
import { createBig } from "../utils/create";

/**
 * Subtracts two big values and returns the result as a new Big instance.
 *
 * @param {Big} a - The first Big instance.
 * @param {Big} b - The second Big instance.
 * @param {boolean} [mutable=false] - Whether to mutate the first Big instance. Defaults to false.
 * @returns {Big} The result of the subtraction.
 *
 * @category Operations
 *
 * @example
 * subBig(new Big(1), new Big(2)); // new Big instance with value -1
 * subBig(new Big(1.1), new Big(2.2)); // new Big instance with value -1.1
 */
export function subBig(a: Big, b: Big, mutable = false): Big {
  // Align the scales of the two Big instances
  const [alignedA, alignedB] = alignScale(a, b, mutable);

  // Subtract the aligned values
  const resultValue = alignedA.value - alignedB.value;

  // If the mutable parameter is true, mutate the first Big instance and return it
  if (mutable) {
    a.value = resultValue;
    return a;
  }

  // Create and return a new Big instance with the result value and the scale of the minuend
  return createBig(resultValue, alignedA.scale);
}
