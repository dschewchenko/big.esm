import { expect, suite, test } from "vitest";
import { Big, powBig } from "../src";
import { bigints, numbers, numbersNegative, zero } from "./test-data";

suite("Big pow", () => {
  test("raises a zero Big number to the power of a positive integer", () => {
    const base = new Big(zero[0]);
    const exponent = 3;

    expect(powBig(base, exponent).toString()).toBe("0");
  });

  test("raises a Big number to the power of zero", () => {
    const base = new Big(numbers[0]);
    const exponent = 0;

    expect(powBig(base, exponent).toString()).toBe("1");
  });

  test("raises a Big number to the power of one", () => {
    const base = new Big(numbers[0]);
    const exponent = 1;

    expect(powBig(base, exponent).toString()).toBe(base.toString());
  });

  test("raises a Big number to the power of a positive integer", () => {
    const base = new Big(numbers[0]);
    const exponent = 3;

    expect(powBig(base, exponent).toString()).toBe("1881365.963625");
  });

  test("raises a BigInt value without fractions to the power of a positive integer", () => {
    const base = new Big(bigints[0]);
    const exponent = 2;

    expect(powBig(base, exponent).toString()).toBe("152415787532388367501905199875019052100");
  });

  test("throws an error when the exponent is a negative integer", () => {
    const base = new Big(numbers[0]);
    const exponent = -1;

    expect(() => powBig(base, exponent)).toThrow("The exponent must be a non-negative integer.");
  });

  test("throws an error when the exponent is a non-integer", () => {
    const base = new Big(numbers[0]);
    const exponent = 0.5;

    expect(() => powBig(base, exponent)).toThrow("The exponent must be a non-negative integer.");
  });

  test("raises a negative Big number to the power of a positive even integer", () => {
    const base = new Big(numbersNegative[0]);
    const exponent = 2;

    expect(powBig(base, exponent).toString()).toBe("15239.9025");
  });

  test("raises a negative Big number to the power of a positive odd integer", () => {
    const base = new Big(numbersNegative[0]);
    const exponent = 3;

    expect(powBig(base, exponent).toString()).toBe("-1881365.963625");
  });

  test("throws an error when the exponent is not an integer", () => {
    const base = new Big(numbers[0]);
    const exponent = 2.5;

    expect(() => powBig(base, exponent)).toThrow("The exponent must be a non-negative integer.");
  });

  test("throws an error when the exponent is a negative integer", () => {
    const base = new Big(numbers[0]);
    const exponent = -2;

    expect(() => powBig(base, exponent)).toThrow("The exponent must be a non-negative integer.");
  });
});
