import { Big } from "../big.js";
import type { BigBinaryOperation, BigValue } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { readBigOperand } from "../utils/read-big-operand.js";

/** Multiplies two values and returns a new Big instance. */
export function mul(a: BigValue, b: BigValue): Big {
  const left = new Big(a);
  return multiplyBy(left, b, left.scale);
}

/** Multiplies a Big instance by a BigValue and mutates the first operand. */
export function mulInPlace(a: Big, b: BigValue): Big {
  const leftScale = a.scale;
  assertScale(leftScale);
  return multiplyBy(a, b, leftScale);
}

function multiplyBy(a: Big, b: BigValue, leftScale: number): Big {
  const right = typeof b === "object" && b !== null ? b : readBigOperand(b);
  const coefficient = right.value;
  const rightScale = right.scale;
  if (typeof coefficient !== "bigint") throw new TypeError("Big");
  assertScale(rightScale);
  const scale = leftScale + rightScale;
  // The operands are safe integers, so only the magnitude of their sum can be invalid.
  if (Math.abs(scale) > Number.MAX_SAFE_INTEGER) return multiplyWithUnsafeScale(a, coefficient);
  a.value *= coefficient;
  a.scale = scale;
  return a;
}

function multiplyWithUnsafeScale(a: Big, coefficient: bigint): Big {
  if (a.value !== 0n && coefficient !== 0n) throw new Error("Scale");
  // Zero is exact even when the combined scale cannot be stored.
  a.value = 0n;
  a.scale = 0;
  return a;
}

/**
 * @deprecated Use `mul` for a new result or `mulInPlace` to mutate the first operand.
 * @inlineType BigBinaryOperation
 */
export const mulBig: BigBinaryOperation = mulInPlace;
