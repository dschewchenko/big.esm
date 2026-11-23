import { Big } from "../big.js";
import type { BigValue } from "../types.js";
import { assertScale } from "./assert-scale.js";
import { readCompactOperand } from "./read-compact-operand.js";

const INTEGER_PATTERN = /^-?\d+$/;

/**
 * JSON-safe representation of a Big value. `value` is the exact integer coefficient and `scale` is
 * the decimal scale. A negative scale represents trailing integer zeros without expanding them.
 *
 * @category Types
 */
export type SerializedBig = {
  value: string;
  scale: number;
};

/**
 * Serializes a decimal value as a JSON-safe integer coefficient and scale.
 *
 * Big instances and BigObjects retain their stored coefficient and scale. Decimal strings with large
 * positive exponents use a negative scale, avoiding zero-padding and keeping the result compact.
 *
 * @param input - A number, string, bigint, Big instance, or BigObject to serialize.
 * @returns An object containing the exact coefficient string and safe integer scale.
 * @throws If the input is not a valid decimal value or has an invalid scale.
 *
 * @category Utilities
 *
 * @example
 * JSON.stringify(serializeBig("1e10000000000")); // {"value":"1","scale":-10000000000}
 */
export function serializeBig(input: BigValue): SerializedBig {
  const big = readCompactOperand(input);
  return { value: big.value.toString(), scale: big.scale };
}

/**
 * Deserializes a JSON-safe coefficient-and-scale object into a Big instance.
 *
 * The value must be an integer string and the scale must be a safe integer. No decimal expansion is
 * performed, including for extreme positive or negative safe scales.
 *
 * @param input - An object with a `value` integer string and a `scale` safe integer.
 * @returns A Big instance with the exact serialized coefficient and scale.
 * @throws TypeError if the input does not have the serialized shape or its value is not an integer string.
 * @throws RangeError if the scale is not a safe integer.
 *
 * @category Utilities
 *
 * @example
 * const value = deserializeBig(JSON.parse('{"value":"12345","scale":2}'));
 * value.toString(); // "123.45"
 */
export function deserializeBig(input: unknown): Big {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("SerializedBig");
  }

  const { value, scale } = input as Partial<Record<keyof SerializedBig, unknown>>;
  if (typeof value !== "string" || !INTEGER_PATTERN.test(value)) throw new TypeError("SerializedBig");
  if (typeof scale !== "number") throw new TypeError("SerializedBig");
  assertScale(scale);

  return new Big(BigInt(value), scale);
}
