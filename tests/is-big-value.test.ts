import { expect, suite, test } from "vitest";
import { Big, isBigObject } from "../src";

suite("Big utils isBigObject", () => {
  test("isBigObject returns true for Big instances", () => {
    expect(isBigObject(new Big(0))).toBe(true);
    expect(isBigObject(new Big(1))).toBe(true);
    expect(isBigObject(new Big(-1))).toBe(true);
    expect(isBigObject({ value: BigInt(0), scale: 0 })).toBe(true);
  });

  test("isBigObject returns false for non-Big instances", () => {
    expect(isBigObject(0)).toBe(false);
    expect(isBigObject("0")).toBe(false);
    expect(isBigObject({})).toBe(false);
    expect(isBigObject({ value: BigInt(0), scale: "" })).toBe(false);
    expect(isBigObject({ value: "", scale: 0 })).toBe(false);
  });
});
