import { expect, suite, test } from "vitest";
import { Big } from "../src";
import {
  bigints,
  numbers,
  numbersNegative,
  stringsDifferentScale,
  stringsDifferentScaleNegative,
  stringsDifferentScaleNegativeExponent,
  zero
} from "./test-data";

suite("Big", () => {
  test("construction from zero", () => {
    const big = new Big(zero[0]);
    expect(big.valueOf()).toBe(BigInt(0));
    expect(big.scale).toBe(0);
  });

  test("construction from number", () => {
    const big = new Big(numbers[0]);
    expect(big.valueOf()).toBe(BigInt(12345));
    expect(big.scale).toBe(2);
  });

  test("construction from negative number", () => {
    const big = new Big(numbersNegative[0]);
    expect(big.valueOf()).toBe(BigInt(-12345));
    expect(big.scale).toBe(2);
  });

  test("construction from bigint", () => {
    const big = new Big(bigints[0]);
    expect(big.valueOf()).toBe(BigInt("12345678901234567890"));
    expect(big.scale).toBe(0);
  });

  test("construction from string", () => {
    const big = new Big(stringsDifferentScale[0]);
    expect(big.valueOf()).toBe(BigInt("1234567890123456789012345"));
    expect(big.scale).toBe(5);
  });

  test("construction from negative string", () => {
    const big = new Big(stringsDifferentScaleNegative[0]);
    expect(big.valueOf()).toBe(BigInt("-1234567890123456789012345"));
    expect(big.scale).toBe(5);
  });

  test("construction from string with exponent", () => {
    const big = new Big(stringsDifferentScaleNegativeExponent[0]);
    expect(big.valueOf()).toBe(BigInt("-1234567890123456789012345"));
    expect(big.scale).toBe(8);
  });

  test("construction from Big instance with number", () => {
    const big1 = new Big(numbers[0]);
    const big2 = new Big(big1);
    expect(big2.valueOf()).toBe(BigInt(12345));
    expect(big2.scale).toBe(2);
  });

  test("construction from Big instance from Big instance with different scale. Must ignore fractional part of value", () => {
    const big = new Big(numbers[0], 4);
    expect(big.valueOf()).toBe(BigInt(123));
    expect(big.scale).toBe(4);
  });

  test("construction from number without scale", () => {
    const big3 = new Big(123);
    expect(big3.valueOf()).toBe(BigInt(123));
    expect(big3.scale).toBe(0);
  });

  test("construction from bigint without scale", () => {
    const big2 = new Big(BigInt(100));
    expect(big2.valueOf()).toBe(BigInt(100));
    expect(big2.scale).toBe(0);
  });

  test("construction from number with scale", () => {
    const big4 = new Big(123.45, 2);
    expect(big4.valueOf()).toBe(BigInt(123));
    expect(big4.scale).toBe(2);
  });

  test("construction from string without scale", () => {
    const big5 = new Big("987654321");
    expect(big5.valueOf()).toBe(BigInt("987654321"));
    expect(big5.scale).toBe(0);
  });

  test("construction from string with scale", () => {
    const big6 = new Big("123.45", "2");
    expect(big6.valueOf()).toBe(BigInt(123));
    expect(big6.scale).toBe(2);
  });

  test("construction from string with scale isNaN", () => {
    const big6 = new Big("123.45", "abc");
    expect(big6.valueOf()).toBe(BigInt(12345));
    expect(big6.scale).toBe(2);
  });

  test("construction from string with decimal places", () => {
    const big7 = new Big("123.45");
    expect(big7.valueOf()).toBe(BigInt(12345));
    expect(big7.scale).toBe(2);
  });

  test("construction should throw error if value is not numeric", () => {
    expect(() => new Big("abc")).toThrow();
  });

  test("toString without decimal places", () => {
    const big = new Big(100);
    expect(big.toString()).toBe("100");
  });

  test("toString with decimal places less than scale", () => {
    const big = new Big(123.456, 4);
    expect(big.toString()).toBe("0.0123");
  });

  test("toString with decimal places greater than scale", () => {
    const big = new Big(9876.54321, 3);
    expect(big.toString()).toBe("9.876");
  });

  test("toString with trimFraction=false", () => {
    const big = new Big(BigInt("123400"), 3);
    expect(big.toString(false)).toBe("123.400");
  });

  // Returns the same value as toString(), so just check that it works.
  test("toJSON without decimal places", () => {
    const big = new Big(100);
    expect(big.toJSON()).toBe("100");
  });
});

