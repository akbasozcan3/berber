import { ensureDb } from "@/lib/db/ensure";
import { addNotificationListener } from "@/lib/services/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDb();

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
