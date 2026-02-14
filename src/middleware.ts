import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware für alle Requests.
 * Hier kann später Rate Limiting ergänzt werden (z. B. für /api/auth/*,
 * Session abschließen, Coins vergeben, Tiere füttern).
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // API-Routen (später z. B. /api/auth/:path*, /api/sessions/:path*)
    "/api/:path*",
  ],
};
