import type { MetadataRoute } from "next";
import { getPublicSettingsServer } from "@/lib/data/public-settings";
import { resolvePublicSiteUrl } from "@/lib/utils/site-url";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getPublicSettingsServer();
  const baseUrl = resolvePublicSiteUrl(settings.siteUrl);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
