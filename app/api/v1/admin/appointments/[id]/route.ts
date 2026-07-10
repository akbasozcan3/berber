import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import {
  confirmAppointmentWithEmail,
  fetchAppointmentRow,
} from "@/lib/services/appointment-confirm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    await requireAuth();
    const { id } = await params;
    const appointmentId = Number(id);
    if (!appointmentId) return errorResponse("Geçersiz randevu ID", 400);

    const body = await parseBody<{ status?: string }>(request);
    if (!body.status) return errorResponse("Durum gerekli", 400);

    const row = await fetchAppointmentRow(appointmentId);
    if (!row) return errorResponse("Randevu bulunamadı", 404);

    if (body.status === "cancelled") {
      await db.delete(appointments).where(eq(appointments.id, appointmentId));
      return jsonResponse({ success: true, deleted: true });
    }

    if (body.status === "confirmed") {
      const { email } = await confirmAppointmentWithEmail(appointmentId);
      return jsonResponse({ success: true, email });
    }

    await db
      .update(appointments)
      .set({ status: body.status, updatedAt: new Date().toISOString() })
      .where(eq(appointments.id, appointmentId));

    return jsonResponse({ success: true, email: null });
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
    const appointmentId = Number(id);
    if (!appointmentId) return errorResponse("Geçersiz randevu ID", 400);

    const existing = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!existing[0]) return errorResponse("Randevu bulunamadı", 404);

    await db.delete(appointments).where(eq(appointments.id, appointmentId));

    return jsonResponse({ success: true, deleted: true });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
