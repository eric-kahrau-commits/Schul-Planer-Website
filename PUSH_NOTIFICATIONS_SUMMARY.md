# Push-Benachrichtigungen - Zusammenfassung

## Was wurde implementiert

Ich habe ein vollständiges **Push-Benachrichtigungssystem** für deine StudyFlow-App erstellt. Das System ermöglicht es, Benachrichtigungen auf Mobilgeräten zu senden, auch wenn die App geschlossen ist.

### ✅ Implementierte Features

1. **Firebase Cloud Messaging (FCM) Integration**
   - Firebase SDK Integration im Frontend
   - Service Worker für Hintergrund-Benachrichtigungen
   - Push-Token Management

2. **UI-Komponenten**
   - Neue Sektion in den Einstellungen für Push-Benachrichtigungen
   - Aktivieren/Deaktivieren-Button
   - Status-Anzeige (aktiviert/deaktiviert/nicht unterstützt)
   - Fehlerbehandlung und Benutzer-Feedback

3. **API Routes**
   - `/api/push/subscribe` - Registriert Push-Subscription
   - `/api/push/unsubscribe` - Entfernt Push-Subscription
   - `/api/push/send` - Sendet Push-Benachrichtigungen
   - `/api/push/schedule` - Plant tägliche Benachrichtigungen

4. **Service Worker**
   - `public/firebase-messaging-sw.js` - Empfängt Push-Nachrichten im Hintergrund
   - Öffnet die App beim Klicken auf Benachrichtigungen
   - Navigiert zu den richtigen Seiten (z.B. `/planer?add=1`)

5. **Mehrsprachige Unterstützung**
   - Alle Texte in EN/DE/FR übersetzt
   - Motivationsnachrichten für Morgen und Abend

### 📁 Neue Dateien

- `src/lib/firebase.ts` - Firebase Configuration und FCM Functions
- `src/lib/pushNotifications.ts` - Push-Subscription Management
- `src/components/PushNotificationManager.tsx` - React Hook und Manager Component
- `public/firebase-messaging-sw.js` - Service Worker für Push-Benachrichtigungen
- `src/app/api/push/subscribe/route.ts` - API Route für Subscription
- `src/app/api/push/unsubscribe/route.ts` - API Route für Unsubscription
- `src/app/api/push/send/route.ts` - API Route zum Senden
- `src/app/api/push/schedule/route.ts` - API Route für tägliche Benachrichtigungen
- `PUSH_NOTIFICATIONS_SETUP.md` - Detaillierte Setup-Anleitung

### 🔧 Geänderte Dateien

- `src/app/einstellungen/page.tsx` - Push-Benachrichtigungen UI hinzugefügt
- `src/components/AppShell.tsx` - PushNotificationManager eingebunden
- `src/lib/i18n.ts` - Übersetzungen für Push-Benachrichtigungen hinzugefügt
- `package.json` - Firebase SDK als Dependency hinzugefügt

## Was du jetzt machen musst

### Schritt 1: Firebase-Projekt erstellen

1. Gehe zu https://console.firebase.google.com/
2. Erstelle ein neues Projekt (oder wähle ein bestehendes)
3. Füge eine Web-App hinzu (Project Settings → General → Your apps → Web)

### Schritt 2: Firebase Config eintragen

Öffne `.env.local` und füge hinzu:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=dein-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dein-projekt-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=deine-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=deine-app-id
```

### Schritt 3: VAPID Key generieren

1. In Firebase Console: **Project Settings** → **Cloud Messaging**
2. Scrolle zu **Web Push certificates**
3. Klicke auf **Generate key pair**
4. Kopiere den Key und füge ihn in `.env.local` ein:

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=dein-vapid-key
```

### Schritt 4: Service Worker aktualisieren

Öffne `public/firebase-messaging-sw.js` und ersetze die Platzhalter mit deinen echten Firebase-Werten (aus Schritt 2).

### Schritt 5: Dependencies installieren

```bash
npm install
```

### Schritt 6: Testen

1. Starte die App: `npm run dev`
2. Gehe zu **Einstellungen**
3. Klicke auf **Push-Benachrichtigungen aktivieren**
4. Erlaube Benachrichtigungen im Browser
5. Teste mit der `/api/push/send` Route (siehe `PUSH_NOTIFICATIONS_SETUP.md`)

## Wie es funktioniert

### Benachrichtigungen aktivieren

1. Nutzer klickt auf "Push-Benachrichtigungen aktivieren" in den Einstellungen
2. Browser fragt nach Permission (Notification.requestPermission)
3. Service Worker wird registriert (`firebase-messaging-sw.js`)
4. FCM Token wird angefordert und an den Server gesendet
5. Token wird im LocalStorage gespeichert

### Benachrichtigungen senden

**Morgen (8:00):**
- Titel: "🌅 Guten Morgen!"
- Nachricht: "Vergiss nicht, deine Serie heute zu erweitern!"
- Link: `/` (Startseite)

**Abend (20:00):**
- Titel: "🌙 Guten Abend!"
- Nachricht: "Zeit, eine Lerneinheit für morgen zu erstellen!"
- Link: `/planer?add=1` (Planer mit geöffnetem Formular)

### Beim Klicken auf Benachrichtigung

1. Service Worker empfängt den Click-Event
2. App wird geöffnet (oder fokussiert, wenn bereits offen)
3. Navigiert zur URL aus der Benachrichtigung (z.B. `/planer?add=1`)

## Tägliche Benachrichtigungen einrichten

Für automatische tägliche Benachrichtigungen brauchst du einen **Cron Job**:

### Option 1: Vercel Cron (wenn auf Vercel gehostet)

Erstelle `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/push/schedule",
    "schedule": "0 8,20 * * *"
  }]
}
```

### Option 2: Externer Cron Service

- GitHub Actions (kostenlos)
- EasyCron
- Cron-job.org

Der Cron Job ruft `/api/push/schedule` auf mit:
```json
{
  "time": "morning", // oder "evening"
  "type": "streak" // oder "create_session"
}
```

## Wichtige Hinweise

- **iOS Safari:** Push-Benachrichtigungen funktionieren nur, wenn die App als PWA installiert ist
- **HTTPS erforderlich:** Push-Benachrichtigungen funktionieren nur über HTTPS (oder localhost)
- **Service Worker:** Muss im `public/` Ordner liegen
- **Firebase Admin SDK:** Für Produktion benötigst du das Admin SDK zum Senden (siehe `PUSH_NOTIFICATIONS_SETUP.md`)

## Nächste Schritte

1. ✅ Firebase-Projekt erstellen und Config eintragen
2. ✅ VAPID Key generieren
3. ✅ Service Worker aktualisieren
4. ✅ Testen
5. ⏭️ Cron Job einrichten für tägliche Benachrichtigungen
6. ⏭️ Firebase Admin SDK für Produktion einrichten
7. ⏭️ Tokens in Datenbank speichern (optional, aber empfohlen)

## Detaillierte Anleitung

Siehe `PUSH_NOTIFICATIONS_SETUP.md` für eine vollständige Schritt-für-Schritt-Anleitung mit allen Details.
