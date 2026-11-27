import { Big } from "../big.js";
import type { BigBinaryOperation, BigValue } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { MAX_MATERIALIZED_ZEROS, ZERO_BIGINT } from "../utils/constants.js";
import { pow10 } from "../utils/pow10.js";
import { readBigOperand } from "../utils/read-big-operand.js";

/** Subtracts the second value from the first and returns a new Big instance. */
export function sub(a: BigValue, b: BigValue): Big {
  return subtractFrom(new Big(a), b);
}

/** Subtracts a BigValue from a Big instance and mutates the first operand. */
export function subInPlace(a: Big, b: BigValue): Big {
  assertScale(a.scale);
  return subtractFrom(a, b);
}

function subtractFrom(a: Big, b: BigValue): Big {
  const right = readBigOperand(b);
  assertScale(right.scale);
  const scaleDifference = a.scale - right.scale;

  if (scaleDifference === 0) {
    a.value -= right.value;
    return a;
  }

  if (scaleDifference > 0 && (scaleDifference <= MAX_MATERIALIZED_ZEROS || a.value !== ZERO_BIGINT)) {
    if (right.value !== ZERO_BIGINT) a.value -= right.value * pow10(scaleDifference);
    return a;
  }

  if (right.value === ZERO_BIGINT && Math.abs(scaleDifference) > MAX_MATERIALIZED_ZEROS) return a;
  a.value = a.value === ZERO_BIGINT ? -right.value : a.value * pow10(-scaleDifference) - right.value;
  a.scale = right.scale;
  return a;
}

/**
 * @deprecated Use `sub` for a new result or `subInPlace` to mutate the first operand.
 * @inlineType BigBinaryOperation
 */
export const subBig: BigBinaryOperation = subInPlace;
