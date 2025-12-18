import type { Big } from "../big";

/**
 * Multiplies two Big instances and mutates the first one.
 */
export function mulBig(a: Big, b: Big): Big {
  a.value = a.value * b.value;
  a.scale = a.scale + b.scale;
  return a;
}
