import { expect, suite, test } from "vitest";
import { Big } from "../src";
import { isZero } from "../src/utils/is-zero";

suite("Big utils isZero", () => {
  test("returns true for a Big instance with zero value", () => {
    const big = new Big(0);
    expect(isZero(big)).toBe(true);
  });

  test("returns false for a Big instance with non-zero value", () => {
    const big = new Big(123);
    expect(isZero(big)).toBe(false);
  });

  test("returns true for a Big instance with zero value and non-zero scale", () => {
    const big = new Big(0, 2);
    expect(isZero(big)).toBe(true);
  });

  test("returns false for a Big instance with non-zero value and non-zero scale", () => {
    const big = new Big(123, 2);
    expect(isZero(big)).toBe(false);
  });

  test("returns true for a Big instance with negative zero value", () => {
    const big = new Big(-0);
    expect(isZero(big)).toBe(true);
  });

  test("returns false for a Big instance with negative non-zero value", () => {
    const big = new Big(-123);
    expect(isZero(big)).toBe(false);
  });

  test("returns true for a Big instance with negative zero value and non-zero scale", () => {
    const big = new Big(-0, 2);
    expect(isZero(big)).toBe(true);
  });

  test("returns false for a Big instance with negative non-zero value and non-zero scale", () => {
    const big = new Big(-123, 2);
    expect(isZero(big)).toBe(false);
  });
});
