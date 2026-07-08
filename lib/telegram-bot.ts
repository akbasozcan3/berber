import { sendTelegramMessage } from "@/lib/telegram";
import { getSetting, setSetting } from "@/lib/services/booking";
import { formatPhoneDisplay } from "@/lib/utils/format";

async function welcomeMessage(): Promise<string> {
  const phone = await getSetting("phone");
  const siteUrl = (await getSetting("site_url"))?.replace(/\/$/, "");
  const bookingUrl = siteUrl ? `${siteUrl}/randevu` : "/randevu";
  const phoneLine = phone ? `Telefon: ${formatPhoneDisplay(phone)}` : "";
  return `Merhaba!

New Life Erkek Kuaförü bildirim botuna hoş geldiniz.

Kaydınız tamamlandı — yeni randevu bildirimleri bu sohbete gelecek.

Randevu almak için: ${bookingUrl}
${phoneLine}

Sorularınız için doğrudan arayabilirsiniz.`.replace(/\n\n\n/g, "\n\n");
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number; type: string };
    text?: string;
    from?: { id: number; first_name?: string };
  };
}

interface GetUpdatesResponse {
  ok: boolean;
  description?: string;
  result?: TelegramUpdate[];
}

function shouldReplyToMessage(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (normalized === "/start" || normalized.startsWith("/start ")) return true;
  return ["selam", "merhaba", "hi", "hello", "hey"].includes(normalized);
}

export async function handleTelegramUpdate(update: TelegramUpdate): Promise<boolean> {
  const message = update.message;
  if (!message?.text || !message.chat?.id) return false;
  if (!shouldReplyToMessage(message.text)) return false;

  const chatId = String(message.chat.id);
  const firstName = message.from?.first_name?.trim();
  const welcome = await welcomeMessage();
  const greeting = firstName ? `Merhaba ${firstName}!` : welcome.split("\n\n")[0];
  const body = firstName
    ? `${greeting}\n\n${welcome.split("\n\n").slice(1).join("\n\n")}`
    : welcome;

  await sendTelegramMessage(chatId, body);
  return true;
}

export async function pollAndProcessTelegramUpdates(): Promise<{
  processed: number;
  total: number;
  errors: string[];
}> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    return { processed: 0, total: 0, errors: ["TELEGRAM_BOT_TOKEN yapılandırılmamış"] };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const savedOffset = Number((await getSetting("telegram_updates_offset")) || "0");
    const query = new URLSearchParams({
      timeout: "0",
      offset: String(savedOffset + 1),
    });
    const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?${query.toString()}`, { signal: controller.signal });
    const data = (await response.json()) as GetUpdatesResponse;

    if (!response.ok || !data.ok) {
      return {
        processed: 0,
        total: 0,
        errors: [data.description || "getUpdates başarısız"],
      };
    }

    const updates = data.result ?? [];
    const errors: string[] = [];
    let processed = 0;
    let maxUpdateId = 0;

    for (const update of updates) {
      maxUpdateId = Math.max(maxUpdateId, update.update_id);
      try {
        const handled = await handleTelegramUpdate(update);
        if (handled) processed += 1;
      } catch (err) {
        errors.push(err instanceof Error ? err.message : "Bilinmeyen hata");
      }
    }

    if (maxUpdateId > 0) await setSetting("telegram_updates_offset", String(maxUpdateId));

    return { processed, total: updates.length, errors };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bağlantı hatası";
    return { processed: 0, total: 0, errors: [message] };
  } finally {
    clearTimeout(timeout);
  }
}
