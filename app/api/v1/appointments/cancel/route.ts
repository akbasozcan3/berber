import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { appointments, customers } from "@/lib/db/schema";
import { errorResponse, jsonResponse, parseBody } from "@/lib/api/helpers";

const cancelSchema = z.object({
  appointmentId: z.number().int().positive(),
  phone: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    await ensureDb();
    const payload = cancelSchema.parse(await parseBody<unknown>(request));

    const rows = await db
      .select({
        appointmentId: appointments.id,
        status: appointments.status,
        customerPhone: customers.phone,
      })
      .from(appointments)
      .innerJoin(customers, eq(customers.id, appointments.customerId))
      .where(eq(appointments.id, payload.appointmentId))
      .limit(1);

    const booking = rows[0];
    if (!booking) return errorResponse("Randevu bulunamadı.", 404);

    const normalize = (value: string) => value.replace(/\D/g, "");
    if (normalize(booking.customerPhone) !== normalize(payload.phone)) {
      return errorResponse("Telefon numarası eşleşmiyor.", 403);
    }

    if (booking.status === "cancelled") {
      return jsonResponse({ success: true, message: "Randevu zaten iptal edilmiş." });
    }

    await db
      .update(appointments)
      .set({ status: "cancelled", updatedAt: new Date().toISOString() })
      .where(
        and(eq(appointments.id, payload.appointmentId), eq(appointments.status, booking.status))
      );

    return jsonResponse({ success: true, message: "Randevunuz iptal edildi." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Geçersiz istek.");
    }
    return errorResponse("Randevu iptal edilemedi.", 500);
  }
}

