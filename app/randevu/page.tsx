import PageHeader from "../components/ui/PageHeader";
import Booking from "../components/booking/Booking";
import { getPublicSettingsSnapshot } from "@/lib/data/public-server";
import { buildPageMetadata } from "@/lib/data/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const settings = await getPublicSettingsSnapshot();
  return buildPageMetadata(settings, settings.bookingPageTitle, settings.seoDefaultDescription);
}

export default async function RandevuPage() {
  const settings = await getPublicSettingsSnapshot();

  return (
    <main>
      <PageHeader
        title={settings.bookingPageTitle}
        subtitle={settings.bookingPageSubtitle}
        bg={settings.bookingPageBanner}
      />
      <Booking />
    </main>
  );
}
