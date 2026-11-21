import { Big } from "../big.js";
import type { BigBinaryOperation, BigValue } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { readBigOperand } from "../utils/read-big-operand.js";
import { readShortDecimal } from "../utils/short-decimal.js";

/** Multiplies two values and returns a new Big instance. */
export function mul(a: BigValue, b: BigValue): Big {
  if (typeof a === "string" && typeof b === "string") {
    const left = readShortDecimal(a);
    if (left !== undefined) {
      const right = readShortDecimal(b);
      if (right !== undefined) {
        const value = left.value * right.value;
        if (Number.isSafeInteger(value)) return new Big(BigInt(value), left.scale + right.scale);
      }
    }
  }
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
  if (!Number.isSafeInteger(scale)) throw new Error("Scale");
  a.value *= coefficient;
  a.scale = scale;
  return a;
}

/**
 * @deprecated Use `mul` for a new result or `mulInPlace` to mutate the first operand.
 * @inlineType BigBinaryOperation
 */
export const mulBig: BigBinaryOperation = mulInPlace;
