"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageProvider";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Zeigt einen Install-Prompt für PWA an
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Prüfe ob bereits installiert
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Zeige Prompt nach 3 Sekunden
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Speichere Dismissal für 7 Tage
    localStorage.setItem("studyflow_install_dismissed", Date.now().toString());
  };

  useEffect(() => {
    // Prüfe ob Prompt bereits dismissed wurde (innerhalb der letzten 7 Tage)
    const dismissed = localStorage.getItem("studyflow_install_dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) {
        setShowPrompt(false);
      }
    }
  }, []);

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-[calc(5rem+1rem+env(safe-area-inset-bottom,0px))] left-1/2 z-50 -translate-x-1/2 transform md:bottom-4 md:left-auto md:right-4 md:translate-x-0">
      <div className="card mx-3 flex flex-col gap-3 shadow-xl md:mx-0 md:max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-study-sage text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-study-ink">App installieren</h3>
            <p className="mt-1 text-sm text-study-soft">
              Installiere StudyFlow für schnelleren Zugriff und Offline-Nutzung.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 rounded-lg bg-study-sage px-4 py-2 text-sm font-medium text-white hover:bg-study-accent-hover"
          >
            Installieren
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-lg border border-study-border bg-study-card px-4 py-2 text-sm font-medium text-study-ink hover:bg-study-cream"
          >
            Später
          </button>
        </div>
      </div>
    </div>
  );
}
