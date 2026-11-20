import type { Big } from "../big";

/**
 * Multiplies two Big instances and mutates the first one.
 */
export function mulBig(a: Big, b: Big): Big {
  const scale = a.scale + b.scale;
  if (!Number.isSafeInteger(scale)) throw new Error("Scale");
  a.value = a.value * b.value;
  a.scale = scale;
  return a;
}
