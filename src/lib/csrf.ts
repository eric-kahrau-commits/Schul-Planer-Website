/**
 * CSRF-Schutz für API-Routen
 * 
 * Generiert und validiert CSRF-Tokens für POST/PUT/DELETE Requests.
 */

import { randomBytes } from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || "change-me-in-production";

/**
 * Generiert einen CSRF-Token
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Validiert einen CSRF-Token
 */
export function validateCSRFToken(token: string, sessionToken?: string): boolean {
  if (!token || !sessionToken) {
    return false;
  }
  // Einfache Validierung - in Produktion sollte ein HMAC verwendet werden
  return token === sessionToken;
}

/**
 * Holt den CSRF-Token aus dem Request Header
 */
export function getCSRFTokenFromRequest(request: Request): string | null {
  return request.headers.get("x-csrf-token") || request.headers.get("csrf-token") || null;
}
