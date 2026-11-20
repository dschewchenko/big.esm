import { Big as BigJS } from "big.js";
import { expect, test } from "vitest";
import {
  addBig,
  Big,
  createBig,
  divBig,
  isNumericValue,
  modBig,
  mulBig,
  pipeBig,
  pow10,
  powBig,
  sqrtBig
} from "../src";

const divisionCases = [
  ["5", "2", "3", "2", "3"],
  ["-5", "2", "-3", "-2", "-3"],
  ["5", "-2", "-3", "-2", "-3"],
  ["-5", "-2", "3", "2", "3"],
  ["4", "-2", "-2", "-2", "-2"],
  ["-1", "3", "0", "0", "-1"],
  ["1", "-3", "0", "0", "-1"]
] as const;

test.each(divisionCases)("divides %s by %s across rounding modes", (a, b, half, down, up) => {
  for (const [mode, result] of [
    ["half-up", half],
    ["down", down],
    ["up", up]
  ] as const) {
    expect(divBig(createBig(a), createBig(b), 0, mode).toString()).toBe(result);
  }
});

test("rounds fractional division and pipeline results with signs", () => {
  expect(divBig(createBig("-1"), createBig("8"), 2).toString()).toBe("-0.13");
  expect(divBig(createBig("1"), createBig("-8"), 2, "up").toString()).toBe("-0.13");
  expect(pipeBig("-1").div(8, 2).toString()).toBe("-0.13");
});

test.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects invalid precision %s", (precision) => {
  expect(() => sqrtBig(createBig(2), 2, precision)).toThrow("Prec");
});

test.each([0, 1, 1.5, NaN, Infinity])(
  "preserves zero handling and rejects invalid root %s for nonzero values",
  (root) => {
    expect(sqrtBig(createBig(0), root).toString()).toBe("0");
    expect(sqrtBig(createBig(1), root).toString()).toBe("1");
    expect(() => sqrtBig(createBig(2), root)).toThrow("Root");
  }
);

test.each([
  ["1", 2, 3, "1"],
  ["1.00", 2, 3, "1"],
  ["0.01", 2, 3, "0.1"],
  ["0.25", 2, 0, "1"],
  ["2.25", 2, 0, "2"],
  ["0.2", 3, 0, "1"],
  ["8", 3, 0, "2"],
  ["64", 3, 0, "4"],
  ["-2", 3, 2, "-1.26"],
  ["-0.125", 3, 0, "-1"],
  ["0.000001", 3, 3, "0.01"]
] as const)("root of %s, degree %i, precision %i", (value, root, precision, expected) => {
  expect(sqrtBig(createBig(value), root, precision).toString()).toBe(expected);
});

test("roots satisfy exact integer rounding bounds", () => {
  for (const value of [1n, 2n, 7n, 8n, 25n, 125n, 999n, 12345n]) {
    for (const scale of [0, 1, 3, 6]) {
      for (const degree of [2, 3, 4, 5, 9]) {
        for (const precision of [0, 1, 2, 4]) {
          const actual = sqrtBig(new Big(value, scale), degree, precision).value;
          const denominator = 10n ** BigInt(scale);
          const scaled = value * 10n ** BigInt(degree * precision) * 2n ** BigInt(degree);
          if (actual > 0n) expect((2n * actual - 1n) ** BigInt(degree) * denominator <= scaled).toBe(true);
          expect((2n * actual + 1n) ** BigInt(degree) * denominator > scaled).toBe(true);
        }
      }
    }
  }
});

test.each([
  ["1.5e3", "15"],
  ["1.5e-3", "0"],
  ["-1.59e1", "-0.15"],
  ["9.99e2", "9.99"]
])("applies exponent before truncation for %s", (input, output) => {
  expect(createBig(input, 2).toString()).toBe(output);
});

