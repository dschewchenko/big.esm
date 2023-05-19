import type { Big } from "./big";

/**
 * The object type for the Big class.
 *
 * @category Types
 */
export type BigObject = {
  value: bigint;
  scale: number;
}

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
 * The rounding mode for division operations.
 *
 * @category Types
 */
export type RoundingMode = "half-up" | "down" | "up";

/**
 * The comparison result for two Big instances.
 *
 * @category Types
 */
export type CompareResult = -1 | 0 | 1;
