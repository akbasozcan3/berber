import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  barbers, services, customers, reviews, galleryImages, settings,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { getSettings } from "@/lib/services/booking";

type Entity = "barbers" | "services" | "customers" | "reviews" | "gallery" | "settings";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    await ensureDb();
    await requireAuth();
    const { entity } = await params;

    switch (entity as Entity) {
      case "barbers":
        return jsonResponse(await db.select().from(barbers).orderBy(barbers.sortOrder));
      case "services":
        return jsonResponse(await db.select().from(services).orderBy(services.sortOrder));
      case "customers":
        return jsonResponse(await db.select().from(customers).orderBy(desc(customers.createdAt)));
      case "reviews":
        return jsonResponse(await db.select().from(reviews).orderBy(desc(reviews.createdAt)));
      case "gallery":
        return jsonResponse(await db.select().from(galleryImages).orderBy(galleryImages.sortOrder));
      case "settings":
        return jsonResponse(await getSettings());
      default:
        return errorResponse("Geçersiz entity", 404);
    }
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    await ensureDb();
    await requireAuth();
    const { entity } = await params;
    const body = await parseBody<Record<string, unknown>>(request);

    if (entity === "reviews" && body.id) {
      const id = Number(body.id);
      const updates: Record<string, unknown> = {};
      if (body.approved !== undefined) updates.approved = body.approved;
      if (body.featured !== undefined) updates.featured = body.featured;
      if (body.reply !== undefined) {
        updates.reply = body.reply;
        updates.replied = true;
      }
      await db.update(reviews).set(updates).where(eq(reviews.id, id));
      return jsonResponse({ success: true });
    }

    if (entity === "barbers" && body.id) {
      const id = Number(body.id);
      const { id: _, ...updates } = body;
      await db.update(barbers).set(updates as Partial<typeof barbers.$inferInsert>).where(eq(barbers.id, id));
      return jsonResponse({ success: true });
    }

    if (entity === "services" && body.id) {
      const id = Number(body.id);
      const { id: _, ...updates } = body;
      await db.update(services).set(updates as Partial<typeof services.$inferInsert>).where(eq(services.id, id));
      return jsonResponse({ success: true });
    }

    if (entity === "gallery" && body.id) {
      const id = Number(body.id);
      const { id: _, ...updates } = body;
      await db
        .update(galleryImages)
        .set(updates as Partial<typeof galleryImages.$inferInsert>)
        .where(eq(galleryImages.id, id));
      return jsonResponse({ success: true });
    }

    if (entity === "settings") {
      for (const [key, value] of Object.entries(body)) {
        const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
        if (existing[0]) {
          await db.update(settings).set({ value: String(value) }).where(eq(settings.key, key));
        } else {
          await db.insert(settings).values({ key, value: String(value) });
        }
      }
      return jsonResponse({ success: true });
    }

    return errorResponse("Geçersiz güncelleme", 400);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    await ensureDb();
    await requireAuth();
    const { entity } = await params;
    const body = await parseBody<Record<string, unknown>>(request);

    if (entity === "barbers") {
      const [created] = await db
        .insert(barbers)
        .values({
          name: String(body.name || ""),
          slug: String(body.slug || "").trim().toLowerCase(),
          position: String(body.position || "Berber"),
          avatar: body.avatar ? String(body.avatar) : null,
          specialty: body.specialty ? String(body.specialty) : null,
          workingDays: String(body.workingDays || "1,2,3,4,5,6"),
          workingStart: String(body.workingStart || "09:00"),
          workingEnd: String(body.workingEnd || "22:00"),
          onVacation: false,
          available: true,
          performance: Number(body.performance || 95),
          sortOrder: Number(body.sortOrder || 0),
          createdAt: new Date().toISOString(),
        })
        .returning();
      return jsonResponse(created, 201);
    }

    if (entity === "gallery") {
      const [created] = await db
        .insert(galleryImages)
        .values({
          url: String(body.url || ""),
          title: String(body.title || "Galeri Görseli"),
          sortOrder: Number(body.sortOrder || 0),
          createdAt: new Date().toISOString(),
        })
        .returning();
      return jsonResponse(created, 201);
    }

    return errorResponse("Geçersiz oluşturma isteği", 400);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Oluşturulamadı", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    await ensureDb();
    await requireAuth();
    const { entity } = await params;
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) return errorResponse("ID gerekli", 400);

    if (entity === "barbers") {
      await db.delete(barbers).where(eq(barbers.id, id));
      return jsonResponse({ success: true });
    }
    if (entity === "gallery") {
      await db.delete(galleryImages).where(eq(galleryImages.id, id));
      return jsonResponse({ success: true });
    }
    return errorResponse("Geçersiz silme isteği", 400);
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
