import { expect, suite, test } from "vitest";
import {
  addBig,
  Big,
  createCompactBig,
  divBig,
  divCompactBig,
  modBig,
  mulBig,
  roundToIncrement,
  subBig
} from "../../src";

suite("BigValue right-hand operands", () => {
  test("adds, subtracts, and multiplies primitive operands in place", () => {
    const addend = new Big("1.20");
    expect(addBig(addend, "2.30")).toBe(addend);
    expect(addend.toString(false)).toBe("3.50");

    const minuend = new Big("5.5");
    expect(subBig(minuend, 2)).toBe(minuend);
    expect(minuend.toString()).toBe("3.5");

    const factor = new Big("1.20");
    expect(mulBig(factor, 3n)).toBe(factor);
    expect(factor.toString(false)).toBe("3.60");
  });

  test("uses the same positive exponent expansion and scale as createBig", () => {
    const compactValue = createCompactBig("1e+10");
    const result = addBig(compactValue, "1e+5");

    expect(result.value).toBe(10_000_100_000n);
    expect(result.scale).toBe(0);
    expect(result.toString()).toBe("10000100000");
  });

  test("supports raw divisors in rounded and compact division", () => {
    const quotient = new Big("1");
    expect(divBig(quotient, "8", 5)).toBe(quotient);
    expect(quotient.toString()).toBe("0.125");

    const compactQuotient = new Big("1");
    expect(divCompactBig(compactQuotient, 8n)).toBe(compactQuotient);
    expect(compactQuotient.toString()).toBe("0.125");
  });

  test("supports raw divisors in modulo with negative dividends", () => {
    const dividend = new Big("-10.5");
    expect(modBig(dividend, 4n)).toBe(dividend);
    expect(dividend.toString()).toBe("-2.5");
  });

  test("rounds against a raw positive increment for either sign", () => {
    const negative = new Big("-1.03");
    expect(roundToIncrement(negative, 0.05)).toBe(negative);
    expect(negative.toString()).toBe("-1.05");

    const tie = new Big("1.025");
    expect(roundToIncrement(tie, "0.05", "half-even")).toBe(tie);
    expect(tie.toString()).toBe("1");
  });

  test("accepts BigObject operands without mutating the operand", () => {
    const right = { value: 25n, scale: 1 };
    const left = new Big("1");

    expect(addBig(left, right)).toBe(left);
    expect(left.toString()).toBe("3.5");
    expect(right).toEqual({ value: 25n, scale: 1 });
  });

  test("preserves aliasing when the right operand is the mutated Big", () => {
    const value = new Big("1.25");

    expect(addBig(value, value)).toBe(value);
    expect(value.toString()).toBe("2.5");
  });

  test("rejects malformed operands before mutating the left value", () => {
    const value = new Big("1.25");
    const original = { value: value.value, scale: value.scale };
    const invalidShape = { value: "2", scale: 0 };
    const invalidScale = { value: 2n, scale: 1.5 };

    expect(() => addBig(value, "not-a-number")).toThrow();
    expect(() => Reflect.apply(addBig, undefined, [value, invalidShape])).toThrow(TypeError);
    expect(() => addBig(value, invalidScale)).toThrow(RangeError);
    expect(value).toMatchObject(original);
  });

  test("rejects zero divisors and nonpositive increments from raw operands", () => {
    const dividend = new Big("1");
    expect(() => divBig(dividend, "0")).toThrow("Div0");
    expect(() => modBig(dividend, 0n)).toThrow("Div0");
    expect(() => roundToIncrement(dividend, "-0.05")).toThrow("Step");
    expect(dividend.toString()).toBe("1");
  });
});
