import { checkEquality } from "./check.util";



export function isPasswordValid(password: string): boolean {
  const appPassword = process.env.NUXT_PASSWORD;
  
  // This shouldn't normally happen
  if (!appPassword) throw Promise.reject(new Error("Password is not defined"));

  return checkEquality(password, appPassword);  
}
