/**
 * Default precision for operations, such as division, square root, etc.
 *
 * @category Constants
 */
export const DEFAULT_PRECISION = 20;

/**
 * Zero as a BigInt.
 *
 * @category Constants
 */
export const ZERO_BIGINT = BigInt(0);

/**
 * One as a BigInt.
 *
 * @category Constants
 */
export const ONE_BIGINT = BigInt(1);

/**
 * Ten as a BigInt.
 * Often used as scale multiplier to adjust the scale of a Big instance.
 *
 * @category Constants
 */
export const TEN_BIGINT = BigInt(10);

// String literal constants for E, LN10, and PI values.
// These will be converted to Big instances where needed (e.g., in operations files)
// to avoid circular dependency with the Big class constructor.

/**
 * Euler's number (e) as a string with high precision.
 *
 * @category Constants
 */
export const E_STRING = "2.71828182845904523536028747135266249775724709369995";

/**
 * Natural logarithm of 10 (ln(10)) as a string with high precision.
 *
 * @category Constants
 */
export const LN10_STRING = "2.30258509299404568401799145468436420760110148862877";

/**
 * PI (Archimedes' constant) as a string with high precision.
 *
 * @category Constants
 */
export const PI_STRING = "3.14159265358979323846264338327950288419716939937510582097494459230781640628620899";

/**
 * PI / 2 as a string with high precision.
 *
 * @category Constants
 */
export const PI_HALF_STRING = "1.57079632679489661923132169163975144209858469968755291048747229615390820314310449";

/**
 * 2 * PI as a string with high precision.
 *
 * @category Constants
 */
export const TWO_PI_STRING = "6.28318530717958647692528676655900576839433879875021164194988918461563281257241799";

// DEFAULT_CONSTANT_PRECISION is not strictly needed here anymore if we only store strings,
// but operations using these strings will need to define their desired precision when creating Big instances.
// const DEFAULT_CONSTANT_PRECISION = 50; // Can be removed or kept for reference
