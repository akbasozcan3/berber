import PageHeader from "../components/ui/PageHeader";
import About from "../components/about/About";
import { getPublicSettingsSnapshot } from "@/lib/data/public-server";
import { buildPageMetadata } from "@/lib/data/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getPublicSettingsSnapshot();
  return buildPageMetadata(settings, settings.aboutPageTitle, settings.aboutPageSubtitle, "/hakkimizda");
}

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
