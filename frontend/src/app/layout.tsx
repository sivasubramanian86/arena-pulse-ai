/**
 * Root layout — pass-through.
 * All layout structure (html, body, telemetry, i18n, etc.) is handled inside
 * app/[locale]/layout.tsx to support locale attributes (lang, dir) and prevent duplicate tags.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
