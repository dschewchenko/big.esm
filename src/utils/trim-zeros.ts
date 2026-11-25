// Finds the end of the fractional digits before trailing zeros.
export function fractionalEnd(value: string, start: number): number {
  let end = value.length;
  while (end > start && value.charCodeAt(end - 1) === 48) end--;
  return end;
}
