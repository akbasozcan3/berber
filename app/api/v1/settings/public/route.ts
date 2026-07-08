import { ensureDb } from "@/lib/db/ensure";
import { getSettings } from "@/lib/services/booking";
import { jsonResponse } from "@/lib/api/helpers";

export async function GET() {
  await ensureDb();
  const all = await getSettings();
  return jsonResponse({
    businessName: all.business_name,
    logoUrl: all.logo_url || "",
    faviconUrl: all.favicon_url || "",
    address: all.address,
    phone: all.phone,
    instagram: all.instagram,
    googleMaps: all.google_maps,
    contactEmail: all.contact_email || "info@newlifeerkekkuaforu.com",
    contactIntro:
      all.contact_intro ||
      "Her türlü soru, randevu sorgulama ve istekleriniz için ekibimizle dilediğiniz an iletişime geçebilirsiniz.",
    navServicesLabel: all.nav_services_label || "Hizmetler",
    navGalleryLabel: all.nav_gallery_label || "Galeri",
    navReviewsLabel: all.nav_reviews_label || "Yorumlar",
    navAboutLabel: all.nav_about_label || "Hakkımızda",
    navContactLabel: all.nav_contact_label || "İletişim",
    servicesPageTitle: all.services_page_title || "Hizmetlerimiz",
    servicesPageSubtitle:
      all.services_page_subtitle ||
      "Profesyonel saç kesimi, sakal tasarımı, cilt bakımı ve lüks VIP paketlerimizi keşfedin.",
    servicesSectionEyebrow: all.services_section_eyebrow || "Küratörlü Hizmetlerimiz",
    servicesSectionTitle: all.services_section_title || "Özenle Tasarlanmış\nBakım Ritüelleri",
    servicesSectionSubtitle:
      all.services_section_subtitle ||
      "Klasik berberlik geleneklerini çağdaş tekniklerle harmanlayarak, her seansı ayrıcalıklı bir deneyime dönüştürüyoruz.",
    galleryPageTitle: all.gallery_page_title || "Galeri",
    galleryPageSubtitle:
      all.gallery_page_subtitle ||
      "Stüdyomuzdan saç tasarımı, sakal tıraşı ve bakım çalışmalarımıza göz atın.",
    reviewsPageTitle: all.reviews_page_title || "Müşteri Yorumları",
    reviewsPageSubtitle: all.reviews_page_subtitle || "Gerçek müşteri deneyimleri ve değerlendirmeleri",
    aboutPageTitle: all.about_page_title || "Hakkımızda",
    aboutPageSubtitle: all.about_page_subtitle || "Sade, temiz ve profesyonel hizmet anlayışımızla tanışın.",
    contactPageTitle: all.contact_page_title || "İletişim",
    contactPageSubtitle: all.contact_page_subtitle || "Sorularınız ve talepleriniz için bizimle iletişime geçin.",
    servicesPageBanner: all.services_page_banner || "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1200&auto=format&fit=crop",
    galleryPageBanner: all.gallery_page_banner || "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop",
    reviewsPageBanner: all.reviews_page_banner || "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1200&auto=format&fit=crop",
    aboutPageBanner: all.about_page_banner || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1200&auto=format&fit=crop",
    contactPageBanner: all.contact_page_banner || "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop",
    workingHours: JSON.parse(all.working_hours || "[]"),
    googleRating: all.google_rating,
    googleReviewCount: all.google_review_count,
    locationShort: all.location_short || "Taşdelen, Çekmeköy / İstanbul",
    footerIntro:
      all.footer_intro ||
      "İstanbul Çekmeköy Taşdelen'de profesyonel saç kesimi, sakal tasarımı ve kişisel erkek bakımı hizmetleri.",
    footerCopyright: all.footer_copyright || "",
    navCtaLabel: all.nav_cta_label || "Randevu Al",
    appointmentInterval: Number(all.appointment_interval || 30),
    maxFutureBooking: Number(all.max_future_booking || 30),
  });
}
