import type { Big } from "../big.js";
import { assertScale } from "../utils/assert-scale.js";

/**
 * Raises a Big number to the power and mutates the base instance.
 */
export function powBig(big: Big, exp = 2): Big {
  if (!Number.isSafeInteger(exp) || exp < 0) {
    throw new Error("Exp");
  }

  assertScale(big.scale);
  const scale = big.scale * exp;
  if (!Number.isSafeInteger(scale)) throw new Error("Scale");
  big.value = big.value ** BigInt(exp);
  big.scale = scale;
  return big;
}
