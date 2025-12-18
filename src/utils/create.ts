import { Big } from "../big";
import type { BigObject, BigValue, PossibleNumber } from "../types";
import { isBigObject } from "./is-big-object";

/**
 * Creates a new Big instance from the given value.
 * If the value is already a Big instance, it returns the value itself.
 * Use this function instead of the Big constructor to create a Big instance from a value.
 *
 * @param {Big | BigObject} value - The value to create the Big instance from.
 * @return {Big} - A new Big instance.
 */
export function createBig(value: Big | BigObject): Big;

/**
 * Creates a new Big instance from the given value.
 * If the value is already a Big instance, it returns the value itself.
 * Use this function instead of the Big constructor to create a Big instance from a value.
 *
 * @param {PossibleNumber} value - The value to create the Big instance from. It Can be a number, string, or BigInt.
 * @return {Big} - A new Big instance.
 */
export function createBig(value: PossibleNumber): Big;

/**
 * Creates a new Big instance from the given value.
 * If the value is already a Big instance, it returns the value itself.
 * Use this function instead of the Big constructor to create a Big instance from a value.
 *
 * @param {PossibleNumber} value - The value to create the Big instance from. Can be a number, string, or BigInt.
 * @param {number | string | undefined} [scale] - The scale for the value (optional), representing the number of decimal places. If scale provided and value has a fractional part, the fractional part will be removed.
 * @return {Big} - A new Big instance.
 *
 * @category Utilities
 *
 * @example
 * const big1 = createBig(123.456); // 123.456
 * const big2 = createBig("123.456"); // 123.456
 * const big3 = createBig(123.456, 2); // 1.23, because the scale is 2 and it removes the fractional part
 */
export function createBig(value: PossibleNumber, scale: number | string | undefined): Big;

/**
 * Overload accepting the full BigValue union. Useful for helpers that accept any supported input.
 */
export function createBig(value: BigValue, scale?: number | string | undefined): Big;

/**
 * Implements the overloaded function for creating a Big instance.
 * @param {BigValue} value - The value to create the Big instance from. Can be a number, string, BigInt, or another Big instance.
 * @param {number | string | undefined} [scale] - The scale for the value (optional), representing the number of decimal places. If scale provided and value has a fractional part, the fractional part will be removed.
 *
 * @category Utilities
 */
export function createBig(value: BigValue, scale?: number | string | undefined): Big {
  if (value instanceof Big) return value;

  if (isBigObject(value)) {
    return new Big((value as BigObject).value, (value as BigObject).scale);
  }

  return scale === undefined ? new Big(value as PossibleNumber) : new Big(value as PossibleNumber, scale);
}
