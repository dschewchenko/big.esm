import { expect, suite, test } from "vitest";
import { Big } from "../../src/big.js";
import { add, addBig, addInPlace } from "../../src/operations/add.js";
import { div, divBig, divInPlace } from "../../src/operations/div.js";
import { divCompact, divCompactBig, divCompactInPlace } from "../../src/operations/div-compact.js";
import { mod, modBig, modInPlace } from "../../src/operations/mod.js";
import { mul, mulBig, mulInPlace } from "../../src/operations/mul.js";
import { roundToIncrement } from "../../src/operations/round-to-increment.js";
import { sub, subBig, subInPlace } from "../../src/operations/sub.js";
import { createCompactBig } from "../../src/utils/from-string.js";

suite("BigValue operands", () => {
  test("mutates the first Big for primitive right-hand operands", () => {
    const addend = new Big("1.20");
    expect(addInPlace(addend, "2.30")).toBe(addend);
    expect(addend.toString(false)).toBe("3.50");

    const minuend = new Big("5.5");
    expect(subInPlace(minuend, 2)).toBe(minuend);
    expect(minuend.toString()).toBe("3.5");

    const factor = new Big("1.20");
    expect(mulInPlace(factor, 3n)).toBe(factor);
    expect(factor.toString(false)).toBe("3.60");
  });

  test("uses the same positive exponent expansion and scale as createBig", () => {
    const compactValue = createCompactBig("1e+10");
    const result = addInPlace(compactValue, "1e+5");

    expect(result.value).toBe(10_000_100_000n);
    expect(result.scale).toBe(0);
    expect(result.toString()).toBe("10000100000");
  });

  test("supports raw divisors in rounded and compact division", () => {
    const quotient = new Big("1");
    expect(divInPlace(quotient, "8", 5)).toBe(quotient);
    expect(quotient.toString()).toBe("0.125");

    const compactQuotient = new Big("1");
    expect(divCompactInPlace(compactQuotient, 8n)).toBe(compactQuotient);
    expect(compactQuotient.toString()).toBe("0.125");
  });

  test("supports raw divisors in modulo with negative dividends", () => {
    const dividend = new Big("-10.5");
    expect(modInPlace(dividend, 4n)).toBe(dividend);
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

    expect(addInPlace(left, right)).toBe(left);
    expect(left.toString()).toBe("3.5");
    expect(right).toEqual({ value: 25n, scale: 1 });
  });

  test("preserves aliasing when the right operand is the mutated Big", () => {
    const value = new Big("1.25");

    expect(addInPlace(value, value)).toBe(value);
    expect(value.toString()).toBe("2.5");
  });

  test("rejects malformed operands before mutating the left value", () => {
    const value = new Big("1.25");
    const original = { value: value.value, scale: value.scale };
    const invalidShape = { value: "2", scale: 0 };
    const invalidScale = { value: 2n, scale: 1.5 };

    expect(() => addInPlace(value, "not-a-number")).toThrow();
    expect(() => Reflect.apply(addInPlace, undefined, [value, invalidShape])).toThrow(TypeError);
    expect(() => addInPlace(value, invalidScale)).toThrow(RangeError);
    expect(value).toMatchObject(original);
  });

  test("rejects zero divisors and nonpositive increments from raw operands", () => {
    const dividend = new Big("1");
    expect(() => divInPlace(dividend, "0")).toThrow("Div0");
    expect(() => modInPlace(dividend, 0n)).toThrow("Div0");
    expect(() => roundToIncrement(dividend, "-0.05")).toThrow("Step");
    expect(dividend.toString()).toBe("1");
  });

  test("returns new results without mutating frozen or shared inputs", () => {
    const frozenLeft = Object.freeze(new Big("1.20"));
    const frozenRight = Object.freeze({ value: 25n, scale: 1 });
    const shared = new Big("4");

    expect(add(frozenLeft, frozenRight).toString()).toBe("3.7");
    expect(sub("5.5", 2).toString()).toBe("3.5");
    expect(mul("1.20", 3n).toString()).toBe("3.6");
    expect(div(1, "8", 5).toString()).toBe("0.125");
    expect(divCompact(1, 8n).toString()).toBe("0.125");
    expect(mod("10.5", 4n).toString()).toBe("2.5");
    expect(add(shared, 1).toString()).toBe("5");
    expect(shared.toString()).toBe("4");
    expect(frozenLeft.toString(false)).toBe("1.20");
    expect(frozenRight).toEqual({ value: 25n, scale: 1 });
  });

  test("preserves the coefficient and scale of short decimal string results", () => {
    expect(add("1.20", "-.25")).toMatchObject({ value: 95n, scale: 2 });
    expect(sub("-.25", "1.20")).toMatchObject({ value: -145n, scale: 2 });
    expect(mul("1.20", "-.25")).toMatchObject({ value: -3000n, scale: 4 });
    expect(add("-0.00", ".200")).toMatchObject({ value: 200n, scale: 3 });
    expect(sub("1.20", "1.20")).toMatchObject({ value: 0n, scale: 2 });
  });

  test("keeps wide alignment, cancellation, and multiplication exact", () => {
    expect(add("999999999999999", "0.0001")).toMatchObject({ value: 9999999999999990001n, scale: 4 });
    expect(sub("9007199254741", ".009")).toMatchObject({ value: 9007199254740991n, scale: 3 });
    expect(mul("999999999999999", "99999.99")).toMatchObject({
      value: 999999999999999n * 9999999n,
      scale: 2
    });

    expect(add("1.2e3", "-.1")).toMatchObject({ value: 11999n, scale: 1 });
    expect(() => add("1.2.3", "4")).toThrow("Num");
    expect(() => mul("42", "1e9007199254740992")).toThrow("Exp");
  });

  test("legacy addition keeps the v2 mutation behavior with an extra JavaScript argument", () => {
    const left = new Big("1.2");
    const right = Object.freeze(new Big("0.05"));

    expect(Reflect.apply(addBig, undefined, [left, right, false])).toBe(left);
    expect(left).toMatchObject({ value: 125n, scale: 2 });
    expect(right).toMatchObject({ value: 5n, scale: 2 });
  });

  test("keeps the legacy names as direct mutable aliases", () => {
    expect(addBig).toBe(addInPlace);
    expect(subBig).toBe(subInPlace);
    expect(mulBig).toBe(mulInPlace);
    expect(divBig).toBe(divInPlace);
    expect(divCompactBig).toBe(divCompactInPlace);
    expect(modBig).toBe(modInPlace);
  });
});
