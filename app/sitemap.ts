import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://newlifeerkekkuaforu.com"; // Replace with production URL if needed

  const routes = [
    "",
    "/hakkimizda",
    "/hizmetler",
    "/galeri",
    "/yorumlar",
    "/randevu",
    "/iletisim",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
