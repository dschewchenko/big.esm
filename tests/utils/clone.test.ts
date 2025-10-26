import { expect, suite, test } from "vitest";
import { Big, cloneBig } from "../../src";
import { numbers, numbersNegative, stringsDifferentScale } from "../test-data";

suite("Big clone", () => {
  test("clones a Big instance", () => {
    const big = new Big(numbers[0]);
    const clone = cloneBig(big);
    expect(clone.toString()).toBe(big.toString());
  });

  test("clones a Big instance with negative value", () => {
    const big = new Big(numbersNegative[0]);
    const clone = cloneBig(big);
    expect(clone.toString()).toBe(big.toString());
  });

  test("clones a Big instance with big number value with digits", () => {
    const big = new Big(stringsDifferentScale[0]);
    const clone = cloneBig(big);
    expect(clone.toString()).toBe(big.toString());
  });
});
