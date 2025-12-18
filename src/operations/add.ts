import type { Big } from "../big";
import { pow10 } from "../utils/pow10";

/**
 * Adds two Big instances and mutates the first one.
 */
export function addBig(a: Big, b: Big): Big {
  const scaleDifference = a.scale - b.scale;

  if (scaleDifference === 0) {
    a.value += b.value;
    return a;
  }

  const multiplier = pow10(Math.abs(scaleDifference));

  if (scaleDifference > 0) {
    a.value += b.value * multiplier;
    return a;
  }

  a.value = a.value * multiplier + b.value;
  a.scale = b.scale;
  return a;
}
