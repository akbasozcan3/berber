import { db } from "@/lib/db";
import { settings, barbers, appointments, customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isLegacyDefaultLunchBreak, serializeBreakTimes } from "@/lib/utils/break-times";
import { normalizeBarberWorkingDays } from "@/lib/utils/salon-schedule";
import { parseWorkingHoursJson, serializeWorkingHours } from "@/lib/data/working-hours";
import { normalizeAppointmentInterval } from "@/lib/utils/appointment-interval";
import {
  mergeDuplicateCustomersByEmail,
  removeOrphanCustomers,
  syncCustomerStats,
} from "@/lib/services/customers";

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

  const hoursRow = await db.select().from(settings).where(eq(settings.key, "working_hours")).limit(1);
  if (hoursRow[0]?.value) {
    const normalized = serializeWorkingHours(parseWorkingHoursJson(hoursRow[0].value));
    if (normalized !== hoursRow[0].value) {
      await db.update(settings).set({ value: normalized }).where(eq(settings.key, "working_hours"));
    }
  }

  const hourlyFlag = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "migrated_hourly_slots_v1"))
    .limit(1);
  if (!hourlyFlag[0]) {
    const intervalRow = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "appointment_interval"))
      .limit(1);
    const current = intervalRow[0]?.value;
    if (!current || current === "30") {
      if (intervalRow[0]) {
        await db.update(settings).set({ value: "60" }).where(eq(settings.key, "appointment_interval"));
      } else {
        await db.insert(settings).values({ key: "appointment_interval", value: "60" });
      }
    } else if (intervalRow[0]) {
      const normalized = String(normalizeAppointmentInterval(current));
      if (normalized !== current) {
        await db.update(settings).set({ value: normalized }).where(eq(settings.key, "appointment_interval"));
      }
    }
    try {
      await db.insert(settings).values({ key: "migrated_hourly_slots_v1", value: "1" });
    } catch {
      // Concurrent first request already wrote the flag.
    }
  }

  const hourlyV2 = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "migrated_hourly_slots_v2"))
    .limit(1);
  if (!hourlyV2[0]) {
    const intervalRow = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "appointment_interval"))
      .limit(1);
    if (intervalRow[0]) {
      await db.update(settings).set({ value: "60" }).where(eq(settings.key, "appointment_interval"));
    } else {
      await db.insert(settings).values({ key: "appointment_interval", value: "60" });
    }
    try {
      await db.insert(settings).values({ key: "migrated_hourly_slots_v2", value: "1" });
    } catch {
      // Concurrent first request already wrote the flag.
    }
  }

  for (const [key, value] of [
    ["booking_hours_start", "10:00"],
    ["booking_hours_end", "21:00"],
  ] as const) {
    const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (!existing[0]) {
      await db.insert(settings).values({ key, value });
    }
  }

  const allBarbers = await db.select().from(barbers);
  for (const barber of allBarbers) {
    const normalized = normalizeBarberWorkingDays(barber.workingDays);
    if (normalized !== barber.workingDays) {
      await db.update(barbers).set({ workingDays: normalized }).where(eq(barbers.id, barber.id));
    }
  }

  const emailRow = await db.select().from(settings).where(eq(settings.key, "notifications_email")).limit(1);
  if (!emailRow[0] || emailRow[0].value === "false") {
    if (emailRow[0]) {
      await db.update(settings).set({ value: "true" }).where(eq(settings.key, "notifications_email"));
    } else {
      await db.insert(settings).values({ key: "notifications_email", value: "true" });
    }
  }

  await db.delete(appointments).where(eq(appointments.status, "cancelled"));
  await mergeDuplicateCustomersByEmail();
  await removeOrphanCustomers();

  const remainingCustomers = await db.select({ id: customers.id }).from(customers);
  for (const customer of remainingCustomers) {
    await syncCustomerStats(customer.id);
  }
}
