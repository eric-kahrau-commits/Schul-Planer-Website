"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Language } from "./i18n";
import { translations } from "./i18n";

const LANGUAGE_KEY = "studyflow_language";

function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const v = localStorage.getItem(LANGUAGE_KEY);
    if (v === "en" || v === "de" || v === "fr") return v;
  } catch {}
  return "en";
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = getStoredLanguage();
    setLanguageState(stored);
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(LANGUAGE_KEY, next);
    } catch {}
  }, []);

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t: translations[language] as typeof translations.en,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
