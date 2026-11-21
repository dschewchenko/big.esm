import type { Big } from "../big.js";
import { assertScale } from "../utils/assert-scale.js";
import { ZERO_BIGINT } from "../utils/constants.js";

/**
 * Returns the absolute value and mutates the given Big instance.
 */
export function absBig(big: Big): Big {
  assertScale(big.scale);
  big.value = big.value < ZERO_BIGINT ? -big.value : big.value;
  return big;
}
