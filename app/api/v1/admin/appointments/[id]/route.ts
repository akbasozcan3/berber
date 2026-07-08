import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api/helpers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    await requireAuth();
    const { id } = await params;
    const body = await parseBody<{ status?: string }>(request);

    await db
      .update(appointments)
      .set({ status: body.status, updatedAt: new Date().toISOString() })
      .where(eq(appointments.id, Number(id)));

    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    await requireAuth();
    const { id } = await params;

    await db
      .update(appointments)
      .set({ status: "cancelled", updatedAt: new Date().toISOString() })
      .where(eq(appointments.id, Number(id)));

    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
