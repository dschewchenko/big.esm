import type { BigValue, RoundingMode } from "./index.js";
import {
  absInPlace,
  addInPlace,
  Big,
  divCompactInPlace,
  divInPlace,
  modInPlace,
  mulInPlace,
  powInPlace,
  roundInPlace,
  roundToStepInPlace,
  sqrtInPlace,
  subInPlace
} from "./index.js";

type Operation<Input> = (working: Big, input: Input) => Big;

declare const boundOperator: unique symbol;

/**
 * A reusable operation configured with its arguments for {@link pipe}.
 * Values from a supplied `Big` are read each time the operator runs.
 *
 * @category Operator pipeline
 */
export type PipeOperator = {
  readonly [boundOperator]: true;
};

type BoundOperator = PipeOperator & {
  readonly op: Operation<never>;
  readonly input: unknown;
};

function bind<Input>(op: Operation<Input>, input: Input): PipeOperator {
  const bound: Omit<BoundOperator, typeof boundOperator> = { op, input };
  return bound as BoundOperator;
}

type DivisionArguments = {
  divisor: BigValue;
  precision?: number;
  roundingMode?: RoundingMode;
};

const divide: Operation<DivisionArguments> = (working, options) =>
  divInPlace(working, options.divisor, options.precision, options.roundingMode);

/**
 * Configures addition for use in {@link pipe}.
 *
 * @category Operator pipeline
 * @group Operators
 */
export const add = (operand: BigValue): PipeOperator => bind(addInPlace, operand);

/**
 * Configures subtraction for use in {@link pipe}.
 *
 * @category Operator pipeline
 * @group Operators
 */
export const sub = (operand: BigValue): PipeOperator => bind(subInPlace, operand);

/**
 * Configures multiplication for use in {@link pipe}.
 *
 * @category Operator pipeline
 * @group Operators
 */
export const mul = (operand: BigValue): PipeOperator => bind(mulInPlace, operand);

/**
 * Configures division for use in {@link pipe}.
 *
 * @category Operator pipeline
 * @group Operators
 */
export const div = (divisor: BigValue, precision?: number, roundingMode?: RoundingMode): PipeOperator =>
  bind(divide, { divisor, precision, roundingMode });

type CompactDivisionArguments = {
  divisor: BigValue;
  maxDecimalPlaces?: number;
  roundingMode?: RoundingMode;
};

const divideCompact: Operation<CompactDivisionArguments> = (working, options) =>
  divCompactInPlace(working, options.divisor, options.maxDecimalPlaces, options.roundingMode);

/**
 * Configures compact division for use in {@link pipe}.
 *
 * @category Operator pipeline
 * @group Operators
 */
export const divCompact = (divisor: BigValue, maxDecimalPlaces?: number, roundingMode?: RoundingMode): PipeOperator =>
  bind(divideCompact, { divisor, maxDecimalPlaces, roundingMode });

/**
 * Configures modulo for use in {@link pipe}.
 *
 * @category Operator pipeline
 * @group Operators
 */
export const mod = (divisor: BigValue): PipeOperator => bind(modInPlace, divisor);

/**
 * Configures absolute value for use in {@link pipe}.
 *
 * @category Operator pipeline
 * @group Operators
 */
export const abs = (): PipeOperator => bind(absInPlace, undefined);

/**
 * Configures integer exponentiation for use in {@link pipe}.
 *
 * @category Operator pipeline
 * @group Operators
 */
export const pow = (exponent?: number): PipeOperator => bind(powInPlace, exponent);

type RoundingArguments = {
  decimalPlaces?: number;
  roundingMode?: RoundingMode;
};

const roundValue: Operation<RoundingArguments> = (working, options) =>
  roundInPlace(working, options.decimalPlaces, options.roundingMode);

/**
 * Configures decimal-place rounding for use in {@link pipe}.
 *
 * @category Operator pipeline
 * @group Operators
 */
export const round = (decimalPlaces?: number, roundingMode?: RoundingMode): PipeOperator =>
  bind(roundValue, { decimalPlaces, roundingMode });

type RoundToStepArguments = {
  step: BigValue;
  roundingMode?: RoundingMode;
};

const roundToStepValue: Operation<RoundToStepArguments> = (working, options) =>
  roundToStepInPlace(working, options.step, options.roundingMode);

/**
 * Configures rounding to a positive step for use in {@link pipe}.
 *
 * @category Operator pipeline
 * @group Operators
 */
export const roundToStep = (step: BigValue, roundingMode?: RoundingMode): PipeOperator =>
  bind(roundToStepValue, { step, roundingMode });

type RootArguments = {
  degree?: number;
  precision?: number;
};

const root: Operation<RootArguments> = (working, options) => sqrtInPlace(working, options.degree, options.precision);

/**
 * Configures an nth root for use in {@link pipe}.
 *
 * @category Operator pipeline
 * @group Operators
 */
export const sqrt = (degree?: number, precision?: number): PipeOperator => bind(root, { degree, precision });

/**
 * Applies reusable operations from left to right to a copy of the initial value.
 * Each operator changes only the owned working value, which is returned as a `Big`.
 * Operator arrays can be grouped and spread into a pipeline. A prior pipeline result
 * can also be used as an operand to build a separate expression.
 *
 * @category Operator pipeline
 * @group Entry point
 *
 * @example
 * ```ts
 * import { add, mul, pipe, sub } from "big.esm/pipe";
 *
 * const pricing = [mul("0.9"), add("5")];
 * const finalize = [sub(2)];
 * pipe("100", ...pricing, ...finalize).toString(); // "93"
 *
 * const subtotal = pipe("1.2", add("0.3"));
 * const quantity = pipe("10", sub(2));
 * pipe(subtotal, mul(quantity)).toString(); // "12"
 * ```
 */
export function pipe(initial: BigValue, ...operators: PipeOperator[]): Big {
  const working = new Big(initial);
  const steps = operators as BoundOperator[];
  const count = steps.length;
  if (count > 0) steps[0].op(working, steps[0].input as never);
  if (count > 1) steps[1].op(working, steps[1].input as never);
  if (count > 2) steps[2].op(working, steps[2].input as never);
  for (let index = 3; index < count; index++) {
    const step = steps[index];
    step.op(working, step.input as never);
  }
  return working;
}
