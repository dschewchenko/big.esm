import type { BigObject, BigValue } from "../types.js";
import { parseDecimal } from "./parse-decimal.js";

/** Reads a right-hand BigValue as coefficient and scale without constructing a Big instance. */
export function readBigOperand(operand: BigValue): BigObject {
  if (typeof operand === "object" && operand !== null) {
    if (typeof operand.value !== "bigint") throw new TypeError("Big");
    return operand;
  }

  if (typeof operand === "bigint") return { value: operand, scale: 0 };
  if (typeof operand === "number" || typeof operand === "string") return parseDecimal(operand);
  throw new TypeError("Big");
}
