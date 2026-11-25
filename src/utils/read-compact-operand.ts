import type { BigObject, BigValue } from "../types.js";
import { assertScale } from "./assert-scale.js";
import { readBigOperand } from "./read-big-operand.js";

/** Reads stored parts directly and parses literals without expanding scientific notation. */
export function readCompactOperand(input: BigValue): BigObject {
  const operand = readBigOperand(input, 0);
  assertScale(operand.scale);
  return operand;
}
