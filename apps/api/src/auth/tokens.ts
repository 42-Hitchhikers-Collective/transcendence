import crypto from "crypto";

// Phase 2 — Authentication
export function newRefreshToken(): string {
  return crypto.randomBytes(48).toString("base64url");
}

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function refreshExpiryDate(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

// Phase 3 — Security flows
export function newOneTimeToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function oneTimeExpiryDate(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}
