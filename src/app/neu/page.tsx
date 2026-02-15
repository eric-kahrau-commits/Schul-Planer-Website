"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/lib/LanguageProvider";
import { FaecherSection } from "./FaecherSection";
import { PlanerSection } from "./PlanerSection";

type TabId = "faecher" | "planer";

export default function NeuPage() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [tab, setTab] = useState<TabId>(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "faecher" || tabParam === "planer") return tabParam;
    return "planer";
  });

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "faecher" || tabParam === "planer") {
      setTab(tabParam);
    }
  }, [searchParams]);

  const setTabWithUrl = useCallback((newTab: TabId) => {
    setTab(newTab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", newTab);
    window.history.replaceState({}, "", url.pathname + "?" + url.searchParams.toString());
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-0 sm:space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-study-ink sm:text-2xl">
          {t.nav.neu}
        </h1>
        <p className="mt-1 text-sm text-study-soft sm:text-base">
          Fächer & Themen anlegen und Lerneinheiten im Tagesplaner planen.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Bereiche"
        className="flex gap-1 rounded-xl border border-study-border bg-study-card p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "planer"}
          aria-controls="panel-planer"
          id="tab-planer"
          onClick={() => setTabWithUrl("planer")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "planer"
              ? "bg-study-sage text-white"
              : "text-study-soft hover:bg-study-mint/30 hover:text-study-ink"
          }`}
        >
          {t.nav.dayPlanner}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "faecher"}
          aria-controls="panel-faecher"
          id="tab-faecher"
          onClick={() => setTabWithUrl("faecher")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "faecher"
              ? "bg-study-sage text-white"
              : "text-study-soft hover:bg-study-mint/30 hover:text-study-ink"
          }`}
        >
          {t.nav.subjects}
        </button>
      </div>

      <div
        id="panel-planer"
        role="tabpanel"
        aria-labelledby="tab-planer"
        hidden={tab !== "planer"}
        className="min-w-0"
      >
        {tab === "planer" && <PlanerSection />}
      </div>
      <div
        id="panel-faecher"
        role="tabpanel"
        aria-labelledby="tab-faecher"
        hidden={tab !== "faecher"}
        className="min-w-0"
      >
        {tab === "faecher" && <FaecherSection />}
      </div>
    </div>
  );
}
