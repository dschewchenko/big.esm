import { expect, suite, test } from "vitest";
import { Big, mulBig } from "../../src";
import {
  bigints,
  numbers,
  numbersNegative,
  stringsDifferentScale,
  stringsDifferentScaleNegative,
  zero
} from "../test-data";

suite("Big multiply", () => {
  test("multiplies two Big instances with zero values", () => {
    const [a, b] = zero;
    const big1 = new Big(a);
    const big2 = new Big(b);

    const result = mulBig(big1, big2);
    expect(result.toString()).toBe("0");
  });

  test("multiplies two Big instances with different scales", () => {
    const big1 = new Big(numbers[0]);
    const big2 = new Big(numbers[1]);

    const result = mulBig(big1, big2);
    expect(result.toString()).toBe("838.10205");
  });

  test("multiplies two Big instances with different scales and negative value", () => {
    const big1 = new Big(numbersNegative[0]);
    const big2 = new Big(numbersNegative[1]);

    const result = mulBig(big1, big2);
    expect(result.toString()).toBe("-838.10205");
  });

  test("multiplies two Big instances without fractions", () => {
    const big1 = new Big(bigints[0]);
    const big2 = new Big(bigints[1]);

    const result = mulBig(big1, big2);
    expect(result.toString()).toBe("1234567890123456788987654321098765432110");
  });

  test("multiplies two Big instances with different fraction length", () => {
    const big1 = new Big(stringsDifferentScale[0]);
    const big2 = new Big(stringsDifferentScale[1]);

    const result = mulBig(big1, big2);
    expect(result.toString()).toBe("1219326311370217952261849656817710639370.52277861592745");
  });

  test("multiplies two Big instances with different fraction length and negative value", () => {
    const big1 = new Big(stringsDifferentScaleNegative[0]);
    const big2 = new Big(stringsDifferentScaleNegative[1]);

    const result = mulBig(big1, big2);
    expect(result.toString()).toBe("-1219326311370217952261849656817710639370.52277861592745");
  });

  test("mutate the first Big instance when the mutable parameter is true", () => {
    const big1 = new Big(numbers[0]);
    const big2 = new Big(numbers[1]);

    const result = mulBig(big1, big2, true);
    expect(result.toString()).toBe("838.10205");
    expect(big1.toString()).toBe("838.10205");
  });
});
