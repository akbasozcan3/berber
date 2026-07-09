import type { Metadata } from "next";
import AdminLoginPage from "./login-client";
import { getPublicSettingsServer } from "@/lib/data/public-settings";

export const metadata: Metadata = {
  title: "Admin Giriş",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const settings = await getPublicSettingsServer();
  return (
    <AdminLoginPage
      businessName={settings.businessName}
      logoUrl={settings.logoUrl}
    />
  );
}
