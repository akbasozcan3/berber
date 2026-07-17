import type { MetadataRoute } from "next";
import { getPublicSettingsServer } from "@/lib/data/public-settings";
import { resolvePublicSiteUrl } from "@/lib/utils/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getPublicSettingsServer();
  const baseUrl = resolvePublicSiteUrl(settings.siteUrl);

  // Her rota için öncelik ve güncelleme sıklığı — değiştirilmeden bırakılan
  // sayfalar için changeFrequency düşük tutuldu
  const routes: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }> = [
    { path: "",              priority: 1.0, changeFrequency: "weekly"  },
    { path: "/hizmetler",   priority: 0.9, changeFrequency: "weekly"  },
    { path: "/randevu",     priority: 0.9, changeFrequency: "monthly" },
    { path: "/iletisim",    priority: 0.8, changeFrequency: "monthly" },
    { path: "/hakkimizda",  priority: 0.8, changeFrequency: "monthly" },
    { path: "/yorumlar",    priority: 0.7, changeFrequency: "weekly"  },
    { path: "/galeri",      priority: 0.7, changeFrequency: "weekly"  },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
