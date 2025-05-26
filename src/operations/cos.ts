import { Big, createBig, cloneBig } from "../big";
import { addBig, subBig, mulBig, divBig } from "../index";
import { PI_STRING, TWO_PI_STRING, PI_HALF_STRING } from "../utils/constants"; // Import string versions
import { absBig } from "./abs"; // Corrected path
import { compareBig } from "./compare"; // Corrected path
import { powBig } from "./pow";
import { factorialBig } from "../utils/factorial";

const DEFAULT_COS_PRECISION = 30; // Default precision for cosBig
const CONSTANT_PRECISION = 50; // Precision for PI constants when creating Big instances

export function cosBig(angle: Big, precision: number = DEFAULT_COS_PRECISION): Big {
    const internalPrecision = Math.max(precision + 5, CONSTANT_PRECISION + 2);

    // Create Big instances from string constants
    const pi = createBig(PI_STRING, internalPrecision);
    const twoPi = createBig(TWO_PI_STRING, internalPrecision);
    const piHalf = createBig(PI_HALF_STRING, internalPrecision);

    // 1. Angle Reduction (similar to sinBig)
    let reducedAngle = cloneBig(angle);

    // Reduce to [0, 2*PI)
    while (compareBig(reducedAngle, createBig(0)) < 0) {
        reducedAngle = addBig(reducedAngle, twoPi, internalPrecision);
    }
    if (compareBig(reducedAngle, twoPi) >= 0) {
        const revolutions = divBig(reducedAngle, twoPi, 0);
        revolutions.scale = 0;
        revolutions.isNegative = false;
        reducedAngle = subBig(reducedAngle, mulBig(revolutions, twoPi, internalPrecision), internalPrecision);
    }

    // Now reducedAngle is in [0, 2*PI)
    // Map to a range where Taylor series converges faster, e.g., [-PI/2, PI/2]
    // cos(x) has properties:
    // Quadrant 1: [0, PI/2)         -> cos(x)
    // Quadrant 2: [PI/2, PI)        -> -cos(PI - x)
    // Quadrant 3: [PI, 3PI/2)       -> -cos(x - PI)
    // Quadrant 4: [3PI/2, 2PI)      -> cos(2PI - x)
    
    let sign = createBig(1);
    let angleForSeries = cloneBig(reducedAngle);

    if (compareBig(angleForSeries, piHalf) > 0 && compareBig(angleForSeries, pi) <= 0) {
        // Quadrant 2: (PI/2, PI]
        angleForSeries = subBig(pi, angleForSeries, internalPrecision);
        sign = createBig(-1);
    } else if (compareBig(angleForSeries, pi) > 0 && compareBig(angleForSeries, addBig(pi, piHalf, internalPrecision)) <=0) {
        // Quadrant 3: (PI, 3PI/2]
        angleForSeries = subBig(angleForSeries, pi, internalPrecision);
        sign = createBig(-1);
    } else if (compareBig(angleForSeries, addBig(pi, piHalf, internalPrecision)) > 0 && compareBig(angleForSeries, twoPi) < 0) {
        // Quadrant 4: (3PI/2, 2PI)
        // cos(x) = cos(2PI - x) for x in (3PI/2, 2PI), so angle is (2PI-x) which is in (0, PI/2)
        angleForSeries = subBig(twoPi, angleForSeries, internalPrecision);
        // sign remains positive
    }
    // If in Quadrant 1 [0, PI/2], no change.

    // 2. Taylor Series Expansion for Cosine
    // cos(x) = 1 - x^2/2! + x^4/4! - x^6/6! + ... = sum from k=0 to inf of [(-1)^k * x^(2k) / (2k)!]
    
    let result = createBig(0, internalPrecision);
    const xSquared = powBig(angleForSeries, 2, internalPrecision);
    let term = createBig(1, internalPrecision); // First term is 1 (for k=0, x^0/0! = 1)
    
    const threshold = powBig(createBig(10), -precision, internalPrecision);
    threshold.isNegative = false;

    const maxIterations = 100; 

    for (let k = 0; k < maxIterations; k++) {
        if (compareBig(absBig(term), threshold) < 0 && k > 0) { // k > 0 because first term is 1
            break; 
        }
        
        result = addBig(result, term, internalPrecision);

        // Calculate next term: prevTerm * (-1) * x^2 / ((2k+1)*(2k+2))
        // Current term: (-1)^k * x^(2k) / (2k)!
        // Next term:    (-1)^(k+1) * x^(2(k+1)) / (2(k+1))!
        //            =  (-1)^(k+1) * x^(2k+2) / (2k+2)!
        //            =  prevTerm * (-1) * x^2 / ((2k+1)*(2k+2))
        
        if (k === maxIterations - 1) break; // Avoid calculating next term if loop ends

        const denominatorPart1 = createBig((2 * k + 1).toString());
        const denominatorPart2 = createBig((2 * k + 2).toString());
        const denominatorFull = mulBig(denominatorPart1, denominatorPart2, internalPrecision);
        
        term = mulBig(term, xSquared, internalPrecision);
        term = divBig(term, denominatorFull, internalPrecision);
        term.isNegative = !term.isNegative; // Alternate sign
    }
    
    result = mulBig(result, sign, precision);

    if (result.scale > precision) {
        // Basic truncation if necessary, though mulBig with precision should handle it.
        // This is a placeholder for a proper rounding/scaling function if needed.
        const diff = result.scale - precision;
        if (diff > 0) {
            const divisor = powBig(createBig(10), diff, 0); // Create 10^diff
            result = divBig(result, divisor, precision); // Effectively truncates
        }
    }
    
    if (compareBig(result, createBig(0)) === 0 && result.isNegative) {
        result.isNegative = false; // Normalize -0 to 0
    }

    return result;
}
