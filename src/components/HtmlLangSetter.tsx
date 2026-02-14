"use client";

import { useLanguage } from "@/lib/LanguageProvider";
import { useEffect } from "react";

/**
 * Setzt das lang-Attribut auf <html> basierend auf der aktuellen Sprache.
 */
export function HtmlLangSetter() {
  const { language } = useLanguage();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  return null;
}
