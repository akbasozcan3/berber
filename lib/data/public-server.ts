import { ensureDb } from "@/lib/db/ensure";
import { db } from "@/lib/db";
import { reviews, services, galleryImages, barbers } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { getPublicSettingsServer } from "@/lib/data/public-settings";

export async function getApprovedReviews(limit = 50) {
  try {
    await ensureDb();
    return db
      .select()
      .from(reviews)
      .where(eq(reviews.approved, true))
      .orderBy(desc(reviews.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
}

export async function getPopularServices(limit = 4) {
  try {
    await ensureDb();
    return db
      .select()
      .from(services)
      .where(eq(services.enabled, true))
      .orderBy(services.sortOrder)
      .limit(limit);
  } catch {
    return [];
  }
}

export async function getEnabledServices() {
  try {
    await ensureDb();
    return db
      .select()
      .from(services)
      .where(eq(services.enabled, true))
      .orderBy(services.sortOrder);
  } catch {
    return [];
  }
}

export async function getGalleryImages() {
  try {
    await ensureDb();
    return db.select().from(galleryImages).orderBy(galleryImages.sortOrder);
  } catch {
    return [];
  }
}

export async function getAvailableBarbers() {
  try {
    await ensureDb();
    return db
      .select()
      .from(barbers)
      .where(and(eq(barbers.available, true), eq(barbers.onVacation, false)))
      .orderBy(barbers.sortOrder);
  } catch {
    return [];
  }
}

export async function getPublicSettingsSnapshot() {
  return getPublicSettingsServer();
}
