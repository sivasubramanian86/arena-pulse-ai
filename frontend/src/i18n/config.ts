/**
 * i18n/config.ts — Single source of truth for locale configuration.
 * All other i18n modules import from here. Never hard-code locales elsewhere.
 */

export const SUPPORTED_LOCALES = [
  "en", // English (default — USA/Canada host nation)
  "es", // Spanish (Spain, Mexico, Argentina, Colombia)
  "pt", // Portuguese (Brazil, Portugal)
  "fr", // French (France, Belgium, West Africa)
  "ar", // Arabic — RTL (22 Arab nations)
  "de", // German (Germany)
  "zh", // Chinese Simplified (China)
  "ja", // Japanese (Japan)
  "ko", // Korean (Korea Republic)
  "hi", // Hindi (India)
  "it", // Italian (Italy)
  "nl", // Dutch (Netherlands)
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Locales that require right-to-left text direction on <html> */
export const RTL_LOCALES: ReadonlySet<Locale> = new Set(["ar"]);

/** Human-readable language names in their own native script */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
  fr: "Français",
  ar: "العربية",
  de: "Deutsch",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  hi: "हिन्दी",
  it: "Italiano",
  nl: "Nederlands",
};

/** Flag emoji per locale for the Language Switcher */
export const LOCALE_FLAGS: Record<Locale, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  pt: "🇧🇷",
  fr: "🇫🇷",
  ar: "🇸🇦",
  de: "🇩🇪",
  zh: "🇨🇳",
  ja: "🇯🇵",
  ko: "🇰🇷",
  hi: "🇮🇳",
  it: "🇮🇹",
  nl: "🇳🇱",
};

/**
 * All translation namespaces. Each maps to a JSON file per locale.
 * e.g. src/i18n/locales/es/common.json
 */
export const NAMESPACES = [
  "common",
  "nexus",
  "polyglot",
  "crisis",
  "fanpass",
  "transit",
  "mesh",
  "volunteer",
  "monetization",
  "faq",
] as const;

export type Namespace = (typeof NAMESPACES)[number];
