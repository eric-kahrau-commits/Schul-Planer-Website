import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Push-Benachrichtigung senden
 * 
 * Sendet eine Push-Benachrichtigung an einen oder mehrere Nutzer.
 * 
 * WICHTIG: Diese Route sollte nur serverseitig aufgerufen werden!
 * In Produktion: Mit Authentication absichern!
 * 
 * Verwendung:
 * - Täglicher Scheduler (Cron Job) ruft diese Route auf
 * - Sendet Benachrichtigungen zu bestimmten Zeiten
 */

export async function POST(request: NextRequest) {
  try {
    // TODO: Authentication prüfen (nur Server-seitige Aufrufe erlauben)
    // const authHeader = request.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.API_SECRET_KEY}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await request.json();
    const { tokens, title, body: messageBody, url, tag } = body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return NextResponse.json(
        { error: "Tokens fehlen oder sind ungültig" },
        { status: 400 }
      );
    }

    if (!title || !messageBody) {
      return NextResponse.json(
        { error: "Title und Body sind erforderlich" },
        { status: 400 }
      );
    }

    // Firebase Admin SDK verwenden (nur serverseitig!)
    // TODO: Firebase Admin SDK installieren und konfigurieren
    // import admin from "firebase-admin";
    // 
    // const message = {
    //   notification: {
    //     title,
    //     body: messageBody,
    //   },
    //   data: {
    //     url: url || "/",
    //     tag: tag || "default",
    //   },
    //   tokens,
    // };
    //
    // const response = await admin.messaging().sendEachForMulticast(message);
    // console.log("[API] Push-Benachrichtigungen gesendet:", response.successCount);

    // Placeholder für jetzt
    console.log("[API] Push-Benachrichtigung würde gesendet werden:", {
      tokens: tokens.length,
      title,
      body: messageBody,
      url,
    });

    return NextResponse.json({
      success: true,
      message: "Push-Benachrichtigungen gesendet",
      // sent: response.successCount,
      // failed: response.failureCount,
    });
  } catch (error) {
    console.error("[API] Fehler beim Senden der Push-Benachrichtigung:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
