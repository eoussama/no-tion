import { Buffer } from "node:buffer";
import { timingSafeEqual } from "node:crypto";



/**
 * @description
 * Compares two strings in a way that is resistant to timing attacks.
 *
 * @param a - The first string to compare.
 * @param b - The second string to compare.
 * @returns `true` if the strings are equal, `false` otherwise.
 * @throws Will throw an error if the inputs are not of the same length.
 */
export function checkEquality(a: string, b: string): boolean {
  const bA = Buffer.from(a, "utf8");
  const bB = Buffer.from(b, "utf8");

  if (bA.length !== bB.length) {
    const dummy = Buffer.alloc(bB.length);

    timingSafeEqual(dummy, bB);

    return false;
  }

  return timingSafeEqual(bA, bB);
}
