import { expect, test } from "vitest";
import { createBig, createCompactBig, pipeBig, sumBig, toExponential } from "../src";

test("rounds and formats a pipeline without constructing operands", () => {
  expect(pipeBig("1.03").roundToIncrement("0.05").toFixed(2)).toBe("1.05");

  const original = createBig("1.03");
  const pipe = pipeBig(original);
  expect(pipe.roundToIncrement("0.05")).toBe(pipe);
  expect(pipe.value()).toBe(original);
  expect(pipe.toPrecision(2, "half-even")).toBe("1.0");
  expect(pipe.toNumber()).toBe(1.05);
  expect(original.toString()).toBe("1.05");
});

test("sums an iterable of mixed inputs without mutating its items", () => {
  const original = createBig("0.5");
  const values = new Set([original, "0.3", 2n, { value: -6n, scale: 1 }]);
  const result = sumBig(values);
  expect(result.toString()).toBe("2.2");
  expect(original.toString()).toBe("0.5");
  expect(sumBig([]).toString()).toBe("0");
  expect(sumBig([original])).not.toBe(original);
});

test("sums compact values without expanding zero operands", () => {
  const huge = createCompactBig("3e10000000000");
  const sameMagnitude = createCompactBig("4e10000000000");
  const sum = sumBig([0n, huge, "0.00", sameMagnitude]);
  expect(toExponential(sum)).toBe("7e+10000000000");
  expect(toExponential(huge)).toBe("3e+10000000000");
});

test("validates a zero operand's scale before skipping it", () => {
  expect(() => sumBig([{ value: 0n, scale: 0.5 }])).toThrow("Scale");
});
