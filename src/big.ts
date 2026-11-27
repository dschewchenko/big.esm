import type { BigValue, PossibleNumber } from "./types.js";
import { assertScale } from "./utils/assert-scale.js";
import { MAX_MATERIALIZED_ZEROS } from "./utils/constants.js";
import { parseDecimal } from "./utils/parse-decimal.js";
import { fractionalEnd } from "./utils/trim-zeros.js";

function parseScale(scale: number | string): number {
  if (typeof scale === "number" && Number.isSafeInteger(scale)) return scale;
  if (typeof scale === "string") {
    const text = scale.trim();
    const parsed = Number(text);
    if (text && Number.isSafeInteger(parsed) && isIntegralScaleText(text)) return parsed;
  }
  throw new RangeError("Scale");
}

function isIntegralScaleText(text: string): boolean {
  if (!/[.eE]/.test(text) || /^0[xob]/i.test(text)) return true;

  // Number may round a fractional scale to an integer or underflow it to zero.
  const [mantissa, exponent = "0"] = text.split(/[eE]/, 2);
  const point = mantissa.indexOf(".");
  const fractionLength = point < 0 ? 0 : mantissa.length - point - 1;
  const places = fractionLength - Number(exponent);
  return places <= 0 || !/[1-9]/.test(mantissa.replace(".", "").slice(-places));
}

/**
 * An exact finite decimal stored as `value × 10 ** (-scale)`.
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
   * The integer coefficient of the decimal.
   */
  public value: bigint;

  /**
   * The exponent of ten with the sign reversed. A positive scale counts fractional places.
   * A negative scale represents trailing integer zeros. Keep the scale a safe integer.
   */
  public scale: number;

  /**
   * Creates a new Big from a decimal input or copies an existing Big or BigObject.
   *
   * @param {BigValue} value - A string, number, bigint, Big, or BigObject.
   * @throws {TypeError} - If the input has an unsupported type.
   * @return {Big} - A new Big instance.
   */
  constructor(value: BigValue);
  /**
   * Creates a new Big instance.
   *
   * @param {PossibleNumber} value - The value to create the Big instance from. Can be a number, string, or BigInt.
   * @param {number | string} [scale] - The scale for the value, as a safe integer or a string that converts to one. If provided and the value has a fractional part, the fractional part will be removed.
   * @throws {TypeError} - If the value is not a number, string, BigInt, or Big instance.
   * @return {Big} - A new Big instance.
   */
  constructor(value: PossibleNumber, scale?: number | string);
  /**
   * Implements the overloaded constructors for the Big class.
   * @param {BigValue} value - The value to create the Big instance from. Can be a number, string, BigInt, or another Big instance.
   * @param {number | string | undefined} [scale] - The scale for the value, as a safe integer or a string that converts to one. If provided and the value has a fractional part, the fractional part will be removed.
   * @throws {TypeError} - If the value is not a number, string, BigInt, or Big instance.
   * @return {Big} - A new Big instance.
   */
  constructor(value: BigValue, scale?: number | string) {
    if (typeof value === "object" && value !== null) {
      const coefficient = value.value;
      const objectScale = value.scale;
      if (value instanceof Big) {
        assertScale(objectScale);
      } else if (typeof coefficient !== "bigint" || !Number.isSafeInteger(objectScale)) {
        throw new TypeError("Big");
      }

      this.value = coefficient;
      this.scale = objectScale;
      return;
    }

    const scaleDefined = scale !== undefined;
    const scaleNumber = scale === undefined ? 0 : parseScale(scale);

    if (typeof value === "bigint") {
      this.value = value;
      this.scale = scaleDefined ? scaleNumber : 0;
      return;
    }

    if (typeof value === "number" || typeof value === "string") {
      const { value: valueBigint, scale: parsedScale } = parseDecimal(value, scaleDefined);
      this.value = valueBigint;
      this.scale = scaleDefined ? scaleNumber : parsedScale;
      return;
    }

    throw new TypeError("Big");
  }

  /**
   * Returns the integer coefficient. JavaScript's Number and BigInt conversions use this coefficient without applying the scale.
   *
   * @returns {bigint} The stored coefficient, `value`.
   * @example
   * createBig("1.23").valueOf(); // 123n
   */
  valueOf(): bigint {
    return this.value;
  }

  /**
   * Formats the value in fixed-point decimal notation. Use `toExponential(big)` to display a large
   * exponent without expanding it into zeros.
   *
   * @param {boolean} [shouldTrimZeros=true] - Whether to trim trailing zeros from the fractional part. Defaults to true.
   * @return {string} - A string representation of the Big instance.
   */
  toString(shouldTrimZeros: boolean = true): string {
    const scale = this.scale;
    assertScale(scale);
    const value = this.value.toString();
    if (scale < 0) {
      if (value === "0") return value;
      if (-scale > MAX_MATERIALIZED_ZEROS) throw RangeError("size limit");
      return value + "0".repeat(-scale);
    }
    if (scale === 0 || (shouldTrimZeros && value === "0")) return value;

    const firstDigit = value.charCodeAt(0) === 45 ? 1 : 0;
    const decimalPoint = value.length - scale;
    if (firstDigit - decimalPoint > MAX_MATERIALIZED_ZEROS) throw RangeError("size limit");
    const point = Math.max(firstDigit, decimalPoint);
    const integer = point > firstDigit ? value.slice(0, point) : firstDigit ? "-0" : "0";
    const end = shouldTrimZeros ? fractionalEnd(value, point) : value.length;
    if (end === point) return integer;

    // Trim the coefficient before padding the fraction.
    const width = scale - (value.length - end);
    return `${integer}.${value.slice(point, end).padStart(width, "0")}`;
  }

  /**
   * Returns the same string as `toString()` for JSON serialization.
   * Use `serializeBig(big)` to preserve the stored scale through a JSON round trip.
   *
   * @returns {string} The decimal value with fractional trailing zeros trimmed.
   */
  toJSON(): string {
    return this.toString();
  }
}
