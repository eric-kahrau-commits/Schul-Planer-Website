import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { LanguageProvider } from "@/lib/LanguageProvider";
import { AppWithOnboarding } from "@/components/AppWithOnboarding";
import { HtmlLangSetter } from "@/components/HtmlLangSetter";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { InstallPrompt } from "@/components/InstallPrompt";

export const metadata: Metadata = {
  title: "StudyFlow – Intelligente Lernplanung",
  description:
    "Lernplaner für strukturierte Schultage: Zeitplanung, Fächer, Themen, Fortschritt.",
  manifest: "/manifest.json",
  themeColor: "#88d4ab",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StudyFlow",
  },
};

/** Statischer Inline-Script (kein User-Input) – sicher für dangerouslySetInnerHTML. Bei User-HTML stattdessen DOMPurify verwenden. */
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('studyflow_theme');
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" />
        <meta name="theme-color" content="#88d4ab" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="StudyFlow" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans">
        <LanguageProvider>
          <HtmlLangSetter />
          <ThemeProvider>
            <StoreProvider>
              <AppWithOnboarding>{children}</AppWithOnboarding>
              <OfflineIndicator />
              <InstallPrompt />
            </StoreProvider>
          </ThemeProvider>
        </LanguageProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
