/**
 * @file layout.tsx
 * @description Localized layout wrapper inject next-intl context, configuring dynamic lang and dir attributes.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { TelemetryProvider } from "../../context/TelemetryContext";
import { DashboardLayout } from "../../components/DashboardLayout";
import { SUPPORTED_LOCALES, RTL_LOCALES, type Locale } from "../../i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArenaPulseAI — Smart Stadium OS",
  description: "Multi-agent Smart Stadium Operating System for FIFA World Cup 2026",
};

/**
 * Generate a static page for every supported locale.
 * Required for `output: 'export'` (Firebase Hosting) compatibility.
 */
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale — return 404 for unknown values
  if (!SUPPORTED_LOCALES.includes(locale as Locale)) {
    notFound();
  }

  const typedLocale = locale as Locale;
  // Enable static rendering for next-intl
  setRequestLocale(typedLocale);

  const dir = RTL_LOCALES.has(typedLocale) ? "rtl" : "ltr";

  // Load all namespace messages for this locale (server-side)
  const messages = await getMessages();

  return (
    <html
      lang={typedLocale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-theme="dark"
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <NextIntlClientProvider locale={typedLocale} messages={messages}>
          <TelemetryProvider>
            <DashboardLayout locale={typedLocale}>{children}</DashboardLayout>
          </TelemetryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
