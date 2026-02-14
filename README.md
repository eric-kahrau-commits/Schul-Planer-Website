# StudyFlow – Intelligente Lernplanung

Web-App für strukturierte Schultage: Zeitplanung, Fächer, Themen und Fortschritt.

## Features

- **Dashboard** – Begrüßung, heutige Lernsessions, Fortschrittsbalken, „Lerneinheit hinzufügen“
- **Tagesplaner** – Visuelle Tagesansicht mit Fach, Thema, Dauer, Lernart, Ziel, Priorität; Einheiten abhaken, bearbeiten, löschen
- **Fächer & Themen** – Fächer mit Farbe anlegen; Themen mit Schwierigkeit und Prüfungsrelevanz
- **Wochenübersicht** – Lernzeit pro Tag und pro Fach; Überlastungshinweise; Vorschläge für leere Tage
- **Fortschritt** – Lernzeit diese Woche, erledigte Sessions, Lernstreak, meistgelerntes Fach

## Technik

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Anmeldung:** Supabase Auth (Google + E-Mail/Passwort-Registrierung)
- **Nutzer:** werden in der Supabase-Datenbank (Tabelle `profiles`) gespeichert
- **App-Daten** (Fächer, Themen, Lernsessions): pro Nutzer im Browser (localStorage)

## Einrichtung (Anmeldung & Datenbank)

1. **Supabase-Projekt** unter [supabase.com](https://supabase.com) anlegen.
2. **Umgebungsvariablen:** Datei `.env.local` anlegen (siehe `.env.local.example`):
   - `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` aus dem Supabase-Dashboard (Settings → API) eintragen.
3. **Datenbank:** Im Supabase Dashboard → SQL Editor den Inhalt von `supabase/schema.sql` ausführen (erstellt die Tabelle `profiles` und RLS).
4. **Google-Anmeldung (optional):** Supabase Dashboard → Authentication → Providers → Google aktivieren und Client-ID/Secret eintragen (Google Cloud Console).

Ohne Supabase-Konfiguration zeigt die App eine Hinweisbox zur Einrichtung.

## Start

```bash
npm install
npm run dev
```

Dann im Browser [http://localhost:3000](http://localhost:3000) öffnen. Beim ersten Aufruf erscheint das **Anmelde-Fenster**: Mit Google anmelden oder neu registrieren (E-Mail + Passwort). Danach wird die App pro Nutzer mit eigenen Daten angezeigt; Abmelden über das Nutzer-Menü oben rechts.

## Nutzung

1. **Anmelden** oder **Registrieren** (beim ersten Besuch).
2. Unter **Fächer & Themen** Fächer (z. B. Mathe, Bio) und optional Themen anlegen.
3. Im **Tagesplaner** oder auf dem **Dashboard** Lerneinheiten hinzufügen (Fach, Thema, Uhrzeit, Dauer, Lernart, Ziel, Priorität).
4. Einheiten als erledigt abhaken; **Wochenübersicht** und **Fortschritt** zeigen Statistiken und Streak.
5. **Abmelden** über den Namen oben rechts → „Abmelden“.
