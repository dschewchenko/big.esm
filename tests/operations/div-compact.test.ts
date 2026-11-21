import { expect, test } from "vitest";
import { createBig, createCompactBig, divBig, divCompactBig, toExponential, toFixed } from "../../src";

test.each([
  ["1", "8", 20, "half-up", "0.125", 3],
  ["1", "3", 4, "half-up", "0.3333", 4],
  ["2", "3", 4, "half-up", "0.6667", 4],
  ["-1", "8", 2, "half-even", "-0.12", 2],
  ["1", "-6", 2, "floor", "-0.17", 2],
  ["1", "-6", 2, "ceil", "-0.16", 2],
  ["1.20", "0.08", 20, "half-up", "15", 0],
  ["15", "-12", 20, "half-up", "-1.25", 2],
  ["0", "3", 20, "up", "0", 0]
] as const)("divides %s by %s within %i places, %s", (a, b, places, mode, expected, scale) => {
  const dividend = createBig(a);
  const divisor = createBig(b);
  expect(divCompactBig(dividend, divisor, places, mode)).toBe(dividend);
  expect(dividend.toString()).toBe(expected);
  expect(dividend.scale).toBe(scale);
  expect(divisor.toString()).toBe(createBig(b).toString());
});

test("uses negative scale for an exact result with a huge integral part", () => {
  const value = createCompactBig("3e10000000000");
  expect(toExponential(divCompactBig(value, createBig(2)))).toBe("1.5e+10000000000");
  expect(value.value).toBe(15n);
  expect(value.scale).toBe(-9_999_999_999);
});

test("retains exact results at the lowest safe scale when minimal padding is needed", () => {
  const value = createBig(1n, Number.MIN_SAFE_INTEGER);
  divCompactBig(value, createBig("0.1"));
  expect(value.value).toBe(10n);
  expect(value.scale).toBe(Number.MIN_SAFE_INTEGER);
  expect(toExponential(value)).toBe("1e+9007199254740992");
});

test("rounds a tiny repeating quotient without expanding its scale", () => {
  const value = createBig(-1n, Number.MAX_SAFE_INTEGER);
  expect(divCompactBig(value, createBig(3n), 5, "floor").toString()).toBe("-0.00001");
  expect(value.scale).toBe(5);
});

test("handles large powers of two and five with an exact integer reference", () => {
  for (const [twos, fives] of [
    [0n, 3003n],
    [3011n, 2997n],
    [2997n, 3011n]
  ]) {
    const denominator = (1n << twos) * 5n ** fives;
    const expectedScale = Math.max(Number(twos), Number(fives));
    const value = divCompactBig(createBig(19n), createBig(denominator), expectedScale);
    expect(value.scale).toBe(expectedScale);
    expect(value.value * denominator).toBe(19n * 10n ** BigInt(expectedScale));
  }
});

test("division by itself is exact and mutates the aliased value safely", () => {
  const value = createCompactBig("-1.2345e10000000000");
  expect(divCompactBig(value, value).toString()).toBe("1");
  expect(value.scale).toBe(0);
});

test("rejects invalid precision and a zero divisor before mutation", () => {
  const initial = createBig("1.25");
  for (const places of [1_000_001, -1, 1.5, Infinity, NaN]) {
    expect(() => divCompactBig(initial, createBig(2), places)).toThrow(RangeError);
  }
  expect(() => divCompactBig(initial, createBig(0))).toThrow("Div0");
  expect(initial.toString()).toBe("1.25");
});

test("rejects an invalid scale before division or formatting, even for zero", () => {
  const invalid = createBig(0n);
  invalid.scale = 1.5;
  const value = createBig(3n);
  expect(() => divBig(value, invalid)).toThrow();
  expect(() => divBig(invalid, value)).toThrow("Scale");
  expect(() => divCompactBig(invalid, value)).toThrow("Scale");
  expect(() => toFixed(invalid)).toThrow("Scale");
  expect(() => toExponential(invalid)).toThrow("Scale");
  expect(invalid.value).toBe(0n);
  expect(value.toString()).toBe("3");
});

test("limits requested fractional places and oversized expansion before allocating", () => {
  const huge = createCompactBig("1e10000000000");
  expect(() => divBig(huge, createBig(2))).toThrow(/expansion limit/);
  expect(() => divCompactBig(huge, createBig(3))).toThrow(/expansion limit/);
  expect(() => toFixed(huge, 2)).toThrow(/Use toExponential/);
  expect(toExponential(huge)).toBe("1e+10000000000");

  expect(() => divBig(createBig(1), createBig(3), 1_000_001)).toThrow(RangeError);
  expect(() => toFixed(createBig(1), 1_000_001)).toThrow(RangeError);
  expect(divBig(createBig(0), createBig(3), 1_000_000).scale).toBe(1_000_000);
  expect(divCompactBig(createBig(1), createBig(2), 1_000_000).toString()).toBe("0.5");
});
