import { Big as BigJS } from "big.js";
import { expect, suite, test } from "vitest";
import { createBig } from "../../src";

suite("fromString / createBig compatibility with big.js", () => {
  test("parses tricky strings like big.js (toFixed)", () => {
    const cases = [
      "0",
      "-0",
      "0.0",
      "-0.0000",
      "00",
      "0001.2300",
      "1.",
      ".1",
      "-.1",
      "1e0",
      "1e+0",
      "1e-0",
      "1e6",
      "1e-6",
      "-1e-6",
      "1E6",
      "1.23e4",
      "1.23e-4",
      "12345678901234567890e-10",
      "12345678901234567890.12345e-3",
      "12345678901234567890.12345e3",
      "1e400",
      "1e-400",
      "-1e400",
      "-1e-400"
    ];

    for (const input of cases) {
      const expected = new BigJS(input).toFixed();
      expect(createBig(input).toString()).toBe(expected);
    }
  });

  test("rejects invalid inputs similar to big.js", () => {
    const invalid = ["+1", " 1", "1 ", "0x10", "1e", "1e+", "1e-", ".", "-.", "+.1"];

    for (const input of invalid) {
      expect(() => new BigJS(input)).toThrow();
      expect(() => createBig(input)).toThrow();
    }
  });

  test("number inputs match big.js, but can lose digits (IEEE-754)", () => {
    const n = Number("12345678901234567890e-10");
    expect(createBig(n).toString()).toBe(new BigJS(n).toFixed());
    expect(createBig(n).toString()).toBe("1234567890.1234567");

    const exact = "12345678901234567890e-10";
    expect(createBig(exact).toString()).toBe("1234567890.123456789");
    expect(createBig(n).toString()).not.toBe(createBig(exact).toString());
  });
});
