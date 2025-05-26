import { sinBig } from "../../src/operations/sin";
import { createBig, Big, cloneBig } from "../../src/big"; // Added cloneBig
import { PI_STRING, PI_HALF_STRING, TWO_PI_STRING } from "../../src/utils/constants"; // Import string versions
import { mulBig, divBig } from "../../src/index"; // For test calculations like 3*PI/2

describe("sinBig", () => {
    const defaultPrecision = 20; // Match default precision or use a specific one for tests
    const constantPrecision = 50; // Precision for creating Big instances from strings

    // Define Big instances from string constants for use in tests
    // Initialized inside the describe block or a beforeAll to ensure Vitest environment is ready
    let PI_BIG_TEST: Big;
    let PI_HALF_BIG_TEST: Big;
    let TWO_PI_BIG_TEST: Big;

    beforeAll(() => {
        PI_BIG_TEST = createBig(PI_STRING, constantPrecision);
        PI_HALF_BIG_TEST = createBig(PI_HALF_STRING, constantPrecision);
        TWO_PI_BIG_TEST = createBig(TWO_PI_STRING, constantPrecision);
    });

    // Helper to compare Big numbers based on their string representation up to a certain precision
    // This is a simplified comparison for tests.
    // A dedicated `assertEqualBig(a, b, precision)` in a test utils file would be better.
    const compareBigStrings = (val: Big, expected: string, numDigits: number) => {
        const valStr = val.toString();
        // console.log(`Comparing: valStr=${valStr}, expected=${expected}`);
        if (expected.startsWith("-")) {
            if (!val.isNegative && parseFloat(valStr) !== 0) return false; // Check sign for non-zero
            // Compare ignoring the sign for length, then add sign back if needed for substring
            return valStr.substring(0, Math.min(valStr.length, numDigits + (val.isNegative ? 1 : 0))) === expected.substring(0, Math.min(expected.length, numDigits + (val.isNegative ? 1 : 0)));

        }
        if (val.isNegative && parseFloat(expected) !== 0) return false; // Check sign for non-zero
        return valStr.substring(0, Math.min(valStr.length, numDigits)) === expected.substring(0, Math.min(expected.length, numDigits));
    };
    
    const checkSin = (angle: Big, expectedValStr: string, precision: number = defaultPrecision, compareDigits?: number) => {
        const result = sinBig(angle, precision);
        const digitsToCompare = compareDigits || precision -1; // Compare slightly less than full precision due to potential rounding diffs
        // console.log(`Angle: ${angle.toString()}, Expected: ${expectedValStr}, Got: ${result.toString()}, Precision: ${precision}`);
        expect(compareBigStrings(result, expectedValStr, digitsToCompare)).toBe(true);
    };

    it("should calculate sin(0) correctly", () => {
        checkSin(createBig(0), "0.0", defaultPrecision, 5);
    });

    it("should calculate sin(PI/2) correctly", () => {
        checkSin(PI_HALF_BIG_TEST, "1.0", defaultPrecision, 5);
    });

    it("should calculate sin(PI) correctly", () => {
        // Expected value is 0. PI_BIG_TEST might not be perfectly PI, so result could be very small non-zero.
        // We expect it to be very close to 0.
        const result = sinBig(PI_BIG_TEST, defaultPrecision);
        // Check if it's very close to zero, e.g., smaller than 10^-(precision-1)
        const threshold = createBig("1e-" + (defaultPrecision - 1));
        threshold.isNegative = false;
        expect(Math.abs(parseFloat(result.toString()))).toBeLessThan(parseFloat(threshold.toString()));
         // A more direct check for "0.000..."
        expect(result.toString().startsWith("0.000") || result.toString().startsWith("-0.000") || result.toString() === "0").toBe(true);
    });
    
    it("should calculate sin(3*PI/2) correctly", () => {
        const threePiHalf = mulBig(createBig(3), PI_HALF_BIG_TEST, defaultPrecision + 5); // 3 * (PI/2)
        checkSin(threePiHalf, "-1.0", defaultPrecision, 5);
    });

    it("should calculate sin(2*PI) correctly", () => {
        const result = sinBig(TWO_PI_BIG_TEST, defaultPrecision);
        const threshold = createBig("1e-" + (defaultPrecision - 1));
        threshold.isNegative = false;
        expect(Math.abs(parseFloat(result.toString()))).toBeLessThan(parseFloat(threshold.toString()));
        expect(result.toString().startsWith("0.000") || result.toString().startsWith("-0.000") || result.toString() === "0").toBe(true);
    });

    it("should calculate sin(PI/6) correctly (0.5)", () => {
        const piOverSix = divBig(PI_BIG_TEST, createBig(6), defaultPrecision + 5);
        checkSin(piOverSix, "0.5", defaultPrecision, 4); // 0.500...
    });

    it("should calculate sin(-PI/2) correctly", () => {
        const negPiHalf = cloneBig(PI_HALF_BIG_TEST);
        negPiHalf.isNegative = true;
        checkSin(negPiHalf, "-1.0", defaultPrecision, 5);
    });

    it("should calculate sin(PI/4) correctly (sqrt(2)/2)", () => {
        // sqrt(2)/2 approx 0.70710678118
        const piOverFour = divBig(PI_BIG_TEST, createBig(4), defaultPrecision + 5);
        checkSin(piOverFour, "0.7071", defaultPrecision, 5);
    });

    it("should handle angles requiring reduction (e.g., 5*PI)", () => {
        // sin(5*PI) = sin(PI + 4*PI) = sin(PI) = 0
        const fivePi = mulBig(PI_BIG_TEST, createBig(5), defaultPrecision + 5);
        const result = sinBig(fivePi, defaultPrecision);
        const threshold = createBig("1e-" + (defaultPrecision - 1));
        threshold.isNegative = false;
        expect(Math.abs(parseFloat(result.toString()))).toBeLessThan(parseFloat(threshold.toString()));
    });

    it("should handle negative angles requiring reduction (e.g., -7*PI/2)", () => {
        // sin(-7*PI/2) = sin(-3.5*PI) = sin(-PI/2 - 3*PI) = sin(-PI/2) = -1
        const negSevenPiHalf = mulBig(PI_HALF_BIG_TEST, createBig(-7), defaultPrecision + 5);
        checkSin(negSevenPiHalf, "-1.0", defaultPrecision, 5);
    });
    
    it("should maintain precision", () => {
        const angle = divBig(PI_BIG_TEST, createBig(3), 35); // PI/3, sin(PI/3) = sqrt(3)/2 ~ 0.86602540378
        const expected = "0.86602540378443864676"; // High precision sqrt(3)/2
        const customPrecision = 20;
        const result = sinBig(angle, customPrecision);
        // Check that the result string has approximately 'customPrecision' digits after decimal point
        // (or total digits if number is small).
        // This is a rough check. A more robust check would be to verify the error margin.
        const resultStr = result.toString();
        const decimalPart = resultStr.split('.')[1] || "";
        // console.log(`Precision test: angle=${angle.toString()}, expected=${expected}, got=${resultStr}, decimalPartLen=${decimalPart.length}`);
        expect(decimalPart.length).toBeGreaterThanOrEqual(customPrecision -1); // Allow for slight variation
        expect(resultStr.startsWith(expected.substring(0, customPrecision - 2))).toBe(true); // Compare first few significant digits
    });

    it("should handle small angles close to zero", () => {
        // For small x, sin(x) approx x
        const smallAngle = createBig("0.00000000012345");
        const result = sinBig(smallAngle, 15);
        // The result should be very close to the angle itself.
        // Allowing for a few digits difference at the end due to series calculation.
        expect(result.toString().startsWith("0.000000000123")).toBe(true);
    });
});
