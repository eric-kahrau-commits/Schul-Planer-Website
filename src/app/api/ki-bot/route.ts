import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

/**
 * API Route: KI‑Bot
 *
 * Diese Route spricht mit einer externen KI‑API (z. B. OpenAI‑kompatibel)
 * und gibt eine strukturierte Antwort an das Frontend zurück.
 *
 * Erwartetes Environment (siehe `.env.local`):
 * - AI_API_URL   – z. B. https://api.openai.com/v1/chat/completions
 * - AI_API_KEY   – geheimer API‑Key
 * - AI_API_MODEL – Modellname, z. B. gpt-4o-mini
 */

const AI_API_URL = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
const AI_API_KEY = process.env.AI_API_KEY;
const AI_API_MODEL = process.env.AI_API_MODEL || "gpt-4o-mini";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// Rate Limiting: 20 Requests pro 60 Sekunden pro IP
const RATE_LIMIT_OPTIONS = {
  maxRequests: 20,
  windowMs: 60 * 1000, // 60 Sekunden
};

// Input Limits
const MAX_MESSAGE_LENGTH = 2000; // Zeichen
const MAX_HISTORY_LENGTH = 20; // Nachrichten
const MAX_HISTORY_MESSAGE_LENGTH = 1000; // Zeichen pro Nachricht

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface KiBotRequestBody {
  message: string;
  language?: "de" | "en" | "fr";
  history?: ChatMessage[];
  context?: {
    subjects?: Array<{ id: string; name: string; color: string }>;
    topics?: Array<{ id: string; name: string; subjectId: string; difficulty: string }>;
  };
  mode?: "subject" | "weekly_plan"; // Modus: "subject" = nur Fächer/Themen/Sessions, "weekly_plan" = nur Wochenpläne
}

