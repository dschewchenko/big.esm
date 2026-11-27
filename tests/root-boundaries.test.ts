import { expect, test } from "vitest";
import { Big, sqrt, sqrtBig } from "../src";

test("accepts precision beyond one million when the rounded root is zero", () => {
  const result = sqrtBig(new Big(0n), 2, 1_000_001);

  expect(result.value).toBe(0n);
  expect(result.scale).toBe(1_000_001);
});

test("preserves safe-integer precision when the root is zero", () => {
  const result = sqrtBig(new Big(0n), 2, Number.MAX_SAFE_INTEGER);

  expect(result.value).toBe(0n);
  expect(result.scale).toBe(Number.MAX_SAFE_INTEGER);
});

test("rejects unsafe precision before mutating the input", () => {
  const big = new Big(2n, 3);

  expect(() => sqrtBig(big, 2, 2 ** 53)).toThrow("Prec");
  expect(big.value).toBe(2n);
  expect(big.scale).toBe(3);
});

test("preserves exact roots that need more than two million coefficient digits", () => {
  const result = sqrtBig(new Big(1n, -4_000_002), 2, 0);

  expect(result.scale).toBe(0);
  expect(result.value.toString().length).toBe(2_000_002);
});

test("keeps exact compact powers of ten in the result", () => {
  const result = sqrtBig(new Big(1n, -3_000_000), 4_000, 0);

  expect(result.value).toBe(10n ** 750n);
  expect(result.scale).toBe(0);
  expect(sqrt("1e3000000", 4_000, 0)).toEqual(result);
});

test("keeps exact roots compact when fixed precision would need too many zeros", () => {
  const square = new Big(1n, -9_007_199_254_740_990);
  const cube = new Big(-1n, -9_007_199_254_740_990);
  const precision = 4_000_001;

  expect(sqrtBig(square)).toBe(square);
  expect(square).toEqual(new Big(1n, -4_503_599_627_370_495));
  expect(sqrtBig(cube, 3)).toBe(cube);
  expect(cube).toEqual(new Big(-1n, -3_002_399_751_580_330));
  expect(sqrt("1.00", 1, precision)).toEqual(new Big(1n));
  expect(sqrt(-1, 3, precision)).toEqual(new Big(-1n));
  expect(sqrt(new Big(1n, 10_000_000), 2, 10_000_000)).toEqual(new Big(1n, 5_000_000));
});

test("keeps exact compact roots with non-unit coefficients and rejects inexact expansion", () => {
  const square = new Big(40n, -9_999_999_999);
  const cube = new Big(-27n, -9_999_999_999);
  const inexact = new Big(2n, -10_000_000_000);

  expect(sqrtBig(square)).toBe(square);
  expect(square).toEqual(new Big(2n, -5_000_000_000));
  expect(sqrtBig(cube, 3)).toBe(cube);
  expect(cube).toEqual(new Big(-3n, -3_333_333_333));
  expect(() => sqrtBig(inexact)).toThrow(RangeError);
  expect(inexact).toEqual(new Big(2n, -10_000_000_000));
});

test("degree one recognizes positive one independent of its stored scale", () => {
  const big = new Big("1.000");
  const result = sqrtBig(big, 1, 4);

  expect(result).toBe(big);
  expect(result.value).toBe(10_000n);
  expect(result.scale).toBe(4);
  expect(result.toString()).toBe("1");
});

test.each(["0.9", "-1.0"])("continues to reject degree one for %s without mutation", (value) => {
  const big = new Big(value);
  const initialValue = big.value;
  const initialScale = big.scale;

  expect(() => sqrtBig(big, 1, 3)).toThrow("Root");
  expect(big.value).toBe(initialValue);
  expect(big.scale).toBe(initialScale);
});

test("bounded roots preserve exact results across large scale gaps", () => {
  expect(sqrtBig(new Big(1n, 10_000), 10_000, 2).toString()).toBe("0.1");
  expect(sqrtBig(new Big(1n, -10_000), 10_000, 2).toString()).toBe("10");
  expect(sqrtBig(new Big(-1n, 10_001), 10_001, 2).toString()).toBe("-0.1");
});

test.each([10n ** 90n + 3n, 10n ** 160n - 1n])("rounds a large square root around its exact midpoint", (root) => {
  const midpoint = 25n * (2n * root + 1n) ** 2n;

  expect(sqrt(new Big(midpoint - 1n, 42), 2, 20)).toEqual(new Big(root, 20));
  expect(sqrt(new Big(midpoint, 42), 2, 20)).toEqual(new Big(root + 1n, 20));
  expect(sqrt(new Big(midpoint + 1n, 42), 2, 20)).toEqual(new Big(root + 1n, 20));
});

test.each([7n, 10n ** 90n + 3n])("rounds integer radicands on either side of a square root midpoint", (root) => {
  const belowMidpoint = root * (root + 1n);

  expect(sqrt(new Big(belowMidpoint, 40), 2, 20)).toEqual(new Big(root, 20));
  expect(sqrt(new Big(belowMidpoint + 1n, 40), 2, 20)).toEqual(new Big(root + 1n, 20));
});
