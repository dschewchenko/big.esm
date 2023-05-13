import { expect, suite, test } from "vitest";
import { isNumericValue } from "../src";

suite("Big utils isNumericValue", () => {
  test("returns true for a bigint value", () => {
    const value = BigInt(123);
    expect(isNumericValue(value)).toBe(true);
  });

  test("returns true for a number value", () => {
    const value = 123.45;
    expect(isNumericValue(value)).toBe(true);
  });

  test("returns true for a string representation of a number", () => {
    const value = "123.45";
    expect(isNumericValue(value)).toBe(true);
  });

  test("returns false for a string value that is not a number", () => {
    const value = "abc";
    expect(isNumericValue(value)).toBe(false);
  });

  test("returns false for a boolean value", () => {
    const value = true;
    expect(isNumericValue(value)).toBe(false);
  });

  test("returns false for an object value", () => {
    const value = { foo: "bar" };
    expect(isNumericValue(value)).toBe(false);
  });

  test("returns false for an array value", () => {
    const value = [1, 2, 3];
    expect(isNumericValue(value)).toBe(false);
  });

  test("returns false for null", () => {
    const value = null;
    expect(isNumericValue(value)).toBe(false);
  });

  test("returns false for undefined", () => {
    const value = undefined;
    expect(isNumericValue(value)).toBe(false);
  });
});
