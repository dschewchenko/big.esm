/**
 * Needed for testing the most different cases in Big operations
 */

// Number zeros
export const zero = [0, 0];

// Number with different scales
export const numbers = [123.45, 6.789];

// Number with different scales and negative value
export const numbersNegative = [-123.45, 6.789];

// BigInt without fractions
export const bigints = [BigInt("12345678901234567890"), BigInt("99999999999999999999")];

// String with different fraction length
export const stringsDifferentScale = ["12345678901234567890.12345", "98765432109876543210.9876543210"];

// String with different fraction length and negative value
export const stringsDifferentScaleNegative = ["-12345678901234567890.12345", "98765432109876543210.9876543210"];

// String with different fraction length and negative exponent
export const stringsDifferentScaleNegativeExponent = [
  "-12345678901234567890.12345e-3",
  "98765432109876543210.9876543210e-3"
];
