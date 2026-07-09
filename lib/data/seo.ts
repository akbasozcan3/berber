import type { Metadata } from "next";
import type { PublicSettings } from "@/lib/api/client";
import { getPublicSettingsServer } from "@/lib/data/public-settings";

export function buildRootMetadata(settings: PublicSettings): Metadata {
  const titleDefault =
    settings.seoHomeTitle ||
    `${settings.businessName}${settings.locationShort ? ` — ${settings.locationShort}` : ""}`;

  const faviconUrl = settings.faviconUrl?.trim();

  return {
    title: {
      default: titleDefault,
      template: `%s | ${settings.businessName}`,
    },
    description: settings.seoDefaultDescription,
    keywords: settings.seoKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    icons: faviconUrl
      ? {
          icon: [{ url: "/api/favicon", type: "image/png" }],
          shortcut: "/api/favicon",
        }
      : undefined,
    openGraph: {
      siteName: settings.businessName,
      locale: "tr_TR",
      type: "website",
    },
    verification: {
      google: "Ehuuq0Zj5oMxkFthfZ1IGGSDMz341Tk-E8K14V7zi9I",
    },
  };
}

export function buildPageMetadata(
  settings: PublicSettings,
  title: string,
  description?: string
): Metadata {
  return {
    title,
    description: description || settings.seoDefaultDescription,
  };
}

export async function getSiteMetadata(): Promise<Metadata> {
  const settings = await getPublicSettingsServer();
  return buildRootMetadata(settings);
}

export async function getPageMetadata(title: string, description?: string): Promise<Metadata> {
  const settings = await getPublicSettingsServer();
  return buildPageMetadata(settings, title, description);
}
