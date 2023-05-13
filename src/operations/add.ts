import { createBig } from "../utils/create.ts";
import { alignScale } from "../utils/align-scale";
import type { Big } from "../big";

/**
 * Adds two big values.
 *
 * @param {Big} a - The first value to add.
 * @param {Big} b - The second value to add.
 * @returns {Big} The sum of the two values.
 *
 * @category Operations
 *
 * @example
 * addBig(new Big(1), new Big(2)); // new Big instance with value 3
 * addBig(new Big(1.1), new Big(2.2)); // new Big instance with value 3.3
 * addBig(new Big(1.1), new Big(2)); // new Big instance with value 3.1
 */
export function addBig(a: Big, b: Big): Big {
  // Align the scales of the two Big values using the `alignScale` utility function
  const [alignedA, alignedB] = alignScale(a, b);

  // Perform the addition by adding the values of the aligned Big instances
  const resultValue = alignedA.value + alignedB.value;

  // Create a new Big instance with the sum value and the scale of the aligned Big instances
  return createBig(resultValue, alignedA.scale);
}
