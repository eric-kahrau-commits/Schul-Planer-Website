"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageProvider";

const TUTORIAL_KEY = "studyflow_tutorial_completed";

export function hasCompletedTutorial(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(TUTORIAL_KEY) === "true";
  } catch {
    return false;
  }
}

export function markTutorialCompleted() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TUTORIAL_KEY, "true");
  } catch {}
}

interface TutorialProps {
  onComplete: () => void;
}

export function Tutorial({ onComplete }: TutorialProps) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      icon: "📚",
      title: t.tutorial.page1.title,
      description: t.tutorial.page1.description,
      gradient: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      iconBg: "bg-blue-200 dark:bg-blue-800",
    },
    {
      icon: "📅",
      title: t.tutorial.page2.title,
      description: t.tutorial.page2.description,
      gradient: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
      iconBg: "bg-green-200 dark:bg-green-800",
    },
    {
      icon: "🗓️",
      title: t.tutorial.page3.title,
      description: t.tutorial.page3.description,
      gradient: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
      iconBg: "bg-purple-200 dark:bg-purple-800",
    },
    {
      icon: "🐾",
      title: t.tutorial.page4.title,
      description: t.tutorial.page4.description,
      gradient: "from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900",
      iconBg: "bg-pink-200 dark:bg-pink-800",
    },
    {
      icon: "🔥",
      title: t.tutorial.page5.title,
      description: t.tutorial.page5.description,
      gradient: "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
      iconBg: "bg-orange-200 dark:bg-orange-800",
    },
  ];

  const handleSkip = () => {
    markTutorialCompleted();
    onComplete();
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      markTutorialCompleted();
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const page = pages[currentPage];
  const isLastPage = currentPage === pages.length - 1;
  const isFirstPage = currentPage === 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-study-cream p-4 dark:bg-study-bg">
      <div className="w-full max-w-2xl">
        <div className={`card relative overflow-hidden bg-gradient-to-br ${page.gradient} border-2 border-study-border`}>
          {/* Skip Button */}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute right-4 top-4 rounded-lg px-3 py-1.5 text-sm font-medium text-study-soft transition-colors hover:bg-white/50 hover:text-study-ink dark:hover:bg-study-card/50"
          >
            {t.tutorial.skip}
          </button>

          {/* Content */}
          <div className="flex flex-col items-center text-center px-4 py-8 sm:px-8">
            {/* Icon */}
            <div className={`mb-8 flex h-40 w-40 items-center justify-center rounded-full ${page.iconBg} shadow-xl sm:h-48 sm:w-48`}>
              <span className="text-8xl sm:text-9xl" role="img" aria-hidden>
                {page.icon}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-2xl font-bold text-study-ink dark:text-study-text sm:text-3xl">
              {page.title}
            </h1>

            {/* Description */}
            <p className="mb-10 max-w-lg text-base leading-relaxed text-study-soft dark:text-study-muted sm:text-lg">
              {page.description}
            </p>

            {/* Page Indicators */}
            <div className="mb-8 flex gap-2">
              {pages.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentPage
                      ? "w-8 bg-study-sage"
                      : "w-2 bg-study-border"
                  }`}
                  aria-label={`Page ${index + 1} of ${pages.length}`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex w-full gap-3 sm:max-w-md">
              {!isFirstPage && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 rounded-xl border-2 border-study-border bg-study-card px-4 py-3 text-sm font-medium text-study-ink transition-colors hover:bg-study-mint/30 dark:bg-study-card dark:hover:bg-study-mint/20"
                >
                  {t.tutorial.previous}
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className={`flex-1 rounded-xl bg-study-sage px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-study-accent-hover ${
                  isFirstPage ? "w-full" : ""
                }`}
              >
                {isLastPage ? t.tutorial.getStarted : t.tutorial.next}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
