"use client";

/**
 * @file LanguageSwitcher.tsx
 * @description Dropdown language selector component integrating with next-intl routing constraints.
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_FLAGS, RTL_LOCALES, type Locale } from "../i18n/config";

interface LanguageSwitcherProps {
  currentLocale: Locale;
}

/**
 * LanguageSwitcher — Dropdown to switch the active locale.
 * Updates the URL locale prefix and persists the preference
 * to localStorage for returning fans.
 */
export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLocale }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = useCallback(
    (newLocale: Locale) => {
      if (newLocale === currentLocale) {
        setIsOpen(false);
        return;
      }

      // Persist preference
      if (typeof window !== "undefined") {
        localStorage.setItem("arena-pulse-locale", newLocale);
      }

      // Replace the locale segment in the current path
      // pathname is like /en/nexus → swap /en → /es
      const segments = pathname.split("/");
      segments[1] = newLocale; // segments[0] = "", segments[1] = locale
      const newPath = segments.join("/") || `/${newLocale}`;

      setIsOpen(false);
      router.push(newPath);
    },
    [currentLocale, pathname, router]
  );

  const isRTL = RTL_LOCALES.has(currentLocale);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-zinc-300 rounded-xl px-2.5 py-1.5 transition-all active:scale-95 text-xs font-semibold"
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
        <span className="hidden sm:inline" style={{ direction: isRTL ? "rtl" : "ltr" }}>
          {LOCALE_FLAGS[currentLocale]} {LOCALE_LABELS[currentLocale]}
        </span>
        <span className="sm:hidden">{LOCALE_FLAGS[currentLocale]}</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 z-[200] w-52 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-fade-in"
          role="listbox"
          aria-label="Available languages"
        >
          <div className="px-3 py-2 border-b border-zinc-800">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              FIFA Fan Languages
            </p>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {SUPPORTED_LOCALES.map((locale) => {
              const isActive = locale === currentLocale;
              const isLangRTL = RTL_LOCALES.has(locale);
              return (
                <button
                  key={locale}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => switchLocale(locale)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${
                    isActive
                      ? "bg-blue-600/20 text-blue-300 font-bold"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                  style={{ direction: isLangRTL ? "rtl" : "ltr" }}
                >
                  <span className="text-base leading-none flex-shrink-0">{LOCALE_FLAGS[locale]}</span>
                  <span className="flex-1 text-start">{LOCALE_LABELS[locale]}</span>
                  <span className="text-zinc-600 font-mono text-[10px] uppercase">{locale}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

LanguageSwitcher.displayName = "LanguageSwitcher";
