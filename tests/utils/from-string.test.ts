import { expect, suite, test } from "vitest";
import { Big, fromString } from "../../src";

suite("Big utils fromString", () => {
  test("fromString converts small positive numbers", () => {
    expect(fromString(1e6)).toStrictEqual(new Big(BigInt(1000000)));
    expect(fromString(1.23e4)).toStrictEqual(new Big(BigInt(12300)));
    expect(fromString(1.5e3)).toStrictEqual(new Big(BigInt(1500)));
  });

  test("fromString converts small negative numbers", () => {
    expect(fromString(-1e6)).toStrictEqual(new Big(BigInt(-1000000)));
    expect(fromString(-1.23e4)).toStrictEqual(new Big(BigInt(-12300)));
    expect(fromString(-1.5e3)).toStrictEqual(new Big(BigInt(-1500)));
  });

  test("fromString converts fractions", () => {
    expect(fromString(1e-6)).toStrictEqual(new Big(BigInt(1), 6));
    expect(fromString(1.23e-4)).toStrictEqual(new Big(BigInt(123), 6));
    expect(fromString(1.5e-3)).toStrictEqual(new Big(BigInt(15), 4));
  });

  test("fromString converts string numbers", () => {
    expect(fromString("1e6")).toStrictEqual(new Big(BigInt(1000000)));
    expect(fromString("1.23e4")).toStrictEqual(new Big(BigInt(12300)));
    expect(fromString("1.5e3")).toStrictEqual(new Big(BigInt(1500)));
  });

  test("fromString converts string big number with fractions", () => {
    expect(fromString("1234567890.12345e-3")).toStrictEqual(new Big(BigInt("123456789012345"), 8));
    expect(fromString("-12345678901234567890.12345e-3")).toStrictEqual(
      new Big(BigInt("-1234567890123456789012345"), 8)
    );
    expect(fromString("12345678901234567890.12345e3")).toStrictEqual(new Big(BigInt("1234567890123456789012345"), 2));
  });

  test("fromString converts string bug number ignoring fractional part", () => {
    expect(fromString("1234567890.12345e-3", true)).toStrictEqual(new Big(BigInt("1234567")));
  });

  test("fromString converts string big number with fractions if integer less than exponent", () => {
    expect(fromString("123.45e-6", true)).toStrictEqual(new Big(BigInt("0")));
  });

  test("fromString converts string in Big Instance", () => {
    expect(fromString("123456", true, true)).toStrictEqual(new Big("123456"));
  });

  test("fromString converts zero to Big Instance with zero", () => {
    expect(fromString("0")).toStrictEqual(new Big(BigInt(0)));
  });

  test.each([
    ["-.5", -5n, 1],
    ["1.", 1n, 0],
    ["00012.3400", 123400n, 4],
    ["-0.00", 0n, 0],
    ["999999999999999", 999999999999999n, 0],
    ["9007199254740993", 9007199254740993n, 0]
  ])("reads plain decimal %s exactly", (text, value, scale) => {
    expect(fromString(text, false, false)).toEqual({ value, scale });
    expect(new Big(text)).toMatchObject({ value, scale });
  });

  test.each(["", "-", ".", "-.", "+1", "1.2.3", "1 2", "1e", "1\n", "０.1"])(
    "rejects invalid decimal syntax %j",
    (text) => {
      expect(() => fromString(text)).toThrow("Num");
    }
  );

  test("fromString throws errors for invalid inputs", () => {
    expect(() => fromString("not a number")).toThrow();
    expect(() => fromString(Infinity)).toThrow();
    expect(() => fromString(-Infinity)).toThrow();
  });
});
