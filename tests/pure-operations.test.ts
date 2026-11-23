import { expect, test } from "vitest";
import { Big } from "../src/big.js";
import { abs, absBig, absInPlace } from "../src/operations/abs.js";
import { pow, powBig, powInPlace } from "../src/operations/pow.js";
import { round, roundBig, roundInPlace } from "../src/operations/round.js";
import { roundToIncrement, roundToStep, roundToStepInPlace } from "../src/operations/round-to-increment.js";
import { sqrt, sqrtBig, sqrtInPlace } from "../src/operations/sqrt.js";

test("pure unary operations copy the input and preserve its value", () => {
  const negative = new Big("-12.5");
  const powerBase = new Big("1.25");
  const radicand = new Big("-2");
  const roundedValue = new Big("1.125");

  const absolute = abs(negative);
  const squared = pow(powerBase, 2);
  const root = sqrt(radicand, 3, 2);
  const rounded = round(roundedValue, 2, "half-even");

  expect(absolute).not.toBe(negative);
  expect(squared).not.toBe(powerBase);
  expect(root).not.toBe(radicand);
  expect(rounded).not.toBe(roundedValue);
  expect(absolute.toString()).toBe("12.5");
  expect(squared.toString()).toBe("1.5625");
  expect(root.toString()).toBe("-1.26");
  expect(rounded.toString()).toBe("1.12");
  expect(negative.toString()).toBe("-12.5");
  expect(powerBase.toString()).toBe("1.25");
  expect(radicand.toString()).toBe("-2");
  expect(roundedValue.toString()).toBe("1.125");
});

test("pure operations accept primitive and structural BigValue inputs", () => {
  expect(abs("-3.5").toString()).toBe("3.5");
  expect(pow(12n, 2).toString()).toBe("144");
  expect(sqrt({ value: 16n, scale: 0 }).toString()).toBe("4");
  expect(round("1.256", 2).toString()).toBe("1.26");
});

test("roundToStep accepts BigValue for both arguments and leaves them unchanged", () => {
  const value = new Big("1.025");
  const step = new Big("0.05");
  const result = roundToStep(value, step, "half-even");

  expect(result).not.toBe(value);
  expect(result.toString()).toBe("1");
  expect(value.toString()).toBe("1.025");
  expect(step.toString()).toBe("0.05");
  expect(roundToStep("1.03", "0.05").toString()).toBe("1.05");
  expect(roundToStep("1.025", "0.05", "up").toString()).toBe("1.05");
});

test("legacy names are direct deprecated aliases to the mutating kernels", () => {
  expect(absBig).toBe(absInPlace);
  expect(powBig).toBe(powInPlace);
  expect(sqrtBig).toBe(sqrtInPlace);
  expect(roundBig).toBe(roundInPlace);
  expect(roundToIncrement).toBe(roundToStepInPlace);

  const value = new Big("-1.29");
  expect(absInPlace(value)).toBe(value);
  expect(value.toString()).toBe("1.29");
  expect(roundToStepInPlace(value, new Big("0.1"))).toBe(value);
  expect(value.toString()).toBe("1.3");
});