suite("Big.toFormat()", () => {
  test("default formatting (no options)", () => {
    expect(new Big("12345.6789").toFormat()).toBe("12345.6789");
    expect(new Big("-123.45").toFormat()).toBe("-123.45");
    expect(new Big("1000").toFormat()).toBe("1000");
  });

  test("default formatting (empty options object)", () => {
    expect(new Big("12345.6789").toFormat({})).toBe("12345.6789");
  });

  test("decimalPlaces with roundingMode: 'half-up'", () => {
    expect(new Big("1.23456").toFormat({ decimalPlaces: 2 })).toBe("1.23"); // 4 rounds down
    expect(new Big("1.23789").toFormat({ decimalPlaces: 2 })).toBe("1.24"); // 7 rounds up
    expect(new Big("1.235").toFormat({ decimalPlaces: 2 })).toBe("1.24");   // 5 rounds up
    expect(new Big("-1.235").toFormat({ decimalPlaces: 2 })).toBe("-1.24"); // -5 rounds away from zero
    expect(new Big("1.999").toFormat({ decimalPlaces: 2 })).toBe("2.00");
    expect(new Big("1.999").toFormat({ decimalPlaces: 0 })).toBe("2");
    expect(new Big("0.123").toFormat({ decimalPlaces: 0 })).toBe("0");
    expect(new Big("0.789").toFormat({ decimalPlaces: 0 })).toBe("1");
  });

  test("decimalPlaces with roundingMode: 'truncate'", () => {
    expect(new Big("1.23789").toFormat({ decimalPlaces: 2, roundingMode: 'truncate' })).toBe("1.23");
    expect(new Big("1.23456").toFormat({ decimalPlaces: 2, roundingMode: 'truncate' })).toBe("1.23");
    expect(new Big("-1.23789").toFormat({ decimalPlaces: 2, roundingMode: 'truncate' })).toBe("-1.23");
    expect(new Big("1.999").toFormat({ decimalPlaces: 0, roundingMode: 'truncate' })).toBe("1");
  });

  test("decimalPlaces with roundingMode: 'ceil'", () => {
    expect(new Big("1.234").toFormat({ decimalPlaces: 2, roundingMode: 'ceil' })).toBe("1.24");
    expect(new Big("1.230").toFormat({ decimalPlaces: 2, roundingMode: 'ceil' })).toBe("1.23"); // No change if exact
    expect(new Big("-1.234").toFormat({ decimalPlaces: 2, roundingMode: 'ceil' })).toBe("-1.23"); // Towards +inf
    expect(new Big("-1.230").toFormat({ decimalPlaces: 2, roundingMode: 'ceil' })).toBe("-1.23");
    expect(new Big("1.00001").toFormat({ decimalPlaces: 0, roundingMode: 'ceil' })).toBe("2");
    expect(new Big("-1.999").toFormat({ decimalPlaces: 0, roundingMode: 'ceil' })).toBe("-1");
  });

  test("decimalPlaces with roundingMode: 'floor'", () => {
    expect(new Big("1.237").toFormat({ decimalPlaces: 2, roundingMode: 'floor' })).toBe("1.23");
    expect(new Big("1.230").toFormat({ decimalPlaces: 2, roundingMode: 'floor' })).toBe("1.23");
    expect(new Big("-1.237").toFormat({ decimalPlaces: 2, roundingMode: 'floor' })).toBe("-1.24"); // Towards -inf
    expect(new Big("-1.230").toFormat({ decimalPlaces: 2, roundingMode: 'floor' })).toBe("-1.23");
    expect(new Big("1.999").toFormat({ decimalPlaces: 0, roundingMode: 'floor' })).toBe("1");
    expect(new Big("-1.001").toFormat({ decimalPlaces: 0, roundingMode: 'floor' })).toBe("-2");
  });


  test("decimalPlaces causing padding with zeros", () => {
    expect(new Big("1.23").toFormat({ decimalPlaces: 5 })).toBe("1.23000");
    expect(new Big("100").toFormat({ decimalPlaces: 3 })).toBe("100.000");
    expect(new Big("0").toFormat({ decimalPlaces: 2 })).toBe("0.00");
  });

  test("thousandsSeparator: ','", () => {
    expect(new Big("1234567.89").toFormat({ thousandsSeparator: ',' })).toBe("1,234,567.89");
    expect(new Big("-1234567.89").toFormat({ thousandsSeparator: ',' })).toBe("-1,234,567.89");
    expect(new Big("123.45").toFormat({ thousandsSeparator: ',' })).toBe("123.45"); // No separator for small numbers
    expect(new Big("1234567890").toFormat({ thousandsSeparator: ',' })).toBe("1,234,567,890");
  });

  test("decimalSeparator: ','", () => {
    expect(new Big("123.45").toFormat({ decimalSeparator: ',' })).toBe("123,45");
    expect(new Big("100").toFormat({ decimalSeparator: ',', decimalPlaces: 2 })).toBe("100,00");
  });
  
  test("decimalSeparator: '' (no decimal point if fractional part is zero)", () => {
    expect(new Big("123.000").toFormat({ decimalPlaces: 2, decimalSeparator: '' })).toBe("12300"); //This is tricky, default toString trims.
    // If decimalPlaces is set, we expect that many digits.
    // A number like 123.00 with decimalPlaces: 2 and decimalSeparator: '' might be "12300" or "123.00" if separator must exist.
    // The current toFormat logic implies it would become "123<empty_sep>00".
    // Let's test a case where fractional part exists.
    expect(new Big("123.45").toFormat({ decimalPlaces: 2, decimalSeparator: '_' })).toBe("123_45");
  });


  test("combination: decimalPlaces, thousandsSeparator, decimalSeparator, roundingMode", () => {
    expect(
      new Big("-1234567.8912").toFormat({
        decimalPlaces: 1,
        thousandsSeparator: ',',
        decimalSeparator: '.', // This is default, but explicit for test
        roundingMode: 'half-up',
      })
    ).toBe("-1,234,567.9"); // .89 rounds to .9

    expect(
      new Big("9876543.21987").toFormat({
        decimalPlaces: 3,
        thousandsSeparator: ' ',
        decimalSeparator: ',',
        roundingMode: 'truncate',
      })
    ).toBe("9 876 543,219");
    
    expect(
      new Big("12345").toFormat({
        decimalPlaces: 2, // Should pad with zeros
        thousandsSeparator: ',',
        decimalSeparator: '.',
      })
    ).toBe("12,345.00");
  });

  test("integer numbers", () => {
    expect(new Big("12345").toFormat({ thousandsSeparator: ',' })).toBe("12,345");
    expect(new Big("-12345").toFormat({ thousandsSeparator: '*' })).toBe("-12*345");
  });

  test("numbers with no integer part (e.g., 0.xxxx)", () => {
    expect(new Big("0.12345").toFormat({ decimalPlaces: 2 })).toBe("0.12"); // half-up default
    expect(new Big("0.12789").toFormat({ decimalPlaces: 2, roundingMode: 'half-up' })).toBe("0.13");
    expect(new Big("-0.12789").toFormat({ decimalPlaces: 2, roundingMode: 'truncate' })).toBe("-0.12");
    expect(new Big("0.0000123").toFormat({ decimalPlaces: 5, roundingMode: 'ceil' })).toBe("0.00002");
  });
  
  test("zero value formatting", () => {
    expect(new Big("0").toFormat({ decimalPlaces: 2 })).toBe("0.00");
    expect(new Big("0.000").toFormat({ decimalPlaces: 4, thousandsSeparator: ',' })).toBe("0.0000");
    expect(new Big("-0").toFormat({ decimalPlaces: 2 })).toBe("0.00"); // Assuming -0 is normalized to 0
  });

  test("edge case: decimalPlaces is current scale", () => {
    expect(new Big("12.345").toFormat({ decimalPlaces: 3 })).toBe("12.345");
  });

  test("edge case: decimalPlaces is 0", () => {
    expect(new Big("12.345").toFormat({ decimalPlaces: 0, roundingMode: 'half-up' })).toBe("12");
    expect(new Big("12.789").toFormat({ decimalPlaces: 0, roundingMode: 'half-up' })).toBe("13");
    expect(new Big("0.345").toFormat({ decimalPlaces: 0, roundingMode: 'truncate' })).toBe("0");
  });
});
