import type { RoundingMode } from "../types.js";
import { compareAbsoluteScaled } from "./decimal-magnitude.js";
import { pow10 } from "./pow10.js";

export function validateDecimalPlaces(places: number): void {
  if (!Number.isSafeInteger(places) || places < 0) throw new RangeError("Prec");
}

export function divideRounded(dividend: bigint, divisor: bigint, mode: RoundingMode): bigint {
  const quotient = dividend / divisor;
  if (mode === "down") return quotient;

  const remainder = dividend % divisor;
  if (remainder === 0n) return quotient;
  if (mode === "floor" || mode === "ceil") {
    const negative = dividend < 0n !== divisor < 0n;
    if (mode === "floor" && negative) return quotient - 1n;
    if (mode === "ceil" && !negative) return quotient + 1n;
    return quotient;
  }

  if (mode !== "up") {
    const magnitude = remainder < 0n ? -remainder : remainder;
    const distanceToNext = (divisor < 0n ? -divisor : divisor) - magnitude;
    if (
      magnitude < distanceToNext ||
      (magnitude === distanceToNext && mode === "half-even" && (quotient & 1n) === 0n)
    ) {
      return quotient;
    }
  }

  return quotient + (dividend < 0n !== divisor < 0n ? -1n : 1n);
}

// The truncated quotient is zero, so a tie rounds to zero with half-even.
export function roundTinyAway(
  dividendMagnitude: bigint,
  shift: number | bigint,
  divisorMagnitude: bigint,
  mode: RoundingMode,
  quotientSign: -1 | 1
): boolean {
  if (mode === "up") return true;
  if (mode === "down") return false;
  if (mode === "floor") return quotientSign < 0;
  if (mode === "ceil") return quotientSign > 0;
  const midpoint = compareAbsoluteScaled(dividendMagnitude * 2n, shift, divisorMagnitude, 0);
  return midpoint > 0 || (midpoint === 0 && mode !== "half-even");
}

// Discard decimal places without materializing a huge power of ten for tiny values.
export function roundCoefficient(value: bigint, shift: number, mode: RoundingMode): bigint {
  if (value === 0n) return value;
  if (shift > 255 && compareAbsoluteScaled(value, -shift, 1n, 0) < 0) {
    const magnitude = value < 0n ? -value : value;
    const sign: -1 | 1 = value < 0n ? -1 : 1;
    return roundTinyAway(magnitude, -shift, 1n, mode, sign) ? BigInt(sign) : 0n;
  }
  return divideRounded(value, pow10(shift), mode);
}
