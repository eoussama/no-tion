import { timingSafeEqual } from "crypto";



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