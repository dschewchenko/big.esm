import { Big, createBig } from "../big";
import { sinBig } from "./sin";
import { cosBig } from "./cos";
import { divBig } from "./div";
import { compareBig } from "./compare"; // Corrected path (was already correct, but for consistency)
import { absBig } from "./abs"; // Corrected path

const DEFAULT_TAN_PRECISION = 30;

export function tanBig(angle: Big, precision: number = DEFAULT_TAN_PRECISION): Big {
    const internalPrecision = precision + 7; // Higher precision for intermediate sin and cos

    const cosValue = cosBig(angle, internalPrecision);

    // Check if cosValue is effectively zero
    // A common way to check for "effective zero" is to see if its absolute value is less than a small threshold.
    // For instance, 10^-(precision+1) or similar.
    // Or, if `compareBig(cosValue, createBig(0)) === 0` is reliable enough.
    // Let's use a threshold comparison for robustness.
    const zeroThreshold = createBig("1e-" + (precision + 2)); // A small number, e.g., 10^-(prec+2)
    zeroThreshold.isNegative = false;
    
    // if (compareBig(cosValue, createBig(0)) === 0) { // Simpler check, might fail for very small non-zero due to precision limits
    if (compareBig(absBig(cosValue), zeroThreshold) < 0) { // abs(cosValue) < threshold
        throw new Error("Division by zero in tanBig: cosine is effectively zero.");
    }

    const sinValue = sinBig(angle, internalPrecision);
    
    const result = divBig(sinValue, cosValue, precision);

    // Normalize -0 to 0
    if (compareBig(result, createBig(0)) === 0 && result.isNegative) {
        result.isNegative = false;
    }

    return result;
}
