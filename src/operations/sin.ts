import { Big, createBig, cloneBig } from "../big";
import { addBig, subBig, mulBig, divBig } from "../index"; // Assuming these are correctly exported from library's index
import { PI_STRING, TWO_PI_STRING, PI_HALF_STRING } from "../utils/constants"; // Import string versions
import { absBig } from "./abs"; // Corrected path
import { compareBig } from "./compare"; // Corrected path
import { powBig } from "./pow"; // Assuming powBig is here
import { factorialBig } from "../utils/factorial";


const DEFAULT_SIN_PRECISION = 30; // Default precision for sinBig
const CONSTANT_PRECISION = 50; // Precision for PI constants when creating Big instances

export function sinBig(angle: Big, precision: number = DEFAULT_SIN_PRECISION): Big {
    // Ensure precision is reasonable for internal calculations, might need to be higher than target precision
    const internalPrecision = Math.max(precision + 5, CONSTANT_PRECISION + 2);

    // Create Big instances from string constants
    const pi = createBig(PI_STRING, internalPrecision);
    const twoPi = createBig(TWO_PI_STRING, internalPrecision);
    const piHalf = createBig(PI_HALF_STRING, internalPrecision);

    // 1. Angle Reduction
    // Reduce angle to the range [0, 2*PI)
    let reducedAngle = cloneBig(angle);
    
    // Handle negative angles by finding equivalent positive angle
    // sin(-x) = -sin(x). We can use this property later, or reduce to a positive equivalent.
    // For Taylor series, it's often better to work with positive values if possible,
    // or ensure the series handles signs correctly.
    // Let's reduce to [0, 2PI) first.
    // x_reduced = x % (2 * PI)
    // If angle is negative, add multiples of 2*PI to bring it to the positive range
    while (compareBig(reducedAngle, createBig(0)) < 0) {
        reducedAngle = addBig(reducedAngle, twoPi, internalPrecision);
    }
    
    // If angle is greater than or equal to 2*PI, subtract multiples of 2*PI
    // This is essentially a modulo operation: reducedAngle = angle % twoPi
    // divBig result is integer, so we can do: angle - floor(angle / twoPi) * twoPi
    if (compareBig(reducedAngle, twoPi) >= 0) {
        const revolutions = divBig(reducedAngle, twoPi, 0); // Integer division
        revolutions.scale = 0; // Ensure it's an integer
        revolutions.isNegative = false; // Floor behavior for positive numbers
        reducedAngle = subBig(reducedAngle, mulBig(revolutions, twoPi, internalPrecision), internalPrecision);
    }

    // Now reducedAngle is in [0, 2*PI)
    // Map to a range where Taylor series converges faster, e.g., [-PI/2, PI/2]
    // Current range: [0, 2PI)
    // Quadrant 1: [0, PI/2)         -> sin(x) = sin(x)
    // Quadrant 2: [PI/2, PI)        -> sin(x) = sin(PI - x)
    // Quadrant 3: [PI, 3PI/2)       -> sin(x) = -sin(x - PI)
    // Quadrant 4: [3PI/2, 2PI)      -> sin(x) = -sin(2PI - x)
    
    let sign = createBig(1);
    let angleForSeries = cloneBig(reducedAngle);

    if (compareBig(angleForSeries, piHalf) > 0 && compareBig(angleForSeries, pi) <= 0) {
        // Quadrant 2: [PI/2, PI]
        angleForSeries = subBig(pi, angleForSeries, internalPrecision);
    } else if (compareBig(angleForSeries, pi) > 0 && compareBig(angleForSeries, addBig(pi, piHalf, internalPrecision)) <=0) {
        // Quadrant 3: (PI, 3PI/2]
        angleForSeries = subBig(angleForSeries, pi, internalPrecision);
        sign = createBig(-1);
    } else if (compareBig(angleForSeries, addBig(pi, piHalf, internalPrecision)) > 0 && compareBig(angleForSeries, twoPi) < 0) {
        // Quadrant 4: (3PI/2, 2PI)
        angleForSeries = subBig(twoPi, angleForSeries, internalPrecision);
        sign = createBig(-1);
    }
    // If in Quadrant 1 [0, PI/2], no change to angleForSeries or sign is needed.
    // Note: angle reduction should be extremely precise. Using pi, twoPi from constants.

    // 2. Taylor Series Expansion
    // sin(x) = x - x^3/3! + x^5/5! - x^7/7! + ...
    // The angleForSeries is now in [0, PI/2] (or close to it due to precision of PI constants)
    
    let result = createBig(0, internalPrecision);
    let term = cloneBig(angleForSeries); // First term is x
    term.scale = internalPrecision; // Ensure term has enough scale
    
    let k = 0;
    const threshold = powBig(createBig(10), -precision, internalPrecision); // Term convergence threshold: 10^(-precision)
    threshold.isNegative = false; // Ensure threshold is positive

    // Max iterations to prevent infinite loops in case of non-convergence (should not happen for sin)
    const maxIterations = 100; 

    for (k = 0; k < maxIterations; k++) {
        if (compareBig(absBig(term), threshold) < 0 && k > 0) { // k > 0 ensures at least one term is added for small angles
            break; // Term is small enough, stop
        }

        result = addBig(result, term, internalPrecision);

        // Calculate next term: -term * x^2 / ((2k+2)(2k+3))
        // Current term is: (-1)^k * x^(2k+1) / (2k+1)!
        // Next term is: (-1)^(k+1) * x^(2k+3) / (2k+3)!
        // So, nextTerm = prevTerm * (-1) * x^2 / ((2k+2)*(2k+3))

        const xSquared = powBig(angleForSeries, 2, internalPrecision);
        
        const denominatorPart1 = createBig((2 * k + 2).toString());
        const denominatorPart2 = createBig((2 * k + 3).toString());
        const denominatorFull = mulBig(denominatorPart1, denominatorPart2, internalPrecision);
        
        term = mulBig(term, xSquared, internalPrecision);
        term = divBig(term, denominatorFull, internalPrecision);
        term.isNegative = !term.isNegative; // Alternate sign
    }
    
    result = mulBig(result, sign, precision); // Apply original sign and set final precision

    // Adjust scale to final precision, potentially rounding or truncating
    // This depends on how Big numbers handle scale internally or if a separate round/truncate is needed.
    // Assuming mulBig or a final adjustment step handles this.
    // If result.scale > precision, it might need truncation.
    // A proper rounding function would be better if available.
    if (result.scale > precision) {
        const factorStr = "1" + "0".repeat(result.scale - precision);
        const divisorForRounding = createBig(factorStr);
        // This is a form of truncation, not rounding.
        // result = divBig(result, divisorForRounding, precision); 
        // result = mulBig(result, divisorForRounding, precision);
        // No, that's not right for adjusting scale.
        // Let's assume the last mulBig(result, sign, precision) correctly sets the scale.
        // If not, a dedicated function like `setPrecisionBig(num, precision)` would be needed.
        // For now, rely on the precision argument of the last arithmetic operation.
    }
    
    // Handle -0 case
    if (compareBig(result, createBig(0)) === 0 && result.isNegative) {
        result.isNegative = false;
    }

    return result;
}
