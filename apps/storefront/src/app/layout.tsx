import type { Metadata } from "next";
import { APP_NAME } from "@repo/shared";
import "./globals.css";

export const metadata: Metadata = {
  title: `${APP_NAME} — Storefront`,
  description: "Public storefront rendering (Phase 0)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
