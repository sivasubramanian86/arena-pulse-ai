import createMiddleware from "next-intl/middleware";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./i18n/config";

/**
 * next-intl locale routing middleware.
 * Intercepts all requests and prepends the locale prefix.
 * e.g.  /nexus  →  /en/nexus  (or /es/nexus based on preference)
 *
 * Compatible with `output: 'export'` via generateStaticParams.
 */
export default createMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // Always use locale prefix for clean, shareable URLs
  localePrefix: "always",
});

export const config = {
  // Match all routes EXCEPT Next.js internals and static assets
  matcher: [
    "/((?!_next|_vercel|favicon\\.ico|.*\\.(?:jpg|jpeg|gif|png|svg|webp|ico|css|js|woff2?)).*)",
  ],
};
