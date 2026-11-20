import { expect, test } from "vitest";
import { Big, createBig, pow10, powBig } from "../src";

test.each([0, 1, 2, 9, 10, 20, 21, 22, 29, 30, 31, 63, 64, 127, 128, 255, 256, 257, 1024, 4096, 65536])(
  "computes 10^%i exactly without retained state",
  (exponent) => {
    expect(pow10(exponent)).toBe(10n ** BigInt(exponent));
  }
);

test.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
  "rejects invalid power of ten exponent %s",
  (exponent) => {
    expect(() => pow10(exponent)).toThrow("Exp");
  }
);

test.each([
  [0n, 0, 0, 1n],
  [0n, 10, 3, 0n],
  [1n, 0, Number.MAX_SAFE_INTEGER, 1n],
  [-1n, 0, Number.MAX_SAFE_INTEGER, -1n],
  [-1n, 0, Number.MAX_SAFE_INTEGER - 1, 1n],
  [123n, 4, 0, 1n],
  [-12345n, 3, 3, -1881365963625n],
  [123456789n, 3, 2, 15241578750190521n]
] as const)("raises %s × 10^-%i to exponent %i", (value, scale, exponent, expected) => {
  const input = new Big(value, scale);
  expect(powBig(input, exponent)).toBe(input);
  expect(input.value).toBe(expected);
  expect(input.scale).toBe(scale * exponent);
});

test("raises a large coefficient exactly and preserves its scale", () => {
  const coefficient = BigInt(`123456789${"0123456789".repeat(400)}`);
  const input = createBig(coefficient, 250);
  expect(powBig(input, 3).value).toBe(coefficient ** 3n);
  expect(input.scale).toBe(750);
});

test("rejects an invalid exponent without mutating the base", () => {
  const input = createBig("-12.34");
  const previousValue = input.value;
  const previousScale = input.scale;

  expect(() => powBig(input, 0.5)).toThrow("Exp");
  expect(() => powBig(input, -1)).toThrow("Exp");
  expect(input.value).toBe(previousValue);
  expect(input.scale).toBe(previousScale);
});

test("rejects a scale overflow without computing or mutating the base", () => {
  const input = createBig(12n, Number.MAX_SAFE_INTEGER);
  const previousValue = input.value;

  expect(() => powBig(input, 2)).toThrow("Scale");
  expect(input.value).toBe(previousValue);
  expect(input.scale).toBe(Number.MAX_SAFE_INTEGER);
});
