import { db } from "@/lib/db";
import { appointments, customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { digitsOnly, normalizePhoneStorage } from "@/lib/utils/format";

const ACTIVE_STATUSES = ["pending", "confirmed", "completed"] as const;

export async function syncCustomerStats(customerId: number): Promise<void> {
  const customerAppointments = await db
    .select()
    .from(appointments)
    .where(eq(appointments.customerId, customerId));

  const completed = customerAppointments.filter((apt) => apt.status === "completed");
  const visitCount = completed.length;
  const totalSpent = completed.reduce((sum, apt) => sum + apt.price, 0);
  const lastVisit =
    completed
      .map((apt) => apt.date)
      .sort((a, b) => b.localeCompare(a))[0] ?? null;

  await db
    .update(customers)
    .set({ visitCount, totalSpent, lastVisit })
    .where(eq(customers.id, customerId));
}

export async function cleanupOrphanCustomer(customerId: number): Promise<void> {
  const remaining = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(eq(appointments.customerId, customerId))
    .limit(1);

  if (!remaining[0]) {
    await db.delete(customers).where(eq(customers.id, customerId));
    return;
  }

  await syncCustomerStats(customerId);
}

export async function findOrUpsertCustomer(data: {
  customerName: string;
  phone: string;
  email: string;
}): Promise<number> {
  const email = data.email.trim().toLowerCase();
  const phoneStored = normalizePhoneStorage(data.phone);
  const phoneDigits = digitsOnly(phoneStored);
  const name = data.customerName.trim();

  const allCustomers = await db.select().from(customers);

  let matched = email
    ? allCustomers.find((customer) => customer.email?.trim().toLowerCase() === email)
    : undefined;

  if (!matched && phoneDigits) {
    matched = allCustomers.find((customer) => digitsOnly(customer.phone) === phoneDigits);
  }

  const timestamp = new Date().toISOString();

  if (matched) {
    await db
      .update(customers)
      .set({
        name,
        phone: phoneStored || matched.phone,
        email: email || matched.email,
      })
      .where(eq(customers.id, matched.id));
    return matched.id;
  }

  const [newCustomer] = await db
    .insert(customers)
    .values({
      name,
      phone: phoneStored || data.phone,
      email,
      visitCount: 0,
      totalSpent: 0,
      createdAt: timestamp,
    })
    .returning();

  return newCustomer.id;
}

export async function getAdminCustomers() {
  const allCustomers = await db.select().from(customers).orderBy(customers.createdAt);
  const allAppointments = await db.select().from(appointments);

  const enriched = allCustomers
    .map((customer) => {
      const customerAppointments = allAppointments.filter((apt) => apt.customerId === customer.id);
      const activeAppointments = customerAppointments.filter((apt) =>
        ACTIVE_STATUSES.includes(apt.status as (typeof ACTIVE_STATUSES)[number])
      );

      if (activeAppointments.length === 0) return null;

      const completed = customerAppointments.filter((apt) => apt.status === "completed");
      const pending = customerAppointments.filter((apt) => apt.status === "pending").length;
      const confirmed = customerAppointments.filter((apt) => apt.status === "confirmed").length;
      const lastVisit =
        completed
          .map((apt) => apt.date)
          .sort((a, b) => b.localeCompare(a))[0] ??
        activeAppointments
          .map((apt) => apt.date)
          .sort((a, b) => b.localeCompare(a))[0] ??
        null;

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        visitCount: completed.length,
        totalSpent: completed.reduce((sum, apt) => sum + apt.price, 0),
        lastVisit,
        favoriteBarberId: customer.favoriteBarberId,
        notes: customer.notes,
        pendingAppointments: pending,
        confirmedAppointments: confirmed,
        activeAppointments: pending + confirmed,
      };
    })
    .filter((customer): customer is NonNullable<typeof customer> => customer !== null)
    .sort((a, b) => {
      const aScore = a.activeAppointments > 0 ? 1 : 0;
      const bScore = b.activeAppointments > 0 ? 1 : 0;
      if (aScore !== bScore) return bScore - aScore;
      return (b.lastVisit || "").localeCompare(a.lastVisit || "");
    });

  return enriched;
}

export async function mergeDuplicateCustomersByEmail(): Promise<void> {
  const allCustomers = await db.select().from(customers);
  const groups = new Map<string, typeof allCustomers>();

  for (const customer of allCustomers) {
    const email = customer.email?.trim().toLowerCase();
    if (!email) continue;
    const group = groups.get(email) ?? [];
    group.push(customer);
    groups.set(email, group);
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue;

    const allAppointments = await db.select().from(appointments);
    const keeper = group.reduce((best, current) => {
      const bestCount = allAppointments.filter((apt) => apt.customerId === best.id).length;
      const currentCount = allAppointments.filter((apt) => apt.customerId === current.id).length;
      return currentCount > bestCount ? current : best;
    });

    for (const duplicate of group) {
      if (duplicate.id === keeper.id) continue;
      await db
        .update(appointments)
        .set({ customerId: keeper.id })
        .where(eq(appointments.customerId, duplicate.id));
      await db.delete(customers).where(eq(customers.id, duplicate.id));
    }

    await syncCustomerStats(keeper.id);
  }
}

export async function removeOrphanCustomers(): Promise<void> {
  const allCustomers = await db.select({ id: customers.id }).from(customers);
  for (const customer of allCustomers) {
    await cleanupOrphanCustomer(customer.id);
  }
}
