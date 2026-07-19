/**
 * @file page.tsx
 * @description Next.js page wrapper for the localized landing page.
 */

import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

/**
 * [locale] home page — redirects to /[locale]/nexus as the primary landing.
 */
export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/nexus`);
}
