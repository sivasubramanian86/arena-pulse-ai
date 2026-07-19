import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
 * Root layout — minimal shell.
 * The real layout (with locale, RTL, DashboardLayout, TelemetryProvider)
 * lives in src/app/[locale]/layout.tsx and runs for all app routes.
 * This root layout only handles the outer HTML document shell.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
