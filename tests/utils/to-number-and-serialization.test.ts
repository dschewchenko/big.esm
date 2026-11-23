import { expect, suite, test } from "vitest";
import { Big } from "../../src/big.js";
import type { BigObject } from "../../src/types.js";
import { createCompactBig } from "../../src/utils/from-string.js";
import { deserializeBig, type SerializedBig, serializeBig } from "../../src/utils/serialization.js";
import { toNumber } from "../../src/utils/to-number.js";

suite("toNumber", () => {
  test("converts strings, numbers, bigints, Big instances, and BigObjects", () => {
    const object: BigObject = { value: 12345n, scale: 2 };

    expect(toNumber("123.45")).toBe(123.45);
    expect(toNumber(0.1)).toBe(0.1);
    expect(toNumber(12345n)).toBe(12345);
    expect(toNumber(new Big(12345n, 2))).toBe(123.45);
    expect(toNumber(object)).toBe(123.45);
  });

  test("uses correctly rounded decimal parsing for halfway values", () => {
    const halfway = "1.00000000000000011102230246251565404236316680908203125";
    const justAboveHalfway = "1.00000000000000011102230246251565404236316680908203126";

    expect(toNumber(halfway)).toBe(1);
    expect(toNumber(justAboveHalfway)).toBe(1.0000000000000002);
    expect(toNumber("1.7976931348623157e308")).toBe(Number.MAX_VALUE);
    expect(toNumber("1.7976931348623159e308")).toBe(Infinity);
    expect(toNumber("2.4703282292062327e-324")).toBe(0);
    expect(toNumber("2.4703282292062328e-324")).toBe(Number.MIN_VALUE);
  });

  test("handles compact and extreme scales without expanding decimal zeros", () => {
    expect(toNumber(-0)).toBe(-0);
    expect(toNumber("1e10000000000")).toBe(Infinity);
    expect(toNumber("-1e-10000000000")).toBe(-0);
    expect(toNumber(new Big(1n, -Number.MAX_SAFE_INTEGER))).toBe(Infinity);
    expect(toNumber(new Big(-1n, Number.MAX_SAFE_INTEGER))).toBe(-0);
    expect(toNumber(new Big(0n, -Number.MAX_SAFE_INTEGER))).toBe(0);
  });

  test("rejects invalid decimal inputs and invalid mutated Big state", () => {
    expect(() => toNumber("not a number")).toThrow();
    expect(() => toNumber(Infinity)).toThrow();

    const malformed = new Big(1n);
    malformed.value = "1" as unknown as bigint;
    expect(() => toNumber(malformed)).toThrow(TypeError);

    const invalidScale = new Big(1n);
    invalidScale.scale = 0.5;
    expect(() => toNumber(invalidScale)).toThrow(RangeError);
  });
});

suite("serializeBig and deserializeBig", () => {
  test("round-trips an exact coefficient and scale through JSON", () => {
    const original = new Big(-1234500n, 4);
    const serialized: SerializedBig = serializeBig(original);
    const restored = deserializeBig(JSON.parse(JSON.stringify(serialized)));

    expect(serialized).toStrictEqual({ value: "-1234500", scale: 4 });
    expect(restored).toBeInstanceOf(Big);
    expect(restored.value).toBe(original.value);
    expect(restored.scale).toBe(original.scale);
  });

  test("preserves BigObject fields and compact positive exponents", () => {
    const object: BigObject = { value: 12300n, scale: 4 };
    expect(serializeBig(object)).toStrictEqual({ value: "12300", scale: 4 });
    expect(serializeBig("1e10000000000")).toStrictEqual({ value: "1", scale: -10000000000 });
    expect(serializeBig(createCompactBig("1.25e-10000000000"))).toStrictEqual({
      value: "125",
      scale: 10000000002
    });
  });

  test("round-trips both extreme safe scales without expansion", () => {
    for (const scale of [-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]) {
      const original = new Big(-1n, scale);
      const serialized = serializeBig(original);
      const restored = deserializeBig(JSON.parse(JSON.stringify(serialized)));

      expect(serialized).toStrictEqual({ value: "-1", scale });
      expect(restored.value).toBe(-1n);
      expect(restored.scale).toBe(scale);
    }
  });

  test("rejects malformed shapes, non-integer strings, and unsafe scales", () => {
    for (const input of [
      null,
      "value",
      [],
      { value: 1n, scale: 0 },
      { value: "1" },
      { value: "1.0", scale: 1 },
      { value: "1e2", scale: 0 },
      { value: "+1", scale: 0 }
    ]) {
      expect(() => deserializeBig(input)).toThrow(TypeError);
    }

    expect(() => deserializeBig({ value: "1", scale: "0" })).toThrow(TypeError);
    for (const scale of [0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => deserializeBig({ value: "1", scale })).toThrow(RangeError);
    }
  });
});
