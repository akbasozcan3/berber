import type { MetadataRoute } from "next";
import { getPublicSettingsServer } from "@/lib/data/public-settings";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getPublicSettingsServer();
  const baseUrl = (
    settings.siteUrl ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "https://example.com"
  ).replace(/\/$/, "");

  const routes = ["", "/hakkimizda", "/hizmetler", "/galeri", "/yorumlar", "/randevu", "/iletisim"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
