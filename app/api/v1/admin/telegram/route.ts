import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import {
  sendTestConnection,
  getTelegramLogs,
  getTelegramStatus,
} from "@/lib/telegram";
import { pollAndProcessTelegramUpdates } from "@/lib/telegram-bot";
import { jsonResponse, errorResponse } from "@/lib/api/helpers";

export async function GET() {
  try {
    await ensureDb();
    await requireAuth();
    const [logs, status] = await Promise.all([getTelegramLogs(100), getTelegramStatus()]);
    return jsonResponse({ logs, status });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function POST() {
  try {
    await ensureDb();
    await requireAuth();

    const poll = await pollAndProcessTelegramUpdates();
    const result = await sendTestConnection();

    if (!result.success) {
      return errorResponse(result.error || "Bağlantı testi başarısız", 500);
    }

    const status = await getTelegramStatus();

    return jsonResponse({
      success: true,
      status,
      poll: {
        processed: poll.processed,
        total: poll.total,
        errors: poll.errors,
      },
    });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Bağlantı testi başarısız", 500);
  }
}

export async function PATCH() {
  try {
    await ensureDb();
    await requireAuth();
    const poll = await pollAndProcessTelegramUpdates();
    return jsonResponse({
      success: true,
      processed: poll.processed,
      total: poll.total,
      errors: poll.errors,
    });
  } catch (e) {
    return errorResponse(e instanceof Error ? e.message : "Mesajlar işlenemedi", 500);
  }
}
