"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType, type ReactNode, useMemo } from "react";
import { useStore } from "@/lib/store";
import { useLanguage } from "@/lib/LanguageProvider";
import { NotificationManager } from "./NotificationManager";
import { PushNotificationManager } from "./PushNotificationManager";

/* ---------------- Icons ---------------- */

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2 7-7 7 7 2 2M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0h6" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CalendarGridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 11h4m8 0h4M4 15h4m8 0h4" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 19h16M6 17V9m6 8V5m6 12v-6" />
    </svg>
  );
}

function ProgressIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12h18M12 3v18" />
    </svg>
  );
}

function PawIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 2C8 6 4 10 4 14c0 4 3.5 6 8 6s8-2 8-6c0-4-4-8-8-12z" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

/* ---------------- Navigation Items ---------------- */

function useNavItems() {
  const { t } = useLanguage();
  return useMemo(() => [
    { href: "/", label: t.nav.dashboard, icon: HomeIcon },
    { href: "/planer", label: t.nav.dayPlanner, icon: CalendarIcon },
    { href: "/kalender", label: t.nav.calendar, icon: CalendarGridIcon },
    { href: "/faecher", label: t.nav.subjects, icon: BookIcon },
    { href: "/woche", label: t.nav.week, icon: ChartIcon },
    { href: "/fortschritt", label: t.nav.progress, icon: ProgressIcon },
    { href: "/tierwelt", label: t.nav.pets, icon: PawIcon },
    { href: "/achievements", label: t.nav.achievements, icon: TrophyIcon },
    { href: "/einstellungen", label: t.nav.settings, icon: SettingsIcon },
  ], [t]);
}

/* ---------------- App Shell ---------------- */

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useStore();
  const { t, language } = useLanguage();
  const navItems = useNavItems();
  
  const localeMap: Record<string, string> = { en: "en-US", de: "de-DE", fr: "fr-FR" };
  const locale = localeMap[language] || "en-US";

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  /* Bottom nav: nur auf Mobil, 5 Einträge */
  const bottomNavItems = useMemo(() => [
    { href: "/", label: t.nav.dashboard, icon: HomeIcon },
    { href: "/planer", label: t.nav.dayPlanner, icon: CalendarIcon },
    { href: "/kalender", label: t.nav.calendar, icon: CalendarGridIcon },
    { href: "/tierwelt", label: t.nav.pets, icon: PawIcon },
  ], [t]);

  return (
    <div className="flex h-screen min-h-screen">
      {/* Overlay: nur Mobil, schließt Sidebar beim Tippen */}
      <button
        type="button"
        onClick={closeSidebar}
        aria-hidden="true"
        tabIndex={-1}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar: Mobil ausgeblendet/eingeblendet, Desktop immer sichtbar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 max-w-[85vw] flex-col border-r border-study-border bg-study-card shadow-xl transition-transform duration-300 ease-out md:relative md:z-auto md:h-full md:w-56 md:translate-x-0 md:max-w-none md:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Hauptnavigation"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-study-border px-4">
          <span className="text-lg font-semibold text-study-ink">StudyFlow</span>
          <button
            type="button"
            onClick={closeSidebar}
            aria-label={t.common.close}
            className="rounded-lg p-2 text-study-soft transition-colors hover:bg-study-mint/30 hover:text-study-ink md:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden p-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const baseHref = href.split("?")[0];
            const isActive = pathname === baseHref || pathname.startsWith(baseHref + "/");

            return (
              <Link
                key={href}
                href={href}
                onClick={closeSidebar}
                className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors active:bg-study-mint/40 md:min-h-0 ${
                  isActive
                    ? "bg-study-mint/40 text-study-ink font-medium"
                    : "text-study-soft hover:bg-study-mint/30 hover:text-study-ink"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 pl-0">
        <header
          className="sticky top-0 z-30 flex h-14 min-h-[44px] items-center justify-between gap-2 border-b border-study-border bg-study-card/95 px-3 backdrop-blur sm:gap-4 sm:px-4"
          style={{ paddingTop: "max(0.75rem, var(--safe-area-inset-top))" }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openSidebar}
              aria-label={t.common.openMenu}
              className="flex h-10 w-10 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-study-soft transition-colors hover:bg-study-mint/30 hover:text-study-ink active:bg-study-mint/40 md:hidden"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <time
              dateTime={new Date().toISOString().slice(0, 10)}
              className="min-w-0 truncate text-xs text-study-soft sm:text-sm sm:truncate-none"
            >
              {new Date().toLocaleDateString(locale, {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          </div>
          <span className="truncate text-sm font-medium text-study-ink sm:max-w-[120px]">
            {user?.name ?? "Du"}
          </span>
        </header>

        <div className="min-w-0 bg-study-cream p-4 pb-bottom-nav sm:p-6 md:pb-6">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Hauptbereiche"
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-study-border bg-study-card/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(0.5rem, var(--safe-area-inset-bottom))" }}
      >
        {bottomNavItems.map(({ href, label, icon: Icon }) => {
          const baseHref = href.split("?")[0];
          const isActive = pathname === baseHref || pathname.startsWith(baseHref + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors active:bg-study-mint/30 ${
                isActive ? "text-study-sage font-medium" : "text-study-soft"
              }`}
            >
              <Icon className="h-6 w-6 shrink-0" />
              <span className="truncate max-w-[72px]">{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={openSidebar}
          aria-label={t.common.openMenu}
          className={`flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] transition-colors active:bg-study-mint/30 ${
            sidebarOpen ? "text-study-sage font-medium" : "text-study-soft"
          }`}
        >
          <MoreIcon className="h-6 w-6 shrink-0" />
          <span className="truncate max-w-[72px]">{t.nav.more}</span>
        </button>
      </nav>

      <NotificationManager />
      <PushNotificationManager />
    </div>
  );
}
