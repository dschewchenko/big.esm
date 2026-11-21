type ShortDecimal = {
  value: number;
  scale: number;
};

/** @internal Reads a plain decimal whose coefficient is an exact safe integer. */
export function readShortDecimal(text: string): ShortDecimal | undefined {
  const length = text.length;
  // Up to 15 decimal digits fit without rounding. Wider literals and exponents use the general parser.
  if (length > 15) return undefined;
  const negative = text.charCodeAt(0) === 45;
  const start = negative ? 1 : 0;
  let value = 0;
  let point = -1;
  for (let index = start; index < length; index++) {
    const digit = text.charCodeAt(index) - 48;
    if (digit >= 0 && digit <= 9) {
      value = value * 10 + digit;
    } else if (digit === -2 && point < 0) {
      point = index;
    } else {
      return undefined;
    }
  }
  if (length === start || (point >= 0 && length === start + 1)) return undefined;

  return {
    value: negative ? -value : value,
    scale: point < 0 || value === 0 ? 0 : length - point - 1
  };
}

/** @internal Adds or subtracts two short decimal strings when all intermediate integers are exact. */
export function addShortDecimals(a: string, b: string, subtract = false): ShortDecimal | undefined {
  const left = readShortDecimal(a);
  if (left === undefined) return undefined;
  const right = readShortDecimal(b);
  if (right === undefined) return undefined;

  const scale = Math.max(left.scale, right.scale);
  const leftValue = left.scale === scale ? left.value : left.value * 10 ** (scale - left.scale);
  const rightValue = right.scale === scale ? right.value : right.value * 10 ** (scale - right.scale);
  const result = subtract ? leftValue - rightValue : leftValue + rightValue;
  // Each alignment must fit even if cancellation brings the final value within range.
  if (Number.isSafeInteger(leftValue) && Number.isSafeInteger(rightValue) && Number.isSafeInteger(result)) {
    left.value = result;
    left.scale = scale;
    return left;
  }
  return undefined;
}
