"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "./AppShell";
import { NamePrompt } from "./NamePrompt";
import { Tutorial, hasCompletedTutorial } from "./Tutorial";
import type { ReactNode } from "react";

/**
 * Zeigt beim ersten Besuch zuerst das Tutorial, dann den NamePrompt,
 * sonst die normale App mit Sidebar und Inhalt.
 */
export function AppWithOnboarding({ children }: { children: ReactNode }) {
  const { hasHydrated, user } = useStore();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialChecked, setTutorialChecked] = useState(false);

  useEffect(() => {
    if (hasHydrated && !tutorialChecked) {
      setShowTutorial(!hasCompletedTutorial());
      setTutorialChecked(true);
    }
  }, [hasHydrated, tutorialChecked]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-study-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-study-sage border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (showTutorial) {
    return <Tutorial onComplete={() => setShowTutorial(false)} />;
  }

  if (!user || user.name === "") {
    return <NamePrompt />;
  }

  return <AppShell>{children}</AppShell>;
}
