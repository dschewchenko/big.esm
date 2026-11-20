import type { Big } from "../big.js";

/**
 * Raises a Big number to the power and mutates the base instance.
 */
export function powBig(big: Big, exp = 2): Big {
  if (!Number.isInteger(exp) || exp < 0) {
    throw new Error("Exp");
  }

  const scale = big.scale * exp;
  if (!Number.isSafeInteger(scale)) throw new Error("Scale");
  big.value = big.value ** BigInt(exp);
  big.scale = scale;
  return big;
}
