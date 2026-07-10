import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { appointments, customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { errorResponse, jsonResponse, parseBody } from "@/lib/api/helpers";
import { cancelAppointmentWithEmail } from "@/lib/services/appointment-confirm";
import { z } from "zod";

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

    const { email } = await cancelAppointmentWithEmail(payload.appointmentId);

    return jsonResponse({
      success: true,
      message: "Randevunuz iptal edildi.",
      email,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Geçersiz istek.");
    }
    return errorResponse("Randevu iptal edilemedi.", 500);
  }
}
