import type { GalleryImage } from "@/lib/api/client";

export function mapGalleryRow(
  g: {
    id: number;
    url: string;
    title: string;
    mediaType?: string | null;
    instagramUrl?: string | null;
    coverUrl?: string | null;
    isVideo?: boolean | null;
    sortOrder: number;
    createdAt: string;
  }
): GalleryImage {
  return {
    id: g.id,
    url: g.url,
    title: g.title,
    mediaType: g.mediaType === "instagram" ? "instagram" : "image",
    instagramUrl: g.instagramUrl ?? null,
    coverUrl: g.coverUrl ?? null,
    isVideo: Boolean(g.isVideo),
    sortOrder: g.sortOrder,
    createdAt: g.createdAt,
  };
}

export function getGalleryDisplayUrl(item: Pick<GalleryImage, "url" | "coverUrl">): string {
  return item.coverUrl?.trim() || item.url;
}

export function isInstagramGalleryItem(
  item: Pick<GalleryImage, "mediaType" | "instagramUrl">
): boolean {
  return item.mediaType === "instagram" && Boolean(item.instagramUrl?.trim());
}

export function getGalleryItemLink(item: GalleryImage): string | null {
  if (isInstagramGalleryItem(item)) return item.instagramUrl!.trim();
  return null;
}

export function normalizeInstagramPostUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("instagram.com") || trimmed.startsWith("www.instagram.com")) {
    return `https://${trimmed.replace(/^www\./, "")}`;
  }
  return trimmed;
}

export function isValidInstagramPostUrl(url: string): boolean {
  const normalized = normalizeInstagramPostUrl(url);
  return /instagram\.com\/(p|reel|reels|tv)\//i.test(normalized);
}