test("preserves scale coercion from the published version", () => {
  expect(createBig("123.45", 2.9).toString()).toBe("1.23");
  expect(createBig("123.45", "2.9").toString()).toBe("1.23");
  expect(createBig("123.45", "abc").toString()).toBe("123.45");
  expect(createBig("123.45", "").toString()).toBe("123");
});

test("preserves division argument handling", () => {
  expect(divBig(createBig(5), createBig(2), -1).toString()).toBe("3");
  expect(divBig(createBig(5), createBig(2), 0, "invalid" as never).toString()).toBe("3");
});

test.each([-1, 0.5, NaN, Infinity])("rejects invalid power of ten %s", (exp) => {
  expect(() => pow10(exp)).toThrow("Exp");
});

test.each([
  "",
  " ",
  ".",
  "0x10",
  "+1",
  "Infinity",
  "1e9007199254740992",
  "1.1e-9007199254740991",
  Infinity,
  -Infinity,
  NaN
])("rejects invalid numeric input %s", (value) => {
  expect(() => createBig(value)).toThrow();
});

test.each([".5", "1.", "-1.25e+2", "0", 0, -1.5, 4n])("accepts numeric input %s", (value) => {
  expect(isNumericValue(value)).toBe(true);
  expect(() => createBig(value)).not.toThrow();
});

test("handles a very small radicand without constructing its full scale", () => {
  expect(sqrtBig(new Big(1n, 1000000), 2, 2).toString()).toBe("0");
  expect(sqrtBig(new Big(1n, 1000000), 3, 2).toString()).toBe("0");
});

test.each(["", " ", "0x10", "+1", Infinity, NaN])("preserves numeric-value check for %s", (value) => {
  expect(isNumericValue(value)).toBe(true);
});

test("addition mutates only its first operand and handles an aliased operand", () => {
  const left = createBig("1.2");
  const right = createBig("0.03");
  expect(addBig(left, right)).toBe(left);
  expect(left.toString()).toBe("1.23");
  expect(right.toString()).toBe("0.03");
  expect(addBig(left, left).toString()).toBe("2.46");
});

test("division matches an independent decimal implementation across scales and signs", () => {
  const previousPrecision = BigJS.DP;
  const previousRounding = BigJS.RM;
  try {
    let seed = 239;
    const next = () => (seed = (seed * 16807) % 2147483647);
    for (let i = 0; i < 500; i++) {
      const a = `${next() % 2 ? "-" : ""}${next() % 10000}.${String(next() % 1000).padStart(3, "0")}`;
      const b = `${next() % 2 ? "-" : ""}${(next() % 9999) + 1}.${String(next() % 1000).padStart(3, "0")}`;
      const precision = next() % 7;
      BigJS.DP = precision;
      for (const [mode, referenceMode] of [
        ["down", 0],
        ["half-up", 1],
        ["up", 3]
      ] as const) {
        BigJS.RM = referenceMode;
        const expected = new BigJS(a).div(b).toFixed();
        expect(divBig(createBig(a), createBig(b), precision, mode).toString()).toBe(expected);
      }
    }
  } finally {
    BigJS.DP = previousPrecision;
    BigJS.RM = previousRounding;
  }
});

test("handles a large root of unity without constructing a huge intermediate", () => {
  expect(sqrtBig(createBig(1), 1000001, 20).toString()).toBe("1");
  expect(sqrtBig(createBig(-1), 1000001, 20).toString()).toBe("-1");
});

test("rejects scale overflow before mutating operands", () => {
  const multiply = createBig(1n, Number.MAX_SAFE_INTEGER);
  expect(() => mulBig(multiply, createBig(1n, 2))).toThrow("Scale");
  expect(multiply.value).toBe(1n);
  expect(multiply.scale).toBe(Number.MAX_SAFE_INTEGER);
  const power = createBig(1n, Number.MAX_SAFE_INTEGER);
  expect(() => powBig(power, 2)).toThrow("Scale");
  expect(power.value).toBe(1n);
  expect(power.scale).toBe(Number.MAX_SAFE_INTEGER);
});

