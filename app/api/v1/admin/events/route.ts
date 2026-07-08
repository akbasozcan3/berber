import { ensureDb } from "@/lib/db/ensure";
import { requireAuth } from "@/lib/auth";
import { addNotificationListener } from "@/lib/services/notifications";
import { errorResponse } from "@/lib/api/helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDb();
    await requireAuth();
  } catch {
    return errorResponse("Unauthorized", 401);
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      send(JSON.stringify({ type: "connected" }));

      const remove = addNotificationListener(send);

      const heartbeat = setInterval(() => {
        send(JSON.stringify({ type: "heartbeat" }));
      }, 30000);

      const cleanup = () => {
        remove();
        clearInterval(heartbeat);
      };

      // @ts-expect-error - cancel exists on controller
      controller.cancel = cleanup;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
