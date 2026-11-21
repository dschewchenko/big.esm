import { expect, suite, test } from "vitest";
import { addBig, Big, createBig } from "../src";
import {
  bigints,
  numbers,
  numbersNegative,
  stringsDifferentScale,
  stringsDifferentScaleNegative,
  stringsDifferentScaleNegativeExponent,
  zero
} from "./test-data";

suite("Big", () => {
  test("construction from zero", () => {
    const big = new Big(zero[0]);
    expect(big.valueOf()).toBe(BigInt(0));
    expect(big.scale).toBe(0);
  });

  test("construction from number", () => {
    const big = new Big(numbers[0]);
    expect(big.valueOf()).toBe(BigInt(12345));
    expect(big.scale).toBe(2);
  });

  test("construction from negative number", () => {
    const big = new Big(numbersNegative[0]);
    expect(big.valueOf()).toBe(BigInt(-12345));
    expect(big.scale).toBe(2);
  });

  test("construction from bigint", () => {
    const big = new Big(bigints[0]);
    expect(big.valueOf()).toBe(BigInt("12345678901234567890"));
    expect(big.scale).toBe(0);
  });

  test("construction from string", () => {
    const big = new Big(stringsDifferentScale[0]);
    expect(big.valueOf()).toBe(BigInt("1234567890123456789012345"));
    expect(big.scale).toBe(5);
  });

  test("construction from negative string", () => {
    const big = new Big(stringsDifferentScaleNegative[0]);
    expect(big.valueOf()).toBe(BigInt("-1234567890123456789012345"));
    expect(big.scale).toBe(5);
  });

  test("construction from string with exponent", () => {
    const big = new Big(stringsDifferentScaleNegativeExponent[0]);
    expect(big.valueOf()).toBe(BigInt("-1234567890123456789012345"));
    expect(big.scale).toBe(8);
  });

  test("construction from Big instance with number", () => {
    const big1 = new Big(numbers[0]);
    const big2 = new Big(big1);
    expect(big2.valueOf()).toBe(BigInt(12345));
    expect(big2.scale).toBe(2);
  });

  test("construction from Big instance from Big instance with different scale. Must ignore fractional part of value", () => {
    const big = new Big(numbers[0], 4);
    expect(big.valueOf()).toBe(BigInt(123));
    expect(big.scale).toBe(4);
  });

  test("construction from number without scale", () => {
    const big3 = new Big(123);
    expect(big3.valueOf()).toBe(BigInt(123));
    expect(big3.scale).toBe(0);
  });

  test("construction from bigint without scale", () => {
    const big2 = new Big(BigInt(100));
    expect(big2.valueOf()).toBe(BigInt(100));
    expect(big2.scale).toBe(0);
  });

  test("construction from number with scale", () => {
    const big4 = new Big(123.45, 2);
    expect(big4.valueOf()).toBe(BigInt(123));
    expect(big4.scale).toBe(2);
  });

  test("construction from string without scale", () => {
    const big5 = new Big("987654321");
    expect(big5.valueOf()).toBe(BigInt("987654321"));
    expect(big5.scale).toBe(0);
  });

  test("construction from string with scale", () => {
    const big6 = new Big("123.45", "2");
    expect(big6.valueOf()).toBe(BigInt(123));
    expect(big6.scale).toBe(2);
  });

  test.each([1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "2.5", "2.0000000000000001", "1e-400", "abc", "", " "])(
    "rejects invalid scale %s",
    (scale) => {
      expect(() => new Big("123.45", scale as number | string)).toThrow("Scale");
    }
  );

  test("accepts safe integer scales represented by numeric strings", () => {
    expect(new Big("123.45", "2.0").toString()).toBe("1.23");
    expect(new Big("123.45", "2e1").scale).toBe(20);
    expect(new Big("123.45", "200e-2").scale).toBe(2);
    expect(new Big(1n, "0x1e").scale).toBe(30);
    expect(new Big(1n, "-2").toString()).toBe("100");
  });

  test.each([1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid public scale before formatting and arithmetic %s",
    (scale) => {
      const big = new Big(1);
      expect(Object.keys(big)).toEqual(["value", "scale"]);
      expect(Object.assign({}, big)).toEqual({ value: 1n, scale: 0 });

      big.scale = scale;
      expect(big.scale).toBe(scale);
      expect(() => big.toString()).toThrow("Scale");
      expect(() => new Big(big)).toThrow("Scale");
      expect(() => createBig(big)).toThrow("Scale");
      expect(() => addBig(big, new Big(0))).toThrow("Scale");
      expect(Object.keys(big)).toEqual(["value", "scale"]);
      expect(Object.assign({}, big)).toEqual({ value: 1n, scale });
    }
  );

  test("preserves valid direct scale mutation and clones it", () => {
    const big = new Big(1);
    big.scale = -2;
    expect(big.scale).toBe(-2);
    expect(big.toString()).toBe("100");
    expect(new Big(big).scale).toBe(-2);
  });

  test("construction from string with decimal places", () => {
    const big7 = new Big("123.45");
    expect(big7.valueOf()).toBe(BigInt(12345));
    expect(big7.scale).toBe(2);
  });

  test("construction should throw error if value is not numeric", () => {
    expect(() => new Big("abc")).toThrow();
  });

  test("toString without decimal places", () => {
    const big = new Big(100);
    expect(big.toString()).toBe("100");
  });

  test("toString with decimal places less than scale", () => {
    const big = new Big(123.456, 4);
    expect(big.toString()).toBe("0.0123");
  });

  test("toString with decimal places greater than scale", () => {
    const big = new Big(9876.54321, 3);
    expect(big.toString()).toBe("9.876");
  });

  test("toString with trimFraction=false", () => {
    const big = new Big(BigInt("123400"), 3);
    expect(big.toString(false)).toBe("123.400");
  });

  // Returns the same value as toString(), so just check that it works.
  test("toJSON without decimal places", () => {
    const big = new Big(100);
    expect(big.toJSON()).toBe("100");
  });
});
