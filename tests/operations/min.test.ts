import { expect, suite, test } from "vitest";
import { Big, minBig } from "../../src";

import { bigints, numbers, numbersNegative, stringsDifferentScale, stringsDifferentScaleNegative, zero } from "../test-data";

suite("Big min", () => {
test("returns the minimum of two Big instances with zero values", () => {
    const [a, b] = zero;
    const big1 = new Big(a);
    const big2 = new Big(b);

    const min = minBig(big1, big2);

    expect(min).toStrictEqual(big1);
  });

  test("returns the minimum of two numbers with different scales", () => {
    const big1 = new Big(numbers[0]);
    const big2 = new Big(numbers[1]);

    const min = minBig(big1, big2);

    expect(min).toStrictEqual(big2);
  });

  test("returns the minimum of two numbers with different scales and negative value", () => {
    const big1 = new Big(numbersNegative[0]);
    const big2 = new Big(numbersNegative[1]);

    const min = minBig(big1, big2);

    expect(min).toStrictEqual(big1);
  });

  test("returns the minimum of two BigInt values without fractions", () => {
    const big1 = new Big(bigints[0]);
    const big2 = new Big(bigints[1]);

    const min = minBig(big1, big2);

    expect(min).toStrictEqual(big1);
  });

  test("returns the minimum of two strings with different fraction lengths", () => {
    const big1 = new Big(stringsDifferentScale[0]);
    const big2 = new Big(stringsDifferentScale[1]);

    const min = minBig(big1, big2);

    expect(min).toStrictEqual(big1);
  });

  test("returns the minimum of two strings with different fraction lengths and negative value", () => {
    const big1 = new Big(stringsDifferentScaleNegative[0]);
    const big2 = new Big(stringsDifferentScaleNegative[1]);

    const min = minBig(big1, big2);

    expect(min).toStrictEqual(big1);
  });

  test("returns the minimum of two Big instances with zero values and mutable flag and mutates first Big instance", () => {
    const [a, b] = zero;
    const big1 = new Big(a);
    const big2 = new Big(b);

    const min = minBig(big1, big2, true);
    // check if the first Big instance is returned and was not mutated
    expect(min).toStrictEqual(big1);
    big1.value = BigInt(1);
    expect(min).toStrictEqual(big1);
  });

  test("returns the minimum of two Big instances with number values and mutable flag and mutates second Big instance", () => {
    const [a, b] = numbers;
    const big1 = new Big(a);
    const big2 = new Big(b);

    const min = minBig(big1, big2, true);
    // check if the first Big instance is returned and was not mutated
    expect(min).toStrictEqual(big2);
    big2.value = BigInt(1);
    expect(min).toStrictEqual(big2);
  });

  test("returns the minimum of two numbers with different scales and after mutating the first Big instance will not return the mutated value", () => {
    const big1 = new Big(numbers[0]);
    const big2 = new Big(numbers[1]);

    const min = minBig(big1, big2);
    // check if the second Big instance is returned and mutated
    expect(min).toStrictEqual(big2);
    big2.value = BigInt(1);
    expect(min).not.toStrictEqual(big2);
  });
});
