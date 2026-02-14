"use client";

import { useStore } from "@/lib/store";
import { useLanguage } from "@/lib/LanguageProvider";
import { useState, FormEvent } from "react";

/**
 * Wird beim ersten Besuch angezeigt (wenn noch kein Name gespeichert ist).
 * Fragt nach dem Namen und speichert ihn im Profil.
 */
export function NamePrompt() {
  const { setUser } = useStore();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t.namePrompt.errorRequired);
      return;
    }
    if (trimmed.length > 100) {
      setError(t.namePrompt.errorMaxLength);
      return;
    }
    setError("");
    setUser({ id: "local", name: trimmed });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-study-cream p-4">
      <div className="w-full max-w-sm">
        <div className="card text-center">
          <h1 className="text-xl font-semibold text-study-ink sm:text-2xl">
            {t.namePrompt.welcome}
          </h1>
          <p className="mt-2 text-sm text-study-soft">
            {t.namePrompt.question}
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder={t.namePrompt.placeholder}
              className="w-full rounded-xl border border-study-border bg-study-card px-4 py-3 text-study-ink placeholder:text-study-soft focus:outline-none focus:ring-2 focus:ring-study-sage"
              autoFocus
              maxLength={100}
              aria-invalid={!!error}
              aria-describedby={error ? "name-error" : undefined}
            />
            {error && (
              <p id="name-error" className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-study-sage px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-study-accent-hover"
            >
              {t.namePrompt.start}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
