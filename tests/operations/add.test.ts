import { expect, suite, test } from "vitest";
import { addBig, Big } from "../../src";
import {
  bigints,
  numbers,
  numbersNegative,
  stringsDifferentScale,
  stringsDifferentScaleNegative,
  zero
} from "../test-data";

suite("Big add", () => {
  test("adds two Big instances with zero values", () => {
    const [a, b] = zero;
    const big1 = new Big(a);
    const big2 = new Big(b);

    const result = addBig(big1, big2);
    expect(result).toBe(big1);
    expect(result.toString()).toBe("0");
  });

  test("adds two Big instances with different scales", () => {
    const [a, b] = numbers;
    const big1 = new Big(a);
    const big2 = new Big(b);

    const result = addBig(big1, big2);
    expect(result).toBe(big1);
    expect(result.toString()).toBe("130.239");
  });

  test("adds two Big instances with different scales and negative value", () => {
    const [a, b] = numbersNegative;
    const big1 = new Big(a);
    const big2 = new Big(b);

    const result = addBig(big1, big2);
    expect(result).toBe(big1);
    expect(result.toString()).toBe("-116.661");
  });

  test("adds two Big instances without fractions", () => {
    const [a, b] = bigints;
    const big1 = new Big(a);
    const big2 = new Big(b);

    const result = addBig(big1, big2);
    expect(result).toBe(big1);
    expect(result.toString()).toBe("112345678901234567889");
  });

  test("adds two Big instances with different fraction length", () => {
    const [a, b] = stringsDifferentScale;
    const big1 = new Big(a);
    const big2 = new Big(b);

    const result = addBig(big1, big2);
    expect(result).toBe(big1);
    expect(result.toString()).toBe("111111111011111111101.111104321");
  });

  test("adds two Big instances with different fraction length and negative value", () => {
    const [a, b] = stringsDifferentScaleNegative;
    const big1 = new Big(a);
    const big2 = new Big(b);

    const result = addBig(big1, big2);
    expect(result).toBe(big1);
    expect(result.toString()).toBe("86419753208641975320.864204321");
  });
});
