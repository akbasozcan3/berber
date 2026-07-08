import type { Metadata } from "next";
import PageHeader from "../components/ui/PageHeader";
import About from "../components/about/About";
import { getPublicSettingsSnapshot } from "@/lib/data/public-server";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "New Life Erkek Kuaförü'nün hikayesi, felsefesi ve kaliteli hizmet anlayışı. Çekmeköy Taşdelen'de profesyonel erkek kuaförü deneyimi.",
};

export default async function HakkimizdaPage() {
  const settings = await getPublicSettingsSnapshot();
  return (
    <main>
      <PageHeader
        title={settings.aboutPageTitle}
        subtitle={settings.aboutPageSubtitle}
        bg={settings.aboutPageBanner}
      />
      <About />
    </main>
  );
}
