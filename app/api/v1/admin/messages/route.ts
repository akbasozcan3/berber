import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api/helpers";

export async function GET() {
  try {
    await ensureDb();
    await requireAuth();
    const data = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
    return jsonResponse(data);
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureDb();
    await requireAuth();
    const body = await parseBody<{ id: number; read?: boolean }>(request);

    if (!body.id) return errorResponse("ID gerekli", 400);

    const updates: Partial<typeof contactMessages.$inferInsert> = {};
    if (body.read !== undefined) updates.read = body.read;

    await db.update(contactMessages).set(updates).where(eq(contactMessages.id, body.id));
    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
