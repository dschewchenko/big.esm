import { Big, createBig, cloneBig } from "../big";
import { addBig, subBig, mulBig, divBig, absBig, compareBig, sqrtBig, powBig } from "../index"; // Assuming all are exported from index
import { E_STRING } from "../utils/constants"; // Import E_STRING

const DEFAULT_LOG_PRECISION = 30;
const CONSTANT_PRECISION = 50; // Precision for E constant

// Natural logarithm ln(x)
export function logBig(x: Big, precision: number = DEFAULT_LOG_PRECISION): Big {
    if (compareBig(x, createBig(0)) <= 0) {
        throw new Error("Logarithm undefined for non-positive values.");
    }

    if (compareBig(x, createBig(1)) === 0) {
        return createBig(0, precision);
    }

    const internalPrecision = precision + 10; // Higher precision for intermediate steps
    
    let currentX = cloneBig(x);
    currentX.scale = internalPrecision;

    const one = createBig(1, internalPrecision);
    const two = createBig(2, internalPrecision);

    let k = 0; // exponent for E scaling: x_original = currentX_scaled * E_BIG^k

    // Use E_STRING from constants.
    const eReferenced = createBig(E_STRING, Math.max(internalPrecision, CONSTANT_PRECISION));


    // Scale currentX to be in a range suitable for Taylor series, e.g., [1/E_BIG, E_BIG)
    // More specifically, try to bring it into [1, E_BIG) if x > 1, or (1/E_BIG, 1] if x < 1.
    if (compareBig(currentX, one) > 0) { // currentX > 1
        while (compareBig(currentX, eReferenced) >= 0) { // currentX >= E_BIG
            currentX = divBig(currentX, eReferenced, internalPrecision);
            k++;
        }
    } else { // 0 < currentX < 1
        const oneOverE = divBig(one, eReferenced, internalPrecision);
        while (compareBig(currentX, oneOverE) < 0) { // currentX < 1/E_BIG
            currentX = mulBig(currentX, eReferenced, internalPrecision);
            k--;
        }
    }
    // Now currentX is scaled.
    // log_e(x_original) = log_e(currentX_scaled * E_BIG^k) = log_e(currentX_scaled) + k * log_e(E_BIG)
    // = log_e(currentX_scaled) + k

    // Now, use Taylor series for ln(currentX_scaled)
    // ln(z) = 2 * sum [ y^(2n+1) / (2n+1) ] for n=0 to inf, where y = (z-1)/(z+1)
    // currentX_scaled is 'z'
    
    const y_num = subBig(currentX, one, internalPrecision);
    const y_den = addBig(currentX, one, internalPrecision);
    const y = divBig(y_num, y_den, internalPrecision);

    let seriesSum = createBig(0, internalPrecision);
    let term;
    const ySquared = mulBig(y, y, internalPrecision);
    let yPower = cloneBig(y); // First yPower is y^1 (for n=0, (2n+1)=1)

    // Threshold for series term magnitude
    // Stop when term is smaller than 10^-(precision_of_series_sum)
    const termThreshold = powBig(createBig(10), -(internalPrecision - 2), internalPrecision); 
    termThreshold.isNegative = false;

    for (let n = 0; n < 200; n++) { // Max iterations to prevent infinite loop (200 should be very safe)
        const nBig = createBig(2 * n + 1, 0); // Denominator (2n+1)
        term = divBig(yPower, nBig, internalPrecision);

        // Check for convergence
        if (compareBig(absBig(term), termThreshold) < 0 && n > 0) {
            break;
        }
        seriesSum = addBig(seriesSum, term, internalPrecision);
        
        // Update yPower for next iteration: yPower * y^2
        yPower = mulBig(yPower, ySquared, internalPrecision);
        if (compareBig(yPower, createBig(0)) === 0) break; // yPower became 0, further terms will be 0
    }
    
    let logValCurrentX = mulBig(seriesSum, two, internalPrecision);

    // log(x) = k + logValCurrentX
    const kBig = createBig(k.toString()); // k is an integer, so scale 0 initially
    kBig.scale = internalPrecision; // Align scale for addition
    
    let finalResult = addBig(logValCurrentX, kBig, precision);
    
    // Normalize -0 to 0
    if (compareBig(finalResult, createBig(0)) === 0 && finalResult.isNegative) {
        finalResult.isNegative = false;
    }
    
    // Final adjustment to precision if addBig doesn't already do it.
    // Most arithmetic functions in this lib take precision as last arg.
    // If `finalResult.scale` is not equal to `precision`, an explicit adjustment might be needed.
    // However, `addBig` already takes `precision` as an argument.

    return finalResult;
}
