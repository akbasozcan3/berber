import { handleTelegramUpdate } from "@/lib/telegram-bot";
import type { TelegramUpdate } from "@/lib/telegram-bot";

export async function POST(request: Request) {
  try {
    const update = (await request.json()) as TelegramUpdate;
    await handleTelegramUpdate(update);
    return new Response("OK", { status: 200 });
  } catch {
    return new Response("OK", { status: 200 });
  }
}
