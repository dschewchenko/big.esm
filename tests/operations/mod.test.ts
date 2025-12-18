import { expect, suite, test } from "vitest";
import { Big, modBig } from "../../src";
import {
  bigints,
  numbers,
  numbersNegative,
  stringsDifferentScale,
  stringsDifferentScaleNegative,
  zero
} from "../test-data";

suite("Big mod", () => {
  test("modulo of two Big instances with zero values and throws exception", () => {
    const [a, b] = zero;
    const big1 = new Big(a);
    const big2 = new Big(b);

    expect(() => modBig(big1, big2)).toThrow();
  });

  test("modulo of numbers with different scales", () => {
    const dividend = new Big(numbers[0]);
    const divisor = new Big(numbers[1]);
    const result = modBig(dividend, divisor);
    expect(result.toString()).toBe("1.248");
  });

  test("modulo of numbers with different scales and negative value", () => {
    const dividend = new Big(numbersNegative[0]);
    const divisor = new Big(numbersNegative[1]);
    const result = modBig(dividend, divisor);
    expect(result.toString()).toBe("-1.248");
  });

  test("modulo of BigInt values without fractions", () => {
    const dividend = new Big(bigints[0]);
    const divisor = new Big(bigints[1]);
    const result = modBig(dividend, divisor);
    expect(result.toString()).toBe("12345678901234567890");
  });

  test("modulo of strings with different fraction lengths", () => {
    const dividend = new Big(stringsDifferentScale[0]);
    const divisor = new Big(stringsDifferentScale[1]);
    const result = modBig(dividend, divisor);
    expect(result.toString()).toBe("12345678901234567890.12345");
  });

  test("modulo of strings with different fraction lengths and negative value", () => {
    const dividend = new Big(stringsDifferentScaleNegative[0]);
    const divisor = new Big(stringsDifferentScaleNegative[1]);
    const result = modBig(dividend, divisor);
    expect(result.toString()).toBe("-12345678901234567890.12345");
  });

  test("mutable dividend", () => {
    const dividend = new Big(numbers[0]);
    const divisor = new Big(numbers[1]);
    const result = modBig(dividend, divisor);
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("1.248");
    expect(dividend.toString()).toBe("1.248");
  });
});
