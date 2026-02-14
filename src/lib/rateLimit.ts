/**
 * Einfaches In-Memory Rate Limiting
 * 
 * Für Produktion sollte ein Redis-basiertes System verwendet werden.
 * Dieses System ist für kleine bis mittlere Anwendungen ausreichend.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

/**
 * Prüft ob ein Request innerhalb der Rate-Limit-Grenzen liegt
 * @param identifier - Eindeutiger Identifier (z.B. IP-Adresse oder User-ID)
 * @param options - Rate Limit Optionen
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Bereinige alte Einträge (alle 5 Minuten)
  if (Math.random() < 0.01) {
    // 1% Chance bei jedem Request zu bereinigen
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!entry || entry.resetTime < now) {
    // Neuer oder abgelaufener Eintrag
    const resetTime = now + options.windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime,
    };
  }

  // Eintrag existiert und ist noch gültig
  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Erhöhe Counter
  entry.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Holt die IP-Adresse aus einem NextRequest
 */
export function getClientIP(request: Request): string {
  // Versuche verschiedene Header (für verschiedene Proxy-Setups)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback: localhost für lokale Entwicklung
  return "127.0.0.1";
}
