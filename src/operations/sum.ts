import type { Big } from "../big.js";
import type { BigValue } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { createBig } from "../utils/create.js";
import { readBigOperand } from "../utils/read-big-operand.js";
import { addInPlace } from "./add.js";

/**
 * Sums an iterable of decimal values exactly without mutating its items.
 * An empty iterable returns zero.
 *
 * @param values - The decimals to add. Primitives, Big and BigObject are accepted.
 * @returns A new Big holding the sum.
 * @category Operations
 * @example
 * sumBig(["0.1", "0.2", 1n]).toString(); // "1.3"
 */
export function sumBig(values: Iterable<BigValue>): Big {
  const result = createBig(0n);
  for (const value of values) {
    const operand = readBigOperand(value);
    assertScale(operand.scale);
    if (operand.value === 0n) continue;
    if (result.value === 0n) {
      result.value = operand.value;
      result.scale = operand.scale;
    } else {
      addInPlace(result, operand);
    }
  }
  return result;
}
