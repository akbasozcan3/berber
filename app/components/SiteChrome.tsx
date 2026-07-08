"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/app/components/navbar/Navbar";
import Footer from "@/app/components/footer/Footer";
import { PublicSettingsProvider } from "@/lib/context/PublicSettingsContext";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <PublicSettingsProvider>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </PublicSettingsProvider>
  );
}
