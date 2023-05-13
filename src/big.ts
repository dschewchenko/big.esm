import { isNumericValue } from "./utils/numeric";
import type { BigValue, PossibleNumber } from "./types";
import { ZERO_BIGINT } from "./utils/constants.ts";

/**
 * The Big class for working with large numbers and fractions using BigInt.
 *
 * @category Core
 *
 * @example
 * const big1 = new Big(123.456);
 * console.log(big1.toString()); // 123.456
 * const big2 = new Big("123.456");
 * console.log(big2.toString()); // 123.456
 * const big3 = new Big(123456n, 2);
 * console.log(big3.toString()); // 1234.56
 * const big4 = new Big(123.456, 2);
 * console.log(big4.toString()); // 1.23, because the scale is 2 and it removes the fractional part
 */
export class Big {
  /**
   * The value of the Big instance.
   */
  public readonly value: bigint;

  /**
   * The scale of the Big instance, representing the number of decimal places.
   */
  public readonly scale: number;

  /**
   * Creates a new Big instance.
   *
   * @param {Big} value - The value to create the Big instance from.
   * @throws {TypeError} - If the value is not a number, string, BigInt, or Big instance.
   * @return {Big} - A new Big instance.
   */
  constructor(value: Big);
  /**
   * Creates a new Big instance.
   *
   * @param {PossibleNumber} value - The value to create the Big instance from. It Can be a number, string, or BigInt.
   * @throws {TypeError} - If the value is not a number, string, BigInt, or Big instance.
   * @return {Big} - A new Big instance.
   */
  constructor(value: PossibleNumber);
  /**
   * Creates a new Big instance.
   *
   * @param {PossibleNumber} value - The value to create the Big instance from. Can be a number, string, or BigInt.
   * @param {number | string | undefined} [scale] - The scale for the value (optional), representing the number of decimal places. If scale provided and value has a fractional part, the fractional part will be removed.
   * @throws {TypeError} - If the value is not a number, string, BigInt, or Big instance.
   * @return {Big} - A new Big instance.
   */
  constructor(value: PossibleNumber, scale: number | string | undefined);
  /**
   * Implements the overloaded constructors for the Big class.
   * @param {BigValue} value - The value to create the Big instance from. Can be a number, string, BigInt, or another Big instance.
   * @param {number | string | undefined} [scale] - The scale for the value (optional), representing the number of decimal places. If scale provided and value has a fractional part, the fractional part will be removed.
   * @throws {TypeError} - If the value is not a number, string, BigInt, or Big instance.
   * @return {Big} - A new Big instance.
   */
  constructor(value: BigValue, scale?: number | string | undefined) {
    // If the value is a Big instance, copy the value and scale.
    if (value instanceof Big) {
      this.value = value.value;
      this.scale = value.scale;
      // If the value is a number, string, or BigInt, convert it to a BigInt and set the scale.
    } else if (isNumericValue(value)) {
      let [integerPart, fractionPart = ""] = value.toString().split(".");
      // If the scale is provided, ignore the fraction part.
      if (scale !== undefined) {
        // Convert the scale to a number
        if (typeof scale !== "number")
          scale = Number(scale);

        // Remove the fractional part
        scale = Math.floor(scale);

        // Ignore the fraction part
        if (fractionPart)
          fractionPart = "";

        // If the integer part is shorter than the scale, pad it with zeros
        if (integerPart.length < scale)
          integerPart = integerPart.padEnd(scale, "0");
      }

      this.value = BigInt(integerPart + fractionPart);
      this.scale = fractionPart ? fractionPart.length : scale as number ?? 0;
    } else {
      throw new TypeError("Invalid type provided to Big constructor.");
    }

    return this;
  }

  /**
   * Returns the primitive value of the Big instance.
   *
   * @returns {bigint} The primitive value of the Big instance.
   */
  valueOf(): bigint {
    return this.value;
  }

  /**
   * Returns a string representation of the Big instance.
   *
   * @return {string} - A string representation of the Big instance.
   */
  toString(): string {
    let integerPart = this.value.toString();
    const sign = integerPart.startsWith("-") ? "-" : "";
    if (sign)
      integerPart = integerPart.substring(1);
    let fractionPart = "";

    if (this.scale > ZERO_BIGINT) {
      const digits = integerPart.length > this.scale ? integerPart.length - Number(this.scale) : 0;
      fractionPart = integerPart.slice(digits).padStart(Number(this.scale), "0");

      if (fractionPart.length > 0) {
        fractionPart = `.${fractionPart}`;
      }

      integerPart = integerPart.slice(0, digits);
    }

    return `${sign}${integerPart || "0"}${fractionPart}`;
  }

  /**
   * Returns the JSON representation of the Big instance.
   *
   * @returns {string} The JSON representation of the Big instance. It is the same as the string representation, because JSON does not support BigInt.
   */
  toJSON(): string {
    return this.toString();
  }
}
