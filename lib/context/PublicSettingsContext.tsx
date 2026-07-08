"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { PublicSettings } from "@/lib/api/client";

const defaults: PublicSettings = {
  businessName: "New Life Erkek Kuaförü",
  logoUrl: "",
  faviconUrl: "",
  address: "Taşdelen Mah. Dekor Sok. No:26B, 34788 Çekmeköy / İstanbul",
  phone: "+905327104355",
  instagram: "@newlifekuaforr",
  googleMaps: "https://maps.google.com/?q=New+Life+Erkek+Kuaförü+Taşdelen",
  contactEmail: "info@newlifeerkekkuaforu.com",
  contactIntro:
    "Her türlü soru, randevu sorgulama ve istekleriniz için ekibimizle dilediğiniz an iletişime geçebilirsiniz.",
  navServicesLabel: "Hizmetler",
  navGalleryLabel: "Galeri",
  navReviewsLabel: "Yorumlar",
  navAboutLabel: "Hakkımızda",
  navContactLabel: "İletişim",
  servicesPageTitle: "Hizmetlerimiz",
  servicesPageSubtitle: "Profesyonel saç kesimi, sakal tasarımı, cilt bakımı ve lüks VIP paketlerimizi keşfedin.",
  servicesSectionEyebrow: "Küratörlü Hizmetlerimiz",
  servicesSectionTitle: "Özenle Tasarlanmış\nBakım Ritüelleri",
  servicesSectionSubtitle:
    "Klasik berberlik geleneklerini çağdaş tekniklerle harmanlayarak, her seansı ayrıcalıklı bir deneyime dönüştürüyoruz.",
  galleryPageTitle: "Galeri",
  galleryPageSubtitle: "Stüdyomuzdan saç tasarımı, sakal tıraşı ve bakım çalışmalarımıza göz atın.",
  reviewsPageTitle: "Müşteri Yorumları",
  reviewsPageSubtitle: "Gerçek müşteri deneyimleri ve değerlendirmeleri",
  aboutPageTitle: "Hakkımızda",
  aboutPageSubtitle: "Sade, temiz ve profesyonel hizmet anlayışımızla tanışın.",
  contactPageTitle: "İletişim",
  contactPageSubtitle: "Sorularınız ve talepleriniz için bizimle iletişime geçin.",
  servicesPageBanner: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1200&auto=format&fit=crop",
  galleryPageBanner: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop",
  reviewsPageBanner: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1200&auto=format&fit=crop",
  aboutPageBanner: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1200&auto=format&fit=crop",
  contactPageBanner: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop",
  workingHours: [
    { day: "Pazartesi", open: "09:00", close: "22:00" },
    { day: "Salı", open: "09:00", close: "22:00" },
    { day: "Çarşamba", open: "09:00", close: "22:00" },
    { day: "Perşembe", open: "09:00", close: "22:00" },
    { day: "Cuma", open: "09:00", close: "22:00" },
    { day: "Cumartesi", open: "09:00", close: "22:00" },
    { day: "Pazar", open: "", close: "", closed: true },
  ],
  googleRating: "4.87",
  googleReviewCount: "30",
  locationShort: "Taşdelen, Çekmeköy / İstanbul",
  footerIntro:
    "İstanbul Çekmeköy Taşdelen'de profesyonel saç kesimi, sakal tasarımı ve kişisel erkek bakımı hizmetleri.",
  footerCopyright: "",
  navCtaLabel: "Randevu Al",
  appointmentInterval: 30,
  maxFutureBooking: 30,
};

const PublicSettingsContext = createContext<PublicSettings>(defaults);

export function PublicSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PublicSettings>(defaults);

  useEffect(() => {
    api.getPublicSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <PublicSettingsContext.Provider value={settings}>{children}</PublicSettingsContext.Provider>
  );
}

export function usePublicSettings() {
  return useContext(PublicSettingsContext);
}
