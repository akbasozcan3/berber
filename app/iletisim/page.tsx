import type { Metadata } from "next";
import PageHeader from "../components/ui/PageHeader";
import Contact from "../components/contact/Contact";
import { getPublicSettingsSnapshot } from "@/lib/data/public-server";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "New Life Erkek Kuaförü ile iletişime geçin. Telefon, e-posta veya form aracılığıyla bize ulaşın. Taşdelen, Çekmeköy / İstanbul.",
};

export default async function IletisimPage() {
  const settings = await getPublicSettingsSnapshot();
  return (
    <main>
      <PageHeader
        title={settings.contactPageTitle}
        subtitle={settings.contactPageSubtitle}
        bg={settings.contactPageBanner}
      />
      <Contact showHeading={false} />
    </main>
  );
}
