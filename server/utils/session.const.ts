/**
 * @description
 * Name of the HTTP-only cookie holding the signed session token.
 */
export const SESSION_COOKIE = "session";

/**
 * @description
 * Session lifetime in seconds (2 hours). Used for both the token expiration and the cookie max age.
 */
export const SESSION_TTL_SECONDS = 60 * 60 * 2;
