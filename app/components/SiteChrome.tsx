"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/app/components/navbar/Navbar";
import Footer from "@/app/components/footer/Footer";
import { PublicSettingsProvider, usePublicSettings } from "@/lib/context/PublicSettingsContext";

function FaviconManager() {
  const settings = usePublicSettings();

  useEffect(() => {
    const faviconUrl = settings.faviconUrl;
    if (!faviconUrl) return;

    try {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }

      link.href = faviconUrl;
    } catch {
      // Favicon güncellemesi asıl sayfayı bozmamalı.
    }
  }, [settings.faviconUrl]);

  return null;
}

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <PublicSettingsProvider>
      <FaviconManager />
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </PublicSettingsProvider>
  );
}
