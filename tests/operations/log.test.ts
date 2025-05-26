import { logBig } from "../../src/operations/log";
import { createBig, Big } from "../../src/big";
import { E_STRING } from "../../src/utils/constants"; // Import E_STRING
import { mulBig, sqrtBig, divBig, compareBig, absBig, subBig } from "../../src/index"; // Added compareBig, absBig, subBig

describe("logBig (Natural Logarithm)", () => {
    const defaultTestPrecision = 15; // Precision for test comparisons. logBig default is 30.
    const constantPrecision = 50; // Precision for creating Big instances from strings

    // Define Big instance from string constant for use in tests
    let E_BIG_TEST: Big;

    beforeAll(() => {
        E_BIG_TEST = createBig(E_STRING, constantPrecision);
    });

    // Helper to compare Big numbers based on their string representation up to a certain precision
    const compareBigAsStrings = (
        val: Big,
        expected: Big,
        numDigits: number = defaultTestPrecision -1 // Compare slightly less than full precision
    ): boolean => {
        const valStr = val.toString();
        const expectedStr = expected.toString();
        
        // console.log(`Comparing log: valStr=${valStr}, expectedStr=${expectedStr}, numDigits=${numDigits}`);

        // Check sign compatibility
        if (val.isNegative !== expected.isNegative && 
            (compareBig(val, createBig(0)) !== 0 || compareBig(expected, createBig(0)) !== 0) ) {
            // console.log(`Sign mismatch: val.isNegative=${val.isNegative}, expected.isNegative=${expected.isNegative}`);
            return false;
        }

        const minLength = Math.min(valStr.length, expectedStr.length, numDigits + (valStr.startsWith("0.") ? 0 : valStr.indexOf('.')) + (val.isNegative ? 1: 0) );
        
        // A simple direct string comparison for the significant part
        // This is a basic check. For robust checks, compare the difference against a threshold.
        // Expected: "1.00000000000000" (16 chars for 1. + 14 zeros)
        // valStr:   "0.99999999999999..."
        // We need to check if abs(val - expected) < threshold.

        const diff = subBig(val, expected, numDigits + 2); // Calculate difference with more precision
        const thresholdVal = "0." + "0".repeat(numDigits-1) + "1"; // e.g., 0.000...1 (numDigits-1 zeros)
        const threshold = createBig(thresholdVal);
        threshold.isNegative = false;
        
        // console.log(`Diff: ${diff.toString()}, Threshold: ${threshold.toString()}`);
        return compareBig(absBig(diff), threshold) < 0; // abs(diff) < threshold
    };

    it("should calculate logBig(1) correctly (should be 0)", () => {
        const result = logBig(createBig(1), defaultTestPrecision);
        expect(compareBigAsStrings(result, createBig(0))).toBe(true);
    });

    it("should calculate logBig(E) correctly (should be 1)", () => {
        // E_BIG_TEST has high precision. logBig default is 30. Test with 28 for safety.
        const result = logBig(E_BIG_TEST, 28); 
        expect(compareBigAsStrings(result, createBig(1), 27)).toBe(true);
    });

    it("should calculate logBig(E^2) correctly (should be 2)", () => {
        const eSquared = mulBig(E_BIG_TEST, E_BIG_TEST, E_BIG_TEST.scale + 2); // Ensure E_BIG_TEST.scale is high
        const result = logBig(eSquared, 28);
        expect(compareBigAsStrings(result, createBig(2), 27)).toBe(true);
    });

    it("should calculate logBig(sqrt(E)) correctly (should be 0.5)", () => {
        const sqrtE = sqrtBig(E_BIG_TEST, E_BIG_TEST.scale); // sqrtBig(E_BIG_TEST, precision for sqrt)
        const result = logBig(sqrtE, 28); // logBig with its own precision
        expect(compareBigAsStrings(result, createBig("0.5"), 27)).toBe(true);
    });

    it("should calculate logBig(10) correctly", () => {
        // ln(10) is approx 2.30258509299404568401...
        // This value is also LN10_STRING from constants.
        const expected = createBig("2.3025850929940457"); // Approx from calculator for comparison
        const result = logBig(createBig(10), defaultTestPrecision);
        expect(compareBigAsStrings(result, expected, defaultTestPrecision - 2)).toBe(true);
    });
    
    it("should calculate logBig for a small number (e.g., 0.1)", () => {
        // ln(0.1) = -ln(10) approx -2.30258509299
        const expected = createBig("-2.3025850929940457");
        const result = logBig(createBig("0.1"), defaultTestPrecision);
        expect(compareBigAsStrings(result, expected, defaultTestPrecision - 2)).toBe(true);
    });

    it("should calculate logBig for a number very close to 1 (e.g., 1.0001)", () => {
        // ln(1+x) ~ x for small x. ln(1.0001) ~ 0.0001
        const input = createBig("1.000000001");
        const expectedApprox = createBig("0.000000001"); // Taylor: (x-1)
        const result = logBig(input, 15);
        // Compare with a slightly wider tolerance or more terms of series if needed
        expect(compareBigAsStrings(result, expectedApprox, 8)).toBe(true);
    });

    it("should throw an error for logBig(0)", () => {
        expect(() => logBig(createBig(0))).toThrow("Logarithm undefined for non-positive values.");
    });

    it("should throw an error for logBig(-1)", () => {
        expect(() => logBig(createBig(-1))).toThrow("Logarithm undefined for non-positive values.");
    });

    it("should maintain requested precision", () => {
        const num = createBig(2); // ln(2) ~ 0.69314718056
        const customPrecision = 18;
        const result = logBig(num, customPrecision);
        const resultStr = result.toString();
        const decimalPart = resultStr.split('.')[1] || "";
        // console.log(`Precision test logBig: num=${num.toString()}, got=${resultStr}, decimalPartLen=${decimalPart.length}`);
        // Expect decimalPart.length to be close to customPrecision.
        // It can be slightly less if there are trailing zeros that are trimmed, or slightly more due to internal calculations.
        expect(decimalPart.length).toBeGreaterThanOrEqual(customPrecision - 2); // Allow some leeway
        expect(decimalPart.length).toBeLessThanOrEqual(customPrecision + 2);
        
        const expectedStr = "0.693147180559945309"; // ln(2) to high precision
        expect(resultStr.startsWith(expectedStr.substring(0, customPrecision -1 ))).toBe(true);
    });
});
