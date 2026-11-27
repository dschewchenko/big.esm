import { Big } from "../big.js";
import type { BigValue } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { MAX_DECIMAL_EXPANSION } from "../utils/constants.js";
import { pow10 } from "../utils/pow10.js";
import { readBigOperand } from "../utils/read-big-operand.js";
import { addInPlace } from "./add.js";

/**
 * Sums an iterable of decimal values exactly without mutating its items.
 * An empty iterable returns zero.
 * Widely separated scales are accumulated separately so large terms can cancel before alignment.
 *
 * @param values - The decimals to add. Primitives, Big and BigObject are accepted.
 * @returns A new Big holding the sum.
 * @throws If an input scale is invalid or the exact sum exceeds the decimal expansion limit.
 * @category Operations
 * @example
 * sumBig(["0.1", "0.2", 1n]).toString(); // "1.3"
 */
export function sumBig(values: Iterable<BigValue>): Big {
  let coefficient = 0n;
  let scale = 0;
  let byScale: Map<number, bigint> | undefined;
  for (const input of values) {
    const operand = readBigOperand(input);
    const operandScale = operand.scale;
    const sameScale = scale === operandScale;
    // Equal scales have already been validated through the running scale.
    if (!sameScale) assertScale(operandScale);
    const operandValue = operand.value;
    if (operandValue === 0n) continue;
    if (byScale) {
      addAtScale(byScale, operandScale, operandValue);
    } else if (coefficient === 0n) {
      coefficient = operandValue;
      scale = operandScale;
    } else if (sameScale) {
      coefficient += operandValue;
    } else {
      const difference = scale - operandScale;
      if (Math.abs(difference) > MAX_DECIMAL_EXPANSION) {
        byScale = new Map([[scale, coefficient]]);
        addAtScale(byScale, operandScale, operandValue);
      } else if (difference > 0) {
        coefficient += operandValue * pow10(difference);
      } else {
        coefficient = coefficient * pow10(-difference) + operandValue;
        scale = operandScale;
      }
    }
  }
  if (!byScale) return new Big(coefficient, scale);
  let result = new Big(0n);
  const groups: Big[] = [];
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
  return result;
}

function addAtScale(byScale: Map<number, bigint>, scale: number, value: bigint): void {
  const total = (byScale.get(scale) ?? 0n) + value;
  if (total === 0n) byScale.delete(scale);
  else byScale.set(scale, total);
}
