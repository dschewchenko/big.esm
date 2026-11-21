/**
 * Default precision for operations, such as division, square root, etc.
 *
 * @category Constants
 */
export const DEFAULT_PRECISION = 20;

/** Maximum requested decimal places for division and fixed-point formatting. */
export const MAX_DECIMAL_PLACES = 1_000_000;

/** Maximum decimal expansion requested by a single division or fixed formatter. */
export const MAX_DECIMAL_EXPANSION = 2 * MAX_DECIMAL_PLACES;

/**
 * Zero as a BigInt.
 *
 * @category Constants
 */
export const ZERO_BIGINT = 0n;

/**
 * One as a BigInt.
 *
 * @category Constants
 */
export const ONE_BIGINT = 1n;

/**
 * Ten as a BigInt.
 * Often used as scale multiplier to adjust the scale of a Big instance.
 *
 * @category Constants
 */
export const TEN_BIGINT = 10n;
