import type { Big } from "./big";
import { addBig } from "./operations/add";
import { divBig } from "./operations/div";
import { modBig } from "./operations/mod";
import { mulBig } from "./operations/mul";
import { powBig } from "./operations/pow";
import { sqrtBig } from "./operations/sqrt";
import { subBig } from "./operations/sub";
import type { BigValue, RoundingMode } from "./types";
import { createBig } from "./utils/create";

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
    addBig(this.current, createBig(value));
    return this;
  }

  sub(value: BigValue): this {
    subBig(this.current, createBig(value));
    return this;
  }

  mul(value: BigValue): this {
    mulBig(this.current, createBig(value));
    return this;
  }

  div(value: BigValue, precision?: number, roundingMode?: RoundingMode): this {
    divBig(this.current, createBig(value), precision, roundingMode);
    return this;
  }

  mod(value: BigValue): this {
    modBig(this.current, createBig(value));
    return this;
  }

  pow(exp = 2): this {
    powBig(this.current, exp);
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
}

/**
 * Creates a pipeline for chaining Big operations.
 * The pipeline owns and mutates its `Big` instance in-place.
 * Passing an existing `Big` will mutate that instance.
 */
export function pipeBig(initial: BigValue): BigPipeline {
  return new BigPipe(initial);
}
