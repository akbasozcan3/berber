import type { Metadata } from "next";
import PageHeader from "../components/ui/PageHeader";

export const dynamic = "force-dynamic";
import Gallery from "../components/gallery/Gallery";
import { getGalleryImages, getPublicSettingsSnapshot } from "@/lib/data/public-server";

export const metadata: Metadata = {
  title: "Galeri",
  description: "New Life Erkek Kuaförü çalışmalarımızdan saç tasarımı, sakal tıraşı ve salon atmosferimizi görsel koleksiyonumuzda keşfedin.",
};

export default async function GaleriPage() {
  const [settings, galleryRows] = await Promise.all([
    getPublicSettingsSnapshot(),
    getGalleryImages(),
  ]);

  const initialImages = galleryRows.map((g) => ({
    id: g.id,
    url: g.url,
    title: g.title,
    sortOrder: g.sortOrder,
    createdAt: g.createdAt,
  }));

  return (
    <main>
      <PageHeader
        title={settings.galleryPageTitle}
        subtitle={settings.galleryPageSubtitle}
        bg={settings.galleryPageBanner}
      />
      <Gallery initialImages={initialImages} />
    </main>
  );
}
