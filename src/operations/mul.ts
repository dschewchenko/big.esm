import type { Big } from "../big.js";
import { assertScale } from "../utils/assert-scale.js";

/**
 * Multiplies two Big instances and mutates the first one.
 */
export function mulBig(a: Big, b: Big): Big {
  assertScale(a.scale);
  assertScale(b.scale);
  const scale = a.scale + b.scale;
  if (!Number.isSafeInteger(scale)) throw new Error("Scale");
  a.value = a.value * b.value;
  a.scale = scale;
  return a;
}
