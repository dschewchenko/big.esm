import { expect, test } from "vitest";
import { Big, compare, createBig, divCompact, sumBig, toExponential } from "../src/index.js";

test("compares very large scientific notation without expanding its coefficient", () => {
  expect(compare("3e10000000000", 1)).toBe(1);
  expect(compare("-3e10000000000", -1)).toBe(-1);
  expect(compare("3e10000000000", "30e9999999999")).toBe(0);
  expect(compare("3e-10000000000", 0)).toBe(1);
});

test("divides compact scientific notation without expanding the coefficient", () => {
  const quotient = divCompact(createBig("3e10000000000"), 2);

  expect(quotient.value).toBe(15n);
  expect(quotient.scale).toBe(-9_999_999_999);
  expect(toExponential(quotient)).toBe("1.5e+10000000000");
});

test("uses the existing coefficient and scale for ordinary scientific notation", () => {
  expect(divCompact("3e3", 2)).toMatchObject({ value: 1500n, scale: 0 });
  expect(divCompact("1.20e2", "4e1")).toMatchObject({ value: 3n, scale: 0 });
});

test("handles a very large compact divisor and still rejects zero", () => {
  expect(divCompact(3, createBig("2e10000000000"))).toMatchObject({ value: 0n, scale: 20 });
  expect(() => divCompact(createBig("3e10000000000"), createBig("0e10000000000"))).toThrow("Div0");
});

test("keeps rounded division of large expanded scientific literals", () => {
  const quotient = divCompact("1e2000001", 3, 0);

  expect(quotient.scale).toBe(0);
  expect(quotient.value * 3n + 1n === 10n ** 2_000_001n).toBe(true);
});

test.each([1, 2, 5, 19, 31, 32])("keeps denominators with %i factors exact", (places) => {
  expect(divCompact(1n, 2n ** BigInt(places), places)).toMatchObject({
    value: 5n ** BigInt(places),
    scale: places
  });
  expect(divCompact(1n, 5n ** BigInt(places), places)).toMatchObject({
    value: 2n ** BigInt(places),
    scale: places
  });
});

test("keeps a signed compact quotient exact after cancelling large common factors", () => {
  const common = 13n * 10n ** 23n;
  const dividend = new Big(7n * common);
  const divisor = new Big(-(common * 2n ** 130n * 5n ** 383n), 383);

  expect(divCompact(dividend, divisor)).toMatchObject({ value: -7n * 2n ** 253n, scale: 0 });
});

test("handles a compact quotient whose scale difference is outside the safe integer range", () => {
  const scale = Number.MIN_SAFE_INTEGER;
  const dividend = new Big(1n, scale);

  expect(divCompact(dividend, new Big(1n, 1))).toMatchObject({ value: 10n, scale });
  expect(divCompact(dividend, new Big(2n, 1))).toMatchObject({ value: 5n, scale });
  expect(divCompact(new Big(1n, Number.MAX_SAFE_INTEGER), new Big(1n, -1))).toMatchObject({
    value: 0n,
    scale: 20
  });
});

test.each([
  [1, "1e-2000001", "-10e-2000002"],
  [1, "-10e-2000002", "1e-2000001"],
  ["1e-2000001", 1, "-10e-2000002"],
  ["1e-2000001", "-10e-2000002", 1],
  ["-10e-2000002", 1, "1e-2000001"],
  ["-10e-2000002", "1e-2000001", 1]
])("cancels fine-scale terms across a distant group in any order", (a, b, c) => {
  expect(sumBig([a, b, c])).toMatchObject({ value: 1n, scale: 0 });
});

test("sums distant terms exactly when the coefficient fits in a BigInt", () => {
  const result = sumBig([1, "1e-2000001"]);

  expect(result.scale).toBe(2_000_001);
  expect(result.value === 10n ** 2_000_001n + 1n).toBe(true);
});

test("rejects sums that still exceed the runtime's BigInt limit after cancellation", () => {
  expect(() => sumBig([createBig("3e10000000000"), 1, createBig("-2e10000000000")])).toThrow(RangeError);
});
