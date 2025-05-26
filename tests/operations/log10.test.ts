import { log10Big } from "../../src/operations/log10";
import { createBig, Big } from "../../src/big";
import { compareBig, absBig, subBig } from "../../src/index"; // For custom comparison

describe("log10Big (Base-10 Logarithm)", () => {
    const defaultTestPrecision = 15; // Precision for test comparisons

    const compareLog10Results = (
        val: Big,
        expected: Big,
        numDigits: number = defaultTestPrecision -1
    ): boolean => {
        const diff = subBig(val, expected, numDigits + 2);
        const thresholdVal = "0." + "0".repeat(numDigits-1) + "1"; // e.g., 0.000...1
        const threshold = createBig(thresholdVal);
        threshold.isNegative = false;
        
        // console.log(`Comparing log10: val=${val.toString()}, expected=${expected.toString()}, diff=${diff.toString()}, threshold=${threshold.toString()}`);
        return compareBig(absBig(diff), threshold) < 0; // abs(diff) < threshold
    };

    it("should calculate log10Big(1) correctly (should be 0)", () => {
        const result = log10Big(createBig(1), defaultTestPrecision);
        expect(compareLog10Results(result, createBig(0))).toBe(true);
    });

    it("should calculate log10Big(10) correctly (should be 1)", () => {
        const result = log10Big(createBig(10), defaultTestPrecision);
        expect(compareLog10Results(result, createBig(1))).toBe(true);
    });

    it("should calculate log10Big(100) correctly (should be 2)", () => {
        const result = log10Big(createBig(100), defaultTestPrecision);
        expect(compareLog10Results(result, createBig(2))).toBe(true);
    });
    
    it("should calculate log10Big(1000) correctly (should be 3)", () => {
        const result = log10Big(createBig(1000), defaultTestPrecision);
        expect(compareLog10Results(result, createBig(3))).toBe(true);
    });

    it("should calculate log10Big(0.1) correctly (should be -1)", () => {
        const result = log10Big(createBig("0.1"), defaultTestPrecision);
        expect(compareLog10Results(result, createBig(-1))).toBe(true);
    });

    it("should calculate log10Big(0.01) correctly (should be -2)", () => {
        const result = log10Big(createBig("0.01"), defaultTestPrecision);
        expect(compareLog10Results(result, createBig(-2))).toBe(true);
    });
    
    it("should calculate log10Big(0.001) correctly (should be -3)", () => {
        const result = log10Big(createBig("0.001"), defaultTestPrecision);
        expect(compareLog10Results(result, createBig(-3))).toBe(true);
    });

    it("should calculate log10Big for a number like 2 (log10(2) ~ 0.30103)", () => {
        const expected = createBig("0.30102999566"); // From calculator
        const result = log10Big(createBig(2), defaultTestPrecision);
        expect(compareLog10Results(result, expected, defaultTestPrecision - 2)).toBe(true);
    });
    
    it("should calculate log10Big for a number like 0.5 (log10(0.5) ~ -0.30103)", () => {
        const expected = createBig("-0.30102999566"); // From calculator
        const result = log10Big(createBig("0.5"), defaultTestPrecision);
        expect(compareLog10Results(result, expected, defaultTestPrecision - 2)).toBe(true);
    });

    it("should throw an error for log10Big(0)", () => {
        expect(() => log10Big(createBig(0))).toThrow("Base-10 logarithm undefined for non-positive values.");
    });

    it("should throw an error for log10Big(-10)", () => {
        expect(() => log10Big(createBig(-10))).toThrow("Base-10 logarithm undefined for non-positive values.");
    });

    it("should maintain requested precision for log10Big", () => {
        const num = createBig(3); // log10(3) ~ 0.4771212547196624
        const customPrecision = 18;
        const result = log10Big(num, customPrecision);
        const resultStr = result.toString();
        const decimalPart = resultStr.split('.')[1] || "";
        
        // console.log(`Precision test log10Big: num=${num.toString()}, got=${resultStr}, decimalPartLen=${decimalPart.length}`);
        expect(decimalPart.length).toBeGreaterThanOrEqual(customPrecision - 2);
        expect(decimalPart.length).toBeLessThanOrEqual(customPrecision + 2);
        
        const expectedValStr = "0.477121254719662437";
        expect(resultStr.startsWith(expectedValStr.substring(0, customPrecision -1 ))).toBe(true);
    });
});
