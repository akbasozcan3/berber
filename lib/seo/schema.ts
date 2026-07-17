/**
 * lib/seo/schema.ts
 *
 * Schema.org JSON-LD üreticileri.
 * Tüm veriler admin panelinden gelen `PublicSettings`'ten okunur.
 * Hiçbir değer hardcode edilmemiştir.
 */

import type { PublicSettings } from "@/lib/api/client";
import { resolvePublicSiteUrl } from "@/lib/utils/site-url";

/** Schema.org günleri (Türkçe → ISO dayOfWeek) */
const DAY_MAP: Record<string, string> = {
  Pazartesi: "https://schema.org/Monday",
  Salı: "https://schema.org/Tuesday",
  Çarşamba: "https://schema.org/Wednesday",
  Perşembe: "https://schema.org/Thursday",
  Cuma: "https://schema.org/Friday",
  Cumartesi: "https://schema.org/Saturday",
  Pazar: "https://schema.org/Sunday",
};

/**
 * Admin'den gelen çalışma saatlerini Schema.org
 * `openingHoursSpecification` formatına dönüştürür.
 */
function buildOpeningHours(workingHours: PublicSettings["workingHours"]) {
  return workingHours
    .filter((row) => !row.closed && row.open && row.close)
    .map((row) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_MAP[row.day] ?? row.day,
      opens: row.open,
      closes: row.close,
    }));
}

/**
 * BarberShop + LocalBusiness JSON-LD şeması.
 * Tüm değerler admin paneli ayarlarından (`settings`) okunur.
 */
export function buildBarberShopSchema(settings: PublicSettings): object {
  const siteUrl = resolvePublicSiteUrl(settings.siteUrl);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["BarberShop", "LocalBusiness"],
    name: settings.businessName,
    url: siteUrl,
    description: settings.seoDefaultDescription,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressCountry: "TR",
    },
    telephone: settings.phone,
    openingHoursSpecification: buildOpeningHours(settings.workingHours),
    priceRange: "₺₺",
    servesCuisine: undefined, // BarberShop için geçerli değil — kaldırıldı
    hasMap: settings.googleMaps || undefined,
    sameAs: settings.instagram
      ? [`https://www.instagram.com/${settings.instagram.replace("@", "")}`]
      : undefined,
  };

  // Google Rating varsa aggregateRating ekle
  const rating = parseFloat(settings.googleRating || "");
  const reviewCount = parseInt(settings.googleReviewCount || "0", 10);
  if (!isNaN(rating) && reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Logo varsa ekle
  if (settings.logoUrl) {
    schema.image = settings.logoUrl;
    schema.logo = settings.logoUrl;
  }

  // E-posta varsa ekle
  if (settings.contactEmail) {
    schema.email = settings.contactEmail;
  }

  // servesCuisine alanı anlamsız — kaldır
  delete schema.servesCuisine;

  return schema;
}

/**
 * Sayfa başlığını BreadcrumbList JSON-LD'ye dönüştürür.
 * Ana sayfa için null döner (breadcrumb gereksiz).
 */
export function buildBreadcrumbSchema(
  siteUrl: string,
  items: Array<{ name: string; path: string }>
): object | null {
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: siteUrl,
      },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.name,
        item: `${siteUrl}${item.path}`,
      })),
    ],
  };
}

/**
 * FAQPage JSON-LD şeması.
 * Admin'den gelen işetme adı, adres ve telefon bilgilerini kullanarak
 * sık sorulan sorular üretir. Google'da zengin sonuç (rich result)
 * olarak görünebilir.
 */
export function buildFaqSchema(settings: PublicSettings): object {
  const siteUrl = resolvePublicSiteUrl(settings.siteUrl);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${settings.businessName} nerede?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${settings.businessName}, ${settings.address} adresinde hizmet vermektedir.`,
        },
      },
      {
        "@type": "Question",
        name: `${settings.businessName} telefon numarası nedir?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Bize ${settings.phone} numaralı telefondan ulaşabilirsiniz.`,
        },
      },
      {
        "@type": "Question",
        name: `${settings.businessName} online randevu alınabilir mi?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Evet, ${siteUrl}/randevu adresinden 7/24 online randevu alabilirsiniz. Sıra beklemeden, dilediğiniz gün ve saate rezervasyon yapabilirsiniz.`,
        },
      },
      {
        "@type": "Question",
        name: `Çalışma saatleri nedir?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: settings.workingHours
            .filter((r) => !r.closed && r.open && r.close)
            .map((r) => `${r.day}: ${r.open} - ${r.close}`)
            .join(", "),
        },
      },
      {
        "@type": "Question",
        name: `${settings.locationShort} bölgesinde tanınmış bir berber var mı?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${settings.businessName}, ${settings.locationShort} bölgesinin en köklü erkek kuaförü olarak saç kesimi, sakal tasarımı ve cilt bakımı hizmetleri sunmaktadır.`,
        },
      },
    ],
  };
}
