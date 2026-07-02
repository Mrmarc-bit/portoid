import crypto from "crypto";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key-at-least-32-chars-long-magic-portfolio-portoid";

export interface SessionPayload {
  username: string;
  exp: number;
}

/**
 * Signs a payload into a secure HMAC-SHA256 JWT token.
 * Uses native Node.js crypto module.
 */
export function signSession(payload: Omit<SessionPayload, "exp">, expiresInMs = 24 * 60 * 60 * 1000): string {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Date.now() + expiresInMs;
  const fullPayload: SessionPayload = { ...payload, exp };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies the signature and expiration of an HMAC-SHA256 JWT token.
 */
export function verifySession(token: string): SessionPayload | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;

  try {
    // Re-calculate the expected signature
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null; // Signature mismatch
    }

    // Decode and parse payload
    const decodedPayloadStr = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(decodedPayloadStr);

    // Check expiration
    if (Date.now() > payload.exp) {
      return null; // Token expired
    }

    return payload;
  } catch (error) {
    console.error("verifySession failed:", error);
    return null;
  }
}

/**
 * Checks authentication for Next.js API Routes and Server Components.
 */
export function checkAdminAuth(req: NextRequest): SessionPayload | null {
  const sessionCookie = req.cookies.get("admin_session")?.value;
  if (!sessionCookie) return null;
  return verifySession(sessionCookie);
}
