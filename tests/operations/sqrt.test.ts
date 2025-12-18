import { expect, suite, test } from "vitest";
import { Big, sqrtBig } from "../../src";
import { bigints, numbers, numbersNegative, stringsDifferentScale, zero } from "../test-data";

suite("sqrtBig", () => {
  test("calculates the square root of zero", () => {
    const big = new Big(zero[0]);
    const result = sqrtBig(big);
    expect(result.toString()).toBe("0");
  });

  test("calculates the square root of one and precision 0", () => {
    const big = new Big(1);
    const result = sqrtBig(big, 2, 0);
    expect(result.toString()).toBe("1");
  });

  test("throws an error when calculating the square root of a negative number", () => {
    const big = new Big(numbersNegative[0]);
    expect(() => sqrtBig(big)).toThrow();
  });

  test("throws an error when calculating the root less then 2", () => {
    const big = new Big(numbers[0]);
    expect(() => sqrtBig(big, 1)).toThrow();
  });

  test("throws an error when calculating the root is not integer", () => {
    const big = new Big(numbers[0]);
    expect(() => sqrtBig(big, NaN)).toThrow();
  });

  test("throws an error when calculating the square root of number with negative precision", () => {
    const big = new Big(numbers[0]);
    expect(() => sqrtBig(big, 2, -1)).toThrow();
  });

  test("throws an error when calculating the square root of a negative number with precision and rounding mode", () => {
    const big = new Big(numbersNegative[0]);
    expect(() => sqrtBig(big, 2, 2)).toThrow();
  });

  test("calculates the square root of positive number with precision bigger than number of digits", () => {
    const big = new Big(numbers[0]);
    const result = sqrtBig(big, 2, 22);
    expect(result.toString()).toBe("11.1108055513540511245004");
  });

  test("calculates the fourth root of a positive Big instance", () => {
    const big = new Big(numbers[0]);
    const result = sqrtBig(big, 4);
    expect(result.toString()).toBe("3.33328749905465717008");
  });

  test("calculates the fourth root of a positive Big instance with precision 4", () => {
    const big = new Big(numbers[0]);
    const result = sqrtBig(big, 4, 4);
    expect(result.toString()).toBe("3.3333");
  });

  test("calculates the square root of a positive Big instance with default root", () => {
    const big = new Big(numbers[0]);
    const result = sqrtBig(big);
    expect(result.toString()).toBe("11.1108055513540511245");
  });

  test("calculates the square root of a positive Big instance with custom root", () => {
    const big = new Big(numbers[0]);
    const result = sqrtBig(big, 3);
    expect(result.toString()).toBe("4.97924731773760948818");
  });

  test("throws an error when calculating the square root of a negative Big instance", () => {
    const big = new Big(numbersNegative[0]);
    expect(() => sqrtBig(big)).toThrow();
  });

  test("calculates the cube root of a negative Big instance", () => {
    const big = new Big(numbersNegative[0]);
    const result = sqrtBig(big, 3);
    expect(result.toString()).toBe("-4.97924731773760948818");
  });

  test("throws an error when calculating even root of a negative Big instance", () => {
    const big = new Big(numbersNegative[0]);
    expect(() => sqrtBig(big, 4)).toThrow();
  });

  test("calculates the cube root of a positive Big instance", () => {
    const big = new Big(bigints[0]);
    const result = sqrtBig(big, 3);
    expect(result.toString()).toBe("2311204.24090183625113625691");
  });

  test("calculates the square root of a Big instance with decimal places", () => {
    const big = new Big(stringsDifferentScale[0]);
    const result = sqrtBig(big);
    expect(result.toString()).toBe("3513641828.82014425311122141561");
  });

  test("sqrtBig with precision = 0 should return the integer part of the result", () => {
    const result = sqrtBig(new Big(16), 2, 0);
    expect(result.toString()).toBe("4");
  });

  test("should return the result without decimal part when dotIndex is -1", () => {
    const result = sqrtBig(new Big(16), 2, 2);
    expect(result.toString()).toBe("4");
  });

  test("mutates the original Big instance", () => {
    const big = new Big(numbers[0]);
    const result = sqrtBig(big, 2, 20);

    expect(result).toBe(big);
    expect(big.toString()).toBe("11.1108055513540511245");
  });

  test("mutates the original Big instance with root 3", () => {
    const big = new Big(numbers[0]);
    const result = sqrtBig(big, 3, 20);

    expect(result).toBe(big);
    expect(big.toString()).toBe("4.97924731773760948818");
  });
});
