import { db } from "@/lib/db";
import { settings, appointments, barbers, services, customers } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import {
  isMultilineSettingKey,
  normalizeMultilineSettingValue,
} from "@/lib/data/multiline-settings";
import {
  getActiveRulesForDate,
  getDayStatus,
  getEffectiveHours,
  isSlotBlockedByRules,
  parseTime,
} from "./availability";

export async function getSetting(key: string): Promise<string | null> {
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  if (existing.length === 0) {
    await db.insert(settings).values({ key, value });
  } else {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  }
}

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(settings);
  const result: Record<string, string> = {};

  for (const row of rows) {
    let value = row.value;
    if (isMultilineSettingKey(row.key)) {
      const fixed = normalizeMultilineSettingValue(value);
      if (fixed !== value) {
        await setSetting(row.key, fixed);
        value = fixed;
      }
    }
    result[row.key] = value;
  }

  return result;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function generateSlots(start: string, end: string, interval: number): string[] {
  const slots: string[] = [];
  let current = parseTime(start);
  const endMin = parseTime(end);
  while (current + interval <= endMin) {
    slots.push(formatTime(current));
    current += interval;
  }
  return slots;
}

function isInBreak(time: string, duration: number, breaks: { start: string; end: string }[]): boolean {
  const start = parseTime(time);
  const end = start + duration;
  return breaks.some((b) => {
    const bStart = parseTime(b.start);
    const bEnd = parseTime(b.end);
    return start < bEnd && end > bStart;
  });
}

export async function getAvailableSlots(
  date: string,
  serviceId: number,
  barberId?: number | null
): Promise<{ time: string; available: boolean; reason?: string }[]> {
  const interval = Number((await getSetting("appointment_interval")) || 30);
  const breakTimes = JSON.parse((await getSetting("break_times")) || "[]");
  const maxFuture = Number((await getSetting("max_future_booking")) || 30);

  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) return [];

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxFuture);
  if (selectedDate > maxDate) return [];

  const dayStatus = await getDayStatus(date);
  if (dayStatus === "closed" || dayStatus === "past" || dayStatus === "holiday") return [];

  const service = (await db.select().from(services).where(eq(services.id, serviceId)).limit(1))[0];
  if (!service) return [];

  const rules = await getActiveRulesForDate(date);

  let targetBarbers = await db.select().from(barbers).where(
    and(eq(barbers.available, true), eq(barbers.onVacation, false))
  );

  if (barberId) {
    targetBarbers = targetBarbers.filter((b) => b.id === barberId);
  }

  const dayOfWeek = selectedDate.getDay();
  targetBarbers = targetBarbers.filter((b) => {
    const days = b.workingDays.split(",").map(Number);
    return days.includes(dayOfWeek === 0 ? 7 : dayOfWeek);
  });

  if (targetBarbers.length === 0) return [];

  const hoursList = targetBarbers.map((b) => getEffectiveHours(date, b, rules.filter((r) => !r.barberId || r.barberId === b.id)));
  const earliestStart = hoursList.reduce((min, h) => Math.min(min, parseTime(h.open)), Infinity);
  const latestEnd = hoursList.reduce((max, h) => Math.max(max, parseTime(h.close)), 0);

  const allSlots = generateSlots(formatTime(earliestStart), formatTime(latestEnd), interval);

  const existingAppointments = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.date, date), ne(appointments.status, "cancelled")));

  return allSlots.map((time) => {
    if (isInBreak(time, service.duration, breakTimes)) {
      return { time, available: false, reason: "Mola saati" };
    }

    const slotStart = parseTime(time);
    const slotEnd = slotStart + service.duration;

    const blocked = isSlotBlockedByRules(slotStart, slotEnd, rules, barberId);
    if (blocked.blocked) {
      return { time, available: false, reason: blocked.reason || "Müsait değil" };
    }

    const hasConflict = existingAppointments.some((apt) => {
      if (barberId && apt.barberId !== barberId) return false;
      if (!barberId && apt.barberId) {
        const barber = targetBarbers.find((b) => b.id === apt.barberId);
        if (!barber) return false;
      }
      const aptStart = parseTime(apt.time);
      const aptEnd = aptStart + apt.duration;
      return slotStart < aptEnd && slotEnd > aptStart;
    });

    const anyBarberFree = barberId
      ? !hasConflict
      : targetBarbers.some((barber) => {
          const barberRules = rules.filter((r) => !r.barberId || r.barberId === barber.id);
          const hours = getEffectiveHours(date, barber, barberRules);
          const open = parseTime(hours.open);
          const close = parseTime(hours.close);
          if (slotStart < open || slotEnd > close) return false;

          const barberBlock = isSlotBlockedByRules(slotStart, slotEnd, barberRules, barber.id);
          if (barberBlock.blocked) return false;

          const barberApts = existingAppointments.filter((a) => a.barberId === barber.id);
          return !barberApts.some((apt) => {
            const aptStart = parseTime(apt.time);
            const aptEnd = aptStart + apt.duration;
            return slotStart < aptEnd && slotEnd > aptStart;
          });
        });

    const isPast =
      date === today.toISOString().split("T")[0] &&
      slotStart <= today.getHours() * 60 + today.getMinutes();

    return { time, available: anyBarberFree && !isPast, reason: anyBarberFree && !isPast ? undefined : "Dolu" };
  });
}

