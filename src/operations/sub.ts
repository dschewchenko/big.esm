import type { Big } from "../big.js";
import { assertScale } from "../utils/assert-scale.js";
import { ZERO_BIGINT } from "../utils/constants.js";
import { pow10 } from "../utils/pow10.js";

/**
 * Subtracts two Big instances and mutates the first one.
 */
export function subBig(a: Big, b: Big): Big {
  assertScale(a.scale);
  assertScale(b.scale);
  const scaleDifference = a.scale - b.scale;

  if (scaleDifference === 0) {
    a.value -= b.value;
    return a;
  }

  if (scaleDifference > 0) {
    if (scaleDifference <= 63 || b.value !== ZERO_BIGINT) a.value -= b.value * pow10(scaleDifference);
    return a;
  }

  a.value = scaleDifference >= -63 || a.value !== ZERO_BIGINT ? a.value * pow10(-scaleDifference) - b.value : -b.value;
  a.scale = b.scale;
  return a;
}
