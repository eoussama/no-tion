import { tryCatch } from "~~/core";
import { generateToken, isPasswordValid } from "~~/server/utils";



/**
 * @description
 * Authentication with signed HTTP cookie using HMAC.
 */
export default defineEventHandler(async event => {
  const { password } = await readBody(event);
  const cookie = getCookie(event, "session");
  
  if (cookie) {
    throw createError({ status: 403, message: "User already logged-in", statusText: "Forbidden" });
  }

  const [passwordErr, isValid] = await tryCatch(async () => isPasswordValid(password));
  if (passwordErr) {
    throw createError({ status: 501, message: "Failed to check password", statusText: "Internal Server Error" });
  }

  if (!isValid) {
    throw createError({ status: 401, message: "Invalid password", statusText: "Unauthorized" });
  }
  
  const [err, token] = await tryCatch(async () => generateToken());
  if (err) {
    throw createError({ status: 501, message: "Failed to generate token", statusText: "Internal Server Error" });
  }
  
  setCookie(event, "session", token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 2, // 2 hours
    secure: process.env.NODE_ENV === "production",
  });
  
  return createResponse(event, true, { message: "Login successful" });
});
