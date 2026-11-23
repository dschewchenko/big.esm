import { Big } from "../big.js";
import type { BigValue, RoundingMode } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { MAX_DECIMAL_EXPANSION } from "../utils/constants.js";
import { compareAbsoluteScaled } from "../utils/decimal-magnitude.js";
import { pow10 } from "../utils/pow10.js";
import { readBigOperand } from "../utils/read-big-operand.js";
import { divideRounded, roundTinyAway } from "../utils/rounding.js";

/** @inline */
type BigStepRoundingOperation = (big: Big, step: Big, roundingMode?: RoundingMode) => Big;

/**
 * Rounds a value to a multiple of a positive decimal step without mutating the input.
 * The result uses the step's existing scale.
 *
 * @param value - The value to round.
 * @param step - The positive step value.
 * @param roundingMode - The rounding rule. Defaults to half-up.
 * @returns A new Big instance containing the rounded multiple.
 * @throws If the step is not positive, either scale is invalid, or required alignment exceeds 2,000,000 places.
 *
 * @category Operations
 *
 * @example
 * roundToStep("1.03", "0.05").toString(); // "1.05"
 * roundToStep("1.025", "0.05", "half-even").toString(); // "1"
 */
export function roundToStep(value: BigValue, step: BigValue, roundingMode: RoundingMode = "half-up"): Big {
  return roundToStepInPlace(new Big(value), step, roundingMode);
}

/**
 * Rounds a Big value to a multiple of a positive decimal step and mutates it.
 * The result uses the step's existing scale.
 *
 * @param big - The value to round, replaced in place with the rounded multiple.
 * @param step - The positive step value. It is unchanged unless it is also `big`.
 * @param roundingMode - The rounding rule. Defaults to half-up.
 * @returns The mutated value.
 * @throws If the step is not positive, either scale is invalid, or required alignment exceeds 2,000,000 places.
 *
 * @category Operations
 *
 * @example
 * roundToStepInPlace(new Big("1.03"), "0.05").toString(); // "1.05"
 */
export function roundToStepInPlace(big: Big, step: BigValue, roundingMode: RoundingMode = "half-up"): Big {
  const stepValue = readBigOperand(step);
  if (stepValue.value <= 0n) throw new RangeError("Step");
  const valueScale = big.scale;
  const incrementScale = stepValue.scale;
  assertScale(valueScale);
  assertScale(incrementScale);
  const value = big.value;
  const increment = stepValue.value;
  if (value === 0n) {
    big.scale = incrementScale;
    return big;
  }

  const scaleShift = incrementScale - valueScale;
  const safeShift = Number.isSafeInteger(scaleShift);
  if (!safeShift || Math.abs(scaleShift) > 21) {
    const scaleShiftForComparison = safeShift ? scaleShift : BigInt(incrementScale) - BigInt(valueScale);
    const ratioMagnitude = compareAbsoluteScaled(value, scaleShiftForComparison, increment, 0n);
    const quotientSign = value < 0n ? -1 : 1;
    if (ratioMagnitude < 0) {
      const magnitude = value < 0n ? -value : value;
      const shouldRoundToOne = roundTinyAway(magnitude, scaleShiftForComparison, increment, roundingMode, quotientSign);
      big.value = shouldRoundToOne ? BigInt(quotientSign) * increment : 0n;
      big.scale = incrementScale;
      return big;
    }
    if (ratioMagnitude === 0) {
      big.value = BigInt(quotientSign) * increment;
      big.scale = incrementScale;
      return big;
    }
  }

  if (!safeShift || Math.abs(scaleShift) > MAX_DECIMAL_EXPANSION) {
    throw new RangeError("Increment rounding exceeds the decimal expansion limit");
  }

  const numerator = scaleShift > 0 ? value * pow10(scaleShift) : value;
  const denominator = scaleShift < 0 ? increment * pow10(-scaleShift) : increment;
  const roundedQuotient = divideRounded(numerator, denominator, roundingMode);
  big.value = roundedQuotient * increment;
  big.scale = incrementScale;
  return big;
}

/** @deprecated Use {@link roundToStep} for a non-mutating operation or {@link roundToStepInPlace} to mutate explicitly. */
export const roundToIncrement: BigStepRoundingOperation = roundToStepInPlace;
