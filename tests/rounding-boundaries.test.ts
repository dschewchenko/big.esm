import { expect, test } from "vitest";
import { divInPlace } from "../src/operations/div.js";
import { divCompactInPlace } from "../src/operations/div-compact.js";
import { roundInPlace } from "../src/operations/round.js";
import { roundToStepInPlace } from "../src/operations/round-to-increment.js";
import type { RoundingMode } from "../src/types.js";
import { createBig } from "../src/utils/create.js";
import { toFixed } from "../src/utils/to-fixed.js";
import { toPrecision } from "../src/utils/to-precision.js";

test.each(["half-upx", "", "unknown", null, 1])("rejects invalid rounding mode %s on no-op and exact paths", (mode) => {
  const invalidMode = mode as RoundingMode;
  const noOpRound = createBig("1.2");
  const zeroDiv = createBig(0);
  const exactDiv = createBig(6);
  const zeroCompactDiv = createBig(0);
  const exactCompactDiv = createBig(1);
  const noOpStep = createBig(0);
  const snapshots = [noOpRound, zeroDiv, exactDiv, zeroCompactDiv, exactCompactDiv, noOpStep].map(
    ({ value, scale }) => ({ value, scale })
  );

  expect(() => toFixed(createBig("1.20"), 2, invalidMode)).toThrow(RangeError);
  expect(() => toPrecision(0, 1, invalidMode)).toThrow(RangeError);
  expect(() => roundInPlace(noOpRound, 3, invalidMode)).toThrow(RangeError);
  expect(() => divInPlace(zeroDiv, 2, 4, invalidMode)).toThrow(RangeError);
  expect(() => divInPlace(exactDiv, 3, 4, invalidMode)).toThrow(RangeError);
  expect(() => divCompactInPlace(zeroCompactDiv, 2, 4, invalidMode)).toThrow(RangeError);
  expect(() => divCompactInPlace(exactCompactDiv, 8, 4, invalidMode)).toThrow(RangeError);
  expect(() => roundToStepInPlace(noOpStep, "0.25", invalidMode)).toThrow(RangeError);

  expect([noOpRound, zeroDiv, exactDiv, zeroCompactDiv, exactCompactDiv, noOpStep]).toEqual(snapshots);
});

test.each([-1, -0.5, NaN, Infinity, -Infinity, 0.5, 2 ** 53, 1_000_001, "2", null])(
  "rejects invalid division precision %s without mutating the dividend",
  (precision) => {
    const dividend = createBig("7.25");
    const snapshot = { value: dividend.value, scale: dividend.scale };

    expect(() => divInPlace(dividend, 2, precision as number)).toThrow(RangeError);
    expect(() => divInPlace(createBig("7.25"), 2, precision as number)).toThrow(RangeError);
    expect(dividend).toMatchObject(snapshot);
  }
);

test("division precision zero remains valid and rounds without clamping", () => {
  const dividend = createBig("7.25");

  expect(divInPlace(dividend, 2, 0).toString()).toBe("4");
  expect(divInPlace(createBig("7.25"), 2, 1).toString()).toBe("3.6");
});

test("rejects invalid modes before mutating nonzero in-place operations", () => {
  const invalidMode = "half-even-ish" as RoundingMode;
  const dividend = createBig("7.25");
  const compactDividend = createBig("1");
  const roundedValue = createBig("1.234");
  const stepValue = createBig("1.03");
  const snapshots = [dividend, compactDividend, roundedValue, stepValue].map(({ value, scale }) => ({ value, scale }));

  expect(() => divInPlace(dividend, 2, 2, invalidMode)).toThrow(RangeError);
  expect(() => divCompactInPlace(compactDividend, 3, 4, invalidMode)).toThrow(RangeError);
  expect(() => roundInPlace(roundedValue, 2, invalidMode)).toThrow(RangeError);
  expect(() => roundToStepInPlace(stepValue, "0.05", invalidMode)).toThrow(RangeError);

  expect([dividend, compactDividend, roundedValue, stepValue]).toEqual(snapshots);
});
