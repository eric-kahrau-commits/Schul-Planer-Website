# 📱 App auf Smartphone nutzen - Anleitung

Es gibt mehrere Möglichkeiten, die App auf deinem Smartphone zu nutzen:

## 🚀 Option 1: Online deployen (Empfohlen - für dauerhaften Zugriff)

### Mit Vercel (Kostenlos & Einfach)

**Schritt 1: Vercel Account erstellen**
1. Gehe zu [vercel.com](https://vercel.com)
2. Erstelle einen kostenlosen Account (mit GitHub, GitLab oder Email)

**Schritt 2: Projekt hochladen**
1. Installiere Vercel CLI (optional, oder nutze die Web-Oberfläche):
   ```bash
   npm i -g vercel
   ```

2. Im Projekt-Verzeichnis:
   ```bash
   vercel login
   vercel
   ```

3. Oder über die Web-Oberfläche:
   - Gehe zu [vercel.com/new](https://vercel.com/new)
   - Verbinde dein GitHub-Repository (falls vorhanden)
   - Oder ziehe den Projekt-Ordner per Drag & Drop hoch

**Schritt 3: Umgebungsvariablen setzen**
- In Vercel Dashboard → Projekt → Settings → Environment Variables
- Füge hinzu:
  - `AI_API_URL` (z.B. `https://api.openai.com/v1/chat/completions`)
  - `AI_API_KEY` (dein API-Key)
  - `AI_API_MODEL` (z.B. `gpt-4o-mini`)

**Schritt 4: App auf Smartphone öffnen**
- Nach dem Deployment bekommst du eine URL (z.B. `https://deine-app.vercel.app`)
- Öffne diese URL auf deinem Smartphone im Browser
- Browser zeigt "Zum Startbildschirm hinzufügen" an
- App wird wie eine native App installiert!

---

## 🏠 Option 2: Lokaler Zugriff (Für Entwicklung/Testen)

### Auf demselben WLAN

**Schritt 1: Lokale IP-Adresse finden**

**Windows:**
```bash
ipconfig
```
Suche nach "IPv4-Adresse" (z.B. `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```
Oder:
```bash
ip addr show
```

**Schritt 2: App starten**
```bash
npm run dev
```

**Schritt 3: Externen Zugriff aktivieren**
Next.js muss auf allen Netzwerk-Interfaces lauschen:

```bash
npm run dev -- -H 0.0.0.0
```

Oder ändere `package.json`:
```json
"scripts": {
  "dev": "next dev -H 0.0.0.0"
}
```

**Schritt 4: Auf Smartphone öffnen**
- Öffne Browser auf Smartphone
- Gehe zu: `http://DEINE-IP-ADRESSE:3000`
- Beispiel: `http://192.168.1.100:3000`

**⚠️ Wichtig:** 
- Beide Geräte müssen im **selben WLAN** sein
- Firewall muss Port 3000 erlauben
- Für PWA-Installation brauchst du HTTPS (Option 1 ist besser)

---

## 📦 Option 3: Build für Produktion (Lokaler Server)

**Schritt 1: App bauen**
```bash
npm run build
npm start
```

**Schritt 2: Auf Port 3000 zugreifen**
- Wie bei Option 2, aber mit `npm start` statt `npm run dev`

---

## 🔒 Option 4: HTTPS für lokalen Zugriff (Erweitert)

Für PWA-Funktionen brauchst du HTTPS. Optionen:

### Mit ngrok (Einfach)
```bash
# Installiere ngrok
npm install -g ngrok

# Starte deine App
npm run dev

# In neuem Terminal
ngrok http 3000
```
- ngrok gibt dir eine HTTPS-URL
- Diese auf Smartphone öffnen

### Mit mkcert (Lokales Zertifikat)
```bash
# Installiere mkcert
brew install mkcert  # Mac
# oder: choco install mkcert  # Windows

# Erstelle lokales Zertifikat
mkcert -install
mkcert localhost 192.168.1.100

# Starte Next.js mit HTTPS
# (erfordert zusätzliche Konfiguration)
```

---

## ✅ PWA auf Smartphone installieren

Nachdem die App geöffnet ist:

**Android (Chrome):**
1. Öffne Menü (3 Punkte oben rechts)
2. Wähle "Zum Startbildschirm hinzufügen" oder "App installieren"
3. Bestätige

**iPhone (Safari):**
1. Tippe auf Teilen-Button (Quadrat mit Pfeil)
2. Wähle "Zum Home-Bildschirm"
3. Bestätige

**Nach Installation:**
- App erscheint wie eine native App
- Funktioniert offline (dank Service Worker)
- Push-Benachrichtigungen funktionieren

---

## 🎯 Empfehlung

**Für dauerhaften Zugriff:** Option 1 (Vercel) - kostenlos, einfach, HTTPS automatisch

**Für schnelles Testen:** Option 2 (Lokales WLAN) - schnell, aber nur im selben Netzwerk

---

## 🐛 Troubleshooting

**App lädt nicht auf Smartphone:**
- Prüfe, ob beide Geräte im selben WLAN sind
- Prüfe Firewall-Einstellungen
- Versuche IP-Adresse statt localhost

**PWA installiert sich nicht:**
- HTTPS ist erforderlich (nutze Vercel oder ngrok)
- Prüfe, ob `manifest.json` und Service Worker vorhanden sind

**Push-Benachrichtigungen funktionieren nicht:**
- HTTPS ist erforderlich
- Firebase-Konfiguration prüfen

---

## 📝 Nächste Schritte nach Deployment

1. **Domain hinzufügen** (optional):
   - In Vercel: Settings → Domains
   - Eigene Domain verbinden

2. **Umgebungsvariablen prüfen**:
   - Stelle sicher, dass alle `.env.local` Variablen in Vercel gesetzt sind

3. **Performance optimieren**:
   - Vercel optimiert automatisch
   - Bilder sollten bereits optimiert sein (Next.js Image)
