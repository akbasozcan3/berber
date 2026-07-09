import type { MetadataRoute } from "next";
import { getPublicSettingsServer } from "@/lib/data/public-settings";

export const dynamic = "force-dynamic";

function resolveBaseUrl(siteUrl: string): string {
  const trimmed = siteUrl.trim().replace(/\/$/, "");
  if (trimmed) return trimmed;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://www.thebarberyasin.com";
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getPublicSettingsServer();
  const baseUrl = resolveBaseUrl(settings.siteUrl);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
