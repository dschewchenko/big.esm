import type { Big } from "../big";
import { createBig } from "../utils/create";

/**
 * Multiplies two Big instances and returns the result as a new Big instance.
 *
 * @param {Big} a - The first Big instance.
 * @param {Big} b - The second Big instance.
 * @param {boolean} [mutable=false] - Whether to mutate the first Big instance. Defaults to false.
 * @returns {Big} The result of the multiplication.
 *
 * @category Operations
 *
 * @example
 * mulBig(new Big(1), new Big(2)); // new Big instance with value 2
 * mulBig(new Big(1.1), new Big(2.2)); // new Big instance with value 2.42
 * mulBig(new Big(1.1), new Big(2)); // new Big instance with value 2.2
 */
export function mulBig(a: Big, b: Big, mutable = false): Big {
  // Multiply the values of the Big instances
  const value = a.value * b.value;

  // Add the scales of the Big instances
  const scale = a.scale + b.scale;

  // Check if the first Big instance should be mutated
  if (mutable) {
    a.value = value;
    a.scale = scale;
    return a;
  }

  // Create a new Big instance with the multiplied value and combined scale
  return createBig(value, scale);
}
