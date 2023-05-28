import { isNumericValue } from "./utils/numeric";
import { trimZeros } from "./utils/trim-zeros";
import { ZERO_BIGINT } from "./utils/constants";
import { fromString } from "./utils/from-string";
import { isBigObject } from "./utils/is-big-object";
import type { BigObject, BigValue, PossibleNumber } from "./types";

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
  public value: bigint;

  /**
   * The scale of the Big instance, representing the number of decimal places.
   */
  public scale: number;

  /**
   * Creates a new Big instance.
   *
   * @param {Big | BigObject} value - The value to create the Big instance from.
   * @throws {TypeError} - If the value is not a number, string, BigInt, or Big instance.
   * @return {Big} - A new Big instance.
   */
  constructor(value: Big | BigObject);
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
   * @param {number | string} [scale] - The scale for the value (optional), representing the number of decimal places. If scale provided and value has a fractional part, the fractional part will be removed.
   * @throws {TypeError} - If the value is not a number, string, BigInt, or Big instance.
   * @return {Big} - A new Big instance.
   */
  constructor(value: PossibleNumber, scale: number | string);
  /**
   * Implements the overloaded constructors for the Big class.
   * @param {BigValue} value - The value to create the Big instance from. Can be a number, string, BigInt, or another Big instance.
   * @param {number | string | undefined} [scale] - The scale for the value (optional), representing the number of decimal places. If scale provided and value has a fractional part, the fractional part will be removed.
   * @throws {TypeError} - If the value is not a number, string, BigInt, or Big instance.
   * @return {Big} - A new Big instance.
   */
  constructor(value: BigValue, scale?: number | string) {
    // If the value is a Big instance, copy the value and scale.
    if (isBigObject(value)) {
      this.value = value.value;
      this.scale = value.scale;
      // If the value is a number, string, or BigInt, convert it to a BigInt and set the scale.
    } else if (isNumericValue(value)) {
      let scaleDefined = scale !== undefined;
      if (scaleDefined) {
        // Convert the scale to a number
        if (typeof scale !== "number")
          scale = Number(scale);

        // Remove the fractional part
        scaleDefined = !isNaN(scale);
        scale = scaleDefined ? Math.floor(scale) : 0;
      }

      // if the value is bigint, skip string parsing
      if (typeof value === "bigint") {
        this.value = value;
        this.scale = scaleDefined ? scale as number : 0;
      } else {
        // Parse the value from a string or number
        const { value: valueBigint, scale: parsedScale } = fromString(value, scaleDefined, false);
        this.value = valueBigint;
        this.scale = scaleDefined ? scale as number : parsedScale;
      }
    } else {
      throw new TypeError("Invalid type provided to Big constructor.");
    }
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
   * @param {boolean} [shouldTrimZeros=true] - Whether to trim trailing zeros from the fractional part. Defaults to true.
   * @return {string} - A string representation of the Big instance.
   */
  toString(shouldTrimZeros = true): string {
    let integerPart = this.value.toString();
    const sign = integerPart.startsWith("-") ? "-" : "";
    if (sign)
      integerPart = integerPart.substring(1);
    let fractionPart = "";

    if (this.scale > ZERO_BIGINT) {
      const digits = integerPart.length > this.scale ? integerPart.length - Number(this.scale) : 0;
      fractionPart = integerPart.slice(digits).padStart(Number(this.scale), "0");

      if (shouldTrimZeros) {
        fractionPart = trimZeros(fractionPart);
      }

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
