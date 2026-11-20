import type { BigObject, BigValue, PossibleNumber } from "./types.js";
import { fromString } from "./utils/from-string.js";
import { isBigObject } from "./utils/is-big-object.js";
import { trimZeros } from "./utils/trim-zeros.js";

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
   * The position of the decimal point. A negative scale adds zeros to the right of the coefficient.
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
    if (value instanceof Big) {
      this.value = value.value;
      this.scale = value.scale;
      return;
    }

    if (isBigObject(value)) {
      this.value = value.value;
      this.scale = value.scale;
      return;
    }

    if (typeof value === "object" && value !== null) {
      throw new TypeError("Big");
    }

    let scaleDefined = scale !== undefined;
    let scaleNumber = 0;
    if (scaleDefined) {
      scaleNumber = typeof scale === "number" ? scale : Number(scale);
      scaleDefined = !Number.isNaN(scaleNumber);
      if (scaleDefined) scaleNumber = Math.floor(scaleNumber);
    }

    if (typeof value === "bigint") {
      this.value = value;
      this.scale = scaleDefined ? scaleNumber : 0;
      return;
    }

    if (typeof value === "number" || typeof value === "string") {
      const { value: valueBigint, scale: parsedScale } = fromString(value, scaleDefined, false);
      this.value = valueBigint;
      this.scale = scaleDefined ? scaleNumber : parsedScale;
      return;
    }

    throw new TypeError("Big");
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
  toString(shouldTrimZeros: boolean = true): string {
    const scale = this.scale;
    const value = this.value.toString();
    if (scale < 0) return value === "0" ? value : value + "0".repeat(-scale);
    if (!(scale > 0) || (shouldTrimZeros && value === "0")) return value;

    const sign = value.startsWith("-") ? "-" : "";
    const digits = sign ? value.slice(1) : value;
    const point = Math.max(0, digits.length - scale);
    const integer = digits.slice(0, point) || "0";
    const fraction = digits.slice(point);
    if (!shouldTrimZeros) return `${sign}${integer}.${fraction.padStart(scale, "0")}`;

    const trimmed = trimZeros(fraction);
    if (trimmed.length === 0) {
      return `${sign}${integer}`;
    }

    // Trim the coefficient first so we never scan the leading scale padding.
    const width = scale - (fraction.length - trimmed.length);
    return `${sign}${integer}.${trimmed.padStart(width, "0")}`;
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
