import type { MetadataRoute } from "next";
import { getPublicSettingsServer } from "@/lib/data/public-settings";
import { resolvePublicSiteUrl } from "@/lib/utils/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getPublicSettingsServer();
  const baseUrl = resolvePublicSiteUrl(settings.siteUrl);

  const routes = ["", "/hakkimizda", "/hizmetler", "/galeri", "/yorumlar", "/randevu", "/iletisim"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
