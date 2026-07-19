/**
 * @file page.tsx
 * @description Next.js page wrapper for the stadium App sub-system view.
 */

import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "../i18n/config";

/**
 * Root page — redirects to the default locale.
 * Handles visitors who land on / without a locale prefix.
 */
export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
