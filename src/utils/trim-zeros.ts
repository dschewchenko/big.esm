const TRIM_ZEROS_REGEX = /0+$/;

export const trimZeros = (value: string): string => value.replace(TRIM_ZEROS_REGEX, "");
