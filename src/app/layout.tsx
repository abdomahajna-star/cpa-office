import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "משרד רואה חשבון",
  description: "פורטל לקוחות ומשרד רואה חשבון",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
