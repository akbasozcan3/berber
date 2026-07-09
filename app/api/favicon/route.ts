import sharp from "sharp";
import { getPublicSettingsServer } from "@/lib/data/public-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseSize(raw: string | null): number {
  const size = Number(raw || 32);
  if (!Number.isFinite(size)) return 32;
  return Math.min(512, Math.max(16, Math.round(size)));
}

export async function GET(request: Request) {
  const settings = await getPublicSettingsServer();
  const faviconUrl = settings.faviconUrl?.trim();

  if (!faviconUrl) {
    return new Response(null, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const size = parseSize(searchParams.get("size"));

  try {
    const upstream = await fetch(faviconUrl, { cache: "no-store" });
    if (!upstream.ok) {
      return new Response(null, { status: 502 });
    }

    const input = Buffer.from(await upstream.arrayBuffer());
    const output = await sharp(input)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

    return new Response(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
