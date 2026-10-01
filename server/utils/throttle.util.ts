import type { H3Event } from "h3";



const WINDOW_MS = 5 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

type TAttempts = { count: number; resetAt: number };

const FAILED_ATTEMPTS = new Map<string, TAttempts>();

function getClientKey(event: H3Event): string {
  return getRequestIP(event) ?? "unknown";
}

function getAttempts(key: string): TAttempts | undefined {
  const attempts = FAILED_ATTEMPTS.get(key);

  if (attempts && attempts.resetAt <= Date.now()) {
    FAILED_ATTEMPTS.delete(key);

    return undefined;
  }

  return attempts;
}

/**
 * @description
 * Tiny in-memory login throttle: at most `MAX_FAILED_ATTEMPTS` failed attempts per client IP within `WINDOW_MS`.
 * State is per server process and resets on restart, which is enough for a single-user instance.
 *
 * @param event - The H3 event of the incoming request.
 * @throws A 429 error when the client exceeded the allowed number of failed attempts.
 */
export function assertLoginNotThrottled(event: H3Event): void {
  const attempts = getAttempts(getClientKey(event));

  if (attempts && attempts.count >= MAX_FAILED_ATTEMPTS) {
    const retryAfter = Math.ceil((attempts.resetAt - Date.now()) / 1000);

    setResponseHeader(event, "Retry-After", retryAfter);
    throw createError({ status: 429, message: "Too many failed login attempts, try again later", statusText: "Too Many Requests" });
  }
}

/**
 * @description
 * Records a failed login attempt for the client of the given request.
 *
 * @param event - The H3 event of the incoming request.
 */
export function recordFailedLogin(event: H3Event): void {
  const key = getClientKey(event);
  const attempts = getAttempts(key);

  if (attempts) {
    attempts.count++;

    return;
  }

  FAILED_ATTEMPTS.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
}

/**
 * @description
 * Clears the failed login attempts of the client of the given request (after a successful login).
 *
 * @param event - The H3 event of the incoming request.
 */
export function clearFailedLogins(event: H3Event): void {
  FAILED_ATTEMPTS.delete(getClientKey(event));
}
