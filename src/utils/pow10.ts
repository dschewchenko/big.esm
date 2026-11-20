import { ONE_BIGINT, TEN_BIGINT } from "./constants.js";

/** Returns ten raised to a non-negative safe integer exponent without a growing cache. */
export function pow10(exp: number): bigint {
  if (!Number.isSafeInteger(exp) || exp < 0) throw new Error("Exp");
  // Direct literals cover the common scales without allocating a lookup table.
  switch (exp) {
    case 0:
      return ONE_BIGINT;
    case 1:
      return TEN_BIGINT;
    case 2:
      return 100n;
    case 3:
      return 1_000n;
    case 4:
      return 10_000n;
    case 5:
      return 100_000n;
    case 6:
      return 1_000_000n;
    case 7:
      return 10_000_000n;
    case 8:
      return 100_000_000n;
    case 9:
      return 1_000_000_000n;
    case 10:
      return 10_000_000_000n;
    case 11:
      return 100_000_000_000n;
    case 12:
      return 1_000_000_000_000n;
    case 13:
      return 10_000_000_000_000n;
    case 14:
      return 100_000_000_000_000n;
    case 15:
      return 1_000_000_000_000_000n;
    case 16:
      return 10_000_000_000_000_000n;
    case 17:
      return 100_000_000_000_000_000n;
    case 18:
      return 1_000_000_000_000_000_000n;
    case 19:
      return 10_000_000_000_000_000_000n;
    case 20:
      return 100_000_000_000_000_000_000n;
    case 21:
      return 1_000_000_000_000_000_000_000n;
    case 22:
      return 10_000_000_000_000_000_000_000n;
    case 23:
      return 100_000_000_000_000_000_000_000n;
    case 24:
      return 1_000_000_000_000_000_000_000_000n;
    case 25:
      return 10_000_000_000_000_000_000_000_000n;
    case 26:
      return 100_000_000_000_000_000_000_000_000n;
    case 27:
      return 1_000_000_000_000_000_000_000_000_000n;
    case 28:
      return 10_000_000_000_000_000_000_000_000_000n;
    case 29:
      return 100_000_000_000_000_000_000_000_000_000n;
    case 30:
      return 1_000_000_000_000_000_000_000_000_000_000n;
    case 31:
      return 10_000_000_000_000_000_000_000_000_000_000n;
  }
  if (exp < 64) {
    const block =
      exp < 48
        ? 100_000_000_000_000_000_000_000_000_000_000n
        : 1_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000_000n;
    return block * pow10(exp & 15);
  }
  if (exp > 255) {
    const exponent = BigInt(exp);
    // Compute the smaller odd factor before shifting, since 10ᵉ = 5ᵉ × 2ᵉ.
    return (5n ** exponent) << exponent;
  }

  // Inline powers form a fixed basis and leave no values cached between calls.
  let value = exp & 1 ? TEN_BIGINT : ONE_BIGINT;
  if (exp & 2) value *= 100n;
  if (exp & 4) value *= 10000n;
  if (exp & 8) value *= 100000000n;
  if (exp & 16) value *= 10000000000000000n;
  if (exp & 32) value *= 100000000000000000000000000000000n;
  if (exp & 64) value *= 10000000000000000000000000000000000000000000000000000000000000000n;
  if (exp & 128)
    value *=
      100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000n;
  return value;
}
