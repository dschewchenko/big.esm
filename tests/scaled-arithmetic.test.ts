import { expect, test } from "vitest";
import { Big, compareBig, createBig, divBig, modBig } from "../src";

test("compares numbers across enormous decimal scale gaps without aligning them", () => {
  const tiny = createBig("1e-10000000000");
  expect(compareBig(tiny, createBig(1))).toBe(-1);
  expect(compareBig(createBig(-1), tiny)).toBe(-1);
  expect(compareBig(createBig("-1e-10000000000"), createBig(0))).toBe(-1);
  expect(compareBig(createBig("-12e-10000000000"), createBig("-11e-10000000000"))).toBe(-1);
  expect(compareBig(createBig(12n, 10000000000), createBig(12n, 10000000000))).toBe(0);
  expect(compareBig(createBig(-123n, -2), createBig("-12300"))).toBe(0);
});

test("rounds tiny division results without creating a huge divisor", () => {
  const dividend = createBig("1e-10000000000");
  expect(divBig(dividend, createBig(1), 2)).toBe(dividend);
  expect(dividend.value).toBe(0n);
  expect(dividend.scale).toBe(2);

  expect(divBig(createBig("1e-10000000000"), createBig(1), 2, "up").value).toBe(1n);
  expect(divBig(createBig("-1e-10000000000"), createBig(1), 2, "up").value).toBe(-1n);
  expect(divBig(createBig("5e-10000000000"), createBig("1e-10000000000"), 0).value).toBe(5n);
});

test("calculates remainders over huge scale gaps with modular exponentiation", () => {
  const tiny = createBig("1e-10000000000");
  expect(modBig(tiny, createBig(1))).toBe(tiny);
  expect(tiny.value).toBe(1n);
  expect(tiny.scale).toBe(10000000000);

  const third = modBig(createBig(1), createBig("3e-10000000000"));
  expect(third.value).toBe(1n);
  expect(third.scale).toBe(10000000000);

  const negativeThird = modBig(createBig(-1), createBig("3e-10000000000"));
  expect(negativeThird.value).toBe(-1n);
  expect(negativeThird.scale).toBe(10000000000);

  const even = modBig(createBig(1), createBig("2e-10000000000"));
  expect(even.value).toBe(0n);
  expect(even.scale).toBe(10000000000);
});

test("keeps zero remainder scale behavior when operand scales differ", () => {
  const zero = createBig(0);
  expect(modBig(zero, createBig("1.23"))).toBe(zero);
  expect(zero.scale).toBe(2);
});

test.each([-123n, -340n])("preserves the dividend sign with a negative divisor across extreme scales", (value) => {
  const scale = Number.MAX_SAFE_INTEGER;
  const dividend = new Big(value, -scale);
  const divisor = new Big(-17n, scale);
  // Ten has period 16 modulo 17, so this reference needs only a small power.
  const expected = (value * 10n ** ((2n * BigInt(scale)) % 16n)) % divisor.value;

  expect(modBig(dividend, divisor)).toBe(dividend);
  expect(dividend).toEqual(new Big(expected, scale));
  expect(divisor).toEqual(new Big(-17n, scale));
});

test("handles opposite safe-integer scale extremes without overflowing scale differences", () => {
  const maxScale = Number.MAX_SAFE_INTEGER;
  const tiny = createBig(1n, maxScale);
  const huge = createBig(1n, -maxScale);

  expect(compareBig(tiny, huge)).toBe(-1);
  expect(divBig(createBig(1n, maxScale), huge, 2).value).toBe(0n);

  const remainder = modBig(createBig(1n, maxScale), huge);
  expect(remainder.value).toBe(1n);
  expect(remainder.scale).toBe(maxScale);
});
