import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSlider from "./components/hero/HeroSlider";
import ServicesPreview from "./components/home/ServicesPreview";
import AboutBanner from "./components/home/AboutBanner";
import QuoteBanner from "./components/home/QuoteBanner";
import Contact from "./components/contact/Contact";
import StatsStrip from "./components/home/StatsStrip";
import BookingCTA from "./components/home/BookingCTA";
import GalleryPreview from "./components/home/GalleryPreview";
import { getGalleryImages, getPopularServices } from "@/lib/data/public-server";
import type { GalleryImage, Service } from "@/lib/api/client";

const TeamPreview = dynamic(() => import("./components/home/TeamPreview"));
const HowItWorks = dynamic(() => import("./components/home/HowItWorks"));
const ExperienceHighlights = dynamic(() => import("./components/home/ExperienceHighlights"));
const TestimonialsSlider = dynamic(() => import("./components/home/TestimonialsSlider"));

export const metadata: Metadata = {
  title: "New Life Erkek Kuaförü — Çekmeköy Taşdelen",
  description:
    "İstanbul Çekmeköy Taşdelen'de profesyonel saç kesimi, sakal tasarımı, cilt bakımı ve erkek bakım hizmetleri.",
};

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
  return rows.map((g) => ({
    id: g.id,
    url: g.url,
    title: g.title,
    sortOrder: g.sortOrder,
    createdAt: g.createdAt,
  }));
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
