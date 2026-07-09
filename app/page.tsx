import nextDynamic from "next/dynamic";
import HeroSlider from "./components/hero/HeroSlider";
import ServicesPreview from "./components/home/ServicesPreview";
import AboutBanner from "./components/home/AboutBanner";
import QuoteBanner from "./components/home/QuoteBanner";
import Contact from "./components/contact/Contact";
import StatsStrip from "./components/home/StatsStrip";
import BookingCTA from "./components/home/BookingCTA";
import GalleryPreview from "./components/home/GalleryPreview";
import { getGalleryImages, getPopularServices } from "@/lib/data/public-server";
import { getPageMetadata } from "@/lib/data/seo";
import type { GalleryImage, Service } from "@/lib/api/client";
import { mapGalleryRow } from "@/lib/utils/gallery";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return getPageMetadata("Ana Sayfa");
}

const TeamPreview = nextDynamic(() => import("./components/home/TeamPreview"));
const HowItWorks = nextDynamic(() => import("./components/home/HowItWorks"));
const ExperienceHighlights = nextDynamic(() => import("./components/home/ExperienceHighlights"));
const TestimonialsSlider = nextDynamic(() => import("./components/home/TestimonialsSlider"));

function mapServices(rows: Awaited<ReturnType<typeof getPopularServices>>): Service[] {
  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    duration: s.duration,
    price: s.price,
    image: s.image,
    popular: s.popular,
  }));
}

function mapGallery(rows: Awaited<ReturnType<typeof getGalleryImages>>): GalleryImage[] {
  return rows.map(mapGalleryRow);
}

export default async function HomePage() {
  const [serviceRows, galleryRows] = await Promise.all([
    getPopularServices(4),
    getGalleryImages(),
  ]);

  const services = mapServices(serviceRows);
  const gallery = mapGallery(galleryRows);

  return (
    <main>
      <HeroSlider />
      <StatsStrip />
      <ServicesPreview initialServices={services} />
      <AboutBanner />
      <TeamPreview />
      <HowItWorks />
      <GalleryPreview initialImages={gallery} />
      <ExperienceHighlights />
      <QuoteBanner />
      <TestimonialsSlider />
      <BookingCTA initialServices={services} />
      <Contact />
    </main>
  );
}
