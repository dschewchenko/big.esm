import type { Big } from "../big.js";
import { ZERO_BIGINT } from "../utils/constants.js";
import { pow10 } from "../utils/pow10.js";

/**
 * Adds two Big values and mutates the first argument.
 *
 * @param a - The first value to add, replaced in place by the sum.
 * @param b - The second value to add. It is unchanged unless it is also `a`.
 * @returns The mutated first argument.
 *
 * @category Operations
 *
 * @example
 * addBig(new Big(1), new Big(2)); // the first instance, now 3
 * addBig(new Big(1.1), new Big(2.2)); // the first instance, now 3.3
 * addBig(new Big(1.1), new Big(2)); // the first instance, now 3.1
 */
export function addBig(a: Big, b: Big): Big {
  const scaleDifference = a.scale - b.scale;

  if (scaleDifference === 0) {
    a.value += b.value;
    return a;
  }

  if (scaleDifference > 0) {
    if (scaleDifference <= 63 || b.value !== ZERO_BIGINT) a.value += b.value * pow10(scaleDifference);
    return a;
  }

  a.value = scaleDifference >= -63 || a.value !== ZERO_BIGINT ? a.value * pow10(-scaleDifference) + b.value : b.value;
  a.scale = b.scale;
  return a;
}
