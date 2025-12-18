import type { Big } from "../big";
import { cloneBig } from "../utils/clone";
import { DEFAULT_PRECISION, ONE_BIGINT, TEN_BIGINT, ZERO_BIGINT } from "../utils/constants";
import { createBig } from "../utils/create";
import { isZero } from "../utils/is-zero";
import { pow10 } from "../utils/pow10";
import { addBig } from "./add";
import { divBig } from "./div";
import { mulBig } from "./mul";
import { powBig } from "./pow";

/**
 * Calculates the nth root of a Big instance and mutates it with the result.
 *
 * @category Operations
 */
export function sqrtBig(big: Big, root = 2, precision = DEFAULT_PRECISION): Big {
  if (precision < 0) throw new Error("Prec");

  const resultScale = Math.max(0, precision);

  if (isZero(big)) {
    big.value = ZERO_BIGINT;
    big.scale = resultScale;
    return big;
  }

  if (big.value === ONE_BIGINT) {
    big.value = ONE_BIGINT;
    big.scale = resultScale;
    return big;
  }

  if (big.value < ZERO_BIGINT && root % 2 === 0) {
    throw new Error("Root");
  }

  if (!Number.isInteger(root) || root < 2) {
    throw new Error("Root");
  }

  if (root === 2) {
    big.value = sqrt2Value(big, resultScale);
    big.scale = resultScale;
    return big;
  }

  const bigConst = cloneBig(big);
  sqrtApproximationInPlace(big, bigConst, root, resultScale);
  return big;
}

function sqrtApproximationInPlace(target: Big, value: Big, root: number, precision: number): void {
  const rootBig = createBig(root);
  const rootMinus1Big = createBig(root - 1);
  const twoBig = createBig(2);

  const temp = cloneBig(value);
  divBig(temp, twoBig, precision);

  target.value = value.value;
  target.scale = value.scale;
  addBig(target, temp);
  divBig(target, twoBig, precision);

  const next = cloneBig(target);
  const denomPow = cloneBig(target);
  const term2 = cloneBig(value);

  while (true) {
    next.value = target.value;
    next.scale = target.scale;
    mulBig(next, rootMinus1Big);

    denomPow.value = target.value;
    denomPow.scale = target.scale;
    powBig(denomPow, root - 1);

    term2.value = value.value;
    term2.scale = value.scale;
    divBig(term2, denomPow, precision);

    addBig(next, term2);
    divBig(next, rootBig, precision);

    if (absBigInt(target.value - next.value) <= ONE_BIGINT) {
      target.value = next.value;
      target.scale = precision;
      return;
    }

    target.value = next.value;
    target.scale = next.scale;
  }
}

function sqrt2Value(big: Big, precision: number): bigint {
  const workPrecision = precision + 1;
  const exp = 2 * workPrecision - big.scale;
  const absValue = big.value < ZERO_BIGINT ? -big.value : big.value;

  const scaled = exp >= 0 ? absValue * pow10(exp) : absValue / pow10(-exp);
  const root = bigIntSqrt(scaled);

  const nextDigit = root % TEN_BIGINT;
  let rounded = root / TEN_BIGINT;
  if (nextDigit >= 5n) rounded += ONE_BIGINT;

  return rounded;
}

function bigIntBitLength(value: bigint): number {
  const hex = value.toString(16);
  const code = hex.charCodeAt(0);
  const firstDigit = code < 58 ? code - 48 : code - 87;
  return (hex.length - 1) * 4 + (32 - Math.clz32(firstDigit));
}

function bigIntSqrt(value: bigint): bigint {
  if (value < ZERO_BIGINT) {
    throw new Error("Sqrt");
  }

  if (value < 2n) return value;

  const bits = bigIntBitLength(value);
  let x0 = ONE_BIGINT << BigInt((bits + 1) >> 1);
  let x1 = (x0 + value / x0) >> ONE_BIGINT;

  while (x1 < x0) {
    x0 = x1;
    x1 = (x0 + value / x0) >> ONE_BIGINT;
  }

  return x0;
}

function absBigInt(value: bigint): bigint {
  return value < ZERO_BIGINT ? -value : value;
}
