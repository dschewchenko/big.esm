import { expect, suite, test } from "vitest";
import { Big, createBig, createCompactBig, fromString } from "../../src";

suite("createCompactBig", () => {
  test("stores positive exponents as a negative scale without changing the decimal value", () => {
    const compact = createCompactBig("-12.345e6");

    expect(compact).toStrictEqual(new Big(-12345n, -3));
    expect(compact.toString()).toBe("-12345000");
    expect(fromString("-12.345e6")).toStrictEqual(createBig("-12345000"));
  });

  test("keeps a very large positive exponent in the scale instead of expanding the coefficient", () => {
    const compact = createCompactBig("1e10000000000");

    expect(compact.value).toBe(1n);
    expect(compact.scale).toBe(-10_000_000_000);
  });

  test("parses negative exponents and finite numbers exactly", () => {
    expect(createCompactBig("-1.25e-3")).toStrictEqual(new Big(-125n, 5));
    expect(createCompactBig(1.25e3)).toStrictEqual(new Big(1250n, 0));
    expect(createCompactBig(1.25e-3)).toStrictEqual(new Big(125n, 5));
  });

  test("preserves bigint inputs and normalizes zero with large exponents", () => {
    expect(createCompactBig(12345678901234567890n)).toStrictEqual(createBig(12345678901234567890n));
    expect(createCompactBig("-0e10000000000")).toStrictEqual(new Big(0n));
    expect(createCompactBig("0.000e-10000000000")).toStrictEqual(new Big(0n));
  });

  test("accepts the largest safe exponent magnitude and rejects an unsafe scale", () => {
    expect(createCompactBig("1e9007199254740991").scale).toBe(-Number.MAX_SAFE_INTEGER);
    expect(createCompactBig("1e-9007199254740991").scale).toBe(Number.MAX_SAFE_INTEGER);
    expect(() => createCompactBig("1e9007199254740992")).toThrow();
    expect(() => createCompactBig("1e-9007199254740992")).toThrow();
  });

  test("rejects invalid decimal inputs", () => {
    for (const value of ["", "0x10", "Infinity", "1e10000000000000000", Number.NaN, Infinity]) {
      expect(() => createCompactBig(value)).toThrow();
    }
  });

  test("leaves the existing parser's positive exponent representation unchanged", () => {
    expect(fromString("1e6")).toStrictEqual(new Big(1_000_000n, 0));
    expect(createBig("1e6")).toStrictEqual(new Big(1_000_000n, 0));
    expect(createBig("1.5e3", 2)).toStrictEqual(new Big(1500n, 2));
  });
});
