import { expect, suite, test } from "vitest";
import { Big, compareBig } from "../src";
import { bigints, numbers, numbersNegative, stringsDifferentScale, stringsDifferentScaleNegative, zero } from "./test-data";

suite("Big compare", () => {
  test("compares two equal Big instances with zero values", () => {
    const [a, b] = zero;
    const big1 = new Big(a);
    const big2 = new Big(b);

    expect(compareBig(big1, big2)).toBe(0);
  });

  test("compares numbers with different scales", () => {
    const big1 = new Big(numbers[0]);
    const big2 = new Big(numbers[1]);

    expect(compareBig(big1, big2)).toBe(1);
  });

  test("compares numbers with different scales and negative value", () => {
    const big1 = new Big(numbersNegative[0]);
    const big2 = new Big(numbersNegative[1]);

    expect(compareBig(big1, big2)).toBe(-1);
  });

  test("compares BigInt values without fractions", () => {
    const big1 = new Big(bigints[0]);
    const big2 = new Big(bigints[1]);

    expect(compareBig(big1, big2)).toBe(-1);
  });

  test("compares strings with different fraction lengths", () => {
    const big1 = new Big(stringsDifferentScale[0]);
    const big2 = new Big(stringsDifferentScale[1]);

    expect(compareBig(big1, big2)).toBe(-1);
  });

  test("compares strings with different fraction lengths and negative value", () => {
    const big1 = new Big(stringsDifferentScaleNegative[0]);
    const big2 = new Big(stringsDifferentScaleNegative[1]);

    expect(compareBig(big1, big2)).toBe(-1);
  });
});
