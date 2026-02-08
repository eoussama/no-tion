import { createHmac, randomBytes } from "crypto";

import { type TToken } from "~~/core";
import { checkEquality } from "./check.util";



function getExporationTime(): number {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 60 * 60 * 2; // 2 hours
  const exp = now + expiresIn;
 
  return exp;
}

function isTokenExpired(token: TToken): boolean {
  const now = Math.floor(Date.now() / 1000);
  return token.exp < now;
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

function decodeToken(encodedToken: string): TToken {
  const payload = Buffer.from(encodedToken, "base64url").toString("utf8");
  return JSON.parse(payload) as TToken;
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

export function verifyToken(token: string) {
  const secret = process.env.NUXT_SECRET;

  // This shouldn't normally happen
  if (!secret) return Promise.reject(new Error("Secret key is not defined"));

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return Promise.reject(new Error("Invalid token format"));
  }
  
  const expectedSignature = createHmac("sha256", secret).update(payload).digest("base64url");
  if (!checkEquality(signature, expectedSignature)) {
    return Promise.resolve(false);
  }
  
  const decodedToken = decodeToken(payload);
  if (isTokenExpired(decodedToken)) {
    return Promise.resolve(false);
  }

  return Promise.resolve(true);
}
