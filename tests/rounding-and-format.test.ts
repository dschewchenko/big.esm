import { Big as BigJS } from "big.js";
import { expect, test } from "vitest";
import { createBig, divBig, isDecimalInput, isNumericValue, pipeBig, roundBig, toExponential, toFixed } from "../src";

test.each([
  ["1.005", 2, "half-even", "1.00"],
  ["1.015", 2, "half-even", "1.02"],
  ["-1.015", 2, "half-even", "-1.02"],
  ["-0.005", 2, "half-even", "-0.00"],
  ["-0.005", 2, "half-up", "-0.01"],
  ["-1.999", 2, "down", "-1.99"],
  ["9.999", 2, "up", "10.00"],
  ["2.5", 0, "half-even", "2"],
  ["3.5", 0, "half-even", "4"],
  ["1.2", 3, "half-up", "1.200"],
  ["0.0009", 3, "down", "0.000"],
  ["0", 2, "down", "0.00"]
] as const)("formats %s to %i places with %s as %s without mutation", (input, places, mode, fixed) => {
  const big = createBig(input);
  const snapshot = { value: big.value, scale: big.scale };
  expect(toFixed(big, places, mode)).toBe(fixed);
  expect(big).toMatchObject(snapshot);
  expect(roundBig(big, places, mode)).toBe(big);
  expect(big.toString()).toBe(createBig(fixed).toString());
});

test("rounds within the pipeline without replacing or padding its operand", () => {
  const big = createBig("1.2345");
  const pipe = pipeBig(big);
  expect(pipe.round(3, "half-even")).toBe(pipe);
  expect(pipe.value()).toBe(big);
  expect(big.toString()).toBe("1.234");
  expect(pipe.round(100).current.scale).toBe(3);
  expect(pipe.round().toString()).toBe("1");
});

test.each([-1, 0.1, NaN, Infinity, 2 ** 53])("rejects invalid decimal places %s without mutation", (places) => {
  const big = createBig("0.21");
  expect(() => roundBig(big, places)).toThrow(RangeError);
  expect(() => toFixed(big, places)).toThrow(RangeError);
  expect(big.toString()).toBe("0.21");
});

test("rounds extreme scales without expanding the exponent", () => {
  const tiny = createBig(-1n, Number.MAX_SAFE_INTEGER);
  expect(toFixed(tiny, 2, "up")).toBe("-0.01");
  expect(toFixed(tiny, 2, "half-even")).toBe("-0.00");
  expect(roundBig(tiny, 2, "half-up").value).toBe(0n);
  expect(tiny.scale).toBe(2);

  // Both ties and values immediately on either side of the tie use the large-scale path.
  const midpoint = 5n * 10n ** 299n;
  expect(roundBig(createBig(midpoint, 300), 0, "half-even").value).toBe(0n);
  expect(roundBig(createBig(midpoint, 300), 0, "half-up").value).toBe(1n);
  expect(roundBig(createBig(-midpoint - 1n, 300), 0, "half-even").value).toBe(-1n);
  expect(roundBig(createBig(midpoint - 1n, 300), 0, "half-up").value).toBe(0n);
});

test.each([
  ["5", "2", 0, "2"],
  ["7", "-2", 0, "-4"],
  ["-5", "2", 0, "-2"],
  ["-7", "-2", 0, "4"],
  ["-1", "8", 2, "-0.12"],
  ["1", "40", 2, "0.02"],
  ["1", "399", 3, "0.003"],
  ["5e-400", "1e-399", 0, "0"],
  ["5e-400", "1", 399, "0"],
  ["-5e-400", "-1", 0, "0"]
] as const)("divides %s by %s at %i places with half-even", (a, b, places, expected) => {
  expect(divBig(createBig(a), createBig(b), places, "half-even").toString()).toBe(expected);
});

test("rounds division midpoints on the implicit-scale path", () => {
  const midpoint = 5n * 10n ** 299n;
  expect(divBig(createBig(midpoint, 300), createBig(1n), 0, "half-even").value).toBe(0n);
  expect(divBig(createBig(midpoint, 300), createBig(-1n), 0, "half-up").value).toBe(-1n);
  expect(divBig(createBig(midpoint + 1n, 300), createBig(-1n), 0, "half-even").value).toBe(-1n);
});

test("agrees with big.js formatting across signed coefficients, scales and rounding rules", () => {
  for (const coefficient of [-10000n, -9355n, -10n, -5n, -1n, 0n, 1n, 5n, 1250n, 9355n, 10n ** 90n + 4565n]) {
    for (const scale of [-3, 0, 1, 2, 3, 6, 94]) {
      const big = createBig(coefficient, scale);
      const reference = new BigJS(`${coefficient}e${-scale}`);
      for (const places of [0, 2, 4, 8]) {
        for (const [mode, bigJsMode] of [
          ["down", BigJS.roundDown],
          ["half-up", BigJS.roundHalfUp],
          ["half-even", BigJS.roundHalfEven],
          ["up", BigJS.roundUp]
        ] as const) {
          expect(toFixed(big, places, mode)).toBe(reference.toFixed(places, bigJsMode));
        }
      }
      expect(toExponential(big)).toBe(reference.toExponential());
    }
  }
});

test("formats large positive and negative exponents exactly", () => {
  expect(toExponential(createBig("1e-10000000000"))).toBe("1e-10000000000");
  expect(toExponential(createBig(-1200n, -Number.MAX_SAFE_INTEGER))).toBe("-1.2e+9007199254740994");
  expect(toExponential(createBig(123n, Number.MAX_SAFE_INTEGER))).toBe("1.23e-9007199254740989");
  expect(toExponential(createBig(0n, -Number.MAX_SAFE_INTEGER))).toBe("0e+0");
});

test("recognizes decimal inputs with the parser's syntax and range checks", () => {
  for (const input of [".42", "-3.", "1.25e+3", "1e-10000000000", "1e+10000000000", 1n, Number.MIN_VALUE]) {
    expect(isDecimalInput(input)).toBe(true);
  }
  for (const input of [
    NaN,
    Infinity,
    "",
    ".",
    "0x10",
    "+1",
    " 1 ",
    "1e9007199254740992",
    "0.1e-9007199254740991",
    {}
  ]) {
    expect(isDecimalInput(input)).toBe(false);
  }
  expect(isNumericValue("0x10")).toBe(true);
  expect(isNumericValue(NaN)).toBe(true);
});
