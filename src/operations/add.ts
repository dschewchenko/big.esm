import { Big } from "../big.js";
import type { BigBinaryOperation, BigValue } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { ZERO_BIGINT } from "../utils/constants.js";
import { pow10 } from "../utils/pow10.js";
import { readBigOperand } from "../utils/read-big-operand.js";

/**
 * Adds two values and returns a new Big instance.
 *
 * @param a - The first value.
 * @param b - The second value.
 * @returns A new Big instance containing the sum.
 *
 * @category Operations
 *
 * @example
 * add("1.1", "2.2").toString(); // "3.3"
 */
export function add(a: BigValue, b: BigValue): Big {
  return addTo(new Big(a), b);
}

/**
 * Adds a BigValue to a Big instance and mutates the first argument.
 *
 * @param a - The first value to add, replaced in place by the sum.
 * @param b - The second value to add. It is unchanged unless it is also `a`.
 * @returns The mutated first argument.
 *
 * @category Operations
 *
 * @example
 * addInPlace(new Big(1), new Big(2)); // the first instance, now 3
 * addInPlace(new Big("1.1"), "2.2"); // the first instance, now 3.3
 * addInPlace(new Big("1.1"), 2n); // the first instance, now 3.1
 */
export function addInPlace(a: Big, b: BigValue): Big {
  assertScale(a.scale);
  return addTo(a, b);
}

function addTo(a: Big, b: BigValue): Big {
  const right = readBigOperand(b);
  assertScale(right.scale);
  const scaleDifference = a.scale - right.scale;

  if (scaleDifference === 0) {
    a.value += right.value;
    return a;
  }

  if (scaleDifference > 0) {
    if (scaleDifference <= 63 || right.value !== ZERO_BIGINT) a.value += right.value * pow10(scaleDifference);
    return a;
  }

  a.value =
    scaleDifference >= -63 || a.value !== ZERO_BIGINT ? a.value * pow10(-scaleDifference) + right.value : right.value;
  a.scale = right.scale;
  return a;
}

/**
 * Mutates and returns the first operand. The third argument from v1 was removed in v2.
 *
 * @deprecated Use `add` for a new result or `addInPlace` to mutate the first operand.
 * @inlineType BigBinaryOperation
 */
export const addBig: BigBinaryOperation = addInPlace;
