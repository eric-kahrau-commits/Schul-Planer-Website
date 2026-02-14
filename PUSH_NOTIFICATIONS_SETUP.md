# Push-Benachrichtigungen Setup-Anleitung

## Was wurde implementiert

Ein vollständiges Push-Benachrichtigungssystem wurde erstellt, das:
- ✅ Push-Benachrichtigungen auf Mobilgeräten ermöglicht
- ✅ Service Worker für Hintergrund-Benachrichtigungen
- ✅ Firebase Cloud Messaging (FCM) Integration
- ✅ UI in den Einstellungen zum Aktivieren/Deaktivieren
- ✅ API Routes für Subscription Management
- ✅ Mehrsprachige Unterstützung (EN/DE/FR)

## Was du noch machen musst

### 1. Firebase-Projekt erstellen

1. Gehe zu https://console.firebase.google.com/
2. Klicke auf "Add Project" oder wähle ein bestehendes Projekt
3. Gehe zu **Project Settings** → **General** → **Your apps**
4. Klicke auf das **Web**-Icon (</>) um eine Web-App hinzuzufügen
5. Registriere die App (z.B. "StudyFlow")
6. Kopiere die **Firebase Config** (siehe unten)

### 2. Firebase Config eintragen

Öffne `.env.local` und füge folgende Variablen hinzu:

```env
# Firebase Config (aus Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=dein-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dein-projekt.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dein-projekt-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dein-projekt.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=deine-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=deine-app-id

# Firebase VAPID Key (siehe Schritt 3)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=dein-vapid-key
```

### 3. VAPID Key generieren

1. In Firebase Console: **Project Settings** → **Cloud Messaging**
2. Scrolle zu **Web Push certificates**
3. Falls noch kein Key vorhanden: Klicke auf **Generate key pair**
4. Kopiere den generierten **Key pair** (VAPID Key)
5. Trage ihn in `.env.local` als `NEXT_PUBLIC_FIREBASE_VAPID_KEY` ein

### 4. Service Worker aktualisieren

Öffne `public/firebase-messaging-sw.js` und ersetze die Platzhalter mit deinen echten Firebase-Werten:

```javascript
const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "dein-projekt.firebaseapp.com",
  projectId: "dein-projekt-id",
  storageBucket: "dein-projekt.appspot.com",
  messagingSenderId: "deine-sender-id",
  appId: "deine-app-id",
};
```

**ODER** besser: Verwende Environment Variables (siehe nächster Schritt)

### 5. Service Worker mit Environment Variables (Optional)

Für eine bessere Lösung kannst du den Service Worker dynamisch generieren:

1. Erstelle `public/firebase-messaging-sw.js` als Template
2. Erstelle `next.config.js` mit einem Script, das die Config zur Build-Zeit einsetzt
3. Oder verwende `publicRuntimeConfig` in Next.js

**Einfachere Lösung:** Trage die Werte direkt in `firebase-messaging-sw.js` ein (siehe Schritt 4)

### 6. Push-Benachrichtigungen senden

#### Option A: Manuell testen

Du kannst die API Route `/api/push/send` direkt aufrufen (nur für Tests):

```bash
curl -X POST http://localhost:3000/api/push/send \
  -H "Content-Type: application/json" \
  -d '{
    "tokens": ["dein-fcm-token"],
    "title": "Test",
    "body": "Test-Nachricht",
    "url": "/"
  }'
```

#### Option B: Täglicher Scheduler (Produktion)

Für echte tägliche Benachrichtigungen brauchst du einen Cron Job:

**Mit Vercel:**
1. Erstelle `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/push/schedule",
    "schedule": "0 8,20 * * *"
  }]
}
```

2. Setze `CRON_SECRET` in Vercel Environment Variables

**Mit externem Service:**
- GitHub Actions (kostenlos)
- EasyCron
- Cron-job.org
- Oder dein eigener Server mit Node-Cron

### 7. Datenbank-Integration (Optional, aber empfohlen)

Aktuell werden Push-Tokens nur im LocalStorage gespeichert. Für Produktion solltest du sie in einer Datenbank speichern:

**Mit Supabase:**
1. Erstelle Tabelle `push_subscriptions`:
```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_token ON push_subscriptions(token);
```

2. Aktualisiere `/api/push/subscribe` und `/api/push/unsubscribe` um die Datenbank zu verwenden

3. Aktualisiere `/api/push/schedule` um alle Tokens aus der DB zu laden

### 8. Firebase Admin SDK (Für Produktion)

Um Push-Benachrichtigungen zu senden, brauchst du das Firebase Admin SDK:

```bash
npm install firebase-admin
```

1. In Firebase Console: **Project Settings** → **Service Accounts**
2. Klicke auf **Generate new private key**
3. Speichere die JSON-Datei sicher (NICHT ins Git!)
4. Verwende sie im Server-Code:

```typescript
import admin from "firebase-admin";

const serviceAccount = require("./path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
```

5. Aktualisiere `/api/push/send` um `admin.messaging().sendEachForMulticast()` zu verwenden

## Testen

1. Starte die App: `npm run dev`
2. Gehe zu **Einstellungen**
3. Klicke auf **Push-Benachrichtigungen aktivieren**
4. Erlaube Benachrichtigungen im Browser
5. Teste mit der `/api/push/send` Route (siehe Schritt 6)

## Wichtige Hinweise

- **iOS Safari:** Push-Benachrichtigungen funktionieren nur, wenn die App als PWA installiert ist (Home Screen)
- **Android:** Funktioniert in Chrome/Firefox auch ohne Installation
- **HTTPS erforderlich:** Push-Benachrichtigungen funktionieren nur über HTTPS (oder localhost für Entwicklung)
- **Service Worker:** Muss im `public/` Ordner liegen und über HTTPS erreichbar sein

## Troubleshooting

- **"Service Worker konnte nicht registriert werden":** Prüfe, ob `firebase-messaging-sw.js` im `public/` Ordner liegt
- **"VAPID Key fehlt":** Stelle sicher, dass `NEXT_PUBLIC_FIREBASE_VAPID_KEY` in `.env.local` gesetzt ist
- **"Permission denied":** Nutzer muss Benachrichtigungen im Browser erlauben
- **Keine Benachrichtigungen:** Prüfe Browser-Konsole und Firebase Console → Cloud Messaging → Reports

## Nächste Schritte

Nach dem Setup kannst du:
1. Tägliche Benachrichtigungen automatisch senden (mit Cron Job)
2. Benachrichtigungen basierend auf Nutzer-Verhalten senden
3. Personalisierte Nachrichten mit Nutzernamen senden
4. Benachrichtigungen für geplante Sessions senden
