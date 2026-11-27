/**
 * Compares the magnitudes of two integers after applying decimal shifts.
 *
 * The shifts are kept implicit, so a large difference never creates a large
 * power of ten just to compare two values.
 */
export function compareAbsoluteScaled(
  a: bigint,
  aShift: number | bigint,
  b: bigint,
  bShift: number | bigint
): -1 | 0 | 1 {
  const aDigits = (a < 0n ? -a : a).toString();
  const bDigits = (b < 0n ? -b : b).toString();

  if (aDigits === "0" || bDigits === "0") {
    if (aDigits === bDigits) return 0;
    return aDigits === "0" ? -1 : 1;
  }

  const aLength = BigInt(aDigits.length) + toBigIntShift(aShift);
  const bLength = BigInt(bDigits.length) + toBigIntShift(bShift);
  if (aLength !== bLength) return aLength < bLength ? -1 : 1;

  const length = Math.max(aDigits.length, bDigits.length);
  for (let i = 0; i < length; i++) {
    const aDigit = i < aDigits.length ? aDigits.charCodeAt(i) : 48;
    const bDigit = i < bDigits.length ? bDigits.charCodeAt(i) : 48;
    if (aDigit !== bDigit) return aDigit < bDigit ? -1 : 1;
  }

  return 0;
}

function toBigIntShift(shift: number | bigint): bigint {
  if (typeof shift === "bigint") return shift;
  if (!Number.isSafeInteger(shift)) throw new Error("Exp");
  return BigInt(shift);
}

/** Checks whether a coefficient and scale represent positive one. */
export function isPositiveOne(value: bigint, scale: number): boolean {
  if (scale === 0) return value === 1n;
  if (scale < 0 || value <= 0n) return false;

  const digits = value.toString();
  if (digits.length - 1 !== scale || digits.charCodeAt(0) !== 49) return false;
  for (let i = 1; i < digits.length; i++) {
    if (digits.charCodeAt(i) !== 48) return false;
  }
  return true;
}
