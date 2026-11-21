import type { Big } from "../big.js";
import type { BigValue } from "../types.js";
import { assertScale } from "../utils/assert-scale.js";
import { ZERO_BIGINT } from "../utils/constants.js";
import { pow10 } from "../utils/pow10.js";
import { readBigOperand } from "../utils/read-big-operand.js";

/**
 * Subtracts two Big instances and mutates the first one.
 */
export function subBig(a: Big, b: BigValue): Big {
  assertScale(a.scale);
  const right = readBigOperand(b);
  assertScale(right.scale);
  const scaleDifference = a.scale - right.scale;

  if (scaleDifference === 0) {
    a.value -= right.value;
    return a;
  }

  if (scaleDifference > 0) {
    if (scaleDifference <= 63 || right.value !== ZERO_BIGINT) a.value -= right.value * pow10(scaleDifference);
    return a;
  }

  a.value =
    scaleDifference >= -63 || a.value !== ZERO_BIGINT ? a.value * pow10(-scaleDifference) - right.value : -right.value;
  a.scale = right.scale;
  return a;
}
