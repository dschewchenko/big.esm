import { Big, createBig, cloneBig } from "../big";
import { divBig, compareBig } from "../index";
import { logBig } from "./log"; // Natural log function
import { LN10_BIG } from "../utils/constants"; // Natural log of 10

const DEFAULT_LOG10_PRECISION = 30;

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
    // Ensure LN10_BIG has enough precision for this division.
    // LN10_BIG from constants has 50 decimal places.
    // If internalPrecision for naturalLogX is very high, LN10_BIG might need adjustment if its scale is too low.
    // However, divBig handles operands with different scales, and its precision argument controls output.
    let ln10Referenced = LN10_BIG;
    if (LN10_BIG.scale < internalPrecision) { // Should not typically happen if LN10_BIG has 50 places
        ln10Referenced = cloneBig(LN10_BIG);
        ln10Referenced.scale = internalPrecision;
    }

    const result = divBig(naturalLogX, ln10Referenced, precision);

    // Normalize -0 to 0
    if (compareBig(result, createBig(0)) === 0 && result.isNegative) {
        result.isNegative = false;
    }

    return result;
}
