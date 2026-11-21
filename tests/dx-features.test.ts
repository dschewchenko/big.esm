import { expect, test } from "vitest";
import { compare, createBig, createCompactBig, pipe, pipeBig, pipeInPlace, sumBig, toExponential } from "../src";

test("rounds and formats a pipeline without constructing operands", () => {
  expect(pipe("1.03").roundToStep("0.05").toFixed(2)).toBe("1.05");

  const original = Object.freeze(createBig("1.03"));
  const chain = pipe(original);
  expect(chain.roundToStep("0.05")).toBe(chain);
  expect(chain.value()).not.toBe(original);
  expect(chain.toPrecision(2, "half-even")).toBe("1.0");
  expect(chain.toNumber()).toBe(1.05);
  expect(original.toString()).toBe("1.03");
});

test("a pipeline mutates an existing Big when selected explicitly", () => {
  const value = createBig("1.03");
  const chain = pipeInPlace(value).roundToStep("0.05");
  expect(chain.value()).toBe(value);
  expect(value.toString()).toBe("1.05");
  expect(() => pipeInPlace("1.03" as never)).toThrow(TypeError);
});

test("the existing pipeBig entry still reuses a Big", () => {
  const value = createBig(1);
  expect(pipeBig(value).add("0.05").value()).toBe(value);
  expect(value.toString()).toBe("1.05");
});

test("compares values of different input types without wrapping them", () => {
  expect(compare("1.2300", { value: 123n, scale: 2 })).toBe(0);
  expect(compare("-1.01", -1n)).toBe(-1);
  expect(compare(1.01, "1")).toBe(1);
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
