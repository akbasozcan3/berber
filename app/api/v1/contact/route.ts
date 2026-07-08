import { z } from "zod";
import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { jsonResponse, errorResponse, parseBody } from "@/lib/api/helpers";
import { createNotification } from "@/lib/services/notifications";
import { sendTelegramContactNotification } from "@/lib/telegram";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    await ensureDb();
    const body = await parseBody<unknown>(request);
    const data = contactSchema.parse(body);

    await db.insert(contactMessages).values({
      ...data,
      read: false,
      createdAt: new Date().toISOString(),
    });

    void createNotification({
      type: "contact",
      title: "Yeni İletişim Mesajı",
      message: `${data.name}: ${data.message.slice(0, 80)}...`,
    }).catch((err) => {
      console.error("[Admin Contact Notification]", err);
    });

    void sendTelegramContactNotification({
      name: data.name,
      email: data.email,
      message: data.message,
    }).catch((err) => {
      console.error("[Telegram Contact Notification]", err);
    });

    return jsonResponse({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0]?.message || "Geçersiz veri.");
    }
    return errorResponse("Mesaj gönderilemedi.", 500);
  }
}
