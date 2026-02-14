import { NextResponse } from "next/server";

/**
 * Einfacher Health-Check (z. B. für Monitoring).
 * Schreibende API-Routen müssen:
 * - User-Authentifizierung prüfen (z. B. Supabase auth.getUser())
 * - Bei fehlendem User: 401 Unauthorized
 * - user_id NIEMALS aus dem Request-Body übernehmen, immer aus der Session
 */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
