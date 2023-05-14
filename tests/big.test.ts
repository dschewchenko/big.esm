import { expect, suite, test } from "vitest";
import { Big } from "../src";
import { bigints, numbers, numbersNegative, stringsDifferentScale, stringsDifferentScaleNegative, zero } from "./test-data";

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

  test("construction from Big instance with number", () => {
    const big1 = new Big(numbers[0]);
    const big2 = new Big(big1);
    expect(big2.valueOf()).toBe(BigInt(12345));
    expect(big2.scale).toBe(2);
  });

  test("construction from Big instance from Big instance with different scale. Must ignore fractional part of value", () => {
    const big = new Big(numbers[0], 4);
    expect(big.valueOf()).toBe(BigInt(1230));
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
    expect(big.toString()).toBe("0.123");
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
