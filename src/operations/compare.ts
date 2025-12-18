import type { Big } from "../big";
import type { CompareResult } from "../types";
import { pow10 } from "../utils/pow10";

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
  const scaleDifference = a.scale - b.scale;

  if (scaleDifference === 0) {
    if (a.value > b.value) return 1;
    if (a.value < b.value) return -1;
    return 0;
  }

  const multiplier = pow10(Math.abs(scaleDifference));
  const alignAValue = scaleDifference > 0 ? a.value : a.value * multiplier;
  const alignBValue = scaleDifference < 0 ? b.value : b.value * multiplier;

  // Compare the values of the aligned Big numbers
  if (alignAValue > alignBValue) return 1;
  if (alignAValue < alignBValue) return -1;

  // If the values are equal, return 0
  return 0;
};
