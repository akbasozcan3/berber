import { z } from "zod";
import { ensureDb } from "@/lib/db/ensure";
import { createBooking } from "@/lib/services/booking";
import { sendTelegramNotification } from "@/lib/telegram";
import { createNotification } from "@/lib/services/notifications";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api/helpers";

const bookingSchema = z.object({
  customerName: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır."),
  phone: z.string().min(10, "Geçerli telefon numarası girin."),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin."),
  serviceId: z.number(),
  barberId: z.number().nullable().optional(),
  date: z.string(),
  time: z.string(),
  notes: z.string().optional(),
  agreed: z.boolean(),
});

export async function POST(request: Request) {
  try {
    await ensureDb();
    const body = await parseBody<unknown>(request);
    const data = bookingSchema.parse(body);

    const result = await createBooking({
      ...data,
      email: data.email,
      barberId: data.barberId ?? null,
    });

    const [notificationResult, telegramResult] = await Promise.allSettled([
      createNotification({
        type: "appointment",
        title: "Yeni Randevu",
        message: `${data.customerName} - ${result.service.name} (${data.date} ${data.time})`,
        meta: { appointmentId: result.appointment.id },
      }),
      sendTelegramNotification(
        {
          customerName: data.customerName,
          phone: data.phone,
          service: result.service.name,
          barber: result.barber?.name || "Atanmadı",
          date: data.date,
          time: data.time,
          notes: data.notes,
        },
        result.appointment.id
      ),
    ]);

    if (notificationResult.status === "rejected") {
      console.error("[Notification] Failed to create notification:", notificationResult.reason);
    }

    if (telegramResult.status === "rejected") {
      console.error("[Telegram] Failed to send notification:", telegramResult.reason);
    } else if (!telegramResult.value.success && !telegramResult.value.skipped) {
      console.error("[Telegram] Appointment notification failed:", telegramResult.value.error);
    }

    return jsonResponse(
      {
        success: true,
        appointment: {
          id: result.appointment.id,
          date: result.appointment.date,
          time: result.appointment.time,
          status: result.appointment.status,
          service: result.service.name,
          barber: result.barber?.name,
          price: result.appointment.price,
        },
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Geçersiz veri.");
    }
    const message = error instanceof Error ? error.message : "Randevu oluşturulamadı.";
    const clientErrors = [
      "Seçilen saat müsait değil.",
      "Müsait berber bulunamadı.",
      "Hizmet bulunamadı.",
      "Sözleşme onayı gereklidir.",
      "E-posta adresi gereklidir.",
    ];
    const status = clientErrors.includes(message) ? 409 : 500;
    return errorResponse(message, status);
  }
}
