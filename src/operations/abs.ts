import type { Big } from "../big";
import { ZERO_BIGINT } from "../utils/constants";

/**
 * Returns the absolute value and mutates the given Big instance.
 */
export function absBig(big: Big): Big {
  big.value = big.value < ZERO_BIGINT ? -big.value : big.value;
  return big;
}
