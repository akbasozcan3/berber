import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import SiteChrome from "./components/SiteChrome";
import { getPublicSettingsServer } from "@/lib/data/public-settings";
import { buildRootMetadata } from "@/lib/data/seo";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettingsServer();
  return buildRootMetadata(settings);
}

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
      </head>
      <body className="min-h-screen text-white flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
        <SiteChrome initialSettings={initialSettings}>{children}</SiteChrome>
      </body>
    </html>
  );
}
