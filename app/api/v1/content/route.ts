import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { pageContent } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonResponse, errorResponse } from "@/lib/api/helpers";

export async function GET(request: Request) {
  await ensureDb();
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "about";
  const page = await db.select().from(pageContent).where(eq(pageContent.slug, slug)).limit(1);
  if (!page[0]) return errorResponse("Sayfa bulunamadı", 404);
  const p = page[0];
  return jsonResponse({
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle,
    heroImage: p.heroImage,
    content: p.content,
    sections: p.sections ? JSON.parse(p.sections) : [],
    meta: p.meta ? JSON.parse(p.meta) : null,
    updatedAt: p.updatedAt,
  });
}
