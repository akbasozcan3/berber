import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { reviews, services, galleryImages } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSettings } from "@/lib/services/booking";

export async function getApprovedReviews(limit = 50) {
  try {
    await ensureDb();
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.approved, true))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
}

export async function getPopularServices(limit = 4) {
  try {
    await ensureDb();
    return db
      .select()
      .from(services)
      .where(eq(services.enabled, true))
      .orderBy(services.sortOrder)
      .limit(limit);
  } catch {
    return [];
  }
}

export async function getEnabledServices() {
  try {
    await ensureDb();
    return db
      .select()
      .from(services)
      .where(eq(services.enabled, true))
      .orderBy(services.sortOrder);
  } catch {
    return [];
  }
}

export async function getGalleryImages() {
  try {
    await ensureDb();
    return db.select().from(galleryImages).orderBy(galleryImages.sortOrder);
  } catch {
    return [];
  }
}

export async function getPublicSettingsSnapshot() {
  try {
    await ensureDb();
    const all = await getSettings();
    return {
      businessName: all.business_name || "New Life Erkek Kuaförü",
      address: all.address || "",
      phone: all.phone || "",
      email: all.contact_email || "info@newlifeerkekkuaforu.com",
      instagram: all.instagram || "",
      googleMaps: all.google_maps || "",
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
      reviewsPageSubtitle:
        all.reviews_page_subtitle || "Gerçek müşteri deneyimleri ve değerlendirmeleri",
      aboutPageTitle: all.about_page_title || "Hakkımızda",
      aboutPageSubtitle:
        all.about_page_subtitle || "Sade, temiz ve profesyonel hizmet anlayışımızla tanışın.",
      contactPageTitle: all.contact_page_title || "İletişim",
      contactPageSubtitle:
        all.contact_page_subtitle || "Sorularınız ve talepleriniz için bizimle iletişime geçin.",
      servicesPageBanner:
        all.services_page_banner ||
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1200&auto=format&fit=crop",
      galleryPageBanner:
        all.gallery_page_banner ||
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop",
      reviewsPageBanner:
        all.reviews_page_banner ||
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1200&auto=format&fit=crop",
      aboutPageBanner:
        all.about_page_banner ||
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1200&auto=format&fit=crop",
      contactPageBanner:
        all.contact_page_banner ||
        "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop",
      workingHours: JSON.parse(all.working_hours || "[]"),
      googleRating: all.google_rating || "4.87",
      googleReviewCount: all.google_review_count || "30",
    };
  } catch {
    return {
      businessName: "New Life Erkek Kuaförü",
      address: "",
      phone: "",
      email: "info@newlifeerkekkuaforu.com",
      instagram: "",
      googleMaps: "",
      contactIntro:
        "Her türlü soru, randevu sorgulama ve istekleriniz için ekibimizle dilediğiniz an iletişime geçebilirsiniz.",
      navServicesLabel: "Hizmetler",
      navGalleryLabel: "Galeri",
      navReviewsLabel: "Yorumlar",
      navAboutLabel: "Hakkımızda",
      navContactLabel: "İletişim",
      servicesPageTitle: "Hizmetlerimiz",
      servicesPageSubtitle:
        "Profesyonel saç kesimi, sakal tasarımı, cilt bakımı ve lüks VIP paketlerimizi keşfedin.",
      servicesSectionEyebrow: "Küratörlü Hizmetlerimiz",
      servicesSectionTitle: "Özenle Tasarlanmış\nBakım Ritüelleri",
      servicesSectionSubtitle:
        "Klasik berberlik geleneklerini çağdaş tekniklerle harmanlayarak, her seansı ayrıcalıklı bir deneyime dönüştürüyoruz.",
      galleryPageTitle: "Galeri",
      galleryPageSubtitle:
        "Stüdyomuzdan saç tasarımı, sakal tıraşı ve bakım çalışmalarımıza göz atın.",
      reviewsPageTitle: "Müşteri Yorumları",
      reviewsPageSubtitle: "Gerçek müşteri deneyimleri ve değerlendirmeleri",
      aboutPageTitle: "Hakkımızda",
      aboutPageSubtitle: "Sade, temiz ve profesyonel hizmet anlayışımızla tanışın.",
      contactPageTitle: "İletişim",
      contactPageSubtitle: "Sorularınız ve talepleriniz için bizimle iletişime geçin.",
      servicesPageBanner:
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1200&auto=format&fit=crop",
      galleryPageBanner:
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop",
      reviewsPageBanner:
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1200&auto=format&fit=crop",
      aboutPageBanner:
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1200&auto=format&fit=crop",
      contactPageBanner:
        "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop",
      workingHours: [],
      googleRating: "4.87",
      googleReviewCount: "30",
    };
  }
}
