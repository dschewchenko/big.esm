import { Big } from "../big.js";
import type { BigValue } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { MAX_DECIMAL_EXPANSION } from "../utils/constants.js";
import { readBigOperand } from "../utils/read-big-operand.js";
import { addInPlace } from "./add.js";

/**
 * Sums an iterable of decimal values exactly without mutating its items.
 * An empty iterable returns zero.
 * Widely separated scales are accumulated separately so large terms can cancel before alignment.
 *
 * @param values - The decimals to add. Primitives, Big and BigObject are accepted.
 * @returns A new Big holding the sum.
 * @throws If an input scale is invalid or the exact sum exceeds the runtime's BigInt limits.
 * @category Operations
 * @example
 * sumBig(["0.1", "0.2", 1n]).toString(); // "1.3"
 */
export function sumBig(values: Iterable<BigValue>): Big {
  let result = new Big(0n);
  let byScale: Map<number, bigint> | undefined;
  for (const value of values) {
    const operand = readBigOperand(value);
    assertScale(operand.scale);
    if (operand.value === 0n) continue;
    if (byScale) {
      addAtScale(byScale, operand.scale, operand.value);
    } else if (result.value === 0n) {
      result.value = operand.value;
      result.scale = operand.scale;
    } else if (result.scale === operand.scale) {
      result.value += operand.value;
    } else if (Math.abs(result.scale - operand.scale) > MAX_DECIMAL_EXPANSION) {
      byScale = new Map([[result.scale, result.value]]);
      addAtScale(byScale, operand.scale, operand.value);
    } else {
      addInPlace(result, operand);
    }
  }
  if (byScale) {
    const groups: Big[] = [];
    result.value = 0n;
    result.scale = 0;
    const scales = [...byScale.keys()].sort((a, b) => a - b);
    for (const scale of scales) {
      const value = byScale.get(scale)!;
      if (result.value === 0n) {
        result.value = value;
        result.scale = scale;
      } else if (scale - result.scale > MAX_DECIMAL_EXPANSION) {
        groups.push(result);
        result = new Big(value, scale);
      } else {
        addInPlace(result, { value, scale });
      }
    }
    // Align distant groups only after each group has had a chance to cancel.
    for (let index = groups.length - 1; index >= 0; index--) {
      const group = groups[index];
      if (result.value !== 0n) addInPlace(group, result);
      result = group;
    }
  }
  return result;
}

function addAtScale(byScale: Map<number, bigint>, scale: number, value: bigint): void {
  const total = (byScale.get(scale) ?? 0n) + value;
  if (total === 0n) byScale.delete(scale);
  else byScale.set(scale, total);
}