export async function createBooking(data: {
  customerName: string;
  phone: string;
  email?: string;
  serviceId: number;
  barberId?: number | null;
  date: string;
  time: string;
  notes?: string;
  agreed: boolean;
}) {
  if (!data.agreed) throw new Error("Sözleşme onayı gereklidir.");

  const service = (await db.select().from(services).where(eq(services.id, data.serviceId)).limit(1))[0];
  if (!service || !service.enabled) throw new Error("Hizmet bulunamadı.");

  const slots = await getAvailableSlots(data.date, data.serviceId, data.barberId);
  const slot = slots.find((s) => s.time === data.time);
  if (!slot?.available) throw new Error("Seçilen saat müsait değil.");

  let barberId = data.barberId;
  if (!barberId) {
    const availableBarbers = await db.select().from(barbers).where(
      and(eq(barbers.available, true), eq(barbers.onVacation, false))
    );
    const existingApts = await db.select().from(appointments).where(
      and(eq(appointments.date, data.date), ne(appointments.status, "cancelled"))
    );
    const slotStart = parseTime(data.time);
    const slotEnd = slotStart + service.duration;

    const freeBarber = availableBarbers.find((barber) => {
      const barberApts = existingApts.filter((a) => a.barberId === barber.id);
      return !barberApts.some((apt) => {
        const aptStart = parseTime(apt.time);
        const aptEnd = aptStart + apt.duration;
        return slotStart < aptEnd && slotEnd > aptStart;
      });
    });
    if (!freeBarber) throw new Error("Müsait berber bulunamadı.");
    barberId = freeBarber.id;
  }

  const existingCustomer = await db
    .select()
    .from(customers)
    .where(eq(customers.phone, data.phone))
    .limit(1);

  let customerId: number;
  const timestamp = new Date().toISOString();

  if (existingCustomer[0]) {
    customerId = existingCustomer[0].id;
    await db
      .update(customers)
      .set({
        name: data.customerName,
        email: data.email || existingCustomer[0].email,
        visitCount: existingCustomer[0].visitCount + 1,
      })
      .where(eq(customers.id, customerId));
  } else {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        name: data.customerName,
        phone: data.phone,
        email: data.email,
        visitCount: 1,
        totalSpent: 0,
        createdAt: timestamp,
      })
      .returning();
    customerId = newCustomer.id;
  }

  const conflict = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.barberId, barberId!),
        eq(appointments.date, data.date),
        eq(appointments.time, data.time),
        ne(appointments.status, "cancelled")
      )
    )
    .limit(1);

  if (conflict[0]) throw new Error("Bu saat az önce dolmuş. Lütfen başka saat seçin.");

  const [appointment] = await db
    .insert(appointments)
    .values({
      customerId,
      serviceId: data.serviceId,
      barberId,
      date: data.date,
      time: data.time,
      duration: service.duration,
      price: service.price,
      status: "pending",
      notes: data.notes,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning();

  const barber = (await db.select().from(barbers).where(eq(barbers.id, barberId!)).limit(1))[0];
  const customer = (await db.select().from(customers).where(eq(customers.id, customerId)).limit(1))[0];

  return { appointment, service, barber, customer };
}
