"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageProvider";

/**
 * Zeigt einen Hinweis an, wenn der Nutzer offline ist
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    // Initialer Status
    setIsOnline(navigator.onLine);

    // Event Listeners für Online/Offline Status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
      <div className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-red-600">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a5 5 0 011.414-2.83m-2.167 7.824a9 9 0 01-2.167-9.238m0 0L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>
        <span>Offline - App funktioniert weiterhin</span>
      </div>
    </div>
  );
}
