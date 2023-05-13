import { DEFAULT_PRECISION, ZERO_BIGINT } from "../utils/constants";
import { divBig } from "./div";
import { compareBig } from "./compare";
import { addBig } from "./add";
import { subBig } from "./sub";
import { absBig } from "./abs";
import { createBig } from "../utils/create.ts";
import { powBig } from "./pow";
import { mulBig } from "./mul";
import { isZero } from "../utils/is-zero";
import type { Big } from "../big";

/**
 * Calculates the nth root of a Big instance with custom precision and rounding mode.
 *
 * Note: it's the most weighted function in the library. It's reusing a lot of other functions, and it's not perfect in performance, recommended to use it only when you need it and with default precision and rounding mode. It uses the Newton's method to calculate the root.
 *
 * @param {Big} big - The Big instance.
 * @param {number} root - The root to calculate. Must be an integer. Defaults to 2.
 * @param {number} precision - The number of decimal places to keep in the result (optional). Defaults to 20.
 * @returns {Big} The nth root of the Big instance with the specified precision and rounding mode.
 * @throws {Error} - If the root is not an integer.
 *
 * @category Operations
 *
 * @example
 * const big1 = new Big(16);
 * console.log(sqrtBig(big1).toString()); // 4.00000000000000000000
 * console.log(sqrtBig(big1, 4, 0).toString()); // 2
 * console.log(sqrtBig(big1, 4, 1).toString()); // 2.0
 * console.log(sqrtBig(Big(0), 4).toString()); // 0
 * console.log(sqrtBig(Big(1), 4).toString()); // 1
 * console.log(sqrtBig(Big(-1), 4).toString()); // throws Error
 * console.log(sqrtBig(Big(16), 0.5).toString()); // throws Error
 * console.log(sqrtBig(Big(16), -2).toString()); // throws Error
 * console.log(sqrtBig(Big(16), 4, -1).toString()); // throws Error
 */
export function sqrtBig(big: Big, root = 2, precision = DEFAULT_PRECISION): Big {
  // Check if the input value is 0, return 0 as the square root of 0 is also 0
  if (isZero(big)) return createBig(0);

  // Check if the input value is 1, return 1 as any root of 1 is also 1
  if (big.valueOf() === BigInt(1)) return createBig(1);

  // Check if the input value is negative and the root is an even number, throw an error
  // as the square root of a negative number with an even root is undefined
  if (big.value < ZERO_BIGINT && root % 2 === 0)
    throw new Error("The root must be an odd integer when the number is negative.");

  // Check if the root is not an integer or less than 2, throw an error
  if (!Number.isInteger(root) || root < 2)
    throw new Error("The root must be an integer and greater than 1");

  // Check if the precision is a non-negative integer
  if (precision < 0)
    throw new Error("The precision must be a non-negative integer.");

  // Calculate the precision string based on the provided precision
  const precisionString = precision === 0 ? "1" : "0." + "0".repeat(precision - 1) + "1";
  const precisionBig = createBig(precisionString);

  // Create Big instances for the root, root - 1, and 2
  const rootBig = createBig(root);
  const rootMinus1Big = createBig(root - 1);
  const twoBig = createBig(2);

  // Initialize the root approximation with an initial guess
  let approximation = divBig(addBig(big, divBig(big, twoBig, precision)), twoBig, precision);

  // Iterate until the difference between the previous and current approximations is within the desired precision
  let prevApproximation;
  do {
    prevApproximation = approximation;

    // Calculate the numerator for the next approximation
    const numerator = addBig(mulBig(rootMinus1Big, approximation), divBig(big, powBig(approximation, root - 1), precision));

    // Calculate the next approximation
    approximation = divBig(numerator, rootBig, precision);

  } while (compareBig(absBig(subBig(prevApproximation, approximation)), precisionBig) === 1);

  // Get the string representation of the result
  const resultString = approximation.toString();

  // Truncate the decimal part of the result based on the desired precision
  const dotIndex = resultString.indexOf(".");
  const truncatedString = dotIndex !== -1 ? resultString.slice(0, dotIndex + precision + 1) : resultString;

  return createBig(truncatedString);
}
