import { z } from "zod";
import { ensureDb } from "@/lib/db/ensure";
import { createBooking } from "@/lib/services/booking";
import { sendTelegramNotification } from "@/lib/telegram";
import { createNotification } from "@/lib/services/notifications";
import { sendBookingReceivedEmail } from "@/lib/services/appointment-confirm";
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

    // Vercel serverless: await etmeden dönme — e-posta/Telegram kesilir.
    const [notificationResult, telegramResult, emailResult] = await Promise.allSettled([
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
      sendBookingReceivedEmail({
        customerEmail: data.email,
        customerName: data.customerName,
        serviceName: result.service.name,
        barberName: result.barber?.name || "Atandı",
        date: data.date,
        time: data.time,
        duration: result.appointment.duration,
        price: result.appointment.price,
      }),
    ]);

    if (notificationResult.status === "rejected") {
      console.error("[Notification] Failed to create notification:", notificationResult.reason);
    }

    if (telegramResult.status === "rejected") {
      console.error("[Telegram] Failed to send notification:", telegramResult.reason);
    } else if (!telegramResult.value.success && !telegramResult.value.skipped) {
      console.error("[Telegram] Appointment notification failed:", telegramResult.value.error);
    }

    let emailPayload: { sent: boolean; skipped?: boolean; reason?: string; error?: string } | null =
      null;
    if (emailResult.status === "fulfilled") {
      emailPayload = emailResult.value;
      if (!emailResult.value.sent) {
        console.error("[Email] Booking received mail failed:", emailResult.value);
      }
    } else {
      console.error("[Email] Booking received mail rejected:", emailResult.reason);
      emailPayload = { sent: false, error: "E-posta gönderilemedi" };
    }

    return jsonResponse(
      {
        success: true,
        email: emailPayload,
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
