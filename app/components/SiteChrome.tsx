"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/app/components/navbar/Navbar";
import Footer from "@/app/components/footer/Footer";
import WhatsAppButton from "@/app/components/WhatsAppButton";
import { PublicSettingsProvider, usePublicSettings } from "@/lib/context/PublicSettingsContext";
import type { PublicSettings } from "@/lib/api/client";

function FaviconManager() {
  const settings = usePublicSettings();

  useEffect(() => {
    if (!settings.faviconUrl?.trim()) return;

    const href = "/favicon.ico";

    try {
      for (const rel of ["icon", "shortcut icon", "apple-touch-icon"] as const) {
        const selector =
          rel === "icon"
            ? 'link[rel="icon"]'
            : rel === "shortcut icon"
              ? 'link[rel="shortcut icon"]'
              : 'link[rel="apple-touch-icon"]';
        let link = document.querySelector<HTMLLinkElement>(selector);
        if (!link) {
          link = document.createElement("link");
          link.rel = rel;
          document.head.appendChild(link);
        }
        link.href = rel === "apple-touch-icon" ? "/api/favicon?size=180" : href;
      }
    } catch {
      // Favicon güncellemesi asıl sayfayı bozmamalı.
    }
  }, [settings.faviconUrl]);

  return null;
}

export default function SiteChrome({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings: PublicSettings;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <PublicSettingsProvider initialSettings={initialSettings}>
      <FaviconManager />
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <WhatsAppButton />
    </PublicSettingsProvider>
  );
}
