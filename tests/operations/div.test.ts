import { expect, suite, test } from "vitest";
import { Big, divBig } from "../../src";
import {
  bigints,
  numbers,
  numbersNegative,
  stringsDifferentScale,
  stringsDifferentScaleNegative,
  zero
} from "../test-data";

suite("Big div", () => {
  test("divides two Big instances with zero values and throws exception", () => {
    const [a, b] = zero;
    const big1 = new Big(a);
    const big2 = new Big(b);

    expect(() => divBig(big1, big2)).toThrow();
  });

  test("divides numbers with different scales", () => {
    const dividend = new Big(numbers[0]);
    const divisor = new Big(numbers[1]);
    const result = divBig(dividend, divisor);
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("18.18382677861246133451");
  });

  test("divides numbers with different scales and negative value", () => {
    const dividend = new Big(numbersNegative[0]);
    const divisor = new Big(numbersNegative[1]);
    const result = divBig(dividend, divisor);
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("-18.18382677861246133451");
  });

  test("divides numbers with different scales and rounding mode 'down'", () => {
    const dividend = new Big(numbers[0]);
    const divisor = new Big(numbers[1]);
    const result = divBig(dividend, divisor, 2, "down");
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("18.18");
  });

  test("divides numbers with different scales and rounding mode 'up'", () => {
    const dividend = new Big(numbers[0]);
    const divisor = new Big(numbers[1]);
    const result = divBig(dividend, divisor, 2, "up");
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("18.19");
  });

  test("divides numbers with different scales and rounding mode 'up' ans remainder is zero", () => {
    const dividend = new Big(numbers[0]);
    const divisor = new Big(numbers[1]);
    const result = divBig(dividend, divisor, 0, "up");
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("19");
  });

  test("divides with remainder equal to zero", () => {
    const dividend = new Big("4");
    const divisor = new Big("2");
    const result = divBig(dividend, divisor, 0, "up");
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("2");
  });

  test("divides BigInt values without fractions", () => {
    const dividend = new Big(bigints[0]);
    const divisor = new Big(bigints[1]);
    const result = divBig(dividend, divisor);
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("0.1234567890123456789");
  });

  test("divides BigInt values without fractions and with precision", () => {
    const dividend = new Big(bigints[0]);
    const divisor = new Big(bigints[1]);
    const result = divBig(dividend, divisor, 2);
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("0.12");
  });

  test("divides strings with different fraction lengths", () => {
    const dividend = new Big(stringsDifferentScale[0]);
    const divisor = new Big(stringsDifferentScale[1]);
    const result = divBig(dividend, divisor);
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("0.12499999886093750001");
  });

  test("divides strings with different fraction lengths and negative value", () => {
    const dividend = new Big(stringsDifferentScaleNegative[0]);
    const divisor = new Big(stringsDifferentScaleNegative[1]);
    const result = divBig(dividend, divisor);
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("-0.12499999886093750001");
  });

  test("divides numbers with different scales and custom precision", () => {
    const dividend = new Big(numbers[0]);
    const divisor = new Big(numbers[1]);
    const result = divBig(dividend, divisor, 4);
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("18.1838");
  });

  test("divides numbers with different scales and negative value with custom precision", () => {
    const dividend = new Big(numbersNegative[0]);
    const divisor = new Big(numbersNegative[1]);
    const result = divBig(dividend, divisor, 3);
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("-18.183");
  });

  test("divides BigInt values without fractions and custom precision", () => {
    const dividend = new Big(bigints[0]);
    const divisor = new Big(bigints[1]);
    const result = divBig(dividend, divisor, 5);
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("0.12346");
  });

  test("divides strings with different fraction lengths and custom precision", () => {
    const dividend = new Big(stringsDifferentScale[0]);
    const divisor = new Big(stringsDifferentScale[1]);
    const result = divBig(dividend, divisor, 7);
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("0.125");
  });

  test("divides strings with different fraction lengths and negative value with custom precision", () => {
    const dividend = new Big(stringsDifferentScaleNegative[0]);
    const divisor = new Big(stringsDifferentScaleNegative[1]);
    const result = divBig(dividend, divisor, 6);
    expect(result).toBe(dividend);
    expect(result.toString()).toBe("-0.124999");
  });

  test("mutates the dividend", () => {
    const dividend = new Big("4");
    const divisor = new Big("2");
    const result = divBig(dividend, divisor, 0, "up");
    expect(result.toString()).toBe("2");
    expect(dividend.toString()).toBe("2");
  });
});
