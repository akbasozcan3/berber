import { getPublicSettingsServer } from "@/lib/data/public-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const settings = await getPublicSettingsServer();
  const faviconUrl = settings.faviconUrl?.trim();

  if (!faviconUrl) {
    return new Response(null, { status: 404 });
  }

  try {
    const upstream = await fetch(faviconUrl, { cache: "no-store" });
    if (!upstream.ok) {
      return new Response(null, { status: 502 });
    }

    const bytes = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("content-type") || "image/png";

    return new Response(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
