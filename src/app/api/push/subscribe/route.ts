import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Push-Subscription registrieren
 * 
 * Speichert den FCM Token des Nutzers, damit wir ihm später
 * Push-Benachrichtigungen senden können.
 * 
 * In Produktion: Hier sollte der Token in einer Datenbank gespeichert werden
 * (z.B. Supabase), zusammen mit der user_id.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token fehlt oder ist ungültig" },
        { status: 400 }
      );
    }

    // TODO: Hier sollte der Token in einer Datenbank gespeichert werden
    // Beispiel mit Supabase:
    // const { data, error } = await supabase
    //   .from('push_subscriptions')
    //   .insert({ user_id: userId, token, created_at: new Date() });

    console.log("[API] Push-Subscription registriert:", token.substring(0, 20) + "...");

    return NextResponse.json({ success: true, message: "Push-Subscription registriert" });
  } catch (error) {
    console.error("[API] Fehler beim Registrieren der Push-Subscription:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
