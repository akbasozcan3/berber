/**
 * lib/data/seo.ts
 *
 * Metadata builder'ları.
 * Tüm veriler admin panelinden gelen `PublicSettings`'ten okunur.
 * Mevcut buildRootMetadata / buildPageMetadata / getSiteMetadata / getPageMetadata
 * fonksiyonları aynen korunmuştur — yalnızca OpenGraph ve Canonical alanları
 * mevcut verilerden üretilerek eklendi.
 */

import type { Metadata } from "next";
import type { PublicSettings } from "@/lib/api/client";
import { getPublicSettingsServer } from "@/lib/data/public-settings";
import { resolvePublicSiteUrl } from "@/lib/utils/site-url";

// ─── Yardımcı ───────────────────────────────────────────────────────────────

/** Admin seoKeywords alanından dizi üretir */
function parseKeywords(raw: string): string[] {
  return raw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

// ─── Root Metadata (layout.tsx) ─────────────────────────────────────────────

export function buildRootMetadata(settings: PublicSettings): Metadata {
  const titleDefault =
    settings.seoHomeTitle ||
    `${settings.businessName}${settings.locationShort ? ` — ${settings.locationShort}` : ""}`;

  const faviconUrl = settings.faviconUrl?.trim();
  const siteUrl = resolvePublicSiteUrl(settings.siteUrl);

  return {
    title: {
      default: titleDefault,
      template: `%s | ${settings.businessName}`,
    },
    description: settings.seoDefaultDescription,
    keywords: parseKeywords(settings.seoKeywords),

    // Canonical — www yönlendirme tutarlılığı
    alternates: {
      canonical: siteUrl,
    },

    // Favicon (mevcut kod korundu, sadece undefined güvenliği eklendi)
    icons: faviconUrl
      ? {
          icon: [
            { url: "/favicon.ico", sizes: "32x32" },
            { url: "/api/favicon?size=32", type: "image/png", sizes: "32x32" },
            { url: "/api/favicon?size=192", type: "image/png", sizes: "192x192" },
          ],
          apple: [{ url: "/api/favicon?size=180", type: "image/png", sizes: "180x180" }],
          shortcut: "/favicon.ico",
        }
      : undefined,

    // OpenGraph — admin verilerinden üretilir
    openGraph: {
      siteName: settings.businessName,
      locale: "tr_TR",
      type: "website",
      url: siteUrl,
      title: titleDefault,
      description: settings.seoDefaultDescription,
      // Logo varsa OG görseli olarak kullan, yoksa alan dışı bırak
      ...(settings.logoUrl
        ? {
            images: [
              {
                url: settings.logoUrl,
                width: 1200,
                height: 630,
                alt: settings.businessName,
              },
            ],
          }
        : {}),
    },

    // Twitter / X Card
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description: settings.seoDefaultDescription,
      ...(settings.logoUrl ? { images: [settings.logoUrl] } : {}),
    },

    // Google Search Console doğrulaması (mevcut)
    verification: {
      google: "Ehuuq0Zj5oMxkFthfZ1IGGSDMz341Tk-E8K14V7zi9I",
    },
  };
}

// ─── Sayfa Metadatası ────────────────────────────────────────────────────────

export function buildPageMetadata(
  settings: PublicSettings,
  title: string,
  description?: string,
  path?: string
): Metadata {
  const siteUrl = resolvePublicSiteUrl(settings.siteUrl);
  const pageDesc = description || settings.seoDefaultDescription;
  const fullTitle = title;

  return {
    title: fullTitle,
    description: pageDesc,

    // Canonical — her sayfaya doğru URL
    ...(path
      ? {
          alternates: {
            canonical: `${siteUrl}${path}`,
          },
        }
      : {}),

    // OpenGraph — admin verilerinden üretilir
    openGraph: {
      siteName: settings.businessName,
      locale: "tr_TR",
      type: "website",
      title: `${fullTitle} | ${settings.businessName}`,
      description: pageDesc,
      ...(path ? { url: `${siteUrl}${path}` } : {}),
      ...(settings.logoUrl
        ? {
            images: [
              {
                url: settings.logoUrl,
                width: 1200,
                height: 630,
                alt: `${settings.businessName} — ${fullTitle}`,
              },
            ],
          }
        : {}),
    },

    // Twitter / X Card
    twitter: {
      card: "summary_large_image",
      title: `${fullTitle} | ${settings.businessName}`,
      description: pageDesc,
      ...(settings.logoUrl ? { images: [settings.logoUrl] } : {}),
    },
  };
}

// ─── Async Wrapper'lar (mevcut imzalar korundu) ──────────────────────────────

export async function getSiteMetadata(): Promise<Metadata> {
  const settings = await getPublicSettingsServer();
  return buildRootMetadata(settings);
}

export async function getPageMetadata(
  title: string,
  description?: string
): Promise<Metadata> {
  const settings = await getPublicSettingsServer();
  return buildPageMetadata(settings, title, description);
}
