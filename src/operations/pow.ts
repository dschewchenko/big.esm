import type { Big } from "../big";

/**
 * Raises a Big number to the power and mutates the base instance.
 */
export function powBig(big: Big, exp = 2): Big {
  if (!Number.isInteger(exp) || exp < 0) {
    throw new Error("Exp");
  }

  big.value = big.value ** BigInt(exp);
  big.scale = big.scale * exp;
  return big;
}
