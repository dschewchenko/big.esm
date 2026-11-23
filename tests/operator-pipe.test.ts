import { describe, expect, it } from "vitest";
import { Big } from "../src/big.js";
import { abs, add, div, divCompact, mod, mul, pipe, pow, round, roundToStep, sqrt, sub } from "../src/pipe.js";

describe("operator pipe", () => {
  it("applies configured operators left to right", () => {
    expect(pipe("100", mul("0.9"), add("5"), sub(2)).toString()).toBe("93");
  });

  it("supports reusable groups and grouped intermediate results", () => {
    const pricing = [mul("0.9"), add("5")];
    const finalize = [sub(2)];

    expect(pipe("100", ...pricing).toString()).toBe("95");
    expect(pipe("200", ...pricing, ...finalize).toString()).toBe("183");

    const subtotal = pipe("1.2", add("0.3"));
    const quantity = pipe("10", sub(2));
    const total = pipe(subtotal, mul(quantity));
    expect(total.toString()).toBe("12");
    expect(subtotal.toString()).toBe("1.5");
    expect(quantity.toString()).toBe("8");
  });

  it("returns an independent copy when no operations are supplied", () => {
    const input = new Big("1.250");
    const result = pipe(input);

    expect(result).not.toBe(input);
    expect(result.toString(false)).toBe("1.250");
    expect(input.toString(false)).toBe("1.250");
  });

  it("runs any number of operations, including the rest loop", () => {
    expect(pipe(1, add(2), mul(3), sub(1), div(2), pow(2)).toString()).toBe("16");
  });

  it("accepts ordinary decimal inputs and returns a Big copy", () => {
    const input = new Big("1.25");
    const result = pipe(input, add(2));

    expect(result).toBeInstanceOf(Big);
    expect(result).not.toBe(input);
    expect(result.toString()).toBe("3.25");
    expect(input.toString()).toBe("1.25");
  });

  it("allows the same configured operation to be reused", () => {
    const increment = add("0.1");

    expect(pipe(0, increment, increment, increment).toString()).toBe("0.3");
    expect(pipe(10, increment).toString()).toBe("10.1");
  });

  it("reads reusable Big operands without mutating them", () => {
    const operand = new Big("0.25");
    const multiply = mul(operand);

    expect(pipe("4", multiply).toString()).toBe("1");
    expect(pipe("8", multiply).toString()).toBe("2");
    expect(operand.toString()).toBe("0.25");
  });

  it("supports unary, remainder, power, and both division modes", () => {
    expect(pipe(-4, abs(), pow()).toString()).toBe("16");
    expect(pipe(10, mod(3)).toString()).toBe("1");
    expect(pipe(1, div(8)).toString()).toBe("0.125");
    expect(pipe(1, divCompact(8)).toString()).toBe("0.125");
    expect(pipe(1, divCompact(3, 4)).toString()).toBe("0.3333");
  });

  it("forwards rounding options and defaults to the existing operations", () => {
    expect(pipe("1.125", round(2, "half-even")).toString()).toBe("1.12");
    expect(pipe("1.125", round(2)).toString()).toBe("1.13");
    expect(pipe("1.03", roundToStep("0.05")).toString()).toBe("1.05");
    expect(pipe("1.025", roundToStep("0.05", "half-even")).toString()).toBe("1");
    expect(pipe("0.01", sqrt(2, 3)).toString()).toBe("0.1");
    expect(pipe("2", sqrt(undefined, 4)).toString()).toBe("1.4142");
    expect(pipe("2", div(3, 3, "up")).toString()).toBe("0.667");
  });

  it("leaves the supplied Big unchanged when an operator throws", () => {
    const input = new Big("10.50");

    expect(() => pipe(input, div(0))).toThrow("Div0");
    expect(input.toString(false)).toBe("10.50");
  });

  it("propagates validation errors from the configured arithmetic", () => {
    expect(() => pipe(1, pow(-1))).toThrow("Exp");
    expect(() => pipe(1, roundToStep(0))).toThrow("Step");
    expect(() => pipe(-2, sqrt())).toThrow("Root");
  });
});
