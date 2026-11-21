import type { Big } from "../big.js";
import type { BigValue } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { readBigOperand } from "../utils/read-big-operand.js";

/**
 * Multiplies a Big by a decimal value and mutates the first operand.
 */
export function mulBig(a: Big, b: BigValue): Big {
  const leftScale = a.scale;
  assertScale(leftScale);
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
