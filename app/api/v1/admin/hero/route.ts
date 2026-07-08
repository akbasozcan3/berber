import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { heroSlides } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api/helpers";

export async function GET() {
  try {
    await ensureDb();
    await requireAuth();
    const slides = await db.select().from(heroSlides).orderBy(heroSlides.sortOrder);
    return jsonResponse(slides);
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function POST(request: Request) {
  try {
    await ensureDb();
    await requireAuth();
    const body = await parseBody<Record<string, unknown>>(request);
    const [slide] = await db.insert(heroSlides).values({
      title: String(body.title || ""),
      subtitle: String(body.subtitle || ""),
      description: String(body.description || ""),
      image: String(body.image || ""),
      badge: body.badge ? String(body.badge) : null,
      ctaText: String(body.ctaText || "Hemen Randevu Al"),
      ctaLink: String(body.ctaLink || "/randevu"),
      sortOrder: Number(body.sortOrder || 0),
      enabled: body.enabled !== false,
      createdAt: new Date().toISOString(),
    }).returning();
    return jsonResponse(slide, 201);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Oluşturulamadı", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureDb();
    await requireAuth();
    const body = await parseBody<Record<string, unknown>>(request);
    if (!body.id) return errorResponse("ID gerekli", 400);
    const { id, ...rest } = body;
    await db.update(heroSlides).set(rest as Partial<typeof heroSlides.$inferInsert>).where(eq(heroSlides.id, Number(id)));
    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDb();
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return errorResponse("ID gerekli", 400);
    await db.delete(heroSlides).where(eq(heroSlides.id, Number(id)));
    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
