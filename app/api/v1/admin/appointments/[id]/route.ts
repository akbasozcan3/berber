import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments, customers, services, barbers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { getSetting } from "@/lib/services/booking";
import { sendAppointmentConfirmedEmail } from "@/lib/services/email";
import { resolvePublicSiteUrl } from "@/lib/utils/site-url";

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

    const rows = await db
      .select({
        appointment: appointments,
        customer: customers,
        service: services,
        barber: barbers,
      })
      .from(appointments)
      .innerJoin(customers, eq(appointments.customerId, customers.id))
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(barbers, eq(appointments.barberId, barbers.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    const row = rows[0];
    if (!row) return errorResponse("Randevu bulunamadı", 404);

    const previousStatus = row.appointment.status;

    await db
      .update(appointments)
      .set({ status: body.status, updatedAt: new Date().toISOString() })
      .where(eq(appointments.id, appointmentId));

    let emailResult: { sent: boolean; skipped?: boolean; reason?: string; error?: string } | null =
      null;

    if (body.status === "confirmed" && previousStatus !== "confirmed") {
      const [businessName, address, phone, siteUrlSetting, logoUrl] = await Promise.all([
        getSetting("business_name"),
        getSetting("address"),
        getSetting("phone"),
        getSetting("site_url"),
        getSetting("logo_url"),
      ]);

      const siteUrl = resolvePublicSiteUrl(siteUrlSetting);

      emailResult = await sendAppointmentConfirmedEmail(row.customer.email || "", {
        customerName: row.customer.name,
        serviceName: row.service.name,
        barberName: row.barber?.name || "Atandı",
        date: row.appointment.date,
        time: row.appointment.time,
        duration: row.appointment.duration,
        price: row.appointment.price,
        businessName: businessName?.trim() || "The Barber",
        logoUrl: logoUrl || undefined,
        address: address || undefined,
        phone: phone || undefined,
        siteUrl,
      });
    }

    return jsonResponse({
      success: true,
      email: emailResult,
    });
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
