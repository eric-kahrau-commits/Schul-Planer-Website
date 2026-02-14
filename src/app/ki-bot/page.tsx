"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageProvider";

export default function KiBotMainPage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-0 sm:gap-8">
      <div>
        <h1 className="text-xl font-semibold text-study-ink sm:text-2xl">
          {t.aiBot?.title ?? "KI Bot"}
        </h1>
        <p className="mt-1 text-sm text-study-soft sm:text-base">
          {t.aiBot?.mainDescription ??
            "Wähle aus, was du erstellen möchtest. Die KI hilft dir dabei."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
        {/* Fach/Thema/Session erstellen */}
        <Link
          href="/ki-bot/fach-erstellen"
          className="group flex flex-col gap-4 rounded-2xl border border-study-border bg-study-card p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-study-sage/20 text-study-sage">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-study-ink">
              {t.aiBot?.createSubjectTitle ?? "Fach erstellen"}
            </h2>
          </div>
          <p className="text-sm text-study-soft">
            {t.aiBot?.createSubjectDescription ??
              "Erstelle neue Fächer, Themen und Lerneinheiten. Die KI hilft dir dabei, alles zu organisieren."}
          </p>
          <div className="mt-auto flex items-center gap-2 text-sm text-study-sage group-hover:gap-3 transition-all">
            <span>{t.aiBot?.startCreating ?? "Loslegen"}</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Wochenplan erstellen */}
        <Link
          href="/ki-bot/wochenplan-erstellen"
          className="group flex flex-col gap-4 rounded-2xl border border-study-border bg-study-card p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-study-mint/20 text-study-mint">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-study-ink">
              {t.aiBot?.createWeeklyPlanTitle ?? "Wochenplan erstellen"}
            </h2>
          </div>
          <p className="text-sm text-study-soft">
            {t.aiBot?.createWeeklyPlanDescription ??
              "Lass die KI einen kompletten Wochenplan für dich erstellen. Perfekt für die Planung einer ganzen Woche."}
          </p>
          <div className="mt-auto flex items-center gap-2 text-sm text-study-mint group-hover:gap-3 transition-all">
            <span>{t.aiBot?.startCreating ?? "Loslegen"}</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Link zu gespeicherten Wochenplänen */}
      <div className="mt-4">
        <Link
          href="/ki-bot/wochenplaene"
          className="inline-flex items-center gap-2 rounded-xl border border-study-border bg-study-card px-4 py-2 text-sm font-medium text-study-ink shadow-sm transition-colors hover:bg-study-cream sm:px-5"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t.aiBot?.weeklyPlans ?? "Gespeicherte Wochenpläne"}
        </Link>
      </div>
    </div>
  );
}
