/** Checks whether a value can be used as a decimal scale. */
export function isValidScale(scale: number): boolean {
  return Number.isSafeInteger(scale);
}

/** Validates the decimal scale stored on a Big value. */
export function assertScale(scale: number): void {
  if (!isValidScale(scale)) throw new RangeError("Scale");
}
