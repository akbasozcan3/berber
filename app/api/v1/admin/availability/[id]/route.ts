import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { availabilityBlocks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonResponse, errorResponse } from "@/lib/api/helpers";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    await requireAuth();
    const { id } = await params;
    await db.delete(availabilityBlocks).where(eq(availabilityBlocks.id, Number(id)));
    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
