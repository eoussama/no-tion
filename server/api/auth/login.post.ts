import { SLoginForm, tryCatch } from "~~/core";
import { assertLoginNotThrottled, clearFailedLogins, generateToken, isPasswordValid, recordFailedLogin, SESSION_COOKIE, SESSION_TTL_SECONDS, verifyToken } from "~~/server/utils";



/**
 * @description
 * Authentication with signed HTTP cookie using HMAC.
 * An existing valid session short-circuits the login; a stale or invalid one is overwritten.
 */
export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, SESSION_COOKIE);

  if (cookie) {
    const [, isLoggedIn] = await tryCatch(() => verifyToken(cookie));

    if (isLoggedIn) {
      return createResponse(event, true, { message: "Already logged in" });
    }
  }

  assertLoginNotThrottled(event);

  const body = await readValidatedBody(event, SLoginForm.safeParse);

  if (!body.success) {
    throw createError({ status: 400, message: body.error.issues[0]?.message ?? "Invalid request body", statusText: "Bad Request" });
  }

  const [passwordErr, isValid] = await tryCatch(async () => isPasswordValid(body.data.password));

  if (passwordErr) {
    throw createError({ status: 500, message: "Failed to check password", statusText: "Internal Server Error" });
  }

  if (!isValid) {
    recordFailedLogin(event);
    throw createError({ status: 401, message: "Invalid password", statusText: "Unauthorized" });
  }

  const [err, token] = await tryCatch(async () => generateToken());

  if (err) {
    throw createError({ status: 500, message: "Failed to generate token", statusText: "Internal Server Error" });
  }

  clearFailedLogins(event);

  setCookie(event, SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    secure: !import.meta.dev,
  });

  return createResponse(event, true, { message: "Login successful" });
});
