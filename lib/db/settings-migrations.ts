import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isLegacyDefaultLunchBreak, serializeBreakTimes } from "@/lib/utils/break-times";

let migrated = false;

/** One-time fixes for settings that block booking unintentionally. */
export async function runSettingsMigrations() {
  if (migrated) return;
  migrated = true;

  const row = await db.select().from(settings).where(eq(settings.key, "break_times")).limit(1);
  const value = row[0]?.value;
  if (isLegacyDefaultLunchBreak(value)) {
    await db.update(settings).set({ value: serializeBreakTimes([]) }).where(eq(settings.key, "break_times"));
  }

  const telegramRow = await db.select().from(settings).where(eq(settings.key, "notifications_telegram")).limit(1);
  if (!telegramRow[0] || telegramRow[0].value === "false") {
    if (telegramRow[0]) {
      await db.update(settings).set({ value: "true" }).where(eq(settings.key, "notifications_telegram"));
    } else {
      await db.insert(settings).values({ key: "notifications_telegram", value: "true" });
    }
  }
}
