# API-Routen – Sicherheitsregeln

- **Jede POST/PUT/DELETE Route** muss vor dem Speichern prüfen, ob ein User eingeloggt ist (z. B. Supabase `auth.getUser()`).
- Kein User → Antwort **401 Unauthorized**.
- Beim Speichern immer `user_id` aus der Session setzen, **niemals** aus dem Frontend/Body übernehmen.
- Später: Rate Limiting in `src/middleware.ts` ergänzen (besonders für Login, Session abschließen, Coins, Tiere füttern).
- Fehler: Keine technischen Details an den Client; nur generische Meldung ("Ein Fehler ist aufgetreten"), Details nur im Server-Log.
