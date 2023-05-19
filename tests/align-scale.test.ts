import { expect, suite, test } from "vitest";
import { alignScale, Big } from "../src";
import { bigints, numbers, numbersNegative, stringsDifferentScale, stringsDifferentScaleNegative, zero } from "./test-data";

suite("Big utils alignScale", () => {
  test("aligns scales of two zero Big instances", () => {
    const [a, b] = alignScale(new Big(zero[0], 0), new Big(zero[1], 0));
    expect(a.scale).toBe(0);
    expect(b.scale).toBe(0);
    expect(a.value.toString()).toBe(BigInt(zero[0]).toString());
    expect(b.value.toString()).toBe(BigInt(zero[1]).toString());
  });

  test("aligns scales of two Big instances with different scales", () => {
    const [a, b] = alignScale(new Big(numbers[0]), new Big(numbers[1]));
    expect(a.scale).toBe(3);
    expect(b.scale).toBe(3);
    expect(a.value.toString()).toBe(BigInt(numbers[0] * 1000).toString());
    expect(b.value.toString()).toBe(BigInt(numbers[1] * 1000).toString());
  });

  test("aligns scales of two negative Big instances with different scales", () => {
    const [a, b] = alignScale(new Big(numbersNegative[0]), new Big(numbersNegative[1]));
    expect(a.scale).toBe(3);
    expect(b.scale).toBe(3);
    expect(a.value.toString()).toBe(BigInt(numbersNegative[0] * 1000).toString());
    expect(b.value.toString()).toBe(BigInt(numbersNegative[1] * 1000).toString());
  });

  test("aligns scales of two Big instances with different scales (scaleDifference > 0)", () => {
    const a = new Big(numbers[1]);
    const b = new Big(numbers[0]);
    const [x, y] = alignScale(a, b);
    expect(x.scale).toBe(3);
    expect(y.scale).toBe(3);
    expect(x.value.toString()).toBe(BigInt(numbers[1] * 1000).toString());
    expect(y.value.toString()).toBe(BigInt(numbers[0] * 1000).toString());
  });

  test("aligns scales of two BigInt instances without fractions", () => {
    const [a, b] = alignScale(new Big(bigints[0], 0), new Big(bigints[1], 0));
    expect(a.scale).toBe(0);
    expect(b.scale).toBe(0);
    expect(a.value.toString()).toBe(bigints[0].toString());
    expect(b.value.toString()).toBe(bigints[1].toString());
  });

  test("aligns scales of two Big instances with different fraction lengths (strings)", () => {
    const [a, b] = alignScale(new Big(stringsDifferentScale[0]), new Big(stringsDifferentScale[1]));
    expect(a.scale).toBe(10);
    expect(b.scale).toBe(10);
    expect(a.value.toString()).toBe(BigInt("123456789012345678901234500000").toString());
    expect(b.value.toString()).toBe(BigInt("987654321098765432109876543210").toString());
  });

  test("aligns scales of two negative Big instances with different fraction lengths (strings)", () => {
    const [a, b] = alignScale(new Big(stringsDifferentScaleNegative[0]), new Big(stringsDifferentScaleNegative[1]));
    expect(a.scale).toBe(10);
    expect(b.scale).toBe(10);
    expect(a.value.toString()).toBe(BigInt("-123456789012345678901234500000").toString());
    expect(b.value.toString()).toBe(BigInt("987654321098765432109876543210").toString());
  });

  test("mutate scale of a Big instances", () => {
    const a = new Big(numbers[0]);
    const b = new Big(numbers[1]);
    alignScale(a, b, true);
    expect(a.scale).toBe(3);
    expect(b.scale).toBe(3);
    expect(a.value.toString()).toBe(BigInt(numbers[0] * 1000).toString());
    expect(b.value.toString()).toBe(BigInt(numbers[1] * 1000).toString());
  });

  test("mutate scale of a Big instances (scaleDifference > 0)", () => {
    const a = new Big(numbers[1]);
    const b = new Big(numbers[0]);
    alignScale(a, b, true);
    expect(a.scale).toBe(3);
    expect(b.scale).toBe(3);
    expect(a.value.toString()).toBe(BigInt(numbers[1] * 1000).toString());
    expect(b.value.toString()).toBe(BigInt(numbers[0] * 1000).toString());
  });
});
