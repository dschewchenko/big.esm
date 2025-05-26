import { isNumericValue } from "./utils/numeric";
import { trimZeros } from "./utils/trim-zeros";
import { ZERO_BIGINT, ONE_BIGINT, TEN_BIGINT } from "./utils/constants";
import { fromString } from "./utils/from-string";
import { isBigObject } from "./utils/is-big-object";
import type { BigObject, BigValue, PossibleNumber, FormattingOptions } from "./types";
import { cloneBig } from "./utils/clone";
// Removed divBig import, will do rounding manually for toFormat

/**
 * The Big class for working with large numbers and fractions using BigInt.
 *
 * @category Core
 */
export class Big {
  public value: bigint;
  public scale: number;

  constructor(value: Big | BigObject);
  constructor(value: PossibleNumber);
  constructor(value: PossibleNumber, scale: number | string);
  constructor(value: BigValue, scale?: number | string) {
    if (isBigObject(value)) {
      this.value = value.value;
      this.scale = value.scale;
    } else if (isNumericValue(value)) {
      let scaleDefined = scale !== undefined;
      if (scaleDefined) {
        if (typeof scale !== "number") scale = Number(scale);
        scaleDefined = !isNaN(scale);
        scale = scaleDefined ? Math.floor(scale) : 0;
      }
      if (typeof value === "bigint") {
        this.value = value;
        this.scale = scaleDefined ? scale as number : 0;
      } else {
        const { value: valueBigint, scale: parsedScale } = fromString(value, scaleDefined, false);
        this.value = valueBigint;
        this.scale = scaleDefined ? scale as number : parsedScale;
      }
    } else {
      throw new TypeError("Invalid type provided to Big constructor.");
    }
  }

  valueOf(): bigint {
    return this.value;
  }

  toString(shouldTrimZeros = true): string {
    let integerPart = this.value.toString();
    const sign = integerPart.startsWith("-") ? "-" : "";
    if (sign) integerPart = integerPart.substring(1);
    let fractionPart = "";

    if (this.scale > 0) {
      const scaleNum = Number(this.scale);
      const digits = integerPart.length > scaleNum ? integerPart.length - scaleNum : 0;
      fractionPart = integerPart.slice(digits).padStart(scaleNum, "0");
      if (shouldTrimZeros) {
        fractionPart = trimZeros(fractionPart);
      }
      if (fractionPart.length > 0) {
        fractionPart = `.${fractionPart}`;
      }
      integerPart = integerPart.slice(0, digits);
    }
    return `${sign}${integerPart || "0"}${fractionPart}`;
  }

  toJSON(): string {
    return this.toString();
  }

  toFormat(options?: FormattingOptions): string {
    const defaults: Required<FormattingOptions> = {
      decimalPlaces: this.scale,
      roundingMode: 'half-up',
      thousandsSeparator: '',
      decimalSeparator: '.',
    };
    const opt = { ...defaults, ...options };

    let tempValue = this.value;
    let tempScale = this.scale;

    if (options?.decimalPlaces !== undefined) {
      const newScale = options.decimalPlaces;
      if (newScale < 0) throw new Error("decimalPlaces cannot be negative.");

      if (tempScale > newScale) {
        const scaleDifference = BigInt(tempScale - newScale);
        const divisor = TEN_BIGINT ** scaleDifference;
        const remainder = tempValue % divisor;

        // Truncate first
        tempValue = tempValue / divisor;

        if (opt.roundingMode !== 'truncate') {
          const isNegative = this.value < ZERO_BIGINT;
          const absRemainder = remainder < ZERO_BIGINT ? -remainder : remainder;
          
          if (opt.roundingMode === 'half-up') {
            const halfDivisor = divisor / BigInt(2);
            if (absRemainder >= halfDivisor) {
              tempValue += isNegative ? -ONE_BIGINT : ONE_BIGINT;
            }
          } else if (opt.roundingMode === 'ceil') {
            if (!isNegative && remainder !== ZERO_BIGINT) {
              tempValue += ONE_BIGINT;
            }
          } else if (opt.roundingMode === 'floor') {
            if (isNegative && remainder !== ZERO_BIGINT) {
              tempValue -= ONE_BIGINT;
            }
          }
        }
        tempScale = newScale;
      } else if (tempScale < newScale) {
        tempValue = tempValue * (TEN_BIGINT ** BigInt(newScale - tempScale));
        tempScale = newScale;
      }
    }

    // Construct string from tempValue and tempScale
    let numStr = tempValue.toString();
    const sign = numStr.startsWith("-") ? "-" : "";
    if (sign) numStr = numStr.substring(1);

    let integerPartStr = numStr;
    let fractionPartStr = "";

    if (tempScale > 0) {
      const scaleNum = Number(tempScale);
      const digits = numStr.length > scaleNum ? numStr.length - scaleNum : 0;
      fractionPartStr = numStr.slice(digits).padStart(scaleNum, "0");
      integerPartStr = numStr.slice(0, digits);
    }
    
    integerPartStr = integerPartStr || "0"; // Ensure "0" if empty

    // Pad fraction part with zeros if decimalPlaces was specified and fractionPart is too short (already handled by padStart above)
    // If decimalPlaces is 0, fractionPartStr should be empty
    if (options?.decimalPlaces === 0) {
        fractionPartStr = "";
    } else if (options?.decimalPlaces !== undefined && fractionPartStr.length < options.decimalPlaces) {
        // This case should be covered by padStart if tempScale was correctly set to options.decimalPlaces
        fractionPartStr = fractionPartStr.padEnd(options.decimalPlaces, '0');
    }


    // Apply thousands separator
    if (opt.thousandsSeparator && integerPartStr.length > 0) {
        if (integerPartStr !== "0") { 
            const sep = opt.thousandsSeparator;
            let separatedInteger = "";
            for (let i = 0; i < integerPartStr.length; i++) {
                if (i > 0 && (integerPartStr.length - i) % 3 === 0) {
                    separatedInteger += sep;
                }
                separatedInteger += integerPartStr[i];
            }
            integerPartStr = separatedInteger;
        }
    }

    let result = sign + integerPartStr;
    if (fractionPartStr.length > 0) {
      result += opt.decimalSeparator + fractionPartStr;
    } else if (options?.decimalPlaces !== undefined && options.decimalPlaces > 0) {
      result += opt.decimalSeparator + '0'.repeat(options.decimalPlaces);
    }

    return result;
  }
}

