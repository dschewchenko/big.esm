import { expect, test } from "vitest";
import { createBig, sqrtBig } from "../src";

test.each([
  ["2", 10_000_000_000, 2, "1"],
  ["0.0001", 10_000_000_000, 2, "1"],
  ["1e-10000", 10_000_000_000, 2, "1"],
  ["1e-1000000", 10_000_000_000, 2, "1"],
  ["-2", 10_000_000_001, 2, "-1"]
])("rounds a high degree root of %s, degree %i, precision %i to %s", (value, degree, precision, expected) => {
  expect(sqrtBig(createBig(value), degree, precision).toString()).toBe(expected);
});

test.each([
  [1n, 10_000_000_000, "0.1"],
  [10n, 10_000_000_000, "0.1"],
  [-1n, 10_000_000_001, "-0.1"]
])("calculates exact decimal power roots for coefficient %s", (coefficient, degree, expected) => {
  const scale = coefficient === 10n || coefficient === -1n ? 10_000_000_001 : 10_000_000_000;
  expect(sqrtBig(createBig(coefficient, scale), degree, 2).toString()).toBe(expected);
});

test("normalizes large and small radicands before rounding high-degree roots", () => {
  expect(sqrtBig(createBig(2n, 10_000_000_000), 10_000_000_000, 2).toString()).toBe("0.1");
  expect(sqrtBig(createBig(2n, -10_000_000_000), 10_000_000_000, 2).toString()).toBe("10");
  expect(sqrtBig(createBig("1e-1000000"), 10_000_000_000, 2).toString()).toBe("1");
});

test("rounds roots away from unity at high degree and default precision", () => {
  expect(sqrtBig(createBig(2), 10_000_000_000).toString()).toBe("1.00000000006931471806");
  expect(sqrtBig(createBig(2n, 1_000_000_000), 10_000_000_000).toString()).toBe("0.7943282347793401397");
  expect(sqrtBig(createBig(2n, -10_000_000_000), 10_000_000_000).toString()).toBe("10.00000000069314718058");
});

test("rounds a high degree root to 200 decimal places", () => {
  expect(sqrtBig(createBig(2), 10_000_000_000, 200).toString()).toBe(
    "1.00000000006931471805839679601136972337781895283204725673972125641703617653200980454600356461528940952383523908018741881920023508245840433327532800910924311605840140873763923799261574691472661959740859"
  );
});

test("falls back to exact rounding when power bounds overlap at a midpoint", () => {
  const degree = 4097;
  const midpoint = 15n ** BigInt(degree); // (1.5)^degree at this decimal scale
  expect(sqrtBig(createBig(midpoint - 1n, degree), degree, 0).value).toBe(1n);
  expect(sqrtBig(createBig(midpoint, degree), degree, 0).value).toBe(2n);
  expect(sqrtBig(createBig(-midpoint, degree), degree, 0).value).toBe(-2n);
});

test("rounds at enormous precision when the output coefficient is small", () => {
  const precision = 2 ** 52;
  const result = sqrtBig(createBig(1n, Number.MAX_SAFE_INTEGER), 2, precision);
  expect(result.value).toBe(3n);
  expect(result.scale).toBe(precision);
});

test("retains zero and unit shortcuts for unsupported root degrees", () => {
  expect(sqrtBig(createBig(0), 1).toString()).toBe("0");
  expect(sqrtBig(createBig(1), 1).toString()).toBe("1");
  expect(() => sqrtBig(createBig(-1), 2)).toThrow("Root");
  expect(() => sqrtBig(createBig(2), 1)).toThrow("Root");
});
