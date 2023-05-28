import { expect, suite, test } from "vitest";
import { Big, createBig } from "../../src";
import { numbers, zero } from "../test-data";

suite("createBig", () => {
  test("returns the same Big instance if passed a Big instance", () => {
    const big1 = new Big(numbers[0]);
    const big2 = createBig(big1);
    expect(big1).toBe(big2);
  });

  test("creates a new Big instance with zero value", () => {
    const value = zero[0];
    const big1 = new Big(value);
    const big2 = createBig(value);
    expect(big1.toString()).toBe(big2.toString());
  });

  test("creates a new Big instance from number", () => {
    const value = numbers[0];
    const big1 = new Big(value);
    const big2 = createBig(value);
    expect(big1.toString()).toBe(big2.toString());
  });

  test("creates a new Big instance with scale", () => {
    const value = numbers[0];
    const scale = 2;
    const big1 = new Big(value, scale);
    const big2 = createBig(value, scale);
    expect(big1.toString()).toBe(big2.toString());
  });
});
