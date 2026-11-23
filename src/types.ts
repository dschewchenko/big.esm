import type { Big } from "./big.js";

/**
 * A decimal represented by an integer coefficient and a safe integer scale.
 * For example, `{ value: 123n, scale: 2 }` represents 1.23.
 *
 * @category Types
 */
export type BigObject = {
  value: bigint;
  scale: number;
};

/**
 * A finite JavaScript number, a decimal string or a bigint.
 * Use decimal strings to preserve digits that cannot be represented by a Number.
 *
 * @category Types
 */
export type PossibleNumber = number | string | bigint;

/**
 * A decimal input accepted by the constructor and pure arithmetic functions.
 *
 * @category Types
 */
export type BigValue = PossibleNumber | Big | BigObject;

/** @internal */
export type BigBinaryOperation = (a: Big, b: Big) => Big;

/**
 * The rounding rule for division, rounding and fixed-point formatting.
 * `half-up` rounds ties away from zero. With `half-even`, the last retained digit is even on ties.
 * `down` rounds toward zero, `up` rounds away from zero, `floor` rounds toward negative infinity,
 * and `ceil` rounds toward positive infinity.
 *
 * @category Types
 */
export type RoundingMode = "half-up" | "half-even" | "down" | "up" | "floor" | "ceil";

/**
 * The comparison result for two Big instances.
 *
 * @category Types
 */
export type CompareResult = -1 | 0 | 1;
