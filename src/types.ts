import type { Big } from "./big";

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

/**
 * Options for formatting a Big number to a string.
 *
 * @category Types
 */
export interface FormattingOptions {
  /** Number of digits to show after the decimal point.
   * If undefined, the current full scale of the number is used.
   */
  decimalPlaces?: number;

  /** Rounding mode to use when decimalPlaces is specified and requires rounding.
   * 'half-up': Rounds to the nearest neighbor. If equidistant, rounds up.
   * 'truncate': Discards digits beyond the specified decimalPlaces.
   * 'ceil': Rounds towards positive infinity.
   * 'floor': Rounds towards negative infinity.
   * @default 'half-up'
   */
  roundingMode?: 'half-up' | 'truncate' | 'ceil' | 'floor'; // Note: big.js uses specific numbers for rounding modes. This uses strings for clarity.

  /** Character for thousands separation in the integer part.
   * @default '' (no separator)
   */
  thousandsSeparator?: string;

  /** Character for the decimal point.
   * @default '.'
   */
  decimalSeparator?: string;
}
