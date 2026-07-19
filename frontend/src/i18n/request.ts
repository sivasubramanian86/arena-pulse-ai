import { getRequestConfig } from "next-intl/server";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "./config";

/**
 * next-intl server-side configuration.
 * Resolves the locale from the URL segment and loads only the
 * namespaces needed for that request. Falls back to DEFAULT_LOCALE
 * for unknown or missing locales.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Guard: fall back to default if locale is undefined or unsupported
  if (!locale || !SUPPORTED_LOCALES.includes(locale as Locale)) {
    locale = DEFAULT_LOCALE;
  }

  // Load all namespace bundles for this locale.
  // next-intl merges them under their namespace key automatically.
  const [
    common,
    nexus,
    polyglot,
    crisis,
    fanpass,
    transit,
    mesh,
    volunteer,
    monetization,
    faq,
  ] = await Promise.all([
    import(`./locales/${locale}/common.json`).then((m) => m.default),
    import(`./locales/${locale}/nexus.json`).then((m) => m.default),
    import(`./locales/${locale}/polyglot.json`).then((m) => m.default),
    import(`./locales/${locale}/crisis.json`).then((m) => m.default),
    import(`./locales/${locale}/fanpass.json`).then((m) => m.default),
    import(`./locales/${locale}/transit.json`).then((m) => m.default),
    import(`./locales/${locale}/mesh.json`).then((m) => m.default),
    import(`./locales/${locale}/volunteer.json`).then((m) => m.default),
    import(`./locales/${locale}/monetization.json`).then((m) => m.default),
    import(`./locales/${locale}/faq.json`).then((m) => m.default),
  ]);

  return {
    locale,
    messages: {
      common,
      nexus,
      polyglot,
      crisis,
      fanpass,
      transit,
      mesh,
      volunteer,
      monetization,
      faq,
    },
  };
});
