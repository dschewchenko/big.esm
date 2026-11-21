import type { Big } from "./big.js";

/**
 * The object type for the Big class.
 *
 * @category Types
 */
export type BigObject = {
  value: bigint;
  scale: number;
};

/**
 * Possible number types for processing.
 *
 * @category Types
 */
export type PossibleNumber = number | string | bigint;

/**
 * Possible value types for the Big class.
 *
 * @category Types
 */
export type BigValue = PossibleNumber | Big | BigObject;

/**
 * The rounding rule for division, rounding and fixed-point formatting.
 * `half-up` rounds ties away from zero. With `half-even`, the last retained digit is even on ties.
 * `down` rounds toward zero, `up` rounds away from zero, `floor` rounds toward negative infinity,
 * and `ceil` rounds toward positive infinity.
 *
 * @category Types
 */
export type RoundingMode = "half-up" | "half-even" | "down" | "up" | "floor" | "ceil";

/**
 * The comparison result for two Big instances.
 *
 * @category Types
 */
export type CompareResult = -1 | 0 | 1;
