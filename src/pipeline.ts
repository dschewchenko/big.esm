import type { Big } from "./big.js";
import { addBig } from "./operations/add.js";
import { divBig } from "./operations/div.js";
import { modBig } from "./operations/mod.js";
import { mulBig } from "./operations/mul.js";
import { powBig } from "./operations/pow.js";
import { roundBig } from "./operations/round.js";
import { roundToIncrement } from "./operations/round-to-increment.js";
import { sqrtBig } from "./operations/sqrt.js";
import { subBig } from "./operations/sub.js";
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

  constructor(initial: BigValue) {
    this.current = createBig(initial);
  }

  add(value: BigValue): this {
    addBig(this.current, value);
    return this;
  }

  sub(value: BigValue): this {
    subBig(this.current, value);
    return this;
  }

  mul(value: BigValue): this {
    mulBig(this.current, value);
    return this;
  }

  div(value: BigValue, precision?: number, roundingMode?: RoundingMode): this {
    divBig(this.current, value, precision, roundingMode);
    return this;
  }

  mod(value: BigValue): this {
    modBig(this.current, value);
    return this;
  }

  pow(exp = 2): this {
    powBig(this.current, exp);
    return this;
  }

  round(decimalPlaces?: number, roundingMode?: RoundingMode): this {
    roundBig(this.current, decimalPlaces, roundingMode);
    return this;
  }

  /** Rounds the current value to a multiple of a positive step. */
  roundToIncrement(step: BigValue, roundingMode?: RoundingMode): this {
    roundToIncrement(this.current, step, roundingMode);
    return this;
  }

  sqrt(root = 2, precision?: number): this {
    sqrtBig(this.current, root, precision);
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
 * Creates a pipeline for chaining Big operations.
 * The pipeline owns and mutates its `Big` instance in-place.
 * Passing an existing `Big` will mutate that instance.
 */
export function pipeBig(initial: BigValue): BigPipe {
  return new BigPipe(initial);
}
