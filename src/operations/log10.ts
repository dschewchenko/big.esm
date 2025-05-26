import { Big, createBig, cloneBig } from "../big"; // createBig might be needed if not already from big
import { divBig, compareBig } from "../index";
import { logBig } from "./log"; // Natural log function
import { LN10_STRING } from "../utils/constants"; // Natural log of 10 as string

const DEFAULT_LOG10_PRECISION = 30;
const CONSTANT_PRECISION = 50; // Precision for LN10 constant

export function log10Big(x: Big, precision: number = DEFAULT_LOG10_PRECISION): Big {
    // Input validation: logBig will throw for non-positive x.
    // We can add a check here too if we want a specific error message for log10.
    if (compareBig(x, createBig(0)) <= 0) {
        throw new Error("Base-10 logarithm undefined for non-positive values.");
    }
    
    // To maintain precision for the final division, logBig should be called with higher precision.
    const internalPrecision = precision + 7; // Or precision + log10(LN10_BIG_integer_part_length) + few more

    const naturalLogX = logBig(x, internalPrecision);

    // log10(x) = ln(x) / ln(10)
    // Ensure LN10_STRING is converted to a Big instance with enough precision.
    const ln10 = createBig(LN10_STRING, Math.max(internalPrecision, CONSTANT_PRECISION));

    const result = divBig(naturalLogX, ln10, precision);

    // Normalize -0 to 0
    if (compareBig(result, createBig(0)) === 0 && result.isNegative) {
        result.isNegative = false;
    }

    return result;
}
