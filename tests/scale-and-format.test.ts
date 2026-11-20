import { expect, test } from "vitest";
import { addBig, alignScale, Big, compareBig, createBig, subBig } from "../src";

const extremeScale = 10_000_000_000;

test.each([
  [addBig, 1n],
  [subBig, -1n]
] as const)("handles a representable result when the coarser operand is zero", (operate, coefficient) => {
  const left = createBig(0);
  const right = createBig("1e-10000000000");
  expect(operate(left, right)).toBe(left);
  expect(left.value).toBe(coefficient);
  expect(left.scale).toBe(extremeScale);
  expect(right.value).toBe(1n);
  expect(right.scale).toBe(extremeScale);

  const zero = createBig(0n, -2);
  expect(operate(left, zero)).toBe(left);
  expect(left.value).toBe(coefficient);
  expect(left.scale).toBe(extremeScale);
});

test("aligns zero to an extreme scale without constructing a power of ten", () => {
  const fine = createBig(1n, extremeScale);
  for (const swap of [false, true]) {
    const zero = createBig(0);
    const [a, b] = swap ? alignScale(fine, zero) : alignScale(zero, fine);
    expect(a).toBe(swap ? fine : zero);
    expect(b).toBe(swap ? zero : fine);
    expect(zero.value).toBe(0n);
    expect(zero.scale).toBe(extremeScale);
  }
});

test("adds across changing scales with exact coefficients and keeps the second operand", () => {
  const fine = createBig(-321n, 20);
  for (let scale = -64; scale < 20; scale++) {
    const coarse = createBig(12345n, scale);
    const expected = coarse.value * 10n ** BigInt(20 - scale) + fine.value;
    expect(addBig(coarse, fine)).toBe(coarse);
    expect(coarse.value).toBe(expected);
    expect(coarse.scale).toBe(20);
    expect(fine.value).toBe(-321n);
    expect(fine.scale).toBe(20);
  }
});

test("formats negative scales consistently with arithmetic", () => {
  const big = createBig(-123n, -2);
  expect(big.toString()).toBe("-12300");
  expect(big.toString(false)).toBe("-12300");
  expect(big.toJSON()).toBe("-12300");
  expect(compareBig(big, createBig("-12300"))).toBe(0);
});

test("formats an extreme zero without decimal padding when trimming", () => {
  expect(new Big(0n, extremeScale).toString()).toBe("0");
  expect(new Big(0n, -extremeScale).toString(false)).toBe("0");
  expect(createBig("0.000e10000000000").toString()).toBe("0");
  expect(createBig("-000e10000000000").toString()).toBe("0");
});

test("keeps leading fractional zeros and trims only the trailing zeros", () => {
  const scale = 100_000;
  const value = createBig(-1200n, scale);
  const prefix = `-0.${"0".repeat(scale - 4)}12`;
  expect(value.toString()).toBe(prefix);
  expect(value.toString(false)).toBe(`${prefix}00`);
});