test("computes remainders with signs, differing scales, and aliased operands", () => {
  for (let a = -12; a <= 12; a++) {
    for (let b = -9; b <= 9; b++) {
      if (b === 0) continue;
      for (let scaleA = 0; scaleA <= 3; scaleA++) {
        for (let scaleB = 0; scaleB <= 3; scaleB++) {
          const result = createBig(BigInt(a), scaleA);
          const divisor = createBig(BigInt(b), scaleB);
          const scale = Math.max(scaleA, scaleB);
          const expected = (BigInt(a) * 10n ** BigInt(scale - scaleA)) % (BigInt(b) * 10n ** BigInt(scale - scaleB));
          expect(modBig(result, divisor)).toBe(result);
          expect(result.value).toBe(expected);
          expect(result.scale).toBe(scale);
          expect(divisor.value).toBe(BigInt(b));
          expect(divisor.scale).toBe(scaleB);
        }
      }
    }
  }
  const same = createBig("-1.23");
  expect(modBig(same, same).toString()).toBe("0");
  expect(() => modBig(createBig(2), createBig(0))).toThrow("Div0");
});

test("parses very small scientific notation without allocating padding", () => {
  const value = createBig("1e-1000000");
  expect(value.value).toBe(1n);
  expect(value.scale).toBe(1000000);
  expect(createBig("123.45e-1000000", 2).toString()).toBe("0");
  expect(createBig("1.230e-4").toString(false)).toBe("0.0001230");
});

test("rounds high-degree roots using bounded integer search", () => {
  expect(sqrtBig(createBig(2), 10000, 20).toString()).toBe("1.00006931712037656919");
  expect(sqrtBig(createBig("-2"), 10001, 8).toString()).toBe("-1.00006931");
});

test("computes powers of ten across the fixed basis and direct exponentiation", () => {
  for (let exp = 0; exp <= 300; exp++) expect(pow10(exp)).toBe(10n ** BigInt(exp));
});

test("high-degree roots satisfy exact rounding bounds", () => {
  for (const degree of [255, 256, 257, 1000]) {
    for (const precision of [0, 1, 2]) {
      const actual = sqrtBig(createBig(2), degree, precision).value;
      const scaled = 2n * 10n ** BigInt(degree * precision) * 2n ** BigInt(degree);
      if (actual > 0n) expect((2n * actual - 1n) ** BigInt(degree) <= scaled).toBe(true);
      expect((2n * actual + 1n) ** BigInt(degree) > scaled).toBe(true);
    }
  }
});

test("rounds large signed quotients and remainders", () => {
  const cases = [
    ["987654321098765432109876543210.98765", "-123456789012345678901.2345"],
    ["-123456789012345678901234567890", "98765432109876543210"],
    ["-999999999999999999999999999999", "-999999999999999999999999999"]
  ];
  const oldPrecision = BigJS.DP;
  const oldRounding = BigJS.RM;
  try {
    BigJS.DP = 17;
    for (const [a, b] of cases) {
      for (const [mode, referenceMode] of [
        ["down", 0],
        ["half-up", 1],
        ["up", 3]
      ] as const) {
        BigJS.RM = referenceMode;
        expect(divBig(createBig(a), createBig(b), 17, mode).toString()).toBe(new BigJS(a).div(b).toFixed());
      }
    }
  } finally {
    BigJS.DP = oldPrecision;
    BigJS.RM = oldRounding;
  }
});

test("square root estimates retain exact rounding near large boundaries", () => {
  for (const root of [2n, 10n ** 8n, 2n ** 53n, 2n ** 100n, 10n ** 153n, 10n ** 154n, 10n ** 155n]) {
    for (const [radicand, expected] of [
      [root * root - root, root - 1n],
      [root * root - root + 1n, root],
      [root * root, root],
      [root * root + root, root],
      [root * root + root + 1n, root + 1n]
    ] as const) {
      expect(sqrtBig(createBig(radicand), 2, 0).value).toBe(expected);
    }
  }
});
