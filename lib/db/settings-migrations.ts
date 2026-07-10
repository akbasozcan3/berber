import { db } from "@/lib/db";
import { settings, barbers, appointments, customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isLegacyDefaultLunchBreak, serializeBreakTimes } from "@/lib/utils/break-times";
import { normalizeBarberWorkingDays } from "@/lib/utils/salon-schedule";
import { parseWorkingHoursJson, serializeWorkingHours } from "@/lib/data/working-hours";

let migrated = false;

const KEEP_APPOINTMENT_CUSTOMERS = new Set(["batuhan özkurt", "baltu ibo"]);

function normalizeCustomerName(name: string): string {
  return name.trim().toLocaleLowerCase("tr-TR");
}

async function pruneExtraAppointmentsOnce() {
  const flagRow = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "migration_prune_extra_appointments_v1"))
    .limit(1);
  if (flagRow[0]?.value === "done") return;

  const allCustomers = await db.select({ id: customers.id, name: customers.name }).from(customers);
  const keepCustomerIds = allCustomers
    .filter((customer) => KEEP_APPOINTMENT_CUSTOMERS.has(normalizeCustomerName(customer.name)))
    .map((customer) => customer.id);

  if (keepCustomerIds.length === 0) return;

  const allAppointments = await db
    .select({ id: appointments.id, customerId: appointments.customerId })
    .from(appointments);

  for (const appointment of allAppointments) {
    if (!keepCustomerIds.includes(appointment.customerId)) {
      await db.delete(appointments).where(eq(appointments.id, appointment.id));
    }
  }

  if (flagRow[0]) {
    await db
      .update(settings)
      .set({ value: "done" })
      .where(eq(settings.key, "migration_prune_extra_appointments_v1"));
  } else {
    await db.insert(settings).values({
      key: "migration_prune_extra_appointments_v1",
      value: "done",
    });
  }
}

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
  await pruneExtraAppointmentsOnce();
}
