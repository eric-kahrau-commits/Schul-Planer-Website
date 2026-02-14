import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Push-Subscription entfernen
 * 
 * Entfernt den FCM Token aus der Datenbank, damit keine
 * weiteren Benachrichtigungen gesendet werden.
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

    // TODO: Hier sollte der Token aus der Datenbank entfernt werden
    // Beispiel mit Supabase:
    // const { error } = await supabase
    //   .from('push_subscriptions')
    //   .delete()
    //   .eq('token', token);

    console.log("[API] Push-Subscription entfernt:", token.substring(0, 20) + "...");

    return NextResponse.json({ success: true, message: "Push-Subscription entfernt" });
  } catch (error) {
    console.error("[API] Fehler beim Entfernen der Push-Subscription:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
