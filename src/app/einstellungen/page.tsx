"use client";

import { useTheme } from "@/lib/ThemeProvider";
import { useLanguage } from "@/lib/LanguageProvider";
import { useStore } from "@/lib/store";
import { useState, FormEvent, useEffect } from "react";
import type { Language } from "@/lib/i18n";
import {
  isNotificationEnabled,
  setNotificationEnabled,
  requestNotificationPermission,
  getNotificationPermission,
} from "@/lib/notifications";
import { usePushNotifications, PushNotificationManager } from "@/components/PushNotificationManager";

export default function EinstellungenPage() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, setUser } = useStore();
  const [editName, setEditName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [requestingPermission, setRequestingPermission] = useState(false);
  
  // Push-Benachrichtigungen
  const pushNotifications = usePushNotifications();

  useEffect(() => {
    setEditName(user?.name ?? "");
  }, [user?.name]);

  useEffect(() => {
    setNotificationsEnabledState(isNotificationEnabled());
    setNotificationPermission(getNotificationPermission());
  }, []);

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = editName.trim();
    if (!trimmed) return;
    setUser({ id: user?.id ?? "local", name: trimmed });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleNotificationToggle = async () => {
    if (notificationPermission === "default") {
      setRequestingPermission(true);
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      setRequestingPermission(false);
      
      if (permission === "granted") {
        setNotificationEnabled(true);
        setNotificationsEnabledState(true);
      }
    } else if (notificationPermission === "granted") {
      const newState = !notificationsEnabled;
      setNotificationEnabled(newState);
      setNotificationsEnabledState(newState);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-0 sm:space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-study-ink sm:text-2xl">
          {t.settings.title}
        </h1>
        <p className="mt-1 text-sm text-study-soft sm:text-base">
          {t.settings.subtitle}
        </p>
      </div>

      <div className="card">
        <h2 className="font-medium text-study-ink">{t.settings.profile}</h2>
        <p className="mt-0.5 text-sm text-study-soft">
          {t.settings.profileDescription}
        </p>
        <form onSubmit={handleProfileSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="sr-only">{t.common.name}</span>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={t.namePrompt.placeholder}
              maxLength={100}
              className="w-full rounded-xl border border-study-border bg-study-card px-4 py-2.5 text-study-ink placeholder:text-study-soft focus:outline-none focus:ring-2 focus:ring-study-sage"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-study-sage px-4 py-2.5 text-sm font-medium text-white hover:bg-study-accent-hover sm:shrink-0"
          >
            {saved ? t.settings.saved : t.common.save}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium text-study-ink">{t.settings.theme}</h2>
            <p className="mt-0.5 text-sm text-study-soft">
              {theme === "dark"
                ? t.settings.themeDarkActive
                : t.settings.themeLightActive}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                theme === "light"
                  ? "bg-study-mint/50 text-study-ink ring-2 ring-study-sage"
                  : "bg-study-mint/20 text-study-soft hover:bg-study-mint/30 hover:text-study-ink"
              }`}
            >
              {language === "de" ? "Hell" : language === "fr" ? "Clair" : "Light"}
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-pressed={theme === "dark"}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                theme === "dark"
                  ? "bg-study-mint/50 text-study-ink ring-2 ring-study-sage"
                  : "bg-study-mint/20 text-study-soft hover:bg-study-mint/30 hover:text-study-ink"
              }`}
            >
              {language === "de" ? "Dunkel" : language === "fr" ? "Sombre" : "Dark"}
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-study-soft">
          {t.settings.themeSaved}
        </p>
      </div>

      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-medium text-study-ink">{t.settings.language}</h2>
            <p className="mt-0.5 text-sm text-study-soft">
              {t.settings.languageDescription}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(["en", "de", "fr"] as Language[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                aria-pressed={language === lang}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  language === lang
                    ? "bg-study-mint/50 text-study-ink ring-2 ring-study-sage"
                    : "bg-study-mint/20 text-study-soft hover:bg-study-mint/30 hover:text-study-ink"
                }`}
              >
                {lang === "en" ? "English" : lang === "de" ? "Deutsch" : "Français"}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-study-soft">
          {t.settings.themeSaved}
        </p>
      </div>

      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h2 className="font-medium text-study-ink">{t.settings.notifications}</h2>
            <p className="mt-0.5 text-sm text-study-soft">
              {notificationPermission === "granted" && notificationsEnabled
                ? t.settings.notificationsEnabled
                : t.settings.notificationsDisabled}
            </p>
            {notificationPermission === "denied" && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                {t.settings.permissionDenied}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {notificationPermission === "default" ? (
              <button
                type="button"
                onClick={handleNotificationToggle}
                disabled={requestingPermission}
                className="rounded-xl bg-study-sage px-4 py-2.5 text-sm font-medium text-white hover:bg-study-accent-hover disabled:opacity-50"
              >
                {requestingPermission ? "..." : t.settings.requestPermission}
              </button>
            ) : notificationPermission === "granted" ? (
              <button
                type="button"
                onClick={handleNotificationToggle}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  notificationsEnabled
                    ? "bg-study-mint/50 text-study-ink ring-2 ring-study-sage"
                    : "bg-study-mint/20 text-study-soft hover:bg-study-mint/30 hover:text-study-ink"
                }`}
              >
                {notificationsEnabled ? "ON" : "OFF"}
              </button>
            ) : (
              <span className="text-sm text-study-soft">
                {t.settings.permissionDenied}
              </span>
            )}
          </div>
        </div>
        {notificationPermission === "granted" && notificationsEnabled && (
          <p className="mt-3 text-xs text-study-soft">
            {t.settings.permissionGranted}
          </p>
        )}
      </div>

      {/* Push-Benachrichtigungen */}
      <div className="card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h2 className="font-medium text-study-ink">{t.settings.pushNotifications}</h2>
            <p className="mt-0.5 text-sm text-study-soft">
              {pushNotifications.isEnabled
                ? t.settings.pushNotificationsEnabled
                : t.settings.pushNotificationsDisabled}
            </p>
            {pushNotifications.error && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">
                {pushNotifications.error}
              </p>
            )}
            {!pushNotifications.isSupported && (
              <p className="mt-1 text-xs text-study-soft">
                {t.settings.pushNotSupported}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {pushNotifications.isSupported ? (
              pushNotifications.isEnabled ? (
                <button
                  type="button"
                  onClick={pushNotifications.disable}
                  disabled={pushNotifications.isRequesting}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors bg-study-mint/50 text-study-ink ring-2 ring-study-sage disabled:opacity-50"
                >
                  {pushNotifications.isRequesting ? "..." : t.settings.disablePushNotifications}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pushNotifications.enable}
                  disabled={pushNotifications.isRequesting}
                  className="rounded-xl bg-study-sage px-4 py-2.5 text-sm font-medium text-white hover:bg-study-accent-hover disabled:opacity-50"
                >
                  {pushNotifications.isRequesting ? "..." : t.settings.enablePushNotifications}
                </button>
              )
            ) : (
              <span className="text-sm text-study-soft">
                {t.settings.pushNotSupported}
              </span>
            )}
          </div>
        </div>
        {pushNotifications.isEnabled && (
          <p className="mt-3 text-xs text-study-soft">
            {t.settings.permissionGranted}
          </p>
        )}
      </div>

      <PushNotificationManager />
    </div>
  );
}
