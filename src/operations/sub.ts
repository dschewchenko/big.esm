import type { Big } from "../big";
import { ZERO_BIGINT } from "../utils/constants";
import { pow10 } from "../utils/pow10";

/**
 * Subtracts two Big instances and mutates the first one.
 */
export function subBig(a: Big, b: Big): Big {
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
