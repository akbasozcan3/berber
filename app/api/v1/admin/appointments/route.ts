import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { appointments, customers, notifications, telegramLogs, services, barbers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { jsonResponse, errorResponse } from "@/lib/api/helpers";

export async function GET() {
  try {
    await ensureDb();
    await requireAuth();

    const apts = await db.select().from(appointments).orderBy(desc(appointments.createdAt));
    const allCustomers = await db.select().from(customers);
    const allServices = await db.select().from(services);
    const allBarbers = await db.select().from(barbers);

    const enriched = apts.map((apt) => {
      const customer = allCustomers.find((c) => c.id === apt.customerId);
      const service = allServices.find((s) => s.id === apt.serviceId);
      const barber = allBarbers.find((b) => b.id === apt.barberId);
      return {
        id: apt.id,
        customerId: apt.customerId,
        customerName: customer?.name || "",
        phone: customer?.phone || "",
        serviceId: apt.serviceId,
        serviceName: service?.name || "",
        barberId: apt.barberId,
        barberName: barber?.name || "",
        date: apt.date,
        time: apt.time,
        duration: apt.duration,
        price: apt.price,
        status: apt.status,
        notes: apt.notes,
        createdAt: apt.createdAt,
      };
    });

    return jsonResponse(enriched);
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function DELETE() {
  try {
    await ensureDb();
    await requireAuth();

    await db.delete(appointments);
    await db.delete(customers);
    await db.delete(notifications);
    await db.delete(telegramLogs);
    return jsonResponse({ success: true, cleared: true });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
