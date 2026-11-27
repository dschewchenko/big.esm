import { Big as BigJS } from "big.js";
import { expect, test } from "vitest";
import { createBig } from "../src";
import { toPrecision } from "../src/utils/to-precision.js";

test.each([
  ["123.456", 4, "half-up", "123.5"],
  ["1.2300", 4, "half-up", "1.230"],
  ["1000", 2, "half-up", "1.0e+3"],
  ["0.00000123", 4, "half-up", "0.000001230"],
  ["0.000000123", 3, "half-up", "1.23e-7"],
  ["9.99", 1, "half-up", "1e+1"],
  ["9.99", 2, "half-up", "10"],
  ["9999", 3, "half-up", "1.00e+4"],
  ["-9.99", 1, "half-up", "-1e+1"],
  ["0", 1, "half-up", "0"],
  ["0", 4, "half-up", "0.000"]
] as const)("formats %s to %i significant digits with %s as %s", (value, digits, mode, expected) => {
  expect(toPrecision(createBig(value), digits, mode)).toBe(expected);
});

test("matches Big.js precision formatting across signed values, scales, and rounding modes", () => {
  const modes = [
    ["down", BigJS.roundDown],
    ["half-up", BigJS.roundHalfUp],
    ["half-even", BigJS.roundHalfEven],
    ["up", BigJS.roundUp]
  ] as const;

  for (const coefficient of [-10000n, -9355n, -10n, -5n, -1n, 0n, 1n, 5n, 1250n, 9355n, 10n ** 40n + 4565n]) {
    for (const scale of [-3, 0, 1, 2, 3, 6, 44]) {
      const value = createBig(coefficient, scale);
      const reference = new BigJS(`${coefficient}e${-scale}`);

      for (const significantDigits of [1, 2, 3, 4, 8]) {
        for (const [mode, bigJsMode] of modes) {
          expect(toPrecision(value, significantDigits, mode)).toBe(reference.toPrecision(significantDigits, bigJsMode));
        }
      }
    }
  }
});

test.each([
  ["1e20", 1, "1e+20"],
  ["1e21", 21, "1.00000000000000000000e+21"],
  ["0.000001", 1, "0.000001"],
  ["0.0000001", 1, "1e-7"],
  ["12345", 5, "12345"],
  ["12345", 4, "1.235e+4"]
] as const)("uses Big.js notation thresholds for %s at %i digits", (value, significantDigits, expected) => {
  expect(toPrecision(value, significantDigits)).toBe(expected);
});

test("applies floor and ceiling toward the correct signed infinity", () => {
  expect(toPrecision("1.21", 2, "floor")).toBe("1.2");
  expect(toPrecision("-1.21", 2, "floor")).toBe("-1.3");
  expect(toPrecision("1.21", 2, "ceil")).toBe("1.3");
  expect(toPrecision("-1.21", 2, "ceil")).toBe("-1.2");
});

test("formats huge exponents without expanding zeros and preserves the input", () => {
  const positive = createBig("1e10000000000");
  const negative = createBig("-1.2345e-10000000000");
  const snapshot = { value: negative.value, scale: negative.scale };

  expect(toPrecision(positive, 3)).toBe("1.00e+10000000000");
  expect(toPrecision(negative, 3)).toBe("-1.23e-10000000000");
  expect(negative).toMatchObject(snapshot);
  expect(toPrecision(createBig(123n, -Number.MAX_SAFE_INTEGER), 3)).toBe("1.23e+9007199254740993");
  expect(toPrecision(createBig(-123n, Number.MAX_SAFE_INTEGER), 3)).toBe("-1.23e-9007199254740989");
  expect(toPrecision(createBig(0n, Number.MAX_SAFE_INTEGER), 3)).toBe("0.00");
});

test("keeps the exponent exact when rounding carries across the safe integer boundary", () => {
  expect(toPrecision(createBig(99n, 1 - Number.MAX_SAFE_INTEGER), 1)).toBe("1e+9007199254740992");
  expect(toPrecision(createBig(99n, -Number.MAX_SAFE_INTEGER), 1)).toBe("1e+9007199254740993");
});

test("accepts all BigValue forms", () => {
  expect(toPrecision(123.456, 4)).toBe("123.5");
  expect(toPrecision(123456n, 4)).toBe("1.235e+5");
  expect(toPrecision({ value: 123456n, scale: 3 }, 4)).toBe("123.5");
  expect(toPrecision(createBig("1.25"), 2)).toBe("1.3");
});

test.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, 1_000_001])(
  "rejects invalid significant digit counts %s",
  (significantDigits) => {
    expect(() => toPrecision("1.2", significantDigits)).toThrow(RangeError);
  }
);

test("rejects invalid rounding modes even when formatting zero", () => {
  expect(() => toPrecision("0", 2, "unknown" as "half-up")).toThrow(RangeError);
});

test("accepts the maximum supported precision", () => {
  const formatted = toPrecision("1", 1_000_000);

  expect(formatted.length).toBe(1_000_001);
  expect(formatted.startsWith("1.")).toBe(true);
  expect(formatted.endsWith("0")).toBe(true);
});
