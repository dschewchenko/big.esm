import { expect, suite, test } from "vitest";
import { absBig, Big } from "../../src";

suite("Big absBig", () => {
  test("returns the absolute value of a positive Big instance", () => {
    const big = new Big(123.45);
    const result = absBig(big);
    expect(result.toString()).toBe(big.toString());
  });

  test("returns the absolute value of a negative Big instance", () => {
    const big = new Big(-123.45);
    const result = absBig(big);
    expect(result.toString()).toBe("123.45");
  });

  test("returns the absolute value of a zero Big instance", () => {
    const big = new Big(0);
    const result = absBig(big);
    expect(result.toString()).toBe("0");
  });

  test("returns a new Big instance with the same scale", () => {
    const big = new Big(-123.45, 2);
    const result = absBig(big);
    expect(result.scale).toBe(big.scale);
  });

  test("mutates the Big instance when the mutable parameter is true", () => {
    const big = new Big(-123.45);
    const result = absBig(big, true);
    expect(result).toBe(big);
    expect(result.toString()).toBe("123.45");
  });
});
