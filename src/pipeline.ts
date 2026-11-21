import { Big } from "./big.js";
import { addInPlace } from "./operations/add.js";
import { divInPlace } from "./operations/div.js";
import { modInPlace } from "./operations/mod.js";
import { mulInPlace } from "./operations/mul.js";
import { powInPlace } from "./operations/pow.js";
import { roundInPlace } from "./operations/round.js";
import { roundToStepInPlace } from "./operations/round-to-increment.js";
import { sqrtInPlace } from "./operations/sqrt.js";
import { subInPlace } from "./operations/sub.js";
import type { BigValue, RoundingMode } from "./types.js";
import { createBig } from "./utils/create.js";
import { toFixed } from "./utils/to-fixed.js";
import { toNumber } from "./utils/to-number.js";
import { toPrecision } from "./utils/to-precision.js";

export type BigPipeline = {
  /**
   * The current Big value inside the pipeline.
   */
  readonly current: Big;
  add: (value: BigValue) => BigPipeline;
  sub: (value: BigValue) => BigPipeline;
  mul: (value: BigValue) => BigPipeline;
  div: (value: BigValue, precision?: number, roundingMode?: RoundingMode) => BigPipeline;
  mod: (value: BigValue) => BigPipeline;
  pow: (exp?: number) => BigPipeline;
  round: (decimalPlaces?: number, roundingMode?: RoundingMode) => BigPipeline;
  sqrt: (root?: number, precision?: number) => BigPipeline;
  /**
   * Returns the current Big value. Alias to avoid accessing the getter directly.
   */
  value: () => Big;
  /**
   * String representation of the current value.
   */
  toString: (trimZeros?: boolean) => string;
};

export class BigPipe implements BigPipeline {
  current: Big;

  /** @deprecated Use `pipe` for an owned value or `pipeInPlace` to update a supplied Big. */
  constructor(initial: BigValue) {
    this.current = createBig(initial);
  }

  add(value: BigValue): this {
    addInPlace(this.current, value);
    return this;
  }

  sub(value: BigValue): this {
    subInPlace(this.current, value);
    return this;
  }

  mul(value: BigValue): this {
    mulInPlace(this.current, value);
    return this;
  }

  div(value: BigValue, precision?: number, roundingMode?: RoundingMode): this {
    divInPlace(this.current, value, precision, roundingMode);
    return this;
  }

  mod(value: BigValue): this {
    modInPlace(this.current, value);
    return this;
  }

  pow(exp = 2): this {
    powInPlace(this.current, exp);
    return this;
  }

  round(decimalPlaces?: number, roundingMode?: RoundingMode): this {
    roundInPlace(this.current, decimalPlaces, roundingMode);
    return this;
  }

  /** Rounds the current value to a multiple of a positive step. */
  roundToStep(step: BigValue, roundingMode?: RoundingMode): this {
    roundToStepInPlace(this.current, step, roundingMode);
    return this;
  }

  sqrt(root = 2, precision?: number): this {
    sqrtInPlace(this.current, root, precision);
    return this;
  }

  value(): Big {
    return this.current;
  }

  toString(trimZeros = true): string {
    return this.current.toString(trimZeros);
  }

  /** Formats the current value with exactly the requested decimal places. */
  toFixed(decimalPlaces?: number, roundingMode?: RoundingMode): string {
    return toFixed(this.current, decimalPlaces, roundingMode);
  }

  /** Converts the current value to the nearest representable JavaScript number. */
  toNumber(): number {
    return toNumber(this.current);
  }

  /** Formats the current value to the requested number of significant digits. */
  toPrecision(significantDigits: number, roundingMode?: RoundingMode): string {
    return toPrecision(this.current, significantDigits, roundingMode);
  }
}

/**
 * Creates a chain with its own Big. The chain updates that copy as operations are applied.
 *
 * @example
 * pipe("1.03").roundToStep("0.05").toFixed(2); // "1.05"
 */
export function pipe(initial: BigValue): BigPipe {
  return new BigPipe(initial instanceof Big ? new Big(initial) : initial);
}

/** Creates a chain that updates the supplied mutable Big. */
export function pipeInPlace(initial: Big): BigPipe {
  if (!(initial instanceof Big)) throw new TypeError("pipeInPlace requires a Big instance");
  return new BigPipe(initial);
}

/**
 * Creates a chain that reuses an existing Big.
 * @deprecated Use `pipe` to work on a copy or `pipeInPlace` to mutate the supplied Big explicitly.
 */
export function pipeBig(initial: BigValue): BigPipeline {
  return new BigPipe(initial);
}
