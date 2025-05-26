import { cosBig } from "../../src/operations/cos";
import { createBig, Big } from "../../src/big";
import { PI_BIG, PI_HALF_BIG, TWO_PI_BIG } from "../../src/utils/constants";
import { mulBig, divBig, subBig, addBig } from "../../src/index"; // For test calculations

describe("cosBig", () => {
    const defaultPrecision = 20;

    const compareBigStrings = (val: Big, expected: string, numDigits: number) => {
        const valStr = val.toString();
        if (expected.startsWith("-")) {
            if (!val.isNegative && parseFloat(valStr) !== 0) return false;
            return valStr.substring(0, Math.min(valStr.length, numDigits + (val.isNegative ? 1 : 0))) === expected.substring(0, Math.min(expected.length, numDigits + (val.isNegative ? 1 : 0)));
        }
        if (val.isNegative && parseFloat(expected) !== 0) return false;
        return valStr.substring(0, Math.min(valStr.length, numDigits)) === expected.substring(0, Math.min(expected.length, numDigits));
    };

    const checkCos = (angle: Big, expectedValStr: string, precision: number = defaultPrecision, compareDigits?: number) => {
        const result = cosBig(angle, precision);
        const digitsToCompare = compareDigits || precision -1; 
        // console.log(`Angle: ${angle.toString()}, Expected: ${expectedValStr}, Got: ${result.toString()}, Precision: ${precision}`);
        expect(compareBigStrings(result, expectedValStr, digitsToCompare)).toBe(true);
    };
    
    const checkCosNearZero = (angle: Big, precision: number = defaultPrecision) => {
        const result = cosBig(angle, precision);
        const threshold = createBig("1e-" + (precision - 1));
        threshold.isNegative = false;
        // Check if the absolute value of the result is less than the threshold
        // Need absBig for this, or rely on parseFloat for small test values.
        // For simplicity in test, using parseFloat, assuming result is not excessively large.
        // console.log(`Angle: ${angle.toString()}, Got: ${result.toString()}, Threshold: ${threshold.toString()}`);
        expect(Math.abs(parseFloat(result.toString()))).toBeLessThan(parseFloat(threshold.toString()));
    };


    it("should calculate cos(0) correctly", () => {
        checkCos(createBig(0), "1.0", defaultPrecision, 5);
    });

    it("should calculate cos(PI/2) correctly (should be 0)", () => {
        checkCosNearZero(PI_HALF_BIG, defaultPrecision);
    });

    it("should calculate cos(PI) correctly", () => {
        checkCos(PI_BIG, "-1.0", defaultPrecision, 5);
    });
    
    it("should calculate cos(3*PI/2) correctly (should be 0)", () => {
        const threePiHalf = mulBig(createBig(3), PI_HALF_BIG, defaultPrecision + 5);
        checkCosNearZero(threePiHalf, defaultPrecision);
    });

    it("should calculate cos(2*PI) correctly (should be 1)", () => {
        // cos(2PI) is 1. Due to PI precision, it might be slightly off.
        // checkCos(TWO_PI_BIG, "1.0", defaultPrecision, 5);
        const result = cosBig(TWO_PI_BIG, defaultPrecision);
        // Expect result to be very close to 1.0
        // e.g. 1.0 - threshold < result < 1.0 + threshold
        // or check (result - 1.0) is near zero
        const one = createBig(1);
        const diff = subBig(result, one);
        checkCosNearZero(diff, defaultPrecision); // Effectively checks if diff is near zero
    });

    it("should calculate cos(PI/3) correctly (0.5)", () => {
        const piOverThree = divBig(PI_BIG, createBig(3), defaultPrecision + 5);
        checkCos(piOverThree, "0.5", defaultPrecision, 4); // Compare "0.500"
    });

    it("should calculate cos(-PI) correctly", () => {
        const negPi = cloneBig(PI_BIG);
        negPi.isNegative = true;
        checkCos(negPi, "-1.0", defaultPrecision, 5);
    });
    
    it("should calculate cos(PI/4) correctly (sqrt(2)/2)", () => {
        // sqrt(2)/2 approx 0.70710678118
        const piOverFour = divBig(PI_BIG, createBig(4), defaultPrecision + 5);
        checkCos(piOverFour, "0.7071", defaultPrecision, 5);
    });

    it("should handle angles requiring reduction (e.g., 5*PI)", () => {
        // cos(5*PI) = cos(PI + 4*PI) = cos(PI) = -1
        const fivePi = mulBig(PI_BIG, createBig(5), defaultPrecision + 5);
        checkCos(fivePi, "-1.0", defaultPrecision, 5);
    });

    it("should handle negative angles requiring reduction (e.g., -7*PI/2)", () => {
        // cos(-7*PI/2) = cos(-3.5*PI) = cos(-PI/2 - 3*PI) = cos(-PI/2) = 0
        const negSevenPiHalf = mulBig(PI_HALF_BIG, createBig(-7), defaultPrecision + 5);
        checkCosNearZero(negSevenPiHalf, defaultPrecision);
    });
    
    it("should maintain precision", () => {
        const angle = divBig(PI_BIG, createBig(6), 35); // PI/6, cos(PI/6) = sqrt(3)/2 ~ 0.86602540378
        const expected = "0.86602540378443864676"; // High precision sqrt(3)/2
        const customPrecision = 20;
        const result = cosBig(angle, customPrecision);
        const resultStr = result.toString();
        const decimalPart = resultStr.split('.')[1] || "";
        // console.log(`Precision test: angle=${angle.toString()}, expected=${expected}, got=${resultStr}, decimalPartLen=${decimalPart.length}`);
        expect(decimalPart.length).toBeGreaterThanOrEqual(customPrecision -1);
        expect(resultStr.startsWith(expected.substring(0, customPrecision - 2))).toBe(true);
    });
});
