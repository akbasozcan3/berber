import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteChrome from "./components/SiteChrome";
import { getPublicSettingsServer } from "@/lib/data/public-settings";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "New Life Erkek Kuaförü — Çekmeköy Taşdelen",
    template: "%s | New Life Erkek Kuaförü",
  },
  description:
    "İstanbul Çekmeköy Taşdelen'de profesyonel saç kesimi, sakal tasarımı ve kaliteli erkek bakım hizmetleri.",
  keywords: ["erkek kuaförü", "barber", "kuaför", "saç kesimi", "sakal tıraşı", "Çekmeköy", "Taşdelen", "İstanbul"],
  openGraph: {
    siteName: "New Life Erkek Kuaförü",
    locale: "tr_TR",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSettings = await getPublicSettingsServer();

  return (
    <html lang="tr" className={`${outfit.variable} ${playfair.variable} scroll-smooth antialiased`}>
      <head>
        {initialSettings.logoUrl ? (
          <link rel="preload" as="image" href={initialSettings.logoUrl} />
        ) : null}
        {initialSettings.faviconUrl ? (
          <link rel="icon" href={initialSettings.faviconUrl} />
        ) : null}
      </head>
      <body className="min-h-screen text-white flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
        <SiteChrome initialSettings={initialSettings}>{children}</SiteChrome>
      </body>
    </html>
  );
}
