/**
 * Clears all appointments and related booking data for a fresh start.
 * Run: npm run db:reset-appointments
 */
import { initDatabase } from "./index";
import { db } from "./index";
import { appointments, customers, notifications, telegramLogs } from "./schema";

async function main() {
  initDatabase();

  const before = await db.select().from(appointments);
  const count = before.length;

  await db.delete(appointments);
  await db.delete(customers);
  await db.delete(notifications);
  await db.delete(telegramLogs);

  console.log(`Randevular sıfırlandı: ${count} randevu silindi.`);
  console.log("Müşteri kayıtları, bildirimler ve Telegram logları temizlendi.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
