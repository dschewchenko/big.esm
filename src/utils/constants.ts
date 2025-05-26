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

// Import createBig for defining Big number constants
import { createBig } from "./create"; // Assuming create.ts is in the same directory

const DEFAULT_CONSTANT_PRECISION = 50; // Precision for E_BIG and LN10_BIG

/**
 * Euler's number (e).
 *
 * @category Constants
 */
export const E_BIG = createBig("2.71828182845904523536028747135266249775724709369995", DEFAULT_CONSTANT_PRECISION);

/**
 * Natural logarithm of 10 (ln(10)).
 * Used for converting natural logarithms to base-10 logarithms.
 *
 * @category Constants
 */
export const LN10_BIG = createBig("2.30258509299404568401799145468436420760110148862877", DEFAULT_CONSTANT_PRECISION);
