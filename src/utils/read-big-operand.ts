import { Big } from "../big.js";
import type { BigObject, BigValue } from "../types.js";
import { MAX_DECIMAL_EXPANSION } from "./constants.js";
import { parseDecimal } from "./parse-decimal.js";

/** Reads a right-hand BigValue as coefficient and scale without constructing a Big instance. */
export function readBigOperand(operand: BigValue, maxExpandedZeros?: number): BigObject {
  if (typeof operand === "object" && operand !== null) {
    if (typeof operand.value !== "bigint") throw new TypeError("Big");
    return operand;
  }

  if (typeof operand === "bigint") return { value: operand, scale: 0 };
  if (typeof operand === "number" || typeof operand === "string") return parseDecimal(operand, false, maxExpandedZeros);
  throw new TypeError("Big");
}

/** Copies a value without materializing oversized scientific exponents. */
export function copyBigWithExpansionLimit(operand: BigValue): Big {
  if (typeof operand === "string") {
    const { value, scale } = parseDecimal(operand, false, MAX_DECIMAL_EXPANSION);
    return new Big(value, scale);
  }
  return new Big(operand);
}
