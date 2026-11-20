export function trimZeros(value: string): string {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 48) end--;
  return end === value.length ? value : value.slice(0, end);
}
