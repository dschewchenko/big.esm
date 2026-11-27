import { expect, suite, test } from "vitest";
import { add, Big, createBig, fromString, mulInPlace, powInPlace, sub, subInPlace, toExponential } from "../../src";
import { parseDecimal } from "../../src/utils/parse-decimal.js";

suite("automatic compact scientific input", () => {
  test("keeps ordinary positive exponents expanded", () => {
    expect(createBig("-12.345e6")).toStrictEqual(new Big(-12_345_000n, 0));
    expect(fromString("1e6")).toStrictEqual(new Big(1_000_000n, 0));
    expect(createBig("1.5e3", 2)).toStrictEqual(new Big(1500n, 2));
  });

  test("stores a huge exponent without expanding its coefficient", () => {
    const value = createBig("1e10000000000");
    expect(value).toStrictEqual(new Big(1n, -10_000_000_000));
    expect(toExponential(value)).toBe("1e+10000000000");
    expect(fromString("-12.345e10000000000")).toStrictEqual(new Big(-12345n, -9_999_999_997));
  });

  test("respects the expansion boundary on either side", () => {
    expect(parseDecimal("1e3", false, 3)).toEqual({ value: 1000n, scale: 0 });
    expect(parseDecimal("1e4", false, 3)).toEqual({ value: 1n, scale: -4 });
    expect(parseDecimal("0e4", true, 3)).toEqual({ value: 0n, scale: 0 });
    expect(() => parseDecimal("1e4", true, 3)).toThrow(RangeError);
  });

  test("rejects oversized expansion when an explicit scale requires an integer coefficient", () => {
    expect(() => createBig("1e10000000000", 2)).toThrow(RangeError);
    expect(createBig("0e10000000000", 2)).toStrictEqual(new Big(0n, 2));
  });

  test("rejects oversized fixed output and arithmetic before expanding zeros", () => {
    expect(() => createBig("1e10000000000").toString()).toThrow(/size limit/);
    expect(() => createBig("1e-10000000000").toString()).toThrow(/size limit/);
    expect(() => createBig("1e10000000000").toJSON()).toThrow(/size limit/);
    expect(() => add("1e10000000000", 1)).toThrow(/size limit/);
    expect(toExponential(add("1e10000000000", "2e10000000000"))).toBe("3e+10000000000");
  });

  test("adds and subtracts zero without expanding a compact exponent", () => {
    const value = "1e4000001";
    expect(toExponential(add(value, 0))).toBe("1e+4000001");
    expect(toExponential(add(0, value))).toBe("1e+4000001");
    expect(toExponential(sub(value, 0))).toBe("1e+4000001");
    expect(toExponential(sub(0, value))).toBe("-1e+4000001");
  });

  test("keeps negative exponents and zero exact", () => {
    expect(createBig("-1.25e-3")).toStrictEqual(new Big(-125n, 5));
    expect(createBig("-0e10000000000")).toStrictEqual(new Big(0n));
    expect(createBig("0.000e-10000000000")).toStrictEqual(new Big(0n));
  });

  test.each([Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER])(
    "multiplies a zero after cancellation at scale %s",
    (scale) => {
      const operand = new Big(1n, scale);
      const zero = subInPlace(new Big(operand), operand);
      expect(zero).toEqual(new Big(0n, scale));
      expect(mulInPlace(zero, operand)).toBe(zero);
      expect(zero).toEqual(new Big(0n));

      const receiver = new Big(operand);
      expect(mulInPlace(receiver, new Big(0n, scale))).toBe(receiver);
      expect(receiver).toEqual(new Big(0n));

      expect(() => mulInPlace(operand, operand)).toThrow(/Scale/);
      expect(operand).toEqual(new Big(1n, scale));
    }
  );

  test("preserves the scale of zero products when the result fits", () => {
    expect(mulInPlace(new Big(0n, 3), new Big(2n, 2))).toEqual(new Big(0n, 5));
  });

  test.each([Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER])(
    "raises a zero after cancellation at scale %s",
    (scale) => {
      const operand = new Big(1n, scale);
      const zero = subInPlace(new Big(operand), operand);
      expect(powInPlace(zero, 2)).toBe(zero);
      expect(zero).toEqual(new Big(0n));
      expect(powInPlace(new Big(0n, scale), 0).toString()).toBe("1");

      expect(() => powInPlace(operand, 2)).toThrow(/Scale/);
      expect(operand).toEqual(new Big(1n, scale));
    }
  );

  test("preserves the scale of zero powers when the result fits", () => {
    expect(powInPlace(new Big(0n, 3), 2)).toEqual(new Big(0n, 6));
  });

  test("raises scaled representations of one to large powers without padding", () => {
    const positive = createBig("1.00");
    const negative = createBig("-1.00");
    expect(powInPlace(positive, 4_503_599_627_370_496)).toBe(positive);
    expect(positive).toEqual(new Big(1n));
    expect(powInPlace(negative, 4_503_599_627_370_497)).toBe(negative);
    expect(negative).toEqual(new Big(-1n));
    expect(powInPlace(createBig("-1.00"), 4_000_002)).toEqual(new Big(1n));
  });

  test("accepts safe scale bounds and rejects unsafe or invalid inputs", () => {
    expect(createBig("1e9007199254740991").scale).toBe(-Number.MAX_SAFE_INTEGER);
    expect(createBig("1e-9007199254740991").scale).toBe(Number.MAX_SAFE_INTEGER);
    for (const value of ["", "0x10", "Infinity", "1e9007199254740992", "1e-9007199254740992", Number.NaN, Infinity]) {
      expect(() => createBig(value)).toThrow();
    }
  });
});
