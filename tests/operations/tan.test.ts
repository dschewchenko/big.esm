import { tanBig } from "../../src/operations/tan";
import { sinBig } from "../../src/operations/sin"; // For PI/2 edge case verification if needed
import { cosBig } from "../../src/operations/cos"; // For PI/2 edge case verification if needed
import { createBig, Big } from "../../src/big";
import { PI_BIG, PI_HALF_BIG } from "../../src/utils/constants";
import { mulBig, divBig } from "../../src/index";

describe("tanBig", () => {
    const defaultPrecision = 20; // Consistent with sin/cos tests

    const compareBigStrings = (val: Big, expected: string, numDigits: number) => {
        const valStr = val.toString();
        // console.log(`Comparing tan: valStr=${valStr}, expected=${expected}`);
        if (expected.startsWith("-")) {
            if (!val.isNegative && parseFloat(valStr) !== 0) return false;
            return valStr.substring(0, Math.min(valStr.length, numDigits + (val.isNegative ? 1 : 0))) === expected.substring(0, Math.min(expected.length, numDigits + (val.isNegative ? 1 : 0)));
        }
        if (val.isNegative && parseFloat(expected) !== 0) return false;
        return valStr.substring(0, Math.min(valStr.length, numDigits)) === expected.substring(0, Math.min(expected.length, numDigits));
    };

    const checkTan = (angle: Big, expectedValStr: string, precision: number = defaultPrecision, compareDigits?: number) => {
        const result = tanBig(angle, precision);
        const digitsToCompare = compareDigits || precision -1;
        // console.log(`Angle tan: ${angle.toString()}, Expected: ${expectedValStr}, Got: ${result.toString()}, Precision: ${precision}`);
        expect(compareBigStrings(result, expectedValStr, digitsToCompare)).toBe(true);
    };
    
    const checkTanNearZero = (angle: Big, precision: number = defaultPrecision) => {
        const result = tanBig(angle, precision);
        const threshold = createBig("1e-" + (precision - 1));
        threshold.isNegative = false;
        // console.log(`Angle tan near zero: ${angle.toString()}, Got: ${result.toString()}, Threshold: ${threshold.toString()}`);
        expect(Math.abs(parseFloat(result.toString()))).toBeLessThan(parseFloat(threshold.toString()));
    };

    it("should calculate tan(0) correctly", () => {
        checkTan(createBig(0), "0.0", defaultPrecision, 5);
    });

    it("should calculate tan(PI/4) correctly (should be 1)", () => {
        const piOverFour = divBig(PI_BIG, createBig(4), defaultPrecision + 5);
        checkTan(piOverFour, "1.0", defaultPrecision, 5);
    });

    it("should calculate tan(3*PI/4) correctly (should be -1)", () => {
        const threePi = mulBig(PI_BIG, createBig(3), defaultPrecision + 5);
        const threePiOverFour = divBig(threePi, createBig(4), defaultPrecision + 5);
        checkTan(threePiOverFour, "-1.0", defaultPrecision, 5);
    });
    
    it("should calculate tan(PI) correctly (should be 0)", () => {
        checkTanNearZero(PI_BIG, defaultPrecision);
    });

    it("should throw an error for tan(PI/2)", () => {
        // To verify, let's see what cos(PI/2) is first with high precision
        // const cosPiHalf = cosBig(PI_HALF_BIG, defaultPrecision + 10);
        // console.log("cos(PI/2) for tan test:", cosPiHalf.toString()); // Expect this to be very near zero
        expect(() => tanBig(PI_HALF_BIG, defaultPrecision)).toThrow("Division by zero in tanBig: cosine is effectively zero.");
    });

    it("should throw an error for tan(3*PI/2)", () => {
        const threePiHalf = mulBig(createBig(3), PI_HALF_BIG, defaultPrecision + 5);
        // const cosThreePiHalf = cosBig(threePiHalf, defaultPrecision + 10);
        // console.log("cos(3*PI/2) for tan test:", cosThreePiHalf.toString()); // Expect this to be very near zero
        expect(() => tanBig(threePiHalf, defaultPrecision)).toThrow("Division by zero in tanBig: cosine is effectively zero.");
    });

    it("should calculate tan(-PI/4) correctly (should be -1)", () => {
        const negPiOverFour = divBig(PI_BIG, createBig(-4), defaultPrecision + 5);
        checkTan(negPiOverFour, "-1.0", defaultPrecision, 5);
    });

    it("should handle angles requiring reduction (e.g., 9*PI/4)", () => {
        // tan(9*PI/4) = tan(2*PI + PI/4) = tan(PI/4) = 1
        const ninePi = mulBig(PI_BIG, createBig(9), defaultPrecision + 5);
        const ninePiOverFour = divBig(ninePi, createBig(4), defaultPrecision + 5);
        checkTan(ninePiOverFour, "1.0", defaultPrecision, 5);
    });
    
    it("should maintain precision for tan", () => {
        // tan(PI/3) = sqrt(3) ~ 1.73205081
        const piOverThree = divBig(PI_BIG, createBig(3), 35);
        const expected = "1.73205080756887729352"; // High precision sqrt(3)
        const customPrecision = 20;
        const result = tanBig(piOverThree, customPrecision);
        const resultStr = result.toString();
        const decimalPart = resultStr.split('.')[1] || "";

        // console.log(`Precision test tan: angle=${piOverThree.toString()}, expected=${expected}, got=${resultStr}, decimalPartLen=${decimalPart.length}`);
        expect(decimalPart.length).toBeGreaterThanOrEqual(customPrecision -1);
        expect(resultStr.startsWith(expected.substring(0, customPrecision - 2))).toBe(true);
    });
});
