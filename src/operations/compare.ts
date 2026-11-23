import type { Big } from "../big.js";
import type { BigObject, BigValue, CompareResult } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { compareAbsoluteScaled } from "../utils/decimal-magnitude.js";
import { pow10 } from "../utils/pow10.js";
import { readBigOperand } from "../utils/read-big-operand.js";

/** @inline */
type BigComparison = (a: Big, b: Big) => CompareResult;

/**
 * Compares two decimal values.
 *
 * @param a - The first decimal value.
 * @param b - The second decimal value.
 * @returns -1 if a < b, 0 if they are equal, or 1 if a > b.
 *
 * @category Operations
 *
 * @example
 * compare("1.25", "1.2500"); // 0
 * compare(1n, "1.25"); // -1
 */
export function compare(a: BigValue, b: BigValue): CompareResult {
  return compareParts(readBigOperand(a), readBigOperand(b));
}

/** Compares two Big instances without modifying them. */
export const compareBig: BigComparison = compareParts;

function compareParts(a: BigObject, b: BigObject): CompareResult {
  assertScale(a.scale);
  assertScale(b.scale);
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
}
