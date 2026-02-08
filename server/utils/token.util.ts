import { createHmac, randomBytes } from "crypto";

import type { TToken } from "~~/core";



function getExporationTime(): number {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 60 * 60 * 2; // 2 hours
  const exp = now + expiresIn;
 
  return exp;
}

function createToken(): TToken {
  return {
    exp: getExporationTime(),
    nonce: randomBytes(16).toString("hex"),
  }
}

function encodeToken(token: TToken): string {
  const payload = JSON.stringify(token);
  return Buffer.from(payload, "utf8").toString("base64url");
}

export function generateToken(): Promise<string> {
  const secret = process.env.NUXT_SECRET;

  // This shouldn't normally happen
  if (!secret) return Promise.reject(new Error("Secret key is not defined"));

  const token = createToken();
  const payload = encodeToken(token);
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");

  return Promise.resolve(`${payload}.${signature}`);
}
