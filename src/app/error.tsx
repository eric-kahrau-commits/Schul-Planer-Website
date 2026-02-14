"use client";

import { useEffect } from "react";

/**
 * Zeigt Nutzern nur eine allgemeine Fehlermeldung.
 * Technische Details werden nicht angezeigt (nur im Server-Log / Konsole).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Detaillierte Fehler nur serverseitig / in Logs, nicht an Client senden
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-lg font-semibold text-study-ink">
        Ein Fehler ist aufgetreten
      </h2>
      <p className="text-sm text-study-soft">
        Bitte lade die Seite neu oder versuche es später erneut.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl bg-study-sage px-4 py-2.5 text-sm font-medium text-white hover:bg-study-accent-hover"
      >
        Erneut versuchen
      </button>
    </div>
  );
}
