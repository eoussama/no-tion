import { env } from "node:process";
import { checkEquality } from "./check.util";



/**
 * @description
 * Checks if the provided password matches the one defined in the environment variable.
 *
 * @param password - The password to validate.
 * @returns `true` if the password is valid, `false` otherwise.
 * @throws Will throw an error if the password environment variable is not defined.
 */
export function isPasswordValid(password: string): boolean {
  const appPassword = env.NUXT_PASSWORD;

  // This shouldn't normally happen
  if (!appPassword) {
    throw Promise.reject(new Error("Password is not defined"));
  }

  return checkEquality(password, appPassword);
}
