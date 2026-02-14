import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Tägliche Push-Benachrichtigungen planen
 * 
 * Diese Route wird von einem Scheduler (Cron Job) aufgerufen,
 * um täglich Push-Benachrichtigungen zu senden.
 * 
 * Zeiten:
 * - Morgen (8:00): Streak-Erinnerung
 * - Abend (20:00): Lerneinheit erstellen
 * 
 * TODO: In Produktion mit einem echten Cron-Service verbinden
 * (z.B. Vercel Cron, GitHub Actions, oder externer Service)
 */

export async function POST(request: NextRequest) {
  try {
    // TODO: Authentication prüfen (nur Server-seitige Aufrufe erlauben)
    // const authHeader = request.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await request.json();
    const { time, type } = body; // time: "morning" | "evening"

    if (!time || !["morning", "evening"].includes(time)) {
      return NextResponse.json(
        { error: "Ungültige Zeitangabe" },
        { status: 400 }
      );
    }

    // TODO: Alle Push-Subscriptions aus der Datenbank laden
    // const { data: subscriptions } = await supabase
    //   .from('push_subscriptions')
    //   .select('token, user_id');
    //
    // const tokens = subscriptions.map(s => s.token);

    // TODO: Nachricht basierend auf Typ erstellen
    // const title = time === "morning" 
    //   ? "🌅 Guten Morgen!" 
    //   : "🌙 Guten Abend!";
    // const body = time === "morning"
    //   ? "Vergiss nicht, deine Serie heute zu erweitern!"
    //   : "Zeit, eine Lerneinheit für morgen zu erstellen!";
    // const url = time === "morning" ? "/" : "/planer?add=1";

    // TODO: Push-Benachrichtigungen senden
    // await fetch("/api/push/send", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${process.env.API_SECRET_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     tokens,
    //     title,
    //     body,
    //     url,
    //     tag: `daily-${time}`,
    //   }),
    // });

    console.log("[API] Push-Benachrichtigung geplant:", { time, type });

    return NextResponse.json({
      success: true,
      message: `Push-Benachrichtigung für ${time} geplant`,
    });
  } catch (error) {
    console.error("[API] Fehler beim Planen der Push-Benachrichtigung:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