export async function POST(req: NextRequest) {
  // Rate Limiting
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(`ki-bot:${clientIP}`, RATE_LIMIT_OPTIONS);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte warte einen Moment." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(RATE_LIMIT_OPTIONS.maxRequests),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.resetTime),
        },
      }
    );
  }

  if (!AI_API_KEY) {
    return NextResponse.json(
      {
        error: "Service nicht verfügbar.",
      },
      { status: 500 }
    );
  }

  try {
    // Request-Size-Check (zusätzlich zu next.config.js)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      // 1MB Limit
      return NextResponse.json(
        { error: "Anfrage zu groß." },
        { status: 413 }
      );
    }

    const body: KiBotRequestBody = await req.json();
    const { message, history = [], language = "de", context, mode } = body;

    // Input-Validierung
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Ungültige Anfrage." },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Nachricht zu lang (max. ${MAX_MESSAGE_LENGTH} Zeichen).` },
        { status: 400 }
      );
    }

    if (!Array.isArray(history)) {
      return NextResponse.json(
        { error: "Ungültige Anfrage." },
        { status: 400 }
      );
    }

    if (history.length > MAX_HISTORY_LENGTH) {
      return NextResponse.json(
        { error: `Zu viele Nachrichten in der Historie (max. ${MAX_HISTORY_LENGTH}).` },
        { status: 400 }
      );
    }

    // Validiere und begrenze History-Nachrichten
    const validatedHistory = history
      .slice(0, MAX_HISTORY_LENGTH)
      .filter((msg) => {
        return (
          msg &&
          typeof msg === "object" &&
          typeof msg.role === "string" &&
          typeof msg.content === "string" &&
          ["user", "assistant", "system"].includes(msg.role) &&
          msg.content.length <= MAX_HISTORY_MESSAGE_LENGTH
        );
      })
      .map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content.substring(0, MAX_HISTORY_MESSAGE_LENGTH),
      }));

    // Validiere Language
    const validLanguage = ["de", "en", "fr"].includes(language) ? language : "de";

    // Erstelle Context-String für den Bot
    const contextInfo = context?.subjects && context.subjects.length > 0
      ? `\n\nAKTUELLE FÄCHER DES NUTZERS:\n${context.subjects.map(s => `- ${s.name}`).join("\n")}`
      : "";

    // Modus-spezifische Einschränkungen
    const modeRestriction = mode === "subject"
      ? `\n\nWICHTIG - MODUS-EINSCHRÄNKUNG:\nDu bist im Modus "Fach/Thema/Session erstellen". Du kannst NUR folgende Actions verwenden:\n- "add_subject" (Fach erstellen)\n- "add_topic" (Thema erstellen)\n- "add_session" (Lerneinheit/Kalendereintrag erstellen)\n\nWenn der Nutzer nach einem Wochenplan fragt oder andere Funktionen möchte, antworte freundlich, dass diese Funktion hier nicht verfügbar ist und verweise auf die Wochenplan-Erstellung.`
      : mode === "weekly_plan"
      ? `\n\nWICHTIG - MODUS-EINSCHRÄNKUNG:\nDu bist im Modus "Wochenplan erstellen". Du kannst NUR die Action "create_weekly_plan" verwenden.\n\nWenn der Nutzer nach einzelnen Fächern, Themen oder Sessions fragt, antworte freundlich, dass diese Funktion hier nicht verfügbar ist und verweise auf die Fach-Erstellung.`
      : "";

    const systemPrompt = `Du bist der KI‑Lernassistent "StudyFlow". Du hilfst Schülerinnen und Schülern dabei,
ihren Lernalltag zu organisieren (Fächer, Themen, Lernplan, Kalender).${contextInfo}${modeRestriction}

WICHTIG – AUSGABEFORMAT:
Du MUSST IMMER eine gültige JSON‑Antwort im folgenden Format liefern – ohne zusätzlichen Text:
{
  "reply": "Deine Antwort an den Nutzer (Markdown erlaubt, gleiche Sprache wie der Nutzer).",
  "actions": [
    // optional, leeres Array wenn keine Aktionen nötig sind
    {
      "type": "add_subject",
      "subject": {
        "name": "Mathe",
        "color": "#88d4ab"
      }
    },
    {
      "type": "add_topic",
      "topic": {
        "subjectName": "Mathe",
        "name": "Lineare Funktionen",
        "difficulty": "mittel"
      }
    },
    {
      "type": "add_session",
      "session": {
        "date": "2025-05-20",
        "startTime": "16:00",
        "durationMinutes": 45,
        "subjectName": "Mathe",
        "topicName": "Lineare Funktionen",
        "priority": "mittel",
        "type": "Neues Thema",
        "goal": "Lineare Funktionen verstehen"
      }
    },
    {
      "type": "create_weekly_plan",
      "weeklyPlan": {
        "sessions": [
          {
            "date": "2025-01-20",
            "startTime": "16:00",
            "durationMinutes": 60,
            "subjectName": "Mathe",
            "topicName": "Lineare Funktionen",
            "priority": "mittel",
            "type": "Neues Thema",
            "goal": "Lineare Funktionen verstehen"
          },
          {
            "date": "2025-01-21",
            "startTime": "14:00",
            "durationMinutes": 45,
            "subjectName": "Englisch",
            "priority": "mittel",
            "type": "Wiederholen",
            "goal": "Vokabeln wiederholen"
          }
        ]
      }
    }
  ]
}

ERKLÄRUNG DER FELDER:
- "reply": immer eine verständliche Erklärung / Antwort für den Menschen.
- "actions": nutze diese NUR, wenn der Nutzer wirklich neue Dinge anlegen möchte.
  - type = "add_subject" | "add_topic" | "add_session" | "create_weekly_plan"
  - "difficulty" kann deutsch ("leicht", "mittel", "schwer") ODER englisch ("easy", "medium", "hard") sein.
  - "priority" kann deutsch ("niedrig", "mittel", "hoch") ODER englisch ("low", "medium", "high") sein.
  - "type" für Lerneinheiten:
      deutsch: "Wiederholen", "Neues Thema", "Aufgaben üben", "Prüfungsvorbereitung"
      englisch: "review", "new topic", "practice", "exam prep"
  - "date" Format: YYYY-MM-DD (z. B. "2025-05-20" oder "2025-01-05" - IMMER mit führenden Nullen!)
  - "startTime" Format: HH:mm (24-Stunden, z. B. "16:00" oder "09:00" - IMMER mit führenden Nullen!)
  - "durationMinutes": Zahl in Minuten (z. B. 45, muss zwischen 5 und 300 sein)

WICHTIG – WOCHENPLAN ERKENNEN:
- Wenn der Nutzer "Wochenplan", "Woche planen", "Wochenplanung" oder ähnliches sagt, ERSTELLE eine "create_weekly_plan" Action!
- Ein Wochenplan sollte 5-7 Sessions enthalten (eine Woche).
- Verteile die Sessions über die Woche (Mo-So).
- Nutze die vorhandenen Fächer des Nutzers (siehe oben).
- Erstelle einen ausgewogenen Plan mit verschiedenen Fächern und Themen.
- Berücksichtige unterschiedliche Schwierigkeitsgrade und Prioritäten.

REGELN:
- Wenn der Nutzer nur eine Frage stellt, antworte freundlich und sinnvoll und setze "actions": [].
- Wenn der Nutzer um konkrete Planung bittet ("Plane Mathe für morgen 16 Uhr für 45 Minuten"),
  dann ERZEUGE eine passende "add_session"‑Action.
- Wenn der Nutzer einen WOCHENPLAN möchte, ERZEUGE eine "create_weekly_plan" Action mit mehreren Sessions!
- Wenn ein Fach oder Thema noch nicht existiert (du kennst den echten Zustand nicht),
  kannst du es einfach als neue Action "add_subject" / "add_topic" vorschlagen.
- Sprich in der Sprache des Nutzers (${language}).
- Wenn der Nutzer "morgen" sagt, berechne das Datum im Format YYYY-MM-DD (z. B. wenn heute 2025-01-15 ist, dann morgen = "2025-01-16").
- Wenn der Nutzer "heute" sagt, verwende das heutige Datum im Format YYYY-MM-DD.
- Wenn der Nutzer "diese Woche" sagt, beginne mit dem nächsten Montag und plane bis Sonntag.
- WICHTIG: Verwende IMMER führende Nullen bei Datum und Zeit (z. B. "2025-01-05" nicht "2025-1-5", "09:00" nicht "9:00").
- Wenn der Nutzer eine Zeit wie "9 Uhr" oder "9:00" sagt, formatiere sie als "09:00" (mit führender Null).`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...validatedHistory,
      { role: "user", content: message },
    ];

    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_API_MODEL,
        messages,
        temperature: 0.35,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      if (IS_DEVELOPMENT) {
        console.error("[KI-Bot] API Fehler:", response.status, text);
      }
      return NextResponse.json(
        { error: "Service vorübergehend nicht verfügbar." },
        { status: 502 }
      );
    }

    const data = await response.json();

    // OpenAI‑kompatibel: Antwort liegt unter choices[0].message.content
    const rawContent =
      (data as any)?.choices?.[0]?.message?.content ?? JSON.stringify(data);

    if (IS_DEVELOPMENT) {
      console.log("[KI-Bot API] Extrahierter Content:", rawContent.substring(0, 200));
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err) {
      if (IS_DEVELOPMENT) {
        console.error("[KI-Bot] Konnte KI‑Antwort nicht als JSON parsen:", err);
        console.error("[KI-Bot] Rohe Antwort:", rawContent.substring(0, 500));
      }
      return NextResponse.json(
        { error: "Ungültige Antwort vom Service." },
        { status: 500 }
      );
    }

    // Validiere, dass parsed.reply existiert
    if (!parsed.reply || typeof parsed.reply !== "string") {
      if (IS_DEVELOPMENT) {
        console.error("[KI-Bot] Antwort enthält kein 'reply' Feld:", parsed);
      }
      return NextResponse.json(
        { error: "Ungültige Antwort vom Service." },
        { status: 500 }
      );
    }

    // Validiere actions Array falls vorhanden
    if (parsed.actions && !Array.isArray(parsed.actions)) {
      parsed.actions = [];
    }

    if (IS_DEVELOPMENT) {
      console.log("[KI-Bot API] Antwort erfolgreich verarbeitet");
    }

    return NextResponse.json(parsed, {
      headers: {
        "X-RateLimit-Limit": String(RATE_LIMIT_OPTIONS.maxRequests),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetTime),
      },
    });
  } catch (err) {
    if (IS_DEVELOPMENT) {
      console.error("[KI-Bot] Unerwarteter Fehler:", err);
    }
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    );
  }
}
