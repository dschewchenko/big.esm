import type { Big } from "../big";
import type { CompareResult } from "../types";
import { alignScale } from "../utils/align-scale";

/**
 * Compares two Big numbers and returns a CompareResult indicating the relation between them.
 *
 * @param {Big} a - The first Big number to compare.
 * @param {Big} b - The second Big number to compare.
 * @returns {CompareResult} - 1 if a > b, -1 if a < b, or 0 if a == b.
 *
 * @category Operations
 *
 * @example
 * compareBig(new Big(1), new Big(2)); // -1
 * compareBig(new Big(2), new Big(1)); // 1
 * compareBig(new Big(1), new Big(1)); // 0
 */
export const compareBig = (a: Big, b: Big): CompareResult => {
  // Align the scales of the two Big numbers using the `alignScale` utility function
  const [alignA, alignB] = alignScale(a, b);

  // Compare the values of the aligned Big numbers
  if (alignA.value > alignB.value) return 1;
  if (alignA.value < alignB.value) return -1;

  // If the values are equal, return 0
  return 0;
};
