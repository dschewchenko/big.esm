import { Big, createBig } from "../big"; // Adjusted path
import { addBig, mulBig } from "../index"; // Adjusted path, assuming addBig is also in index or specific path
import { compareBig } from "../operations/compare"; // Adjusted path

export function factorialBig(n: Big): Big {
    // Check if n is negative. Note: compareBig(n, createBig(0)) < 0 handles this.
    // The original check `n.value[0] < 0n && !n.isNegative` might be slightly different
    // if `isNegative` isn't solely determined by `value[0] < 0n` (e.g. for -0).
    // Using compareBig is safer.
    if (compareBig(n, createBig(0)) < 0) {
        throw new Error("Factorial is not defined for negative numbers.");
    }
    // Factorial of 0 or 1 is 1.
    if (compareBig(n, createBig(0)) === 0 || compareBig(n, createBig(1)) === 0) {
        return createBig(1);
    }
    let result = createBig(1);
    let current = createBig(1); // Start from 1 for multiplication
    const one = createBig(1);
    // Loop from 1 up to n
    while (compareBig(current, n) <= 0) {
        result = mulBig(result, current);
        current = addBig(current, one);
    }
    return result;
}
