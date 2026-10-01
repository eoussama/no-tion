import { checkEquality } from "./check.util";



/**
 * @description
 * Checks if the provided password matches the one defined in the runtime config (`NUXT_PASSWORD`).
 *
 * @param password - The password to validate.
 * @returns `true` if the password is valid, `false` otherwise.
 * @throws Will throw an error if the password is not configured.
 */
export function isPasswordValid(password: string): boolean {
  const appPassword = useRuntimeConfig().password;

  // This shouldn't normally happen (validated at startup by `server/plugins/env.ts`)
  if (!appPassword) {
    throw new Error("Password is not defined");
  }

  return checkEquality(password, appPassword);
}
