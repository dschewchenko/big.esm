import { ONE_BIGINT, TEN_BIGINT } from "./constants";

const POW10_CACHE_LIMIT = 256;
const POW10_CACHE: bigint[] = [ONE_BIGINT];

export function pow10(exp: number): bigint {
  if (exp < 0) {
    throw new Error("Exp");
  }

  if (exp <= POW10_CACHE_LIMIT) {
    const cached = POW10_CACHE[exp];
    if (cached !== undefined) return cached;

    for (let i = POW10_CACHE.length; i <= exp; i++) {
      POW10_CACHE[i] = POW10_CACHE[i - 1] * TEN_BIGINT;
    }

    return POW10_CACHE[exp];
  }

  return TEN_BIGINT ** BigInt(exp);
}
