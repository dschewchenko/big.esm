import { expect, suite, test } from "vitest";
import { Big } from "../src/big.js";
import { divBig } from "../src/operations/div.js";
import { roundBig } from "../src/operations/round.js";
import { roundToIncrement } from "../src/operations/round-to-increment.js";
import { toFixed } from "../src/utils/to-fixed.js";

suite("directed rounding modes", () => {
  test.each([
    ["1.29", "floor", "1.2"],
    ["1.29", "ceil", "1.3"],
    ["-1.29", "floor", "-1.3"],
    ["-1.29", "ceil", "-1.2"]
  ] as const)("roundBig(%s, 1, %s) is %s", (value, mode, expected) => {
    const actual = roundBig(new Big(value), 1, mode);
    expect(actual.toString()).toBe(expected);
  });

  test.each([
    ["1.29", "floor", "1.2"],
    ["1.29", "ceil", "1.3"],
    ["-1.29", "floor", "-1.3"],
    ["-1.29", "ceil", "-1.2"]
  ] as const)("toFixed(%s, 1, %s) is %s", (value, mode, expected) => {
    expect(toFixed(new Big(value), 1, mode)).toBe(expected);
  });

  test.each([
    ["1", "floor", "0"],
    ["1", "ceil", "1"],
    ["-1", "floor", "-1"],
    ["-1", "ceil", "0"]
  ] as const)("divBig(%s, 3, 0, %s) is %s", (value, mode, expected) => {
    const actual = divBig(new Big(value), new Big(3), 0, mode);
    expect(actual.toString()).toBe(expected);
  });
});

suite("roundToIncrement", () => {
  test.each([
    ["1.025", "half-up", 105n],
    ["1.025", "half-even", 100n],
    ["1.025", "down", 100n],
    ["1.025", "up", 105n],
    ["1.025", "floor", 100n],
    ["1.025", "ceil", 105n],
    ["-1.025", "half-up", -105n],
    ["-1.025", "half-even", -100n],
    ["-1.025", "down", -100n],
    ["-1.025", "up", -105n],
    ["-1.025", "floor", -105n],
    ["-1.025", "ceil", -100n]
  ] as const)("rounds %s to a 0.05 multiple with %s", (value, mode, expectedCoefficient) => {
    const big = new Big(value);
    const step = new Big(5n, 2);

    const result = roundToIncrement(big, step, mode);

    expect(result).toBe(big);
    expect(result.value).toBe(expectedCoefficient);
    expect(result.scale).toBe(step.scale);
  });

  test("keeps the increment's declared scale, including trailing zero places", () => {
    const result = roundToIncrement(new Big("1.027"), new Big(50n, 3));

    expect(result.value).toBe(1050n);
    expect(result.scale).toBe(3);
  });

  test("supports negative-scale increments and an aliased value and step", () => {
    const largeIncrement = roundToIncrement(new Big(349n), new Big(5n, -2));
    expect(largeIncrement.value).toBe(5n);
    expect(largeIncrement.scale).toBe(-2);

    const aliased = new Big(25n, 2);
    expect(roundToIncrement(aliased, aliased)).toBe(aliased);
    expect(aliased.value).toBe(25n);
    expect(aliased.scale).toBe(2);
  });

  test("handles values far below the increment without expanding their scale", () => {
    const tinyPositive = new Big(1n, 10_000_000_000);
    const tinyNegative = new Big(-1n, 10_000_000_000);
    const step = new Big(1n);

    expect(roundToIncrement(new Big(tinyPositive), step).value).toBe(0n);
    expect(roundToIncrement(new Big(tinyPositive), step, "up").value).toBe(1n);
    expect(roundToIncrement(new Big(tinyPositive), step, "ceil").value).toBe(1n);
    expect(roundToIncrement(new Big(tinyPositive), step, "floor").value).toBe(0n);
    expect(roundToIncrement(new Big(tinyNegative), step, "floor").value).toBe(-1n);
    expect(roundToIncrement(new Big(tinyNegative), step, "ceil").value).toBe(0n);
  });

  test("preserves an exact multiple across a large scale gap", () => {
    const value = new Big(1_000_000n, 6);
    const step = new Big(10n ** 30n, 30);

    const result = roundToIncrement(value, step);

    expect(result.value).toBe(step.value);
    expect(result.scale).toBe(step.scale);
  });

  test("rejects an enormous non-tiny alignment before expanding it", () => {
    const value = new Big(1n, -2_000_001);
    const initialValue = value.value;
    const initialScale = value.scale;

    expect(() => roundToIncrement(value, new Big(1n))).toThrow(RangeError);
    expect(value.value).toBe(initialValue);
    expect(value.scale).toBe(initialScale);
  });

  test("rejects zero or negative increments before mutating the value", () => {
    for (const increment of [0n, -5n]) {
      const value = new Big("1.025");
      const initialValue = value.value;
      const initialScale = value.scale;

      expect(() => roundToIncrement(value, new Big(increment, 2))).toThrow(RangeError);
      expect(value.value).toBe(initialValue);
      expect(value.scale).toBe(initialScale);
    }
  });

  test("rejects invalid scales before mutating the value", () => {
    const value = new Big("1.025");
    Object.defineProperty(value, "scale", { value: Number.NaN });
    const initialValue = value.value;

    expect(() => roundToIncrement(value, new Big(5n, 2))).toThrow(RangeError);
    expect(value.value).toBe(initialValue);
    expect(value.scale).toBe(Number.NaN);
  });
});
