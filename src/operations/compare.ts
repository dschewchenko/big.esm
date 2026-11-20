import type { Big } from "../big.js";
import type { CompareResult } from "../types.js";
import { compareAbsoluteScaled } from "../utils/decimal-magnitude.js";
import { pow10 } from "../utils/pow10.js";

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
  if (a.scale === b.scale) {
    if (a.value > b.value) return 1;
    if (a.value < b.value) return -1;
    return 0;
  }

  if (a.value < 0n && b.value >= 0n) return -1;
  if (a.value >= 0n && b.value < 0n) return 1;

  const scaleDifference = a.scale - b.scale;
  if (Number.isSafeInteger(scaleDifference) && Math.abs(scaleDifference) <= 21) {
    const multiplier = pow10(Math.abs(scaleDifference));
    const alignedA = scaleDifference > 0 ? a.value : a.value * multiplier;
    const alignedB = scaleDifference < 0 ? b.value : b.value * multiplier;
    if (alignedA > alignedB) return 1;
    if (alignedA < alignedB) return -1;
    return 0;
  }

  const sign = a.value < 0n ? -1 : 1;
  const magnitudeComparison = compareAbsoluteScaled(a.value, -BigInt(a.scale), b.value, -BigInt(b.scale));
  return magnitudeComparison === 0 ? 0 : ((sign * magnitudeComparison) as CompareResult);
};
