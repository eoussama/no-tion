import type { TToken } from "~~/core";

import { Buffer } from "node:buffer";
import { createHmac, randomBytes } from "node:crypto";
import { checkEquality } from "./check.util";
import { SESSION_TTL_SECONDS } from "./session.const";



function getExpirationTime(): number {
  const now = Math.floor(Date.now() / 1000);

  return now + SESSION_TTL_SECONDS;
}

function isTokenExpired(token: TToken): boolean {
  const now = Math.floor(Date.now() / 1000);

  return token.exp < now;
}

function createToken(): TToken {
  return {
    exp: getExpirationTime(),
    nonce: randomBytes(16).toString("hex"),
  };
}

function encodeToken(token: TToken): string {
  const payload = JSON.stringify(token);

  return Buffer.from(payload, "utf8").toString("base64url");
}

function decodeToken(encodedToken: string): TToken {
  const payload = Buffer.from(encodedToken, "base64url").toString("utf8");

  return JSON.parse(payload) as TToken;
}

/**
 * @description
 * Generates a signed token using HMAC with the secret key from the runtime config (`NUXT_SECRET`). The token includes an expiration time and a random nonce for added security.
 *
 * @returns A promise that resolves to the generated token string in the format "payload.signature".
 * @throws Will reject the promise if the secret key is not defined or if there is an error during token generation.
 */
export function generateToken(): Promise<string> {
  const secret = useRuntimeConfig().secret;

  // This shouldn't normally happen
  if (!secret) {
    return Promise.reject(new Error("Secret key is not defined"));
  }

  const token = createToken();
  const payload = encodeToken(token);
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");

  return Promise.resolve(`${payload}.${signature}`);
}

/**
 * @description
 * Verifies the provided token by checking its signature against the expected signature generated using the secret key. It also checks if the token has expired based on the expiration time included in the token payload.
 * Missing or malformed tokens (e.g. a stale or garbage cookie) are reported as invalid, not as errors.
 *
 * @param token - The token string to verify, expected in the format "payload.signature".
 * @returns A promise that resolves to `true` if the token is valid and not expired, or `false` otherwise.
 * @throws Will reject the promise if the secret key is not defined.
 */
export function verifyToken(token: string | undefined): Promise<boolean> {
  const secret = useRuntimeConfig().secret;

  // This shouldn't normally happen (validated at startup by `server/plugins/env.ts`)
  if (!secret) {
    return Promise.reject(new Error("Secret key is not defined"));
  }

  const [payload, signature] = (token ?? "").split(".");

  if (!payload || !signature) {
    return Promise.resolve(false);
  }

  const expectedSignature = createHmac("sha256", secret).update(payload).digest("base64url");

  if (!checkEquality(signature, expectedSignature)) {
    return Promise.resolve(false);
  }

  try {
    return Promise.resolve(!isTokenExpired(decodeToken(payload)));
  }
  catch {
    return Promise.resolve(false);
  }
}
