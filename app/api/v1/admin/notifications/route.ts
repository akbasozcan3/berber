import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from "@/lib/services/notifications";
import { jsonResponse, errorResponse } from "@/lib/api/helpers";

export async function GET() {
  try {
    await ensureDb();
    await requireAuth();
    const [items, unread] = await Promise.all([getNotifications(), getUnreadCount()]);
    return jsonResponse({ items, unread });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureDb();
    await requireAuth();
    const { action, id } = await request.json();

    if (action === "read" && id) await markAsRead(id);
    else if (action === "read_all") await markAllAsRead();
    else if (action === "delete" && id) await deleteNotification(id);

    return jsonResponse({ success: true });
  } catch {
    return errorResponse("Unauthorized", 401);
  }
}
