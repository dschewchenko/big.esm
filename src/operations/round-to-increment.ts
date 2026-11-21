import type { Big } from "../big.js";
import type { BigValue, RoundingMode } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { MAX_DECIMAL_EXPANSION } from "../utils/constants.js";
import { compareAbsoluteScaled } from "../utils/decimal-magnitude.js";
import { pow10 } from "../utils/pow10.js";
import { readBigOperand } from "../utils/read-big-operand.js";
import { divideRounded, roundTinyAway } from "../utils/rounding.js";

/**
 * Rounds a Big value to a multiple of a positive decimal increment and mutates it.
 * The result uses the increment's existing scale.
 *
 * @param big - The value to round, replaced in place with the rounded multiple.
 * @param operand - The positive increment value, unchanged by this operation.
 * @param roundingMode - The rounding rule. Defaults to half-up.
 * @returns The mutated value.
 * @throws If the increment is not positive, either scale is invalid, or required alignment exceeds 2,000,000 places.
 *
 * @category Operations
 *
 * @example
 * roundToIncrement(createBig("1.03"), "0.05").toString(); // "1.05"
 * roundToIncrement(createBig("1.025"), "0.05", "half-even").toString(); // "1"
 */
export function roundToIncrement(big: Big, operand: BigValue, roundingMode: RoundingMode = "half-up"): Big {
  const step = readBigOperand(operand);
  if (step.value <= 0n) throw new RangeError("Step");
  const valueScale = big.scale;
  const incrementScale = step.scale;
  assertScale(valueScale);
  assertScale(incrementScale);
  const value = big.value;
  const increment = step.value;
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
